import { useCallback, useEffect } from "react";

export function useHandleClickOutside(
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  onToggle: () => void
) {
  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    },
    [dropdownRef, onToggle]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);
}
