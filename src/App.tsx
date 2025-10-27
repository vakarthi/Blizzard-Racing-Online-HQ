import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth, useTheme } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import TestingPage from './pages/TestingPage';
import ComparisonPage from './pages/ComparisonPage';
import ProjectsPage from './pages/ProjectsPage';
import SponsorshipPage from './pages/SponsorshipPage';
import FinancePage from './pages/FinancePage';
import ToolkitPage from './pages/ToolkitPage';
import WikiPage from './pages/WikiPage';
import PortfolioPage from './pages/PortfolioPage';
import RdPage from './pages/RdPage';
import SocialsPage from './pages/SocialsPage';
import { Header } from './components/Header';
import { useKonamiCode } from './hooks/useKonamiCode';
import { UserManagementModal } from './components/UserManagementModal';
import { SettingsModal } from './components/PasswordChangeModal';
import { activityService } from './services/activityService';
import type { AnalysisResult, Achievement } from './types';
import { gamificationService } from './services/gamificationService';
import IcicleAssistant from './components/IcicleAssistant';
import { GlobalAnnouncement } from './components/GlobalAnnouncement';

type Page = 'hq' | 'projects' | 'sponsorship' | 'finance' | 'testing' | 'comparison' | 'toolkit' | 'wiki' | 'portfolio' | 'rd' | 'socials';

const AchievementToast: React.FC<{ achievement: Achievement, onClose: () => void }> = ({ achievement, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 right-5 md:bottom-5 md:right-5 bg-background-secondary border-2 border-accent shadow-2xl rounded-lg p-4 flex items-center space-x-4 animate-slide-in-bottom z-[60]">
            <div className="text-4xl">{achievement.icon}</div>
            <div>
                <p className="font-bold text-accent">Achievement Unlocked!</p>
                <p className="text-text-primary">{achievement.title}</p>
                <p className="text-xs text-text-secondary">{achievement.description}</p>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">&times;</button>
        </div>
    );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [page, setPage] = useState<Page>('hq');
  const [isManagerPanelOpen, setIsManagerPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<AnalysisResult[]>([]);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [analysisContext, setAnalysisContext] = useState<AnalysisResult | null>(null);
  const [isIcicleOpen, setIsIcicleOpen] = useState(false);


  const handleUnlockAchievement = useCallback((achievement: Achievement) => {
    setUnlockedAchievement(achievement);
  }, []);

  useEffect(() => {
    gamificationService.setAchievementCallback(handleUnlockAchievement);
    return () => gamificationService.setAchievementCallback(() => {});
  }, [handleUnlockAchievement]);
  
  useEffect(() => {
    if (user?.role === 'member' && (page === 'testing' || page === 'comparison' || page === 'toolkit' || page === 'rd' || page === 'socials')) {
        setPage('hq');
    }
  }, [user?.role, page]);
  
  const openManagerPanel = () => {
    if (user?.role === 'manager') {
      setIsManagerPanelOpen(true);
    }
  };
  useKonamiCode(openManagerPanel);

  const handleNavigation = (newPage: Exclude<Page, 'comparison'>) => {
     if ((newPage === 'testing' || newPage === 'toolkit' || newPage === 'rd' || newPage === 'socials') && user && (user.role === 'manager' || user.role === 'engineer' || user.role === 'marketing')) {
      setPage(newPage);
    } else if (newPage !== 'testing' && newPage !== 'toolkit' && newPage !== 'rd' && newPage !== 'socials') {
        setPage(newPage);
    } else {
        setPage('hq');
    }
  };
  
  const handleStartComparison = (results: AnalysisResult[]) => {
    if (results.length === 2 && user && (user.role === 'manager' || user.role === 'engineer')) {
        setComparisonResults(results);
        setPage('comparison');
    }
  };

  const handleEndComparison = () => {
      setComparisonResults([]);
      setPage('testing');
  };


  if (!user) {
    return <LoginPage />;
  }
  
  const canAccessEngTools = user.role === 'manager' || user.role === 'engineer';
  const canAccessMarketingTools = user.role === 'manager' || user.role === 'marketing' || user.role === 'engineer';


  return (
    <div 
        className="min-h-screen bg-background-primary text-text-primary font-sans bg-cover bg-center bg-fixed transition-all duration-500"
        style={{ backgroundImage: theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none' }}
    >
      <div className="min-h-screen backdrop-blur-sm bg-background-primary/80 flex flex-col">
        <Header
            onNavigate={handleNavigation}
            currentPage={page}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <GlobalAnnouncement />
        <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
            {page === 'hq' && <WelcomePage onNavigate={handleNavigation} />}
            {page === 'projects' && <ProjectsPage />}
            {page === 'sponsorship' && <SponsorshipPage />}
            {page === 'finance' && <FinancePage />}
            {page === 'wiki' && <WikiPage />}
            {page === 'portfolio' && <PortfolioPage />}
            {page === 'socials' && canAccessMarketingTools && <SocialsPage />}
            {page === 'rd' && canAccessEngTools && <RdPage />}
            {page === 'testing' && canAccessEngTools && <TestingPage onCompare={handleStartComparison} setAnalysisContext={setAnalysisContext} />}
            {page === 'toolkit' && canAccessEngTools && <ToolkitPage />}
            {page === 'comparison' && canAccessEngTools && <ComparisonPage results={comparisonResults} onBack={handleEndComparison} />}
        </main>
        <footer className="text-center py-6 text-text-secondary text-sm">
            <p>Blizzard Racing &copy; 2024. An exclusive tool for team members.</p>
        </footer>
        {isManagerPanelOpen && <UserManagementModal onClose={() => setIsManagerPanelOpen(false)} />}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        {unlockedAchievement && <AchievementToast achievement={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />}
         
        {isIcicleOpen && <IcicleAssistant analysisContext={analysisContext} onClose={() => setIsIcicleOpen(false)} />}

        <button 
            onClick={() => setIsIcicleOpen(true)}
            className="fixed bottom-5 right-5 w-16 h-16 bg-accent hover:bg-primary-hover text-text-on-primary rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-50"
            aria-label="Open Icicle Assistant"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
