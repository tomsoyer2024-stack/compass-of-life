import { Preferences } from '@capacitor/preferences';

// SAFETY TIMEOUT: If native layer hangs, fail fast (2s)
const SAFE_TIMEOUT_MS = 2000;

const withTimeout = (promise, fallbackValue = null) => {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => {
            console.warn('⚠️ NATIVE STORAGE TIMEOUT');
            resolve(fallbackValue);
        }, SAFE_TIMEOUT_MS))
    ]);
};

// Async Wrapper for Storage Upgrade
export const storage = {
    get: async (key, def = null) => {
        try {
            // Wait for native call with timeout
            const result = await withTimeout(Preferences.get({ key }), { value: null });

            // Handle timeout or missing value
            if (!result || result.value === null) return def;

            try {
                return JSON.parse(result.value);
            } catch {
                return result.value;
            }
        } catch (e) {
            console.error('Storage Get Error:', e);
            return def;
        }
    },
    set: async (key, value) => {
        try {
            const val = typeof value === 'string' ? value : JSON.stringify(value);
            await withTimeout(Preferences.set({ key, value: val }), null);
        } catch (e) {
            console.error('Storage Set Error:', e);
        }
    },
    remove: async (key) => {
        try {
            await withTimeout(Preferences.remove({ key }), null);
        } catch (e) {
            console.error('Storage Remove Error:', e);
        }
    },
    clear: async () => {
        try {
            await withTimeout(Preferences.clear(), null);
        } catch (e) {
            console.error('Storage Clear Error:', e);
        }
    }
};
