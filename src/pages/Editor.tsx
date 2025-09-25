import { useState } from "react";
import styled from "styled-components";
import DialogueTab from "./DialogueTab";
import EventTab from "./EventTab";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TabHeader = styled.div`
  display: flex;
  gap: 1rem;
`;

const TabButton = styled.button<{ active: string }>`
  padding: 0.6rem 1.2rem;
  border: none;
  border-bottom: 2px solid
    ${(p) => (p.active == "true" ? "#4caf50" : "transparent")};
  background: none;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    color: #4caf50;
  }
`;

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<"dialogue" | "event">("dialogue");

  return (
    <Container>
      <h2>에디터</h2>
      <p>⚠️ 새로고침 시 저장된 정보가 사라집니다! 수시로 다운받아주세요!</p>
      <TabHeader>
        <TabButton
          active={`${activeTab === "dialogue"}`}
          onClick={() => setActiveTab("dialogue")}
        >
          대사 추가
        </TabButton>
        <TabButton
          active={`${activeTab === "event"}`}
          onClick={() => setActiveTab("event")}
        >
          이벤트 추가
        </TabButton>
      </TabHeader>

      {activeTab === "dialogue" && <DialogueTab />}
      {activeTab === "event" && <EventTab />}
    </Container>
  );
}
