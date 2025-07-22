import { useSynthStore } from "@/store/synthStore";
import Knob from "../Knob";
import OverloadIndicator from "../OverloadIndicator";
import { useExternalInput } from "./hooks";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import { useEffect } from "react";
import Line from "../Line";

type ExternalInputProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

function ExternalInput({ audioContext, mixerNode }: ExternalInputProps) {
  const { mixer, setMixerExternal, isDisabled } = useSynthStore();
  const { audioLevel } = useExternalInput(audioContext, mixerNode);

  // Initialize volume to minimum value if it's 0
  useEffect(() => {
    if (mixer.external.volume === 0) {
      setMixerExternal({ volume: 0.001 });
    }
  }, [mixer.external.volume, setMixerExternal]);

  function ubu(checked: boolean) {
    setMixerExternal({ enabled: checked });
  }

  return (
    <Row>
      <RockerSwitch
        theme="blue"
        disabled={isDisabled}
        checked={mixer.external.enabled}
        onCheckedChange={ubu}
        label="External Input"
        bottomLabelRight="On"
        style={{
          position: "absolute",
          left: "-3.5rem",
        }}
      />
      <Line side="right" />
      <Row gap="var(--spacing-xl)">
        <Knob
          valueLabels={{
            0: "0",
            2: "2",
            4: "4",
            6: "6",
            8: "8",
            10: "10",
          }}
          logarithmic={true}
          value={mixer.external.volume}
          min={0.001}
          max={10}
          step={0.1}
          label="External Input Volume"
          title={
            <span>
              External
              <br />
              Input Volume
            </span>
          }
          onChange={(v) => {
            // Only update if the value is different
            if (v !== mixer.external.volume) {
              setMixerExternal({ volume: v });
            }
          }}
          style={{
            left: "1.25rem",
            bottom: "0.25rem",
          }}
          disabled={isDisabled}
        />
        <OverloadIndicator
          label="Signal"
          isEnabled={mixer.external.enabled}
          volume={mixer.external.volume}
          audioLevel={audioLevel}
          size="medium"
          style={{
            left: "1.5rem",
          }}
        />
      </Row>
    </Row>
  );
}

export default ExternalInput;
