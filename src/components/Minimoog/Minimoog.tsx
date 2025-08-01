import React, { lazy, Suspense } from "react";
import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "@/store/selectors";
import styles from "./Minimoog.module.css";
import Container from "../Container";
import Side from "../Side";
import { BackPanel, MidPanel, FrontPanel } from "../Panels";
import Controllers from "../Controllers";
import OscillatorBank from "../OscillatorBank";
import Mixer from "../Mixer";
import Modifiers from "../Modifiers";
import Output from "../Output";
import Section from "../Section";
import PowerButton from "../PowerButton";
import Hinge from "../Hinge";
import SidePanel from "../SidePanel";
import Keyboard from "@/components/Keyboard";
import { useAudio, useFilterTracking, useURLSync } from "./hooks";
import { useUIState } from "./hooks/useUIState";
import { useAudioContextManagement } from "./hooks/useAudioContextManagement";
import Title from "../Title";
import { cn } from "@/utils";
import Row from "../Row";

// Lazy load non-critical components
const LazyPresetsDropdown = lazy(() => import("../PresetsDropdown"));
const LazyCopySettings = lazy(() => import("../CopySettings"));

const Minimoog = React.memo(function Minimoog() {
  const { activeKeys } = useKeyboardState();
  const { setActiveKeys } = useSynthStore();

  // UI state management
  // ----------------------------
  const { containerRef, isMobile } = useUIState();

  // Audio context management
  // ----------------------------
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContextManagement();

  // URL synchronization
  // ----------------------------
  useURLSync();

  // Audio processing
  // ----------------------------
  const { mixerNode, filterNode, synthObj } = useAudio(audioContext);

  // Filter tracking
  // ----------------------------
  useFilterTracking(audioContext, filterNode, activeKeys);

  return (
    <>
      <Suspense fallback={<div>Loading controls...</div>}>
        <Row justify="center" gap="var(--spacing-md)">
          <LazyPresetsDropdown disabled={!isInitialized} />
          <LazyCopySettings disabled={!isInitialized} />
        </Row>
      </Suspense>
      <Container>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
          <div ref={containerRef} className={styles.controlsPanel}>
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
                onPowerOn={initialize}
                onPowerOff={dispose}
              />
            </Section>
          </div>
          <Hinge />
          <MidPanel />
          <div className={cn(styles.keyboardPanel, isMobile && styles.mobile)}>
            {!isMobile && <SidePanel />}
            <Keyboard
              activeKeys={activeKeys}
              octaveRange={{ min: 3, max: 5 }}
              extraKeys={8}
              onKeyDown={setActiveKeys}
              onKeyUp={() => setActiveKeys(null)}
              synth={synthObj}
            />
          </div>
          <FrontPanel />
        </div>
        <Side />
      </Container>
    </>
  );
});

export default Minimoog;
