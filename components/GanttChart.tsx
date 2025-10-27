import React from 'react';
import type { Task } from '../types';

interface GanttChartProps {
    tasks: Task[];
}

const getDaysDifference = (d1: Date, d2: Date) => {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
    if (tasks.length === 0) {
        return <p className="text-text-secondary">No competition material tasks to display.</p>;
    }

    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Start week view from 7 days ago
    const endDate = new Date(sortedTasks[sortedTasks.length - 1].dueDate);
    endDate.setDate(endDate.getDate() + 7); // End view 7 days after last task

    const totalDays = getDaysDifference(startDate, endDate);
    if (totalDays <= 0) {
        return <p className="text-text-secondary">Not enough data to render timeline.</p>;
    }
    
    const dayMarkers = Array.from({ length: totalDays }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        // Mark every Monday
        return date.getDay() === 1 ? <div key={i} className="absolute h-full border-l border-border-color/50" style={{ left: `${(i / totalDays) * 100}%` }}><span className="text-xs text-text-secondary/50 absolute -top-4 -translate-x-1/2">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span></div> : null;
    });

    return (
        <div className="space-y-3 relative overflow-x-auto">
            <div className="relative h-auto py-4">
                {/* Day Markers */}
                {dayMarkers}
            </div>
            {sortedTasks.map((task) => {
                const taskDueDate = new Date(task.dueDate);
                // Assume task starts 7 days before due date, or on start date if that's later
                const taskStartDate = new Date(taskDueDate);
                taskStartDate.setDate(taskDueDate.getDate() - 7);
                const clampedTaskStartDate = taskStartDate < startDate ? startDate : taskStartDate;

                const startOffsetDays = getDaysDifference(startDate, clampedTaskStartDate);
                const durationDays = getDaysDifference(clampedTaskStartDate, taskDueDate);
                
                const left = (startOffsetDays / totalDays) * 100;
                const width = (durationDays / totalDays) * 100;

                const statusColor = task.status === 'Done' ? 'bg-success/70' : task.status === 'In Progress' ? 'bg-primary/70' : 'bg-background-tertiary/70';

                return (
                    <div key={task.id} className="relative h-12 flex items-center group">
                        <div
                            className={`absolute h-8 rounded-md ${statusColor} border border-border-color whitespace-nowrap overflow-hidden transition-all duration-300`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${task.title} (Due: ${taskDueDate.toLocaleDateString()})`}
                        >
                            <span className="text-xs font-semibold text-text-primary px-2">{task.title}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};