import React, { useState } from 'react';
import { icicleService } from '../services/icicleService';

interface GeneratedPosts {
    instagram: string;
    twitter: string;
    linkedin: string;
}

const SocialsPage: React.FC = () => {
    const [topic, setTopic] = useState('New Sponsor Announcement');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState<GeneratedPosts | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedPosts(null);

        const result = await icicleService.generateSocialsPost(topic, keywords);
        if (result) {
            setGeneratedPosts(result);
        } else {
            setError('Failed to generate posts. The Icicle Assistant might be busy. Please try again.');
        }
        setIsLoading(false);
    };
    
    const topics = [
        "New Sponsor Announcement",
        "Race Result (Win)",
        "Race Result (Podium)",
        "Race Result (Participation)",
        "Behind the Scenes (Manufacturing)",
        "Team Member Spotlight",
        "Technical Innovation Reveal",
        "General Team Update"
    ];

    const CopyButton: React.FC<{ text: string }> = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="text-sm font-semibold text-accent hover:underline">
                {copied ? 'Copied!' : 'Copy'}
            </button>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                    Social Media Assistant
                </h1>
                <p className="text-text-secondary mt-2">Let the Icicle Assistant help you craft the perfect post.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <form onSubmit={handleGenerate} className="bg-background-secondary p-6 rounded-lg border border-border-color shadow-lg space-y-4">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-text-secondary mb-1">Post Topic</label>
                            <select id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary mb-1">Keywords / Details</label>
                            <textarea 
                                id="keywords"
                                value={keywords} 
                                onChange={e => setKeywords(e.target.value)}
                                placeholder="e.g., 'Cyber Sky Securities, Gold Tier, new CNC machine'"
                                rows={4}
                                className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
                            {isLoading ? 'Generating...' : 'Generate Posts'}
                        </button>
                    </form>
                </div>
                
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                        {isLoading && (
                            <div className="text-center p-8 bg-background-secondary rounded-lg border border-border-color">
                                <p className="text-text-primary">Icicle is thinking...</p>
                                 <div className="flex justify-center items-center space-x-2 mt-4">
                                    <span className="h-3 w-3 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-3 w-3 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-3 w-3 bg-accent rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-danger text-center">{error}</p>}
                        {generatedPosts ? (
                            <>
                                <div className="bg-background-secondary p-4 rounded-lg border border-border-color shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg text-text-primary">Instagram</h3>
                                        <CopyButton text={generatedPosts.instagram} />
                                    </div>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{generatedPosts.instagram}</p>
                                </div>
                                <div className="bg-background-secondary p-4 rounded-lg border border-border-color shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg text-text-primary">Twitter / X</h3>
                                        <CopyButton text={generatedPosts.twitter} />
                                    </div>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{generatedPosts.twitter}</p>
                                </div>
                                <div className="bg-background-secondary p-4 rounded-lg border border-border-color shadow-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg text-text-primary">LinkedIn</h3>
                                        <CopyButton text={generatedPosts.linkedin} />
                                    </div>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{generatedPosts.linkedin}</p>
                                </div>
                            </>
                        ) : !isLoading && (
                             <div className="text-center p-8 bg-background-secondary rounded-lg border-2 border-dashed border-border-color">
                                <p className="text-text-secondary">Your generated posts will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialsPage;