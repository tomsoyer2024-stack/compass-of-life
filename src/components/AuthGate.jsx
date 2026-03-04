import React, { useState, useEffect } from 'react';
import { theme } from '../theme';
import { supabase } from '../services/supabase';

export const AuthGate = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const ALLOWED_EMAILS = ['tomsoyer.2024@gmail.com']; // We can add more if needed

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000000', color: '#fff' }}>
                <div style={{ width: 40, height: 40, border: `3px solid #007aff`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        // Allow unauthenticated users to see the base UI so they can log in via Sidebar
        return children;
    }

    const userEmail = session.user?.email || '';
    if (!ALLOWED_EMAILS.includes(userEmail)) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000000', color: '#ff3b30' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '2px' }}>PRIVATE ACCESS ONLY</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Your email ({userEmail}) is not authorized.</p>
                <button
                    onClick={() => supabase.auth.signOut()}
                    style={{ marginTop: '2rem', padding: '12px 24px', background: '#ff3b30', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    LOGOUT
                </button>
            </div>
        );
    }

    // Always render children. The Sidebar handles login if user is not authenticated.
    return children;
};
