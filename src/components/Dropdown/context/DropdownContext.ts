import { createContext } from "react";

// Context for sharing state between components
export type DropdownContextType = {
  isOpen: boolean;
  onToggle: () => void;
  disabled: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree";
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  activeDescendant?: string;
  setActiveDescendant: (id: string) => void;
  triggerSelection?: () => void;
  optionCount: number;
  setOptionCount: (count: number) => void;
};

export const DropdownContext = createContext<DropdownContextType | null>(null);
