import React, { useState, useEffect, useRef } from 'react';
import { icicleService } from '../services/icicleService';
import type { AnalysisResult } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface IcicleAssistantProps {
    analysisContext: AnalysisResult | null;
    onClose: () => void;
}

const AssistantIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    return <p className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
};

const IcicleAssistant: React.FC<IcicleAssistantProps> = ({ analysisContext, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let initialMessage = "Icicle Assistant online. I can answer questions based on the Team Wiki, projects, finances, and more.";
        if (analysisContext) {
            initialMessage += ` I see you're viewing the analysis for **${analysisContext.fileName}**. Ask me for a summary!`;
        }
        setMessages([{ role: 'model', text: initialMessage }]);
    }, [analysisContext]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !user) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const assistantResponseText = await icicleService.query(currentInput, user.nickname, analysisContext);
            const modelMessage: Message = { role: 'model', text: assistantResponseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error querying Icicle Assistant:", error);
            const errorResponse: Message = { role: 'model', text: "An error occurred while processing your request. Please try again." };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background-primary/50 flex justify-end items-end z-[55] modal-backdrop" onClick={onClose}>
            <div 
                className="w-full max-w-md h-full max-h-[80vh] m-5 flex flex-col bg-background-secondary rounded-lg border border-border-color shadow-2xl modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border-color flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <AssistantIcon className="h-8 w-8 text-accent" />
                        <div>
                            <h1 className="text-xl font-bold text-text-primary">Icicle Assistant</h1>
                            <p className="text-sm text-text-secondary">Your self-contained team copilot</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.role === 'model' && <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0 flex items-center justify-center"><AssistantIcon className="h-5 w-5 text-background-primary" /></div>}
                            <div className={`max-w-2xl px-4 py-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-text-on-primary rounded-br-none' : 'bg-background-tertiary text-text-primary rounded-bl-none'}`}>
                               <SimpleMarkdown text={msg.text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-4 justify-start">
                            <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0 flex items-center justify-center"><AssistantIcon className="h-5 w-5 text-background-primary" /></div>
                            <div className="max-w-2xl px-4 py-3 rounded-lg bg-background-tertiary text-text-primary rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-text-secondary rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-border-color flex-shrink-0">
                    <div className="flex items-center bg-background-primary rounded-lg border border-border-color focus-within:ring-2 focus-within:ring-accent">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Ask about your tasks, the budget, R&D..."
                            className="w-full bg-transparent p-3 text-text-primary placeholder-text-secondary focus:outline-none resize-none max-h-24 overflow-y-auto"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button type="submit" className="p-3 text-accent hover:text-primary disabled:opacity-50" disabled={isLoading || !input.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IcicleAssistant;
