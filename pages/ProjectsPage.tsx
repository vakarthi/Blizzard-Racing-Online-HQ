import React, { useState, useEffect, useMemo } from 'react';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import type { Task, TaskStatus, TaskPriority, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { GanttChart } from '../components/GanttChart';

const priorityColors: Record<TaskPriority, string> = {
    High: 'border-danger',
    Medium: 'border-warning',
    Low: 'border-accent'
};

const AddTaskModal: React.FC<{ users: User[], onAddTask: (task: Omit<Task, 'id' | 'status'>) => void, onClose: () => void }> = ({ users, onAddTask, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState(users[0]?.nickname || '');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const [isCompetitionMaterial, setIsCompetitionMaterial] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTask({ title, description, assignee, dueDate, priority, isCompetitionMaterial });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background-primary/75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
            <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-lg border border-border-color modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Add New Task</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                    {users.map(u => <option key={u.email} value={u.nickname}>{u.nickname}</option>)}
                                </select>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            </div>
                            <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="competition-material" 
                                    checked={isCompetitionMaterial} 
                                    onChange={e => setIsCompetitionMaterial(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="competition-material" className="text-sm text-text-secondary">This is competition material</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background-tertiary px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-border-color hover:bg-opacity-70 text-text-primary font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">Add Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const KanbanCard: React.FC<{ task: Task, onDragStart: (e: React.DragEvent, taskId: string) => void, canWrite: boolean }> = ({ task, onDragStart, canWrite }) => (
    <div
        draggable={canWrite}
        onDragStart={e => onDragStart(e, task.id)}
        className={`bg-background-secondary p-3 rounded-lg border border-border-color shadow-lg ${canWrite ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : 'cursor-default'} transition-transform duration-200`}
    >
        <div className={`h-2 w-1/4 rounded-full mb-2 ${priorityColors[task.priority].replace('border-', 'bg-')}`}></div>
        <p className="font-bold text-text-primary">{task.title}</p>
        <p className="text-sm text-text-secondary mt-1">{task.description}</p>
        <div className="flex justify-between items-center mt-3">
            <span className="text-xs font-semibold bg-background-tertiary text-text-secondary px-2 py-1 rounded-full">{task.assignee}</span>
            <span className="text-xs text-text-secondary">{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
    </div>
);

const KanbanColumn: React.FC<{ title: TaskStatus, tasks: Task[], onDragOver: (e: React.DragEvent) => void, onDrop: (e: React.DragEvent, status: TaskStatus) => void, onDragStart: (e: React.DragEvent, taskId: string) => void, canWrite: boolean }> = ({ title, tasks, onDragOver, onDrop, onDragStart, canWrite }) => {
    const [isOver, setIsOver] = useState(false);
    return (
        <div 
            className={`bg-background-secondary/50 rounded-lg p-3 w-full md:w-1/3 transition-colors ${isOver && canWrite ? 'bg-primary/10' : ''}`}
            onDragOver={e => {
                if(canWrite) {
                    onDragOver(e);
                    setIsOver(true);
                }
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={e => {
                if(canWrite) {
                    onDrop(e, title);
                    setIsOver(false);
                }
            }}
        >
            <h3 className="font-bold text-lg text-text-primary px-2 mb-4">{title} ({tasks.length})</h3>
            <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                {tasks.map(task => <KanbanCard key={task.id} task={task} onDragStart={onDragStart} canWrite={canWrite} />)}
            </div>
        </div>
    );
};

const ProjectsPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, can } = useAuth();
    const [activeView, setActiveView] = useState<'kanban' | 'timeline'>('kanban');

    const canWrite = can('projects', 'write');

    useEffect(() => {
        setTasks(projectService.getTasks());
        setUsers(userService.getUsers());
    }, []);

    const columns: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
    const tasksByStatus = useMemo(() => {
        return columns.reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);
    
    const competitionTasks = useMemo(() => tasks.filter(t => t.isCompetitionMaterial), [tasks]);


    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        if (!canWrite) return;
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!canWrite) return;
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
        if (!canWrite) return;
        const taskId = e.dataTransfer.getData("taskId");
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            const updatedTask = { ...task, status: newStatus };
            const newTasks = projectService.updateTask(updatedTask);
            setTasks(newTasks);
        }
    };
    
    const handleAddTask = (task: Omit<Task, 'id' | 'status'>) => {
        const newTasks = projectService.addTask(task);
        setTasks(newTasks);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                        Project Management
                    </h1>
                     <div className="border-b border-border-color mt-3">
                        <nav className="flex space-x-2 -mb-px">
                            <button onClick={() => setActiveView('kanban')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeView === 'kanban' ? 'text-accent border-accent' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>Kanban Board</button>
                            {user?.role === 'manager' && <button onClick={() => setActiveView('timeline')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeView === 'timeline' ? 'text-accent border-accent' : 'text-text-secondary border-transparent hover:text-text-primary'}`}>Timeline</button>}
                        </nav>
                    </div>
                </div>
                {canWrite && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2 self-start md:self-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>New Task</span>
                    </button>
                )}
            </div>

            {activeView === 'kanban' ? (
                <div className="flex flex-col md:flex-row gap-6">
                    {columns.map(status => (
                        <KanbanColumn
                            key={status}
                            title={status}
                            tasks={tasksByStatus[status]}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            canWrite={canWrite}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-background-secondary/50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-text-primary mb-4">Competition Materials Timeline</h3>
                    <GanttChart tasks={competitionTasks} />
                </div>
            )}
            
            {isModalOpen && canWrite && <AddTaskModal users={users} onAddTask={handleAddTask} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ProjectsPage;