import { useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import Effect from "../Effect";
import type { EffectType } from "@/utils";
import { Dropdown } from "../Dropdown";
import { AudioLines } from "lucide-react";
import { cn } from "@/utils";
import "@/styles/dropdown-shared.css";
import {
  loadOpenEffects,
  saveOpenEffects,
  loadPanelPositions,
  savePanelPositions,
} from "@/utils";

type EffectsDropdownProps = {
  disabled: boolean;
};

export default function EffectsDropdown({ disabled }: EffectsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openEffects, setOpenEffects] = useState<Set<EffectType>>(new Set());
  const [panelPositions, setPanelPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const delayState = useSynthStore((state) => state.delay);
  const reverbState = useSynthStore((state) => state.reverb);

  const effects = [
    {
      id: "delay" as const,
      name: "Delay",
      description: "Echo and feedback effects",
      state: delayState,
    },
    {
      id: "reverb" as const,
      name: "Reverb",
      description: "Room ambience and space",
      state: reverbState,
    },
  ];

  // Load effects panel state from localStorage on component mount
  useEffect(() => {
    const savedOpenEffects = loadOpenEffects();
    const savedPanelPositions = loadPanelPositions();

    setOpenEffects(savedOpenEffects);
    setPanelPositions(savedPanelPositions);
  }, []);

  const hasActiveEffects = delayState.enabled || reverbState.enabled;
  const isActive = hasActiveEffects && !disabled;
  const isPulsating = isActive && openEffects.size === 0;

  function handleToggle(): void {
    setIsOpen(!isOpen);
  }

  function handleEffectSelect(effectType: EffectType): void {
    setOpenEffects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(effectType)) {
        newSet.delete(effectType);
      } else {
        newSet.add(effectType);
      }

      // Save to localStorage
      saveOpenEffects(newSet);
      return newSet;
    });
  }

  function handleCloseEffect(effectType: EffectType): void {
    setOpenEffects((prev) => {
      const newSet = new Set(prev);
      newSet.delete(effectType);

      // Save to localStorage
      saveOpenEffects(newSet);
      return newSet;
    });
  }

  function handlePanelPositionUpdate(
    effectType: EffectType,
    position: { x: number; y: number }
  ): void {
    setPanelPositions((prev) => {
      const newPositions = {
        ...prev,
        [effectType]: position,
      };

      // Save to localStorage
      savePanelPositions(newPositions);
      return newPositions;
    });
  }

  return (
    <div data-onboarding="effects" className="dropdown-container">
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={handleToggle}
        ariaLabel="Select effects"
        ariaExpanded={isOpen}
        ariaHasPopup="listbox"
        className="dropdown-wrapper"
      >
        <Dropdown.Trigger
          disabled={disabled}
          segmented={true}
          icon={<AudioLines />}
          isActive={isActive}
          isPulsating={isPulsating}
        >
          Effects
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Listbox
            aria-label="Available effects"
            options={[
              {
                id: "delay",
                name: "Delay",
                description: "Echo and feedback effects",
              },
              {
                id: "reverb",
                name: "Reverb",
                description: "Room ambience and space",
              },
            ]}
            optionCount={2}
          >
            <div className="dropdown-scrollable-list">
              {effects.map((effect) => (
                <Dropdown.Item
                  key={effect.id}
                  role="option"
                  aria-selected={openEffects.has(effect.id)}
                  className="dropdown-option"
                >
                  <Dropdown.ItemButton
                    onClick={() => handleEffectSelect(effect.id)}
                    className={cn(
                      "dropdown-button",
                      openEffects.has(effect.id) && "selected"
                    )}
                  >
                    <div className="dropdown-content">
                      <div className="dropdown-label-container">
                        <span className="dropdown-label">{effect.name}</span>
                        {effect.state.enabled && (
                          <span className="active-label">Active</span>
                        )}
                      </div>
                      <span className="dropdown-description">
                        {effect.description}
                      </span>
                    </div>
                  </Dropdown.ItemButton>
                </Dropdown.Item>
              ))}
            </div>
          </Dropdown.Listbox>
        </Dropdown.Content>
      </Dropdown.Root>

      <Effect
        openEffects={openEffects}
        panelPositions={panelPositions}
        onCloseEffect={handleCloseEffect}
        onPanelPositionUpdate={handlePanelPositionUpdate}
      />
    </div>
  );
}
