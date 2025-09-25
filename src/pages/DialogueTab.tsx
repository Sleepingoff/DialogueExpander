import { useEditorStore } from "../store/useEditorStore";
import MonacoEditor, { type OnChange } from "@monaco-editor/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ConditionForm, { type Conditions } from "../components/ConditionForm";

interface DialogueJson {
  hearts: {
    [heart: number]: {
      [line: string]: Record<string, unknown> | string;
    };
  };
}

export default function DialogueTab() {
  const { json, setJson } = useEditorStore();

  const handleAddLine = (
    heart: number,
    line: string,
    conditions: Conditions[]
  ) => {
    let parsed: DialogueJson;
    try {
      parsed = JSON.parse(json);
    } catch {
      parsed = { hearts: {} };
    }

    if (!parsed.hearts[heart]) parsed.hearts[heart] = {};

    if (conditions.length > 0) {
      const condObj: Record<string, unknown> = {};
      for (const c of conditions) {
        if (c.type === "flag") {
          if (!condObj["flag"]) condObj["flag"] = {};
          (condObj["flag"] as Record<string, string>)[c.key] = c.value;
        } else {
          condObj[c.type] = c.value;
        }
      }
      parsed.hearts[heart][line || ""] = condObj;
    } else {
      parsed.hearts[heart]["default"] = line || "";
    }

    setJson(JSON.stringify(parsed, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialogue.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditorChange: OnChange = (value) => {
    setJson(value || "");
  };

  return (
    <div>
      <h2>대사 추가</h2>
      <ConditionForm onSubmit={handleAddLine} />

      <h3>코드 편집</h3>
      <MonacoEditor
        height="300px"
        language="json"
        value={json}
        onChange={handleEditorChange}
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
