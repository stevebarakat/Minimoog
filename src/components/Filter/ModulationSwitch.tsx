import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";

function ModulationSwitch() {
  const { filterModulationOn, isDisabled } = useSynthStore((state) => state);
  const setFilterModulationOn = useSynthStore(
    (state) => state.setFilterModulationOn
  );

  return (
    <div>
      <RockerSwitch
        theme="orange"
        checked={filterModulationOn}
        onCheckedChange={setFilterModulationOn}
        label="Filter Modulation"
        topLabel="Filter Modulation"
        bottomLabelRight="On"
        disabled={isDisabled}
      />
    </div>
  );
}

export default ModulationSwitch;
