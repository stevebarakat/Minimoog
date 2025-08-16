import Minimoog from "./components/Minimoog";
import Ribbon from "./components/Ribbon";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { useIsSynthReady } from "./store/selectors";
import { isDevMode } from "./config";
import { Suspense, lazy, useState } from "react";
import Row from "./components/Row";
import SavePreset from "./components/SavePreset";

// Lazy load non-critical components
const LazyPresetsDropdown = lazy(() => import("./components/PresetsDropdown"));
const LazyKeyboardInstructions = lazy(
  () => import("./components/KeyboardInstructions")
);
const LazyCopySettings = lazy(() => import("./components/CopySettings"));
import { DevStatsPanel } from "./components/DevStatsPanel";
import { useSynthStore } from "./store/synthStore";
import Onboarding from "./components/Onboarding";
import DelayToggle from "./components/DelayToggle";
import Delay from "./components/Delay";
import ReverbToggle from "./components/ReverbToggle";
import Reverb from "./components/Reverb";

function App() {
  // Audio context management
  const isInitialized = useIsSynthReady();
  const audioContext = useSynthStore((state) => state.audioContext.context);

  // DevStatsPanel toggle state
  const [isDevStatsOpen, setIsDevStatsOpen] = useState(false);

  // Delay panel toggle state
  const [isDelayOpen, setIsDelayOpen] = useState(false);

  // Reverb panel toggle state
  const [isReverbOpen, setIsReverbOpen] = useState(false);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <Ribbon
          url="https://github.com/stevebarakat/minimoog"
          text="Fork me on GitHub"
        />
        <Suspense fallback={<div>Loading controls...</div>}>
          <Row justify="center" gap="var(--spacing-md)">
            <LazyKeyboardInstructions />
            {isDevMode() && <SavePreset disabled={!isInitialized} />}
            {isDevMode() && <DelayToggle onToggle={setIsDelayOpen} />}
            {isDevMode() && <ReverbToggle onToggle={setIsReverbOpen} />}
            {isDevMode() && (
              <button
                onClick={() => setIsDevStatsOpen(!isDevStatsOpen)}
                className="dev-stats-toggle"
                title={isDevStatsOpen ? "Close Dev Stats" : "Open Dev Stats"}
              >
                {isDevStatsOpen ? "CLOSE STATS" : "OPEN STATS"}
              </button>
            )}
            <LazyPresetsDropdown disabled={!isInitialized} />
            <LazyCopySettings disabled={!isInitialized} />
          </Row>
        </Suspense>
        <Minimoog />
        {isDevMode() && isDevStatsOpen && (
          <DevStatsPanel
            audioContext={audioContext}
            isOpen={isDevStatsOpen}
            onClose={() => setIsDevStatsOpen(false)}
          />
        )}
        {isDelayOpen && <Delay onClose={() => setIsDelayOpen(false)} />}
        {isReverbOpen && <Reverb onClose={() => setIsReverbOpen(false)} />}
        <Onboarding />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
