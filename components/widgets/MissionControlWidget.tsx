import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';

const MissionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4m-4-4V4M4 12H0m4 4l-2 2m14-14l2-2m-2 14l2 2m-14-2l-2-2" />
    </svg>
);

const calculateDaysRemaining = (competitionDate: string | null): number | null => {
    if (!competitionDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const compDate = new Date(competitionDate);
    // The date from input is timezone-neutral (YYYY-MM-DD), but new Date() might interpret it in local timezone.
    // Adding a day and then getting the date avoids timezone issues where it might be off by one day.
    const compDateUTC = new Date(compDate.valueOf() + compDate.getTimezoneOffset() * 60 * 1000);
    compDateUTC.setHours(0, 0, 0, 0);
    
    const diffTime = compDateUTC.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const MissionControlWidget: React.FC = () => {
    const { competitionDate } = useSiteSettings();
    const [daysRemaining, setDaysRemaining] = useState<number | null>(calculateDaysRemaining(competitionDate));
    const [progress, setProgress] = useState(projectService.getCompetitionProgress());

    useEffect(() => {
        setDaysRemaining(calculateDaysRemaining(competitionDate));
        const interval = setInterval(() => {
             setDaysRemaining(calculateDaysRemaining(competitionDate));
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [competitionDate]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'blizzard_racing_tasks') {
                setProgress(projectService.getCompetitionProgress());
            }
        };
        window.addEventListener('storage', handleStorageChange);
        setProgress(projectService.getCompetitionProgress()); // Also check on initial render
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <div className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <MissionIcon />
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Mission Control</h2>
                    <p className="text-sm text-text-secondary">Your countdown to competition day.</p>
                </div>
            </div>
            <div className="flex-grow w-full md:w-auto flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center flex-1">
                    {daysRemaining !== null ? (
                        <>
                            <p className="text-4xl font-bold text-accent">{daysRemaining}</p>
                            <p className="text-sm text-text-secondary">Days Remaining</p>
                        </>
                    ) : (
                        <p className="text-text-secondary">Set competition date in Manager Panel</p>
                    )}
                </div>
                <div className="flex-1 w-full sm:w-auto">
                    <p className="text-sm font-semibold text-text-primary mb-1 text-center sm:text-left">Competition Prep: {progress.completed}/{progress.total}</p>
                    <div className="w-full bg-background-tertiary rounded-full h-4 relative overflow-hidden">
                        <div 
                            className="bg-primary h-4 rounded-full transition-all duration-500 text-right" 
                            style={{ width: `${progress.percentage}%` }}
                        >
                           <span className="text-xs font-bold text-text-on-primary pr-2">{Math.round(progress.percentage)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};