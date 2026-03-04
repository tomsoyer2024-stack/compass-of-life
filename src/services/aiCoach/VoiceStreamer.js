import { PersonalOnDeviceAI } from './PersonalOnDeviceAI';

/**
 * VoiceStreamer: Handles voice input and task extraction.
 */
export const VoiceStreamer = {
    /**
     * Converts a sumburous thought stream into structured tasks.
     */
    async extractTasksFromVoice(transcript) {
        const prompt = `
            Я надиктовал поток мыслей: "${transcript}"
            
            Твои задачи:
            1. Убери эмоции и лишние слова.
            2. Вычлени конкретные ЗАДАЧИ.
            3. Распредели их по категориям (Бизнес, Семья, Стройка и т.д.).
            
            Верни JSON: { "summary": "...", "tasks": [{ "title": "...", "category": "..." }] }
        `;

        const response = await PersonalOnDeviceAI.generate(prompt, "Ты — эксперт по планированию на лету.");
        try {
            const cleanJson = response.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            return { summary: transcript, tasks: [] };
        }
    }
};
