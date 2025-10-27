import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, useTheme } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import TestingPage from './pages/TestingPage';
import ComparisonPage from './pages/ComparisonPage';
import { Header } from './components/Header';
import { useKonamiCode } from './hooks/useKonamiCode';
import { UserManagementModal } from './components/UserManagementModal';
import { SettingsModal } from './components/PasswordChangeModal';
import { activityService } from './services/activityService';
import type { AnalysisResult } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [page, setPage] = useState<'hq' | 'testing' | 'comparison'>('hq');
  const [isManagerPanelOpen, setIsManagerPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<AnalysisResult[]>([]);
  
  useEffect(() => {
    // If user role changes to member while on a restricted page, redirect to hq
    if (user?.role === 'member' && (page === 'testing' || page === 'comparison')) {
        setPage('hq');
    }
  }, [user?.role, page]);

  const openManagerPanel = () => {
    if (user?.role === 'manager') {
      setIsManagerPanelOpen(true);
    }
  };
  useKonamiCode(openManagerPanel);

  const handleNavigation = (newPage: 'hq' | 'testing') => {
    if (newPage === 'testing' && user && (user.role === 'manager' || user.role === 'engineer')) {
      activityService.setLastActivity(user.email, { type: 'aero_testing' });
      setPage('testing');
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
  
  const canAccessTesting = user.role === 'manager' || user.role === 'engineer';

  return (
    <div 
        className="min-h-screen bg-background-primary text-text-primary font-sans bg-cover bg-center bg-fixed transition-all duration-500"
        style={{ backgroundImage: theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none' }}
    >
      <div className="min-h-screen backdrop-blur-sm bg-background-primary/80">
        <Header
            onNavigate={handleNavigation}
            currentPage={page}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="container mx-auto px-4 py-8 md:py-12">
            {page === 'hq' && <WelcomePage />}
            {page === 'testing' && canAccessTesting && <TestingPage onCompare={handleStartComparison} />}
            {page === 'comparison' && canAccessTesting && <ComparisonPage results={comparisonResults} onBack={handleEndComparison} />}
        </main>
        <footer className="text-center py-6 text-text-secondary text-sm">
            <p>Blizzard Racing &copy; 2024. An exclusive tool for team members.</p>
        </footer>
        {isManagerPanelOpen && <UserManagementModal onClose={() => setIsManagerPanelOpen(false)} />}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
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
