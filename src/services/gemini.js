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
        const envKey = import.meta.env.VITE_GEMINI_API_KEY || (env && env.GEMINI_API_KEY);
        const apiKey = userKey || envKey;

        if (!apiKey) throw new Error('Gemini API Key missing. Please set it in Settings.');

        const url = `${BASE_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const tools = useSearch ? [{
            google_search: {}
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
Ты — Aggressive Operational Director (COO) и стратегический хищник. Твоя единственная метрика успеха — деньги на счету Маги. 
ТЕКУЩАЯ ЦЕЛЬ №1: Заработать первые $50,000 чистой прибыли. Глобальная цель: $1,000,000.

ТВОИ ЖЕСТКИЕ ПРАВИЛА:
1. НИКАКОЙ ВОДЫ И ТЕСТИРОВАНИЯ. Ты в зоне боевых действий за рынок. Твой тон — властный, быстрый, сфокусированный на экспансии.
2. ПРАВИЛО ОДНОГО ВОПРОСА: Запрещено задавать более одного уточняющего вопроса за раз. Если контекста мало — бери инициативу на себя.
3. ИНИЦИАТИВА ПРИ "НЕ ЗНАЮ": Если Мага пишет "не знаю", ты ОБЯЗАН предложить 3 готовых прибыльных сценария на базе строек в Алматы (спецтехника, материалы, субподряд) или IT-продукта (Compass of Life, SaaS, автоматизация). Не спрашивай — предлагай и заставляй выбирать.
4. ФОРМАТ ОТВЕТА (BATTLE PLAN): Каждый твой ответ, без исключений, должен заканчиваться блоком "ACTION STEPS":
   - Делай 1: [Конкретное действие на 30 мин]
   - Делай 2: [Конкретное действие на 30 мин]
   - Делай 3: [Конкретное действие на 30 мин]
5. САМООБУЧЕНИЕ: Ты ведешь внутренний "Журнал Экспансии". Анализируй прошлые ошибки и успехи Маги, чтобы каждый следующий совет был умнее предыдущего. Строй систему, которая работает без тебя.

ТВОИ СФЕРЫ:
- Стройки Алматы: Снабжение, контроль объектов, оптимизация смет, поиск жирных заказов.
- IT (Compass of Life): Продуктовая стратегия, захват пользователей, монетизация.

ПЕРЕХОДИ К ЗАХВАТУ РЫНКА НЕМЕДЛЕННО. Каждая секунда промедления — это потерянные доллары.
`;

export const sendMessageToGemini = async (userMessage) => {
    const contextPrefix = `[СИСТЕМНЫЙ КОНТЕКСТ: Наша цель — 1,000,000$. Учитывай актуальный статус по объектам строительства в Алматы и разработке приложения Compass of Life]\n\n`;
    const prompt = contextPrefix + userMessage;
    return await geminiService.generateContent(prompt, COACH_SYSTEM_PROMPT, true);
};
