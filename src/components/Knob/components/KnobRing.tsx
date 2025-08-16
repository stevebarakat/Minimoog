import styles from "../Knob.module.css";

export function KnobRing({ type }: { type: "radial" | "arrow" }) {
  return (
    <div
      className={styles.knobRing}
      style={{
        background:
          type === "arrow"
            ? `linear-gradient(
    to bottom,
    hsl(0 0% 35%) 0%,
    hsl(0 0% 27%) 35%,
    hsl(0 0% 13%) 35%,
    hsl(0 0% 7%) 100%
    )`
            : `linear-gradient(
      to bottom,
      hsl(0 0% 35%) 0%,
      hsl(0 0% 20%) 35%,
      hsl(0 0% 7%) 35%,
      hsl(0 0% 0%) 100%
  )`,
      }}
    />
  );
}
