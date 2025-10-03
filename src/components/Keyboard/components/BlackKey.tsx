import React from "react";
import styles from "../Keyboard.module.css";
import { cn } from "@/utils";
import type { BlackKeyProps } from "../types";
import { useIsSynthDisabled } from "@/store/selectors";

export function BlackKey({
  isActive,
  position,
  width,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
}: BlackKeyProps) {
  const isDisabled = useIsSynthDisabled();

  return (
    <button
      className={cn(
        styles.blackKey,
        isActive && styles.blackKeyActive,
        isDisabled && styles.disabled
      )}
      style={{
        left: `${position}%`,
        width: `${width}%`,
      }}
      aria-pressed={isActive}
      aria-label="Piano key (sharp)"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}

export default React.memo(BlackKey);
