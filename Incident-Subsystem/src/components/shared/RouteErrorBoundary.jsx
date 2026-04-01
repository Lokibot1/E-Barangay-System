import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import {
  canAccessAdminPanel,
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

function ErrorFallback({ currentTheme, error, onRetry, onGoHome }) {
  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const errorMessage =
    error?.message || "An unexpected error interrupted this page.";

  return (
    <div className={`min-h-screen ${t.pageBg} flex items-center justify-center px-4 py-8`}>
      <div
        className={`w-full max-w-xl rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:p-8`}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
              isDark ? "bg-rose-950/40 text-rose-300" : "bg-rose-100 text-rose-600"
            }`}
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.29 3.86l-7.5 13A1.5 1.5 0 004.09 19h15.82a1.5 1.5 0 001.3-2.14l-7.5-13a1.5 1.5 0 00-2.6 0Z"
              />
            </svg>
          </div>

          <h2 className={`font-spartan text-2xl font-bold tracking-tight ${t.cardText}`}>
            This page hit an error
          </h2>
          <p className={`mt-3 max-w-md text-sm leading-6 ${t.subtleText} font-kumbh`}>
            We prevented a blank screen so you can recover safely. You can try the page again,
            go back to your dashboard, or reload the app.
          </p>

          <div
            className={`mt-5 w-full rounded-[20px] border px-4 py-3 text-left ${
              isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${t.subtleText}`}>
              Error Details
            </p>
            <p className={`mt-2 text-sm leading-6 ${t.cardText} break-words`}>
              {errorMessage}
            </p>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className={`flex-1 rounded-[14px] bg-gradient-to-r ${t.primaryGrad} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-95`}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className={`flex-1 rounded-[14px] border px-4 py-3 text-sm font-semibold ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Go Home
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={`flex-1 rounded-[14px] border px-4 py-3 text-sm font-semibold ${
                isDark
                  ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
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
  const homePath = !isAuthenticated() ? "/" : canAccessAdminPanel() ? "/admin" : "/dashboard";

  return (
    <RouteErrorBoundaryCore
      resetKey={resetKey}
      renderFallback={({ error, onRetry }) => (
        <ErrorFallback
          currentTheme={currentTheme}
          error={error}
          onRetry={onRetry}
          onGoHome={() => navigate(homePath, { replace: true })}
        />
      )}
    >
      {children}
    </RouteErrorBoundaryCore>
  );
}
