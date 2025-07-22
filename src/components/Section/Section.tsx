import React from "react";
import styles from "./Section.module.css";
import { cn } from "@/utils/helpers";
import { useIsMobile } from "@/hooks/useMediaQuery";

type SectionProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  align?: "flex-start" | "center" | "flex-end" | "space-between";
  className?: string;
};

function Section({
  children,
  style,
  justify = "flex-end",
  align = "center",
  className,
}: SectionProps) {
  const isMobile = useIsMobile();
  const mobileStyle = isMobile ? { padding: "0.25rem 0 0.75rem" } : {};

  return (
    <div
      className={cn(styles.section, className)}
      style={{
        ...style,
        justifyContent: justify,
        alignItems: align,
        ...mobileStyle,
      }}
    >
      {children}
    </div>
  );
}

export default Section;
