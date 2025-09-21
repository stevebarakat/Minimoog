import { cn } from "@/utils";
import { type ReactNode } from "react";
import styles from "../Dropdown.module.css";

// Group component for organizing items
type DropdownGroupProps = {
  children: ReactNode;
  className?: string;
  role?: string;
};

export function DropdownGroup({
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
