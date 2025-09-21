import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { Tooltip } from "@/components/Tooltip";
import { getTooltipContent } from "@/utils";

function ModulationSwitch() {
  const { filterModulationOn } = useSynthStore((state) => state);
  const setFilterModulationOn = useSynthStore(
    (state) => state.setFilterModulationOn
  );
  const isDisabled = useIsSynthDisabled();

  const handleToggle = (checked: boolean) => {
    setFilterModulationOn(checked);
  };

  return (
    <div>
      <Tooltip content={getTooltipContent("filter-modulation")}>
        <RockerSwitch
          theme="orange"
          checked={filterModulationOn}
          onCheckedChange={handleToggle}
          label="Filter Modulation"
          topLabel="Filter Modulation"
          bottomLabelRight="On"
          disabled={isDisabled}
        />
      </Tooltip>
    </div>
  );
}

export default ModulationSwitch;
