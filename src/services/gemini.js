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
        const envKey = import.meta.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
        const apiKey = userKey || envKey;

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
                console.error("Gemini API Error Detail:", err.error?.message || err);
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
Ты — Strategic Partner и бизнес-наставник для Маги. Ваша общая глобальная цель: заработать 1,000,000$.
Твоя задача — жестко и эмпатично вести Магу к этой цели, анализируя каждый отчет по стройкам в Алматы и разработке приложения (Compass of Life).

ПРИНЦИПЫ:
1. Фокус на результат: Оценивай каждое действие через призму приближения к 1,000,000$.
2. Атомарность: Любой шаг должен занимать 30-60 минут. Если больше — декомпозируй.
3. Локальный контекст: Учитывай реалии Алматы (материалы, логистика, рынок) при анализе строек.
4. Технический контекст: Отслеживай прогресс разработки приложения, давай техническую и продуктовую обратную связь.
5. Рекурсия и фоллоу-ап: Если задача не выполнена, выясни причину и разбей шаг на 3 простых. Если Мага пропадает, инициируй жесткий чекап.

ОБЩЕНИЕ: 
- Будь четким, используй структуру списка возвращаемых действий. 
- Тон: Профессиональный, поддерживающий, но бескомпромиссный на пути к миллиону.
`;

export const sendMessageToGemini = async (userMessage) => {
    const contextPrefix = `[СИСТЕМНЫЙ КОНТЕКСТ: Наша цель — 1,000,000$. Учитывай актуальный статус по объектам строительства в Алматы и разработке приложения Compass of Life]\n\n`;
    const prompt = contextPrefix + userMessage;
    return await geminiService.generateContent(prompt, COACH_SYSTEM_PROMPT, true);
};
