import {
  SynthState,
  OscillatorWaveform,
  OscillatorRange,
} from "@/store/types/synth";

// Function to save synth state to URL parameters
export function saveStateToURL(state: SynthState): string {
  const params = new URLSearchParams();

  // Save oscillator settings
  params.set("osc1_waveform", state.oscillator1.waveform);
  params.set("osc1_freq", state.oscillator1.frequency.toString());
  params.set("osc1_range", state.oscillator1.range);
  params.set("osc1_enabled", state.oscillator1.enabled.toString());

  params.set("osc2_waveform", state.oscillator2.waveform);
  params.set("osc2_freq", state.oscillator2.frequency.toString());
  params.set("osc2_range", state.oscillator2.range);
  params.set("osc2_enabled", state.oscillator2.enabled.toString());

  params.set("osc3_waveform", state.oscillator3.waveform);
  params.set("osc3_freq", state.oscillator3.frequency.toString());
  params.set("osc3_range", state.oscillator3.range);
  params.set("osc3_enabled", state.oscillator3.enabled.toString());

  // Save mixer settings
  params.set("mix_osc1_enabled", state.mixer.osc1.enabled.toString());
  params.set("mix_osc1_vol", state.mixer.osc1.volume.toString());
  params.set("mix_osc2_enabled", state.mixer.osc2.enabled.toString());
  params.set("mix_osc2_vol", state.mixer.osc2.volume.toString());
  params.set("mix_osc3_enabled", state.mixer.osc3.enabled.toString());
  params.set("mix_osc3_vol", state.mixer.osc3.volume.toString());
  params.set("mix_noise_enabled", state.mixer.noise.enabled.toString());
  params.set("mix_noise_vol", state.mixer.noise.volume.toString());
  params.set("mix_noise_type", state.mixer.noise.noiseType);
  params.set("mix_ext_enabled", state.mixer.external.enabled.toString());
  params.set("mix_ext_vol", state.mixer.external.volume.toString());
  params.set("mix_ext_overload", state.mixer.external.overload.toString());

  // Save filter settings
  params.set("filter_cutoff", state.filterCutoff.toString());
  params.set("filter_emphasis", state.filterEmphasis.toString());
  params.set("filter_contour", state.filterContourAmount.toString());
  params.set("filter_attack", state.filterAttack.toString());
  params.set("filter_decay", state.filterDecay.toString());
  params.set("filter_sustain", state.filterSustain.toString());
  params.set("filter_mod_on", state.filterModulationOn.toString());

  // Save loudness envelope
  params.set("loudness_attack", state.loudnessAttack.toString());
  params.set("loudness_decay", state.loudnessDecay.toString());
  params.set("loudness_sustain", state.loudnessSustain.toString());

  // Save modulation settings
  params.set("lfo_waveform", state.lfoWaveform);
  params.set("lfo_rate", state.lfoRate.toString());
  params.set("mod_mix", state.modMix.toString());
  params.set("osc_mod_on", state.oscillatorModulationOn.toString());

  // Save other settings
  params.set("glide_on", state.glideOn.toString());
  params.set("glide_time", state.glideTime.toString());
  params.set("main_volume", state.mainVolume.toString());
  params.set("main_active", state.isMainActive.toString());
  params.set("keyboard_control1", state.keyboardControl1.toString());
  params.set("keyboard_control2", state.keyboardControl2.toString());
  params.set("osc3_control", state.osc3Control.toString());
  params.set("osc3_filter_eg", state.osc3FilterEgSwitch.toString());
  params.set("noise_lfo_switch", state.noiseLfoSwitch.toString());
  params.set("decay_switch", state.decaySwitchOn.toString());
  params.set("master_tune", state.masterTune.toString());
  params.set("pitch_wheel", state.pitchWheel.toString());
  params.set("mod_wheel", state.modWheel.toString());
  params.set("tuner_on", state.tunerOn.toString());

  // Save aux output settings
  params.set("aux_enabled", state.auxOutput.enabled.toString());
  params.set("aux_volume", state.auxOutput.volume.toString());

  return params.toString();
}

