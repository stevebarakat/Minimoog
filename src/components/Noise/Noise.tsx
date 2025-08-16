import { useSynthStore } from "@/store/synthStore";
import { useMixerNoiseState, useIsSynthDisabled } from "@/store/selectors";
import { useNoise } from "./hooks";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";
import Column from "../Column";
import Row from "../Row";
import Line from "../Line";
import { createNoiseVolumeRange } from "@/types/branded";

type NoiseProps = {
  audioContext: AudioContext | null;
  mixerNode: AudioNode | null;
};

export default function Noise({ audioContext, mixerNode }: NoiseProps) {
  const mixerNoise = useMixerNoiseState();
  const { setMixerNoise } = useSynthStore();
  const isDisabled = useIsSynthDisabled();
  useNoise(audioContext, mixerNode);

  return (
    <Column>
      <Row>
        <RockerSwitch
          theme="blue"
          checked={mixerNoise.enabled}
          onCheckedChange={(checked) => setMixerNoise({ enabled: checked })}
          label="Noise"
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
            value={Number.isFinite(mixerNoise.volume) ? mixerNoise.volume : 0}
            logarithmic={true}
            min={0}
            max={10}
            step={1}
            label="Noise Volume"
            onChange={(v) => {
              setMixerNoise({ volume: createNoiseVolumeRange(v) });
            }}
            style={{
              bottom: "0.35rem",
              left: "1.25rem",
            }}
            disabled={isDisabled}
          />

          <RockerSwitch
            orientation="vertical"
            theme="blue"
            checked={mixerNoise.noiseType === "white"}
            onCheckedChange={(checked) =>
              setMixerNoise({ noiseType: checked ? "white" : "pink" })
            }
            label="Noise Type"
            topLabel="White"
            bottomLabel="Pink"
            style={{
              left: "1.7rem",
              top: "-0.9rem",
              marginBottom: "0.25rem",
            }}
            disabled={isDisabled}
          />
        </Row>
      </Row>
    </Column>
  );
}
