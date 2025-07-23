import "./GitHubRibbon.css";

type Props = {
  url: string;
  text: string;
};

function GitHubRibbon({ url, text }: Props) {
  return (
    <a
      href={url}
      className="github-fork-ribbon right-top fixed"
      data-ribbon={text}
    >
      {text}
    </a>
  );
}

export default GitHubRibbon;
