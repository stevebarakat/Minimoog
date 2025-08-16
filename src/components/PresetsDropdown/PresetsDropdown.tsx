import styles from "./PresetsDropdown.module.css";
import { usePresetsDropdown } from "./hooks/usePresetsDropdown";
import { CategoryFilter, PresetList } from "./components";
import { Dropdown } from "@/components/Dropdown";

function PresetsDropdown({ disabled }: { disabled: boolean }) {
  const {
    isOpen,
    setIsOpen,
    selectedCategory,
    setSelectedCategory,
    currentPreset,
    handlePresetSelect,
    categories,
    filteredPresets,
  } = usePresetsDropdown();

  return (
    <div className={styles.container} data-onboarding="presets">
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        disabled={disabled}
        ariaLabel="Select a preset"
        ariaExpanded={isOpen}
        ariaHasPopup="listbox"
        className={styles.dropdown}
      >
        <Dropdown.Trigger>{currentPreset || "Presets"}</Dropdown.Trigger>
        <Dropdown.Content>
          <CategoryFilter
            selectedCategory={selectedCategory}
            categories={categories}
            onChange={setSelectedCategory}
          />
          <Dropdown.Listbox aria-label="Available presets">
            <PresetList
              presets={filteredPresets}
              currentPreset={currentPreset}
              onSelect={handlePresetSelect}
            />
          </Dropdown.Listbox>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}

export default PresetsDropdown;
