import React, { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import type { User, Sponsor, Experiment } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface PortfolioData {
    teamMembers: User[];
    financialSummary: { totalIncome: number; totalExpenses: number; remainingBudget: number };
    topSponsors: Sponsor[];
    latestRd: Experiment[];
    generatedAt: string;
}

const PortfolioPage: React.FC = () => {
    const [data, setData] = useState<PortfolioData | null>(null);

    useEffect(() => {
        setData(portfolioService.getPortfolioData());
    }, []);

    const handleDownloadPdf = () => {
        const reportElement = document.getElementById('portfolio-content');
        if (!reportElement) return;

        html2canvas(reportElement, {
            backgroundColor: '#1f2937', // Match bg-gray-800
            scale: 2, // Increase resolution
        }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const height = pdfWidth / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            pdf.save(`BlizzardRacing_PortfolioSummary_${new Date().toISOString().split('T')[0]}.pdf`);
        });
    };

    if (!data) {
        return <div>Loading portfolio data...</div>;
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                        Portfolio Summary
                    </h1>
                    <p className="text-text-secondary mt-1">Auto-generated summary of team activities.</p>
                </div>
                <button
                    onClick={handleDownloadPdf}
                    className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span>Download PDF</span>
                </button>
            </div>

            <div id="portfolio-content" className="bg-background-secondary p-8 rounded-lg border border-border-color space-y-10">
                {/* Team Section */}
                <section>
                    <h2 className="text-2xl font-bold text-accent border-b-2 border-accent/30 pb-2 mb-4">Team Structure</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {data.teamMembers.map(member => (
                            <div key={member.email} className="bg-background-tertiary p-3 rounded-md">
                                <p className="font-bold text-text-primary">{member.nickname}</p>
                                <p className="text-sm text-text-secondary capitalize">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Finance Section */}
                <section>
                    <h2 className="text-2xl font-bold text-accent border-b-2 border-accent/30 pb-2 mb-4">Financial Overview</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-success/20 border-l-4 border-success p-4 rounded-r-lg"><h3 className="text-sm font-medium text-success">Total Income</h3><p className="text-2xl font-bold text-text-primary">{formatCurrency(data.financialSummary.totalIncome)}</p></div>
                        <div className="bg-danger/20 border-l-4 border-danger p-4 rounded-r-lg"><h3 className="text-sm font-medium text-danger">Total Expenses</h3><p className="text-2xl font-bold text-text-primary">{formatCurrency(data.financialSummary.totalExpenses)}</p></div>
                        <div className="bg-primary/20 border-l-4 border-primary p-4 rounded-r-lg"><h3 className="text-sm font-medium text-primary">Remaining Budget</h3><p className="text-2xl font-bold text-text-primary">{formatCurrency(data.financialSummary.remainingBudget)}</p></div>
                    </div>
                </section>

                {/* Sponsorship Section */}
                <section>
                    <h2 className="text-2xl font-bold text-accent border-b-2 border-accent/30 pb-2 mb-4">Key Sponsorships</h2>
                    {data.topSponsors.length > 0 ? (
                        <ul className="space-y-3">
                            {data.topSponsors.map(sponsor => (
                                <li key={sponsor.id} className="bg-background-tertiary p-3 rounded-md flex justify-between items-center">
                                    <p className="font-bold text-text-primary">{sponsor.name}</p>
                                    <span className="text-sm font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{sponsor.tier} - {formatCurrency(sponsor.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary">No secured sponsors to display.</p>
                    )}
                </section>
                
                {/* R&D Section */}
                <section>
                    <h2 className="text-2xl font-bold text-accent border-b-2 border-accent/30 pb-2 mb-4">R&D Highlights</h2>
                    {data.latestRd.length > 0 ? (
                        <div className="space-y-4">
                            {data.latestRd.map(exp => (
                                <div key={exp.id} className="bg-background-tertiary p-4 rounded-md border-l-4 border-border-color">
                                    <p className="font-bold text-text-primary">{exp.component}</p>
                                    <p className="text-sm text-text-secondary mt-1"><strong className="text-text-primary">Hypothesis:</strong> {exp.hypothesis}</p>
                                    <p className="text-sm text-success mt-1"><strong className="text-text-primary">Conclusion:</strong> {exp.conclusion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-text-secondary">No R&D experiments logged yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PortfolioPage;