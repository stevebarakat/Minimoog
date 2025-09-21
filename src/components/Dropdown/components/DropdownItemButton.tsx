import { cn } from "@/utils";
import { type ReactNode } from "react";
import styles from "../Dropdown.module.css";
import { useDropdownContext } from "../hooks";

// ItemButton component for clickable items
type DropdownItemButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  index?: number;
};

export function DropdownItemButton({
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
