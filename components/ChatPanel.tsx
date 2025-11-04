
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon, ChartIcon, LightbulbIcon } from './icons';
import { marked } from 'marked';
import '../styles/ChatPanel.css';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClass = isUser ? 'chat-bubble user' : 'chat-bubble ai';
        
    const textContent = message.isLoading
      ? <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      : <div dangerouslySetInnerHTML={{ __html: marked(message.text) as string }}></div>;

    return (
        <div className={bubbleClass}>
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
        <div className="chat-panel-container">
            <div className="messages-container">
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                <div className="action-buttons">
                    <button onClick={() => onAction('analyze')} disabled={isAiResponding} className="action-btn">
                        <ChartIcon className="w-4 h-4" />
                        <span>Analyser</span>
                    </button>
                    <button onClick={() => onAction('propose')} disabled={isAiResponding} className="action-btn">
                        <LightbulbIcon className="w-4 h-4" />
                        <span>Proposer</span>
                    </button>
                </div>
                <form onSubmit={handleSend} className="chat-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="chat-input"
                        disabled={isAiResponding}
                    />
                    <button type="submit" disabled={isAiResponding || !input.trim()} className="send-btn">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
