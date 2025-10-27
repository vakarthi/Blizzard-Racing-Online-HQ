import { activityService } from './activityService';
import { userService } from './userService';
import type { ActivityType } from '../types';

export const workloadPoints: Record<ActivityType, number> = {
    'Task Created': 2,
    'Task Completed': 5,
    'Simulation Run': 3,
    'Sponsor Added': 2,
    'Sponsor Secured': 15,
    'Wiki Article Created': 8,
    'R&D Log Created': 10,
    'Transaction Added': 1,
    'Chat Message Sent': 1,
};

export interface UserAnalytics {
    stats: { [key in ActivityType]?: number };
    totalScore: number;
}

export const analyticsService = {
    getTeamAnalytics: (): { userAnalytics: Record<string, UserAnalytics>, workloadDistribution: { name: string, value: number }[] } => {
        const activities = activityService.getActivities();
        const users = userService.getUsers();
        
        const userAnalytics: Record<string, UserAnalytics> = {};
        
        // Initialize for all users so even inactive users appear
        users.forEach(user => {
            userAnalytics[user.nickname] = {
                stats: {},
                totalScore: 0
            };
        });

        activities.forEach(activity => {
            const user = userAnalytics[activity.userNickname];
            if (user) {
                user.stats[activity.type] = (user.stats[activity.type] || 0) + 1;
                user.totalScore += (workloadPoints[activity.type] || 0);
            }
        });
        
        const workloadDistribution = Object.entries(userAnalytics)
            .map(([nickname, data]) => ({
                name: nickname,
                value: data.totalScore,
            }))
            .filter(item => item.value > 0); // Only show users with activity in the pie chart
            
        return { userAnalytics, workloadDistribution };
    }
};