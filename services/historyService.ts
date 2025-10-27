import type { AnalysisResult } from '../types';
import { gamificationService } from './gamificationService';
import { activityService } from './activityService';
import { userService } from './userService';

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

        const user = userService.getUsers().find(u => u.email === email);
        if (user) {
            // Gamification Hooks
            gamificationService.checkAndUnlock('RUN_SIMULATION', user.nickname);
            if (result.liftToDragRatio > 3.5) {
                gamificationService.checkAndUnlock('HIGH_LD_RATIO', user.nickname);
            }
            // Analytics Logging
            activityService.logActivity(user.nickname, 'Simulation Run', result.fileName);
        }

        return newHistory;
    },

    clearHistory: (email: string) => {
        localStorage.removeItem(`${HISTORY_KEY_PREFIX}${email}`);
    }
};
