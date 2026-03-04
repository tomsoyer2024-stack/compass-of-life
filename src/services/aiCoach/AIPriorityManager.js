/**
 * AIPriorityManager: Ranks tasks based on User Persona and Energy.
 */
export const AIPriorityManager = {
    // Current user state (Persona)
    getUserProfile() {
        const saved = localStorage.getItem('ai_user_profile');
        return saved ? JSON.parse(saved) : {
            psychotype: 'balanced', // e.g., 'achiever', 'analytical', 'creative'
            energyLevel: 70, // 0-100
            goals: [],
            history: []
        };
    },

    setUserProfile(profile) {
        localStorage.setItem('ai_user_profile', JSON.stringify(profile));
    },

    /**
     * Ranks a list of tasks. 
     * If energy is low (<30), priority goes to low-effort tasks.
     * If energy is high (>70), priority goes to "Big Rocks" (Deep Work).
     */
    rankTasks(tasks, energyLevel) {
        return [...tasks].sort((a, b) => {
            const aEffort = a.estimatedMinutes || 45;
            const bEffort = b.estimatedMinutes || 45;

            if (energyLevel < 30) {
                // Low energy: Sort by least effort
                return aEffort - bEffort;
            } else if (energyLevel > 75) {
                // High energy: Sort by most impact (usually higher effort/importance)
                return bEffort - aEffort;
            }
            return 0; // Default order
        });
    }
};
