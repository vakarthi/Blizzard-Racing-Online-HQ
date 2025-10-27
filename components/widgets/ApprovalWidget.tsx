import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { SummaryWidget } from './SummaryWidget';

interface ApprovalWidgetProps {
    onNavigate: () => void;
}

const ApprovalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export const ApprovalWidget: React.FC<ApprovalWidgetProps> = ({ onNavigate }) => {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const checkPending = () => {
            setPendingCount(financeService.getPendingTransactions().length);
        };
        checkPending();
        window.addEventListener('storage', checkPending);
        return () => window.removeEventListener('storage', checkPending);
    }, []);

    return (
        <SummaryWidget title="Approvals" icon={<ApprovalIcon />} linkText={pendingCount > 0 ? "Review Now" : undefined} onLinkClick={onNavigate}>
            {pendingCount > 0 ? (
                <div className="text-center h-full flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-warning">{pendingCount}</p>
                    <p className="text-text-secondary">pending transaction(s)</p>
                </div>
            ) : (
                <div className="text-text-secondary text-center h-full flex flex-col items-center justify-center">
                    <div className="text-3xl text-success mb-2">✅</div>
                    <p>No pending approvals.</p>
                </div>
            )}
        </SummaryWidget>
    );
};