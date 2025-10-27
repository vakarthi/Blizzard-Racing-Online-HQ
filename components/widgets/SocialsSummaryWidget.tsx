import React from 'react';
import { SummaryWidget } from './SummaryWidget';

interface SocialsSummaryWidgetProps {
    onNavigate: () => void;
}

const SocialsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5" /></svg>;

export const SocialsSummaryWidget: React.FC<SocialsSummaryWidgetProps> = ({ onNavigate }) => {
    return (
        <SummaryWidget title="Socials Assistant" icon={<SocialsIcon />}>
             <div className="text-center h-full flex flex-col items-center justify-center">
                <p className="text-text-secondary mb-4">Generate social media posts with the Icicle Assistant.</p>
                <button onClick={onNavigate} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200">
                    Create Post
                </button>
            </div>
        </SummaryWidget>
    );
};
