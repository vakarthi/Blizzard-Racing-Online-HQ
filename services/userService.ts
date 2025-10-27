import type { User, Theme, ThemeColors, RolePermissions } from '../types';

const USERS_KEY = 'blizzard_racing_users';
const PASSWORDS_KEY = 'blizzard_racing_passwords';
const CUSTOM_THEMES_KEY_PREFIX = 'blizzard_racing_custom_themes_';
const LOGO_KEY = 'blizzard_racing_logo';
const APP_NAME_KEY = 'blizzard_racing_app_name';
const COMPETITION_DATE_KEY = 'blizzard_racing_competition_date';
const ROLE_PERMISSIONS_KEY = 'blizzard_racing_role_permissions';

// --- Default Themes ---
const defaultColors: Pick<ThemeColors, '--color-text-on-primary'> = {
    '--color-text-on-primary': 'rgb(255 255 255)',
};
const sharedColors: Pick<ThemeColors, '--color-success' | '--color-warning' | '--color-danger' | '--color-danger-hover'> = {
    '--color-success': 'rgb(74 222 128)', // green-400
    '--color-warning': 'rgb(250 204 21)', // yellow-400
    '--color-danger': 'rgb(248 113 113)', // red-400
    '--color-danger-hover': 'rgb(220 38 38)', // red-600
}


const defaultThemes: Theme[] = [
    {
        name: 'Blizzard Racing',
        colors: {
            ...defaultColors, ...sharedColors,
            '--color-primary': 'rgb(59 130 246)', '--color-primary-hover': 'rgb(37 99 235)', '--color-accent': 'rgb(96 165 250)',
            '--color-background-primary': 'rgb(17 24 39)', '--color-background-secondary': 'rgb(31 41 55)', '--color-background-tertiary': 'rgb(55 65 81)',
            '--color-text-primary': 'rgb(229 231 235)', '--color-text-secondary': 'rgb(156 163 175)', '--color-border-color': 'rgb(55 65 81)',
        }
    },
    {
        name: 'Crimson Fury', // Red Bull
        colors: {
            ...defaultColors, ...sharedColors,
            '--color-primary': 'rgb(220 38 38)', '--color-primary-hover': 'rgb(185 28 28)', '--color-accent': 'rgb(250 204 21)',
            '--color-background-primary': 'rgb(10 10 30)', '--color-background-secondary': 'rgb(23 30 50)', '--color-background-tertiary': 'rgb(30 41 59)',
            '--color-text-primary': 'rgb(248 250 252)', '--color-text-secondary': 'rgb(161 161 170)', '--color-border-color': 'rgb(51 65 85)',
        }
    },
    {
        name: 'Silver Arrow', // Mercedes
        colors: {
            ...defaultColors, ...sharedColors,
            '--color-primary': 'rgb(45 212 191)', '--color-primary-hover': 'rgb(20 184 166)', '--color-accent': 'rgb(56 189 248)',
            '--color-background-primary': 'rgb(23 23 23)', '--color-background-secondary': 'rgb(38 38 38)', '--color-background-tertiary': 'rgb(63 63 70)',
            '--color-text-primary': 'rgb(245 245 245)', '--color-text-secondary': 'rgb(163 163 163)', '--color-border-color': 'rgb(63 63 70)',
        }
    },
    {
        name: 'Scuderia Rosso', // Ferrari
        colors: {
            ...defaultColors, ...sharedColors,
            '--color-primary': 'rgb(220 38 38)', '--color-primary-hover': 'rgb(239 68 68)', '--color-accent': 'rgb(253 224 71)',
            '--color-background-primary': 'rgb(17 17 17)', '--color-background-secondary': 'rgb(34 34 34)', '--color-background-tertiary': 'rgb(51 51 51)',
            '--color-text-primary': 'rgb(250 250 250)', '--color-text-secondary': 'rgb(163 163 163)', '--color-border-color': 'rgb(68 68 68)',
        }
    },
];

// --- User Management ---

const getStoredUsers = (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
};

const getStoredPasswords = (): Record<string, string> => {
    const passwords = localStorage.getItem(PASSWORDS_KEY);
    return passwords ? JSON.parse(passwords) : {};
};

