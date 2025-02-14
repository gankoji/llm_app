import React, { useState, useEffect } from "react";
import { Chat } from "./components/Chat";
import { Sidebar } from "./components/Sidebar";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`;

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/conversations"); // Relative URL
      console.log("Got a response!");
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Conversation[] = await response.json();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const response = await fetch("/prompt", {
        // Relative URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: content }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      // Check to see if we have a current active conversation
      if (!activeConversationId) {
        // If not, create a new conversation
        const newConversation = {
          id: new Date().toISOString(),
          title: "New Conversation",
          timestamp: new Date().toISOString(),
          messages: [
            { role: "user", content: content },
            { role: "assistant", content: data.response },
          ],
        };
        setConversations([...conversations, newConversation]);
        setActiveConversationId(newConversation.id);
      } else {
        // Update conversation with new messages
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              messages: [
                ...conv.messages,
                { role: "user", content: content },
                { role: "assistant", content: data.response },
              ],
            };
          }
          return conv;
        });
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <AppContainer>
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />
      <Chat
        messages={
          activeConversationId
            ? conversations.find((conv) => conv.id === activeConversationId)
                ?.messages || []
            : []
        }
        onSendMessage={sendMessage}
      />
    </AppContainer>
  );
};

export default App;
