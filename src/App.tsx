import Minimoog from "./components/Minimoog";
import GitHubRibbon from "./components/GitHubRibbon";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastProvider";

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <GitHubRibbon
          url="https://github.com/stevebarakat/minimoog"
          text="Fork me on GitHub"
        />
        <Minimoog />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
