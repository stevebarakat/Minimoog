import { useSynthStore } from "@/store/synthStore";
import Knob from "../Knob";
import OverloadIndicator from "../OverloadIndicator";
import { useExternalInput } from "./hooks";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Line from "../Line";
import { UI, SYNTH_PARAMS } from "@/config";

type ExternalInputProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

function ExternalInput({ audioContext, mixerNode }: ExternalInputProps) {
  const mixerExternal = useSynthStore((state) => state.mixer.external);
  const setMixerExternal = useSynthStore((state) => state.setMixerExternal);
  const isDisabled = useSynthStore((state) => state.isDisabled);
  const { audioLevel } = useExternalInput(audioContext, mixerNode);

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
            left: UI.EXTERNAL_INPUT.POSITION.LEFT,
            bottom: UI.EXTERNAL_INPUT.POSITION.BOTTOM,
          }}
          disabled={isDisabled}
        />
        <OverloadIndicator
          label="Signal"
          isEnabled={mixerExternal.enabled}
          volume={mixerExternal.volume}
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
