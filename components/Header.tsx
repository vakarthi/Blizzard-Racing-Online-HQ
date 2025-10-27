import React from 'react';
import { useAuth, useSiteSettings } from '../hooks/useAuth';

const DefaultLogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6.75-9h13.5M6 6l12 12M6 18L18 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 4.5 3 3 3-3m-6 15 3-3 3 3M4.5 9l3 3-3 3m15-6-3 3 3 3" />
    </svg>
);

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    onNavigate: (page: 'hq' | 'testing') => void;
    currentPage: 'hq' | 'testing' | 'comparison';
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const { appName, logo } = useSiteSettings();
  
  const appNameParts = appName.split(' ');
  const mainAppName = appNameParts.slice(0, -1).join(' ');
  const accentAppName = appNameParts.slice(-1)[0];


  return (
    <header className="bg-background-secondary/50 backdrop-blur-sm border-b border-border-color sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {logo ? <img src={logo} alt="Team Logo" className="h-8 w-8" /> : <DefaultLogoIcon />}
            <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
              {mainAppName} <span className="text-accent">{accentAppName}</span>
            </h1>
            <nav className="hidden md:flex items-center space-x-4 ml-6">
                <button 
                    onClick={() => onNavigate('hq')} 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'hq' ? 'bg-background-tertiary text-text-primary' : 'text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary'}`}
                >
                    HQ
                </button>
                {(user?.role === 'manager' || user?.role === 'engineer') && (
                    <button 
                        onClick={() => onNavigate('testing')}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'testing' || currentPage === 'comparison' ? 'bg-background-tertiary text-text-primary' : 'text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary'}`}
                    >
                        Aero Testing
                    </button>
                )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-text-secondary hidden sm:block">
                Welcome, <span className="font-bold text-text-primary">{user?.nickname}</span>
            </span>
             <button 
                onClick={onOpenSettings} 
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Open settings"
            >
                <SettingsIcon />
            </button>
            <button onClick={logout} className="bg-primary hover:bg-primary-hover text-text-on-primary text-sm font-bold py-2 px-3 rounded-lg transition-colors">
                Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
