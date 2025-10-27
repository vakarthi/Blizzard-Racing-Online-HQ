import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import type { Task } from '../../types';
import { SummaryWidget } from './SummaryWidget';

interface ProjectSummaryWidgetProps {
    onNavigate: () => void;
}

const ProjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;

const timeUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    if (diff < 0) return <span className="text-danger">Overdue</span>;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `in ${days} day${days > 1 ? 's' : ''}`;
};

export const ProjectSummaryWidget: React.FC<ProjectSummaryWidgetProps> = ({ onNavigate }) => {
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    
    useEffect(() => {
        const tasks = projectService.getTasks();
        const upcoming = tasks
            .filter(t => t.status !== 'Done')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 4);
        setUpcomingTasks(upcoming);
    }, []);

    return (
        <SummaryWidget title="Upcoming Deadlines" icon={<ProjectIcon />} linkText="View All Tasks" onLinkClick={onNavigate}>
            {upcomingTasks.length > 0 ? (
                <ul className="space-y-3">
                    {upcomingTasks.map(task => (
                        <li key={task.id} className="flex justify-between items-center text-sm">
                            <div>
                                <p className="font-bold text-text-primary truncate" title={task.title}>{task.title}</p>
                                <p className="text-text-secondary">Assigned to {task.assignee}</p>
                            </div>
                            <p className="font-semibold text-text-primary flex-shrink-0 ml-2">{timeUntil(task.dueDate)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-text-secondary text-center h-full flex items-center justify-center">
                    <p>No upcoming tasks. Great job!</p>
                </div>
            )}
        </SummaryWidget>
    );
};
