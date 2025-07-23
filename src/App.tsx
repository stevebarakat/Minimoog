import Minimoog from "./components/Minimoog";
import GitHubRibbon from "./components/GitHubRibbon";

function App() {
  return (
    <>
      <GitHubRibbon
        url="https://github.com/stevebarakat/minimoog"
        text="Fork me on GitHub"
      />
      <Minimoog />
    </>
  );
}

export default App;
