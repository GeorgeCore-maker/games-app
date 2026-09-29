import { useEffect } from 'react';

/**
 * La transicion se activa tras el primer montaje: si no, el body animaria de
 * transparente al color del tema al cargar y se veria un destello.
 */
export default function useEnableColorModeTransition() {
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            document.documentElement.dataset.colorModeReady = 'true';
        });
        return () => cancelAnimationFrame(frame);
    }, []);
}
