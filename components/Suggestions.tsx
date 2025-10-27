import React from 'react';
import type { Suggestion } from '../types';

interface SuggestionsProps {
  suggestions: Suggestion[];
}

const IconMap: Record<Suggestion['category'], React.FC<{className: string}>> = {
    Drag: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>,
    Downforce: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    Regulations: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    General: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
};


const impactColor: Record<Suggestion['impact'], string> = {
    High: 'bg-danger',
    Medium: 'bg-yellow-500',
    Low: 'bg-primary'
};

export const Suggestions: React.FC<SuggestionsProps> = ({ suggestions }) => {
  return (
    <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-text-primary">Improvement Suggestions</h3>
      <p className="text-text-secondary mb-6">Potential improvements based on CFD analysis and Dev Class regulations:</p>
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
            const Icon = IconMap[suggestion.category];
            return (
                <div key={suggestion.id} className="bg-background-primary/50 p-4 rounded-lg flex items-start space-x-4 border-l-4 border-accent transition-all duration-200 hover:bg-background-primary/80 hover:shadow-lg hover:border-primary">
                    <div className="flex-shrink-0 bg-background-tertiary rounded-full p-2">
                        <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-text-primary">{suggestion.title}</h4>
                             <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-text-secondary">Impact:</span>
                                <span className={`px-2 py-0.5 text-xs font-bold text-text-on-primary rounded-full ${impactColor[suggestion.impact]}`}>
                                    {suggestion.impact}
                                </span>
                            </div>
                        </div>
                        <p className="text-text-secondary mt-1 text-sm">{suggestion.description}</p>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};