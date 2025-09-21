import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useEnvelopes } from "../useEnvelopes";

describe("useEnvelopes", () => {
  it("returns a synthObj with triggerAttack and triggerRelease", () => {
    const mockAudioContext = {
      currentTime: 0,
    } as unknown as AudioContext;
    const mockFilterNode = {
      parameters: new Map([
        ["cutoff", { setValueAtTime: vi.fn() }],
        ["resonance", { setValueAtTime: vi.fn() }],
      ]),
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioWorkletNode;
    const mockLoudnessEnvelopeGain = {
      gain: {
        setValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        setValueCurveAtTime: vi.fn(),
        cancelAndHoldAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;
    const osc1 = {};
    const osc2 = {};
    const osc3 = {};

    const { result } = renderHook(() =>
      useEnvelopes({
        audioContext: mockAudioContext,
        filterNode: mockFilterNode,
        loudnessEnvelopeGain: mockLoudnessEnvelopeGain,
        osc1,
        osc2,
        osc3,
        filterEnvelope: null, // Explicitly test with null filterEnvelope
      })
    );
    expect(result.current).toHaveProperty("triggerAttack");
    expect(result.current).toHaveProperty("triggerRelease");
    expect(typeof result.current.triggerAttack).toBe("function");
    expect(typeof result.current.triggerRelease).toBe("function");
  });

  it("handles null filterEnvelope gracefully", () => {
    const mockAudioContext = {
      currentTime: 0,
    } as unknown as AudioContext;
    const mockFilterNode = {
      parameters: new Map([
        ["cutoff", { setValueAtTime: vi.fn() }],
        ["resonance", { setValueAtTime: vi.fn() }],
      ]),
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioWorkletNode;
    const mockLoudnessEnvelopeGain = {
      gain: {
        setValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        setValueCurveAtTime: vi.fn(),
        cancelAndHoldAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;
    const osc1 = {};
    const osc2 = {};
    const osc3 = {};

    const { result } = renderHook(() =>
      useEnvelopes({
        audioContext: mockAudioContext,
        filterNode: mockFilterNode,
        loudnessEnvelopeGain: mockLoudnessEnvelopeGain,
        osc1,
        osc2,
        osc3,
        filterEnvelope: null, // Test with null filterEnvelope
      })
    );

    // Should not throw when calling triggerAttack with null filterEnvelope
    expect(() => {
      result.current.triggerAttack("A4");
    }).not.toThrow();

    // Should not throw when calling triggerRelease with null filterEnvelope
    expect(() => {
      result.current.triggerRelease();
    }).not.toThrow();
  });
});
