import { memo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "@/store/selectors";
import Container from "../Container";
import Side from "../Side";
import { BackPanel, MidPanel, FrontPanel } from "../Panels";
import SidePanel from "../SidePanel";
import Keyboard from "@/components/Keyboard";
import { useAudio, useKeyboardControl } from "./hooks";
import { useUIState } from "./hooks/useUIState";
import { useAudioContextManagement } from "./hooks/useAudioContextManagement";
import { useScrollControls } from "./hooks/useScrollControls";
import { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";
import { useURLSync } from "./hooks/useURLSync";
import { CountdownToast } from "@/components/CountdownToast";
import { ControlsContainer } from "./components";
import styles from "./Minimoog.module.css";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useFirstClickDetection } from "@/hooks/useFirstClickDetection";

const Minimoog = memo(function Minimoog() {
  const isMobile = useIsMobile();
  const { activeKeys } = useKeyboardState();
  const { setActiveKeys } = useSynthStore();

  // UI state management
  const { view } = useUIState();

  // Audio context management
  const { audioContext, isInitialized, onInitialize, onDispose } =
    useAudioContextManagement();

  // First click detection for auto power activation
  useFirstClickDetection({
    onFirstClick: () => {
      console.log("First click detected, isInitialized:", isInitialized);
      if (!isInitialized) {
        console.log("Calling onInitialize()");
        onInitialize();
      }
    },
    enabled: !isInitialized,
  });

  // URL synchronization
  const countdownToast = useURLSync();

  // Audio processing
  const { mixerNode, synthObj } = useAudio(audioContext);

  // Keyboard control for filter tracking
  useKeyboardControl(activeKeys);

  // Performance monitoring
  usePerformanceMonitoring(audioContext);

  // Scroll controls
  const { scrollRef, handleKeyDown } = useScrollControls();

  const safeActiveKeys =
    typeof activeKeys === "string" ? activeKeys : activeKeys?.note || null;

  // Don't render on mobile devices (width <= 760px)
  // Tablets (761px-979px) and desktop (980px+) are supported
  if (isMobile) return null;

  return (
    <>
      <Container className={styles.container}>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
          <ControlsContainer
            audioContext={audioContext}
            mixerNode={mixerNode}
            isInitialized={isInitialized}
            onInitialize={onInitialize}
            onDispose={onDispose}
            scrollRef={scrollRef}
            onKeyDown={handleKeyDown}
          />
          <MidPanel />
          <div className={styles.keyboardPanel}>
            <SidePanel />
            <Keyboard
              activeKeys={safeActiveKeys}
              octaveRange={{ min: 3, max: 5 }}
              extraKeys={8}
              onKeyDown={(note) => {
                setActiveKeys(note);
              }}
              onKeyUp={(note) => {
                // Only set activeKeys to null if this was the currently active note
                // and there are no other keys still pressed
                if (note === safeActiveKeys) {
                  setActiveKeys(null);
                }
              }}
              synth={synthObj}
              view={view}
            />
          </div>
          <FrontPanel />
        </div>
        <Side position="right" />
      </Container>
      <CountdownToast
        title={countdownToast.title}
        description={countdownToast.description}
        variant={countdownToast.variant}
        initialSeconds={countdownToast.initialSeconds}
        onComplete={countdownToast.onComplete}
        isVisible={countdownToast.isVisible}
        onOpenChange={countdownToast.onOpenChange}
      />
    </>
  );
});

export default Minimoog;
