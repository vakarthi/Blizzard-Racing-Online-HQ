import type { AnalysisResult } from '../types';

const HISTORY_KEY_PREFIX = 'blizzard_racing_testhistory_';
const MAX_HISTORY_LENGTH = 50;

export const historyService = {
    getHistory: (email: string): AnalysisResult[] => {
        const historyJson = localStorage.getItem(`${HISTORY_KEY_PREFIX}${email}`);
        return historyJson ? JSON.parse(historyJson) : [];
    },

    saveHistory: (email: string, history: AnalysisResult[]) => {
        localStorage.setItem(`${HISTORY_KEY_PREFIX}${email}`, JSON.stringify(history));
    },
    
    addToHistory: (email: string, result: AnalysisResult, currentHistory: AnalysisResult[]): AnalysisResult[] => {
        const newHistory = [result, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
        historyService.saveHistory(email, newHistory);
        return newHistory;
    },

    clearHistory: (email: string) => {
        localStorage.removeItem(`${HISTORY_KEY_PREFIX}${email}`);
    }
};
