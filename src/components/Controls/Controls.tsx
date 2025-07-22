import styles from "./Controls.module.css";
import { useAudioContext } from "@/hooks/useAudioContext";

import Controllers from "@/components/Controllers";
import OscillatorBank from "@/components/OscillatorBank";
import Mixer from "@/components/Mixer";
import Modifiers from "@/components/Modifiers";
import Output from "@/components/Output";
import Section from "@/components/Section";
import PowerButton from "@/components/PowerButton";
import { useAudioNodes } from "../Minimoog/hooks";

function Controls() {
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContext();
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
