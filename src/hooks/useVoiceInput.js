import { useState, useCallback, useEffect } from 'react';

// Techno Item 45: Voice Input (Speech API)
export const useVoiceInput = (language = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) return;

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = language;
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognition.onerror = (event) => {
                setError(event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (e) {
            setError('Failed to start recognition');
            console.error(e);
        }
    }, [language, isSupported]);

    return { isListening, transcript, startListening, error, isSupported };
};
