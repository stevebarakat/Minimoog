import styles from "../PresetsDropdown.module.css";
import { cn } from "@/utils";
import type { Preset } from "@/data/presets";
import { Dropdown } from "@/components/Dropdown";

type PresetListProps = {
  presets: Preset[];
  currentPreset: string | null;
  onSelect: (preset: Preset) => void;
};

export function PresetList({
  presets,
  currentPreset,
  onSelect,
}: PresetListProps) {
  console.log(
    "PresetList rendering:",
    presets.map((p, i) => `${i}: ${p.name}`)
  );

  return (
    <div className={styles.presetList} data-preset-count={presets.length}>
      {presets.map((preset, index) => (
        <Dropdown.Item
          key={preset.id}
          role="option"
          aria-selected={currentPreset === preset.name}
          id={`preset-option-${preset.id}`}
          index={index}
        >
          <Dropdown.ItemButton
            onClick={() => onSelect(preset)}
            id={`preset-button-${preset.id}`}
            index={index}
            className={cn(
              styles.presetButton,
              currentPreset === preset.name && styles.selected
            )}
          >
            <div className={styles.presetHeader}>
              <span className={styles.presetName}>{preset.name}</span>
              <span className={styles.presetCategory}>{preset.category}</span>
            </div>
            <p className={styles.presetDescription}>{preset.description}</p>
          </Dropdown.ItemButton>
        </Dropdown.Item>
      ))}
    </div>
  );
}
