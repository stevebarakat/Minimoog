import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ToastProvider } from "@/components/ToastProvider";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withToast?: boolean;
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withToast = false, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withToast) {
      return <ToastProvider>{children}</ToastProvider>;
    }
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
