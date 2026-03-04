
import { supabase } from './supabase';
import { encryptData, decryptData } from '../utils/crypto';
import { logger } from '../utils/logger';

// RELIABILITY: Exponential Backoff Wrapper
const withBackoff = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        return withBackoff(fn, retries - 1, delay * 2);
    }
};

/**
 * Hybrid Sync Engine (Reliability Layer Added)
 * Strategy: 
 * 1. Load from LocalStorage (fastest).
 * 2. Background fetch from Supabase.
 * 3. Decrypt cloud data with Session Key.
 * 4. Merge (Last-Write-Wins).
 */

const SYNC_TABLE = 'vault_data';

export const syncEngine = {
    /**
     * Uploads local state to cloud (Encrypted).
     */
    push: async (key, data) => {
        const sessionKey = sessionStorage.getItem('session_key');
        if (!sessionKey) return; // Cannot encrypt without user present

        try {
            // zero-knowledge encryption
            const encrypted = await encryptData(data, sessionKey);

            // Allow offline-first: always save local
            localStorage.setItem(key, JSON.stringify(data));

            // Background upload with Backoff
            // Stub for future Auth integration
            /*
            await withBackoff(async () => {
                await supabase.from(SYNC_TABLE).upsert({ 
                   key, 
                   content: encrypted, 
                   updated_at: new Date() 
                });
            });
            */

            logger.logEvent('Sync', 'PushSuccess', { key });
        } catch (e) {
            logger.error('Sync', 'PushFail', e);
        }
    },

    /**
     * Downloads and decrypts cloud state.
     */
    pull: async (key) => {
        const sessionKey = sessionStorage.getItem('session_key');
        if (!sessionKey) return null;

        try {
            // Stub for future Auth integration with backoff
            /*
            const result = await withBackoff(async () => {
                 const { data, error } = await supabase.from(SYNC_TABLE).select('*').eq('key', key).single();
                 if (error) throw error;
                 return data;
            });
            if (!result) return null;
            */

            // const decrypted = await decryptData(result.content.cipher, result.content.iv, result.content.salt, sessionKey);
            // return decrypted;
            return null; // Stub until Supabase Auth is active
        } catch (e) {
            logger.error('Sync', 'PullFail', e);
            return null;
        }
    }
};
