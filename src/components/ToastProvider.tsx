import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import { renderDescription } from "./utils";
import { ToastContext } from "./hooks";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          duration={6000}
          style={{
            background:
              toast?.variant === "error"
                ? "hsl(0, 100%, 32%)"
                : toast?.variant === "success"
                ? "#4caf50"
                : "#333",
            color: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 10px hsl(0 0% 0% / 75%)",
            padding: 16,
            minWidth: 280,
            maxWidth: 400,
            fontSize: 16,
            margin: 8,
          }}
        >
          <Toast.Title style={{ fontWeight: 600 }}>{toast?.title}</Toast.Title>
          {/* Only render string content, never React elements or <ol>/<ul> */}
          {renderDescription(toast?.description)}
        </Toast.Root>
        <Toast.Viewport
          style={{ position: "fixed", top: 24, left: 24, zIndex: 9999 }}
        />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};


