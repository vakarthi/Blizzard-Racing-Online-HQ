import React from 'react';
import type { ScrutineeringReport } from '../types';

interface ScrutineeringDisplayProps {
    report: ScrutineeringReport;
}

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const CrossIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.001-1.742 3.001H4.42c-1.532 0-2.492-1.667-1.742-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const typeColorMap = {
    'Performance': 'bg-danger/10 text-danger/80 border-danger/50',
    'Safety': 'bg-warning/10 text-warning/80 border-warning/50',
    'General': 'bg-background-tertiary/50 text-text-secondary border-border-color',
};

export const ScrutineeringDisplay: React.FC<ScrutineeringDisplayProps> = ({ report }) => {
    
    return (
        <div className="bg-background-secondary rounded-lg p-6 border border-border-color shadow-lg">
            <h3 className="text-xl font-bold text-text-primary mb-4">Scrutineering Report</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                 <div>
                    <p className="text-3xl font-bold text-accent">{report.finalScore} <span className="text-lg text-text-secondary">/ {report.basePoints}</span></p>
                    <p className="text-sm text-text-secondary">Final Score</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold text-danger">-{report.totalPenalty}</p>
                    <p className="text-sm text-text-secondary">Penalty Points</p>
                </div>
                 <div className="md:col-span-2">
                    <p className={`text-3xl font-bold ${report.isEligibleForFastestCar ? 'text-success' : 'text-danger'}`}>
                        {report.isEligibleForFastestCar ? 'Eligible' : 'Ineligible'}
                    </p>
                    <p className="text-sm text-text-secondary">for Fastest Car Award</p>
                </div>
            </div>

            {report.infractions.length > 0 ? (
                <div>
                    <h4 className="font-semibold text-text-primary mb-2">Detected Infractions:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {report.infractions.map(infraction => (
                            <div key={infraction.rule} className={`flex items-start space-x-3 p-3 rounded-md border ${typeColorMap[infraction.type]}`}>
                                {infraction.type === 'Safety' ? <WarningIcon/> : <CrossIcon/>}
                                <div>
                                    <p className="font-bold text-sm text-text-primary">
                                        {infraction.rule} <span className="font-normal text-text-secondary">({infraction.type})</span> - <span className="text-danger font-semibold">{infraction.penalty}pts</span>
                                    </p>
                                    <p className="text-sm text-text-secondary">{infraction.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                 <div className="flex items-center space-x-3 p-3 rounded-md border bg-success/10 border-success/50 text-success">
                    <CheckIcon />
                    <p className="font-semibold">Passed: No rule infractions detected.</p>
                </div>
            )}
        </div>
    )
}
