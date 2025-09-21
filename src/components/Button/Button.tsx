import { type ComponentProps } from "react";
import { cn } from "@/utils/ui";
import styles from "./Button.module.css";

type ButtonProps = ComponentProps<"button"> & {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  segmented?: boolean;
  isActive?: boolean;
  isPulsating?: boolean;
  minWidth?: string;
  className?: string;
};

function Button({
  children,
  icon,
  iconPosition = "left",
  segmented = false,
  isActive = false,
  isPulsating = false,
  className,
  minWidth = "fit-content",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(styles.button, segmented && styles.segmented, className)}
    >
      {icon && iconPosition === "left" && (
        <span
          className={cn(
            styles.icon,
            styles.left,
            segmented && styles.iconSegmented,
            isActive && styles.active,
            isPulsating && styles.pulsating
          )}
        >
          {icon}
        </span>
      )}
      <span className={styles.label} style={{ minWidth }}>
        {children}
      </span>
      {icon && iconPosition === "right" && (
        <span
          className={cn(
            styles.icon,
            styles.right,
            segmented && styles.iconSegmented
          )}
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export default Button;
