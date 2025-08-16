import { useCallback } from "react";
import { RockerSwitch } from "../RockerSwitch";
import VintageLED from "../VintageLED";
import Column from "../Column";

type PowerButtonProps = {
  isOn: boolean;
  onPowerOn: () => void;
  onPowerOff: () => void;
};

function PowerButton({ isOn, onPowerOn, onPowerOff }: PowerButtonProps) {
  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        onPowerOn();
      } else {
        onPowerOff();
      }
    },
    [onPowerOn, onPowerOff]
  );

  return (
    <Column
      gap="1.5rem"
      style={{ paddingTop: "5.5rem" }}
      data-onboarding="power"
    >
      <VintageLED
        size="medium"
        label="Power"
        ariaLabel="Power"
        isOn={isOn}
        onCheckedChange={() => handleCheckedChange(!isOn)}
      />
      <RockerSwitch
        orientation="vertical"
        checked={isOn}
        onCheckedChange={handleCheckedChange}
        label="Power Switch"
        theme="black"
        topLabel="On"
        testid="power-button"
      />
    </Column>
  );
}

export default PowerButton;
