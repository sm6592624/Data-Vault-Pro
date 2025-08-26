import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendMessage(userInput.trim());
      setUserInput(''); // clear the input after sending
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  const suggestions = [
    "Show me sales trends",
    "Analyze customer data", 
    "Create a bar chart",
    "Find data patterns"
  ];

  return (
    <div className="card-browse chat-container-browse">
      <div className="card-header-browse">
        <div className="chat-header-browse">
          <div className="chat-header-icon-browse">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="chat-header-title-browse">Data Assistant</h3>
            <p className="chat-header-subtitle-browse">Ask questions about your data</p>
          </div>
        </div>
      </div>

      <div className="card-content-browse chat-messages-browse">
        {messages.length === 0 ? (
          <div className="chat-empty-browse">
            <div className="chat-empty-icon-browse">
              <Bot className="h-12 w-12" />
            </div>
            <h4 className="text-heading-sm">Start a conversation</h4>
            <p className="text-body-md text-caption">
              Ask me anything about your data and I'll help you explore it with visualizations and insights.
            </p>
            <div className="chat-suggestions-browse">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-chip-browse"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-message-list-browse">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message-browse ${message.role === 'user' ? 'user' : 'system'}`}
              >
                <div className="chat-message-avatar-browse">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="chat-message-content-browse">
                  <p className="chat-message-text-browse">
                    {message.content}
                  </p>
                  <span className="chat-message-time-browse">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message-browse system">
                <div className="chat-message-avatar-browse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="chat-message-content-browse">
                  <div className="chat-typing-browse">
                    <div className="loading-browse"></div>
                    <span className="text-caption">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="card-footer-browse">
        <form onSubmit={handleSubmit} className="chat-input-form-browse">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about your data..."
            className="input-browse chat-input-browse"
            disabled={isLoading}
          />
          <button
            type="submit"
            title="Send message"
            disabled={!userInput.trim() || isLoading}
            className="btn-primary-browse chat-send-btn-browse"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
