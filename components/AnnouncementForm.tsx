import React, { useState, useEffect } from 'react';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../hooks/useAuth';
import { SummaryWidget } from './widgets/SummaryWidget';
import type { Announcement } from '../types';

const AnnounceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5" /></svg>;


export const AnnouncementForm: React.FC = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        const checkAnnouncement = () => {
             const announcement = announcementService.getAnnouncement();
             setCurrentAnnouncement(announcement);
             setMessage(announcement?.message || '');
        }
        checkAnnouncement();
        window.addEventListener('storage', checkAnnouncement);
        return () => window.removeEventListener('storage', checkAnnouncement);
    }, []);

    const handlePost = () => {
        if (!user) return;
        announcementService.setAnnouncement(message, user.nickname);
    };

    const handleClear = () => {
        announcementService.clearAnnouncement();
        setMessage('');
    };

    return (
        <SummaryWidget title="Global Announcement" icon={<AnnounceIcon />}>
            <div className="space-y-3">
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type announcement here..."
                    className="w-full h-16 bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent text-sm"
                />
                <div className="flex justify-end space-x-2">
                    {currentAnnouncement && <button onClick={handleClear} className="bg-danger hover:bg-danger-hover text-text-on-primary font-bold text-sm py-1 px-3 rounded-lg">Clear</button>}
                    <button onClick={handlePost} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold text-sm py-1 px-3 rounded-lg">Post</button>
                </div>
            </div>
        </SummaryWidget>
    );
};