import { cn } from "@/utils";
import styles from "../Dropdown.module.css";

type DropdownSeparatorProps = {
  className?: string;
};

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return (
    <div
      className={cn(styles.separator, className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
