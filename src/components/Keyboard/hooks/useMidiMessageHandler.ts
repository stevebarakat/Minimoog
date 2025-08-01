import { useCallback } from "react";
import { MIDI } from "@/config/constants";

function midiNoteToNote(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${MIDI.NOTE_NAMES[noteIndex]}${octave}`;
}

function expScale(value: number): number {
  const normalized = value / 127;
  const scaled =
    normalized < 0.3
      ? normalized * (1 / 0.3) * 0.3
      : 0.3 + Math.pow((normalized - 0.3) / 0.7, 1.5) * 0.7;
  return Math.round(scaled * 100);
}

export function useMidiMessageHandler({
  synthObjRef,
  pressedKeysRef,
  setActiveKeysRef,
  activeKeysRef,
  pendingMod,
  pendingPitch,
}: {
  synthObjRef: {
    current: {
      triggerAttack: (note: string) => void;
      triggerRelease: () => void;
    } | null;
  };
  pressedKeysRef: { current: Set<string> };
  setActiveKeysRef: { current: (note: string | null) => void };
  activeKeysRef: { current: string | null };
  pendingMod: { current: number };
  pendingPitch: { current: number };
}) {
  return useCallback(
    (event: { data: Uint8Array }) => {
      const [status, data1, data2] = event.data;
      const messageType = status & 0xf0;
      let note: string;
      let rawValue: number;
      let newModValue: number;
      let newPitchValue: number;
      switch (messageType) {
        case MIDI.NOTE_ON: {
          note = midiNoteToNote(data1);
          if (data2 > 0) {
            const currentActiveKey = activeKeysRef.current;
            pressedKeysRef.current.add(note);
            if (currentActiveKey && currentActiveKey !== note) {
              setActiveKeysRef.current(note);
              activeKeysRef.current = note;
              synthObjRef.current?.triggerAttack(note);
            } else if (!currentActiveKey) {
              setActiveKeysRef.current(note);
              activeKeysRef.current = note;
              synthObjRef.current?.triggerAttack(note);
            }
          } else {
            pressedKeysRef.current.delete(note);
            const currentActiveKey = activeKeysRef.current;
            if (currentActiveKey === note) {
              const remainingKeys = Array.from(pressedKeysRef.current);
              if (remainingKeys.length > 0) {
                const nextKey = remainingKeys[remainingKeys.length - 1];
                setActiveKeysRef.current(nextKey);
                activeKeysRef.current = nextKey;
                synthObjRef.current?.triggerAttack(nextKey);
              } else {
                setActiveKeysRef.current(null);
                activeKeysRef.current = null;
                synthObjRef.current?.triggerRelease();
              }
            }
          }
          break;
        }
        case MIDI.NOTE_OFF: {
          note = midiNoteToNote(data1);
          pressedKeysRef.current.delete(note);
          const currentActiveKey = activeKeysRef.current;
          if (currentActiveKey === note) {
            const remainingKeys = Array.from(pressedKeysRef.current);
            if (remainingKeys.length > 0) {
              const nextKey = remainingKeys[remainingKeys.length - 1];
              setActiveKeysRef.current(nextKey);
              activeKeysRef.current = nextKey;
              synthObjRef.current?.triggerAttack(nextKey);
            } else {
              setActiveKeysRef.current(null);
              activeKeysRef.current = null;
              synthObjRef.current?.triggerRelease();
            }
          }
          break;
        }
        case MIDI.CONTROL_CHANGE: {
          switch (data1) {
            case MIDI.CC_MODULATION:
              newModValue = expScale(data2);
              pendingMod.current = newModValue;
              break;
            default:
          }
          break;
        }
        case MIDI.PITCH_BEND: {
          rawValue = data1 + (data2 << 7);
          newPitchValue = Math.round((rawValue / 16383) * 100);
          pendingPitch.current = newPitchValue;
          break;
        }
        default:
      }
    },
    [
      synthObjRef,
      pressedKeysRef,
      setActiveKeysRef,
      activeKeysRef,
      pendingMod,
      pendingPitch,
    ]
  );
}
