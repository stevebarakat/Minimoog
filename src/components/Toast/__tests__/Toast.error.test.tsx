import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider } from "../ToastProvider";
import { useToast } from "../hooks/useToast";

// Test component that simulates a non-fatal error scenario
function ErrorTestComponent() {
  const showToast = useToast();

  const triggerNonFatalError = () => {
    // Simulate a non-fatal error (like a network request failure)
    showToast({
      title: "Error",
      description: "Something went wrong, but the app can continue",
      variant: "error",
    });
  };

  return (
    <button onClick={triggerNonFatalError}>Trigger Non-Fatal Error</button>
  );
}

describe("Toast Error Handling", () => {
  it("should display error toast when non-fatal error occurs", async () => {
    render(
      <ToastProvider>
        <ErrorTestComponent />
      </ToastProvider>
    );

    const errorButton = screen.getByText("Trigger Non-Fatal Error");
    act(() => {
      errorButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong, but the app can continue")
      ).toBeInTheDocument();
    });
  });
});