const initializeDefaultUsers = () => {
    let users = getStoredUsers();
    let passwords = getStoredPasswords();

    if (users.length === 0) {
        const defaultUsers: User[] = [
            { email: 'shrivatsakarth.kart@saintolaves.net', name: 'Shrivatsa Karth', nickname: 'Shriv', role: 'manager', activeTheme: 'Blizzard Racing' },
            { email: 'anish.ghosh@saintolaves.net', name: 'Anish Ghosh', nickname: 'Anish', role: 'engineer', activeTheme: 'Blizzard Racing' },
            { email: 'hadinabeel.siddiqui@saintolaves.net', name: 'Hadinabeel Siddiqui', nickname: 'Hadi', role: 'engineer', activeTheme: 'Blizzard Racing' },
            { email: 'pranavram.alluri@saintolaves.net', name: 'Pranavram Alluri', nickname: 'Pranav', role: 'engineer', activeTheme: 'Blizzard Racing' },
            { email: 'aarav.gupta-cure@saintolaves.net', name: 'Aarav Gupta-Cure', nickname: 'Aarav', role: 'designer', activeTheme: 'Blizzard Racing' },
            { email: 'raiyan.haider@saintolaves.net', name: 'Raiyan Haider', nickname: 'Raiyan', role: 'marketing', activeTheme: 'Blizzard Racing' },
        ];
        const defaultPasswords = {
            'shrivatsakarth.kart@saintolaves.net': '__KONAMI_SH__',
            'anish.ghosh@saintolaves.net': 'password',
            'hadinabeel.siddiqui@saintolaves.net': 'password',
            'pranavram.alluri@saintolaves.net': 'password',
            'aarav.gupta-cure@saintolaves.net': 'password',
            'raiyan.haider@saintolaves.net': 'password',
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(defaultPasswords));
    }
};

const initializeDefaultPermissions = () => {
    const permissions = localStorage.getItem(ROLE_PERMISSIONS_KEY);
    if (!permissions) {
        const defaultPermissions: RolePermissions = {
            'engineer': { 'projects': 'edit', 'sponsorship': 'read-only', 'finance': 'edit', 'wiki': 'edit', 'rd': 'edit', 'socials': 'edit' },
            'designer': { 'projects': 'edit', 'sponsorship': 'read-only', 'finance': 'read-only', 'wiki': 'edit', 'rd': 'read-only', 'socials': 'read-only' },
            'marketing': { 'projects': 'edit', 'sponsorship': 'edit', 'finance': 'edit', 'wiki': 'edit', 'rd': 'read-only', 'socials': 'edit' },
            'member': { 'projects': 'edit', 'sponsorship': 'read-only', 'finance': 'read-only', 'wiki': 'read-only', 'rd': 'read-only', 'socials': 'read-only' }
        };
        localStorage.setItem(ROLE_PERMISSIONS_KEY, JSON.stringify(defaultPermissions));
    }
};


initializeDefaultUsers();
initializeDefaultPermissions();

