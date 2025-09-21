import { useEffect, useCallback, useRef } from "react";

export function useMidiAnimationFrame({
  pendingMod,
  pendingPitch,
  setModWheelRef,
  setPitchWheelRef,
  currentMod,
  currentPitch,
}: {
  pendingMod: React.RefObject<number | null>;
  pendingPitch: React.RefObject<number | null>;
  setModWheelRef: React.RefObject<(v: number) => void>;
  setPitchWheelRef: React.RefObject<(v: number) => void>;
  currentMod: React.RefObject<number>;
  currentPitch: React.RefObject<number>;
}) {
  const animationFrameId = useRef<number | undefined>(undefined);

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
  }, [
    pendingMod,
    pendingPitch,
    setModWheelRef,
    setPitchWheelRef,
    currentMod,
    currentPitch,
  ]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(processUpdates);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [processUpdates]);
}
