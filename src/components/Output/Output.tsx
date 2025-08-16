import Title from "../Title";
import Section from "../Section";
import Column from "../Column";
import MainOutput from "./MainOutput";
import Tuner from "../Tuner";
import AuxOut from "./AuxOut";

function Output() {
  return (
    <Section justify="flex-end">
      <Column
        align="flex-start"
        gap="1.6rem"
        style={{
          paddingLeft: "var(--spacing-md)",
          paddingRight: "var(--spacing-sm)",
        }}
      >
        <MainOutput />
        <Tuner />
        <AuxOut />
      </Column>
      <Title>Output</Title>
    </Section>
  );
}

export default Output;
