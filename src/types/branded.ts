// Branded types for type safety across the application
// These ensure type safety for numeric values with specific ranges

export type FrequencyRange = number & { readonly __brand: "FrequencyRange" };
export type VolumeRange = number & { readonly __brand: "VolumeRange" };
export type FilterCutoffRange = number & {
  readonly __brand: "FilterCutoffRange";
};
export type FilterEmphasisRange = number & {
  readonly __brand: "FilterEmphasisRange";
};
export type FilterContourRange = number & {
  readonly __brand: "FilterContourRange";
};
export type LfoRateRange = number & { readonly __brand: "LfoRateRange" };
export type ModMixRange = number & { readonly __brand: "ModMixRange" };
export type PitchWheelRange = number & { readonly __brand: "PitchWheelRange" };
export type ModWheelRange = number & { readonly __brand: "ModWheelRange" };
export type MasterTuneRange = number & { readonly __brand: "MasterTuneRange" };
export type FilterEnvelopeRange = number & {
  readonly __brand: "FilterEnvelopeRange";
};
export type GlideTimeRange = number & { readonly __brand: "GlideTimeRange" };
export type ExternalInputVolumeRange = number & {
  readonly __brand: "ExternalInputVolumeRange";
};
export type NoiseVolumeRange = number & {
  readonly __brand: "NoiseVolumeRange";
};
export type OctaveRange = number & { readonly __brand: "OctaveRange" };

// Utility functions to safely create branded types
export const createFrequencyRange = (value: number): FrequencyRange => {
  if (value < -12 || value > 12)
    throw new Error(`Frequency must be between -12 and 12, got ${value}`);
  return value as FrequencyRange;
};

export const createVolumeRange = (value: number): VolumeRange => {
  if (value < 0 || value > 10)
    throw new Error(`Volume must be between 0 and 10, got ${value}`);
  return value as VolumeRange;
};

export const createFilterCutoffRange = (value: number): FilterCutoffRange => {
  if (value < -5 || value > 5)
    throw new Error(`Filter cutoff must be between -5 and 5, got ${value}`);
  return value as FilterCutoffRange;
};

export const createFilterEmphasisRange = (
  value: number
): FilterEmphasisRange => {
  if (value < 0 || value > 10)
    throw new Error(`Filter emphasis must be between 0 and 10, got ${value}`);
  return value as FilterEmphasisRange;
};

export const createPitchWheelRange = (value: number): PitchWheelRange => {
  if (value < 0 || value > 100)
    throw new Error(`Pitch wheel must be between 0 and 100, got ${value}`);
  return value as PitchWheelRange;
};

export const createModWheelRange = (value: number): ModWheelRange => {
  if (value < 0 || value > 100)
    throw new Error(`Mod wheel must be between 0 and 100, got ${value}`);
  return value as ModWheelRange;
};

export const createMasterTuneRange = (value: number): MasterTuneRange => {
  if (value < -12 || value > 12)
    throw new Error(`Master tune must be between -12 and 12, got ${value}`);
  return value as MasterTuneRange;
};

export const createFilterContourRange = (value: number): FilterContourRange => {
  if (value < 0 || value > 10)
    throw new Error(`Filter contour must be between 0 and 10, got ${value}`);
  return value as FilterContourRange;
};

export const createFilterEnvelopeRange = (
  value: number
): FilterEnvelopeRange => {
  if (value < 0 || value > 10)
    throw new Error(`Filter envelope must be between 0 and 10, got ${value}`);
  return value as FilterEnvelopeRange;
};

export const createLfoRateRange = (value: number): LfoRateRange => {
  if (value < 0 || value > 10)
    throw new Error(`LFO rate must be between 0 and 10, got ${value}`);
  return value as LfoRateRange;
};

export const createModMixRange = (value: number): ModMixRange => {
  if (value < 0 || value > 10)
    throw new Error(`Mod mix must be between 0 and 10, got ${value}`);
  return value as ModMixRange;
};

export const createGlideTimeRange = (value: number): GlideTimeRange => {
  if (value < 0 || value > 10)
    throw new Error(`Glide time must be between 0 and 10, got ${value}`);
  return value as GlideTimeRange;
};

export const createExternalInputVolumeRange = (
  value: number
): ExternalInputVolumeRange => {
  if (value < 0 || value > 10)
    throw new Error(
      `External input volume must be between 0 and 10, got ${value}`
    );
  return value as ExternalInputVolumeRange;
};

export const createNoiseVolumeRange = (value: number): NoiseVolumeRange => {
  if (value < 0 || value > 10)
    throw new Error(`Noise volume must be between 0 and 10, got ${value}`);
  return value as NoiseVolumeRange;
};

export const createOctaveRange = (value: number): OctaveRange => {
  if (value < 0 || value > 3)
    throw new Error(`Octave range must be between 0 and 3, got ${value}`);
  return value as OctaveRange;
};
