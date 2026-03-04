import { geminiService } from '../gemini';

/**
 * PersonalOnDeviceAI: Universal bridge for local vs cloud intelligence.
 * Prioritizes window.ai (Gemini Nano) on Android and Apple Intelligence on iOS.
 */
export const PersonalOnDeviceAI = {
    async isLocalAvailable() {
        // Browser / Android
        if (window.ai && window.ai.canCreateTextSession) return 'gemini-nano';

        // iOS / Apple Intelligence (Mock/Bridge)
        // In a real Capacitor app, this would check a native plugin
        if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') return 'apple-intelligence';

        return null;
    },

    async generate(prompt, systemPrompt, options = {}) {
        const localType = await this.isLocalAvailable();

        if (localType === 'gemini-nano' && !options.forceCloud) {
            console.log("Using Gemini Nano (Android/Chrome)");
            try {
                // Timeout logic: If local AI takes too long, fallback instantly
                const promptTask = async () => {
                    const session = await window.ai.createTextSession();
                    const response = await session.prompt(`${systemPrompt}\n\nMessage: ${prompt}`);
                    return { text: response, source: 'Gemini Nano (Local)' };
                };

                const timeoutTask = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Local AI Timeout")), 3000)
                );

                return await Promise.race([promptTask(), timeoutTask]);
            } catch (e) {
                console.warn("Local AI failed or timed out, falling back to Flash", e);
            }
        }

        if (localType === 'apple-intelligence' && !options.forceCloud) {
            console.log("Using Apple Intelligence (iOS Bridge)");
            return { text: "This goal was decomposed using Apple Intelligence on your iOS device.", source: 'Apple Intelligence' };
        }

        // Fallback to Gemini Flash 1.5 (Cloud)
        console.log("Using Gemini Flash 1.5 (Cloud Fallback)");
        const response = await geminiService.generateContent(prompt, systemPrompt, options.useSearch || false);
        return { text: response, source: 'Gemini 1.5 Flash (Cloud)' };
    },

    analyzeTone(input) {
        const length = input.length;
        const isShort = length < 20;
        const containsDoubt = /не знаю|наверное|сложно|трудно|maybe|hesitant|hard/.test(input.toLowerCase());

        return {
            mode: isShort ? 'succinct' : 'detailed',
            isHesitant: containsDoubt,
            toneStrength: isShort ? 1 : 0.5
        };
    }
};
