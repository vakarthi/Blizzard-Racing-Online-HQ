import type { Achievement } from '../types';

const ACHIEVEMENTS_KEY_PREFIX = 'blizzard_racing_achievements_';

const allAchievements: Omit<Achievement, 'unlockedAt'>[] = [
    { id: 'add_task_1', title: 'Task Initiator', description: 'You added your first task!', icon: '📝' },
    { id: 'complete_task_1', title: 'Task Complete!', description: 'You completed your first task.', icon: '✅' },
    { id: 'run_sim_1', title: 'Aero Apprentice', description: 'You ran your first simulation.', icon: '💨' },
    { id: 'high_ld_1', title: 'Efficiency Expert', description: 'Achieved an L/D ratio over 3.5!', icon: '🏆' },
    { id: 'secure_sponsor_1', title: 'Deal Maker', description: 'Secured a sponsor!', icon: '🤝' },
    { id: 'create_wiki_1', title: 'Knowledge Keeper', description: 'Wrote your first wiki article.', icon: '📚' }
];

let achievementCallback: (achievement: Achievement) => void = () => {};

const getUnlockedAchievements = (userNickname: string): Achievement[] => {
    const key = `${ACHIEVEMENTS_KEY_PREFIX}${userNickname}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const saveUnlockedAchievements = (userNickname: string, achievements: Achievement[]) => {
    const key = `${ACHIEVEMENTS_KEY_PREFIX}${userNickname}`;
    localStorage.setItem(key, JSON.stringify(achievements));
};

type ActionType = 'ADD_TASK' | 'COMPLETE_TASK' | 'RUN_SIMULATION' | 'HIGH_LD_RATIO' | 'SECURE_SPONSOR' | 'CREATE_WIKI';

const actionToAchievementId: Record<ActionType, string> = {
    'ADD_TASK': 'add_task_1',
    'COMPLETE_TASK': 'complete_task_1',
    'RUN_SIMULATION': 'run_sim_1',
    'HIGH_LD_RATIO': 'high_ld_1',
    'SECURE_SPONSOR': 'secure_sponsor_1',
    'CREATE_WIKI': 'create_wiki_1'
};

export const gamificationService = {
    setAchievementCallback: (callback: (achievement: Achievement) => void) => {
        achievementCallback = callback;
    },

    checkAndUnlock: (action: ActionType, userNickname: string) => {
        const achievementId = actionToAchievementId[action];
        const unlocked = getUnlockedAchievements(userNickname);

        if (!unlocked.some(a => a.id === achievementId)) {
            const achievementToUnlock = allAchievements.find(a => a.id === achievementId);
            if (achievementToUnlock) {
                const newAchievement: Achievement = {
                    ...achievementToUnlock,
                    unlockedAt: new Date().toISOString()
                };
                const newUnlockedList = [...unlocked, newAchievement];
                saveUnlockedAchievements(userNickname, newUnlockedList);
                
                // Fire the callback to show the toast
                achievementCallback(newAchievement);
            }
        }
    },
    
    getLatestUnlocked: (count: number): (Achievement & { nickname: string })[] => {
        const allUsers = JSON.parse(localStorage.getItem('blizzard_racing_users') || '[]');
        let allUnlocked: (Achievement & { nickname: string })[] = [];
        
        allUsers.forEach((user: { nickname: string }) => {
            const userAchievements = getUnlockedAchievements(user.nickname);
            userAchievements.forEach(ach => {
                allUnlocked.push({ ...ach, nickname: user.nickname });
            });
        });

        return allUnlocked
            .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
            .slice(0, count);
    }
};