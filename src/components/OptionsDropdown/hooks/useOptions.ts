import { useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { Options } from "@/store/types/synth";

export function useOptions() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSynthStore((state) => state.options);
  const toggleOption = useSynthStore((state) => state.toggleOption);

  const handleToggleSetting = (key: keyof Options) => {
    toggleOption(key);
  };

  return {
    isOpen,
    setIsOpen,
    settings,
    handleToggleSetting,
  };
}
