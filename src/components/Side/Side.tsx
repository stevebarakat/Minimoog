import { cn } from "@/utils/cssUtils";
import styles from "./Side.module.css";

type SideProps = {
  position?: "left" | "right";
};

function Side({ position = "left" }: SideProps) {
  const shadowClass =
    position === "left"
      ? cn(styles.bottomShadow, styles.left)
      : cn(styles.bottomShadow, styles.right);
  return (
    <div className={styles.side}>
      <div className={shadowClass}></div>
    </div>
  );
}

export default Side;
