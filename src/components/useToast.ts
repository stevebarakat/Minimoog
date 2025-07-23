import * as React from "react";

type ToastContextValue = {
  showToast: (opts: {
    title: string;
    description?: string | string[];
    variant?: "error" | "info" | "success";
  }) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.showToast;
}

export { ToastContext };
