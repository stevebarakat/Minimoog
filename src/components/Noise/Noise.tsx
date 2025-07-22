import { useNoise } from "./hooks/useNoise";
import { useSynthStore } from "@/store/synthStore";
import { RockerSwitch } from "../RockerSwitch";
import Column from "../Column";
import Row from "../Row";
import Knob from "../Knob";
import Line from "../Line";

type NoiseProps = {
  audioContext: AudioContext;
  mixerNode: AudioNode;
};

function Noise({ audioContext, mixerNode }: NoiseProps) {
  const { mixer, setMixerNoise, isDisabled } = useSynthStore();
  useNoise(audioContext, mixerNode);

  return (
    <Column>
      <Row>
        <RockerSwitch
          theme="blue"
          checked={mixer.noise.enabled}
          onCheckedChange={(checked) => setMixerNoise({ enabled: checked })}
          label="Noise"
          bottomLabelRight="On"
          style={{
            position: "absolute",
            left: "-3.5rem",
          }}
          disabled={isDisabled}
        />
        <Line side="right" />
        <Row gap="var(--spacing-xs)">
          <Knob
            valueLabels={{
              0: "0",
              2: "2",
              4: "4",
              6: "6",
              8: "8",
              10: "10",
            }}
            value={Number.isFinite(mixer.noise.volume) ? mixer.noise.volume : 0}
            logarithmic={true}
            min={0}
            max={10}
            step={1}
            label="Noise Volume"
            onChange={(v) => {
              setMixerNoise({ volume: v });
            }}
            style={{
              bottom: "0.25rem",
              left: "1.25rem",
            }}
            disabled={isDisabled}
          />

          <RockerSwitch
            orientation="vertical"
            theme="blue"
            checked={mixer.noise.noiseType === "white"}
            onCheckedChange={(checked) =>
              setMixerNoise({ noiseType: checked ? "white" : "pink" })
            }
            label="Noise Type"
            topLabel="White"
            bottomLabel="Pink"
            style={{
              left: "1.25rem",
              marginBottom: "0.25rem",
            }}
            disabled={isDisabled}
          />
        </Row>
      </Row>
    </Column>
  );
}

export default Noise;
