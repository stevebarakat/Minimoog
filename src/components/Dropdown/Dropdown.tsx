import React from "react";
import { cn } from "@/utils";
import styles from "./Dropdown.module.css";

// Context for sharing state between components
type DropdownContextType = {
  isOpen: boolean;
  onToggle: () => void;
  disabled: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree";
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  activeDescendant?: string;
  setActiveDescendant: (id: string) => void;
  triggerSelection?: () => void;
  optionCount: number;
  setOptionCount: (count: number) => void;
};

const DropdownContext = React.createContext<DropdownContextType | null>(null);

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown.Root");
  }
  return context;
};

// Root component - manages state and provides context
type DropdownRootProps = {
  children: React.ReactNode;
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
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [activeDescendant, setActiveDescendant] = React.useState<string>("");
  const [optionCount, setOptionCount] = React.useState(0);

  // Reset focus when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      setActiveDescendant("");
    }
  }, [isOpen]);

  // Handle click/touch outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle();
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
  }, [dropdownRef, isOpen, onToggle]);

  const contextValue: DropdownContextType = {
    isOpen,
    onToggle,
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
        style={{ opacity: disabled ? 0.5 : 1 }}
        className={cn(styles.container, className)}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Trigger component
type DropdownTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { isOpen, onToggle, disabled, ariaLabel, ariaExpanded, ariaHasPopup } =
    useDropdownContext();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        event.preventDefault();
        onToggle();
        break;
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    // Check if the new focus target is within the dropdown
    const relatedTarget = event.relatedTarget as HTMLElement;
    const dropdownContainer = event.currentTarget.closest(
      `.${styles.container}`
    );

    if (relatedTarget && dropdownContainer?.contains(relatedTarget)) {
      // Focus is moving within the dropdown, don't close
      return;
    }

    // Focus is moving outside the dropdown, close it
    if (isOpen) {
      onToggle();
    }
  };

  return (
    <div className={cn(styles.dropdown, disabled && "disabled")}>
      <button
        className={cn(styles.trigger, className)}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className={styles.triggerText}>{children}</span>
        <svg
          className={cn(styles.chevron, isOpen && styles.rotated)}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
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
  );
}

// Listbox component for proper keyboard navigation
type DropdownListboxProps = {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

function DropdownListbox({
  children,
  className,
  "aria-label": ariaLabel,
}: DropdownListboxProps) {
  const { focusedIndex, setFocusedIndex, onToggle, isOpen, setOptionCount } =
    useDropdownContext();
  const listboxRef = React.useRef<HTMLDivElement>(null);

  // Count the number of option children and update the context
  const actualOptionCount = React.Children.count(children);

  // Special handling for PresetList - count the actual presets
  React.useEffect(() => {
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

  // Focus the listbox when dropdown opens
  React.useEffect(() => {
    if (isOpen && listboxRef.current) {
      // Don't focus the listbox itself, focus the first item instead
      setFocusedIndex(0); // Start with first item
      // Focus will be handled by the focused item's tabIndex
    }
  }, [isOpen, setFocusedIndex]);

  // Focus the focused item when focusedIndex changes
  React.useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const focusedItem = document.querySelector(
        `[data-focused="true"]`
      ) as HTMLButtonElement;
      if (focusedItem) {
        focusedItem.focus();
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Keyboard navigation is now handled by individual items
    // This is just a fallback for any events that might bubble up
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

// Content component
type DropdownContentProps = {
  children: React.ReactNode;
  className?: string;
};

function DropdownContent({ children, className }: DropdownContentProps) {
  const { isOpen } = useDropdownContext();

  if (!isOpen) return null;

  return (
    <div className={cn(styles.menu, className)} role="presentation">
      {children}
    </div>
  );
}

// Item component
type DropdownItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  role?: string;
  "aria-selected"?: boolean;
  id?: string;
  index?: number;
};

function DropdownItem({
  children,
  disabled = false,
  className,
  role = "option",
  "aria-selected": ariaSelected,
  id,
  index = 0,
  ...props
}: DropdownItemProps) {
  const { setFocusedIndex, setActiveDescendant } = useDropdownContext();

  const handleMouseEnter = () => {
    if (!disabled) {
      setFocusedIndex(index);
      if (id) {
        setActiveDescendant(id);
      }
    }
  };

  return (
    <div
      className={cn(styles.dropdownItem, className)}
      role={role}
      aria-selected={ariaSelected}
      id={id}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </div>
  );
}

// ItemButton component for clickable items
type DropdownItemButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  index?: number;
};

function DropdownItemButton({
  children,
  onClick,
  disabled = false,
  className,
  id,
  index = 0,
}: DropdownItemButtonProps) {
  const {
    focusedIndex,
    setFocusedIndex,
    setActiveDescendant,
    onToggle,
    optionCount,
  } = useDropdownContext();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const newIndex = Math.min(focusedIndex + 1, optionCount - 1);
        setFocusedIndex(newIndex);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const newIndex = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(newIndex);
        break;
      }
      case "Home": {
        event.preventDefault();
        setFocusedIndex(0);
        break;
      }
      case "End": {
        event.preventDefault();
        setFocusedIndex(optionCount - 1);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        onClick?.();
        onToggle();
        break;
      }
      case "Escape":
        event.preventDefault();
        onToggle();
        break;
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
    }
  };

  const handleFocus = () => {
    setFocusedIndex(index);
    if (id) {
      setActiveDescendant(id);
    }
  };

  const isFocused = focusedIndex === index;

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={cn(
        styles.dropdownOption,
        className,
        isFocused && styles.focused
      )}
      disabled={disabled}
      id={id}
      tabIndex={isFocused ? 0 : -1}
      data-focused={isFocused ? "true" : "false"}
    >
      {children}
    </button>
  );
}

// Separator component
type DropdownSeparatorProps = {
  className?: string;
};

function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return (
    <div
      className={cn(styles.separator, className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

// Group component for organizing items
type DropdownGroupProps = {
  children: React.ReactNode;
  className?: string;
  role?: string;
};

function DropdownGroup({
  children,
  className,
  role = "group",
}: DropdownGroupProps) {
  return (
    <div className={cn(styles.group, className)} role={role}>
      {children}
    </div>
  );
}

// Label component for group labels
type DropdownLabelProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

function DropdownLabel({ children, className, id }: DropdownLabelProps) {
  return (
    <div
      className={cn(styles.label, className)}
      id={id}
      role="option"
      aria-disabled="true"
    >
      {children}
    </div>
  );
}

// Compose the Dropdown component
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
};

export default Dropdown;
export { DropdownTrigger as DropdownTrigger };
