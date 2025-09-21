import React from "react";
import styles from "../Keyboard.module.css";
import { cn } from "@/utils";
import type { WhiteKeyProps } from "../types";
import { useIsSynthDisabled } from "@/store/selectors";
import { usePowerRequiredToast } from "@/hooks/usePowerRequiredToast";

export function WhiteKey({
  isActive,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  note,
}: WhiteKeyProps) {
  const isDisabled = useIsSynthDisabled();
  const { showPowerRequiredToast } = usePowerRequiredToast();

  const handleClick = () => {
    showPowerRequiredToast();
  };

  return (
    <button
      data-testid={`key-${note}`}
      className={cn(
        styles.whiteKey,
        isActive && styles.whiteKeyActive,
        isDisabled && styles.disabled
      )}
      aria-pressed={isActive}
      aria-label="Piano key"
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}

export default React.memo(WhiteKey);
