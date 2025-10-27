import React, { useState, useEffect } from 'react';
import { wikiService } from '../services/wikiService';
import type { WikiArticle } from '../types';
import { useAuth } from '../hooks/useAuth';

// A simple markdown renderer (for demonstration)
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-3 mb-1">{line.substring(3)}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) return <strong key={i}>{line.substring(2, line.length-2)}</strong>
        if (line.startsWith('- ')) return <li key={i} className="ml-5 list-disc">{line.substring(2)}</li>
        return <p key={i} className="my-1">{line}</p>;
    });
    return <div className="prose text-text-primary">{lines}</div>;
};


const WikiPage: React.FC = () => {
    const { user, can } = useAuth();
    const [articles, setArticles] = useState<WikiArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState({ title: '', content: '' });

    const canWrite = can('wiki', 'write');

    const loadArticles = () => {
        const arts = wikiService.getArticles();
        setArticles(arts);
        return arts;
    };
    
    useEffect(() => {
        const arts = loadArticles();
        setSelectedArticle(arts[0] || null);
    }, []);

    const handleSelectArticle = (article: WikiArticle) => {
        setSelectedArticle(article);
        setIsEditing(false);
    };

    const handleNewArticle = () => {
        if (!canWrite) return;
        setSelectedArticle(null);
        setEditContent({ title: 'New Article Title', content: '# New Article\n\nStart writing here...' });
        setIsEditing(true);
    };

    const handleEdit = () => {
        if (!selectedArticle || !canWrite) return;
        setEditContent({ title: selectedArticle.title, content: selectedArticle.content });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!user || !canWrite) return;
        const savedArticle = wikiService.saveArticle({ 
            title: editContent.title, 
            content: editContent.content,
            author: user.nickname
        }, selectedArticle?.id);
        
        setIsEditing(false);
        loadArticles();
        setSelectedArticle(savedArticle);
    };
    
    const handleDelete = () => {
        if (!selectedArticle || !canWrite) return;
        if (window.confirm(`Are you sure you want to delete "${selectedArticle.title}"?`)) {
            wikiService.deleteArticle(selectedArticle.id);
            const remainingArticles = loadArticles();
            setSelectedArticle(remainingArticles[0] || null);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Team Wiki</h1>
                {canWrite && <button onClick={handleNewArticle} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">New Article</button>}
            </div>

            <div className="flex flex-col md:flex-row gap-8 h-[70vh]">
                <aside className="w-full md:w-1/4 bg-background-secondary p-4 rounded-lg border border-border-color">
                    <h2 className="text-lg font-bold text-text-primary mb-2">Articles</h2>
                    <ul className="space-y-1 overflow-y-auto">
                        {articles.map(art => (
                            <li key={art.id}>
                                <button 
                                    onClick={() => handleSelectArticle(art)}
                                    className={`w-full text-left p-2 rounded-md text-sm truncate ${selectedArticle?.id === art.id ? 'bg-primary text-text-on-primary' : 'hover:bg-background-tertiary'}`}
                                >
                                    {art.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="w-full md:w-3/4 bg-background-secondary p-6 rounded-lg border border-border-color flex flex-col">
                    {selectedArticle || isEditing ? (
                        <>
                            {isEditing && canWrite ? (
                                <div className="flex-1 flex flex-col">
                                    <input 
                                        type="text" 
                                        value={editContent.title}
                                        onChange={e => setEditContent({...editContent, title: e.target.value})}
                                        className="w-full bg-background-tertiary text-2xl font-bold p-2 rounded-md mb-4"
                                    />
                                    <textarea
                                        value={editContent.content}
                                        onChange={e => setEditContent({...editContent, content: e.target.value})}
                                        className="w-full flex-1 bg-background-tertiary p-2 rounded-md font-mono text-sm"
                                    />
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button onClick={() => setIsEditing(false)} className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg">Cancel</button>
                                        <button onClick={handleSave} className="bg-success hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Save Article</button>
                                    </div>
                                </div>
                            ) : selectedArticle && (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        <h1 className="text-3xl font-bold text-accent">{selectedArticle.title}</h1>
                                        {canWrite && (
                                            <div className="space-x-2">
                                                <button onClick={handleEdit} className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-1 px-3 rounded-lg text-sm">Edit</button>
                                                <button onClick={handleDelete} className="bg-danger hover:bg-danger-hover text-text-on-primary font-bold py-1 px-3 rounded-lg text-sm">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                     <p className="text-xs text-text-secondary mb-4">Last modified by {selectedArticle.author} on {new Date(selectedArticle.lastModified).toLocaleDateString()}</p>
                                    <SimpleMarkdown content={selectedArticle.content} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <p>Select an article to read or create a new one.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WikiPage;