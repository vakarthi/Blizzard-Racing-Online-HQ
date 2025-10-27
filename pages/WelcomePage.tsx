import React from 'react';
import { TeamChat } from '../components/TeamChat';
import { useAuth } from '../hooks/useAuth';
import { activityService } from '../services/activityService';
import type { ActivityLogEntry } from '../types';
import { ProjectSummaryWidget } from '../components/widgets/ProjectSummaryWidget';
import { FinanceSummaryWidget } from '../components/widgets/FinanceSummaryWidget';
import { AeroSummaryWidget } from '../components/widgets/AeroSummaryWidget';
import { SponsorshipSummaryWidget } from '../components/widgets/SponsorshipSummaryWidget';
import { WikiSummaryWidget } from '../components/widgets/WikiSummaryWidget';
import { MissionControlWidget } from '../components/widgets/MissionControlWidget';
import { RdSummaryWidget } from '../components/widgets/RdSummaryWidget';
import { SocialsSummaryWidget } from '../components/widgets/SocialsSummaryWidget';
import { ToolkitSummaryWidget } from '../components/widgets/ToolkitSummaryWidget';
import { AchievementsWidget } from '../components/widgets/AchievementsWidget';
import { ApprovalWidget } from '../components/widgets/ApprovalWidget';
import { AnnouncementForm } from '../components/AnnouncementForm';


type Page = 'hq' | 'projects' | 'sponsorship' | 'finance' | 'testing' | 'portfolio' | 'toolkit' | 'wiki' | 'rd' | 'socials';

interface WelcomePageProps {
  onNavigate: (page: Exclude<Page, 'comparison'>) => void;
}


const LastActivity: React.FC = () => {
    const { user } = useAuth();
    const [lastActivity, setLastActivity] = React.useState<ActivityLogEntry | null>(null);

    React.useEffect(() => {
        if (user) {
            setLastActivity(activityService.getLatestActivityForUser(user.nickname));
        }
    }, [user]);

    if (!lastActivity) {
        return <p className="text-lg text-text-secondary mb-8">Ready for a new session.</p>;
    }

    const renderActivityMessage = () => {
        return (
            <>
                Last session: You completed <strong className="text-accent">{lastActivity.type}</strong> - "{lastActivity.details}"
            </>
        );
    };
    
    return (
         <div className="bg-background-secondary/50 border border-border-color rounded-lg p-4 mb-8 flex items-center space-x-4">
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent animate-gentle-pulse" fill="none" viewBox="0 0 24" stroke="currentColor">
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

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                    Welcome back, <span className="text-accent">{user?.nickname}</span>!
                </h1>
                <LastActivity />
            </div>

            <MissionControlWidget />
            
            {user?.role === 'manager' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ApprovalWidget onNavigate={() => onNavigate('finance')} />
                    <AnnouncementForm />
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ProjectSummaryWidget onNavigate={() => onNavigate('projects')} />
                </div>
                <div className="lg:col-span-1">
                    <FinanceSummaryWidget onNavigate={() => onNavigate('finance')} />
                </div>
                <div className="lg:col-span-1">
                    <AeroSummaryWidget onNavigate={() => onNavigate('testing')} />
                </div>
                <div className="lg:col-span-1">
                    <SponsorshipSummaryWidget onNavigate={() => onNavigate('sponsorship')} />
                </div>
                <div className="lg:col-span-1">
                     <RdSummaryWidget onNavigate={() => onNavigate('rd')} />
                </div>
                
                 <div className="lg:col-span-3">
                    <AchievementsWidget />
                </div>

                <div className="lg:col-span-1">
                     <WikiSummaryWidget onNavigate={() => onNavigate('wiki')} />
                </div>
                 <div className="lg:col-span-1">
                     <SocialsSummaryWidget onNavigate={() => onNavigate('socials')} />
                </div>
                 <div className="lg:col-span-1">
                     <ToolkitSummaryWidget onNavigate={() => onNavigate('toolkit')} />
                </div>

                <div className="lg:col-span-3">
                    <TeamChat />
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;