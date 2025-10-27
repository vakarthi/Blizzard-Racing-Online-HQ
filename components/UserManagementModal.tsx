import React, { useState, useEffect } from 'react';
import type { User, Chat } from '../types';
import { userService } from '../services/userService';
import { icicleService } from '../services/icicleService';
import { chatService } from '../services/chatService';
import { useSiteSettings } from '../hooks/useAuth';

declare const mammoth: any;

interface UserManagementModalProps {
  onClose: () => void;
}

type ActiveTab = 'users' | 'icicle' | 'chat' | 'settings';

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', nickname: '', email: '', password: '', role: 'member' as User['role'] });
  const [userFeedback, setUserFeedback] = useState({ message: '', type: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState({ name: '', nickname: '', email: '', role: 'member' as User['role'] });
  
  // Icicle state
  const [knowledge, setKnowledge] = useState('');
  const [icicleFeedback, setIcicleFeedback] = useState('');

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChat, setNewChat] = useState('');
  const [chatFeedback, setChatFeedback] = useState({ message: '', type: '' });
  
  // Site Settings state
  const { appName, logo, updateAppName, updateLogo, removeLogo: removeLogoFromStore } = useSiteSettings();
  const [siteAppName, setSiteAppName] = useState(appName);
  const [siteLogo, setSiteLogo] = useState<string | null>(logo);
  const [settingsFeedback, setSettingsFeedback] = useState('');


  const fetchAllData = () => {
    setUsers(userService.getUsers());
    setKnowledge(icicleService.getKnowledge());
    setChats(chatService.getChats());
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

  const handleSaveKnowledge = () => {
    icicleService.saveKnowledge(knowledge);
    setIcicleFeedback('Knowledge base updated!');
    setTimeout(() => setIcicleFeedback(''), 2000);
  };
  
  const handleFileKnowledgeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIcicleFeedback('Processing file...');
    const reader = new FileReader();
    
    if (file.name.toLowerCase().endsWith('.txt')) {
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setKnowledge(prev => prev + '\n\n--- Uploaded Knowledge ---\n' + text);
            setIcicleFeedback('Knowledge from file loaded. Review and click Save.');
        };
        reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith('.docx')) {
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then((result: any) => {
                    const text = result.value;
                    setKnowledge(prev => prev + '\n\n--- Uploaded Knowledge ---\n' + text);
                    setIcicleFeedback('Knowledge from .docx loaded. Review and click Save.');
                })
                .catch((err: Error) => {
                    console.error(err);
                    setIcicleFeedback('Error reading .docx file.');
                });
        };
        reader.readAsArrayBuffer(file);
    } else {
        setIcicleFeedback('Unsupported file type. Please use .txt or .docx.');
    }

    event.target.value = ''; // Reset file input
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
    setSettingsFeedback('Site settings updated!');
    setTimeout(() => setSettingsFeedback(''), 2000);
  };


  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
     <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'bg-background-secondary text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}>
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-background-primary bg-opacity-75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
      <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-3xl border border-border-color modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-2xl font-bold text-text-primary">Manager Panel</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        
        <div className="border-b border-border-color px-4">
            <nav className="flex space-x-2">
                <TabButton tab="users" label="User Management" />
                <TabButton tab="icicle" label="Icicle Knowledge" />
                <TabButton tab="chat" label="Team Chats" />
                <TabButton tab="settings" label="Site Settings" />
            </nav>
        </div>

        <div className="p-6">
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
            {activeTab === 'icicle' && (
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Edit Icicle's Knowledge Base</h3>
                    <p className="text-sm text-text-secondary mb-2">Update this information to teach Icicle about the team. The AI will use this text to answer questions.</p>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Upload Knowledge File (.docx, .txt)</label>
                        <input 
                            type="file" 
                            accept=".docx,.txt" 
                            onChange={handleFileKnowledgeUpload}
                            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-text-on-primary hover:file:bg-primary-hover"
                        />
                    </div>
                    <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)} rows={10} className="w-full bg-background-primary/50 text-text-primary rounded-lg p-3 border border-border-color focus:ring-accent focus:border-accent font-mono text-sm"></textarea>
                    <div className="mt-4 flex justify-end items-center">
                         {icicleFeedback && <p className="text-sm text-success mr-4">{icicleFeedback}</p>}
                        <button onClick={handleSaveKnowledge} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Save Knowledge</button>
                    </div>
                </div>
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
                    <div className="flex justify-end items-center">
                         {settingsFeedback && <p className="text-sm text-success mr-4">{settingsFeedback}</p>}
                        <button onClick={handleSaveSettings} className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5">Save Site Settings</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};