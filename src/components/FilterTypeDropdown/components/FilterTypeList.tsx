import { Dropdown } from "@/components/Dropdown";
import { SYNTH_CONFIG } from "@/config/constants";
import { cn } from "@/utils";
import { useSynthStore } from "@/store/synthStore";
import { getFilterTypeLabel } from "../constants";

function FilterTypeList({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const filterType = useSynthStore((state) => state.filterType);
  const setFilterType = useSynthStore((state) => state.setFilterType);

  const handleFilterTypeChange = (
    newType:
      | "huovilainen"
      | "stilson"
      | "improved"
      | "microtracker"
      | "simplified"
      | "oberheim"
      | "musicdsp"
      | "krajeski"
  ) => {
    setFilterType(newType);
    setIsOpen(false);
  };

  const getFilterTypeDescription = (type: string) => {
    switch (type) {
      case "huovilainen":
        return "Authentic Moog ladder filter with physical modeling";
      case "stilson":
        return "Compromise filter with better parameter decoupling";
      case "improved":
        return "D'Angelo & Valimaki's stable Moog filter model";
      case "microtracker":
        return "Magnus Jonsson's optimized Moog filter";
      case "simplified":
        return "DAFX book implementation, 5 tanh functions";
      case "oberheim":
        return "Will Pirkle's virtual analog one-pole approach";
      case "musicdsp":
        return "Classic MusicDSP community implementation";
      case "krajeski":
        return "Tim Stilson's MoogVCF with compromise poles";
      default:
        return "";
    }
  };

  return SYNTH_CONFIG.FILTER.TYPE.VALUES.map((type) => (
    <Dropdown.Item
      key={type}
      role="option"
      aria-selected={filterType === type}
      className="dropdown-option"
    >
      <Dropdown.ItemButton
        onClick={() => handleFilterTypeChange(type)}
        className={cn("dropdown-button", filterType === type && "selected")}
      >
        <div className="dropdown-content">
          <div className="dropdown-label-container">
            <span className="dropdown-label">{getFilterTypeLabel(type)}</span>
            {filterType === type && (
              <span className="active-label">Active</span>
            )}
          </div>
          <span className="dropdown-description">
            {getFilterTypeDescription(type)}
          </span>
        </div>
      </Dropdown.ItemButton>
    </Dropdown.Item>
  ));
}

export default FilterTypeList;
