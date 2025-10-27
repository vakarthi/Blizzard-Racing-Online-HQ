import { userService } from './userService';
import { financeService } from './financeService';
import { sponsorshipService } from './sponsorshipService';
import { rdService } from './rdService';

export const portfolioService = {
    getPortfolioData: () => {
        // Team Members
        const teamMembers = userService.getUsers();

        // Financial Summary
        const financialSummary = financeService.getFinancialSummary();

        // Top Sponsors
        const topSponsors = sponsorshipService.getSponsors()
            .filter(s => s.status === 'Secured')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
            
        // Latest R&D
        const latestRd = rdService.getExperiments().slice(0, 3);
        
        return {
            teamMembers,
            financialSummary,
            topSponsors,
            latestRd,
            generatedAt: new Date().toISOString(),
        };
    }
};