import { useRef } from "react";

export function useScrollControls() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!scrollRef.current) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        scrollLeft();
        break;
      case "ArrowRight":
        event.preventDefault();
        scrollRight();
        break;
      case "Home":
        event.preventDefault();
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "End":
        event.preventDefault();
        scrollRef.current.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: "smooth",
        });
        break;
    }
  };

  return {
    scrollRef,
    handleKeyDown,
  };
}
