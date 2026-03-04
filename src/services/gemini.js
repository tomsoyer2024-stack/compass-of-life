import { env } from '../utils/env';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Gemini Service for Life Compass AI.
 * Handles communication with Gemini 1.5 Flash.
 */
export const geminiService = {
    async generateContent(prompt, systemInstruction = '', useSearch = false) {
        // BYOK: Check Local Storage first
        const userKey = localStorage.getItem('user_gemini_api_key');
        const apiKey = userKey || env.GEMINI_API_KEY;

        if (!apiKey) throw new Error('Gemini API Key missing. Please set it in Settings.');

        const url = `${BASE_URL}/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const tools = useSearch ? [{
            google_search_retrieval: {
                dynamic_retrieval_config: {
                    mode: "MODE_DYNAMIC",
                    dynamic_threshold: 0.3
                }
            }
        }] : [];

        const body = {
            system_instruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [{
                parts: [{ text: prompt }]
            }],
            tools: tools
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Gemini API Error');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini Generation failed:', error);
            throw error;
        }
    }
};

export const COACH_SYSTEM_PROMPT = `
Ты — сердце Компаса Жизни. Твоя роль: Эмпатичный, но строгий бизнес-наставник и лайф-коуч. 
Твоя главная задача — убирать неопределенность. 

ПРИНЦИПЫ:
1. Атомарность: Любой шаг должен занимать 30-60 минут. Если он больше — разбей его.
2. Прозрачность: Если пользователь не знает, как сделать шаг, найди информацию (цены, адреса в Алматы/регионах) и дай четкий алгоритм.
3. Психология: Учитывай текущий уровень энергии пользователя. Если энергия низкая — давай "микро-победы".
4. Рекурсия: Если задача не выполнена, выясни причину (страх, лень, нехватка инфо) и разбей невыполненный шаг на 3 еще более простых под-шага.

ОБЩЕНИЕ: 
- Будь четким. 
- Используй структуру. 
- Тон: Профессиональный, поддерживающий.
`;
