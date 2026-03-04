import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';

export const useHardwareBack = (handler) => {
    useEffect(() => {
        const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
            if (handler) {
                handler();
            } else {
                // Default behavior or custom event dispatch if needed
                window.dispatchEvent(new CustomEvent('hardwareBack'));
            }
        });

        return () => {
            backListener.then(h => h.remove());
        };
    }, [handler]);
};
