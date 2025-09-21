import { useContext } from "react";
import { DropdownContext } from "../context/DropdownContext";

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown.Root");
  }
  return context;
};
