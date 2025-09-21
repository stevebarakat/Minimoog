import { RockerSwitch } from "../RockerSwitch";
import Title from "../Title";
import Tune from "../Tune";
import Glide from "../Glide";
import ModulationMix from "../ModulationMix";
import Section from "../Section";
import Column from "../Column";
import Row from "../Row";
import { useSynthStore } from "@/store/synthStore";
import {
  useOscillator3ControlsState,
  useIsSynthDisabled,
} from "@/store/selectors";
import { Tooltip } from "../Tooltip";
import { getTooltipContent } from "@/utils";

function Controllers() {
  const { osc3FilterEgSwitch, noiseLfoSwitch } = useOscillator3ControlsState();
  const { setOsc3FilterEgSwitch, setNoiseLfoSwitch } = useSynthStore();
  const isDisabled = useIsSynthDisabled();

  return (
    <Section
      data-onboarding="controllers"
      style={{
        marginLeft: "var(--spacing-md)",
        paddingLeft: "var(--spacing-md)",
        paddingRight: "var(--spacing-lg)",
        borderRadius: "0 0 0 0.5rem",
      }}
    >
      <Row>
        <Column gap="var(--spacing-lg)">
          <Tune />
          <Row gap="var(--spacing-xl)">
            <Glide />
            <ModulationMix />
          </Row>
          <Row
            justify="space-around"
            style={{ marginBottom: "var(--spacing-md)" }}
          >
            <Tooltip content={getTooltipContent("osc-3-filter-eg")}>
              <RockerSwitch
                checked={osc3FilterEgSwitch}
                onCheckedChange={setOsc3FilterEgSwitch}
                label="Send to mod 1"
                bottomLabelLeft="Osc. 3"
                bottomLabelRight="Filter Eg"
                disabled={isDisabled}
              />
            </Tooltip>
            <Tooltip content={getTooltipContent("noise-lfo")}>
              <RockerSwitch
                checked={noiseLfoSwitch}
                onCheckedChange={setNoiseLfoSwitch}
                label="Send to mod 2"
                bottomLabelLeft="Noise"
                bottomLabelRight="LFO"
                disabled={isDisabled}
              />
            </Tooltip>
          </Row>
        </Column>
      </Row>
      <Title>Controllers</Title>
    </Section>
  );
}

export default Controllers;
