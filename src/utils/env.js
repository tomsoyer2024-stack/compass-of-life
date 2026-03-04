// Arch Item 31: Env Validation (Zod-lite)
export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    IS_DEV: import.meta.env.DEV,

    validate() {
        const errors = [];
        if (!this.SUPABASE_URL) errors.push('Missing VITE_SUPABASE_URL');
        if (!this.SUPABASE_KEY) errors.push('Missing VITE_SUPABASE_ANON_KEY');
        if (!this.GEMINI_API_KEY) errors.push('Missing VITE_GEMINI_API_KEY');

        if (errors.length > 0) {
            console.warn('Environment Validation Failed:', errors.join(', '));
            return false;
        }
        return true;
    }
};
