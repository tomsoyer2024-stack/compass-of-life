import { supabase } from './supabase';

export const checkForUpdates = async (currentVersion) => {
    try {
        const { data, error } = await supabase
            .from('app_versions')
            .select('*')
            .order('version', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            const latest = data[0].version;
            if (latest !== currentVersion) {
                return {
                    available: true,
                    version: latest,
                    url: data[0].download_url,
                    changelog: data[0].changelog
                };
            }
        }
    } catch (e) {
        console.error("Update check failed:", e);
    }
    return { available: false };
};
