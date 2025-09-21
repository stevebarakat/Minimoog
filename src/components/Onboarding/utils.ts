import type { TooltipPosition, ViewportSize } from "./types";

export function scrollElementIntoView(element: Element): void {
  const controlsPanel = document.querySelector(
    '[data-onboarding="controls-panel"]'
  );

  if (controlsPanel && controlsPanel instanceof HTMLElement) {
    requestAnimationFrame(() => {
      const containerRect = controlsPanel.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const scrollLeft =
        elementRect.left +
        elementRect.width / 2 -
        containerRect.left -
        containerRect.width / 2;

      controlsPanel.scrollTo({
        left: controlsPanel.scrollLeft + scrollLeft,
        behavior: "smooth",
      });
    });
  }
}

export function calculateTooltipPosition(
  targetElement: Element | null,
  isFirstStep: boolean,
  viewportSize: ViewportSize
): TooltipPosition {
  if (isFirstStep) {
    const minimoogContainer = document.querySelector('[class*="synth"]');
    if (minimoogContainer) {
      const rect = minimoogContainer.getBoundingClientRect();
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        width: "1px",
        height: "1px",
      };
    }
    return {
      top: "50%",
      left: "50%",
      width: "1px",
      height: "1px",
    };
  }

  if (!targetElement) {
    return {
      top: "50%",
      left: "50%",
      width: "1px",
      height: "1px",
    };
  }

  const rect = targetElement.getBoundingClientRect();
  let top = rect.top;
  let left = rect.left;
  const width = rect.width;
  const height = rect.height;

  if (rect.left < 0) left = 10;
  if (rect.right > viewportSize.width) left = viewportSize.width - width - 10;
  if (rect.top < 0) top = 10;
  if (rect.bottom > viewportSize.height)
    top = viewportSize.height - height - 10;

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

export function findTargetElement(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    let retryCount = 0;
    const maxRetries = 50;

    function attemptFind(): void {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptFind, 100);
      } else {
        resolve(null);
      }
    }

    attemptFind();
  });
}
