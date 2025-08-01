import { useCallback, useEffect, useRef } from "react";

type UseRockerSwitchKeyboardProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function useRockerSwitchKeyboard({
  checked,
  onCheckedChange,
  disabled = false,
}: UseRockerSwitchKeyboardProps) {
  const switchRef = useRef<HTMLLabelElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      const dataFocused = switchRef.current?.getAttribute("data-focused");
      const isActive =
        document.activeElement === switchRef.current ||
        switchRef.current?.contains(document.activeElement) ||
        dataFocused === "true";

      // Only respond if this switch is active
      if (!isActive) return;

      // Only handle spacebar
      if (e.key !== " ") return;

      // Prevent default spacebar behavior (page scrolling)
      e.preventDefault();

      // Don't toggle if disabled
      if (disabled) return;

      // Toggle the switch
      onCheckedChange(!checked);
    },
    [checked, onCheckedChange, disabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { switchRef };
}
