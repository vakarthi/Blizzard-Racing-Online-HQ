import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, useSiteSettings } from '../hooks/useAuth';
import { userService } from '../services/userService';

const DefaultLogoIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6.75-9h13.5M6 6l12 12M6 18L18 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 4.5 3 3 3-3m-6 15 3-3 3 3M4.5 9l3 3-3 3m15-6-3 3 3 3" />
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { appName, logo } = useSiteSettings();
  const [isManagerLogin, setIsManagerLogin] = useState(false);
  
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const managerLoginSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 's', 'h'];

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (isManagerLogin) {
        setIsManagerLogin(false);
        setKonamiProgress([]);
    }
  };

  const checkIsManager = () => {
    const isManager = userService.isManager(email);
    setIsManagerLogin(isManager);
    if (isManager) {
        setError('');
    }
  };

  const handleKonamiLogin = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const success = await login(email, '__KONAMI_SH__');
    if (!success) {
      setError('Authentication failed. Please check the email and try the sequence again.');
      setKonamiProgress([]);
    }
    setIsLoading(false);
  }, [email, login, isLoading]);

  useEffect(() => {
    if (!isManagerLogin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        const newKeys = [...konamiProgress, e.key];
        const relevantKeys = newKeys.slice(-managerLoginSequence.length);
        setKonamiProgress(relevantKeys);
        
        if (JSON.stringify(relevantKeys) === JSON.stringify(managerLoginSequence)) {
            handleKonamiLogin();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isManagerLogin, konamiProgress, handleKonamiLogin]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManagerLogin || isLoading) return;
    
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password.');
    }
    setIsLoading(false);
  };
  
  const appNameParts = appName.split(' ');
  const mainAppName = appNameParts.slice(0, 2).join(' ');
  const subtitle = appNameParts.slice(2).join(' ');


  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            {logo ? <img src={logo} alt="Team Logo" className="h-12 w-12 mx-auto" /> : <DefaultLogoIcon />}
            <h1 className="mt-4 text-3xl font-bold text-text-primary tracking-tight">
              {mainAppName}
            </h1>
            <p className="mt-2 text-text-secondary">{subtitle}</p>
        </div>
        <form className="mt-8 space-y-6 bg-background-secondary p-8 rounded-lg border border-border-color shadow-2xl" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-border-color bg-background-tertiary px-3 py-2 text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onBlur={checkIsManager}
              />
            </div>
            {isManagerLogin ? (
                 <div className="text-center p-4 border-2 border-dashed border-border-color rounded-lg bg-background-primary/50">
                    <p className="text-text-primary font-medium">Manager login detected.</p>
                    <p className="text-sm text-text-secondary">Enter the sequence to authenticate.</p>
                    <div className="flex justify-center space-x-1.5 mt-3 h-3 items-center">
                        {managerLoginSequence.map((_, index) => (
                            <span key={index} className={`block h-2 w-2 rounded-full transition-colors ${index < konamiProgress.length ? 'bg-accent' : 'bg-background-tertiary'}`}></span>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                  <label htmlFor="password-sr" className="sr-only">Password</label>
                  <input
                      id="password-sr"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="relative block w-full appearance-none rounded-md border border-border-color bg-background-tertiary px-3 py-2 text-text-primary placeholder-text-secondary focus:z-10 focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                  />
                </div>
            )}
          </div>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading || isManagerLogin}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 hover:-translate-y-0.5"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;