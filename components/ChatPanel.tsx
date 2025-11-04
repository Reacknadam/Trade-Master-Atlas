
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, ChartIcon, LightbulbIcon } from './icons';
import { marked } from 'marked';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClass = isUser
        ? 'bg-cyan-600 self-end'
        : 'bg-gray-700 self-start';
        
    const textContent = message.isLoading
      ? <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
        </div>
      : <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: marked(message.text) as string }}></div>;

    return (
        <div className={`max-w-xs md:max-w-md lg:max-w-sm xl:max-w-md rounded-lg px-4 py-2 ${bubbleClass}`}>
            {textContent}
        </div>
    );
};

interface ChatPanelProps {
    messages: ChatMessage[];
    isAiResponding: boolean;
    onSendMessage: (message: string) => void;
    onAction: (action: 'analyze' | 'propose') => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isAiResponding, onSendMessage, onAction }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isAiResponding) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800">
            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2 mb-2">
                    <button onClick={() => onAction('analyze')} disabled={isAiResponding} className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-sm py-2 px-3 rounded-lg transition-colors">
                        <ChartIcon className="w-4 h-4" />
                        <span>Analyser</span>
                    </button>
                    <button onClick={() => onAction('propose')} disabled={isAiResponding} className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-sm py-2 px-3 rounded-lg transition-colors">
                        <LightbulbIcon className="w-4 h-4" />
                        <span>Proposer</span>
                    </button>
                </div>
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        disabled={isAiResponding}
                    />
                    <button type="submit" disabled={isAiResponding || !input.trim()} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
