import type { WikiArticle } from '../types';
import { gamificationService } from './gamificationService';
import { activityService } from './activityService';

const WIKI_KEY = 'blizzard_racing_wiki_articles';

const defaultArticles: WikiArticle[] = [
    {
        id: 'wiki-1',
        title: 'Welcome to the Team Wiki',
        content: `This is your team's central knowledge base. Use it to document everything from design principles to sponsorship outreach scripts. 
        \n\n**To get started:**
        - Create a new article for a specific topic.
        - Use Markdown for formatting (e.g., # Heading, **bold**).
        - Keep information concise and up-to-date.
        \n The **Blizzard Assistant** uses this information to answer questions!`,
        lastModified: new Date().toISOString(),
        author: 'Shriv'
    },
     {
        id: 'wiki-2',
        title: 'Aerodynamic Philosophy',
        content: `Our primary aero goal is to maximize the Lift-to-Drag (L/D) ratio while remaining within all technical regulations. 
        \n\n**Key principles:**
        1.  **Efficiency First:** We prioritize designs that produce downforce with minimal drag penalty.
        2.  **Airflow Management:** We focus on cleanly managing air around the wheels and directing it to the rear wing.
        3.  **Regulation Compliance:** All designs must be strictly compliant with the latest F1 in Schools technical regulations. Our target weight is 60.5g.`,
        lastModified: new Date().toISOString(),
        author: 'Anish'
    }
];

const getStoredArticles = (): WikiArticle[] => {
    const articles = localStorage.getItem(WIKI_KEY);
    if(articles) return JSON.parse(articles);
    localStorage.setItem(WIKI_KEY, JSON.stringify(defaultArticles));
    return defaultArticles;
};

export const wikiService = {
    getArticles: (): WikiArticle[] => {
        return getStoredArticles().sort((a,b) => a.title.localeCompare(b.title));
    },

    getArticle: (id: string): WikiArticle | undefined => {
        return getStoredArticles().find(a => a.id === id);
    },

    saveArticle: (articleData: Omit<WikiArticle, 'id' | 'lastModified'>, id?: string): WikiArticle => {
        let articles = getStoredArticles();
        let article: WikiArticle;

        if (id) { // Update existing
            const articleIndex = articles.findIndex(a => a.id === id);
            if (articleIndex > -1) {
                articles[articleIndex] = { ...articles[articleIndex], ...articleData, lastModified: new Date().toISOString() };
                article = articles[articleIndex];
            } else {
                throw new Error("Article to update not found");
            }
        } else { // Create new
            article = {
                ...articleData,
                id: `wiki-${Date.now()}`,
                lastModified: new Date().toISOString()
            };
            articles.push(article);
            // Gamification hook
            gamificationService.checkAndUnlock('CREATE_WIKI', article.author);
            // Analytics logging
            activityService.logActivity(article.author, 'Wiki Article Created', article.title);
        }

        localStorage.setItem(WIKI_KEY, JSON.stringify(articles));
        return article;
    },

    deleteArticle: (id: string): void => {
        let articles = getStoredArticles();
        const newArticles = articles.filter(a => a.id !== id);
        localStorage.setItem(WIKI_KEY, JSON.stringify(newArticles));
    },

    getAllArticlesAsText: (): string => {
        return getStoredArticles().map(article => `
            ---
            Article Title: ${article.title}
            Content:
            ${article.content}
            ---
        `).join('\n');
    }
};