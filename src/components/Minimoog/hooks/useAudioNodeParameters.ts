import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff, mapResonance } from "@/utils";
import { useKeyboardControl } from "./useFilterTracking";

type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
  delayNode: DelayNode | null;
  delayMixGain: GainNode | null;
  delayFeedbackGain: GainNode | null;
  reverbNode: ConvolverNode | null; // Used for updating impulse response based on decay parameter
  reverbMixGain: GainNode | null;
  toneFilterNode: BiquadFilterNode | null;
  dryGain: GainNode | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
};

export function useAudioNodeParameters({
  audioContext,
  filterNode,
  delayNode,
  delayMixGain,
  delayFeedbackGain,
  reverbNode,
  reverbMixGain,
  toneFilterNode,
  dryGain,
  masterGain,
  mixerNode,
}: AudioNodeParametersProps) {
  const {
    mainVolume,
    isMainActive,
    filterCutoff,
    filterEmphasis,
    activeKeys,
    filterModulationOn,
    delay,
    reverb,
  } = useSynthStore();

  // Get keyboard control offset for filter tracking
  const keyboardControlOffset = useKeyboardControl(activeKeys);

  // Set master volume
  useEffect(() => {
    if (!masterGain || !audioContext) return;

    // Validate main volume to prevent non-finite errors
    const validVolume = isFinite(mainVolume)
      ? Math.max(0, Math.min(10, mainVolume))
      : 2;
    const gain = Math.pow(validVolume / 10, 2);

    // Double-check gain is finite
    const validGain = isFinite(gain) ? Math.max(0, Math.min(1, gain)) : 0.04;

    try {
      masterGain.gain.setValueAtTime(validGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting master volume:", error, {
        mainVolume,
        validVolume,
        gain,
        validGain,
        isFinite: isFinite(validGain),
      });
    }
  }, [mainVolume, audioContext, masterGain]);

  // Set mixer volume based on master active state
  useEffect(() => {
    if (!audioContext || !mixerNode) return;

    try {
      if (!isMainActive) {
        mixerNode.gain.setValueAtTime(0, audioContext.currentTime);
      } else {
        // Mixer should pass through at unity gain when active
        mixerNode.gain.setValueAtTime(1, audioContext.currentTime);
      }
    } catch (error) {
      console.error("Error setting mixer volume:", error, {
        isMainActive,
        currentTime: audioContext.currentTime,
      });
    }
  }, [isMainActive, audioContext, mixerNode]);

  // Set delay parameters
  useEffect(() => {
    if (!delayNode || !audioContext || !delay.enabled) return;

    try {
      // Map delay time from 0-10 to 0-1000ms
      const delayTimeMs = (delay.time / 10) * 1000;
      delayNode.delayTime.setValueAtTime(
        delayTimeMs / 1000,
        audioContext.currentTime
      );
    } catch (error) {
      console.error("Error setting delay time:", error, {
        delayTime: delay.time,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.time, delay.enabled, audioContext, delayNode]);

  useEffect(() => {
    if (!delayMixGain || !audioContext) return;

    try {
      // Map mix from 0-10 to 0-1, or 0 if delay is disabled
      const mixGain = delay.enabled ? delay.mix / 10 : 0;
      delayMixGain.gain.setValueAtTime(mixGain, audioContext.currentTime);

      // When disabled, also set feedback to 0 to stop the feedback loop
      if (delayFeedbackGain) {
        const feedbackGain = delay.enabled ? (delay.feedback / 10) * 0.9 : 0;
        delayFeedbackGain.gain.setValueAtTime(
          feedbackGain,
          audioContext.currentTime
        );
      }
    } catch (error) {
      console.error("Error setting delay mix:", error, {
        delayMix: delay.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [
    delay.mix,
    delay.enabled,
    audioContext,
    delayMixGain,
    delayFeedbackGain,
    delay.feedback,
  ]);

  // Set reverb parameters
  useEffect(() => {
    if (!reverbMixGain || !audioContext) return;

    try {
      // Map mix from 0-10 to 0-1, or 0 if reverb is disabled
      const mixGain = reverb.enabled ? reverb.mix / 10 : 0;

      console.log("Setting reverb mix:", {
        reverbEnabled: reverb.enabled,
        reverbMix: reverb.mix,
        mixGain,
        currentTime: audioContext.currentTime,
      });

      reverbMixGain.gain.setValueAtTime(mixGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting reverb mix:", error, {
        reverbMix: reverb.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [reverb.mix, reverb.enabled, audioContext, reverbMixGain]);

  // Update reverb impulse response based on decay parameter
  useEffect(() => {
    if (!reverbNode || !audioContext) return;

    try {
      // Map decay from 0-10 to 0.1-10 seconds
      const decayTime = (reverb.decay / 10) * 10 + 0.1;

      // Generate a new impulse response with the updated decay
      const sampleRate = audioContext.sampleRate;
      const impulseLength = Math.floor(sampleRate * decayTime);
      const impulseBuffer = audioContext.createBuffer(
        1,
        impulseLength,
        sampleRate
      );
      const impulseData = impulseBuffer.getChannelData(0);

      // Create a decaying exponential curve for the impulse response
      for (let i = 0; i < impulseLength; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * (2 / decayTime)); // Adjust decay rate based on time
        const noise = (Math.random() * 2 - 1) * 0.3; // Increased noise for more character
        const earlyReflections = Math.sin(t * 100) * 0.1; // Add early reflection simulation
        impulseData[i] = decay * (1.2 + noise + earlyReflections); // Increased base amplitude
      }

      reverbNode.buffer = impulseBuffer;

      console.log("Updated reverb impulse response:", {
        reverbDecay: reverb.decay,
        decayTime,
        impulseLength,
        sampleRate,
        bufferChannels: impulseBuffer.numberOfChannels,
        bufferLength: impulseBuffer.length,
        currentTime: audioContext.currentTime,
      });
    } catch (error) {
      console.error("Error updating reverb impulse response:", error, {
        reverbDecay: reverb.decay,
        currentTime: audioContext.currentTime,
      });
    }
  }, [reverb.decay, audioContext, reverbNode]);

  // Set reverb tone filter (bass to treble EQ)
  useEffect(() => {
    if (!toneFilterNode || !audioContext) return;

    try {
      // Map tone from 0-10 to dramatic bass/treble filtering
      // 0 = heavy bass (lowpass at 200Hz), 5 = neutral, 10 = bright treble (highpass at 2kHz)
      const toneValue = reverb.tone;

      if (toneValue <= 3) {
        // Heavy bass: lowpass filter with very low frequency
        toneFilterNode.type = "lowpass";
        const frequency = 200 + (toneValue / 3) * 600; // 200Hz to 800Hz (reduced from 1kHz)
        toneFilterNode.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );
        toneFilterNode.Q.setValueAtTime(1, audioContext.currentTime);
      } else if (toneValue <= 7) {
        // Neutral: bandpass filter around mid frequencies
        toneFilterNode.type = "bandpass";
        const frequency = 800 + ((toneValue - 3) / 4) * 1200; // 800Hz to 2kHz (reduced from 1kHz-3kHz)
        toneFilterNode.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );
        toneFilterNode.Q.setValueAtTime(2, audioContext.currentTime);
      } else {
        // Bright treble: highpass filter with high frequency
        toneFilterNode.type = "highpass";
        const frequency = 2000 + ((toneValue - 7) / 3) * 3000; // 2kHz to 5kHz (reduced from 2kHz-10kHz)
        toneFilterNode.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );
        toneFilterNode.Q.setValueAtTime(1, audioContext.currentTime);
      }

      console.log("Setting reverb tone:", {
        reverbTone: reverb.tone,
        filterType: toneFilterNode.type,
        frequency: toneFilterNode.frequency.value,
        Q: toneFilterNode.Q.value,
        currentTime: audioContext.currentTime,
      });
    } catch (error) {
      console.error("Error setting reverb tone:", error, {
        reverbTone: reverb.tone,
        currentTime: audioContext.currentTime,
      });
    }
  }, [reverb.tone, audioContext, toneFilterNode]);

  useEffect(() => {
    if (!dryGain || !audioContext) return;

    try {
      // Calculate dry gain based on both delay and reverb mix settings
      // When either effect is fully wet, dry should be muted
      const delayWetMix = delay.enabled ? delay.mix / 10 : 0;
      const reverbWetMix = reverb.enabled ? reverb.mix / 10 : 0;

      // Dry gain is inverse of the maximum wet mix
      // This ensures that when either effect is fully wet, dry is completely muted
      const maxWetMix = Math.max(delayWetMix, reverbWetMix);
      const dryGainValue = 1 - maxWetMix;

      dryGain.gain.setValueAtTime(dryGainValue, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting dry gain:", error, {
        delayMix: delay.mix,
        reverbMix: reverb.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [
    delay.mix,
    delay.enabled,
    reverb.mix,
    reverb.enabled,
    audioContext,
    dryGain,
  ]);

  // Set filter parameters with keyboard control
  useEffect(() => {
    if (!filterNode || !audioContext) return;

    // Apply keyboard control offset to the base cutoff
    // The offset is in octaves, so we need to convert it to the filter cutoff range
    const adjustedFilterCutoff = filterCutoff + keyboardControlOffset * 4; // More prominent key tracking
    const cutoff = mapCutoff(adjustedFilterCutoff);
    const resonance = mapResonance(filterEmphasis);

    if (filterNode instanceof AudioWorkletNode) {
      // Handle WASM-based filters
      // Always send resonance
      filterNode.port.postMessage({ resonance: resonance });

      // Only send cutoff if modulation is not active (modulation system will handle it)
      if (!filterModulationOn) {
        filterNode.port.postMessage({ cutOff: cutoff });
      }
    }
  }, [
    filterCutoff,
    filterEmphasis,
    filterNode,
    audioContext,
    keyboardControlOffset,
    filterModulationOn,
  ]);
}
