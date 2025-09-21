import { usePresetsDropdown } from "./hooks/usePresetsDropdown";
import { CategoryFilter, PresetList } from "./components";
import { Dropdown } from "@/components/Dropdown";
import { SlidersHorizontal } from "lucide-react";
import "@/styles/dropdown-shared.css";

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
    <div className="dropdown-container" data-onboarding="presets">
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        ariaLabel="Select a preset"
        ariaExpanded={isOpen}
        ariaHasPopup="listbox"
        className="dropdown-wrapper"
      >
        <Dropdown.Trigger
          disabled={disabled}
          segmented={true}
          icon={<SlidersHorizontal />}
        >
          Presets
        </Dropdown.Trigger>
        <Dropdown.Content>
          <CategoryFilter
            selectedCategory={selectedCategory}
            categories={categories}
            onChange={setSelectedCategory}
          />
          <Dropdown.Listbox
            aria-label="Available presets"
            options={filteredPresets.map((preset) => ({ id: preset.name }))}
            optionCount={filteredPresets.length}
          >
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
