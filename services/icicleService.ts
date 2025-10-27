import { GoogleGenAI, Type } from "@google/genai";
import { wikiService } from './wikiService';
import { projectService } from './projectService';
import { financeService } from './financeService';
import { sponsorshipService } from './sponsorshipService';
import { rdService } from './rdService';
import type { AnalysisResult, WikiArticle, Task } from '../types';

// A simple keyword extractor
const getKeywords = (text: string): string[] => {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 2 && word.length < 20);
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const socialPostSchema = {
  type: Type.OBJECT,
  properties: {
    instagram: {
      type: Type.STRING,
      description: "A post for Instagram, including relevant emojis and hashtags."
    },
    twitter: {
      type: Type.STRING,
      description: "A short, punchy post for Twitter/X, under 280 characters."
    },
    linkedin: {
      type: Type.STRING,
      description: "A professional post for LinkedIn, suitable for corporate sponsors and networking."
    }
  },
  required: ["instagram", "twitter", "linkedin"]
};


export const icicleService = {
  query: async (question: string, userNickname: string, analysisContext?: AnalysisResult | null): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate thinking
    const lowerQ = question.toLowerCase();

    // 1. Check for Analysis Context questions
    if (analysisContext && (lowerQ.includes('this') || lowerQ.includes('result') || lowerQ.includes('summary') || lowerQ.includes('design') || lowerQ.includes('analysis'))) {
        const { fileName, liftToDragRatio, dragCoefficient, scrutineeringReport } = analysisContext;
        const eligibility = scrutineeringReport.isEligibleForFastestCar ? 'is eligible' : 'is not eligible';
        let summary = `Here's a summary for **${fileName}**:\n\n`;
        summary += `- **Performance:** L/D Ratio of **${liftToDragRatio.toFixed(3)}** and a Drag Coefficient of **${dragCoefficient.toFixed(4)}**.\n`;
        summary += `- **Scrutineering:** Scored **${scrutineeringReport.finalScore}/${scrutineeringReport.basePoints}** and **${eligibility}**.\n`;
        if(scrutineeringReport.infractions.length > 0) {
            summary += `- **Issues:** Found **${scrutineeringReport.infractions.length}** rule infraction(s). The main one is: *"${scrutineeringReport.infractions[0].description}"*.`;
        } else {
            summary += `- **Compliance:** Passed all scrutineering checks.`;
        }
        return summary;
    }
    
    // 2. Check for specific service queries
    // Project Service
    if (lowerQ.includes('my tasks') || lowerQ.includes('my tickets')) {
        const tasks = projectService.getTasks().filter(t => t.assignee === userNickname && t.status !== 'Done');
        if (tasks.length === 0) return `You have no active tasks assigned to you, **${userNickname}**. Great job!`;
        let response = `Here are your active tasks, **${userNickname}**:\n\n`;
        tasks.slice(0, 5).forEach(t => {
            response += `- **${t.title}** (Priority: ${t.priority}, Due: ${new Date(t.dueDate).toLocaleDateString()})\n`;
        });
        return response;
    }

    // Finance Service
    if (lowerQ.includes('budget') || lowerQ.includes('finances') || lowerQ.includes('money left')) {
        const summary = financeService.getFinancialSummary();
        const categoryMatch = lowerQ.match(/budget for ([\w\s]+)/);
        if (categoryMatch && categoryMatch[1]) {
            const category = Object.keys(summary.expenseByCategory).find(k => k.toLowerCase().includes(categoryMatch[1].trim().toLowerCase()));
            if (category) {
                 return `The total spend for the **${category}** category is **${formatCurrency(summary.expenseByCategory[category])}**.`;
            }
        }
        return `The team's current financial status is:\n\n- **Total Income:** ${formatCurrency(summary.totalIncome)}\n- **Total Expenses:** ${formatCurrency(summary.totalExpenses)}\n- **Remaining Budget:** **${formatCurrency(summary.remainingBudget)}**`;
    }
    
    // R&D Service
    if (lowerQ.includes('r&d') || lowerQ.includes('experiment') || lowerQ.includes('research')) {
        const experiments = rdService.getExperiments();
        const keywords = getKeywords(lowerQ.replace('r&d', '').replace('experiment', '').replace('research', ''));
        const found = experiments.find(e => keywords.some(k => e.component.toLowerCase().includes(k)));
        if(found) {
            return `I found an R&D log for **${found.component}**:\n\n- **Hypothesis:** ${found.hypothesis}\n- **Conclusion:** ${found.conclusion}`;
        }
        return `I couldn't find a specific R&D log for that component. You can view all logs on the R&D Lab page.`;
    }

    // Sponsorship Service
    if (lowerQ.includes('sponsor') || lowerQ.includes('contact for')) {
        const sponsors = sponsorshipService.getSponsors();
        const keywords = getKeywords(lowerQ.replace('sponsor', '').replace('contact for', ''));
        const found = sponsors.find(s => keywords.some(k => s.name.toLowerCase().includes(k)));
        if(found) {
            return `The contact for **${found.name}** is **${found.contact}**. Status: **${found.status}**.`;
        }
    }

    // 3. Fallback to Wiki search
    const articles = wikiService.getArticles();
    const questionKeywords = getKeywords(lowerQ);
    if (questionKeywords.length === 0) {
        return "I need a bit more to go on. Please ask a more specific question.";
    }

    let bestMatch = { score: 0, article: null as WikiArticle | null };
    articles.forEach(article => {
        let score = 0;
        const titleKeywords = getKeywords(article.title);
        const contentKeywords = getKeywords(article.content);
        questionKeywords.forEach(qword => {
            if (titleKeywords.includes(qword)) score += 5;
            if (contentKeywords.includes(qword)) score += 1;
        });
        if (score > bestMatch.score) bestMatch = { score, article };
    });

    if (bestMatch.score > 1 && bestMatch.article) {
        const snippet = bestMatch.article.content.length > 500 ? bestMatch.article.content.substring(0, 500) + '...' : bestMatch.article.content;
        return `From the Team Wiki article **"${bestMatch.article.title}"**, I found this:\n\n${snippet}`;
    }

    return "I couldn't find specific information about that. Try asking about your tasks, the team budget, R&D, or check the Wiki directly.";
  },

  generateSocialsPost: async (topic: string, keywords: string): Promise<{ instagram: string; twitter: string; linkedin: string; } | null> => {
    try {
        const prompt = `You are a social media manager for "Blizzard Racing", a student racing team. 
        Generate a social media post about the following topic: "${topic}".
        Incorporate these key details/keywords: "${keywords}".
        The team's tone is energetic, professional, and passionate about engineering.
        Provide tailored versions for Instagram, Twitter/X, and LinkedIn.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialPostSchema,
                temperature: 0.7,
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating social media post:", error);
        return null;
    }
  },
};