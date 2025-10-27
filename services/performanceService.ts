import type { Goal, PerformanceNote } from '../types';

const GOALS_KEY = 'blizzard_racing_goals';
const NOTES_KEY = 'blizzard_racing_performance_notes';

const getStoredGoals = (): Goal[] => {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
};

const getStoredNotes = (): PerformanceNote[] => {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
};

export const performanceService = {
    // --- Goal Management ---
    getGoalsForUser: (userId: string): Goal[] => {
        return getStoredGoals().filter(g => g.userId === userId);
    },
    addGoal: (goal: Omit<Goal, 'id' | 'status'>): Goal[] => {
        const goals = getStoredGoals();
        const newGoal: Goal = {
            ...goal,
            id: `goal-${Date.now()}`,
            status: 'In Progress'
        };
        const newGoals = [...goals, newGoal];
        localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
        return newGoals;
    },
    updateGoalStatus: (goalId: string, status: 'In Progress' | 'Completed'): Goal[] => {
        const goals = getStoredGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex > -1) {
            goals[goalIndex].status = status;
        }
        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
        return goals;
    },
    deleteGoal: (goalId: string): Goal[] => {
        const goals = getStoredGoals();
        const newGoals = goals.filter(g => g.id !== goalId);
        localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
        return newGoals;
    },

    // --- Performance Note Management ---
    getNotesForUser: (userId: string): PerformanceNote[] => {
        return getStoredNotes()
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    addNote: (note: Omit<PerformanceNote, 'id' | 'timestamp'>): PerformanceNote[] => {
        const notes = getStoredNotes();
        const newNote: PerformanceNote = {
            ...note,
            id: `note-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        const newNotes = [...notes, newNote];
        localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
        return newNotes;
    },
};