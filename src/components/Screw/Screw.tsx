import styles from "./Screw.module.css";
import { cn } from "@/utils";

interface ScrewProps {
  size?: "small" | "medium" | "large";
  className?: string;
  color?: "light" | "dark";
  hidden?: boolean;
}

function Screw({
  size = "medium",
  className,
  color = "light",
  hidden = false,
}: ScrewProps) {
  return (
    <div
      className={cn(styles.screw, styles[size], className)}
      style={{
        opacity: hidden ? 0 : 1,
      }}
    >
      <div className={cn(styles.screwHead, styles[color])}>
        <div className={styles.phillipsCross}>
          <div className={styles.crossLine}></div>
          <div className={styles.crossLine}></div>
        </div>
      </div>
    </div>
  );
}

export default Screw;
