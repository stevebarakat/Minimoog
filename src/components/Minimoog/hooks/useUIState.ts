import { useOverflowDirection } from "./useOverflowDirection";
import { useIsMobile, useViewType } from "@/hooks/useMediaQuery";

export function useUIState() {
  const containerRef = useOverflowDirection();
  const isMobile = useIsMobile();
  const view = useViewType();

  return {
    containerRef,
    isMobile,
    view,
  };
}
