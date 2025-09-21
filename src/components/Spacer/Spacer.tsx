function Spacer({
  width = "100%",
  height = "0",
  children,
  style,
}: {
  width?: string;
  height?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const spacerStyle = {
    width,
    height,
    position: "relative" as const,
    ...style,
  };

  return <div style={spacerStyle}>{children}</div>;
}

export default Spacer;
