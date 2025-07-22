import React from "react";
import styles from "../PresetsDropdown.module.css";
import { cn } from "@/utils";
import type { Preset } from "@/data/presets";

type PresetListProps = {
  presets: Preset[];
  currentPreset: string | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  onSelect: (preset: Preset) => void;
};

export function PresetList({
  presets,
  currentPreset,
  focusedIndex,
  setFocusedIndex,
  onSelect,
}: PresetListProps) {
  return (
    <div className={styles.presetList}>
      {presets.map((preset, index) => (
        <div
          key={preset.id}
          className={cn(
            styles.presetItem,
            currentPreset === preset.name && styles.selected,
            focusedIndex === index && styles.focused
          )}
          onMouseEnter={() => setFocusedIndex(index)}
          onTouchStart={() => setFocusedIndex(index)}
        >
          <button
            className={styles.presetButton}
            onClick={() => onSelect(preset)}
            role="option"
            aria-selected={currentPreset === preset.name}
          >
            <div className={styles.presetHeader}>
              <span className={styles.presetName}>{preset.name}</span>
              <span className={styles.presetCategory}>{preset.category}</span>
            </div>
            <p className={styles.presetDescription}>{preset.description}</p>
          </button>
        </div>
      ))}
    </div>
  );
}
