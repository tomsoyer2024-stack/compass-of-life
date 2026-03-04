import { PersonalOnDeviceAI } from './PersonalOnDeviceAI';

/**
 * MotivationEngine: The "5 Whys" system for overcoming sabotage.
 */
export const MotivationEngine = {
    /**
     * Conducts a motivational probe when a user says "I don't want to".
     */
    async analyzeResistance(task, userStatement) {
        const prompt = `
            Пользователь саботирует задачу: "${task.title}".
            Его слова: "${userStatement}".
            
            Твоя роль: Эмпатичный психолог-коуч. Примени метод "5 Почему", чтобы найти корень:
            - Это страх ошибки?
            - Нехватка знаний?
            - Просто выгорание?
            
            Дай один глубокий вопрос, который заставит пользователя задуматься, и предложи ОДНО микро-действие на 2 минуты.
        `;

        return await PersonalOnDeviceAI.generate(prompt, "Ты — мастер мотивации и эксперт по поведенческой психологии.");
    },

    /**
     * Generates a "Dopamine Reward" badge text.
     */
    getReward(task, persona) {
        const tone = persona.psychotype === 'achiever' ? 'Сухое и профессиональное' : 'Эмоциональное и теплое';
        // Mocking for now - in reality, Gemini would generate this.
        return persona.psychotype === 'achiever'
            ? `Цель "${task.title}" достигнута. +1% к прогрессу.`
            : `Ты это сделал! "${task.title}" позади. Маленький шаг, большой результат! 🌟`;
    }
};
