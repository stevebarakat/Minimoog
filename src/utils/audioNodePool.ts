// Simple AudioNode Pool for Oscillators and GainNodes
// This helps reduce GC churn and CPU spikes from frequent node creation/destruction

export type NodeType = "oscillator" | "gain";

interface AudioNodePool {
  [key: string]: AudioNode[];
}

const pool: AudioNodePool = {
  oscillator: [],
  gain: [],
};

export function getPooledNode(
  type: NodeType,
  audioContext: AudioContext
): AudioNode {
  if (pool[type].length > 0) {
    const node = pool[type].pop()!;
    // Reset node state if needed
    if (type === "oscillator") {
      (node as OscillatorNode).disconnect();
      (node as OscillatorNode).frequency.setValueAtTime(
        440,
        audioContext.currentTime
      );
      (node as OscillatorNode).type = "sine";
    } else if (type === "gain") {
      (node as GainNode).disconnect();
      (node as GainNode).gain.setValueAtTime(1, audioContext.currentTime);
    }
    return node;
  }
  // Create new if pool is empty
  if (type === "oscillator") {
    return audioContext.createOscillator();
  } else if (type === "gain") {
    return audioContext.createGain();
  }
  throw new Error(`Unknown node type: ${type}`);
}

export function releaseNode(type: NodeType, node: AudioNode) {
  // Stop oscillator if needed
  if (type === "oscillator") {
    try {
      (node as OscillatorNode).stop();
    } catch {
      // Node may already be stopped or not started; safe to ignore
    }
  }
  node.disconnect();
  pool[type].push(node);
}
