import { useEffect } from "react";
import { useDelayState } from "@/store/selectors";
import type { CustomDelayNode } from "@/types/audio";

type DelayParametersProps = {
  audioContext: AudioContext | null;
  delayNode: DelayNode | null;
  delayMixGain: GainNode | null;
};

export function useDelayParameters({
  audioContext,
  delayNode,
  delayMixGain,
}: DelayParametersProps) {
  const delay = useDelayState();

  useEffect(() => {
    if (!delayNode || !audioContext) return;

    // Ensure delay values are defined before proceeding
    if (
      delay.time === undefined ||
      delay.feedback === undefined ||
      delay.mix === undefined
    ) {
      return;
    }

    try {
      if (delay.enabled) {
        if (
          "delayTime" in delayNode &&
          typeof delayNode.delayTime === "object" &&
          "setValueAtTime" in delayNode.delayTime
        ) {
          const delayTimeMs = Math.max(0.001, (delay.time / 10) * 2.0);
          (delayNode.delayTime as AudioParam).setValueAtTime(
            delayTimeMs,
            audioContext.currentTime
          );
        } else if (
          delayNode instanceof AudioWorkletNode &&
          "parameters" in delayNode &&
          delayNode.parameters &&
          typeof delayNode.parameters === "object" &&
          "has" in delayNode.parameters &&
          typeof delayNode.parameters.has === "function" &&
          delayNode.parameters.has("delayTime")
        ) {
          const customDelayNode = delayNode as unknown as CustomDelayNode;
          const delayTimeMs = Math.max(0.001, (delay.time / 10) * 2.0);
          customDelayNode.parameters
            .get("delayTime")
            ?.setValueAtTime(delayTimeMs, audioContext.currentTime);

          const feedback = (delay.feedback / 10) * 0.95;
          customDelayNode.parameters
            .get("feedback")
            ?.setValueAtTime(feedback, audioContext.currentTime);

          const wetLevel = delay.mix / 10;
          customDelayNode.parameters
            .get("wetLevel")
            ?.setValueAtTime(wetLevel, audioContext.currentTime);

          const dryLevel = 1 - wetLevel;
          customDelayNode.parameters
            .get("dryLevel")
            ?.setValueAtTime(dryLevel, audioContext.currentTime);

          customDelayNode.parameters
            .get("enabled")
            ?.setValueAtTime(1, audioContext.currentTime);
        } else {
          console.warn(
            "Unknown delay node type, limited functionality available"
          );
        }
      }
    } catch (error) {
      console.error("Error setting delay parameters:", error, {
        delayTime: delay.time,
        feedback: delay.feedback,
        mix: delay.mix,
        enabled: delay.enabled,
        currentTime: audioContext.currentTime,
      });
    }
  }, [
    delay.time,
    delay.feedback,
    delay.mix,
    delay.enabled,
    audioContext,
    delayNode,
  ]);

  useEffect(() => {
    if (!delayMixGain || !audioContext) return;

    // Ensure delay.mix is defined before proceeding
    if (delay.mix === undefined) {
      return;
    }

    try {
      const mixGain = delay.enabled ? delay.mix / 10 : 0;
      delayMixGain.gain.setValueAtTime(mixGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting delay mix:", error, {
        delayMix: delay.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.mix, delay.enabled, audioContext, delayMixGain]);
}
