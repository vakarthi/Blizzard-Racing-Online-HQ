import React, { useState, useEffect } from 'react';
import { rdService } from '../../services/rdService';
import type { Experiment } from '../../types';
import { SummaryWidget } from './SummaryWidget';

interface RdSummaryWidgetProps {
    onNavigate: () => void;
}

const RdIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 011.806-.547z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.25a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>;

export const RdSummaryWidget: React.FC<RdSummaryWidgetProps> = ({ onNavigate }) => {
    const [latestExperiment, setLatestExperiment] = useState<Experiment | null>(null);

    useEffect(() => {
        const experiments = rdService.getExperiments();
        setLatestExperiment(experiments[0] || null);
    }, []);

    return (
        <SummaryWidget title="R&D Lab" icon={<RdIcon />} linkText="View Logs" onLinkClick={onNavigate}>
            {latestExperiment ? (
                <div>
                    <p className="text-sm font-bold text-text-primary truncate" title={latestExperiment.component}>
                        Latest: {latestExperiment.component}
                    </p>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-3">
                        <span className="font-semibold">Conclusion:</span> {latestExperiment.conclusion}
                    </p>
                </div>
            ) : (
                 <div className="text-text-secondary text-center h-full flex items-center justify-center">
                    <p>No R&D experiments have been logged yet.</p>
                </div>
            )}
        </SummaryWidget>
    );
};
