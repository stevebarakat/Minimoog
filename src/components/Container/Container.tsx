import React from "react";
import styles from "./Container.module.css";
import { cn } from "@/utils/helpers";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn(styles.container, className)}>{children}</div>;
};

export default Container;
