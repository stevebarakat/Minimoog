import React from "react";
import { cn } from "@/utils";
import styles from "./PresetsDropdown.module.css";
import { usePresetsDropdown } from "./hooks/usePresetsDropdown";
import { CategoryFilter, PresetList } from "./components";

function PresetsDropdown({ disabled }: { disabled: boolean }) {
  const {
    isOpen,
    setIsOpen,
    selectedCategory,
    currentPreset,
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
  } = usePresetsDropdown();

  // Handle click/touch outside to close dropdown
  React.useEffect(() => {
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
  }, [dropdownRef, isOpen, setFocusedIndex, setIsOpen]);

  return (
    <div
      ref={dropdownRef}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className={styles.container}
    >
      <div className={styles.controls}>
        <div className={cn(styles.dropdown, disabled && "disabled")}>
          <button
            className={styles.trigger}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Select a preset"
            disabled={disabled}
          >
            <span className={styles.triggerText}>
              {currentPreset || "Select Preset"}
            </span>
            <svg
              className={cn(styles.chevron, isOpen && styles.rotated)}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <button
          className={cn(styles.urlButton, disabled && "disabled")}
          onClick={handleCopyURL}
          disabled={disabled}
          title="Copy current settings as URL"
          aria-label="Copy current settings as URL"
        >
          {showCopiedMessage ? "Copied!" : "Copy URL"}
        </button>
      </div>

      {isOpen && (
        <div className={styles.menu} role="listbox">
          <CategoryFilter
            selectedCategory={selectedCategory}
            categories={categories}
            onChange={handleCategoryChange}
          />
          <PresetList
            presets={filteredPresets}
            currentPreset={currentPreset}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            onSelect={handlePresetSelect}
          />
        </div>
      )}
    </div>
  );
}

export default PresetsDropdown;
