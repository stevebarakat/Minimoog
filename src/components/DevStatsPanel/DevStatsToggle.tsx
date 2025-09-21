import { type ReactElement } from "react";

type DevStatsToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function DevStatsToggle({
  isOpen,
  onToggle,
}: DevStatsToggleProps): ReactElement {
  return (
    <button
      onClick={onToggle}
      className="dev-stats-toggle"
      title={isOpen ? "Close Dev Stats" : "Open Dev Stats"}
    >
      {isOpen ? "CLOSE STATS" : "OPEN STATS"}
    </button>
  );
}
