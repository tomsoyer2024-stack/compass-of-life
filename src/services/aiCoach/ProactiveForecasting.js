/**
 * ProactiveForecasting: Predicts task failure before it happens.
 * Analyzes historical patterns.
 */
export const ProactiveForecasting = {
    /**
     * Analyzes history to find "Friction Tokens".
     */
    predictFriction(history, currentTask, currentTime) {
        // Simple pattern analysis:
        // 1. Time-based: Does user fail this category at this time?
        const categorySamples = history.filter(h => h.category === currentTask.category);
        const lateFails = categorySamples.filter(h => h.status === 'decomposed' && h.time > 17);

        if (currentTime > 16 && lateFails.length >= 2) {
            return {
                probability: 0.85,
                reason: "Historical fatigue in the afternoon for this work type.",
                suggestion: "Move to tomorrow morning or simplify to 5 min."
            };
        }

        // 2. Resource-based (if metadata exists)
        if (currentTask.requiresPhone && !currentTask.hasContact) {
            return {
                probability: 0.95,
                reason: "Missing contact information.",
                suggestion: "I'll find the contact info for you first."
            };
        }

        return null;
    },

    /**
     * Self-Refining Difficulty Level.
     */
    getDifficultyMultiplier(history) {
        const streak = history.slice(-5).filter(h => h.status === 'completed').length;
        if (streak >= 4) return 1.25; // Increase difficulty
        if (streak <= 1) return 0.75; // Decrease complexity
        return 1.0;
    }
};
