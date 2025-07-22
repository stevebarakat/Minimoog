import { useEffect, useRef } from "react";

export function useOverflowDirection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Function to scroll to the rightmost content
    const scrollToRight = () => {
      if (container.scrollWidth > container.clientWidth) {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      }
    };

    // Initial scroll to right
    scrollToRight();

    // Handle window resize
    const handleResize = () => {
      scrollToRight();
    };

    window.addEventListener("resize", handleResize);

    // No scroll event handler - let users scroll naturally

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return containerRef;
}
