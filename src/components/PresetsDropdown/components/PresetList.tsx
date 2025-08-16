import React, { useMemo, useCallback } from "react";
import { Dropdown } from "@/components/Dropdown";
import { Preset } from "@/data/presets";
import { cn } from "@/utils";
import styles from "../PresetsDropdown.module.css";

type PresetListProps = {
  presets: Preset[];
  currentPreset: string | null;
  onSelect: (preset: Preset) => void;
};

// Virtual scrolling configuration
const ITEM_HEIGHT = 80; // Approximate height of each preset item
const VISIBLE_ITEMS = 8; // Number of items visible at once
const BUFFER_SIZE = 2; // Extra items to render for smooth scrolling

export function PresetList({
  presets,
  currentPreset,
  onSelect,
}: PresetListProps) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calculate virtual scrolling parameters
  const totalHeight = presets.length * ITEM_HEIGHT;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE
  );
  const endIndex = Math.min(
    presets.length,
    Math.ceil((scrollTop + VISIBLE_ITEMS * ITEM_HEIGHT) / ITEM_HEIGHT) +
      BUFFER_SIZE
  );

  // Get visible presets
  const visiblePresets = useMemo(() => {
    return presets.slice(startIndex, endIndex);
  }, [presets, startIndex, endIndex]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Memoize the preset items to prevent unnecessary re-renders
  const presetItems = useMemo(() => {
    return visiblePresets.map((preset, index) => {
      const actualIndex = startIndex + index;
      return (
        <Dropdown.Item
          key={preset.id}
          role="option"
          aria-selected={currentPreset === preset.name}
          id={`preset-option-${preset.id}`}
          index={actualIndex}
          style={{
            position: "absolute",
            top: `${actualIndex * ITEM_HEIGHT}px`,
            height: `${ITEM_HEIGHT}px`,
            width: "100%",
          }}
        >
          <Dropdown.ItemButton
            onClick={() => onSelect(preset)}
            id={`preset-button-${preset.id}`}
            index={actualIndex}
            className={cn(
              styles.presetButton,
              currentPreset === preset.name && styles.selected
            )}
          >
            <div className={styles.presetHeader}>
              <span className={styles.presetName}>{preset.name}</span>
              <span className={styles.presetCategory}>{preset.category}</span>
            </div>
            <p className={styles.presetDescription}>{preset.description}</p>
          </Dropdown.ItemButton>
        </Dropdown.Item>
      );
    });
  }, [visiblePresets, currentPreset, startIndex, onSelect]);

  return (
    <div
      className={styles.presetList}
      data-preset-count={presets.length}
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px`,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        {presetItems}
      </div>
    </div>
  );
}
