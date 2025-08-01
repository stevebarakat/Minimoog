import React from "react";
import { useOnboarding } from "./hooks/useOnboarding";
import styles from "./OnboardingTrigger.module.css";

export function OnboardingTrigger() {
  const { resetOnboarding } = useOnboarding();
  
  return (
    <button 
      className={styles.trigger}
      onClick={resetOnboarding}
      title="Restart Onboarding"
    >
      ?
    </button>
  );
}

export default OnboardingTrigger; 