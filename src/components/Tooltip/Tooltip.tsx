import * as RadixTooltip from "@radix-ui/react-tooltip";
import * as RadixPopover from "@radix-ui/react-popover";
import { ReactNode, useState } from "react";
import { useTooltips } from "@/store/selectors";
import { useIsTouchDevice } from "@/utils";
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
  const isTouchDevice = useIsTouchDevice();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (!tooltipsEnabled || !content?.trim()) {
    return <>{children}</>;
  }

  if (isTouchDevice) {
    return (
      <RadixPopover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <RadixPopover.Trigger asChild>
          <div style={{ display: "inline-block" }}>{children}</div>
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            className={`${styles.tooltip} ${className || ""}`}
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <RadixPopover.Arrow className={styles.arrow} />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    );
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
