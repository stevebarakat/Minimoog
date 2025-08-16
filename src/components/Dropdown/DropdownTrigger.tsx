import React from "react";
import { cn } from "@/utils";
import styles from "./Dropdown.module.css";

type DropdownTriggerProps = {
  children: React.ReactNode;
  className?: string;
  chevronClassName?: string;
};

export function DropdownTrigger({
  children,
  className,
  chevronClassName,
}: DropdownTriggerProps) {
  // This component is now used internally by Dropdown.Trigger
  // The isOpen state is managed by the context
  return (
    <>
      <span className={cn(styles.triggerText, className)}>{children}</span>
      <svg
        className={cn(styles.chevron, chevronClassName)}
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
    </>
  );
}

export default DropdownTrigger;
