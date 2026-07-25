"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
            <h2 className="font-display text-2xl font-light">
              Something went wrong
            </h2>
            <p className="mt-2 text-ink-muted">
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary mt-6"
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
