import Minimoog from "./components/Minimoog";
import GitHubRibbon from "./components/GitHubRibbon";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast/ToastProvider";
import Onboarding from "./components/Onboarding";

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <GitHubRibbon
          url="https://github.com/stevebarakat/minimoog"
          text="Fork me on GitHub"
        />
        <Minimoog />
        <Onboarding />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
