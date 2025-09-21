import { Dropdown } from "@/components/Dropdown";
import { Preset } from "@/data/presets";
import { cn } from "@/utils";
import styles from "../PresetsDropdown.module.css";

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
  return (
    <div
      className={cn(styles.presetList, "dropdown-scrollable-list")}
      data-preset-count={presets.length}
    >
      {presets.map((preset) => (
        <Dropdown.Item
          key={preset.id}
          role="option"
          aria-selected={currentPreset === preset.name}
          className="dropdown-option"
        >
          <Dropdown.ItemButton
            onClick={() => onSelect(preset)}
            className={cn(
              styles.presetButton,
              "dropdown-button",
              currentPreset === preset.name && "selected"
            )}
          >
            <div className={styles.presetHeader}>
              <div className="dropdown-label-container">
                <span className={cn(styles.presetName, "dropdown-label")}>
                  {preset.name}
                </span>
                {currentPreset === preset.name && (
                  <span className="active-label">Active</span>
                )}
              </div>
              <span className={cn(styles.presetCategory, "dropdown-label")}>
                {preset.category}
              </span>
            </div>
            <p className={cn(styles.presetDescription, "dropdown-description")}>
              {preset.description}
            </p>
          </Dropdown.ItemButton>
        </Dropdown.Item>
      ))}
    </div>
  );
}
