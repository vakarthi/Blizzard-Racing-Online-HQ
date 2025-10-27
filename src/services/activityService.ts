import type { ActivityLogEntry, ActivityType } from '../types';

const ACTIVITY_LOG_KEY = 'blizzard_racing_activity_log';

const getLog = (): ActivityLogEntry[] => {
    const log = localStorage.getItem(ACTIVITY_LOG_KEY);
    return log ? JSON.parse(log) : [];
};

export const activityService = {
    logActivity: (userNickname: string, type: ActivityType, details: string) => {
        const log = getLog();
        const newEntry: ActivityLogEntry = {
            userNickname,
            type,
            details,
            timestamp: new Date().toISOString()
        };
        // Keep the log from getting excessively large
        const newLog = [newEntry, ...log].slice(0, 500);
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(newLog));
    },

    getActivities: (): ActivityLogEntry[] => {
        return getLog();
    },

    getLatestActivityForUser: (nickname: string): ActivityLogEntry | null => {
        const log = getLog();
        return log.find(entry => entry.userNickname === nickname) || null;
    }
};
