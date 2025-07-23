import styles from "./Controls.module.css";
import Controllers from "@/components/Controllers";
import OscillatorBank from "@/components/OscillatorBank";
import Mixer from "@/components/Mixer";
import Modifiers from "@/components/Modifiers";
import Output from "@/components/Output";
import Section from "@/components/Section";
import PowerButton from "@/components/PowerButton";
import { useAudioNodes } from "../Minimoog/hooks";
import { useAudioContextManagement } from "../Minimoog/hooks/useAudioContextManagement";

function Controls() {
  // Audio context management
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContextManagement();

  // Audio nodes
  const { mixerNode } = useAudioNodes(audioContext);

  return (
    <div className={styles.controlsPanel}>
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
  );
}

export default Controls;
