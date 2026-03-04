/**
 * Black Box Logging System
 * Records critical user actions, errors, and system events.
 * Ready for future integration with analytics services (e.g., Sentry, Mixpanel).
 */

const LOG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug'
};

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep local history limited
    }

    /**
     * Log an event to the system.
     * @param {string} category - Functional area (e.g., 'Auth', 'Investments', 'Calculator')
     * @param {string} action - Action performed (e.g., 'Click', 'Calculate', 'Error')
     * @param {object} data - Additional metadata
     * @param {string} level - 'info', 'warn', 'error', 'debug'
     */
    logEvent(category, action, data = {}, level = LOG_LEVELS.INFO) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, category, action, data };

        // Console output for development
        const style = this._getConsoleStyle(level);
        console.log(`%c[${category}] ${action}`, style, data);

        // In production, this would send data to a backend
        this._persistLog(logEntry);
    }

    error(category, action, error, data = {}) {
        this.logEvent(category, action, { ...data, error: error.message, stack: error.stack }, LOG_LEVELS.ERROR);
    }

    _getConsoleStyle(level) {
        switch (level) {
            case LOG_LEVELS.ERROR: return 'color: #ff5252; font-weight: bold;';
            case LOG_LEVELS.WARN: return 'color: #ffba00; font-weight: bold;';
            case LOG_LEVELS.DEBUG: return 'color: #aaa;';
            default: return 'color: #00bcd4; font-weight: bold;';
        }
    }

    _persistLog(entry) {
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) this.logs.pop();

        // PERSISTENCE: Save last 50 logs to localStorage for diagnosis
        try {
            const criticalLogs = this.logs.filter(l => l.level === 'error' || l.level === 'warn').slice(0, 50);
            localStorage.setItem('engineering_intelligence_log', JSON.stringify(criticalLogs));
            localStorage.setItem('last_user_activity', new Date().toISOString());

            // Cloud Sync
            import('../services/supabase').then(({ supabase }) => {
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        supabase.from('system_logs').insert([{
                            user_id: user.id,
                            level: entry.level,
                            category: entry.category,
                            action: entry.action,
                            data: entry.data, // assuming jsonb type in supabase
                            timestamp: entry.timestamp
                        }]).then(({ error }) => {
                            if (error) console.warn('Supabase log sync failed', error);
                        });
                    }
                });
            });
        } catch (e) {
            // Silently fail if storage is full
        }
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('engineering_intelligence_log');
    }

    getHistory() {
        return this.logs;
    }
}

export const logger = new Logger();
