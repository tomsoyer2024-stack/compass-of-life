/**
 * StrategyEngine: Proposes different ways to achieve a goal.
 */
export const StrategyEngine = {
    /**
     * Categories of paths.
     */
    PATH_TYPES: {
        ECONOMY: { id: 'economy', label: 'Путь Экономии', focus: 'Minimum money, Maximum effort' },
        SPEED: { id: 'speed', label: 'Путь Скорости', focus: 'Delegation and Delivery' },
        BALANCE: { id: 'balance', label: 'Оптимальный путь', focus: 'Based on your energy' }
    },

    /**
     * Formulates strategies based on goal and persona.
     */
    async generateStrategies(goal, persona) {
        // This is a logic wrapper that will be used by GoalDecomposer to prompt Gemini
        // We define the structure here for UI mapping.
        return [
            { id: 'economy', title: 'Self-Execution', details: 'Do it manually, search for discounts.' },
            { id: 'speed', title: 'Auto-Pilot', details: 'Use Kaspi/Bolat for delivery, delegate calls.' },
            { id: 'balance', title: 'Hybrid', details: persona.psychotype === 'achiever' ? 'Perform high-impact steps, delegate the rest.' : 'Steady progress.' }
        ];
    }
};
