import React, { useState, useEffect } from 'react';
import { theme } from '../theme';
import { supabase } from '../services/supabase';

export const AuthGate = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#333' }}>
                <div style={{ width: 40, height: 40, border: `3px solid #007aff`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Always render children. The Sidebar handles login if user is not authenticated.
    return children;
};
