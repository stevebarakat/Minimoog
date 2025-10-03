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
      className={cn(
        styles.whiteKey,
        isActive && styles.whiteKeyActive,
        isDisabled && styles.disabled
      )}
      aria-pressed={isActive}
      aria-label="Piano key"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}

export default React.memo(WhiteKey);
