import React from "react";
import type { ViewportSize } from "../types";

export function useViewportTracking() {
  const [viewportSize, setViewportSize] = React.useState<ViewportSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const updateViewportSize = React.useCallback(() => {
    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const handleScroll = React.useCallback(() => {
    setViewportSize((prev) => ({ ...prev }));
  }, []);

  React.useEffect(() => {
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [updateViewportSize]);

  React.useEffect(() => {
    function findControlsPanel() {
      return document.querySelector('[data-onboarding="controls-panel"]');
    }

    const controlsPanel = findControlsPanel();
    if (!controlsPanel) {
      const timeoutId = setTimeout(() => {
        const panel = findControlsPanel();
        if (!panel) return;
        panel.addEventListener("scroll", handleScroll);
        return () => panel.removeEventListener("scroll", handleScroll);
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    controlsPanel.addEventListener("scroll", handleScroll);
    return () => controlsPanel.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return viewportSize;
}
