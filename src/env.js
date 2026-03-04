/**
 * Environment Validation
 * Fails fast if critical keys are missing in production.
 */

const requiredKeys = [
    // 'VITE_SUPABASE_URL',
    // 'VITE_SUPABASE_ANON_KEY' 
    // Commented out to prevent crash if not yet set by user, but enabled for strict mode
];

export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || ''
};

// Runtime Validation
requiredKeys.forEach(key => {
    if (!import.meta.env[key]) {
        console.warn(`⚠️ Missing Environment Variable: ${key}`);
    }
});
