import { useEffect, useState } from "react";
import {
  Root as ProgressRoot,
  Indicator as ProgressIndicator,
} from "@radix-ui/react-progress";
import {
  Root as ToastRoot,
  Title as ToastTitle,
  Description as ToastDescription,
  Close as ToastClose,
} from "@radix-ui/react-toast";
import { cn } from "@/utils";
import styles from "./CountdownToast.module.css";

type CountdownToastProps = {
  title: string;
  description: string;
  variant: "error" | "info" | "success";
  initialSeconds: number;
  onComplete?: () => void;
  isVisible: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CountdownToast({
  title,
  description,
  variant,
  initialSeconds,
  onComplete,
  isVisible,
  onOpenChange,
}: CountdownToastProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    setSecondsRemaining(initialSeconds);
    setProgress(0);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const newSeconds = prev - 1;
        const newProgress =
          ((initialSeconds - newSeconds) / initialSeconds) * 100;
        setProgress(newProgress);

        if (newSeconds <= 0) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }

        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, initialSeconds, onComplete]);

  if (!isVisible) return null;

  return (
    <ToastRoot
      open={isVisible}
      onOpenChange={onOpenChange}
      duration={initialSeconds * 1000}
      className={cn(styles.toast, styles[variant])}
    >
      <ToastTitle className={styles.title}>{title}</ToastTitle>
      <ToastDescription className={styles.description}>
        {description.replace("{seconds}", (secondsRemaining - 1).toString())}
      </ToastDescription>
      <div className={styles.progressContainer}>
        <ProgressRoot className={styles.progressRoot} value={progress}>
          <ProgressIndicator
            className={styles.progressIndicator}
            style={{ transform: `translateX(-${90 - progress}%)` }}
          />
        </ProgressRoot>
        <div className={styles.progressText}>{Math.round(progress + 10)}%</div>
      </div>
      <ToastClose className={styles.close} aria-label="Close">
        ×
      </ToastClose>
    </ToastRoot>
  );
}
