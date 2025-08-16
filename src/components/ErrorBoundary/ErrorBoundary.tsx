import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error logging can be added here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "hsl(0 100% 35%)",
            background: "hsl(0 0% 9%)",
            minHeight: "100vh",
            fontSize: "1.2rem",
          }}
        >
          <h2>Something went wrong.</h2>
          <div
            style={{
              color: "hsl(0 100% 37%)",
              background: "hsl(0 100% 97%)",
              padding: 16,
              borderRadius: 8,
              maxWidth: 600,
              margin: "16px auto",
            }}
          >
            {this.state.error?.message}
          </div>
          <p>
            Please try refreshing the page. If the problem persists, add an
            issue on{" "}
            <a href="https://github.com/stevebarakat/minimoog/issues">GitHub</a>
            .
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryInner {...props} />;
}
