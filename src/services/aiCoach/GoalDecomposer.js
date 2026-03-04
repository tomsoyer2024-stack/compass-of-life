import { PersonalOnDeviceAI } from './PersonalOnDeviceAI';
import { COACH_SYSTEM_PROMPT } from '../gemini';
import { ContextService } from './ContextService';

import { z } from 'zod';

// Zod Schemas
const StepSchema = z.object({
    title: z.string(),
    isHeader: z.boolean().optional().default(false),
    completed: z.boolean().optional().default(false)
});

const ClarifyResponseSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("question"), question: z.string() }),
    z.object({ type: z.literal("interview"), questions: z.array(z.string()) }),
    z.object({ type: z.literal("steps"), steps: z.array(StepSchema) })
]);

/**
 * GoalDecomposer: Handles universal 15-min decomposition, strategies, and briefings.
 */
export const GoalDecomposer = {
    /**
     * SMART GOAL REFINEMENT:
     * Analyzes the goal. If ambiguous, asks a clarifying question.
     * If clear, provides immediate steps.
     */
    async clarifyGoal(userGoal, contextStr = '') {
        const prompt = `
            Analyze this user goal: "${userGoal}".
            Context: ${contextStr}.

            Role: You are an elite productivity coach.
            
            Task:
            1. Is the goal specific enough to be immediately actionable?
            2. If NO (ambiguous):
               - Ask ONE single clarifying question.
            3. If IT IS A COMPLEX PROJECT (e.g. "Build house", "Start business"):
               - Return type "interview" with 3 questions: [Target Audience/User?], [Budget?], [Deadline?].
            4. If YES (specific):
               - Break it down into STAGES (Headers) and TASKS.
               - Steps format: { "title": "...", "isHeader": boolean }
            
            Format: JSON object ONLY.
            Type A (Needs Clarification): { "type": "question", "question": "..." }
            Type B (Project Interview): { "type": "interview", "questions": ["Question 1?", "Question 2?", "Question 3?"] }
            Type C (Actionable):
            {
              "type": "steps",
              "steps": [
                { "title": "PHAZE 1: PREP", "isHeader": true }, 
                { "title": "Step 1...", "isHeader": false }
              ]
            }
        `;

        const response = await PersonalOnDeviceAI.generate(prompt, COACH_SYSTEM_PROMPT, { useSearch: false });
        try {
            const cleanJson = response.text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            // Zod Validation
            const validated = ClarifyResponseSchema.parse(parsed);
            return validated;
        } catch (e) {
            console.error("Zod/Parse Error:", e);
            // Fallback for types that might not match exactly but are close, or simple error
            return { type: "question", question: "Could you provide more specific details? (AI Error)" };
        }
    },

    /**
     * PROACTIVE DECOMPOSITION: 15-min atomicity + Strategy selection + Briefing.
     */
    async decomposeGoal(goalTitle, goalDescription, persona) {
        const context = await ContextService.getAlmatyContext();
        // ... existing implementation remains ..

        const prompt = `
            У меня есть цель: "${goalTitle}". 
            Описание: ${goalDescription}.
            
            КОНТЕКСТ (Алматы): Погода: ${context.weather}, Трафик: ${context.traffic}. 
            
            Твои задачи:
            1. Составь "Briefing" (30-секундное резюме): Каков главный фокус дня и что уже подготовлено.
            2. Предложи "Three Paths" (Три пути): 
               - Путь Экономии (минимум денег)
               - Путь Скорости (делегирование/доставка)
               - Оптимальный (баланс)
            3. Для выбранной стратегии (Оптимальный по умолчанию) разбей её на шаги по 15 МИНУТ.
            4. Найди "Чит-коды": Специфические лайфхаки для Алматы.
            
            Формат: JSON объект: 
            { 
              "briefing": "...", 
              "strategies": { "economy": "...", "speed": "...", "balance": "..." },
              "steps": [{ "title": "...", "description": "...", "estimatedMinutes": 15, "isCheatCode": boolean, "category": "..." }] 
            }
        `;

        const DecomposeSchema = z.object({
            briefing: z.string(),
            strategies: z.object({
                economy: z.string(),
                speed: z.string(),
                balance: z.string()
            }),
            steps: z.array(z.object({
                title: z.string(),
                description: z.string().optional(),
                estimatedMinutes: z.number().optional(),
                isCheatCode: z.boolean().optional(),
                category: z.string().optional()
            }))
        });

        // ... inside decomposeGoal ...
        const response = await PersonalOnDeviceAI.generate(prompt, COACH_SYSTEM_PROMPT, { useSearch: true });
        try {
            const cleanJson = response.text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            const validated = DecomposeSchema.parse(parsed);
            return { ...validated, source: response.source };
        } catch (e) {
            console.error("Zod/Parse Error in Decompose:", e);
            return { briefing: "Error generating plan.", steps: [], strategies: {}, source: response.source };
        }
    },

    /**
     * RECURSIVE DESCENT (1 -> 5):
     * If user is stuck or failed, split 1 step into 5 micro-actions (3-5 mins each).
     */
    async splitProblematicStep(stepTitle, reason) {
        const prompt = `
            ПОДДЕРЖКА ПРИ САБОТАЖЕ: Пользователь не сделал задачу "${stepTitle}". 
            Причина: "${reason}".
            
            Примени "Рекурсивный спуск": Разбей этот ОДИН шаг на 5 микро-действий по 3-5 минут. 
            Задача — сделать начало настолько легким, чтобы человек не мог отказаться. 
            Пример первого шага: "Просто открой сайт", "Просто возьми телефон в руку".
            
            Формат: JSON массив из 5 объектов: [{ "title": "...", "description": "..." }]
        `;

        const response = await PersonalOnDeviceAI.generate(prompt, COACH_SYSTEM_PROMPT, { forceCloud: true, useSearch: true });
        try {
            const cleanJson = response.text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            return [];
        }
    }
};
