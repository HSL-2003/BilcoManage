import { useEffect } from 'react';
import './WaveTransition.css';

interface WaveTransitionProps {
    mode: 'enter' | 'exit'; // 'enter' = reveal page (wave goes up away), 'exit' = cover page (wave comes up)
    onComplete?: () => void;
}

const WaveTransition = ({ mode, onComplete }: WaveTransitionProps) => {
    
    useEffect(() => {
        // Animation duration is roughly 1s
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 1200);
        return () => clearTimeout(timer);
    }, [mode, onComplete]);

    const animationClass = mode === 'enter' ? 'wave-anim-enter' : 'wave-anim-exit';

    return (
        <div className={`wave-transition-container ${animationClass}`}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="waveGradientFront" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="waveGradientMid" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                    <linearGradient id="waveGradientBack" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Waves */}
            <div className="wave-layer wave-back">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="url(#waveGradientBack)" fillOpacity="0.7" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            <div className="wave-layer wave-mid">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="url(#waveGradientMid)" fillOpacity="0.8" d="M0,256L48,245.3C96,235,192,213,288,181.3C384,149,480,107,576,122.7C672,139,768,213,864,240C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            <div className="wave-layer wave-front">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="url(#waveGradientFront)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            
            <div className="wave-bg-fill"></div>
        </div>
    );
};

export default WaveTransition;
