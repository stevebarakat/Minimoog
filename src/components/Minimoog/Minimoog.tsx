import { useSynthStore } from "@/store/synthStore";
import styles from "./Minimoog.module.css";
import PresetsDropdown from "../PresetsDropdown";
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
import { useAudioContext } from "@/hooks/useAudioContext";
import {
  useMinimoogAudio,
  useFilterTracking,
  useMinimoogURLSync,
} from "./hooks";
import { useIsMobile, useViewType } from "@/hooks/useMediaQuery";
import Title from "../Title";

function Minimoog() {
  const { activeKeys, setActiveKeys } = useSynthStore();
  useMinimoogURLSync();
  const view = useViewType();
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContext();
  const { mixerNode, filterNode, containerRef, synthObj } =
    useMinimoogAudio(audioContext);
  useFilterTracking(audioContext, filterNode, activeKeys);
  const isMobile = useIsMobile();

  return (
    <>
      <PresetsDropdown disabled={!isInitialized} />
      <Container>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
          <div ref={containerRef} className={styles.controlsPanel}>
            {isMobile && (
              <Section
                style={{
                  borderRadius: "0 0 0 10px",
                  marginRight: "-0.5rem",
                  marginLeft: "0.5rem",
                }}
              >
                <SidePanel />
                <Title>Modulation</Title>
              </Section>
            )}
            <Controllers />
            <OscillatorBank />
            <Mixer audioContext={audioContext!} mixerNode={mixerNode!} />
            <Modifiers />
            <Output />
            <Section
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
          <div className={styles.keyboardPanel}>
            {!isMobile && <SidePanel />}
            <Keyboard
              activeKeys={activeKeys}
              octaveRange={{ min: 3, max: 5 }}
              onKeyDown={setActiveKeys}
              onKeyUp={() => setActiveKeys(null)}
              synth={synthObj}
              view={view}
            />
          </div>
          <FrontPanel />
        </div>
        <Side />
      </Container>
    </>
  );
}

export default Minimoog;
