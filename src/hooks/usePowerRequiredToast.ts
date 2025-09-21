import { useToast } from "@/components/Toast/hooks/useToast";
import { useSynthStore } from "@/store/synthStore";
import { POWER_REQUIRED_TOAST } from "@/config/constants";

export function usePowerRequiredToast() {
  const { showToast, closeToast } = useToast();
  const isInitialized = useSynthStore((state) => state.audioContext.isReady);
  const onboardingVisible = useSynthStore(
    (state) => state.options.onboardingVisible
  );

  const showPowerRequiredToast = () => {
    if (!isInitialized && !onboardingVisible) {
      showToast(POWER_REQUIRED_TOAST);
    }
  };

  return {
    showPowerRequiredToast,
    closeToast,
    isInitialized,
    onboardingVisible,
  };
}
