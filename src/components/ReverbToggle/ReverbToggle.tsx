import { useState } from "react";

type ReverbToggleProps = {
  onToggle: (isOpen: boolean) => void;
};

export default function ReverbToggle({ onToggle }: ReverbToggleProps) {
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
      title={isOpen ? "Close Reverb" : "Open Reverb"}
    >
      {isOpen ? "CLOSE REVERB" : "REVERB"}
    </button>
  );
}
