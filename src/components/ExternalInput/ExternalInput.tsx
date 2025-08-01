import { useSynthStore } from "@/store/synthStore";
import { useMixerExternalState } from "@/store/selectors";
import Knob from "../Knob";
import OverloadIndicator from "../OverloadIndicator";
import { useExternalInput } from "./hooks";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Line from "../Line";
import { SYNTH_PARAMS } from "@/config";

type ExternalInputProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

export default function ExternalInput({
  audioContext,
  mixerNode,
}: ExternalInputProps) {
  const mixerExternal = useMixerExternalState();
  const { setMixerExternal, isDisabled } = useSynthStore();
  const { audioLevel, isOverloaded } = useExternalInput(
    audioContext,
    mixerNode
  );

  function updateExternalInput(checked: boolean) {
    setMixerExternal({ enabled: checked });
  }

  return (
    <Row>
      <RockerSwitch
        theme="blue"
        disabled={isDisabled}
        checked={mixerExternal.enabled}
        onCheckedChange={updateExternalInput}
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
          logarithmic={false}
          value={mixerExternal.volume}
          min={SYNTH_PARAMS.EXTERNAL_INPUT.VOLUME.MIN}
          max={SYNTH_PARAMS.EXTERNAL_INPUT.VOLUME.MAX}
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
            if (v !== mixerExternal.volume) {
              setMixerExternal({ volume: v });
            }
          }}
          style={{
            left: "1.25rem",
            bottom: "0.35rem",
          }}
          disabled={isDisabled}
        />
        <OverloadIndicator
          label="Overload"
          isEnabled={mixerExternal.enabled}
          volume={mixerExternal.volume}
          audioLevel={audioLevel}
          isOverloaded={isOverloaded}
          size="medium"
        />
      </Row>
    </Row>
  );
}
