import React from "react";
import styles from "../Keyboard.module.css";
import { cn } from "@/utils/helpers";
import type { BlackKeyProps } from "../types";
import { useSynthStore } from "@/store/synthStore";

export function BlackKey({
  isActive,
  position,
  width,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
}: BlackKeyProps) {
  const isDisabled = useSynthStore((s) => s.isDisabled);
  return (
    <button
      type="button"
      className={cn(styles.blackKey, isActive && styles.blackKeyActive)}
      style={{
        left: `${position}%`,
        width: `${width}%`,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label="Piano key (sharp)"
      onPointerDown={isDisabled ? undefined : onPointerDown}
      onPointerUp={isDisabled ? undefined : onPointerUp}
      onPointerEnter={isDisabled ? undefined : onPointerEnter}
      onPointerLeave={isDisabled ? undefined : onPointerLeave}
    />
  );
}

export default React.memo(BlackKey);
