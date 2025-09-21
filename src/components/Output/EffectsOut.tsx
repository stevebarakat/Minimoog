import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import Row from "../Row";
import { RockerSwitch } from "../RockerSwitch";
import Knob from "../Knob";
import Column from "../Column";
import Title from "../Title";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

export default function EffectsOut() {
  const {
    effectsVolume,
    delay,
    reverb,
    setEffectsVolume,
    setDelay,
    setReverb,
  } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  // Effects bypass state - true when both effects are disabled
  const effectsBypass = !delay.enabled && !reverb.enabled;

  // Toggle both effects at once
  const handleEffectsBypassChange = (bypass: boolean) => {
    const shouldEnable = !bypass;
    setDelay({ enabled: shouldEnable });
    setReverb({ enabled: shouldEnable });
  };

  return (
    <Row gap="var(--spacing-md)" style={{ padding: "0.5rem 0" }}>
      <Tooltip content={getTooltipContent("aux-out-volume")}>
        <Knob
          valueLabels={{
            0: "0",
            2: "2",
            4: "4",
            6: "6",
            8: "8",
            10: "10",
          }}
          value={effectsVolume}
          logarithmic={true}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => setEffectsVolume(value)}
          label="Volume"
          id="aux-out-volume"
          disabled={isDisabled}
        />
      </Tooltip>
      <Column
        gap="1.1rem"
        style={{ height: "100%", marginTop: "-0.8rem", paddingLeft: "0.75rem" }}
      >
        <Title size="sm">
          Aux Output
          <br />
          (Effects)
        </Title>
        <Tooltip content={getTooltipContent("aux-out-bypass")}>
          <RockerSwitch
            theme="blue"
            checked={!effectsBypass}
            onCheckedChange={(checked) => handleEffectsBypassChange(!checked)}
            label="Aux Output"
            bottomLabelRight="On"
            disabled={isDisabled}
          />
        </Tooltip>
      </Column>
    </Row>
  );
}
