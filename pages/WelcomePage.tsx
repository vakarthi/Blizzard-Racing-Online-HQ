import React, { useState, useEffect } from 'react';
import { Icicle } from '../components/Icicle';
import { TeamChat } from '../components/TeamChat';
import { useAuth } from '../hooks/useAuth';
import { activityService } from '../services/activityService';
import type { Activity } from '../types';

const LastActivity: React.FC = () => {
    const { user } = useAuth();
    const [lastActivity, setLastActivity] = useState<Activity | null>(null);

    useEffect(() => {
        if (user) {
            setLastActivity(activityService.getLastActivity(user.email));
        }
    }, [user]);

    if (!lastActivity) {
        return <p className="text-lg text-text-secondary mb-8">Team chat and Icicle are operational.</p>;
    }

    const renderActivityMessage = () => {
        switch (lastActivity.type) {
            case 'aero_testing':
                return (
                    <>
                        Last session: You were running simulations in the <strong className="text-accent">Aero Testing</strong> lab.
                    </>
                );
            case 'chat_message':
                return (
                    <>
                        Last activity in the <strong className="text-accent">{lastActivity.details?.chatName || 'a team'}</strong> chat.
                    </>
                );
            default:
                return "Welcome back to the HQ.";
        }
    };
    
    return (
         <div className="bg-background-secondary/50 border border-border-color rounded-lg p-4 mb-8 flex items-center space-x-4">
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent animate-gentle-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                 <p className="text-lg text-text-primary">
                    {renderActivityMessage()}
                </p>
            </div>
        </div>
    );
};


const WelcomePage: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                 Welcome back, <span className="text-accent">{user?.nickname}</span>!
            </h1>
            <LastActivity />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Icicle />
                <TeamChat />
            </div>
        </div>
    );
};

export default WelcomePage;