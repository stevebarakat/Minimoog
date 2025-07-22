import Screw from "@/components/Screw";
import styles from "../Panels.module.css";

const BackPanel = () => {
  return (
    <div className={styles.backPanel}>
      <Screw />
      <Screw />
      <Screw />
      <Screw />
    </div>
  );
};

export default BackPanel;
