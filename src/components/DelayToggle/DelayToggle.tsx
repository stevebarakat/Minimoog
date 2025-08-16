import { useState } from "react";

type DelayToggleProps = {
  onToggle: (isOpen: boolean) => void;
};

export default function DelayToggle({ onToggle }: DelayToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className="dev-stats-toggle"
      title={isOpen ? "Close Delay" : "Open Delay"}
    >
      {isOpen ? "CLOSE DELAY" : "DELAY"}
    </button>
  );
}
