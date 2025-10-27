import React, { useState, useEffect, useRef } from 'react';
import { icicleService } from '../services/icicleService';

interface Message {
    sender: 'user' | 'icicle';
    text: string;
}

export const Icicle: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ sender: 'icicle', text: icicleService.query('hello') }]);
    }, []);
    
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'blizzard_racing_icicle_knowledge') {
                setMessages(prev => [...prev, {
                    sender: 'icicle',
                    text: 'My knowledge base has just been updated by the team manager.'
                }]);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        const icicleResponse: Message = { sender: 'icicle', text: icicleService.query(input) };
        
        setMessages(prev => [...prev, userMessage, icicleResponse]);
        setInput('');
    };
    
    // Add a keyframe animation for message pop-in
    const animationStyle = `
        @keyframes pop-in {
            from { transform: scale(0.95); opacity: 0.8; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.2s ease-out forwards;
        }
    `;

    return (
        <div className="bg-background-secondary rounded-lg border border-border-color shadow-lg h-[30rem] flex flex-col">
            <style>{animationStyle}</style>
            <div className="p-4 border-b border-border-color flex items-center space-x-3">
                <div className="p-2 bg-background-tertiary rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Icicle</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'icicle' && <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0"></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg animate-pop-in ${msg.sender === 'user' ? 'bg-primary text-text-on-primary rounded-br-none' : 'bg-background-tertiary text-text-primary rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-border-color">
                <div className="flex items-center bg-background-tertiary rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about the team..."
                        className="w-full bg-transparent p-2 text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                    <button type="submit" className="p-2 text-accent hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};