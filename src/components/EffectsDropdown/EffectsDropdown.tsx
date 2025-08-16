import { useState } from "react";
import Dropdown from "@/components/Dropdown/Dropdown";
import Delay from "@/components/Delay";
import Reverb from "@/components/Reverb";
import styles from "./EffectsDropdown.module.css";

type EffectsDropdownProps = {
  className?: string;
};

export default function EffectsDropdown({ className }: EffectsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEffect, setActiveEffect] = useState<"delay" | "reverb" | null>(null);

  const handleEffectSelect = (effect: "delay" | "reverb") => {
    setActiveEffect(effect);
    setIsOpen(false);
  };

  const handleCloseEffect = () => {
    setActiveEffect(null);
  };

  return (
    <>
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        className={className}
      >
        <Dropdown.Trigger
          ariaLabel="Effects"
          ariaExpanded={isOpen}
          ariaHasPopup="menu"
        >
          <span className={styles.triggerText}>
            {activeEffect ? activeEffect.charAt(0).toUpperCase() + activeEffect.slice(1) : "Effects"}
          </span>
          <span className={styles.arrow}>▼</span>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <Dropdown.Item
            onClick={() => handleEffectSelect("delay")}
            className={styles.effectItem}
          >
            <span className={styles.effectName}>Delay</span>
            <span className={styles.effectDescription}>Echo and feedback effects</span>
          </Dropdown.Item>
          
          <Dropdown.Item
            onClick={() => handleEffectSelect("reverb")}
            className={styles.effectItem}
          >
            <span className={styles.effectName}>Reverb</span>
            <span className={styles.effectDescription}>Room ambience and space</span>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>

      {/* Render active effect panel */}
      {activeEffect === "delay" && <Delay onClose={handleCloseEffect} />}
      {activeEffect === "reverb" && <Reverb onClose={handleCloseEffect} />}
    </>
  );
}
