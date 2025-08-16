import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "@/store/selectors";
import Container from "../Container";
import Side from "../Side";
import { BackPanel, MidPanel, FrontPanel } from "../Panels";
import SidePanel from "../SidePanel";
import Keyboard from "@/components/Keyboard";
import { useAudio, useFilterTracking } from "./hooks";
import MidiStatusIndicator from "@/components/MidiStatusIndicator";

import { useUIState } from "./hooks/useUIState";
import { useAudioContextManagement } from "./hooks/useAudioContextManagement";
import { useScrollControls } from "./hooks/useScrollControls";
import { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";
import { useURLSync } from "./hooks/useURLSync";
import { ControlsContainer } from "./components";
import { cn } from "@/utils";
import styles from "./Minimoog.module.css";

function Minimoog() {
  const { activeKeys } = useKeyboardState();
  const { setActiveKeys } = useSynthStore();

  // UI state management
  const { isMobile, view } = useUIState();

  // Audio context management
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContextManagement();

  // URL synchronization
  useURLSync();

  // Audio processing
  const { mixerNode, filterNode, synthObj } = useAudio(audioContext);

  // Filter tracking
  useFilterTracking(audioContext, filterNode, activeKeys);

  // Performance monitoring
  usePerformanceMonitoring(audioContext);

  // Scroll controls
  const { scrollRef, handleKeyDown } = useScrollControls();

  return (
    <>
      <Container className={styles.container}>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
          <ControlsContainer
            isMobile={isMobile}
            audioContext={audioContext}
            mixerNode={mixerNode}
            isInitialized={isInitialized}
            onInitialize={initialize}
            onDispose={dispose}
            scrollRef={scrollRef}
            onKeyDown={handleKeyDown}
          />

          <MidPanel />
          <div className={cn(styles.keyboardPanel, isMobile && styles.mobile)}>
            {!isMobile && <SidePanel />}
            <Keyboard
              activeKeys={
                typeof activeKeys === "string"
                  ? activeKeys
                  : activeKeys?.note || null
              }
              octaveRange={{ min: 3, max: 5 }}
              extraKeys={8}
              onKeyDown={setActiveKeys}
              onKeyUp={() => setActiveKeys(null)}
              synth={synthObj}
              view={view}
            />
          </div>
          <FrontPanel />
        </div>
        <Side position="right" />
      </Container>
      {/* Render MidiStatusIndicator after audio setup */}
      {synthObj && <MidiStatusIndicator />}
    </>
  );
}

export default Minimoog;
