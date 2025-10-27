import type { Activity } from '../types';

const ACTIVITY_KEY_PREFIX = 'blizzard_racing_activity_';

export const activityService = {
    setLastActivity: (email: string, activity: Omit<Activity, 'timestamp'>) => {
        const activityWithTimestamp: Activity = {
            ...activity,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`${ACTIVITY_KEY_PREFIX}${email}`, JSON.stringify(activityWithTimestamp));
    },

    getLastActivity: (email: string): Activity | null => {
        const activity = localStorage.getItem(`${ACTIVITY_KEY_PREFIX}${email}`);
        return activity ? JSON.parse(activity) : null;
    }
};
