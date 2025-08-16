import React from "react";
import styles from "./Section.module.css";
import { cn } from "@/utils";

type SectionProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  align?: "flex-start" | "center" | "flex-end" | "space-between";
  className?: string;
  "data-onboarding"?: string;
};

function Section({
  children,
  style,
  justify = "flex-end",
  align = "center",
  className,
  "data-onboarding": dataOnboarding,
}: SectionProps) {
  return (
    <div
      className={cn(styles.section, className)}
      style={{
        ...style,
        justifyContent: justify,
        alignItems: align,
      }}
      data-onboarding={dataOnboarding}
    >
      {children}
    </div>
  );
}

export default Section;
