import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useDropdownContext } from "../hooks";
import * as Toggle from "@radix-ui/react-toggle";
import Button from "@/components/Button";
import { cn } from "@/utils";
import styles from "../Dropdown.module.css";

type DropdownTriggerProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  width?: string;
  icon?: ReactNode;
  segmented?: boolean;
  iconPosition?: "left" | "right";
  textAlign?: "left" | "center" | "right";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  isActive?: boolean;
  isPulsating?: boolean;
};

export function DropdownTrigger({
  children,
  className,
  disabled: localDisabled,
  width,
  icon,
  segmented = false,
  iconPosition = "left",
  textAlign,
  justifyContent,
  isActive = false,
  isPulsating = false,
}: DropdownTriggerProps) {
  const {
    isOpen,
    onToggle,
    disabled: contextDisabled,
    ariaLabel,
    ariaExpanded,
    ariaHasPopup,
  } = useDropdownContext();

  // Use context disabled state (from Dropdown.Root) or local disabled prop
  const isDisabled = contextDisabled || localDisabled;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

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
    <div className={styles.dropdown}>
      <Toggle.Root
        asChild
        className={className}
        style={{
          cursor: isDisabled ? "not-allowed" : "pointer",
          width: width || undefined,
          textAlign: textAlign || undefined,
          justifyContent: justifyContent || undefined,
        }}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        aria-label={ariaLabel}
      >
        <Button
          disabled={isDisabled}
          segmented={segmented}
          icon={icon}
          iconPosition={iconPosition}
          className={className}
          isActive={isActive}
          isPulsating={isPulsating}
        >
          <div className={styles.triggerText}>{children}</div>
          <ChevronDown
            className={cn(styles.chevron, isOpen && styles.rotated)}
            size={16}
          />
        </Button>
      </Toggle.Root>
    </div>
  );
}
