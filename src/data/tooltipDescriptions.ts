// Tooltip descriptions for learning mode
export const TOOLTIP_DESCRIPTIONS = {
  // Oscillator controls
  "oscillator-1-range":
    "<h3>RANGE KNOB</h3>The RANGE knob selects the fundamental octave for each oscillator over a five-octave range. A sixth LO setting brings the pitch down even further, allowing the Oscillator to be used for other purposes, such as a modulation source.",
  "oscillator-1-waveform":
    "<h3>WAVEFORM</h3>Each of the three Oscillators provides six distinct Waveform shapes. Each waveform has a unique harmonic content that is based on the number and strength of harmonic overtones that it contains. These overtones are what impart a particular timbre to the Oscillator.",
  "oscillator-1-volume": "Volume for oscillator 1.",
  "oscillator-2-volume": "Volume for oscillator 2.",
  "oscillator-3-volume": "Volume for oscillator 3.",
  "oscillator-3-range": "This oscillator can double as an LFO for modulation.",
  "oscillator-3-control":
    "<h3>OSC. 3 CONTROL</h3>Oscillator–3 is unique. Normally, all Oscillators are controlled directly from the keyboard and Pitch wheel. Turning this switch OFF releases OSCILLATOR–3 from keyboard control, providing a greater range of frequency control and allowing it to run free as a modulation source.",

  "oscillator-2-frequency":
    "<h3>FREQUENCY</h3>Oscillator–2 and Oscillator–3 are each equipped with a <b>FREQUENCY</b> knob that can be used to detune the Oscillator from the pitch of Oscillator–1. Slight amounts of detuning can create a rich, chorusing effect. Tuning the Oscillators to an interval (Perfect Fifth above, Perfect Fourth below, etc.) provides a powerful voice for playing lead passages or creating chords.",

  // Additional oscillator controls
  "oscillator-1": "Toggle oscillator 1 on or off.",
  "oscillator-2": "Toggle oscillator 2 on or off.",
  "oscillator-3": "Toggle oscillator 3 on or off.",
  "osc-3-filter-eg":
    "<h3>OSC. 3/FILTER EG SWITCH</h3><p>This switch is used to choose the modulation source that will be assigned to the counterclockwise position of the <b>MODULATION MIX</b> knob. Originally, this modulation source was fixed to <b>OSC. 3</b>, but this updated reissue allows <b>FILTER EG</b> to be selected as well. </p><p>In the <b>FILTER EG</b> position, the shape defined by the <b>ATTACK TIME</b>, <b>DECAY TIME</b>, and <b>SUSTAIN LEVEL</b> knobs of the Filter Contour are used as a modulation source. Filter EG is an ideal modulation source for creating analog brass and percussion sounds.</p> ",

  "noise-lfo":
    "<h3>NOISE/LFO SWITCH</h3><p>This switch is used to choose the modulation source that will be assigned to the clockwise position of the <b>MODULATION MIX</b> knob.</p><p>The <b>NOISE</b> switch located in the mixer selection determines what type of noise is used for modulation. <ul><li>When <b>WHITE NOISE</b> is selected, <b>Pink Noise</b> is actually the modulation source.</li><li>When <b>PINK NOISE</b> is selected, <b>Red Noise</b> is actually the modulation source.</li><li>In the <b>LFO</b> position, the additional <b>LFO</b> located on the Left-Hand Keyboard panel is used as a modulation source. This is ideal for pitch vibrato and trills when all three oscillators are in use.</li></ul></p>",

  // Filter controls
  "filter-cutoff":
    "<h3>CUTOFF FREQUENCY KNOB</h3>Minimoog is equipped with a traditional Moog Ladder Filter with 10Hz-32kHz frequency response. When a note is played: <ul><li>Harmonic content occurring above the filter Cutoff Frequency is reduced by the filter at a rate of 24dB/Octave.</li><li>Harmonic content, or sound, below the filter Cutoff Frequency will freely pass unaffected.</li></ul>",
  "filter-emphasis":
    "<h3>EMPHASIS KNOB</h3>Often referred to as resonance, the Emphasis knob takes a portion of the output of the Filter and sends it back to the input of the Filter, creating a resonance peak that occurs at the Filter’s Cutoff Frequency. By turning the Emphasis control up and lowering the Filter Cutoff Frequency, the Filter can be coaxed into a self-oscillating state, acting as a sine-wave oscillator whose pitch can be controlled or played via the keyboard by using the Keyboard Control switches defined below.",
  "filter-contour-amount":
    "<h3>AMOUNT OF CONTOUR KNOB</h3>The Amount of Contour knob determines how much of the control signal created by the Filter Contour will be applied to change the Filter Cutoff Frequency over time.",

  // Envelope controls
  "loudness-attack":
    "<h3>ATTACK TIME KNOB</h3>This knob sets the time required for the Loudness Contour Generator to raise the Volume from zero to its maximum level once a key is pressed or after a gate is received.",
  "loudness-decay":
    "<h3>DECAY TIME KNOB</h3>This knob sets the time required for the Loudness Contour Generator to lower the Volume from its maximum level achieved by the Attack stage to the Sustain Level. The Decay Time knob can also control the amount of time required for the note to completely fade out after a key is released (or after an external gate signal ends). This second function of the Decay Time knob is activated by the <b>DECAY</b> switch, located on the Left-Hand Keyboard Panel.",
  "loudness-sustain":
    "<h3>SUSTAIN LEVEL KNOB</h3>After the Attack and Decay stages have been completed, the Loudness Contour Generator will maintain the Volume level determined by the Sustain Level knob for as long as a note is held.",
  "loudness-release":
    "<h3>RELEASE TIME KNOB</h3>The Release Time knob sets the time required for the Loudness Contour Generator to lower the Volume from its maximum level achieved by the Attack stage to the Sustain Level. The Release Time knob can also control the amount of time required for the note to completely fade out after a key is released (or after an external gate signal ends). This second function of the Release Time knob is activated by the <b>RELEASE</b> switch, located on the Left-Hand Keyboard Panel.",

  "filter-attack":
    "<h3>ATTACK TIME KNOB</h3>This knob sets the time required for the Filter Contour Generator to raise the Filter’s Cutoff Frequency from its manual setting to its maximum level (determined by the Amount of Contour knob) once a key is pressed or after a gate is received.",
  "filter-decay":
    "<h3>DECAY TIME KNOB</h3>This knob sets the time required for the Filter Contour Generator to lower the Filter’s Cutoff Frequency from the level achieved by the Attack stage to the Sustain Level. It can also control the amount of time required for the Filter to return to its manual setting after the key is released (or after an external gate signal ends). This second function of the Decay Time knob is activated by the <b>DECAY</b> switch on the Left-Hand Keyboard.",
  "filter-sustain":
    "<h3>SUSTAIN LEVEL KNOB</h3>After the Attack and Decay stages have been completed, the Filter Contour Generator will hold the Filter's Cutoff Frequency at the level determined by the Sustain Level knob for as long as a note is held.",

  // Noise controls
  noise: "Toggle the noise generator on or off.",
  "noise-volume":
    "<h3>NOISE</h3>Noise can be a very desirable sound source—either alone or mixed in with other sources. It can be used to create anything from a rocket launch to the subtle breath of a flute sound.",
  "noise-switch": "Toggle the noise generator on or off.",
  "noise-type":
    "<h3>NOISE TYPE</h3>Select either WHITE or PINK noise. <ul><li>White Noise contains equal energy per frequency.</li><li>Pink Noise contains equal energy per octave of the audio spectrum, and is perceived as having more low-frequency components.</li></ul> If you think of White Noise as TV static, consider Pink Noise more as a waterfall pounding the rocks below.",

  // External input controls
  "external-input": "Toggle the external audio input on or off.",
  // External input
  "external-input-volume":
    "<h3>EXTERNAL INPUT VOLUME</h3>An external audio source can be introduced to Minimoog using the browser's <b>MICROPHONE</b> input. If you have an external audio interface, you can use it to play a guitar or other instruments through the Minimoog, using it as an effect. Once you've allowed the browser to access your microphone, you can select your audio interface in the <b>MICROPHONE</b> section of the settings page. This knob controls the volume of the external input.",

  // Output controls
  "main-volume":
    "<h3>MAIN OUTPUT VOLUME KNOB</h3>The Main Output Volume knob determines the signal level being sent to the High and Low audio outputs on the Top Patch Panel. <ul><li>The Low output signal is 30dB lower than the High level output.</li><li>The scaling of overdrive is directly related to the Main Output Volume knob. Because of this, it is ideal to keep the Main Output Volume knob at or below 6 for the most musical range.</li></ul>",
  "main-output-switch":
    "<h3>MAIN OUTPUT SWITCH</h3>This switch can quickly mute the Main Output of the instrument without having to dial the Volume down to zero and then reset it to a nominal level. Muting the Main Output allows a performer to use the Phones Output as a cue/monitor for privately tweaking settings during a live performance.",
  "aux-volume": "Controls the volume of the auxiliary output.",
  "aux-output-switch": "Turns the auxiliary output on or off.",

  // Master controls
  "master-tune":
    "<h3>TUNE</h3>The tuning of Oscillator–1 is determined by the master TUNE knob. Use this to tune the Minimoog to other instruments or recordings.",

  // Modulation controls
  "modulation-mix":
    "<h3>MODULATION MIX</h3>This knob sets the balance between the modulation sources selected using the <b>OSC. 3/FILTER EG</b> and <b>NOISE/LFO</b> switches. <ul><li>With the <b>MODULATION MIX</b> knob rotated fully counterclockwise, only the modulation source selected by the <b>OSC. 3/FILTER EG</b> switch is applied.</li><li>With the <b>MODULATION MIX</b> knob rotated fully clockwise, only the modulation source selected by the <b>NOISE/LFO</b> switch is applied.</li><li>In the center position, both selected modulation sources are applied equally.</li></ul>",
  "oscillator-modulation":
    "<h3>OSCILLATOR MODULATION</h3>When this switch is set to ON, the Oscillators can be modulated by Oscillator 3, Noise, Filter Contour, an External Mod Source, and the LFO (Low Frequency Oscillator) as defined by the CONTROLLERS settings and the Modulation Wheel position.",
  "filter-modulation":
    "<h3>FILTER MODULATION SWITCH</h3>When this switch is on, the Filter Cutoff Frequency can be modulated by the: <ul><li>Noise Generator</li><li>Filter Contour</li><li>Oscillator 3</li><li>LFO (Low Frequency Oscillator)</li></ul> The modulation source and amount are defined by the CONTROLLERS settings and the Modulation Wheel position.",
  "lfo-rate":
    "<h3>LFO RATE KNOB</h3>This knob sets the speed for the dedicated LFO (Low Frequency Oscillator) modulation source. <strong>IMPORTANT</strong>: Click to change waveform.",
  "lfo-waveform":
    "<h3>LFO WAVEFORM</h3>The LFO waveform is a sawtooth shape. The LFO can be used to create a variety of effects, such as pitch vibrato, trills, and tremolo.",

  // Glide controls
  "glide-time":
    "<h3>GLIDE KNOB</h3>The GLIDE knob determines the amount of time needed to transition from one note to the next.",
  "glide-switch":
    "<h3>GLIDE SWITCH</h3>Glide allows the pitch to change in a smooth, continuous manner as you transition from note to note, rather than instantly stepping to the new pitch. This switch turns the Glide effect on and off.",

  // Keyboard controls
  "keyboard-control":
    "<h3>KEYBOARD CONTROL (1&2) SWITCHES</h3>These switches allow the notes played on the keyboard to affect the Filter Cutoff Frequency, a process also known as <em>key tracking</em>. This allows notes played higher on the keyboard to have brighter sound.<ul><li><strong>Keyboard Control 1</strong> provides 1/3 of the total amount of available key tracking</li><li><strong>Keyboard Control 2</strong> provides 2/3 of the total amount of available key tracking</li><li>By using both switches together, the full amount of available key tracking (1/3 + 2/3 = 1) is applied, resulting in an octave change in filter cutoff per octave change played on the keyboard.</li></ul>",
  "filter-keyboard-control-1":
    "Enables keyboard tracking for the filter. Higher notes open the filter more.",
  "filter-keyboard-control-2":
    "Secondary keyboard control for additional filter tracking.",

  // Decay switch
  "decay-switch":
    "<h3>DECAY SWITCH</h3>When the <b>DECAY</b> switch is ON, the last note played will continue to sound as it fades and the Filter Cutoff Frequency will lower at the rate set using the <b>DECAY TIME</b> knobs in the MODIFIERS section",

  // Controllers
  "pitch-bend":
    "<h3>PITCH WHEEL</h3>This provides a real-time performance controller for bending the pitch of the Oscillators—in the way that a guitarist may bend a string or a sax player may bend the reed to alter the pitch of a note. The zero position for the PITCH Wheel is in the center, allowing the pitch to be bent either sharp or flat. The PITCH Wheel will go up a fifth in its maximum position and down a fifth in its minimum position.",
  "modulation-wheel":
    "<h3>MODULATION WHEEL</h3>This provides a real-time performance controller that can apply the modulation sources selected using the <b>OSC. 3/FILTER EG</b> and <b>NOISE/LFO</b> switches, using the mix determined by the <b>MODULATION MIX</b> knob. The <b>OSCILLATOR MODULATION</b> switch between the CONTROLLERS panel and the OSCILLATOR BANK must be in the ON position to apply modulation to the Oscillator pitch. The <b>FILTER MODULATION</b> switch connecting the CONTROLLER panel and the Filter must be in the ON position to apply modulation to the Filter Cutoff Frequency. The zero position for the Mod Wheel is all the way down, as illustrated.",

  // Effects controls
  reverb: "Turns the reverb effect on or off.",
  "reverb-amount": "Control the intensity of the reverb effect.",
  "reverb-tone": "Control the frequency response of the reverb effect.",
  delay: "Turns the delay effect on or off.",
  "delay-mix": "Control the balance between dry and delayed signal.",
  "delay-time": "Control the time between the original signal and its echo.",
  "delay-feedback": "Control how many times the delay repeats.",
  "aux-out-volume": "Control the volume level of the effects.",
  "aux-out-bypass": "Bypass the effects.",

  tuner:
    "<h3>A-440 TUNER SWITCH</h3>A reference tuner pitched at A-440Hz is built into Minimoog, providing a convenient way to keep all of the oscillators in tune.",

  // Default fallback
  default: undefined,
} as const;

export type TooltipKey = keyof typeof TOOLTIP_DESCRIPTIONS;

export function getTooltipDescription(key: string): string | undefined {
  return (
    TOOLTIP_DESCRIPTIONS[key as TooltipKey] || TOOLTIP_DESCRIPTIONS.default
  );
}
