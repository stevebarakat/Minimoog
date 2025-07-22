import PitchBender from "../PitchBender";
import ModulationWheel from "../ModulationWheel";
import styles from "./SidePanel.module.css";
import GlideSwitch from "../Glide/GlideSwitch";
import DecaySwitch from "../DecaySwitch";
import LfoRate from "../LfoRate";
import Column from "../Column";
import Row from "../Row";
import * as Tooltip from "@radix-ui/react-tooltip";
import Screw from "../Screw/Screw";

function SidePanel() {
  return (
    <Tooltip.Provider>
      <Column className={styles.sidePanel}>
        <Row gap="var(--spacing-md)">
          <LfoRate />
          <div className={styles.switches}>
            <GlideSwitch />
            <DecaySwitch />
          </div>
        </Row>
        <Row gap="0.5rem" justify="flex-end">
          <Column gap="4.5rem" style={{ height: "100%", top: "0.5rem" }}>
            <Screw size="small" color="dark" />
            <Screw size="small" color="dark" />
          </Column>
          <PitchBender />
          <Column gap="4.5rem" style={{ height: "100%", top: "0.5rem" }}>
            <Screw size="small" color="dark" />
            <Screw size="small" color="dark" />
          </Column>
          <ModulationWheel />
        </Row>
        <Row justify="flex-end" gap="5rem" style={{ top: "14px" }}>
          <Screw />
          <Screw />
        </Row>
      </Column>
    </Tooltip.Provider>
  );
}

export default SidePanel;
