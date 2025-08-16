import { RockerSwitch } from "@/components/RockerSwitch";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";

function ModulationSwitch() {
  const { filterModulationOn } = useSynthStore((state) => state);
  const setFilterModulationOn = useSynthStore(
    (state) => state.setFilterModulationOn
  );
  const isDisabled = useIsSynthDisabled();

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
