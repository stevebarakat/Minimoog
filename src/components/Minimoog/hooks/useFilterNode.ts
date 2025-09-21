import { useCallback, useEffect, useRef } from "react";
import { logger } from "@/utils/core";
import { useSynthStore } from "@/store/synthStore";
import { filterSingleton } from "@/utils/filterSingleton";

export function useFilterNode(
  audioContext: AudioContext | null,
  mixerNode: GainNode | null,
  loudnessEnvelopeGain: GainNode | null
) {
  const filterNodeRef = useRef<AudioWorkletNode | BiquadFilterNode | null>(
    null
  );
  const filterType = useSynthStore((state) => state.filterType);

  const connectFilterChain = useCallback(
    (
      mixer: GainNode | null,
      filter: AudioWorkletNode | BiquadFilterNode | null,
      envelope: GainNode | null
    ) => {
      if (!mixer || !filter || !envelope) return;

      mixer.disconnect();
      filter.disconnect();
      mixer.connect(filter);
      filter.connect(envelope);
    },
    []
  );

  const connectFallbackChain = useCallback(
    (mixer: GainNode | null, envelope: GainNode | null) => {
      if (!mixer || !envelope) return;

      mixer.disconnect();
      mixer.connect(envelope);
    },
    []
  );

  useEffect(() => {
    if (!audioContext || !mixerNode || !loudnessEnvelopeGain) {
      // Clean up existing filter when dependencies are missing
      if (filterNodeRef.current) {
        filterNodeRef.current.disconnect();
        filterNodeRef.current = null;
      }
      return;
    }

    let cancelled = false;

    async function setupFilter() {
      const ctx = audioContext!;

      try {
        // Use singleton to get or create filter
        const workletNode = await filterSingleton.getFilter(
          ctx,
          mixerNode,
          loudnessEnvelopeGain
        );

        if (cancelled) return;

        if (workletNode) {
          filterNodeRef.current = workletNode;
          connectFilterChain(mixerNode, workletNode, loudnessEnvelopeGain);
        } else {
          connectFallbackChain(mixerNode, loudnessEnvelopeGain);
        }
      } catch (error) {
        logger.error("Failed to create filter node:", error);
        connectFallbackChain(mixerNode, loudnessEnvelopeGain);
      }
    }

    setupFilter();

    return () => {
      cancelled = true;
      // Don't dispose the filter here - let it persist for reuse
    };
  }, [
    audioContext,
    filterType, // Only recreate when filter type actually changes
    mixerNode,
    loudnessEnvelopeGain,
    connectFilterChain,
    connectFallbackChain,
  ]);

  // Cleanup effect for component unmount - only clear the ref, don't dispose the singleton
  useEffect(() => {
    return () => {
      // Just clear the ref, let the singleton manage the filter lifecycle
      filterNodeRef.current = null;
    };
  }, []);

  return {
    filterNode: filterNodeRef.current,
  };
}
