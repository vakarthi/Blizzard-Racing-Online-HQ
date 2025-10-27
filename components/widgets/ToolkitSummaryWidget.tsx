import React from 'react';
import { SummaryWidget } from './SummaryWidget';

interface ToolkitSummaryWidgetProps {
    onNavigate: () => void;
}

const ToolkitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;

export const ToolkitSummaryWidget: React.FC<ToolkitSummaryWidgetProps> = ({ onNavigate }) => {
    return (
        <SummaryWidget title="Engineer's Toolkit" icon={<ToolkitIcon />}>
            <div className="text-center h-full flex flex-col items-center justify-center">
                <p className="text-text-secondary mb-4">Quick calculators for design and analysis.</p>
                <button onClick={onNavigate} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200">
                    Open Toolkit
                </button>
            </div>
        </SummaryWidget>
    );
};
