import { useState, useEffect, useCallback } from 'react';

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export const useKonamiCode = (callback: () => void) => {
    const [keys, setKeys] = useState<string[]>([]);

    const keyHandler = useCallback((e: KeyboardEvent) => {
        setKeys(prevKeys => {
            const newKeys = [...prevKeys, e.key].slice(-konamiCode.length);
            if (JSON.stringify(newKeys) === JSON.stringify(konamiCode)) {
                callback();
            }
            return newKeys;
        });
    }, [callback]);

    useEffect(() => {
        window.addEventListener('keydown', keyHandler);
        return () => {
            window.removeEventListener('keydown', keyHandler);
        };
    }, [keyHandler]);
};
