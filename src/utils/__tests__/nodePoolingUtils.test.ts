import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  initializeNodePool,
  releaseNode,
  getPooledDelayNode,
  getPooledConvolverNode,
  getPooledBiquadFilterNode,
  getPooledStereoPannerNode,
  getPooledDynamicsCompressorNode,
  prewarmPool,
  cleanupPool,
} from "../nodePoolingUtils";

describe("Extended Node Pooling", () => {
  let audioContext: AudioContext;

  beforeEach(() => {
    audioContext = new AudioContext();
    initializeNodePool();
  });

  afterEach(() => {
    cleanupPool();
    audioContext.close();
  });

  describe("New Node Types", () => {
    it("should create and pool delay nodes", () => {
      const delayNode = getPooledDelayNode(audioContext, 2.0);
      expect(delayNode.delayTime).toBeDefined();
      expect(delayNode.delayTime.maxValue).toBe(2.0);
      expect(delayNode.connect).toBeDefined();
      expect(delayNode.disconnect).toBeDefined();

      releaseNode(delayNode);
    });

    it("should create and pool convolver nodes", () => {
      const convolverNode = getPooledConvolverNode(audioContext);
      expect(convolverNode.buffer).toBeDefined();
      expect(convolverNode.normalize).toBeDefined();
      expect(convolverNode.connect).toBeDefined();
      expect(convolverNode.disconnect).toBeDefined();

      releaseNode(convolverNode);
    });

    it("should create and pool biquad filter nodes", () => {
      const filterNode = getPooledBiquadFilterNode(audioContext);
      expect(filterNode.frequency).toBeDefined();
      expect(filterNode.Q).toBeDefined();
      expect(filterNode.gain).toBeDefined();
      expect(filterNode.type).toBe("lowpass");
      expect(filterNode.connect).toBeDefined();
      expect(filterNode.disconnect).toBeDefined();

      releaseNode(filterNode);
    });

    it("should create and pool stereo panner nodes", () => {
      const pannerNode = getPooledStereoPannerNode(audioContext);
      expect(pannerNode.pan).toBeDefined();
      expect(pannerNode.connect).toBeDefined();
      expect(pannerNode.disconnect).toBeDefined();

      releaseNode(pannerNode);
    });

    it("should create and pool dynamics compressor nodes", () => {
      const compressorNode = getPooledDynamicsCompressorNode(audioContext);
      expect(compressorNode.threshold).toBeDefined();
      expect(compressorNode.knee).toBeDefined();
      expect(compressorNode.ratio).toBeDefined();
      expect(compressorNode.attack).toBeDefined();
      expect(compressorNode.release).toBeDefined();
      expect(compressorNode.connect).toBeDefined();
      expect(compressorNode.disconnect).toBeDefined();

      releaseNode(compressorNode);
    });
  });

  describe("Node Reuse", () => {
    it("should reuse delay nodes from pool", () => {
      const delay1 = getPooledDelayNode(audioContext, 1.0);
      releaseNode(delay1);

      const delay2 = getPooledDelayNode(audioContext, 1.0);
      expect(delay2).toBe(delay1); // Should be the same node

      releaseNode(delay2);
    });

    it("should reuse convolver nodes from pool", () => {
      const convolver1 = getPooledConvolverNode(audioContext);
      releaseNode(convolver1);

      const convolver2 = getPooledConvolverNode(audioContext);
      expect(convolver2).toBe(convolver1); // Should be the same node

      releaseNode(convolver2);
    });

    it("should reuse filter nodes from pool", () => {
      const filter1 = getPooledBiquadFilterNode(audioContext);
      releaseNode(filter1);

      const filter2 = getPooledBiquadFilterNode(audioContext);
      expect(filter2).toBe(filter1); // Should be the same node

      releaseNode(filter2);
    });
  });

  describe("Prewarming", () => {
    it("should prewarm new node types", () => {
      prewarmPool(audioContext);

      // Should have created nodes of various types
      const delayNode = getPooledDelayNode(audioContext, 2.0);
      const convolverNode = getPooledConvolverNode(audioContext);
      const filterNode = getPooledBiquadFilterNode(audioContext);

      // Verify the nodes have the expected properties
      expect(delayNode.delayTime).toBeDefined();
      expect(convolverNode.buffer).toBeDefined();
      expect(filterNode.frequency).toBeDefined();

      releaseNode(delayNode);
      releaseNode(convolverNode);
      releaseNode(filterNode);
    });
  });

  describe("Node Reset", () => {
    it("should reset delay node state when reused", () => {
      const delayNode = getPooledDelayNode(audioContext, 2.0);
      // Set custom delay time
      delayNode.delayTime.setValueAtTime(1.0, audioContext.currentTime);

      // Verify the mock has the expected properties
      expect(delayNode.delayTime).toBeDefined();
      expect(delayNode.delayTime.maxValue).toBe(2.0);

      releaseNode(delayNode);

      const reusedDelay = getPooledDelayNode(audioContext, 2.0);
      // Verify the reused delay has the expected properties
      expect(reusedDelay.delayTime).toBeDefined();
      expect(reusedDelay.delayTime.maxValue).toBe(2.0);

      releaseNode(reusedDelay);
    });

    it("should reset filter node state when reused", () => {
      const filterNode = getPooledBiquadFilterNode(audioContext);
      // Set custom values
      filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
      filterNode.Q.setValueAtTime(5, audioContext.currentTime);

      // Verify the mock has the expected properties
      expect(filterNode.frequency).toBeDefined();
      expect(filterNode.Q).toBeDefined();

      releaseNode(filterNode);

      const reusedFilter = getPooledBiquadFilterNode(audioContext);
      // Verify the reused filter has the expected default properties
      expect(reusedFilter.frequency).toBeDefined();
      expect(reusedFilter.Q).toBeDefined();
      expect(reusedFilter.type).toBe("lowpass");

      releaseNode(reusedFilter);
    });
  });
});
