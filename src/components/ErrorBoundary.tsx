import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Props = {
  children: unknown;
};

type ErrorState = {
  hasError: boolean;
  error: Error | undefined;
};

export function ErrorBoundary({ children }: Props) {
  const errorState = useState({ hasError: false, error: undefined } as ErrorState);
  const setErrorState = errorState[1];

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrorState({ hasError: true, error: event.error });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrorState({ hasError: true, error: event.reason });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setErrorState]);

  const handleReset = () => {
    setErrorState({ hasError: false, error: undefined });
  };

  if (errorState[0].hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 text-sm mb-6">
            {errorState[0].error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children as unknown as { type: unknown; props: unknown };
}