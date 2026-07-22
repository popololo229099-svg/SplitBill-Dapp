import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0e11',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: 24,
        }}>
          <div style={{
            background: '#1e2329',
            border: '1px solid #2b3139',
            borderRadius: 12,
            padding: 40,
            maxWidth: 440,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#x26A0;</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#eaecef', margin: '0 0 8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 13, color: '#707a8a', lineHeight: 1.5, margin: '0 0 24px' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#f0b90b',
                border: 'none',
                borderRadius: 6,
                color: '#0b0e11',
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
            {this.state.error && (
              <details style={{ marginTop: 16, textAlign: 'left' }}>
                <summary style={{ fontSize: 12, color: '#5e6673', cursor: 'pointer' }}>
                  Error details
                </summary>
                <pre style={{
                  fontSize: 11, color: '#f6465d', marginTop: 8,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  background: '#0b0e11', borderRadius: 6, padding: 12,
                  border: '1px solid #2b3139', overflow: 'auto',
                  maxHeight: 160,
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
