import { useEffect, useState } from "react";
import { useNoise } from "@/components/Noise/hooks";
import {
  useOscillator1,
  useOscillator2,
  useOscillator3,
} from "@/components/OscillatorBank/hooks";
import { useTuner } from "@/components/Tuner/hooks";
import { useMidiHandling } from "@/components/Keyboard/hooks";
import { useAuxOutput } from "@/components/Output/hooks";
import Modifiers from "../Modifiers";
import Mixer from "../Mixer";
import OscillatorBank from "../OscillatorBank";
import Controllers from "../Controllers";
import Output from "../Output";
import Keyboard from "@/components/Keyboard";
import SidePanel from "@/components/SidePanel";
import Side from "@/components/Side";
import { useSynthStore } from "@/store/synthStore";
import { useAudioContext } from "@/hooks/useAudioContext";
import styles from "./Minimoog.module.css";
import PowerButton from "../PowerButton";
import { useAudioNodes, useModulation, useEnvelopes } from "./hooks";
import { mapCutoff, noteNameToMidi } from "./utils/synthUtils";
import Section from "../Section";
import PresetsDropdown from "../PresetsDropdown";
import { loadStateFromURL } from "@/utils/urlState";
import { useURLSync, setLoadingFromURL } from "@/hooks/useURLSync";
import Hinge from "../Hinge";
import Container from "../Container";
import { BackPanel, MidPanel, FrontPanel } from "../Panels";

function Minimoog() {
  const { activeKeys, setActiveKeys, loadPreset } = useSynthStore();
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContext();

  // Load settings from URL parameters on mount - run immediately
  useEffect(() => {
    const urlState = loadStateFromURL();

    if (urlState) {
      setLoadingFromURL(true);
      loadPreset(urlState);
      // Reset the flag after a short delay to allow URL sync to resume
      setTimeout(() => setLoadingFromURL(false), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Sync state changes with URL
  useURLSync();

  // Set up audio nodes
  const { mixerNode, filterNode, loudnessEnvelopeGain, masterGain } =
    useAudioNodes(audioContext);

  // Set up oscillators
  const validCtx = audioContext && mixerNode ? audioContext : null;
  const validMixer =
    audioContext && mixerNode instanceof GainNode ? mixerNode : null;

  useNoise(validCtx, validMixer);

  // Set up tuner
  useTuner(audioContext);

  // Set up aux output
  useAuxOutput(audioContext, masterGain);

  const vibratoAmount = useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    // Clamp modWheel to prevent extreme values
    const clampedModWheel = Math.max(0, Math.min(100, state.modWheel));
    return clampedModWheel / 100;
  });

  const osc1 = useOscillator1(validCtx, validMixer, vibratoAmount);
  const osc2 = useOscillator2(validCtx, validMixer, vibratoAmount);
  const osc3 = useOscillator3(validCtx, validMixer, vibratoAmount);

  // Set up modulation
  useModulation({
    audioContext,
    osc1,
    osc2,
    osc3,
    filterNode,
  });

  // Set up envelopes and get synth object
  const synthObj = useEnvelopes({
    audioContext,
    filterNode,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
  });

  // Set up MIDI handling with the synth object
  useMidiHandling(synthObj);

  // Update filter based on key tracking
  useEffect(() => {
    if (!filterNode || !audioContext) return;
    const { filterCutoff, keyboardControl1, keyboardControl2 } =
      useSynthStore.getState();

    // Key tracking for static cutoff
    let trackedCutoff = mapCutoff(filterCutoff);
    const keyTracking =
      (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
    if (activeKeys) {
      const noteNumber = noteNameToMidi(activeKeys);
      const baseNoteNumber = 60;
      trackedCutoff =
        trackedCutoff *
        Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
    }

    // AudioWorkletNode case - set cutoff parameter
    const cutoffParam = filterNode.parameters.get("cutoff");
    cutoffParam?.setValueAtTime(trackedCutoff, audioContext.currentTime);
  }, [filterNode, audioContext, activeKeys]);

  useEffect(() => {
    const handleResize = () => {
      setView(
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 980
          ? "tablet"
          : "desktop"
      );
    };

    // Set initial view state
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <PresetsDropdown disabled={!isInitialized} />
      <Container>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
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
          <Hinge />
          <MidPanel />
          <div className={styles.keyboardPanel}>
            <SidePanel />
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
