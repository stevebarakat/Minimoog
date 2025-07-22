import { RockerSwitch } from "../RockerSwitch";
import Title from "../Title";
import Tune from "../Tune";
import Glide from "../Glide";
import ModulationMix from "../ModulationMix";
import Section from "../Section";
import Column from "../Column";
import Row from "../Row";
import { useSynthStore } from "@/store/synthStore";

function Controllers() {
  const {
    osc3FilterEgSwitch,
    setOsc3FilterEgSwitch,
    noiseLfoSwitch,
    setNoiseLfoSwitch,
    isDisabled,
  } = useSynthStore();

  return (
    <Section
      style={{
        marginLeft: "var(--spacing-md)",
        paddingLeft: "var(--spacing-md)",
        paddingRight: "var(--spacing-lg)",
        borderRadius: "0 0 0 0.5rem",
      }}
    >
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
          <RockerSwitch
            checked={osc3FilterEgSwitch}
            onCheckedChange={setOsc3FilterEgSwitch}
            label="Send to mod 1"
            bottomLabelLeft="Osc. 3"
            bottomLabelRight="Filter Eg"
            disabled={isDisabled}
          />
          <RockerSwitch
            checked={noiseLfoSwitch}
            onCheckedChange={setNoiseLfoSwitch}
            label="Send to mod 2"
            bottomLabelLeft="Noise"
            bottomLabelRight="LFO"
            disabled={isDisabled}
          />
        </Row>
      </Column>
      <Title>Controllers</Title>
    </Section>
  );
}

export default Controllers;
