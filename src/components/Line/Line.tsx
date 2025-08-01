import React from "react";
import styles from "./Line.module.css";

type LineProps = {
  style?: React.CSSProperties;
  side?: "left" | "right";
};

export default function Line({ style, side = "left" }: LineProps) {
  const sideStyle = side === "left" ? { left: "4.7rem" } : { left: "0.25rem" };

  return <div className={styles.line} style={{ ...style, ...sideStyle }}></div>;
}
