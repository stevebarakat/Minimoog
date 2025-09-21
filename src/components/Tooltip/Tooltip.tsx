import * as RadixTooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { useTooltips } from "@/store/selectors";
import styles from "./Tooltip.module.css";

type TooltipProps = {
  children: ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  className?: string;
};

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 5,
  align = "center",
  alignOffset = 0,
  className,
}: TooltipProps) {
  const tooltipsEnabled = useTooltips();

  if (!tooltipsEnabled || !content?.trim()) {
    return <>{children}</>;
  }

  return (
    <RadixTooltip.Root delayDuration={500}>
      <RadixTooltip.Trigger asChild>
        <div style={{ display: "inline-block" }}>{children}</div>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={`${styles.tooltip} ${className || ""}`}
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <RadixTooltip.Arrow className={styles.arrow} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
