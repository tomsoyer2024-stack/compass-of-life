import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from './components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthGate } from './components/AuthGate';
import { supabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import ReloadPrompt from './components/ReloadPrompt';

// LAZY LOADING
const Dashboard = lazy(() => import('./components/Dashboard'));

// 1. SELF-HEALING ERROR BOUNDARY
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, error: error.toString() }; }

  async componentDidCatch(error, errorInfo) {
    console.error("⛔ SYSTEM CRASH:", error, errorInfo);
    // Dynamic import to avoid circular dependency
    const { supabase } = await import('./services/supabase');
    await supabase.from('system_logs').insert([{
      event: 'APPLICATION_CRASH',
      message: error.toString(),
      stack: errorInfo.componentStack,
      metadata: {
        ua: navigator.userAgent,
        ts: new Date().toISOString()
      }
    }]);
  }

  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 20, background: '#fff0f0', color: 'red', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900 }}>⚠️ SYSTEM CRASH</h2>
        <div style={{ maxWidth: '100%', padding: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '14px', marginBottom: '20px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto' }}>
          {this.state.error}
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          style={{ padding: '16px 32px', fontSize: 14, fontWeight: 800, background: 'red', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,0,0,0.3)' }}
        >
          RESET & RESTART SYSTEM
        </button>
      </div>
    );
    return this.props.children;
  }
}

const LoadingScreen = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f5f5f7', zIndex: 99999 }}>
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 70, height: 70, borderRadius: 20, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
    >
      <div style={{ fontSize: 32 }}>🎯</div>
    </motion.div>
    <div style={{ marginTop: 20, fontSize: '10px', fontWeight: 900, color: '#007AFF', letterSpacing: '3px', textTransform: 'uppercase' }}>COMPASS OS</div>
  </div>
);

// 2. MAIN APP CONTROLLER

// ... (previous imports)

// 2. MAIN APP CONTROLLER
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 600);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AnimatePresence>
          {!isLoaded && <LoadingScreen key="boot" />}
        </AnimatePresence>
        {isLoaded && (
          <AuthGate>
            <DashboardWrapper />
          </AuthGate>
        )}
        <ReloadPrompt />
      </ToastProvider>
    </ErrorBoundary>
  );
}

// Custom Hook for Mobile Detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

function DashboardWrapper() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real Data State
  const [goals, setGoals] = useState({}); // { 'category': { steps: [], title: ... } }
  const [settings, setSettings] = useState({
    backgroundId: 'glass',
    showQuotes: true
  });

  const progress = React.useMemo(() => {
    const prog = {};
    Object.keys(goals).forEach(cat => {
      const steps = goals[cat].steps || [];
      if (steps.length > 0) {
        const tasks = steps.filter(s => !s.isHeader);
        const completed = tasks.filter(s => s.completed).length;
        prog[cat] = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
      } else {
        prog[cat] = 0;
      }
    });
    return prog;
  }, [goals]);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch or Create Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSettings(profile.settings || { backgroundId: 'glass', showQuotes: true });
      } else {
        await supabase.from('profiles').insert([{ id: user.id, settings: settings }]);
      }

      // 2. Fetch Goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsData) {
        const goalsMap = {};
        goalsData.forEach(g => {
          const cat = g.category ? g.category.toLowerCase() : 'tasks';
          goalsMap[cat] = g;
        });
        setGoals(goalsMap);
      }
    };
    fetchData();
  }, []);

  // Persist Settings
  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ settings: newSettings }).eq('id', user.id);
    }
  };

  // Callback to update local state immediately (optimistic)
  const handleGoalUpdate = (newGoal) => {
    // newGoal: { category: '...', steps: [...], title: '...' }
    const cat = newGoal.category ? newGoal.category.toLowerCase() : 'tasks';
    setGoals(prev => ({ ...prev, [cat]: { ...prev[cat], ...newGoal } }));
  };

  return (
    <div className="app-container" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden',
      background: settings.backgroundId === 'dawn' ? 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)' : settings.backgroundId === 'aurora' ? 'linear-gradient(135deg, #5856D6 0%, #007AFF 100%)' : '#f5f5f7',
      '--bg-color': settings.backgroundId === 'dawn' ? 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)' : settings.backgroundId === 'aurora' ? 'linear-gradient(135deg, #5856D6 0%, #007AFF 100%)' : '#f5f5f7'
    }}>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        progress={progress}
      />

      <Suspense fallback={<LoadingScreen />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <Dashboard
            t={t}
            isMobile={isMobile}
            categoryProgressMap={progress}
            userGoals={goals}
            onUpdateGoal={handleGoalUpdate}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            settings={settings}
          />
        </motion.div>
      </Suspense>
    </div>
  );
}


