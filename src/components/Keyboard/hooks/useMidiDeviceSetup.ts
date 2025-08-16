import { useRef, useEffect, useState, useCallback } from "react";
import { log as logger } from "@/utils";

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
    midi?: {
      requestAccess(): Promise<MIDIAccess>;
      addEventListener(type: string, listener: EventListener): void;
      removeEventListener(type: string, listener: EventListener): void;
    };
  }
}

export function useMidiDeviceSetup(
  handleMidiMessage: (event: MIDIMessageEvent) => void
) {
  const setupInputs = useRef<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const setupMidi = useCallback(async () => {
    try {
      setIsRetrying(false);
      let midiAccess: MIDIAccess;

      // Try the newer Web MIDI API first
      if (navigator.midi) {
        try {
          midiAccess = await navigator.midi.requestAccess();
          setPermissionState("granted");
          setRetryCount(0); // Reset retry count on success
        } catch (permissionError) {
          if (
            permissionError instanceof Error &&
            permissionError.name === "NotAllowedError"
          ) {
            setPermissionState("denied");
            setError(
              "MIDI access was denied. You can reset this in Page Info (click the tune icon next to the URL) or refresh the page to try again."
            );
            return;
          }
          throw permissionError;
        }
      } else if (navigator.requestMIDIAccess) {
        // Fallback to the older API if newer one isn't available
        try {
          midiAccess = await navigator.requestMIDIAccess({ sysex: false });
          setPermissionState("granted");
          setRetryCount(0); // Reset retry count on success
        } catch (permissionError) {
          if (
            permissionError instanceof Error &&
            permissionError.name === "NotAllowedError"
          ) {
            setPermissionState("denied");
            setError(
              "MIDI access was denied. You can reset this in Page Info (click the tune icon next to the URL) or refresh the page to try again."
            );
            return;
          }
          throw permissionError;
        }
      } else {
        throw new Error("Web MIDI API not supported in this browser");
      }

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

      setError(null);
    } catch (error) {
      logger.error("MIDI access error:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        setPermissionState("denied");
        setError(
          "MIDI access was denied. You can reset this in Page Info (click the tune icon next to the URL) or refresh the page to try again."
        );
      } else {
        setError(
          "Failed to connect to MIDI devices. Please check your MIDI settings and try again."
        );
      }
    }
  }, [handleMidiMessage]);

  const retryMidiAccess = useCallback(() => {
    if (permissionState === "denied") {
      // If permissions are denied, we can't retry without a page refresh
      // Show user how to reset permissions
      setError(
        "MIDI permissions are blocked. To fix this:\n\n" +
          "1. Click the tune icon (🔒) next to the URL\n" +
          "2. Select 'Page Info' or 'Site Settings'\n" +
          "3. Find 'MIDI' in permissions\n" +
          "4. Reset to 'Ask' or 'Allow'\n" +
          "5. Refresh this page\n\n" +
          "Or simply refresh the page to try again."
      );
      return;
    }

    // For other errors, try to reconnect
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Clear any existing error
    setError(null);

    // Attempt to reconnect
    setupMidi();
  }, [setupMidi, permissionState]);

  const resetMidiState = useCallback(() => {
    // Reset all MIDI state and try again
    setError(null);
    setPermissionState("unknown");
    setRetryCount(0);
    setupInputs.current.clear();
    setupMidi();
  }, [setupMidi]);

  // Listen for page visibility changes to auto-retry when user returns from settings
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && permissionState === "denied") {
        // Page became visible again, user might have changed permissions
        logger.info(
          "Page became visible, checking if MIDI permissions were reset"
        );
        resetMidiState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [permissionState, resetMidiState]);

  useEffect(() => {
    setupMidi();
  }, [setupMidi]);

  return {
    error,
    permissionState,
    isRetrying,
    retryMidiAccess,
    resetMidiState,
    retryCount,
  };
}
