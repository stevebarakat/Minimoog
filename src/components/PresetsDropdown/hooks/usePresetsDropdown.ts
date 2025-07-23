import { useState, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { presets, Preset, getCategories } from "@/data/presets";
import { copyURLToClipboard, convertPresetToStoreFormat } from "@/utils";
import logger from "@/utils/logger";
import { reportError } from "@/utils/errorReporter";
import { useToast } from "@/components/useToast";

export function usePresetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPreset, setCurrentPreset] = useState<string | null>("Fat Bass");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadPreset = useSynthStore((state) => state.loadPreset);
  const synthState = useSynthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const showToast = useToast();

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
      setFocusedIndex(-1);
      setError(null);
    } catch (error) {
      logger.error("Preset loading error:", error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: "Preset loading",
      });
      const msg =
        "Failed to load preset. Please try another preset or reload the page.";
      setError(msg);
      showToast({ title: "Preset Error", description: msg, variant: "error" });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFocusedIndex(-1);
  };

  const handleCopyURL = async () => {
    try {
      await copyURLToClipboard(synthState);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
      setError(null);
    } catch (error) {
      logger.error("Failed to copy URL to clipboard:", error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: "Copy preset URL",
      });
      const msg = "Failed to copy preset URL. Please try again.";
      setError(msg);
      showToast({ title: "Preset Error", description: msg, variant: "error" });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % filteredPresets.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) =>
        prev <= 0 ? filteredPresets.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredPresets.length) {
        handlePresetSelect(filteredPresets[focusedIndex]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return {
    isOpen,
    setIsOpen,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    currentPreset,
    setCurrentPreset,
    focusedIndex,
    setFocusedIndex,
    showCopiedMessage,
    setShowCopiedMessage,
    filteredPresets,
    handlePresetSelect,
    handleCopyURL,
    dropdownRef,
    error,
    categories: ["All", ...getCategories()],
    handleKeyDown,
  };
}
