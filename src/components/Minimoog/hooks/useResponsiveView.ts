import { useEffect, useState } from "react";

export function useResponsiveView() {
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const handleResize = () => {
      setView(
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 980
          ? "tablet"
          : "desktop"
      );
    };

    // Set initial view state
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return view;
}
