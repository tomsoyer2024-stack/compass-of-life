import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { checkForUpdates } from '../services/updater';

export default function AdminPanel() {
    const [status, setStatus] = useState('Idle');
    const [logs, setLogs] = useState([]);

    const checkUpdates = async () => {
        setStatus('Checking...');
        const update = await checkForUpdates('3.0.0');
        if (update.available) {
            setStatus(`Update Found: ${update.version}`);
        } else {
            setStatus('Up to date');
        }
    };

    const fetchSystemLogs = async () => {
        setStatus('Fetching logs...');
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .limit(10)
            .order('created_at', { ascending: false });

        if (data) setLogs(data);
        setStatus('Logs updated');
    };

    return (
        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.02)', borderRadius: '24px', border: '1px dashed rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '16px' }}>🛠 ADMIN CONSOLE</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'white', borderRadius: '12px', fontSize: '12px' }}>
                    <strong>Status:</strong> <span style={{ color: '#007AFF' }}>{status}</span>
                </div>

                <button
                    onClick={checkUpdates}
                    style={{ padding: '12px', borderRadius: '12px', background: '#1d1d1f', color: 'white', border: 'none', fontWeight: 700, fontSize: '12px' }}
                >
                    CHECK OTA UPDATES
                </button>

                <button
                    onClick={fetchSystemLogs}
                    style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', color: '#1d1d1f', border: 'none', fontWeight: 700, fontSize: '12px' }}
                >
                    VIEW CLOUD LOGS
                </button>

                {logs.length > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '10px', maxHeight: '100px', overflowY: 'auto', textAlign: 'left', background: '#f5f5f7', padding: '8px', borderRadius: '8px' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                [{new Date(log.created_at).toLocaleTimeString()}] {log.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
