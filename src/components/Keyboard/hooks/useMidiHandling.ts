import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { useMidiDeviceSetup } from "./useMidiDeviceSetup";
import { useMidiMessageHandler } from "./useMidiMessageHandler";
import { useMidiAnimationFrame } from "./useMidiAnimationFrame";
import type { SimpleSynthObject } from "@/types";

type MIDIValue = number;

export function useMidiHandling(
  synthObj: SimpleSynthObject | null,
  isMobile: boolean
) {
  const { setActiveKeys, setPitchWheel, setModWheel, activeKeys, glideOn } =
    useSynthStore();

  // Track pressed keys for legato mode
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const currentPitch = useRef<MIDIValue>(50);
  const currentMod = useRef<MIDIValue>(0);
  const pendingMod = useRef<MIDIValue | null>(null);
  const pendingPitch = useRef<MIDIValue | null>(null);
  const setActiveKeysRef = useRef(setActiveKeys);
  const setPitchWheelRef = useRef(setPitchWheel);
  const setModWheelRef = useRef(setModWheel);
  const synthObjRef = useRef(synthObj);
  const activeKeysRef = useRef(activeKeys);
  const glideOnRef = useRef(glideOn);

  // Update refs when store values change
  useEffect(() => {
    setActiveKeysRef.current = setActiveKeys;
    setPitchWheelRef.current = setPitchWheel;
    setModWheelRef.current = setModWheel;
    synthObjRef.current = synthObj;
    activeKeysRef.current = activeKeys;
    glideOnRef.current = glideOn;
  }, [
    setActiveKeys,
    setPitchWheel,
    setModWheel,
    synthObj,
    activeKeys,
    glideOn,
  ]);

  // Use extracted MIDI message handler
  const handleMidiMessage = useMidiMessageHandler({
    synthObjRef,
    pressedKeysRef,
    setActiveKeysRef,
    setPitchWheelRef,
    setModWheelRef,
    activeKeysRef,
    glideOnRef,
    pendingMod,
    pendingPitch,
    currentMod,
    currentPitch,
  });

  // Use extracted MIDI device setup (skip on mobile)
  const {
    error,
    permissionState,
    isRetrying,
    retryMidiAccess,
    resetMidiState,
    retryCount,
  } = useMidiDeviceSetup(handleMidiMessage, isMobile);

  // Use extracted animation frame loop
  useMidiAnimationFrame({
    pendingMod,
    pendingPitch,
    setModWheelRef,
    setPitchWheelRef,
    currentMod,
    currentPitch,
  });

  return {
    error,
    permissionState,
    isRetrying,
    retryMidiAccess,
    resetMidiState,
    retryCount,
  };
}
