import { useCopySettings } from "./hooks/useCopySettings";
import styles from "./CopySettings.module.css";
import { cn } from "@/utils";

type CopySettingsProps = {
  disabled?: boolean;
  className?: string;
};

function CopySettings({ disabled = false, className }: CopySettingsProps) {
  const { showCopiedMessage, handleCopyURL } = useCopySettings();

  return (
    <div className={cn(styles.copySettings, className)}>
      <button
        type="button"
        className={styles.button}
        onClick={handleCopyURL}
        disabled={disabled}
        title="Copy current settings as URL and update browser address"
        aria-label="Copy current settings as URL and update browser address"
        data-onboarding="copy-settings"
      >
        Copy Settings
      </button>
      {showCopiedMessage && <div className={styles.copiedMessage}>Copied!</div>}
    </div>
  );
}

export default CopySettings;
