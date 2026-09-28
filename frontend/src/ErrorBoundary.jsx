import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './components/common/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full w-fit mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
