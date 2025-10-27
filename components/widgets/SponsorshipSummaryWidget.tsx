import React, { useState, useEffect } from 'react';
import { sponsorshipService } from '../../services/sponsorshipService';
import type { Sponsor } from '../../types';
import { SummaryWidget } from './SummaryWidget';

interface SponsorshipSummaryWidgetProps {
    onNavigate: () => void;
}

const SponsorshipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

export const SponsorshipSummaryWidget: React.FC<SponsorshipSummaryWidgetProps> = ({ onNavigate }) => {
    const [totalSecured, setTotalSecured] = useState(0);
    const [topSponsors, setTopSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        const sponsors = sponsorshipService.getSponsors();
        const secured = sponsors.filter(s => s.status === 'Secured');
        const total = secured.reduce((sum, s) => sum + s.amount, 0);
        const top = secured.sort((a, b) => b.amount - a.amount).slice(0, 2);
        
        setTotalSecured(total);
        setTopSponsors(top);
    }, []);

    return (
        <SummaryWidget title="Sponsorship" icon={<SponsorshipIcon />} linkText="View All" onLinkClick={onNavigate}>
             <div className="space-y-3">
                <div className="text-center">
                    <p className="text-sm text-text-secondary">Total Secured</p>
                    <p className="text-3xl font-bold text-success">{formatCurrency(totalSecured)}</p>
                </div>
                {topSponsors.length > 0 && (
                    <div className="text-sm space-y-1">
                        <p className="font-semibold text-text-secondary">Top Partners:</p>
                        {topSponsors.map(s => (
                             <p key={s.id} className="font-bold text-text-primary bg-background-tertiary/50 px-2 py-1 rounded">{s.name}</p>
                        ))}
                    </div>
                )}
            </div>
        </SummaryWidget>
    );
};
