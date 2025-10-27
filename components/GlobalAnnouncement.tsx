import React, { useState, useEffect } from 'react';
import { announcementService } from '../services/announcementService';
import type { Announcement } from '../types';

export const GlobalAnnouncement: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkAnnouncement = () => {
            const currentAnnouncement = announcementService.getAnnouncement();
            setAnnouncement(currentAnnouncement);

            if (currentAnnouncement) {
                const dismissedId = sessionStorage.getItem('dismissed_announcement_id');
                if (dismissedId !== currentAnnouncement.id) {
                    setIsVisible(true);
                }
            } else {
                setIsVisible(false);
            }
        };

        checkAnnouncement();
        window.addEventListener('storage', checkAnnouncement);
        return () => window.removeEventListener('storage', checkAnnouncement);
    }, []);
    
    const handleDismiss = () => {
        if (announcement) {
            sessionStorage.setItem('dismissed_announcement_id', announcement.id);
            setIsVisible(false);
        }
    };

    if (!isVisible || !announcement) {
        return null;
    }

    return (
        <div className="bg-accent text-background-primary p-3 text-center text-sm font-semibold relative animate-fade-in">
            <span className="font-bold mr-2">📢 Announcement from {announcement.author}:</span>
            {announcement.message}
            <button 
                onClick={handleDismiss}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-background-primary/70 hover:text-background-primary font-bold text-lg"
                aria-label="Dismiss announcement"
            >
                &times;
            </button>
        </div>
    );
};