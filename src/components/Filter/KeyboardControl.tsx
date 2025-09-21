import { RockerSwitch } from "../RockerSwitch";
import Column from "../Column";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

function KeyboardControl() {
  const isDisabled = useIsSynthDisabled();
  const { keyboardControl1, keyboardControl2 } = useSynthStore(
    (state) => state
  );
  const { setKeyboardControl1, setKeyboardControl2 } = useSynthStore(
    (state) => state
  );
  return (
    <Tooltip content={getTooltipContent("keyboard-control")}>
      <Column>
        <RockerSwitch
          theme="orange"
          checked={keyboardControl1}
          onCheckedChange={setKeyboardControl1}
          label="Keyboard Control 1"
          leftLabel="1"
          topLabelRight="On"
          bottomLabel="Keyboard Control"
          disabled={isDisabled}
        />
        <RockerSwitch
          theme="orange"
          checked={keyboardControl2}
          onCheckedChange={setKeyboardControl2}
          label="Keyboard Control 2"
          leftLabel="2"
          bottomLabelRight="On"
          disabled={isDisabled}
        />
      </Column>
    </Tooltip>
  );
}

export default KeyboardControl;
