import React, { useState, useEffect } from 'react';
import { gamificationService } from '../../services/gamificationService';
import type { Achievement } from '../../types';

interface AchievementWithUser extends Achievement {
    nickname: string;
}

export const AchievementsWidget: React.FC = () => {
    const [latestAchievements, setLatestAchievements] = useState<AchievementWithUser[]>([]);

    useEffect(() => {
        const fetchAchievements = () => {
            setLatestAchievements(gamificationService.getLatestUnlocked(5));
        };
        fetchAchievements();
        // Listen for storage changes to update achievements in real-time
        window.addEventListener('storage', fetchAchievements);
        return () => window.removeEventListener('storage', fetchAchievements);
    }, []);

    return (
        <div className="bg-background-secondary rounded-lg border border-border-color shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-border-color">
                <h3 className="text-lg font-bold text-text-primary">Team Activity Feed</h3>
            </div>
            <div className="flex-1 p-4">
                {latestAchievements.length > 0 ? (
                    <ul className="space-y-3">
                        {latestAchievements.map(ach => (
                            <li key={`${ach.id}-${ach.nickname}-${ach.unlockedAt}`} className="flex items-center space-x-3 text-sm animate-fade-in">
                                <span className="text-2xl">{ach.icon}</span>
                                <div>
                                    <p className="font-bold text-text-primary">{ach.title}</p>
                                    <p className="text-text-secondary">
                                        Unlocked by <span className="font-semibold text-accent">{ach.nickname}</span>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-text-secondary text-center h-full flex items-center justify-center">
                        <p>No achievements unlocked yet. Get to work!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
