import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    tooltip: string;
}

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, tooltip }) => {
    return (
        <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg relative group transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
            <p className="text-4xl font-bold text-text-primary mt-2">{value}</p>
             <div className="absolute top-4 right-4">
                <div className="has-tooltip">
                    <InfoIcon />
                    <div className='tooltip rounded shadow-lg p-2 bg-background-primary text-accent text-xs -mt-8 -ml-24 w-48 border border-border-color'>
                        {tooltip}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .tooltip {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.2s ease-in-out;
                    z-index: 10;
                }
                .has-tooltip:hover .tooltip {
                    opacity: 1;
                    pointer-events: auto;
                }
            `}</style>
        </div>
    );
};