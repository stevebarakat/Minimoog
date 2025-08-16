import * as React from "react";
// Tree-shakable imports for better bundle size
import {
  Provider,
  Root,
  Viewport,
  Title,
  Description,
} from "@radix-ui/react-toast";
import { ToastContext } from "./hooks/useToast";
import styles from "./Toast.module.css";

// Helper to sanitize array descriptions: only render string content, never React elements
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
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{
    title: string;
    description?: string | string[];
    variant?: "error" | "info" | "success";
  } | null>(null);

  const showToast = React.useCallback(
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Provider swipeDirection="right">
        {children}
        <Root
          open={open}
          onOpenChange={setOpen}
          duration={6000}
          className={`${styles.toast} ${styles[toast?.variant ?? "info"]}`}
        >
          <Title className={styles.title}>{toast?.title}</Title>
          {/* Only render string content, never React elements or <ol>/<ul> */}
          {renderDescription(toast?.description)}
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
