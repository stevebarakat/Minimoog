import React from "react";
import { LoudnessEnvelope, FilterEnvelope } from "@/components/Envelopes";
import Title from "@/components/Title";
import Filter from "@/components/Filter";
import Section from "../Section";
import Column from "../Column";
import ModulationSwitch from "../Filter/ModulationSwitch";
import KeyboardControl from "../Filter/KeyboardControl";
import styles from "./Modifiers.module.css";

const Modifiers = React.memo(function Modifiers() {
  return (
    <Section>
      <div className={styles.filterSwitches}>
        <ModulationSwitch />
        <KeyboardControl />
      </div>
      <Column
        style={{ paddingLeft: "calc(var(--spacing-xl) * 2)" }}
        gap="0.5rem"
      >
        <Filter />
        <FilterEnvelope />
      </Column>
      <Column
        style={{
          marginTop: "0.25rem",
          borderTop: "2px solid var(--color-synth-border)",
          paddingLeft: "calc(var(--spacing-xl) * 1.5)",
          paddingBottom: "0.5rem",
          width: "101%",
        }}
      >
        <LoudnessEnvelope />
      </Column>
      <Title>Modifiers</Title>
    </Section>
  );
});

export default Modifiers;
