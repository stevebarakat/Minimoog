import { useCallback, useEffect } from "react";
import { RockerSwitch } from "../RockerSwitch";
import VintageLED from "../VintageLED";
import { useAudioContext } from "@/hooks/useAudioContext";
import Column from "../Column";

type PowerButtonProps = {
  isOn: boolean;
  onPowerOn: () => void;
  onPowerOff: () => void;
};

function PowerButton({ isOn, onPowerOn, onPowerOff }: PowerButtonProps) {
  const { isInitialized, initialize, dispose } = useAudioContext();

  useEffect(() => {
    if (isInitialized) {
      initialize();
    }

    return () => {
      if (isInitialized) {
        dispose();
      }
    };
  }, [isInitialized, initialize, dispose]);

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
        isOn={isOn}
        onCheckedChange={() => handleCheckedChange(!isOn)}
      />
      <RockerSwitch
        orientation="vertical"
        checked={isOn}
        onCheckedChange={handleCheckedChange}
        label="Power"
        theme="black"
        topLabel="On"
        testid="power-button"
      />
    </Column>
  );
}

export default PowerButton;
