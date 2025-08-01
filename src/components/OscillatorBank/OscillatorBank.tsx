import React from "react";
import OscillatorModulation from "./components/OscillatorModulation";
import Oscillator1 from "./components/Oscillator1";
import Oscillator2 from "./components/Oscillator2";
import Oscillator3 from "./components/Oscillator3";
import Title from "../Title";
import Section from "../Section";
import Column from "../Column";

function OscillatorBank() {
  return (
    <Section data-onboarding="oscillators">
      {/* Debug element */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          background: "yellow",
          padding: "2px",
          fontSize: "10px",
          zIndex: 1000,
        }}
      >
        OSCILLATORS DEBUG
      </div>
      <Column>
        <OscillatorModulation />
        <Oscillator1 />
        <Oscillator2 />
        <Oscillator3 />
      </Column>
      <Title>Oscillator Bank</Title>
    </Section>
  );
}

export default OscillatorBank;
