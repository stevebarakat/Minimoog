import { useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { presets, Preset, getCategories } from "@/data/presets";
import { convertPresetToStoreFormat } from "@/utils/data";
import { logger } from "@/utils/core";
import { useToast } from "@/components/Toast/hooks/useToast";

export function usePresetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadPreset = useSynthStore((state) => state.loadPreset);
  const showToast = useToast();

  // Simple approach: track the last loaded preset by ID
  // This is much more reliable than trying to match all parameters
  const [lastLoadedPresetId, setLastLoadedPresetId] = useState<string | null>(
    () => {
      // Load from localStorage on initialization
      if (typeof window !== "undefined") {
        return localStorage.getItem("lastLoadedPresetId");
      }
      return null;
    }
  );

  // Update current preset name when lastLoadedPresetId changes
  useEffect(() => {
    if (lastLoadedPresetId) {
      const preset = presets.find((p) => p.id === lastLoadedPresetId);
      if (preset) {
        setCurrentPreset(preset.name);
      } else {
        setCurrentPreset(null);
      }
    } else {
      setCurrentPreset(null);
    }
  }, [lastLoadedPresetId]);

  const filteredPresets: Preset[] = (() => {
    const filtered =
      selectedCategory === "All"
        ? presets
        : presets.filter((preset) => preset.category === selectedCategory);

    // Sort to put current preset at the top
    if (currentPreset) {
      return filtered.sort((a, b) => {
        if (a.name === currentPreset) return -1;
        if (b.name === currentPreset) return 1;
        return 0;
      });
    }

    return filtered;
  })();

  const handlePresetSelect = (preset: Preset) => {
    try {
      const presetParameters = convertPresetToStoreFormat(preset);
      loadPreset(presetParameters);
      setLastLoadedPresetId(preset.id); // Track the preset ID instead of name

      // Save to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("lastLoadedPresetId", preset.id);
      }

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

  const clearActivePreset = () => {
    setLastLoadedPresetId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lastLoadedPresetId");
    }
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
    clearActivePreset,
    error,
    categories: ["All", ...getCategories()],
  };
}
