import { supabase } from './supabase';

/**
 * Keep Alive Service
 * Pings the database periodically to prevent cold starts.
 */
export const keepAlive = {
    /**
     * Starts the ping interval.
     * @param {number} intervalMs - Ping interval in milliseconds (default: 5 min).
     * @returns {Function} Function to stop the pinger.
     */
    start: (intervalMs = 300000) => {
        const ping = async () => {
            try {
                const { error } = await supabase.from('goals').select('id').limit(1);
                if (error) console.warn('KeepAlive: Ping failed', error);
                // else console.log('KeepAlive: Ping success');
            } catch (e) {
                console.error('KeepAlive: Network error', e);
            }
        };

        ping(); // Initial ping
        const intervalId = setInterval(ping, intervalMs);
        return () => clearInterval(intervalId);
    }
};
