import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RouteStatusScreen from "./RouteStatusScreen";
import {
  getDefaultAuthenticatedPath,
  isAuthenticated,
} from "../../homepage/services/loginService";

class RouteErrorBoundaryCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route error boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.error &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({
        error: null,
        errorInfo: null,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.error) {
      return this.props.renderFallback({
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        onRetry: this.handleRetry,
      });
    }

    return this.props.children;
  }
}

function ErrorFallback({
  currentTheme,
  error,
  onRetry,
  onGoHome,
  pathLabel,
}) {
  const errorMessage =
    error?.message || "An unexpected error interrupted this page.";

  return (
    <RouteStatusScreen
      currentTheme={currentTheme}
      variant="error"
      title="This screen could not finish loading."
      description="We caught the failure before it turned into a blank page. You can safely retry this route, go back to your main landing page, or reload the whole app."
      detailTitle="Runtime Detail"
      detailMessage={errorMessage}
      pathLabel={pathLabel}
      primaryLabel="Try Again"
      onPrimaryAction={onRetry}
      secondaryLabel="Go Home"
      onSecondaryAction={onGoHome}
      tertiaryLabel="Reload"
      onTertiaryAction={() => window.location.reload()}
    />
  );
}

export default function RouteErrorBoundary({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTheme =
    typeof window !== "undefined"
      ? localStorage.getItem("appTheme") || "modern"
      : "modern";
  const resetKey = `${location.pathname}:${location.key || "route"}`;
  const homePath = !isAuthenticated() ? "/" : getDefaultAuthenticatedPath();

  return (
    <RouteErrorBoundaryCore
      resetKey={resetKey}
      renderFallback={({ error, onRetry }) => (
        <ErrorFallback
          currentTheme={currentTheme}
          error={error}
          onRetry={onRetry}
          pathLabel={location.pathname || "/"}
          onGoHome={() => navigate(homePath, { replace: true })}
        />
      )}
    >
      {children}
    </RouteErrorBoundaryCore>
  );
}
