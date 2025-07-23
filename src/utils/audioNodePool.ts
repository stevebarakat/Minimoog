// Simple AudioNode Pool for GainNodes only (OscillatorNodes are single-use)
// This helps reduce GC churn and CPU spikes from frequent gain node creation/destruction

export type NodeType = "oscillator" | "gain";

interface AudioNodePool {
  [key: string]: AudioNode[];
}

const pool: AudioNodePool = {
  gain: [],
};

export function getPooledNode(
  type: NodeType,
  audioContext: AudioContext
): AudioNode {
  if (type === "gain") {
    if (pool.gain.length > 0) {
      const node = pool.gain.pop()!;
      (node as GainNode).disconnect();
      (node as GainNode).gain.setValueAtTime(1, audioContext.currentTime);
      return node;
    }
    return audioContext.createGain();
  } else if (type === "oscillator") {
    // OscillatorNodes are single-use; always create new
    return audioContext.createOscillator();
  }
  throw new Error(`Unknown node type: ${type}`);
}

export function releaseNode(type: NodeType, node: AudioNode) {
  if (type === "gain") {
    node.disconnect();
    pool.gain.push(node);
  } else if (type === "oscillator") {
    try {
      (node as OscillatorNode).stop();
    } catch {
      // Node may already be stopped or not started; safe to ignore
    }
    node.disconnect();
    // Do NOT pool oscillators
  }
}
