import React from "react";
import styles from "../Keyboard.module.css";
import { cn } from "@/utils/helpers";
import type { WhiteKeyProps } from "../types";
import { useSynthStore } from "@/store/synthStore";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function WhiteKey({
  isActive,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  note,
}: WhiteKeyProps) {
  const isDisabled = useSynthStore((s) => s.isDisabled);
  const isMobile = useIsMobile();

  return (
    <button
      data-testid={`key-${note}`}
      type="button"
      className={cn(
        styles.whiteKey,
        isActive && styles.whiteKeyActive,
        isDisabled && "disabled"
      )}
      style={isMobile ? { height: "120px" } : {}}
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
