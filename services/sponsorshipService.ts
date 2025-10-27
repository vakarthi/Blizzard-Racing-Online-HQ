import type { Sponsor } from '../types';
import { gamificationService } from './gamificationService';
import { activityService } from './activityService';

const SPONSORS_KEY = 'blizzard_racing_sponsors';

const defaultSponsors: Sponsor[] = [
    { id: 'sp-1', name: 'Cyber Sky Securities', contact: 'contact@cybersky.com', tier: 'Gold', amount: 5000, status: 'Secured', notes: 'Main sponsor for the 2024 season.' },
    { id: 'sp-2', name: 'Deutsche Bank', contact: 'hr@db.com', tier: 'Silver', amount: 2500, status: 'Contacted', notes: 'Follow-up email sent last week.' },
    { id: 'sp-3', name: 'Renault F1 Team', contact: 'outreach@renaultsport.com', tier: 'Parts/Support', amount: 0, status: 'Potential', notes: 'Aarav has a potential contact here.' },
];

const getStoredSponsors = (): Sponsor[] => {
    const sponsors = localStorage.getItem(SPONSORS_KEY);
    if(sponsors) return JSON.parse(sponsors);
    localStorage.setItem(SPONSORS_KEY, JSON.stringify(defaultSponsors));
    return defaultSponsors;
};

export const sponsorshipService = {
    getSponsors: (): Sponsor[] => {
        return getStoredSponsors();
    },

    addSponsor: (sponsor: Omit<Sponsor, 'id'>, userNickname: string): Sponsor[] => {
        const sponsors = getStoredSponsors();
        const newSponsor: Sponsor = {
            ...sponsor,
            id: `sp-${Date.now()}`,
        };
        const newSponsors = [...sponsors, newSponsor];
        localStorage.setItem(SPONSORS_KEY, JSON.stringify(newSponsors));
        
        activityService.logActivity(userNickname, 'Sponsor Added', newSponsor.name);
        if (newSponsor.status === 'Secured') {
            gamificationService.checkAndUnlock('SECURE_SPONSOR', userNickname);
            activityService.logActivity(userNickname, 'Sponsor Secured', newSponsor.name);
        }

        return newSponsors;
    },

    updateSponsor: (updatedSponsor: Sponsor, userNickname: string): Sponsor[] => {
        let sponsors = getStoredSponsors();
        const sponsorIndex = sponsors.findIndex(s => s.id === updatedSponsor.id);
        const originalStatus = sponsorIndex > -1 ? sponsors[sponsorIndex].status : undefined;

        if (sponsorIndex > -1) {
            sponsors[sponsorIndex] = updatedSponsor;
        }
        localStorage.setItem(SPONSORS_KEY, JSON.stringify(sponsors));
        
        if (updatedSponsor.status === 'Secured' && originalStatus !== 'Secured') {
            gamificationService.checkAndUnlock('SECURE_SPONSOR', userNickname);
            activityService.logActivity(userNickname, 'Sponsor Secured', updatedSponsor.name);
        }

        return sponsors;
    },

    deleteSponsor: (sponsorId: string): Sponsor[] => {
        let sponsors = getStoredSponsors();
        const newSponsors = sponsors.filter(s => s.id !== sponsorId);
        localStorage.setItem(SPONSORS_KEY, JSON.stringify(newSponsors));
        return newSponsors;
    }
};