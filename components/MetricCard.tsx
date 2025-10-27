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
        <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg relative transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
            <p className="text-4xl font-bold text-text-primary mt-2">{value}</p>
             <div className="absolute top-4 right-4">
                <div className="relative group">
                    <InfoIcon />
                    <div className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-48 p-2 bg-background-primary text-accent text-xs rounded shadow-lg border border-border-color opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        {tooltip}
                    </div>
                </div>
            </div>
        </div>
    );
};