import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { User, Theme } from '../types';
import { userService } from '../services/userService';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderInternal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('blizzard_user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const authenticatedUser = userService.authenticate(email, pass);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      sessionStorage.setItem('blizzard_user', JSON.stringify(authenticatedUser));
      return true;
    }
    return false;
  };

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('blizzard_user');
  }, []);
  
  const updateUser = useCallback((updatedUser: User) => {
      setUser(updatedUser);
      sessionStorage.setItem('blizzard_user', JSON.stringify(updatedUser));
  }, []);
  
  useEffect(() => {
    if (!user) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blizzard_racing_users') {
        const allUsers = userService.getUsers();
        const currentUserData = allUsers.find(u => u.email === user.email);

        if (!currentUserData) {
          // Current user was deleted
          logout();
        } else if (JSON.stringify(currentUserData) !== JSON.stringify(user)) {
          // User data was updated
          updateUser(currentUserData);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, logout, updateUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// --- Theme Context ---
interface ThemeContextType {
    theme: Theme;
    themes: Theme[];
    applyTheme: (themeName: string) => void;
    saveCustomTheme: (theme: Theme) => void;
    deleteCustomTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeToDocument = (theme: Theme) => {
    for (const [key, value] of Object.entries(theme.colors)) {
        const rgb = value.match(/\d+/g)?.join(' ');
        if (rgb) {
            document.documentElement.style.setProperty(key, rgb);
        }
    }
};

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [themes, setThemes] = useState<Theme[]>(() => userService.getThemes(user?.email));
    const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);

    useEffect(() => {
        if (user) {
            const allThemes = userService.getThemes(user.email);
            setThemes(allThemes);
            const userTheme = allThemes.find(t => t.name === user.activeTheme) || allThemes[0];
            setActiveTheme(userTheme);
            applyThemeToDocument(userTheme);
        } else {
             const defaultThemes = userService.getThemes();
             setActiveTheme(defaultThemes[0]);
             applyThemeToDocument(defaultThemes[0]);
        }
    }, [user]);

    const applyAndSaveTheme = useCallback((themeName: string) => {
        if (!user) return;
        const themeToApply = themes.find(t => t.name === themeName);
        if (themeToApply) {
            setActiveTheme(themeToApply);
            applyThemeToDocument(themeToApply);
            userService.updateUserTheme(user.email, themeName);
            const updatedUser = { ...user, activeTheme: themeName };
            updateUser(updatedUser);
        }
    }, [user, themes, updateUser]);

    const saveCustomTheme = useCallback((theme: Theme) => {
        if (!user) return;
        userService.saveCustomTheme(user.email, theme);
        const newThemes = userService.getThemes(user.email);
        setThemes(newThemes);
        if(theme.name === activeTheme.name) {
            applyThemeToDocument(theme);
        }
    }, [user, activeTheme.name]);

    const deleteCustomTheme = useCallback((themeName: string) => {
        if (!user) return;
        userService.deleteCustomTheme(user.email, themeName);
        const updatedThemes = userService.getThemes(user.email);
        setThemes(updatedThemes);
        if (activeTheme.name === themeName) {
            applyAndSaveTheme(updatedThemes[0].name);
        }
    }, [user, activeTheme, applyAndSaveTheme]);

    return (
        <ThemeContext.Provider value={{ theme: activeTheme, themes, applyTheme: applyAndSaveTheme, saveCustomTheme, deleteCustomTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// --- Site Settings Context ---
interface SiteSettingsContextType {
    logo: string | null;
    appName: string;
    updateLogo: (base64: string) => void;
    removeLogo: () => void;
    updateAppName: (name: string) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logo, setLogo] = useState<string | null>(() => userService.getLogo());
    const [appName, setAppName] = useState<string>(() => userService.getAppName());

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'blizzard_racing_app_name') {
                setAppName(userService.getAppName());
            } else if (e.key === 'blizzard_racing_logo') {
                setLogo(userService.getLogo());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateLogo = (base64: string) => {
        userService.setLogo(base64);
        setLogo(base64);
    };

    const removeLogo = () => {
        userService.removeLogo();
        setLogo(null);
    };

    const updateAppName = (name: string) => {
        userService.setAppName(name);
        setAppName(name);
    };

    return (
        <SiteSettingsContext.Provider value={{ logo, appName, updateLogo, removeLogo, updateAppName }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = (): SiteSettingsContextType => {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
};


// --- Combined Provider ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AuthProviderInternal>
            <SiteSettingsProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </SiteSettingsProvider>
        </AuthProviderInternal>
    );
};

// Rename AuthProvider to AppProvider for export
export { AppProvider as AuthProvider };