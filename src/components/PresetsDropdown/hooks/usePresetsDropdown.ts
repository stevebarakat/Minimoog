import { useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { presets, Preset, getCategories } from "@/data/presets";
import { convertPresetToStoreFormat } from "@/utils";
import { log as logger } from "@/utils";
import { useToast } from "@/components/Toast/hooks/useToast";

export function usePresetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadPreset = useSynthStore((state) => state.loadPreset);
  const oscillator1 = useSynthStore((state) => state.oscillator1);
  const oscillator2 = useSynthStore((state) => state.oscillator2);
  const oscillator3 = useSynthStore((state) => state.oscillator3);
  const filterCutoff = useSynthStore((state) => state.filterCutoff);
  const filterEmphasis = useSynthStore((state) => state.filterEmphasis);
  const filterContourAmount = useSynthStore(
    (state) => state.filterContourAmount
  );
  const filterAttack = useSynthStore((state) => state.filterAttack);
  const filterDecay = useSynthStore((state) => state.filterDecay);
  const filterSustain = useSynthStore((state) => state.filterSustain);
  const loudnessAttack = useSynthStore((state) => state.loudnessAttack);
  const loudnessDecay = useSynthStore((state) => state.loudnessDecay);
  const loudnessSustain = useSynthStore((state) => state.loudnessSustain);
  const modMix = useSynthStore((state) => state.modMix);
  const lfoRate = useSynthStore((state) => state.lfoRate);
  const glideTime = useSynthStore((state) => state.glideTime);
  const mainVolume = useSynthStore((state) => state.mainVolume);
  const showToast = useToast();

  // Update current preset name when synth state changes
  useEffect(() => {
    // Find if current synth state matches any preset
    const matchingPreset = presets.find((preset) => {
      const presetParameters = convertPresetToStoreFormat(preset);
      // More comprehensive check for key parameters to identify the preset
      return (
        presetParameters.oscillator1?.waveform === oscillator1.waveform &&
        presetParameters.oscillator1?.frequency === oscillator1.frequency &&
        presetParameters.oscillator2?.waveform === oscillator2.waveform &&
        presetParameters.oscillator2?.frequency === oscillator2.frequency &&
        presetParameters.oscillator3?.waveform === oscillator3.waveform &&
        presetParameters.oscillator3?.frequency === oscillator3.frequency &&
        presetParameters.filterCutoff === filterCutoff &&
        presetParameters.filterEmphasis === filterEmphasis &&
        presetParameters.filterContourAmount === filterContourAmount &&
        presetParameters.filterAttack === filterAttack &&
        presetParameters.filterDecay === filterDecay &&
        presetParameters.filterSustain === filterSustain &&
        presetParameters.loudnessAttack === loudnessAttack &&
        presetParameters.loudnessDecay === loudnessDecay &&
        presetParameters.loudnessSustain === loudnessSustain &&
        presetParameters.modMix === modMix &&
        presetParameters.lfoRate === lfoRate &&
        presetParameters.glideTime === glideTime &&
        presetParameters.mainVolume === mainVolume
      );
    });

    if (matchingPreset) {
      setCurrentPreset(matchingPreset.name);
    } else {
      setCurrentPreset(null);
    }
  }, [
    oscillator1,
    oscillator2,
    oscillator3,
    filterCutoff,
    filterEmphasis,
    filterContourAmount,
    filterAttack,
    filterDecay,
    filterSustain,
    loudnessAttack,
    loudnessDecay,
    loudnessSustain,
    modMix,
    lfoRate,
    glideTime,
    mainVolume,
  ]);

  const filteredPresets: Preset[] =
    selectedCategory === "All"
      ? presets
      : presets.filter((preset) => preset.category === selectedCategory);

  const handlePresetSelect = (preset: Preset) => {
    try {
      const presetParameters = convertPresetToStoreFormat(preset);
      loadPreset(presetParameters);
      setCurrentPreset(preset.name);
      setIsOpen(false);
      setError(null);
    } catch (error) {
      logger.error("Preset loading error:", error);
      const msg =
        "Failed to load preset. Please try another preset or reload the page.";
      setError(msg);
      showToast({ title: "Preset Error", description: msg, variant: "error" });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return {
    isOpen,
    setIsOpen,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    currentPreset,
    setCurrentPreset,
    filteredPresets,
    handlePresetSelect,
    error,
    categories: ["All", ...getCategories()],
  };
}
