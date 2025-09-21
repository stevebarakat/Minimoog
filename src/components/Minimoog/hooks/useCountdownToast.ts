import { useState } from "react";

/**
 * Hook to manage countdown toast state
 * @param initialSeconds - Number of seconds for the countdown
 * @param title - Toast title
 * @param baseDescription - Base description text (seconds will be inserted)
 * @param variant - Toast variant
 */
export function useCountdownToast(
  initialSeconds: number,
  title: string,
  baseDescription: string,
  variant: "error" | "info" | "success" = "success"
) {
  const [isVisible, setIsVisible] = useState(false);

  const startCountdown = () => {
    setIsVisible(true);
  };

  const stopCountdown = () => {
    setIsVisible(false);
  };

  const handleComplete = () => {
    setIsVisible(false);
  };

  return {
    startCountdown,
    stopCountdown,
    isVisible,
    title,
    description: baseDescription,
    variant,
    initialSeconds,
    onComplete: handleComplete,
    onOpenChange: setIsVisible,
  };
}
