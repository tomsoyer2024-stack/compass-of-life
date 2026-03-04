import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SplashScreen } from '@capacitor/splash-screen';
import './i18n';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0", // Replace with real DSN
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// 1. Error Boundary to catch UI crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🔥 APP CRASH:", error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#1a1a1a', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h1 style={{ color: '#ff4d4d' }}>⚠️ System Error</h1>
          <p>The application encountered an unexpected problem.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#333', color: 'white', border: 'none', borderRadius: 12, marginTop: 20 }}>Restart App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 2. Production Wrapper
function AppWrapper() {
  useEffect(() => {
    // Hide splash screen as soon as React is ready
    SplashScreen.hide().catch(() => { });
  }, []);

  return <App />;
}

// 3. Mount App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AppWrapper />
  </ErrorBoundary>
);
