import { useState, useRef } from 'react';

// Techno Item 47: AR/VR Prep (Camera Hook)
export const useCamera = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (e) {
            setError(e);
            console.error('Camera failed', e);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    return { videoRef, startCamera, stopCamera, error };
};
