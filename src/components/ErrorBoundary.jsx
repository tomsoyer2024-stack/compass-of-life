import React from 'react';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        logger.error('System', 'Crash', error, { stack: errorInfo.componentStack });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    fontFamily: 'sans-serif',
                    textAlign: 'center',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFF5F5',
                    color: '#333'
                }}>
                    <h1 style={{ color: '#D32F2F' }}>Something went wrong.</h1>
                    <p style={{ fontSize: '18px', marginBottom: '20px' }}>The application encountered an unexpected error.</p>

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            background: '#D32F2F',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '40px',
                            fontWeight: 'bold'
                        }}
                    >
                        Reload Application
                    </button>

                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ffcdd2', maxWidth: '800px', width: '100%', overflow: 'auto' }}>
                        <summary style={{ cursor: 'pointer', color: '#D32F2F', fontWeight: 'bold' }}>Error Details (Click to expand)</summary>
                        <br />
                        <div style={{ color: '#D32F2F', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</div>
                        <br />
                        <div style={{ fontSize: '12px', color: '#666' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</div>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
