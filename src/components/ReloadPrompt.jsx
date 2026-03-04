import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line no-console
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            // eslint-disable-next-line no-console
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh) && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 10000,
                    background: '#333',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div className="ReloadPrompt-message">
                        {offlineReady
                            ? <span>App ready to work offline</span>
                            : <span>New content available, click on reload button to update.</span>
                        }
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {needRefresh && (
                            <button
                                onClick={() => updateServiceWorker(true)}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#007AFF', color: 'white', cursor: 'pointer' }}
                            >
                                Reload
                            </button>
                        )}
                        <button
                            onClick={close}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #666', background: 'transparent', color: '#ccc', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
