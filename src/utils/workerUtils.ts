/**
 * Web Worker utilities for offloading heavy calculations
 */

export interface WorkerMessage {
  type: string;
  data: any;
  id?: string;
}

export interface WorkerResponse {
  type: string;
  data: any;
  id?: string;
  error?: string;
}

/**
 * Create a Web Worker for audio calculations
 */
export function createAudioWorker(): Worker | null {
  if (typeof Worker === "undefined") {
    console.warn("Web Workers not supported in this environment");
    return null;
  }

  const workerCode = `
    // Audio calculation worker
    self.onmessage = function(e) {
      const { type, data, id } = e.data;

      try {
        switch (type) {
          case 'CALCULATE_FREQUENCY':
            const { note, masterTune, detuneSemis, pitchWheel, detuneCents } = data;
            const frequency = calculateFrequency(note, masterTune, detuneSemis, pitchWheel, detuneCents);
            self.postMessage({ type: 'FREQUENCY_RESULT', data: frequency, id });
            break;

          case 'CALCULATE_VIBRATO':
            const { baseFreq, vibratoAmount } = data;
            const vibratoDepth = baseFreq * (Math.pow(2, vibratoAmount / 12) - 1);
            self.postMessage({ type: 'VIBRATO_RESULT', data: vibratoDepth, id });
            break;

          case 'CALCULATE_FILTER':
            const { cutoff, emphasis, keyboardControl, modWheel } = data;
            const filterFreq = calculateFilterFrequency(cutoff, emphasis, keyboardControl, modWheel);
            self.postMessage({ type: 'FILTER_RESULT', data: filterFreq, id });
            break;

          case 'BATCH_CALCULATIONS':
            const results = data.calculations.map(calc => {
              switch (calc.type) {
                case 'frequency':
                  return calculateFrequency(calc.note, calc.masterTune, calc.detuneSemis, calc.pitchWheel, calc.detuneCents);
                case 'vibrato':
                  return calc.baseFreq * (Math.pow(2, calc.vibratoAmount / 12) - 1);
                case 'filter':
                  return calculateFilterFrequency(calc.cutoff, calc.emphasis, calc.keyboardControl, calc.modWheel);
                default:
                  return null;
              }
            });
            self.postMessage({ type: 'BATCH_RESULT', data: results, id });
            break;

          default:
            self.postMessage({ type: 'ERROR', data: 'Unknown message type', id });
        }
      } catch (error) {
        self.postMessage({ type: 'ERROR', data: error.message, id });
      }
    };

    function calculateFrequency(note, masterTune, detuneSemis, pitchWheel, detuneCents) {
      const midiNote = noteToMidiNote(note);
      const baseFreq = midiNoteToFrequency(midiNote);
      const tuneFactor = Math.pow(2, masterTune / 12);
      const detuneFactor = Math.pow(2, detuneSemis / 12);
      const pitchFactor = Math.pow(2, (pitchWheel - 50) / 1200);
      const centsFactor = Math.pow(2, detuneCents / 1200);

      return baseFreq * tuneFactor * detuneFactor * pitchFactor * centsFactor;
    }

    function calculateFilterFrequency(cutoff, emphasis, keyboardControl, modWheel) {
      const baseFreq = cutoff;
      const emphasisFactor = 1 + (emphasis / 100);
      const keyboardFactor = 1 + (keyboardControl / 100);
      const modFactor = 1 + (modWheel / 100);

      return baseFreq * emphasisFactor * keyboardFactor * modFactor;
    }

    function noteToMidiNote(note) {
      const noteMap = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
        'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
      };

      const noteName = note.replace(/[0-9]/g, '');
      const octave = parseInt(note.replace(/[^0-9]/g, ''));

      return noteMap[noteName] + (octave + 1) * 12;
    }

    function midiNoteToFrequency(midiNote) {
      return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
  `;

  try {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    return worker;
  } catch (error) {
    console.error("Failed to create audio worker:", error);
    return null;
  }
}

/**
 * Audio calculation manager using Web Workers
 */
export class AudioCalculationManager {
  private worker: Worker | null = null;
  private callbacks: Map<string, (result: any) => void> = new Map();
  private messageId = 0;

  constructor() {
    this.worker = createAudioWorker();
    if (this.worker) {
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }
  }

  private handleWorkerMessage(e: MessageEvent<WorkerResponse>) {
    const { type, data, id, error } = e.data;

    if (error) {
      console.error("Worker error:", error);
      return;
    }

    const callback = this.callbacks.get(id);
    if (callback) {
      callback(data);
      this.callbacks.delete(id);
    }
  }

  private sendMessage(message: WorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker not available"));
        return;
      }

      const id = `msg_${this.messageId++}`;
      this.callbacks.set(id, resolve);

