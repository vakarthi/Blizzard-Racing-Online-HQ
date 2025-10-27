import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { SummaryWidget } from './SummaryWidget';

interface FinanceSummaryWidgetProps {
    onNavigate: () => void;
}

const FinanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);

export const FinanceSummaryWidget: React.FC<FinanceSummaryWidgetProps> = ({ onNavigate }) => {
    const [summary, setSummary] = useState(financeService.getFinancialSummary());

    useEffect(() => {
        setSummary(financeService.getFinancialSummary());
    }, []);

    const budgetUsedPercentage = summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 : 0;

    return (
        <SummaryWidget title="Financial Snapshot" icon={<FinanceIcon />} linkText="View Details" onLinkClick={onNavigate}>
            <div className="space-y-3">
                <div className="text-center">
                    <p className="text-sm text-text-secondary">Remaining Budget</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(summary.remainingBudget)}</p>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${budgetUsedPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                    <p className="text-success">{formatCurrency(summary.totalIncome)} <span className="text-text-secondary">Income</span></p>
                    <p className="text-danger">{formatCurrency(summary.totalExpenses)} <span className="text-text-secondary">Expenses</span></p>
                </div>
            </div>
        </SummaryWidget>
    );
};
