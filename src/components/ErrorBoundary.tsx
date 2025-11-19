import { Component } from 'react';
import type { ReactNode } from 'react';
import { theme } from '@/config/theme';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    // TODO: Send to error tracking service when implemented
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-5">
          <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}>
            <div className={`${theme.backgrounds.errorLight} ${theme.text.error} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5`}>
              <span className="text-3xl">⚠️</span>
            </div>

            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>
              Algo correu mal
            </h1>

            <p className={`${theme.text.neutral} mb-6`}>
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className={`${theme.backgrounds.neutralLight} p-3 rounded-lg mb-6 text-left overflow-auto max-h-32`}>
                <code className="text-xs text-red-600">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className={`flex-1 px-5 py-3 ${theme.backgrounds.neutral} ${theme.text.onLight} rounded-xl font-medium hover:opacity-80 transition-opacity`}
              >
                Tentar Novamente
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className={`flex-1 px-5 py-3 ${theme.solids.background} ${theme.text.onPrimary} rounded-xl font-medium hover:opacity-90 transition-opacity`}
              >
                Ir para Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
