import React, { useState, useEffect } from 'react';
import type { User, Chat, RolePermissions, AppSection, PermissionLevel, Goal, PerformanceNote } from '../types';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { useSiteSettings, useTheme, useAuth } from '../hooks/useAuth';
import { dataService } from '../services/dataService';
import { analyticsService, UserAnalytics } from '../services/analyticsService';
import { performanceService } from '../services/performanceService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


declare const mammoth: any;

const TeamAnalyticsTab: React.FC<{ analyticsData: { userAnalytics: Record<string, UserAnalytics>, workloadDistribution: { name: string, value: number }[] } }> = ({ analyticsData }) => {
    const { theme } = useTheme();

    const COLORS = [
        theme.colors['--color-primary'],
        theme.colors['--color-accent'],
        theme.colors['--color-success'],
        theme.colors['--color-warning'],
        theme.colors['--color-danger'],
        '#6366f1', // indigo-500
        '#ec4899', // pink-500
    ];

    if (analyticsData.workloadDistribution.length === 0) {
        return (
            <div className="text-center text-text-secondary py-10">
                <p>No team activity has been logged yet.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Workload Distribution</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={analyticsData.workloadDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {analyticsData.workloadDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: theme.colors['--color-background-primary'] }} formatter={(value) => [`${value} points`, 'Workload Score']}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-text-primary mb-3">User Contributions</h3>
                <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                    {/* Fix: Cast the result of Object.entries to ensure correct types for chained methods. */}
                    {(Object.entries(analyticsData.userAnalytics) as [string, UserAnalytics][])
                        .filter(([,data]) => data.totalScore > 0)
                        .sort(([, a], [, b]) => b.totalScore - a.totalScore)
                        .map(([nickname, data]) => (
                        <details key={nickname} className="bg-background-tertiary rounded-lg p-3 transition-all duration-300 open:bg-background-primary open:shadow-lg">
                            <summary className="font-bold text-text-primary cursor-pointer flex justify-between items-center">
                                <span>{nickname}</span>
                                <span className="text-sm text-accent font-semibold ml-2">Workload Score: {data.totalScore}</span>
                            </summary>
                            <ul className="mt-3 pt-2 border-t border-border-color pl-4 text-sm text-text-secondary list-disc space-y-1">
                                {Object.entries(data.stats).map(([type, count]) => (
                                    <li key={type}>{type}: <span className="font-semibold text-text-primary">{count}</span></li>
                                ))}
                            </ul>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    )
};

const PermissionsTab: React.FC = () => {
    const [permissions, setPermissions] = useState<RolePermissions>(userService.getRolePermissions());

    const handlePermissionChange = (role: User['role'], section: AppSection, level: PermissionLevel) => {
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [section]: level
            }
        }));
    };

    const handleSave = () => {
        userService.updateRolePermissions(permissions);
        alert('Permissions updated!');
    };
    
    const roles: User['role'][] = ['engineer', 'designer', 'marketing', 'member'];
    const sections: { key: AppSection, name: string }[] = [
        { key: 'projects', name: 'Projects' },
        { key: 'sponsorship', name: 'Sponsorship' },
        { key: 'finance', name: 'Finance' },
        { key: 'wiki', name: 'Wiki' },
        { key: 'rd', name: 'R&D Lab' },
        { key: 'socials', name: 'Socials' }
    ];

    return (
        <div className="space-y-4">
            <p className="text-text-secondary text-sm">Set edit or read-only access for each role. Managers always have full access.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-primary uppercase bg-background-tertiary">
                        <tr>
                            <th className="px-4 py-2">Role</th>
                            {sections.map(s => <th key={s.key} className="px-4 py-2">{s.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role} className="bg-background-secondary border-b border-border-color">
                                <td className="px-4 py-2 font-bold capitalize text-text-primary">{role}</td>
                                {sections.map(section => (
                                    <td key={section.key} className="px-4 py-2">
                                        <select
                                            value={permissions[role]?.[section.key] || 'read-only'}
                                            onChange={(e) => handlePermissionChange(role, section.key, e.target.value as PermissionLevel)}
                                            className="bg-background-tertiary text-text-primary rounded p-1 border border-border-color focus:ring-accent focus:border-accent"
                                        >
                                            <option value="read-only">Read-Only</option>
                                            <option value="edit">Edit</option>
                                        </select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">Save Permissions</button>
            </div>
        </div>
    );
};

const PerformanceTab: React.FC = () => {
    const { user: manager } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [notes, setNotes] = useState<PerformanceNote[]>([]);
    const [newGoal, setNewGoal] = useState({ description: '', dueDate: '' });
    const [newNote, setNewNote] = useState({ note: '', type: 'Kudos' as 'Kudos' | 'Feedback' });

    useEffect(() => {
        setUsers(userService.getUsers().filter(u => u.role !== 'manager'));
    }, []);

    useEffect(() => {
        if (selectedUser) {
            setGoals(performanceService.getGoalsForUser(selectedUser.email));
            setNotes(performanceService.getNotesForUser(selectedUser.email));
        } else {
            setGoals([]);
            setNotes([]);
        }
    }, [selectedUser]);

    const handleAddGoal = () => {
        if (!selectedUser || !newGoal.description || !newGoal.dueDate) return;
        performanceService.addGoal({ ...newGoal, userId: selectedUser.email });
        setGoals(performanceService.getGoalsForUser(selectedUser.email));
        setNewGoal({ description: '', dueDate: '' });
    };
    
    const handleAddNote = () => {
        if (!selectedUser || !newNote.note || !manager) return;
        performanceService.addNote({ ...newNote, userId: selectedUser.email, author: manager.nickname });
        setNotes(performanceService.getNotesForUser(selectedUser.email));
        setNewNote({ note: '', type: 'Kudos' });
    };

    return (
        <div>
            <select
                value={selectedUser?.email || ''}
                onChange={e => setSelectedUser(users.find(u => u.email === e.target.value) || null)}
                className="w-full max-w-xs bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent mb-4"
            >
                <option value="">Select a team member...</option>
                {users.map(u => <option key={u.email} value={u.email}>{u.name} ({u.nickname})</option>)}
            </select>

            {selectedUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Goals for {selectedUser.nickname}</h3>
                        <div className="bg-background-tertiary p-3 rounded-lg space-y-2 mb-3">
                             <input type="text" placeholder="New goal description..." value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} className="w-full bg-background-primary p-2 rounded" />
                             <input type="date" value={newGoal.dueDate} onChange={e => setNewGoal({...newGoal, dueDate: e.target.value})} className="w-full bg-background-primary p-2 rounded" />
                             <button onClick={handleAddGoal} className="w-full bg-primary hover:bg-primary-hover text-text-on-primary font-bold text-sm py-1 px-3 rounded">Add Goal</button>
                        </div>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {goals.map(goal => <li key={goal.id} className="text-sm p-2 rounded bg-background-tertiary">{goal.description} (Due: {new Date(goal.dueDate).toLocaleDateString()})</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Performance Notes</h3>
                         <div className="bg-background-tertiary p-3 rounded-lg space-y-2 mb-3">
                            <textarea placeholder="Add Kudos or Feedback..." value={newNote.note} onChange={e => setNewNote({...newNote, note: e.target.value})} rows={3} className="w-full bg-background-primary p-2 rounded"></textarea>
                            <div className="flex justify-between items-center">
                                <select value={newNote.type} onChange={e => setNewNote({...newNote, type: e.target.value as 'Kudos'|'Feedback'})} className="bg-background-primary p-1 rounded">
                                    <option value="Kudos">Kudos</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                                <button onClick={handleAddNote} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold text-sm py-1 px-3 rounded">Add Note</button>
                            </div>
                         </div>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                           {notes.map(note => (
                               <li key={note.id} className={`p-2 rounded border-l-4 ${note.type === 'Kudos' ? 'border-success bg-success/10' : 'border-warning bg-warning/10'}`}>
                                   <p className="text-sm text-text-primary">{note.note}</p>
                                   <p className="text-xs text-text-secondary text-right">{new Date(note.timestamp).toLocaleString()}</p>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


interface UserManagementModalProps {
  onClose: () => void;
}

type ActiveTab = 'users' | 'analytics' | 'permissions' | 'performance' | 'chat' | 'settings' | 'data';

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', nickname: '', email: '', password: '', role: 'member' as User['role'] });
  const [userFeedback, setUserFeedback] = useState({ message: '', type: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState({ name: '', nickname: '', email: '', role: 'member' as User['role'] });
  
  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChat, setNewChat] = useState('');
  const [chatFeedback, setChatFeedback] = useState({ message: '', type: '' });
  
  // Site Settings state
  const { appName, logo, competitionDate, updateAppName, updateLogo, removeLogo: removeLogoFromStore, updateCompetitionDate } = useSiteSettings();
  const [siteAppName, setSiteAppName] = useState(appName);
  const [siteLogo, setSiteLogo] = useState<string | null>(logo);
  const [siteCompetitionDate, setSiteCompetitionDate] = useState(competitionDate || '');
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<{ userAnalytics: Record<string, UserAnalytics>, workloadDistribution: { name: string, value: number }[] } | null>(null);


  const fetchAllData = () => {
    setUsers(userService.getUsers());
    setChats(chatService.getChats());
    setAnalyticsData(analyticsService.getTeamAnalytics());
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.nickname || !newUser.email || !newUser.password) {
      setUserFeedback({ message: 'All fields are required.', type: 'error' });
      return;
    }
    const result = userService.addUser({ name: newUser.name, nickname: newUser.nickname, email: newUser.email, role: newUser.role }, newUser.password);
    setUserFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      fetchAllData();
      setNewUser({ name: '', nickname: '', email: '', password: '', role: 'member' });
    }
  };
  
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditedUserData({ name: user.name, nickname: user.nickname, email: user.email, role: user.role });
    setUserFeedback({ message: '', type: '' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const result = userService.updateUser(editingUser.email, editedUserData);
    setUserFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setEditingUser(null);
      fetchAllData();
    }
  };

  const handleRemoveUser = (email: string) => {
    if (window.confirm(`Are you sure you want to remove user ${email}?`)) {
        const result = userService.removeUser(email);
        setUserFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
        if(result.success) fetchAllData();
    }
  };

  const handleAddChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newChat.trim()) return;
      const result = chatService.addChat(newChat);
      setChatFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
      if (result.success) {
          fetchAllData();
          window.dispatchEvent(new Event('storage'));
          setNewChat('');
      }
  };
  
  const handleRemoveChat = (chat: Chat) => {
      if (window.confirm(`Are you sure you want to remove the chat "${chat.name}"?`)) {
          const result = chatService.removeChat(chat.id);
          setChatFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
          if(result.success) {
            fetchAllData();
            window.dispatchEvent(new Event('storage'));
          }
      }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSiteLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveLogo = () => {
    setSiteLogo(null);
  };
  
  const handleSaveSettings = () => {
    updateAppName(siteAppName);
    if (siteLogo) {
        updateLogo(siteLogo);
    } else {
        removeLogoFromStore();
    }
    updateCompetitionDate(siteCompetitionDate);
    setSettingsFeedback('Site settings updated!');
    setTimeout(() => setSettingsFeedback(''), 2000);
  };
  
  const handleExportData = () => {
      dataService.exportAllData();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if(window.confirm("Are you sure you want to import this data? This will overwrite all current data in the application.")) {
            dataService.importAllData(file);
        }
    }
  };


  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
     <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'bg-background-secondary text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}>
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-background-primary bg-opacity-75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
      <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-4xl border border-border-color modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-2xl font-bold text-text-primary">Manager Panel</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        
        <div className="border-b border-border-color px-4">
            <nav className="flex space-x-2">
                <TabButton tab="users" label="Users" />
                <TabButton tab="analytics" label="Team Analytics" />
                <TabButton tab="permissions" label="Permissions" />
                <TabButton tab="performance" label="Performance" />
                <TabButton tab="chat" label="Chats" />
                <TabButton tab="settings" label="Site" />
                <TabButton tab="data" label="Data" />
            </nav>
        </div>

        <div className="p-6 h-[60vh] overflow-y-auto">
            {activeTab === 'users' && (
                <div>
                     <div className="bg-background-primary/50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Add New User</h3>
                        <form onSubmit={handleAddUser} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                            <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"/>
                            <input type="text" placeholder="Nickname" value={newUser.nickname} onChange={e => setNewUser({...newUser, nickname: e.target.value})} className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"/>
                            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"/>
                            <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"/>
                            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as User['role']})} className="col-span-2 md:col-span-1 bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                <option value="member">Member</option>
                                <option value="engineer">Engineer</option>
                                <option value="designer">Designer</option>
                                <option value="marketing">Marketing</option>
                                <option value="manager">Manager</option>
                            </select>
                            <button type="submit" className="col-span-2 md:col-span-3 bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Add User</button>
                        </form>
                         {userFeedback.message && !editingUser && <p className={`mt-3 text-sm text-center ${userFeedback.type === 'success' ? 'text-success' : 'text-danger'}`}>{userFeedback.message}</p>}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Current Users</h3>
                        {userFeedback.message && editingUser && <p className={`mb-2 text-sm text-center ${userFeedback.type === 'success' ? 'text-success' : 'text-danger'}`}>{userFeedback.message}</p>}
                        <div className="max-h-60 overflow-y-auto">
                           <ul className="space-y-2">
                                {users.map(user => {
                                    if (editingUser && editingUser.email === user.email) {
                                        const isDefaultManager = user.email === 'shrivatsakarth.kart@saintolaves.net';
                                        return (
                                            <li key={user.email} className="bg-background-primary/50 p-3 rounded-lg space-y-3 border border-accent/50">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={editedUserData.name}
                                                        onChange={e => setEditedUserData({...editedUserData, name: e.target.value})}
                                                        className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"
                                                    />
                                                     <input 
                                                        type="text" 
                                                        value={editedUserData.nickname}
                                                        onChange={e => setEditedUserData({...editedUserData, nickname: e.target.value})}
                                                        className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"
                                                    />
                                                    <input 
                                                        type="email" 
                                                        value={editedUserData.email}
                                                        disabled={isDefaultManager}
                                                        onChange={e => setEditedUserData({...editedUserData, email: e.target.value})}
                                                        className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <select 
                                                        value={editedUserData.role}
                                                        disabled={isDefaultManager}
                                                        onChange={e => setEditedUserData({...editedUserData, role: e.target.value as User['role']})}
                                                        className="bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="engineer">Engineer</option>
                                                        <option value="designer">Designer</option>
                                                        <option value="marketing">Marketing</option>
                                                        <option value="manager">Manager</option>
                                                    </select>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={handleCancelEdit} className="bg-background-tertiary hover:bg-border-color text-text-primary text-xs font-bold py-1 px-3 rounded-md transition-all hover:-translate-y-0.5">Cancel</button>
                                                    <button onClick={handleUpdateUser} className="bg-primary hover:bg-primary-hover text-text-on-primary text-xs font-bold py-1 px-3 rounded-md transition-all hover:-translate-y-0.5">Save</button>
                                                </div>
                                            </li>
                                        )
                                    }
                                    return (
                                        <li key={user.email} className="flex justify-between items-center bg-background-tertiary p-3 rounded-lg">
                                            <div>
                                                <p className="font-bold text-text-primary">{user.nickname} <span className="text-sm text-text-secondary font-normal">({user.name})</span></p>
                                                <p className="text-sm text-text-secondary">{user.email} - <span className="capitalize">{user.role}</span></p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEditClick(user)} className="bg-border-color hover:bg-opacity-70 text-text-primary text-xs font-bold py-1 px-2 rounded-md transition-all hover:-translate-y-0.5">Edit</button>
                                                <button onClick={() => handleRemoveUser(user.email)} className="bg-danger hover:bg-danger-hover text-text-on-primary text-xs font-bold py-1 px-2 rounded-md transition-all hover:-translate-y-0.5 disabled:opacity-50" disabled={user.email === 'shrivatsakarth.kart@saintolaves.net'}>Remove</button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'analytics' && analyticsData && (
                <TeamAnalyticsTab analyticsData={analyticsData} />
            )}
             {activeTab === 'permissions' && (
                <PermissionsTab />
            )}
            {activeTab === 'performance' && (
                <PerformanceTab />
            )}
            {activeTab === 'chat' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Current Chats</h3>
                         <div className="max-h-60 overflow-y-auto">
                             <ul className="space-y-2">
                                {chats.map(c => (
                                     <li key={c.id} className="flex justify-between items-center bg-background-tertiary p-3 rounded-lg">
                                        <p className="font-bold text-text-primary truncate" title={c.name}>{c.name}</p>
                                        <button onClick={() => handleRemoveChat(c)} className="bg-danger hover:bg-danger-hover text-text-on-primary text-xs font-bold py-1 px-2 rounded-md transition-all hover:-translate-y-0.5 disabled:opacity-50 flex-shrink-0">Remove</button>
                                     </li>
                                ))}
                             </ul>
                         </div>
                    </div>
                     <div className="bg-background-primary/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Add New Chat</h3>
                        <form onSubmit={handleAddChat} className="flex space-x-2">
                             <input type="text" placeholder="New chat name..." value={newChat} onChange={e => setNewChat(e.target.value)} className="flex-1 bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"/>
                             <button type="submit" className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Add</button>
                        </form>
                         {chatFeedback.message && <p className={`mt-3 text-sm text-center ${chatFeedback.type === 'success' ? 'text-success' : 'text-danger'}`}>{chatFeedback.message}</p>}
                     </div>
                </div>
            )}
             {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div>
                        <label htmlFor="app-name" className="block text-sm font-medium text-text-secondary mb-1">Application Name</label>
                        <input id="app-name" type="text" value={siteAppName} onChange={e => setSiteAppName(e.target.value)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Team Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-background-primary/50 rounded border border-border-color flex items-center justify-center">
                                {siteLogo ? <img src={siteLogo} alt="Logo Preview" className="max-w-full max-h-full" /> : <span className="text-xs text-text-secondary">None</span>}
                            </div>
                            <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
                            <label htmlFor="logo-upload" className="bg-background-tertiary hover:bg-border-color text-text-primary font-bold py-2 px-3 rounded-lg transition-all cursor-pointer hover:-translate-y-0.5">Upload Logo</label>
                            <button onClick={handleRemoveLogo} className="bg-danger hover:bg-danger-hover text-text-on-primary font-bold py-2 px-3 rounded-lg transition-all hover:-translate-y-0.5">Remove</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="competition-date" className="block text-sm font-medium text-text-secondary mb-1">Competition Date</label>
                        <input id="competition-date" type="date" value={siteCompetitionDate} onChange={e => setSiteCompetitionDate(e.target.value)} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                        <p className="text-xs text-text-secondary mt-1">This date powers the countdown timer on the HQ dashboard.</p>
                    </div>
                    <div className="flex justify-end items-center">
                         {settingsFeedback && <p className="text-sm text-success mr-4">{settingsFeedback}</p>}
                        <button onClick={handleSaveSettings} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Save Site Settings</button>
                    </div>
                </div>
            )}
             {activeTab === 'data' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Export Data</h3>
                        <p className="text-sm text-text-secondary mb-3">Download a full backup of all team data, including users, projects, finances, and settings.</p>
                        <button onClick={handleExportData} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Export All Data</button>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary">Import Data</h3>
                        <p className="text-sm text-text-secondary mb-3">Restore the application state from a backup file. <strong className="text-warning">Warning:</strong> This will overwrite all existing data.</p>
                        <input type="file" id="import-upload" accept=".json" onChange={handleImportData} className="hidden" />
                        <label htmlFor="import-upload" className="bg-danger hover:bg-danger-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer">Import and Overwrite Data</label>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};