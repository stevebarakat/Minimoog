import { useEffect, useRef } from "react";

type MIDIMessageEvent = { data: Uint8Array };
type MIDIPort = {
  type: "input" | "output";
  state: "connected" | "disconnected";
  id: string;
  name: string;
};
type MIDIInput = MIDIPort & {
  type: "input";
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
};
type MIDIAccess = {
  inputs: Map<string, MIDIInput>;
  onstatechange: ((event: { port: MIDIPort }) => void) | null;
};

declare global {
  interface Navigator {
    requestMIDIAccess(options?: { sysex?: boolean }): Promise<MIDIAccess>;
  }
}

export function useMidiDeviceSetup(
  handleMidiMessage: (event: MIDIMessageEvent) => void
) {
  const setupInputs = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function setupMidi() {
      try {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
        midiAccess.inputs.forEach((input) => {
          if (!setupInputs.current.has(input.id)) {
            input.onmidimessage = handleMidiMessage;
            setupInputs.current.add(input.id);
          }
        });
        midiAccess.onstatechange = (event) => {
          const port = event.port;
          if (port && port.type === "input" && port.state === "connected") {
            if (!setupInputs.current.has(port.id)) {
              (port as MIDIInput).onmidimessage = handleMidiMessage;
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
