import React from "react";
import styles from "../Keyboard.module.css";
import { cn } from "@/utils";
import type { WhiteKeyProps } from "../types";
import { useIsSynthDisabled } from "@/store/selectors";

export function WhiteKey({
  isActive,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  note,
}: WhiteKeyProps) {
  const isDisabled = useIsSynthDisabled();

  return (
    <button
      data-testid={`key-${note}`}
      type="button"
      className={cn(
        styles.whiteKey,
        isActive && styles.whiteKeyActive,
        isDisabled && "disabled"
      )}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label="Piano key"
      onPointerDown={isDisabled ? undefined : onPointerDown}
      onPointerUp={isDisabled ? undefined : onPointerUp}
      onPointerEnter={isDisabled ? undefined : onPointerEnter}
      onPointerLeave={isDisabled ? undefined : onPointerLeave}
    />
  );
}

export default React.memo(WhiteKey);