// Function to load synth state from URL parameters
export function loadStateFromURL(): Partial<SynthState> | null {
  const params = new URLSearchParams(window.location.search);

  if (params.toString() === "") {
    return null;
  }

  const state: Partial<SynthState> = {};

  // Load oscillator settings
  if (params.has("osc1_waveform")) {
    state.oscillator1 = {
      waveform: params.get("osc1_waveform") as OscillatorWaveform,
      frequency: parseFloat(params.get("osc1_freq") || "440"),
      range: params.get("osc1_range") as OscillatorRange,
      enabled: params.get("osc1_enabled") === "true",
    };
  }

  if (params.has("osc2_waveform")) {
    state.oscillator2 = {
      waveform: params.get("osc2_waveform") as OscillatorWaveform,
      frequency: parseFloat(params.get("osc2_freq") || "0"),
      range: params.get("osc2_range") as OscillatorRange,
      enabled: params.get("osc2_enabled") === "true",
    };
  }

  if (params.has("osc3_waveform")) {
    state.oscillator3 = {
      waveform: params.get("osc3_waveform") as OscillatorWaveform,
      frequency: parseFloat(params.get("osc3_freq") || "0"),
      range: params.get("osc3_range") as OscillatorRange,
      enabled: params.get("osc3_enabled") === "true",
    };
  }

  // Load mixer settings
  if (params.has("mix_osc1_enabled")) {
    state.mixer = {
      osc1: {
        enabled: params.get("mix_osc1_enabled") === "true",
        volume: parseFloat(params.get("mix_osc1_vol") || "0"),
      },
      osc2: {
        enabled: params.get("mix_osc2_enabled") === "true",
        volume: parseFloat(params.get("mix_osc2_vol") || "0"),
      },
      osc3: {
        enabled: params.get("mix_osc3_enabled") === "true",
        volume: parseFloat(params.get("mix_osc3_vol") || "0"),
      },
      noise: {
        enabled: params.get("mix_noise_enabled") === "true",
        volume: parseFloat(params.get("mix_noise_vol") || "0"),
        noiseType:
          (params.get("mix_noise_type") as "white" | "pink") || "white",
      },
      external: {
        enabled: params.get("mix_ext_enabled") === "true",
        volume: parseFloat(params.get("mix_ext_vol") || "0"),
        overload: params.get("mix_ext_overload") === "true",
      },
    };
  }

  // Load filter settings
  if (params.has("filter_cutoff")) {
    const loadedCutoff = parseFloat(params.get("filter_cutoff") || "0");
    // Clamp the loaded value to -4 to 4 range to prevent out-of-range values
    state.filterCutoff = Math.max(-4, Math.min(4, loadedCutoff));
    state.filterEmphasis = parseFloat(params.get("filter_emphasis") || "5");
    state.filterContourAmount = parseFloat(params.get("filter_contour") || "5");
    state.filterAttack = parseFloat(params.get("filter_attack") || "0.5");
    state.filterDecay = parseFloat(params.get("filter_decay") || "0");
    state.filterSustain = parseFloat(params.get("filter_sustain") || "0");
    state.filterModulationOn = params.get("filter_mod_on") === "true";
  }

  // Load loudness envelope
  if (params.has("loudness_attack")) {
    state.loudnessAttack = parseFloat(params.get("loudness_attack") || "0.5");
    state.loudnessDecay = parseFloat(params.get("loudness_decay") || "0");
    state.loudnessSustain = parseFloat(params.get("loudness_sustain") || "5");
  }

  // Load modulation settings
  if (params.has("lfo_waveform")) {
    state.lfoWaveform = params.get("lfo_waveform") as "triangle" | "square";
    state.lfoRate = parseFloat(params.get("lfo_rate") || "5");
    state.modMix = parseFloat(params.get("mod_mix") || "0");
    state.oscillatorModulationOn = params.get("osc_mod_on") === "true";
  }

  // Load other settings
  if (params.has("glide_on")) {
    state.glideOn = params.get("glide_on") === "true";
    state.glideTime = parseFloat(params.get("glide_time") || "0.1");
  }

  if (params.has("main_volume")) {
    state.mainVolume = parseFloat(params.get("main_volume") || "2.5");
    state.isMainActive = params.get("main_active") === "true";
  }

  if (params.has("keyboard_control1")) {
    state.keyboardControl1 = params.get("keyboard_control1") === "true";
    state.keyboardControl2 = params.get("keyboard_control2") === "true";
  }

  if (params.has("osc3_control")) {
    state.osc3Control = params.get("osc3_control") === "true";
    state.osc3FilterEgSwitch = params.get("osc3_filter_eg") === "true";
  }

  if (params.has("noise_lfo_switch")) {
    state.noiseLfoSwitch = params.get("noise_lfo_switch") === "true";
    state.decaySwitchOn = params.get("decay_switch") === "true";
  }

  if (params.has("master_tune")) {
    state.masterTune = parseFloat(params.get("master_tune") || "0");
    state.pitchWheel = parseFloat(params.get("pitch_wheel") || "50");
    state.modWheel = parseFloat(params.get("mod_wheel") || "50");
  }

  if (params.has("tuner_on")) {
    state.tunerOn = params.get("tuner_on") === "true";
  }

  // Load aux output settings
  if (params.has("aux_enabled")) {
    state.auxOutput = {
      enabled: params.get("aux_enabled") === "true",
      volume: parseFloat(params.get("aux_volume") || "0"),
    };
  }

  return state;
}

// Function to update URL with current state
export function updateURLWithState(state: SynthState): void {
  const params = saveStateToURL(state);
  const newURL = `${window.location.pathname}?${params}`;
  window.history.replaceState({}, "", newURL);
}

// Function to copy current URL to clipboard
export function copyURLToClipboard(state: SynthState): Promise<void> {
  const params = saveStateToURL(state);
  const url = `${window.location.origin}${window.location.pathname}?${params}`;
  return navigator.clipboard.writeText(url);
}
