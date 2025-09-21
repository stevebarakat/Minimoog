import { cn } from "@/utils";
import { type ReactNode } from "react";
import styles from "../Dropdown.module.css";

// Label component for group labels
type DropdownLabelProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function DropdownLabel({ children, className, id }: DropdownLabelProps) {
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
