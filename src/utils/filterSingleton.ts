import { logger } from "@/utils/core";

type FilterInstance = {
  node: AudioWorkletNode | BiquadFilterNode | null;
  audioContext: AudioContext | null;
  isInitialized: boolean;
};

class FilterSingleton {
  private static instance: FilterSingleton | null = null;
  private filterInstance: FilterInstance = {
    node: null,
    audioContext: null,
    isInitialized: false,
  };

  private constructor() {}

  static getInstance(): FilterSingleton {
    if (!FilterSingleton.instance) {
      FilterSingleton.instance = new FilterSingleton();
    }
    return FilterSingleton.instance;
  }

  async getFilter(
    audioContext: AudioContext
  ): Promise<AudioWorkletNode | BiquadFilterNode | null> {
    // If we already have a filter for this audio context, return it
    if (
      this.filterInstance.node &&
      this.filterInstance.audioContext === audioContext &&
      this.filterInstance.isInitialized
    ) {
      return this.filterInstance.node;
    }

    // Clean up existing filter if audio context changed
    if (
      this.filterInstance.node &&
      this.filterInstance.audioContext !== audioContext
    ) {
      this.dispose();
    }

    // Create new filter
    try {
      const workletNode = await this.createHuovilainenFilter(audioContext);
      this.filterInstance = {
        node: workletNode,
        audioContext,
        isInitialized: true,
      };
      return workletNode;
    } catch (error) {
      logger.error("Failed to create filter node:", error);
      return null;
    }
  }

  private async createHuovilainenFilter(
    ctx: AudioContext
  ): Promise<AudioWorkletNode> {
    const processorUrl =
      "/audio/moog-filters/huovilainen/huovilainen-worklet-processor-optimized.js";
    const wasmUrl =
      "/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm";
    const processorName = "huovilainen-worklet-processor-optimized";

    logger.info(`Loading AudioWorklet processor: ${processorUrl}`);
    await ctx.audioWorklet.addModule(processorUrl);
    logger.info(`Successfully loaded processor: ${processorName}`);

    logger.info(`Loading WASM module: ${wasmUrl}`);
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to load WASM module: ${response.statusText}`);
    }

    const wasmBuffer = await response.arrayBuffer();
    logger.info(
      `Successfully loaded WASM module, size: ${wasmBuffer.byteLength} bytes`
    );

    logger.info(`Creating AudioWorkletNode: ${processorName}`);
    const workletNode = new AudioWorkletNode(ctx, processorName, {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    });

    workletNode.port.onmessage = (e) => {
      if (e.data && e.data.error) {
        logger.error(`Worklet error: ${e.data.error}`, e.data.details);
        throw new Error(`Worklet error: ${e.data.error} - ${e.data.details}`);
      }
    };

    workletNode.port.postMessage(wasmBuffer);

    return workletNode;
  }

  dispose(): void {
    if (this.filterInstance.node) {
      try {
        this.filterInstance.node.disconnect();
        // Send cleanup message to worklet (only for AudioWorkletNode)
        if (
          this.filterInstance.node instanceof AudioWorkletNode &&
          this.filterInstance.node.port
        ) {
          this.filterInstance.node.port.postMessage({ type: "cleanup" });
        }
      } catch (error) {
        logger.warn("Error cleaning up filter node:", error);
      }
    }

    this.filterInstance = {
      node: null,
      audioContext: null,
      isInitialized: false,
    };
  }

  isReady(): boolean {
    return (
      this.filterInstance.isInitialized && this.filterInstance.node !== null
    );
  }
}

export const filterSingleton = FilterSingleton.getInstance();
