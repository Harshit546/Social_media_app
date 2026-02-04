import React from "react";
import { logFrontendError } from "../utils/errorLogger";

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global React error boundary.
 * Catches render/runtime errors in the React tree and logs them to the backend.
 */
export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Send error + component stack to backend
    await logFrontendError({
      apiName: window.location.pathname,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // Simple fallback UI; can be customized
      return (
        <div style={{ padding: 24, color: "white", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <p>Our team has been notified. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

