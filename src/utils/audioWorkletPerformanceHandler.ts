import { recordWorkletPerformance } from "./audioWorkletOptimization";

/**
 * Handler for AudioWorklet performance metrics
 * This bridges the gap between AudioWorklets and our optimization system
 */
export class AudioWorkletPerformanceHandler {
  private static instance: AudioWorkletPerformanceHandler | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AudioWorkletPerformanceHandler {
    if (!AudioWorkletPerformanceHandler.instance) {
      AudioWorkletPerformanceHandler.instance =
        new AudioWorkletPerformanceHandler();
    }
    return AudioWorkletPerformanceHandler.instance;
  }

  /**
   * Initialize the performance handler
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Set up message handling for AudioWorklets
    this.setupMessageHandling();

    this.isInitialized = true;
  }

  /**
   * Set up message handling for AudioWorklets
   */
  private setupMessageHandling(): void {
    // Listen for messages from AudioWorklets
    if (typeof window !== "undefined") {
      // This will be called when AudioWorklets send performance metrics
      window.addEventListener("message", this.handleWorkletMessage.bind(this));
    }
  }

  /**
   * Handle messages from AudioWorklets
   */
  private handleWorkletMessage(event: MessageEvent): void {
    // Check if this is a performance metrics message from an AudioWorklet
    if (event.data && event.data.type === "performance-metrics") {
      this.processWorkletPerformanceMetrics(event.data);
    }
  }

  /**
   * Process performance metrics from AudioWorklets
   */
  private processWorkletPerformanceMetrics(metrics: {
    workletId: string;
    processingTimeUs: number;
    cpuUsage: number;
    memoryUsage: number;
    parameterUpdates: number;
    underruns: number;
  }): void {
    try {
      // Forward metrics to our optimization system
      recordWorkletPerformance(
        metrics.workletId,
        metrics.processingTimeUs,
        metrics.cpuUsage,
        metrics.memoryUsage,
        metrics.parameterUpdates,
        metrics.underruns
      );
    } catch (error) {
      console.warn(
        "[AudioWorkletPerformanceHandler] Failed to process metrics:",
        error
      );
    }
  }

  /**
   * Handle performance metrics from a specific AudioWorklet
   * This can be called directly from AudioWorklet code
   */
  handleDirectMetrics(metrics: {
    workletId: string;
    processingTimeUs: number;
    cpuUsage: number;
    memoryUsage: number;
    parameterUpdates: number;
    underruns: number;
  }): void {
    this.processWorkletPerformanceMetrics(metrics);
  }

  /**
   * Get handler status
   */
  getStatus(): { isInitialized: boolean } {
    return { isInitialized: this.isInitialized };
  }
}

/**
 * Initialize the AudioWorklet performance handler
 */
export function initializeAudioWorkletPerformanceHandler(): AudioWorkletPerformanceHandler {
  const handler = AudioWorkletPerformanceHandler.getInstance();
  handler.initialize();
  return handler;
}

/**
 * Get the AudioWorklet performance handler instance
 */
export function getAudioWorkletPerformanceHandler(): AudioWorkletPerformanceHandler | null {
  return AudioWorkletPerformanceHandler.getInstance();
}

/**
 * Handle performance metrics directly (for use in AudioWorklets)
 */
export function handleWorkletPerformanceMetrics(metrics: {
  workletId: string;
  processingTimeUs: number;
  cpuUsage: number;
  memoryUsage: number;
  parameterUpdates: number;
  underruns: number;
}): void {
  const handler = getAudioWorkletPerformanceHandler();
  if (handler) {
    handler.handleDirectMetrics(metrics);
  }
}
