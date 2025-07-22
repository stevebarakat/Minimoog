import { useState, useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { presets, getCategories, Preset } from "@/data/presets";
import { copyURLToClipboard, convertPresetToStoreFormat } from "@/utils";

export function usePresetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPreset, setCurrentPreset] = useState<string | null>("Fat Bass");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const loadPreset = useSynthStore((state) => state.loadPreset);
  const synthState = useSynthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = ["All", ...getCategories()];
  const filteredPresets: Preset[] =
    selectedCategory === "All"
      ? presets
      : presets.filter((preset) => preset.category === selectedCategory);

  const handlePresetSelect = (preset: Preset) => {
    const presetParameters = convertPresetToStoreFormat(preset);
    loadPreset(presetParameters);
    setCurrentPreset(preset.name);
    setIsOpen(false);
    setFocusedIndex(-1);
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
    } catch (error) {
      console.error("Failed to copy URL to clipboard:", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredPresets.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPresets.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredPresets.length) {
          handlePresetSelect(filteredPresets[focusedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    selectedCategory,
    setSelectedCategory,
    currentPreset,
    setCurrentPreset,
    focusedIndex,
    setFocusedIndex,
    showCopiedMessage,
    handlePresetSelect,
    handleCategoryChange,
    handleCopyURL,
    handleKeyDown,
    dropdownRef,
    categories,
    filteredPresets,
  };
}
