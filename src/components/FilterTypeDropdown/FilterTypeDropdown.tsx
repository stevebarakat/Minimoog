import { useState } from "react";
import { Dropdown } from "@/components/Dropdown";
import { SYNTH_CONFIG } from "@/config/constants";
import { FilterTypeList } from "./components";
import { ListFilter } from "lucide-react";
import "@/styles/dropdown-shared.css";

type FilterTypeDropdownProps = {
  disabled?: boolean;
};

export function FilterTypeDropdown({ disabled }: FilterTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-onboarding="filter-type" className="dropdown-container">
      <Dropdown.Root
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        ariaLabel="Select filter type"
        ariaExpanded={isOpen}
        ariaHasPopup="listbox"
        className="dropdown-wrapper"
      >
        <Dropdown.Trigger
          disabled={disabled}
          segmented={true}
          icon={<ListFilter />}
        >
          {/* {getFilterTypeLabel(filterType)} */}
          Filter
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Listbox
            aria-label="Available filter types"
            options={SYNTH_CONFIG.FILTER.TYPE.VALUES.map((type: string) => ({
              id: type,
            }))}
            optionCount={SYNTH_CONFIG.FILTER.TYPE.VALUES.length}
          >
            <div className="dropdown-scrollable-list">
              <FilterTypeList setIsOpen={setIsOpen} />
            </div>
          </Dropdown.Listbox>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}
