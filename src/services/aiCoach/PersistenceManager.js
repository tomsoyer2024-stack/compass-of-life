import { GoalDecomposer } from './GoalDecomposer';
import { haptic } from '../../utils/haptics';

/**
 * PersistenceManager: The "Insistent Mentor" logic.
 * Detects if tasks are stalling and triggers interventions.
 */
export const PersistenceManager = {
    /**
     * Checks if a task is overdue. 
     * If so, triggers a "Recursive Descent" modal or notification.
     */
    async intervene(task) {
        haptic.heavy();

        // Logical check: Is user afraid or just lacking info?
        const questions = [
            "Тебе не хватает информации?",
            "Ты боишься начать?",
            "Или просто скучно?"
        ];

        return {
            intervene: true,
            questions,
            originalTask: task
        };
    },

    /**
     * Real-time adjustment for "One-word" feedback.
     */
    async quickAdjust(action, feedback) {
        // feedback can be 'lazy', 'expensive', 'hard'
        let adjustmentPrompt = "";
        if (feedback === 'lazy') adjustmentPrompt = "Сделай это за 2 минуты.";
        if (feedback === 'expensive') adjustmentPrompt = "Найди бесплатный способ.";
        if (feedback === 'hard') adjustmentPrompt = "Разбей еще на 5 шагов.";

        return await GoalDecomposer.splitProblematicStep(action.title, adjustmentPrompt);
    }
};
