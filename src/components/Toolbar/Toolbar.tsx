import Ribbon from "../Ribbon";
import { Suspense } from "react";
import Row from "../Row";
import LazyKeymap from "../KeyMap";
import LazyOptionsDropdown from "../OptionsDropdown";
import LazyPresetsDropdown from "../PresetsDropdown";
import LazyEffectsDropdown from "../EffectsDropdown";
import LazyCopyUrl from "../CopyUrl";
import { useIsSynthReady } from "@/store/selectors";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { DevStatsPanel, DevStatsToggle } from "../DevStatsPanel";
import SavePreset from "../SavePreset";
import { isDevMode } from "@/config";
import { useSynthStore } from "@/store/synthStore";
import { useState } from "react";
import { usePowerRequiredToast } from "@/hooks/usePowerRequiredToast";

function Toolbar() {
  const isInitialized = useIsSynthReady();
  const isMobile = useIsMobile();
  const devMode = isDevMode();
  const [isDevStatsOpen, setIsDevStatsOpen] = useState(false);
  const audioContext = useSynthStore((state) => state.audioContext.context);
  const { showPowerRequiredToast } = usePowerRequiredToast();

  if (isMobile) return null;

  const conditionalControls = devMode && (
    <div className="dev-controls">
      <SavePreset disabled={!isInitialized} />
      <DevStatsToggle
        isOpen={isDevStatsOpen}
        onToggle={() => setIsDevStatsOpen(!isDevStatsOpen)}
      />
      {isDevStatsOpen && (
        <DevStatsPanel
          audioContext={audioContext}
          isOpen={isDevStatsOpen}
          onClose={() => setIsDevStatsOpen(false)}
        />
      )}
    </div>
  );

  return (
    <div onPointerDown={showPowerRequiredToast}>
      <Suspense fallback={<div className="loader"></div>}>
        {conditionalControls}
        <Ribbon
          url="https://github.com/stevebarakat/minimoog"
          text="Fork me on GitHub"
        />
        <Row justify="center" gap="var(--spacing-md)" wrap>
          <LazyKeymap />
          <LazyOptionsDropdown disabled={!isInitialized} maxWidth="14rem" />
          <LazyPresetsDropdown disabled={!isInitialized} />
          <LazyEffectsDropdown disabled={!isInitialized} />
          <LazyCopyUrl disabled={!isInitialized} />
        </Row>
      </Suspense>
    </div>
  );
}

export default Toolbar;
