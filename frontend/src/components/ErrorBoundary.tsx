import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time crashes so a broken view shows a friendly fallback
 * instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unexpected error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Affixa render error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app text-app flex items-center justify-center p-6">
          <div className="glass rounded-3xl border-app p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-pink-400" />
            </div>
            <h1 className="text-xl font-bold text-app mb-2">Something went wrong</h1>
            <p className="text-sm text-app-muted mb-1">
              The page hit an unexpected error. Your data is safe.
            </p>
            <p className="text-xs text-app-subtle font-mono mb-6 break-words">{this.state.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-primary justify-center !py-2.5 !px-4 !text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
