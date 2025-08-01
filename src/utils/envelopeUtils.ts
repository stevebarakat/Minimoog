/**
 * Schedule an envelope attack and decay (ADSR) on an AudioParam.
 * @param param - The AudioParam to automate
 * @param options - Envelope options
 *   start: starting value
 *   peak: peak value after attack
 *   sustain: sustain value after decay
 *   attackTime: time to reach peak
 *   decayTime: time to reach sustain
 *   now: current audio context time
 */
export function scheduleEnvelopeAttack(
  param: AudioParam,
  {
    start,
    peak,
    sustain,
    attackTime,
    decayTime,
    now,
  }: {
    start: number;
    peak: number;
    sustain: number;
    attackTime: number;
    decayTime: number;
    now: number;
  }
) {
  param.cancelScheduledValues(now);
  param.setValueAtTime(start, now);
  param.linearRampToValueAtTime(peak, now + attackTime);
  param.linearRampToValueAtTime(sustain, now + attackTime + decayTime);
}

/**
 * Schedule an envelope release on an AudioParam.
 * @param param - The AudioParam to automate
 * @param options - Envelope options
 *   from: current value
 *   to: target value (usually 0)
 *   releaseTime: time to reach target
 *   now: current audio context time
 */
export function scheduleEnvelopeRelease(
  param: AudioParam,
  {
    from,
    to,
    releaseTime,
    now,
  }: {
    from: number;
    to: number;
    releaseTime: number;
    now: number;
  }
) {
  param.cancelScheduledValues(now);
  param.setValueAtTime(from, now);
  param.linearRampToValueAtTime(to, now + releaseTime);
}
