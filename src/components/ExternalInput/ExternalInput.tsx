import { useSynthStore } from "@/store/synthStore";
import { useMixerExternalState, useIsSynthDisabled } from "@/store/selectors";
import { useExternalInput } from "./hooks";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";
import OverloadIndicator from "../OverloadIndicator";
import Column from "../Column";
import Row from "../Row";
import Line from "../Line";
import { createExternalInputVolumeRange } from "@/store/types/synth";

type ExternalInputProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

export default function ExternalInput({
  audioContext,
  mixerNode,
}: ExternalInputProps) {
  const mixerExternal = useMixerExternalState();
  const { setMixerExternal } = useSynthStore();
  const isDisabled = useIsSynthDisabled();
  const { audioLevel, isOverloaded } = useExternalInput(
    audioContext,
    mixerNode
  );

  return (
    <Column>
      <Row>
        <RockerSwitch
          theme="blue"
          checked={mixerExternal.enabled}
          onCheckedChange={(checked) => setMixerExternal({ enabled: checked })}
          label="External Input"
          bottomLabelRight="On"
          style={{
            position: "absolute",
            left: "-3.5rem",
            top: "1.2rem",
          }}
          disabled={isDisabled}
        />
        <Line side="right" />
        <Row>
          <Knob
            valueLabels={{
              0: "0",
              2: "2",
              4: "4",
              6: "6",
              8: "8",
              10: "10",
            }}
            value={
              Number.isFinite(mixerExternal.volume) ? mixerExternal.volume : 0
            }
            logarithmic={true}
            min={0}
            max={10}
            step={1}
            title={
              <span>
                External
                <br />
                Input Volume
              </span>
            }
            label="External Input Volume"
            onChange={(v) => {
              setMixerExternal({ volume: createExternalInputVolumeRange(v) });
            }}
            style={{
              bottom: "0.35rem",
              left: "1.25rem",
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
    </Column>
  );
}
