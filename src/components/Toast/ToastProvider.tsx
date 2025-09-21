import { useState, useCallback } from "react";
import {
  Provider,
  Root,
  Viewport,
  Title,
  Description,
  Close,
} from "@radix-ui/react-toast";
import { ToastContext } from "./hooks/useToast";
import { cn } from "@/utils";
import styles from "./Toast.module.css";

function renderDescription(desc: string | string[] | undefined) {
  if (Array.isArray(desc)) {
    return (
      <Description>
        <ul>
          {desc.map((item, idx) => (
            <li key={idx}>{typeof item === "string" ? item : ""}</li>
          ))}
        </ul>
      </Description>
    );
  } else if (typeof desc === "string") {
    return <Description className={styles.description}>{desc}</Description>;
  } else {
    return null;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description?: string | string[];
    variant?: "error" | "info" | "success";
  } | null>(null);

  const showToast = useCallback(
    (opts: {
      title: string;
      description?: string | string[];
      variant?: "error" | "info" | "success";
    }) => {
      setToast(opts);
      setOpen(false); // reset before showing
      setTimeout(() => setOpen(true), 10);
    },
    []
  );

  const closeToast = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      <Provider swipeDirection="right">
        {children}
        <Root
          open={open}
          onOpenChange={setOpen}
          duration={6000}
          className={cn(styles.toast, styles[toast?.variant ?? "info"])}
        >
          <Title className={styles.title}>{toast?.title}</Title>
          {renderDescription(toast?.description)}
          <Close className={styles.close} aria-label="Close">
            ×
          </Close>
        </Root>
        <Viewport
          style={{
            position: "fixed",
            top: 24,
            left: 24,
            zIndex: 999999,
            pointerEvents: "none",
          }}
        />
      </Provider>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
