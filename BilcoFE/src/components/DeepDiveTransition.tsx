import { useEffect, useState } from 'react';
import './DeepDiveTransition.css';

interface DeepDiveTransitionProps {
    mode: 'enter' | 'exit'; // enter = reveal page (fade out overlay), exit = cover page (ripple expand)
    onComplete?: () => void;
}

const DeepDiveTransition = ({ mode, onComplete }: DeepDiveTransitionProps) => {
    
    useEffect(() => {
        // Animation duration matches CSS (1.2s total safety)
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 1200);
        return () => clearTimeout(timer);
    }, [mode, onComplete]);

    const animClass = mode === 'enter' ? 'dive-enter' : 'dive-exit';

    return (
        <div className={`dive-overlay ${animClass}`}>
            <div className="dive-ripple"></div>
            <div className="dive-logo">
                <span className="dive-logo-icon">🌊</span>
                <span className="dive-logo-text">Bilco</span>
            </div>
        </div>
    );
};

export default DeepDiveTransition;
