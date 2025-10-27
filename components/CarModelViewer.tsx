import React from 'react';

interface CarModelViewerProps {
    drag: number;
    downforce: number;
}

export const CarModelViewer: React.FC<CarModelViewerProps> = ({ drag, downforce }) => {
    // Normalize drag (0.25 to 0.6) and downforce (-1.5 to -0.8) to a 0-1 range for styling
    const dragNormalized = (drag - 0.25) / (0.6 - 0.25);
    const downforceNormalized = (Math.abs(downforce) - 0.8) / (1.5 - 0.8);

    return (
        <div className="relative w-full aspect-video bg-background-primary rounded-lg overflow-hidden flex items-center justify-center p-4">
            {/* Airflow Lines */}
            <svg className="absolute w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                {/* Top airflow - more turbulent with higher drag */}
                <path 
                    d="M 0 60 Q 150 50, 250 70 T 400 80" 
                    className="stroke-primary"
                    fill="none" 
                    strokeWidth="1.5" 
                    strokeDasharray="5, 5" 
                    style={{ animation: `flow1 4s linear infinite`, transform: `translateY(${-10 * dragNormalized}px)` }}
                />
                 <path 
                    d="M 0 70 Q 150 60, 250 80 T 400 90" 
                    className="stroke-accent" 
                    fill="none" 
                    strokeWidth="1.5" 
                    style={{ animation: `flow2 3.5s linear infinite`, transform: `translateY(${-15 * dragNormalized}px)` }}
                />

                {/* Bottom airflow - more compressed with higher downforce */}
                <path 
                    d="M 0 130 Q 150 135, 250 125 T 400 130" 
                    className="stroke-accent"
                    fill="none" 
                    strokeWidth="1.5"
                    style={{ animation: `flow1 3s linear infinite`, transform: `translateY(${10 * downforceNormalized}px)` }}
                />
            </svg>

            {/* Car Body SVG - Simplified F1 in Schools car shape */}
            <svg viewBox="0 0 300 100" className="relative z-10 w-4/5 h-auto">
                <g transform="translate(0, 20)">
                    {/* Main Body */}
                    <path d="M 20 45 C 50 35, 230 35, 280 40 L 290 50 L 280 60 C 230 65, 50 65, 20 55 Z" className="fill-background-tertiary stroke-border-color" strokeWidth="1" />
                    {/* Nose */}
                    <path d="M 0 50 C 10 48, 15 48, 20 45 L 20 55 C 15 52, 10 52, 0 50 Z" className="fill-background-tertiary stroke-border-color" strokeWidth="1" />
                    {/* Cartridge housing */}
                     <rect x="250" y="46" width="40" height="8" rx="2" className="fill-background-primary" />
                    {/* Front Wing */}
                    <path d="M 10 35 L 50 30 L 50 38 L 10 43 Z" className="fill-text-secondary" />
                     <path d="M 10 57 L 50 62 L 50 70 L 10 65 Z" className="fill-text-secondary" />
                    {/* Rear Wing */}
                    <path d="M 270 30 L 295 28 L 295 38 L 270 40 Z" className="fill-text-secondary" />
                    <path d="M 270 60 L 295 62 L 295 72 L 270 70 Z" className="fill-text-secondary" />
                    {/* Wheels */}
                    <circle cx="60" cy="65" r="10" className="fill-background-primary stroke-background-tertiary" strokeWidth="2" />
                    <circle cx="240" cy="65" r="10" className="fill-background-primary stroke-background-tertiary" strokeWidth="2" />
                </g>
            </svg>
            <style>{`
                @keyframes flow1 {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: 20; }
                }
                 @keyframes flow2 {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -20; }
                }
            `}</style>
        </div>
    );
};