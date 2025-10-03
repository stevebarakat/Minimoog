import Section from "../Section";
import PowerButton from "./PowerButton";

type PowerProps = {
  isInitialized: boolean;
  onInitialize: () => void;
  onDispose: () => void;
};

function Power({ isInitialized, onInitialize, onDispose }: PowerProps) {
  return (
    <Section
      justify="center"
      style={{
        borderRadius: "0 0 10px 0",
        marginRight: "var(--spacing-md)",
      }}
    >
      <PowerButton
        isOn={isInitialized!}
        onPowerOn={onInitialize}
        onPowerOff={onDispose}
      />
    </Section>
  );
}

export default Power;
