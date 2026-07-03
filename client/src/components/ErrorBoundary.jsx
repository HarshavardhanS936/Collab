import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We encountered an unexpected error while rendering this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-[#1E3E75] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-4"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-red-50 p-4 rounded-md overflow-x-auto border border-red-100 mt-4">
                <p className="text-sm font-semibold text-red-800 mb-1">Development Error:</p>
                <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.componentStack || this.state.error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
