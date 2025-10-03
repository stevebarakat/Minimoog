import React, { useEffect, useRef } from "react";
import Controllers from "@/components/Controllers";
import OscillatorBank from "@/components/OscillatorBank";
import Mixer from "@/components/Mixer";
import Modifiers from "@/components/Modifiers";
import Output from "@/components/Output";
import styles from "../Minimoog.module.css";
import Power from "@/components/PowerButton/Power";

type ControlsContainerProps = {
  audioContext: AudioContext | null;
  mixerNode: GainNode | null;
  isInitialized: boolean;
  onInitialize: () => void;
  onDispose: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function ControlsContainer({
  audioContext,
  mixerNode,
  isInitialized,
  onInitialize,
  onDispose,
  scrollRef,
  onKeyDown,
}: ControlsContainerProps) {
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [scrollRef]);

  return (
    <div className={styles.controlsContainer}>
      <div
        ref={scrollRef}
        className={styles.controlsPanel}
        data-onboarding="controls-panel"
        onKeyDown={onKeyDown}
        role="region"
        aria-label="Synthesizer controls"
      >
        <Controllers />
        <OscillatorBank />
        <Mixer audioContext={audioContext!} mixerNode={mixerNode!} />
        <Modifiers />
        <Output />
        <Power
          isInitialized={isInitialized}
          onInitialize={onInitialize}
          onDispose={onDispose}
        />
      </div>
      <div id="scroll-instructions" className="sr-only">
        Use keyboard arrow keys to scroll through synthesizer controls when they
        extend beyond the visible area.
      </div>
    </div>
  );
}
