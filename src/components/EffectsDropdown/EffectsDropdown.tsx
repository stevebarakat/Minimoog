import { useState, useRef, useEffect } from "react";
import { useIsSynthDisabled } from "@/store/selectors";
import Delay from "@/components/Delay";
import Reverb from "@/components/Reverb";
import styles from "./EffectsDropdown.module.css";

type EffectsDropdownProps = {
  className?: string;
  disabled?: boolean;
};

export default function EffectsDropdown({
  className,
  disabled,
}: EffectsDropdownProps) {
  const isSynthDisabled = useIsSynthDisabled();
  const isDisabled = disabled || isSynthDisabled;
  const [isOpen, setIsOpen] = useState(false);
  const [activeEffect, setActiveEffect] = useState<"delay" | "reverb" | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleEffectSelect = (effect: "delay" | "reverb") => {
    setActiveEffect(effect);
    setIsOpen(false);
  };

  const handleCloseEffect = () => {
    setActiveEffect(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      ref={dropdownRef}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
    >
      <button
        className={`${styles.trigger} ${isDisabled ? "disabled" : ""}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Effects"
        disabled={isDisabled}
      >
        <span className={styles.triggerText}>
          {activeEffect
            ? activeEffect.charAt(0).toUpperCase() + activeEffect.slice(1)
            : "Effects"}
        </span>
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={styles.effectItem}
            onClick={() => handleEffectSelect("delay")}
          >
            <span className={styles.effectName}>Delay</span>
            <span className={styles.effectDescription}>
              Echo and feedback effects
            </span>
          </button>

          <button
            className={styles.effectItem}
            onClick={() => handleEffectSelect("reverb")}
          >
            <span className={styles.effectName}>Reverb</span>
            <span className={styles.effectDescription}>
              Room ambience and space
            </span>
          </button>
        </div>
      )}

      {/* Render active effect panel */}
      {activeEffect === "delay" && <Delay onClose={handleCloseEffect} />}
      {activeEffect === "reverb" && <Reverb onClose={handleCloseEffect} />}
    </div>
  );
}
