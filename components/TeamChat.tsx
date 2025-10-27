import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import type { Chat, ChatMessage } from '../types';
import { useAuth } from '../hooks/useAuth';
import { activityService } from '../services/activityService';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🙏', '🤔'];

interface ChatMessageItemProps {
    message: ChatMessage;
    allMessages: ChatMessage[];
    onReply: (message: ChatMessage) => void;
    onReact: (messageId: string, emoji: string) => void;
    onScrollToMessage: (messageId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, allMessages, onReply, onReact, onScrollToMessage }) => {
    const [hovered, setHovered] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const originalMessage = message.replyTo ? allMessages.find(m => m.id === message.replyTo) : null;

    return (
        <div 
            className="flex items-start gap-3 animate-slide-in-bottom group relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setShowEmojiPicker(false); }}
        >
            <div className="w-8 h-8 bg-background-tertiary rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-text-primary">
                {message.user.nickname.charAt(0)}
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <p className="font-bold text-text-primary text-sm">{message.user.nickname}</p>
                    <p className="text-xs text-text-secondary">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
                {originalMessage && (
                    <div 
                        className="text-xs text-text-secondary p-1.5 rounded-md bg-background-primary/50 border-l-2 border-accent/50 mt-1 cursor-pointer"
                        onClick={() => onScrollToMessage(originalMessage.id)}
                    >
                        <strong className="text-text-primary">{originalMessage.user.nickname}</strong>
                        <p className="truncate italic">"{originalMessage.text}"</p>
                    </div>
                )}
                <p className="text-text-primary text-sm mt-1">{message.text}</p>
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            // FIX: Cast 'users' to string[] to resolve type errors on '.join' and '.length'.
                            <button 
                                key={emoji} 
                                onClick={() => onReact(message.id, emoji)}
                                className="px-2 py-0.5 text-xs bg-primary/20 hover:bg-primary/40 text-accent rounded-full border border-primary/50"
                                title={`Reacted by: ${(users as string[]).join(', ')}`}
                            >
                                {emoji} {(users as string[]).length}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             {hovered && (
                <div className="absolute top-0 right-0 bg-background-secondary border border-border-color rounded-lg shadow-lg flex items-center text-xs">
                    <button onClick={() => setShowEmojiPicker(prev => !prev)} className="p-1.5 hover:bg-background-tertiary rounded-l-lg">😊</button>
                    <button onClick={() => onReply(message)} className="p-1.5 hover:bg-background-tertiary rounded-r-lg">↩️</button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-full mb-1 right-0 bg-background-primary p-1 rounded-lg border border-border-color flex gap-1">
                            {REACTION_EMOJIS.map(emoji => (
                                <button key={emoji} onClick={() => onReact(message.id, emoji)} className="p-1 text-lg hover:bg-background-tertiary rounded">{emoji}</button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const TeamChat: React.FC = () => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());


    const loadChats = () => {
        const allChats = chatService.getChats();
        setChats(allChats);
        return allChats;
    };

    useEffect(() => {
        const allChats = loadChats();
        if (allChats.length > 0 && !activeChatId) {
            setActiveChatId(allChats[0].id);
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const allChats = loadChats();
            if (activeChatId && !allChats.some(c => c.id === activeChatId)) {
                setActiveChatId(allChats.length > 0 ? allChats[0].id : '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [activeChatId]);

    useEffect(() => {
        if (activeChatId) {
            setMessages(chatService.getMessages(activeChatId));
        } else {
            setMessages([]);
        }
    }, [activeChatId]);
    
    useEffect(() => {
        if(!replyingTo) {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, replyingTo]);

    const activeChat = chats.find(c => c.id === activeChatId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !activeChatId) return;

        if (activeChat) {
            activityService.logActivity(user.nickname, 'Chat Message Sent', `in #${activeChat.name}`);
        }
        
        chatService.addMessage(activeChatId, { nickname: user.nickname }, input, replyingTo?.id);
        setMessages(chatService.getMessages(activeChatId));
        setInput('');
        setReplyingTo(null);
    };

    const handleAddReaction = (messageId: string, emoji: string) => {
        if (!user) return;
        const updatedMessages = chatService.addReaction(activeChatId, messageId, emoji, user.nickname);
        setMessages(updatedMessages);
    };

    const handleScrollToMessage = (messageId: string) => {
        const el = messageRefs.current.get(messageId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.classList.add('bg-primary/20', 'transition-colors', 'duration-1000');
        setTimeout(() => {
            el?.classList.remove('bg-primary/20');
        }, 1000);
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
                                <div key={msg.id} ref={el => messageRefs.current.set(msg.id, el)} className="p-1 -m-1 rounded-md">
                                    <ChatMessageItem 
                                        message={msg} 
                                        allMessages={messages}
                                        onReply={setReplyingTo}
                                        onReact={handleAddReaction}
                                        onScrollToMessage={handleScrollToMessage}
                                    />
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-border-color">
                             {replyingTo && (
                                <div className="text-xs text-text-secondary p-1.5 rounded-t-md bg-background-tertiary flex justify-between items-center">
                                    <p>Replying to <strong className="text-text-primary">{replyingTo.user.nickname}</strong></p>
                                    <button onClick={() => setReplyingTo(null)} className="font-bold text-lg leading-none">&times;</button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage}>
                                <div className={`flex items-center bg-background-tertiary ${replyingTo ? 'rounded-b-lg' : 'rounded-lg'}`}>
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
                        </div>
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
