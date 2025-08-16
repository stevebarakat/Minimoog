import React from "react";
import styles from "./Column.module.css";
import { cn } from "@/utils";

type ColumnProps = {
  children: React.ReactNode;
  align?: "center" | "flex-start" | "flex-end" | "stretch" | "baseline";
  justify?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  gap?: string;
  style?: React.CSSProperties;
  className?: string;
  "data-onboarding"?: string;
};

function Column({
  className,
  children,
  align = "center",
  justify = "flex-start",
  gap = "0",
  style,
  "data-onboarding": dataOnboarding,
}: ColumnProps) {
  return (
    <div
      className={cn(styles.column, styles.sidePanel, className)}
      style={{
        alignItems: align,
        justifyContent: justify,
        gap: gap,
        ...style,
      }}
      data-onboarding={dataOnboarding}
    >
      {children}
    </div>
  );
}

export default Column;
