import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 20px;
  overflow-y: auto;
`;

const ConversationItem = styled.div<{ active: boolean }>`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#007bff" : "transparent")};
  color: ${(props) => (props.active ? "white" : "black")};
  &:hover {
    background-color: ${(props) => (props.active ? "#007bff" : "#e9ecef")};
  }
`;

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

interface SidebarProps {
  conversations?: Conversation[]; // Make conversations optional
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations = [], // Default to empty array
  activeConversation,
  onSelectConversation,
}) => {
  return (
    <SidebarContainer>
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          active={conv.id === activeConversation}
          onClick={() => onSelectConversation(conv.id)}
        >
          {conv.title}
          <div style={{ fontSize: "0.8em", color: "#6c757d" }}>
            {new Date(conv.timestamp).toLocaleDateString()}
          </div>
        </ConversationItem>
      ))}
    </SidebarContainer>
  );
};
