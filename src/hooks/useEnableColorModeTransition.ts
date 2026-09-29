import { useEffect } from 'react';

/**
 * La transicion entre temas solo se activa despues del primer montaje.
 * Si estuviera activa desde el inicio, el body animaria de transparente al
 * color del tema al cargar y se veria un destello en cada visita.
 */
export default function useEnableColorModeTransition() {
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            document.documentElement.dataset.colorModeReady = 'true';
        });
        return () => cancelAnimationFrame(frame);
    }, []);
}
