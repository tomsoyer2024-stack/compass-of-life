import { env } from '../../utils/env';

/**
 * VisionAssistant: Processes images using Gemini 1.5 Flash Vision.
 */
export const VisionAssistant = {
    async analyzePhoto(base64Image, promptPrefix = "") {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API Key missing');

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const body = {
            contents: [{
                parts: [
                    { text: promptPrefix || "Проанализируй фото. Какие задачи здесь нужно выполнить? Разбей их на атомарные шаги по 15 минут. Верни JSON массив: [{title, description}]" },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image // expects base64 without prefix
                        }
                    }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Vision API Failed");
        const data = await response.json();

        try {
            const text = data.candidates[0].content.parts[0].text;
            const cleanJson = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Vision Parsing failed", e);
            return [];
        }
    }
};
