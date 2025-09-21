import { type ReactNode } from "react";
import { cn } from "@/utils";
import styles from "../Dropdown.module.css";
import { useDropdownContext } from "../hooks";

type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  role?: string;
  "aria-selected"?: boolean;
  id?: string;
  index?: number;
};

export function DropdownItem({
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
