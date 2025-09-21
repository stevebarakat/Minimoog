import Logo from "@/components/Logo";
import Row from "@/components/Row";
import styles from "../Panels.module.css";
import Hinge from "@/components/Hinge";

const MidPanel = () => {
  return (
    <>
      <Hinge />
      <Row
        justify="flex-end"
        style={{
          padding: "var(--spacing-md)",
        }}
        className={styles.midPanel}
      >
        <Logo />
      </Row>
    </>
  );
};

export default MidPanel;
