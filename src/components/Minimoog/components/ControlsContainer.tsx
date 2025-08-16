import React from "react";
import styles from "../Minimoog.module.css";
import Controllers from "../../Controllers";
import Section from "../../Section";
import SidePanel from "../../SidePanel";
import Title from "../../Title";
import OscillatorBank from "../../OscillatorBank";
import Mixer from "../../Mixer";
import Modifiers from "../../Modifiers";
import Output from "../../Output";
import PowerButton from "../../PowerButton";

type ControlsContainerProps = {
  isMobile: boolean;
  audioContext: AudioContext | null;
  mixerNode: GainNode | null;
  isInitialized: boolean;
  onInitialize: () => void;
  onDispose: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function ControlsContainer({
  isMobile,
  audioContext,
  mixerNode,
  isInitialized,
  onInitialize,
  onDispose,
  scrollRef,
  onKeyDown,
}: ControlsContainerProps) {
  return (
    <div className={styles.controlsContainer}>
      <div
        ref={scrollRef}
        className={styles.controlsPanel}
        data-onboarding="controls-panel"
        onKeyDown={onKeyDown}
        role="region"
        aria-label="Synthesizer controls"
        tabIndex={0}
      >
        <Controllers />
        {isMobile && (
          <Section
            style={{
              paddingTop: "3.15rem",
            }}
          >
            <SidePanel />
            <Title>Modulation</Title>
          </Section>
        )}
        <OscillatorBank />
        <Mixer audioContext={audioContext!} mixerNode={mixerNode!} />
        <Modifiers />
        <Output />
        <Section
          justify="center"
          style={{
            borderRadius: "0 0 10px 0",
            marginRight: "var(--spacing-md)",
          }}
        >
          <PowerButton
            isOn={isInitialized}
            onPowerOn={onInitialize}
            onPowerOff={onDispose}
          />
        </Section>
      </div>
      <div id="scroll-instructions" className="sr-only">
        Use keyboard arrow keys to scroll through synthesizer controls when they
        extend beyond the visible area.
      </div>
    </div>
  );
}
