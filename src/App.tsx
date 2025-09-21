import Minimoog from "./components/Minimoog";
import Toolbar from "./components/Toolbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { useEffect } from "react";
import Onboarding from "./components/Onboarding";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import Footer from "./components/Footer";
import MobileMessage from "./components/MobileMessage";
import { trackEvent } from "./utils";

function App() {
  // Register service worker only in production
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service worker registered successfully
        })
        .catch(() => {
          // Service worker registration failed
        });
    }

    // Test analytics on app load
    if (typeof window !== "undefined") {
      console.log("Testing analytics...", { gtag: typeof window.gtag });
      trackEvent("app_loaded", {
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
      });
    }
  }, []);

  return (
    <RadixTooltip.Provider>
      <ToastProvider>
        <ErrorBoundary>
          <Toolbar />
          <Minimoog />
          <Footer />
          <Onboarding />
        </ErrorBoundary>
        <MobileMessage />
      </ToastProvider>
    </RadixTooltip.Provider>
  );
}

export default App;
