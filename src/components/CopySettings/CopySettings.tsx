import React from "react";
import { cn } from "@/utils";
import styles from "./CopySettings.module.css";
import { useCopySettings } from "./hooks/useCopySettings";

type CopySettingsProps = {
  disabled: boolean;
};

function CopySettings({ disabled }: CopySettingsProps) {
  const { showCopiedMessage, handleCopyURL } = useCopySettings();

  return (
    <button
      className={cn(styles.copyButton, disabled && styles.disabled)}
      onClick={handleCopyURL}
      disabled={disabled}
      title="Copy current settings as URL and update browser address"
      aria-label="Copy current settings as URL and update browser address"
      data-onboarding="copy-settings"
    >
      {showCopiedMessage ? "Copied!" : "Copy Settings"}
    </button>
  );
}

export default CopySettings;
