import type { Chat, ChatMessage } from '../types';

const CHATS_KEY = 'blizzard_racing_chats';
const MESSAGES_KEY = 'blizzard_racing_chat_messages';

const DEFAULT_GENERAL_CHAT_ID = 'default-general';
const DEFAULT_AERO_CHAT_ID = 'default-aero';
const DEFAULT_SPONSORSHIP_CHAT_ID = 'default-sponsorship';

const getStoredChats = (): Chat[] => {
    const chats = localStorage.getItem(CHATS_KEY);
    if (chats) return JSON.parse(chats);
    const defaultChats: Chat[] = [
        { id: DEFAULT_GENERAL_CHAT_ID, name: 'General Discussion' },
        { id: DEFAULT_AERO_CHAT_ID, name: 'Aerodynamics Team' },
        { id: DEFAULT_SPONSORSHIP_CHAT_ID, name: 'Sponsorship Outreach' },
    ];
    localStorage.setItem(CHATS_KEY, JSON.stringify(defaultChats));
    return defaultChats;
}

const getStoredMessages = (): Record<string, ChatMessage[]> => {
    const messages = localStorage.getItem(MESSAGES_KEY);
    if (messages) return JSON.parse(messages);
    const defaultMessages: Record<string, ChatMessage[]> = {
        [DEFAULT_GENERAL_CHAT_ID]: [{ id: Date.now().toString(), chatId: DEFAULT_GENERAL_CHAT_ID, user: { nickname: 'Shriv' }, text: 'Welcome to the team chat!', timestamp: new Date().toISOString() }],
        [DEFAULT_AERO_CHAT_ID]: [],
        [DEFAULT_SPONSORSHIP_CHAT_ID]: [],
    };
     localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
    return defaultMessages;
}

export const chatService = {
    getChats: (): Chat[] => {
        return getStoredChats();
    },
    addChat: (name: string): {success: boolean, message: string} => {
        const chats = getStoredChats();
        const trimmedName = name.trim();
        if (chats.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
            return {success: false, message: 'A chat with this name already exists.'};
        }
        const id = `chat-${Date.now()}`;
        const newChats = [...chats, { id, name: trimmedName }];
        localStorage.setItem(CHATS_KEY, JSON.stringify(newChats));

        const messages = getStoredMessages();
        messages[id] = [];
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

        return {success: true, message: `Chat "${trimmedName}" created.`};
    },
    removeChat: (id: string): {success: boolean, message: string} => {
        let chats = getStoredChats();
        const chatToRemove = chats.find(c => c.id === id);
        if (!chatToRemove) {
             return {success: false, message: 'Chat not found.'};
        }

        const newChats = chats.filter(c => c.id !== id);
        localStorage.setItem(CHATS_KEY, JSON.stringify(newChats));

        let messages = getStoredMessages();
        delete messages[id];
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        
        return {success: true, message: `Chat "${chatToRemove.name}" removed.`};
    },
    getMessages: (chatId: string): ChatMessage[] => {
        const messages = getStoredMessages();
        return messages[chatId] || [];
    },
    addMessage: (chatId: string, user: {nickname: string}, text: string, replyTo?: string) => {
        const messages = getStoredMessages();
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            chatId,
            user,
            text,
            timestamp: new Date().toISOString(),
            ...(replyTo && { replyTo })
        };
        if (!messages[chatId]) {
            messages[chatId] = [];
        }
        messages[chatId].push(newMessage);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    },
    addReaction: (chatId: string, messageId: string, emoji: string, userNickname: string): ChatMessage[] => {
        const allMessages = getStoredMessages();
        const chatMessages = allMessages[chatId];
        if (!chatMessages) return [];
        
        const messageIndex = chatMessages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return chatMessages;

        const message = chatMessages[messageIndex];
        if (!message.reactions) message.reactions = {};
        if (!message.reactions[emoji]) message.reactions[emoji] = [];

        const userIndex = message.reactions[emoji].indexOf(userNickname);

        if (userIndex > -1) {
            // User has reacted with this emoji, remove it
            message.reactions[emoji].splice(userIndex, 1);
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }
        } else {
            // User has not reacted, add them
            message.reactions[emoji].push(userNickname);
        }

        allMessages[chatId][messageIndex] = message;
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
        return allMessages[chatId];
    }
};