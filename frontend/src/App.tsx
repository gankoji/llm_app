import React, { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

export const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  useEffect(() => {
    // Load conversations on mount
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
        }),
      });
      
      const data = await response.json();
      // Update conversation with new messages
      // This is simplified - you'll need to handle the actual response format
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, 
              { role: 'user', content },
              { role: 'assistant', content: data.response }
            ],
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <AppContainer>
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />
      {activeConversation && (
        <Chat
          messages={activeConversation.messages}
          onSendMessage={sendMessage}
        />
      )}
    </AppContainer>
  );
};