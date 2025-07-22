import { useEffect, useCallback, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";

// MIDI message types
const MIDI_NOTE_OFF = 0x80;
const MIDI_NOTE_ON = 0x90;
const MIDI_CONTROL_CHANGE = 0xb0;
const MIDI_PITCH_BEND = 0xe0;

// MIDI CC numbers
const CC_MODULATION = 1;
const CC_VOLUME = 7;
const CC_PAN = 10;

type MIDIValue = number;
type NoteName = string;

// Helper function for exponential scaling with linear start
function expScale(value: MIDIValue): MIDIValue {
  const normalized = value / 127;
  const scaled =
    normalized < 0.3
      ? normalized * (1 / 0.3) * 0.3
      : 0.3 + Math.pow((normalized - 0.3) / 0.7, 1.5) * 0.7;
  return Math.round(scaled * 100);
}

// Type definitions for Web MIDI API
type MIDIMessageEvent = {
  data: Uint8Array;
};

type MIDIPort = {
  type: "input" | "output";
  state: "connected" | "disconnected";
  id: string;
  name: string;
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
};

type MIDIInput = MIDIPort & {
  type: "input";
};

type MIDIAccess = {
  inputs: Map<string, MIDIInput>;
  onstatechange: ((event: { port: MIDIPort }) => void) | null;
};

declare global {
  interface Navigator {
    requestMIDIAccess(): Promise<MIDIAccess>;
  }
}

function midiNoteToNote(midiNote: MIDIValue): NoteName {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

type SynthObject = {
  triggerAttack: (note: string) => void;
  triggerRelease: () => void;
};

export function useMidiHandling(synthObj: SynthObject | null) {
  const { setActiveKeys, setPitchWheel, setModWheel, activeKeys } =
    useSynthStore();

  // Track pressed keys for legato mode
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const currentPitch = useRef<MIDIValue>(50);
  const currentMod = useRef<MIDIValue>(0);
  const pendingMod = useRef<MIDIValue | null>(null);
  const pendingPitch = useRef<MIDIValue | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const setActiveKeysRef = useRef(setActiveKeys);
  const setPitchWheelRef = useRef(setPitchWheel);
  const setModWheelRef = useRef(setModWheel);
  const synthObjRef = useRef(synthObj);
  const setupInputs = useRef<Set<string>>(new Set());
  const activeKeysRef = useRef(activeKeys);

  // Update refs when store values change
  useEffect(() => {
    setActiveKeysRef.current = setActiveKeys;
    setPitchWheelRef.current = setPitchWheel;
    setModWheelRef.current = setModWheel;
    synthObjRef.current = synthObj;
    activeKeysRef.current = activeKeys;
  }, [setActiveKeys, setPitchWheel, setModWheel, synthObj, activeKeys]);

  const processUpdates = useCallback(() => {
    if (pendingMod.current !== null) {
      setModWheelRef.current(pendingMod.current);
      currentMod.current = pendingMod.current;
      pendingMod.current = null;
    }

    if (pendingPitch.current !== null) {
      setPitchWheelRef.current(pendingPitch.current);
      currentPitch.current = pendingPitch.current;
      pendingPitch.current = null;
    }

    animationFrameId.current = requestAnimationFrame(processUpdates);
  }, []);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(processUpdates);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [processUpdates]);

  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    const [status, data1, data2] = event.data;
    const messageType = status & 0xf0;
    let note: NoteName;
    let rawValue: MIDIValue;
    let newModValue: MIDIValue;
    let newPitchValue: MIDIValue;

    switch (messageType) {
      case MIDI_NOTE_ON: {
        note = midiNoteToNote(data1);
        if (data2 > 0) {
          // For monophonic synth: legato mode
          const currentActiveKey = activeKeysRef.current;

          // Add to pressed keys
          pressedKeysRef.current.add(note);

          if (currentActiveKey && currentActiveKey !== note) {
            // Legato mode: change pitch of current note
            setActiveKeysRef.current(note);
            activeKeysRef.current = note; // Update ref immediately
            synthObjRef.current?.triggerAttack(note);
          } else if (!currentActiveKey) {
            // First key press: start a new note
            setActiveKeysRef.current(note);
            activeKeysRef.current = note; // Update ref immediately
            synthObjRef.current?.triggerAttack(note);
          }
        } else {
          // Note ON with velocity 0 is equivalent to Note OFF
          // Remove from pressed keys
          pressedKeysRef.current.delete(note);

          const currentActiveKey = activeKeysRef.current;

          if (currentActiveKey === note) {
            // Check if there are other pressed keys
            const remainingKeys = Array.from(pressedKeysRef.current);

            if (remainingKeys.length > 0) {
              // Switch to the most recently pressed remaining key
              const nextKey = remainingKeys[remainingKeys.length - 1];
              setActiveKeysRef.current(nextKey);
              activeKeysRef.current = nextKey; // Update ref immediately
              synthObjRef.current?.triggerAttack(nextKey);
            } else {
              // No more keys pressed, release the note
              setActiveKeysRef.current(null);
              activeKeysRef.current = null; // Update ref immediately
              synthObjRef.current?.triggerRelease();
            }
          }
        }
        break;
      }

      case MIDI_NOTE_OFF: {
        note = midiNoteToNote(data1);

        // Remove from pressed keys
        pressedKeysRef.current.delete(note);

        const currentActiveKey = activeKeysRef.current;

        if (currentActiveKey === note) {
          // Check if there are other pressed keys
          const remainingKeys = Array.from(pressedKeysRef.current);

          if (remainingKeys.length > 0) {
            // Switch to the most recently pressed remaining key
            const nextKey = remainingKeys[remainingKeys.length - 1];
            setActiveKeysRef.current(nextKey);
            activeKeysRef.current = nextKey; // Update ref immediately
            synthObjRef.current?.triggerAttack(nextKey);
          } else {
            // No more keys pressed, release the note
            setActiveKeysRef.current(null);
            activeKeysRef.current = null; // Update ref immediately
            synthObjRef.current?.triggerRelease();
          }
        }
        break;
      }

      case MIDI_CONTROL_CHANGE: {
        switch (data1) {
          case CC_MODULATION:
            newModValue = expScale(data2);
            pendingMod.current = newModValue;
            break;
          case CC_VOLUME:
            // Handle volume if needed
            break;
          case CC_PAN:
            // Handle pan if needed
            break;
          default:
        }
        break;
      }

      case MIDI_PITCH_BEND: {
        rawValue = data1 + (data2 << 7);
        newPitchValue = Math.round((rawValue / 16383) * 100);
        pendingPitch.current = newPitchValue;
        break;
      }

      default:
    }
  }, []);

  useEffect(() => {
    async function setupMidi() {
      try {
        const midiAccess = await navigator.requestMIDIAccess();

        midiAccess.inputs.forEach((input) => {
          // Only set up each input once
          if (!setupInputs.current.has(input.id)) {
            input.onmidimessage = handleMidiMessage;
            setupInputs.current.add(input.id);
          }
        });

        midiAccess.onstatechange = (event) => {
          const port = event.port;
          if (port && port.type === "input" && port.state === "connected") {
            // Only set up new inputs that haven't been set up before
            if (!setupInputs.current.has(port.id)) {
              port.onmidimessage = handleMidiMessage;
              setupInputs.current.add(port.id);
            }
          }
        };
      } catch (error) {
        console.error("MIDI access error:", error);
      }
    }

    setupMidi();
  }, [handleMidiMessage]);
}
