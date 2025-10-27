import type { Task, TaskStatus } from '../types';
import { gamificationService } from './gamificationService';
import { activityService } from './activityService';

const TASKS_KEY = 'blizzard_racing_tasks';

const defaultTasks: Task[] = [
    { id: 'task-1', title: 'Finalise Car Body Design', description: 'Complete the final CAD model for the car body, focusing on CFD-informed surfaces.', status: 'In Progress', priority: 'High', assignee: 'Anish', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), isCompetitionMaterial: true },
    { id: 'task-2', title: 'Design Team Portfolio - Part 1', description: 'Create the initial draft for the first 10 pages of the team portfolio.', status: 'To Do', priority: 'Medium', assignee: 'Aarav', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), isCompetitionMaterial: true },
    { id: 'task-3', title: 'Contact Cyber Sky Securities', description: 'Follow up with Cyber Sky Securities regarding their sponsorship tier.', status: 'To Do', priority: 'High', assignee: 'Raiyan', dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString() },
    { id: 'task-4', title: 'Manufacture Front Wing', description: '3D print and finish the v3 front wing assembly.', status: 'Done', priority: 'High', assignee: 'Hadi', dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), isCompetitionMaterial: true },
    { id: 'task-5', title: 'Prepare Presentation Script', description: 'Draft the script for the verbal presentation.', status: 'To Do', priority: 'Medium', assignee: 'Shriv', dueDate: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(), isCompetitionMaterial: true },
];

const getStoredTasks = (): Task[] => {
    const tasks = localStorage.getItem(TASKS_KEY);
    if(tasks) return JSON.parse(tasks);
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
};

export const projectService = {
    getTasks: (): Task[] => {
        return getStoredTasks();
    },

    addTask: (task: Omit<Task, 'id' | 'status'>): Task[] => {
        const tasks = getStoredTasks();
        const newTask: Task = {
            ...task,
            id: `task-${Date.now()}`,
            status: 'To Do',
        };
        const newTasks = [...tasks, newTask];
        localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
        
        // Gamification hook
        gamificationService.checkAndUnlock('ADD_TASK', task.assignee);
        activityService.logActivity(task.assignee, 'Task Created', task.title);

        return newTasks;
    },

    updateTask: (updatedTask: Task): Task[] => {
        let tasks = getStoredTasks();
        const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex > -1) {
            tasks[taskIndex] = updatedTask;
        }
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

        // Gamification hook
        if (updatedTask.status === 'Done') {
            gamificationService.checkAndUnlock('COMPLETE_TASK', updatedTask.assignee);
            activityService.logActivity(updatedTask.assignee, 'Task Completed', updatedTask.title);
        }

        return tasks;
    },

    deleteTask: (taskId: string): Task[] => {
        let tasks = getStoredTasks();
        const newTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
        return newTasks;
    },

    getCompetitionProgress: (): { completed: number; total: number; percentage: number } => {
        const tasks = getStoredTasks();
        const competitionTasks = tasks.filter(t => t.isCompetitionMaterial);
        const total = competitionTasks.length;
        if (total === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const completedTasks = competitionTasks.filter(t => t.status === 'Done');
        const completed = completedTasks.length;
        const percentage = (completed / total) * 100;
        return { completed, total, percentage };
    }
};