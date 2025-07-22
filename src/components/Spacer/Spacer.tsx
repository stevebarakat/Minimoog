import styles from "./Spacer.module.css";

function Spacer({
  width = "100%",
  height = "0",
  children,
  style,
}: {
  width?: string;
  height?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={styles.spacer} style={{ width, height, ...style }}>
      {children}
    </div>
  );
}

export default Spacer;
