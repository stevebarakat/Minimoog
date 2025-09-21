import { type ReactNode } from "react";
import { cn } from "@/utils";
import styles from "../Dropdown.module.css";
import { useDropdownContext } from "../hooks";

type DropdownContentProps = {
  children: ReactNode;
  className?: string;
};

export function DropdownContent({ children, className }: DropdownContentProps) {
  const { isOpen } = useDropdownContext();

  if (!isOpen) return null;

  return (
    <div className={cn(styles.menu, className)} role="presentation">
      {children}
    </div>
  );
}
