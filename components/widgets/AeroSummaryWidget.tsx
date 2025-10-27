import React, { useState, useEffect, useMemo } from 'react';
import { historyService } from '../../services/historyService';
import type { AnalysisResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { SummaryWidget } from './SummaryWidget';

interface AeroSummaryWidgetProps {
    onNavigate: () => void;
}

const AeroIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

export const AeroSummaryWidget: React.FC<AeroSummaryWidgetProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<AnalysisResult[]>([]);

    useEffect(() => {
        if (user) {
            setHistory(historyService.getHistory(user.email));
        }
    }, [user]);

    const bestCar = useMemo(() => {
        const eligibleHistory = history.filter(h => h.scrutineeringReport.isEligibleForFastestCar);
        if (eligibleHistory.length === 0) return null;

        return eligibleHistory.reduce((best, current) => {
            return current.liftToDragRatio > best.liftToDragRatio ? current : best;
        }, eligibleHistory[0]);
    }, [history]);

    return (
        <SummaryWidget title="Top Aero Design" icon={<AeroIcon />} linkText="Go to Lab" onLinkClick={onNavigate}>
            {bestCar ? (
                <div className="space-y-2 text-center">
                    <p className="font-bold text-accent truncate" title={bestCar.fileName}>{bestCar.fileName}</p>
                    <div className="flex justify-around items-baseline">
                         <div>
                            <p className="text-2xl font-bold text-text-primary">{bestCar.liftToDragRatio.toFixed(3)}</p>
                            <p className="text-xs text-text-secondary">L/D Ratio</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-primary">{bestCar.dragCoefficient.toFixed(4)}</p>
                            <p className="text-xs text-text-secondary">Drag (Cd)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-text-secondary text-center h-full flex items-center justify-center">
                    <p>Run simulations to find the top performing design.</p>
                </div>
            )}
        </SummaryWidget>
    );
};
