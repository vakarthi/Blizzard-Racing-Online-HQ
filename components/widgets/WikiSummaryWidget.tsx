import React, { useState, useEffect } from 'react';
import { wikiService } from '../../services/wikiService';
import type { WikiArticle } from '../../types';
import { SummaryWidget } from './SummaryWidget';

interface WikiSummaryWidgetProps {
    onNavigate: () => void;
}

const WikiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

export const WikiSummaryWidget: React.FC<WikiSummaryWidgetProps> = ({ onNavigate }) => {
    const [latestArticles, setLatestArticles] = useState<WikiArticle[]>([]);

    useEffect(() => {
        const articles = wikiService.getArticles();
        const latest = articles
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
            .slice(0, 3);
        setLatestArticles(latest);
    }, []);

    return (
        <SummaryWidget title="Latest Wiki Updates" icon={<WikiIcon />} linkText="Go to Wiki" onLinkClick={onNavigate}>
            {latestArticles.length > 0 ? (
                <ul className="space-y-2">
                    {latestArticles.map(article => (
                        <li key={article.id} className="text-sm p-2 rounded-md bg-background-tertiary/50">
                            <p className="font-bold text-text-primary truncate" title={article.title}>{article.title}</p>
                            <p className="text-xs text-text-secondary">by {article.author}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-text-secondary text-center h-full flex items-center justify-center">
                    <p>No articles in the wiki yet.</p>
                </div>
            )}
        </SummaryWidget>
    );
};