export const userService = {
    isManager: (email: string): boolean => {
        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return user?.role === 'manager';
    },

    authenticate: (email: string, pass: string): User | null => {
        const users = getStoredUsers();
        const passwords = getStoredPasswords();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user && passwords[user.email] === pass) {
            return user;
        }
        return null;
    },

    changePassword: (email: string, oldPass: string, newPass: string): { success: boolean, message: string } => {
        const passwords = getStoredPasswords();
        
        if (passwords[email] !== oldPass) {
            return { success: false, message: 'Incorrect current password.' };
        }

        passwords[email] = newPass;
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

        return { success: true, message: 'Password updated successfully.' };
    },
    
    getUsers: (): User[] => {
        return getStoredUsers();
    },

    addUser: (user: Omit<User, 'name' | 'activeTheme'> & { name: string }, pass: string): { success: boolean, message: string } => {
        const users = getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
            return { success: false, message: 'User with this email already exists.' };
        }
        
        const newUser: User = { ...user, activeTheme: 'Blizzard Racing' };
        const newUsers = [...users, newUser];
        const passwords = getStoredPasswords();
        const newPasswords = { ...passwords, [user.email]: pass };

        localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(newPasswords));

        return { success: true, message: 'User added successfully.' };
    },

    updateUser: (originalEmail: string, updatedData: { name: string, nickname: string, email: string, role: User['role'] }): { success: boolean, message: string } => {
        let users = getStoredUsers();
        let passwords = getStoredPasswords();

        const userIndex = users.findIndex(u => u.email.toLowerCase() === originalEmail.toLowerCase());
        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        const canonicalOriginalEmail = users[userIndex].email;

        const isDefaultManager = canonicalOriginalEmail === 'shrivatsakarth.kart@saintolaves.net';
        if (isDefaultManager && updatedData.role !== 'manager') {
            return { success: false, message: 'Cannot change the role of the default manager.' };
        }
        if (isDefaultManager && updatedData.email.toLowerCase() !== canonicalOriginalEmail.toLowerCase()) {
            return { success: false, message: 'Cannot change the email of the default manager.' };
        }

        const emailChanged = updatedData.email.toLowerCase() !== canonicalOriginalEmail.toLowerCase();
        if (emailChanged && users.some((u, index) => index !== userIndex && u.email.toLowerCase() === updatedData.email.toLowerCase())) {
            return { success: false, message: 'Another user with this email already exists.' };
        }
        
        users[userIndex] = { ...users[userIndex], ...updatedData };

        if (emailChanged) {
            const pass = passwords[canonicalOriginalEmail];
            delete passwords[canonicalOriginalEmail];
            passwords[updatedData.email] = pass;
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

        return { success: true, message: 'User updated successfully.' };
    },

    removeUser: (email: string): { success: boolean, message: string } => {
         if (email === 'shrivatsakarth.kart@saintolaves.net') {
            return { success: false, message: 'Cannot remove the default manager.' };
        }
        let users = getStoredUsers();
        let passwords = getStoredPasswords();

        const newUsers = users.filter(u => u.email !== email);
        delete passwords[email];

        localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

        return { success: true, message: 'User removed.' };
    },

    // --- Permissions Management ---
    getRolePermissions: (): RolePermissions => {
        const permissions = localStorage.getItem(ROLE_PERMISSIONS_KEY);
        return permissions ? JSON.parse(permissions) : {};
    },

    updateRolePermissions: (permissions: RolePermissions) => {
        localStorage.setItem(ROLE_PERMISSIONS_KEY, JSON.stringify(permissions));
        // Dispatch a storage event so other tabs pick up the change
        window.dispatchEvent(new Event('storage'));
    },

    // --- Theme Management ---
    getThemes: (email?: string): Theme[] => {
        let customThemes: Theme[] = [];
        if (email) {
            const stored = localStorage.getItem(`${CUSTOM_THEMES_KEY_PREFIX}${email}`);
            customThemes = stored ? JSON.parse(stored) : [];
        }
        return [...defaultThemes, ...customThemes];
    },
    
    saveCustomTheme: (email: string, theme: Theme) => {
        const themes = userService.getThemes(email);
        const existingIndex = themes.findIndex(t => t.isCustom && t.name === theme.name);
        
        let customThemes = themes.filter(t => t.isCustom);

        if (existingIndex > -1) {
            const customIndex = customThemes.findIndex(t => t.name === theme.name);
            customThemes[customIndex] = theme;
        } else {
            customThemes.push({ ...theme, isCustom: true });
        }

        localStorage.setItem(`${CUSTOM_THEMES_KEY_PREFIX}${email}`, JSON.stringify(customThemes));
    },
    
    deleteCustomTheme: (email: string, themeName: string) => {
        const themes = userService.getThemes(email);
        const customThemes = themes.filter(t => t.isCustom && t.name !== themeName);
        localStorage.setItem(`${CUSTOM_THEMES_KEY_PREFIX}${email}`, JSON.stringify(customThemes));
    },

    updateUserTheme: (email: string, themeName: string) => {
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex].activeTheme = themeName;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    },

    // --- Site Settings ---
    getLogo: (): string | null => {
        return localStorage.getItem(LOGO_KEY);
    },
    setLogo: (base64: string) => {
        localStorage.setItem(LOGO_KEY, base64);
    },
    removeLogo: () => {
        localStorage.removeItem(LOGO_KEY);
    },
    getAppName: (): string => {
        return localStorage.getItem(APP_NAME_KEY) || 'Blizzard Racing Online Headquarters';
    },
    setAppName: (name: string) => {
        localStorage.setItem(APP_NAME_KEY, name);
    },
    getCompetitionDate: (): string | null => {
        return localStorage.getItem(COMPETITION_DATE_KEY);
    },
    setCompetitionDate: (date: string) => {
        if (date) {
            localStorage.setItem(COMPETITION_DATE_KEY, date);
        } else {
            localStorage.removeItem(COMPETITION_DATE_KEY);
        }
    }
};