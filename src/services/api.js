// Arch Item 32: API Layer (Axios-style wrapper)
import { env } from '../utils/env';

const headers = {
    'Content-Type': 'application/json',
    'apikey': env.SUPABASE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_KEY}`
};

/**
 * Lightweight API wrapper for Supabase REST endpoints.
 * @namespace api
 */
export const api = {
    /**
     * Performs a GET request.
     * @param {string} endpoint - The API endpoint (e.g., '/rest/v1/goals').
     * @returns {Promise<any>} The JSON response.
     * @throws {Error} If the request fails.
     */
    get: async (endpoint) => {
        try {
            const res = await fetch(`${env.SUPABASE_URL}${endpoint}`, { headers });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error('GET Failed', e);
            throw e;
        }
    },

    /**
     * Performs a POST request.
     * @param {string} endpoint - The API endpoint.
     * @param {object} body - The JSON payload.
     * @returns {Promise<any>} The JSON response.
     * @throws {Error} If the request fails.
     */
    post: async (endpoint, body) => {
        try {
            const res = await fetch(`${env.SUPABASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            return await res.json();
        } catch (e) {
            console.error('POST Failed', e);
            throw e;
        }
    }
};
