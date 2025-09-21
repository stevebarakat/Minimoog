import { type ReactNode, useRef, useState, useCallback } from "react";
import { cn } from "@/utils";
import styles from "./Dropdown.module.css";
import {
  DropdownTrigger,
  DropdownListbox,
  DropdownItem,
  DropdownGroup,
  DropdownLabel,
  DropdownSeparator,
  DropdownItemButton,
  DropdownContent,
  DropdownIcon,
} from "./components";
import { DropdownContext, type DropdownContextType } from "./context";
import { useHandleClickOutside } from "./hooks/useHandleClickOutside";

// Root component - manages state and provides context
type DropdownRootProps = {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree";
  className?: string;
};

function DropdownRoot({
  children,
  isOpen,
  onToggle,
  disabled = false,
  onKeyDown,
  ariaLabel,
  ariaExpanded,
  ariaHasPopup,
  className,
}: DropdownRootProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [activeDescendant, setActiveDescendant] = useState<string>("");
  const [optionCount, setOptionCount] = useState(0);

  useHandleClickOutside(dropdownRef, isOpen, onToggle);

  // Handle toggle with focus reset
  const handleToggle = useCallback(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      setActiveDescendant("");
    }
    onToggle();
  }, [isOpen, onToggle]);

  const contextValue: DropdownContextType = {
    isOpen,
    onToggle: handleToggle,
    disabled,
    onKeyDown,
    ariaLabel,
    ariaExpanded,
    ariaHasPopup,
    focusedIndex,
    setFocusedIndex,
    activeDescendant,
    setActiveDescendant,
    optionCount,
    setOptionCount,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={dropdownRef}
        className={cn(styles.container, className, disabled && styles.disabled)}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  ItemButton: DropdownItemButton,
  Separator: DropdownSeparator,
  Group: DropdownGroup,
  Label: DropdownLabel,
  Listbox: DropdownListbox,
  Icon: DropdownIcon,
};

export default Dropdown;
