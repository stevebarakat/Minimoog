import { useMidiHandling } from "@/components/Keyboard/hooks";
import styles from "./MidiStatusIndicator.module.css";
import type { SimpleSynthObject } from "@/types";

type MidiStatusIndicatorProps = {
  synthObj: SimpleSynthObject | null;
};

export function MidiStatusIndicator({ synthObj }: MidiStatusIndicatorProps) {
  const { error, permissionState } = useMidiHandling(synthObj);

  if (!error && permissionState === "granted") {
    return null;
  }

  const getErrorDisplay = () => {
    if (permissionState === "denied") {
      return (
        <div>
          <div className={styles.errorTitle}>MIDI Access Denied</div>
          <div className={styles.errorDescription}>
            MIDI permissions are blocked. To fix this:
          </div>
          <div className={styles.instructions}>
            1. Click the icon next to the URL
            <br />
            2. Find 'MIDI' permissions
            <br />
            4. Reset the permissions to "Allow"
            <br />
            5. Refresh this page
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.errorTitle}>MIDI Error</div>
        <div className={styles.errorDescription}>{error}</div>
      </div>
    );
  };

  return (
    <div className={styles.container} data-permission-state={permissionState}>
      {getErrorDisplay()}
    </div>
  );
}

export default MidiStatusIndicator;
