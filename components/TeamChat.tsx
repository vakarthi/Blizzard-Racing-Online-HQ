import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import type { Chat, ChatMessage } from '../types';
import { useAuth } from '../hooks/useAuth';
import { activityService } from '../services/activityService';

export const TeamChat: React.FC = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadChats = () => {
        const allChats = chatService.getChats();
        setChats(allChats);
        return allChats;
    };

    // Initial load
    useEffect(() => {
        const allChats = loadChats();
        if (allChats.length > 0 && !activeChatId) {
            setActiveChatId(allChats[0].id);
        }
    }, []);

    // Respond to external changes from other components (like the manager modal)
    useEffect(() => {
        const handleStorageChange = () => {
            const allChats = loadChats();
            // If current active chat was deleted, switch to the first available one
            if (activeChatId && !allChats.some(c => c.id === activeChatId)) {
                setActiveChatId(allChats.length > 0 ? allChats[0].id : '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [activeChatId]);

    // Fetch messages when active chat changes
    useEffect(() => {
        if (activeChatId) {
            setMessages(chatService.getMessages(activeChatId));
        } else {
            setMessages([]); // Clear messages if no chat is selected
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatId]);
    
    // Scroll on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const activeChat = chats.find(c => c.id === activeChatId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !activeChatId) return;

        if (activeChat) {
            activityService.setLastActivity(user.email, { 
                type: 'chat_message',
                details: { chatName: activeChat.name }
            });
        }
        
        chatService.addMessage(activeChatId, { nickname: user.nickname }, input);
        setMessages(chatService.getMessages(activeChatId));
        setInput('');
    };

    return (
        <div className="bg-background-secondary rounded-lg border border-border-color shadow-lg h-[30rem] flex">
            <div className="w-1/4 border-r border-border-color flex flex-col">
                <div className="p-4 border-b border-border-color">
                    <h3 className="text-lg font-bold text-text-primary">Chats</h3>
                </div>
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {chats.map(chat => (
                        <button 
                            key={chat.id}
                            onClick={() => setActiveChatId(chat.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium truncate ${activeChatId === chat.id ? 'bg-background-primary text-text-primary' : 'text-text-secondary hover:bg-background-tertiary/50'}`}
                            title={chat.name}
                        >
                            {chat.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="w-3/4 flex flex-col">
                 {activeChat ? (
                    <>
                        <div className="p-4 border-b border-border-color">
                            <h3 className="text-lg font-bold text-text-primary capitalize">{activeChat.name}</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className="flex items-start gap-3 animate-slide-in-bottom">
                                    <div className="w-8 h-8 bg-background-tertiary rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-text-primary">
                                        {msg.user.nickname.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-text-primary text-sm">{msg.user.nickname}</p>
                                            <p className="text-xs text-text-secondary">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <p className="text-text-primary text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-border-color">
                            <div className="flex items-center bg-background-tertiary rounded-lg">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder={`Message in ${activeChat.name}`}
                                    className="w-full bg-transparent p-2 text-text-primary placeholder-text-secondary focus:outline-none"
                                />
                                <button type="submit" className="p-2 text-accent hover:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                </button>
                            </div>
                        </form>
                    </>
                 ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-text-secondary">Select or create a chat to start messaging.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};