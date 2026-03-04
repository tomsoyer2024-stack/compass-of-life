import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';


export const useStatusBarTheme = (isDark = false) => {
    useEffect(() => {
        const applyTheme = async () => {
            // In current app structure, we might not have 'isDark' state easily accessible globally yet,
            // assuming Light Mode default based on 'white' background or logic.
            // But prompt says: "If Dark Mode: ... If Light Mode: ..."

            try {
                if (isDark) {
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: '#00000000' }); // Transparent
                } else {
                    await StatusBar.setStyle({ style: Style.Light });
                    await StatusBar.setBackgroundColor({ color: '#00000000' });
                }

                // Overlay for full immersive
                await StatusBar.setOverlaysWebView({ overlay: true });
            } catch (e) {
                // Web fallback
            }
        };
        applyTheme();
    }, [isDark]);
};
