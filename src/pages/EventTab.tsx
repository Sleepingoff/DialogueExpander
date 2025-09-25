import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Conditions } from "../components/ConditionForm";
import ConditionForm from "../components/ConditionForm";
import { useEventEditorStore } from "../store/useEventEditorStore";
import styled from "styled-components";

interface EventJson {
  events: {
    [cycle: string]: {
      [eventId: string]: {
        event: string;
        conditions: Record<string, unknown>;
        strings: Record<string, string>;
      };
    };
  };
}
const InputRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Label = styled.label`
  min-width: 80px;
  font-weight: bold;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;
export default function EventTab() {
  const { json, setJson } = useEventEditorStore();
  const [eventId, setEventId] = useState<string>("");

  const handleAddLine = (
    hearts: number,
    line: string,
    conditions: Conditions[]
  ) => {
    const condObj: Record<string, unknown> = {};
    conditions.forEach((c) => {
      if (c.type === "flag" && "key" in c) {
        if (!condObj.flag) condObj.flag = {};
        (condObj.flag as Record<string, string>)[c.key] = c.value;
      } else {
        condObj[c.type] = c.value;
      }
    });

    const parsed: EventJson = {
      events: {
        [hearts]: {
          [eventId]: {
            event: line,
            conditions: condObj,
            strings: {},
          },
        },
      },
    };

    setJson(JSON.stringify(parsed, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>이벤트 추가</h2>
      <InputRow>
        <Label>Event ID</Label>
        <Input
          type="text"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder="input event ID"
        />
      </InputRow>
      {/* ✅ 공통 ConditionForm 사용 */}
      <ConditionForm onSubmit={handleAddLine} />

      <h3>코드 편집</h3>
      <MonacoEditor
        height="300px"
        language="json"
        value={json}
        onChange={(v) => setJson(v || "{}")}
        options={{
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          minimap: { enabled: false },
        }}
      />

      <h3>미리보기</h3>
      <SyntaxHighlighter language="json" style={vscDarkPlus}>
        {json}
      </SyntaxHighlighter>

      <button onClick={handleDownload}>JSON 다운로드</button>
    </div>
  );
}
