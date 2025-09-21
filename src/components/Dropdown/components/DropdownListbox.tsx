import { type ReactNode, useRef, useEffect } from "react";
import styles from "../Dropdown.module.css";
import { useDropdownContext } from "../hooks";

// Listbox component for proper keyboard navigation
type DropdownListboxProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  options?: Array<{ id: string; [key: string]: string | number | boolean }>;
  optionCount?: number;
};

export function DropdownListbox({
  children,
  className,
  "aria-label": ariaLabel,
  options,
  optionCount: explicitOptionCount,
}: DropdownListboxProps) {
  const { onToggle, setOptionCount } = useDropdownContext();
  const listboxRef = useRef<HTMLDivElement>(null);

  // Use explicit option count if provided, otherwise derive from options array
  const actualOptionCount = explicitOptionCount ?? options?.length ?? 0;

  // Special handling for PresetList - count the actual presets
  useEffect(() => {
    let count = actualOptionCount;

    // Check if the listbox contains a PresetList with data-preset-count
    if (listboxRef.current) {
      const presetListElement = listboxRef.current.querySelector(
        "[data-preset-count]"
      );
      if (presetListElement) {
        const presetCount = presetListElement.getAttribute("data-preset-count");
        if (presetCount) {
          count = parseInt(presetCount, 10);
        }
      }
    }

    setOptionCount(count);
  }, [actualOptionCount, setOptionCount]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onToggle();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Check if the new focus target is within the dropdown
    const relatedTarget = event.relatedTarget as HTMLElement;
    const dropdownContainer = listboxRef.current?.closest(
      `.${styles.container}`
    );

    if (relatedTarget && dropdownContainer?.contains(relatedTarget)) {
      // Focus is moving within the dropdown, don't close
      return;
    }

    // Focus is moving outside the dropdown, close it
    onToggle();
  };

  return (
    <div
      ref={listboxRef}
      role="listbox"
      className={className}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
