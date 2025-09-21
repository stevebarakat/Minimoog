import styles from "./MobileMessage.module.css";
import { useIsMobile } from "@/hooks/useMediaQuery";

function MobileMessage() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className={styles.mobileMessage}>
      <h1>Welcome to the Minimoog</h1>
      <a
        href="https://github.com/stevebarakat/Minimoog"
        rel="noopener noreferrer"
      >
        <img
          src="/images/minimoog-screenshot-sm.webp"
          alt="Minimoog Screenshot"
          fetchPriority="high"
          loading="eager"
        />
      </a>
      <p>
        This app is meant to be used on screens wider than 760px. Please use a
        wider screen to use the Minimoog.
      </p>
    </div>
  );
}

export default MobileMessage;
