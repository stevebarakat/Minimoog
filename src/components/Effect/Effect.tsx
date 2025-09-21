import { Suspense, lazy } from "react";
import type { EffectType } from "@/utils";

const Delay = lazy(() => import("@/components/Delay"));
const Reverb = lazy(() => import("@/components/Reverb"));

type EffectProps = {
  openEffects: Set<EffectType>;
  panelPositions: Record<string, { x: number; y: number }>;
  onCloseEffect: (effect: EffectType) => void;
  onPanelPositionUpdate: (
    effect: EffectType,
    position: { x: number; y: number }
  ) => void;
};

export default function Effect({
  openEffects,
  panelPositions,
  onCloseEffect,
  onPanelPositionUpdate,
}: EffectProps) {
  return (
    <>
      {openEffects.has("delay") && (
        <Suspense fallback={<div>Loading Delay...</div>}>
          <Delay
            onClose={() => onCloseEffect("delay")}
            panelIndex={0}
            initialPosition={panelPositions.delay}
            onPositionUpdate={(position) =>
              onPanelPositionUpdate("delay", position)
            }
          />
        </Suspense>
      )}
      {openEffects.has("reverb") && (
        <Suspense fallback={<div>Loading Reverb...</div>}>
          <Reverb
            onClose={() => onCloseEffect("reverb")}
            panelIndex={1}
            initialPosition={panelPositions.reverb}
            onPositionUpdate={(position) =>
              onPanelPositionUpdate("reverb", position)
            }
          />
        </Suspense>
      )}
    </>
  );
}
