import type { Announcement } from '../types';

const ANNOUNCEMENT_KEY = 'blizzard_racing_announcement';

export const announcementService = {
    getAnnouncement: (): Announcement | null => {
        const data = localStorage.getItem(ANNOUNCEMENT_KEY);
        return data ? JSON.parse(data) : null;
    },

    setAnnouncement: (message: string, author: string) => {
        if (!message.trim()) {
            announcementService.clearAnnouncement();
            return;
        }
        const newAnnouncement: Announcement = {
            id: `anno-${Date.now()}`,
            message,
            author,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(newAnnouncement));
        // Dispatch event to notify other tabs
        window.dispatchEvent(new Event('storage'));
    },

    clearAnnouncement: () => {
        localStorage.removeItem(ANNOUNCEMENT_KEY);
        // Dispatch event to notify other tabs
        window.dispatchEvent(new Event('storage'));
    }
};