import { useCopyUrl } from "./hooks/useCopyUrl";
import Button from "../Button";
import { BookmarkPlus } from "lucide-react";

type CopySettingsProps = {
  disabled?: boolean;
};

function CopyUrl({ disabled = false }: CopySettingsProps) {
  const { showCopiedMessage, handleCopyURL } = useCopyUrl();

  return (
    <Button
      onClick={handleCopyURL}
      disabled={disabled}
      minWidth="100px"
      segmented
      icon={<BookmarkPlus />}
      title="Copy current settings as URL to share or save"
      aria-label="Copy current settings as URL to share or save"
      data-onboarding="copy-settings"
    >
      {showCopiedMessage ? "Copied URL!" : "Save Settings"}
    </Button>
  );
}

export default CopyUrl;
