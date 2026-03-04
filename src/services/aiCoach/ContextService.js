/**
 * ContextService: Environmental awareness for Almaty.
 * Provides real-world constraints to the planning engine.
 */
export const ContextService = {
    /**
     * Get local Almaty context.
     * Mocked for now, but structured for real API integration.
     */
    async getAlmatyContext() {
        // Simulation: Suppose it's 18:00 and traffic is high.
        const hour = new Date().getHours();
        const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);

        return {
            location: 'Almaty',
            weather: 'Mostly Sunny', // e.g., 'Snowstorm', 'Rain'
            traffic: isRushHour ? 'Heavy (9/10)' : 'Moderate (4/10)',
            isBadWeather: false,
            marketHours: '9:00 - 18:00',
            hints: isRushHour ? 'Avoid Sain and Al-Farabi' : 'Standard routes OK'
        };
    },

    /**
     * Determines if a physical task is feasible.
     */
    isPhysicalTaskOk(context) {
        if (context.isBadWeather) return false;
        if (context.traffic === 'Heavy (9/10)') return 'suggest_delivery';
        return true;
    }
};
