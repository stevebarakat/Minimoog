import { cn, cssModule } from "@/utils";
import styles from "./OverloadIndicator.module.css";

type LedIndicatorProps = {
  isEnabled: boolean;
  volume: number;
  audioLevel: number;
  isOverloaded?: boolean;
  label?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium" | "large";
};

function OverloadIndicator({
  isEnabled,
  volume,
  audioLevel,
  isOverloaded = false,
  label,
  style,
  size = "small",
}: LedIndicatorProps) {
  // Determine if LED should be on based on enabled state and volume
  const isOn = isEnabled && volume > 0;

  // Calculate intensity based on audio level (0-1)
  // Make it more responsive by using audioLevel directly
  const intensity = Math.min(1, Math.max(0, audioLevel));

  // Calculate color based on audio level for visual feedback
  const getAudioLevelColor = (level: number) => {
    if (level < 0.6) return 60; // Yellow (60°)
    if (level < 0.8) return 30; // Orange (30°)
    return 0; // Red (0°)
  };

  const audioLevelHue = getAudioLevelColor(audioLevel);

  // Using the cssModule utility for better conditional class handling
  const ledClasses = cssModule(
    styles,
    "vintageLed",
    "vintageLedYellow",
    size === "large" && "vintageLedLarge",
    size === "medium" && "vintageLedMedium",
    size === "small" && "vintageLedSmall",
    isOn && "vintageLedOn",
    size
  );

  // Using cn utility for combining with external style
  const containerClasses = cn(styles.container, style);

  return (
    <div className={containerClasses}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={ledClasses}
        style={
          {
            ...style,
            "--led-intensity": intensity.toString(),
            "--led-overload": isOverloaded ? "1" : "0", // Add overload CSS variable
            "--audio-level-hue": audioLevelHue.toString(), // Add audio level hue
          } as React.CSSProperties
        }
      >
        <div className={styles.vintageLedInner}>
          <div className={styles.vintageLedGlow}></div>
          <div className={styles.vintageLedReflection}></div>
        </div>
      </div>
    </div>
  );
}

export default OverloadIndicator;
