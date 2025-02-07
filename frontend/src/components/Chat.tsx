import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin-left: 250px; // Space for sidebar
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
`;

const InputArea = styled.div`
  padding: 20px;
  border-top: 1px solid #ccc;
  background: white;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <ChatContainer>
      <MessageList>
        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role}>
            {message.content}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>
      <InputArea>
        <form onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
        </form>
      </InputArea>
    </ChatContainer>
  );
};

const MessageBubble = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 70%;
  margin: 8px;
  padding: 12px;
  border-radius: 8px;
  ${({ role }) => role === 'user' ? `
    background-color: #007bff;
    color: white;
    align-self: flex-end;
    margin-left: auto;
  ` : `
    background-color: #f1f1f1;
    color: black;
    align-self: flex-start;
    margin-right: auto;
  `}
`;