      this.worker.postMessage({ ...message, id });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          reject(new Error("Worker calculation timeout"));
        }
      }, 5000);
    });
  }

  /**
   * Calculate frequency with all parameters
   */
  async calculateFrequency(
    note: string,
    masterTune: number,
    detuneSemis: number,
    pitchWheel: number,
    detuneCents: number
  ): Promise<number> {
    try {
      const result = await this.sendMessage({
        type: "CALCULATE_FREQUENCY",
        data: { note, masterTune, detuneSemis, pitchWheel, detuneCents },
      });
      return result;
    } catch (error) {
      console.warn(
        "Worker calculation failed, falling back to main thread:",
        error
      );
      // Fallback to main thread calculation
      return this.calculateFrequencySync(
        note,
        masterTune,
        detuneSemis,
        pitchWheel,
        detuneCents
      );
    }
  }

  /**
   * Calculate vibrato depth
   */
  async calculateVibrato(
    baseFreq: number,
    vibratoAmount: number
  ): Promise<number> {
    try {
      const result = await this.sendMessage({
        type: "CALCULATE_VIBRATO",
        data: { baseFreq, vibratoAmount },
      });
      return result;
    } catch (error) {
      console.warn(
        "Worker calculation failed, falling back to main thread:",
        error
      );
      return baseFreq * (Math.pow(2, vibratoAmount / 12) - 1);
    }
  }

  /**
   * Calculate filter frequency
   */
  async calculateFilterFrequency(
    cutoff: number,
    emphasis: number,
    keyboardControl: number,
    modWheel: number
  ): Promise<number> {
    try {
      const result = await this.sendMessage({
        type: "CALCULATE_FILTER",
        data: { cutoff, emphasis, keyboardControl, modWheel },
      });
      return result;
    } catch (error) {
      console.warn(
        "Worker calculation failed, falling back to main thread:",
        error
      );
      return this.calculateFilterFrequencySync(
        cutoff,
        emphasis,
        keyboardControl,
        modWheel
      );
    }
  }

  /**
   * Batch multiple calculations
   */
  async batchCalculations(
    calculations: Array<{
      type: "frequency" | "vibrato" | "filter";
      data: any;
    }>
  ): Promise<any[]> {
    try {
      const result = await this.sendMessage({
        type: "BATCH_CALCULATIONS",
        data: { calculations },
      });
      return result;
    } catch (error) {
      console.warn(
        "Worker batch calculation failed, falling back to main thread:",
        error
      );
      return calculations.map((calc) => {
        switch (calc.type) {
          case "frequency":
            return this.calculateFrequencySync(
              calc.data.note,
              calc.data.masterTune,
              calc.data.detuneSemis,
              calc.data.pitchWheel,
              calc.data.detuneCents
            );
          case "vibrato":
            return (
              calc.data.baseFreq *
              (Math.pow(2, calc.data.vibratoAmount / 12) - 1)
            );
          case "filter":
            return this.calculateFilterFrequencySync(
              calc.data.cutoff,
              calc.data.emphasis,
              calc.data.keyboardControl,
              calc.data.modWheel
            );
          default:
            return null;
        }
      });
    }
  }

  // Fallback synchronous calculations
  private calculateFrequencySync(
    note: string,
    masterTune: number,
    detuneSemis: number,
    pitchWheel: number,
    detuneCents: number
  ): number {
    const midiNote = this.noteToMidiNote(note);
    const baseFreq = this.midiNoteToFrequency(midiNote);
    const tuneFactor = Math.pow(2, masterTune / 12);
    const detuneFactor = Math.pow(2, detuneSemis / 12);
    const pitchFactor = Math.pow(2, (pitchWheel - 50) / 1200);
    const centsFactor = Math.pow(2, detuneCents / 1200);

    return baseFreq * tuneFactor * detuneFactor * pitchFactor * centsFactor;
  }

  private calculateFilterFrequencySync(
    cutoff: number,
    emphasis: number,
    keyboardControl: number,
    modWheel: number
  ): number {
    const baseFreq = cutoff;
    const emphasisFactor = 1 + emphasis / 100;
    const keyboardFactor = 1 + keyboardControl / 100;
    const modFactor = 1 + modWheel / 100;

    return baseFreq * emphasisFactor * keyboardFactor * modFactor;
  }

  private noteToMidiNote(note: string): number {
    const noteMap: Record<string, number> = {
      C: 0,
      "C#": 1,
      D: 2,
      "D#": 3,
      E: 4,
      F: 5,
      "F#": 6,
      G: 7,
      "G#": 8,
      A: 9,
      "A#": 10,
      B: 11,
    };

    const noteName = note.replace(/[0-9]/g, "");
    const octave = parseInt(note.replace(/[^0-9]/g, ""));

    return noteMap[noteName] + (octave + 1) * 12;
  }

  private midiNoteToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Clean up the worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.callbacks.clear();
  }
}

// Global instance
let globalCalculationManager: AudioCalculationManager | null = null;

/**
 * Get the global calculation manager instance
 */
export function getCalculationManager(): AudioCalculationManager {
  if (!globalCalculationManager) {
    globalCalculationManager = new AudioCalculationManager();
  }
  return globalCalculationManager;
}

/**
 * Clean up the global calculation manager
 */
export function cleanupCalculationManager(): void {
  if (globalCalculationManager) {
    globalCalculationManager.destroy();
    globalCalculationManager = null;
  }
}
