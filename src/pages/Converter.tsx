import { useState, useEffect } from "react";
import styled from "styled-components";
import MonacoEditor, { type OnChange } from "@monaco-editor/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import JSON5 from "json5";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Button = styled.button`
  background: #4caf50;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  &:hover {
    background: #45a049;
  }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// ---------------- 변환 함수 ----------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertCPtoDE = (cpJson: any) => {
  const result = { hearts: {} };

  if (!cpJson.Changes) return result;

  cpJson.Changes.forEach((change) => {
    if (change.Action !== "EditData") return;
    if (!change.Target?.startsWith("Characters/Dialogue/")) return;

    const entries = change.Entries || {};
    const when = change.When || {};
    const baseHearts = when.Hearts ? Number(when.Hearts) : 0;

    if (!result.hearts[baseHearts]) result.hearts[baseHearts] = {};

    Object.entries(entries).forEach(([entryKey, text]) => {
      const cond: {
        weather?: string;
        date?: string;
        location?: string;
        event?: string;
        item?: string;
      } = {};

      // ---------------- When 조건 변환 ----------------
      if (when.Weather)
        cond.weather = when.Weather === "Rain" ? "Rainy" : when.Weather;
      if (when.Day) cond.date = when.Day;
      if (when.Location) cond.location = when.Location;
      if (when.Event) cond.event = when.Event;

      // ---------------- Entry Key 파싱 ----------------
      // 요일 (Mon, Tue, ...)
      if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(entryKey)) {
        cond.date = entryKey;
      }

      // 계절+날짜 (spring_15)
      else if (/^(spring|summer|fall|winter)_\d+$/.test(entryKey)) {
        cond.date = entryKey;
      }
      // 숫자 키 = 하트 수
      else if (/^\d+$/.test(entryKey)) {
        const h = Number(entryKey);
        result.hearts[h] ??= {};
        result.hearts[h]["default"] = text;
        return;
      }
      // 이벤트 키
      else if (entryKey.startsWith("eventSeen_")) {
        const id = entryKey.split("_")[1];
        cond.event = id;
      }
      // 선물 조건
      else if (entryKey.startsWith("AcceptGift_")) {
        const match = entryKey.match(/\((?:O|T|TR)\)(\w+)/);
        if (match) cond.item = match[1];
      }
      // 요일+하트 (Mon4, Tue6...)
      else if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)$/.test(entryKey)) {
        const [, day, hearts] = entryKey.match(
          /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)/
        )!;
        cond.date = day;
        const h = Number(hearts);
        result.hearts[h] ??= {};
        result.hearts[h][text as string] = cond;
        return;
      }

      // 계절+요일+하트 (spring_Mon6)
      else if (
        /^(spring|summer|fall|winter)_(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)$/.test(
          entryKey
        )
      ) {
        const [, season, weekday, hearts] = entryKey.match(
          /(spring|summer|fall|winter)_(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)/
        )!;
        const h = Number(hearts);

        // 요일 → 날짜 배열 변환
        const weekdayMap: Record<string, number[]> = {
          Mon: [1, 8, 15, 22],
          Tue: [2, 9, 16, 23],
          Wed: [3, 10, 17, 24],
          Thu: [4, 11, 18, 25],
          Fri: [5, 12, 19, 26],
          Sat: [6, 13, 20, 27],
          Sun: [7, 14, 21, 28],
        };

        const days = weekdayMap[weekday];
        result.hearts[h] ??= {};

        for (const d of days) {
          const keyDate = `${season}_${d}`;
          const cloneCond = { ...cond, date: keyDate };
          // 조건 배열 누적
          if (result.hearts[h][text]) {
            const prev = result.hearts[h][text];
            result.hearts[h][text] = Array.isArray(prev)
              ? [...prev, cloneCond]
              : [prev, cloneCond];
          } else {
            result.hearts[h][text] = cloneCond;
          }
        }
        return;
      }

      // ---------------- 결과에 추가 ----------------
      if (Object.keys(cond).length > 0) {
        result.hearts[baseHearts][text as string] = cond;
      } else {
        result.hearts[baseHearts]["default"] = text;
      }
    });
  });

  return result;
};

const convertGameFileToDialogueExpander = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameJson: any,
  expandToAllHearts: boolean = false
) => {
  const result = { hearts: {} };
  for (let h = 0; h <= 10; h++) {
    result.hearts[h] = {};
  }

  for (const [key, text] of Object.entries(gameJson)) {
    // 1. 요일만 (Mon, Tue...)
    if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(key)) {
      if (expandToAllHearts) {
        for (let h = 0; h <= 10; h++) {
          result.hearts[h][text as string] = { date: key };
        }
      } else {
        result.hearts[0][text as string] = { date: key };
      }
      continue;
    }

    // 2. 요일 + 하트 (Mon4)
    if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)$/.test(key)) {
      const [, day, hearts] = key.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\d+)/)!;
      const h = Number(hearts);
      result.hearts[h][text as string] = { date: day };
      continue;
    }

    // 3. 하트 숫자 키 ("4")
    if (/^\d+$/.test(key)) {
      const h = Number(key);
      result.hearts[h]["default"] = text;
      continue;
    }

    // 4. 계절 + 날짜 ("spring_15")
    if (/^(spring|summer|fall|winter)_\d+$/.test(key)) {
      if (expandToAllHearts) {
        for (let h = 0; h <= 10; h++) {
          result.hearts[h][text as string] = { date: key };
        }
      } else {
        result.hearts[0][text as string] = { date: key };
      }
      continue;
    }

    // 5. 이벤트 조건 ("eventSeen_733330")
    if (key.startsWith("eventSeen_")) {
      const id = key.split("_")[1];
      if (expandToAllHearts) {
        for (let h = 0; h <= 10; h++) {
          result.hearts[h][text as string] = { event: id };
        }
      } else {
        result.hearts[0][text as string] = { event: id };
      }
      continue;
    }

    // 6. 선물 조건 ("AcceptGift_(O)279")
    if (key.startsWith("AcceptGift_")) {
      const match = key.match(/\((?:O|T|TR)\)(\w+)/);
      if (match) {
        if (expandToAllHearts) {
          for (let h = 0; h <= 10; h++) {
            result.hearts[h][text as string] = { item: match[1] };
          }
        } else {
          result.hearts[0][text as string] = { item: match[1] };
        }
      }
      continue;
    }

    // 기본 → 0하트 default
    result.hearts[0]["default"] = text;
  }

  return result;
};

// ---------------- 컴포넌트 ----------------
export default function Converter() {
  const [converted, setConverted] = useState<string>("{}");
  const [expandAll, setExpandAll] = useState<boolean>(false);
  // 업로드 원본 JSON 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceJson, setSourceJson] = useState<any | null>(null);
  const [isCP, setIsCP] = useState<boolean>(false);

  // 파일 업로드
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON5.parse(event.target?.result as string); // ✅ JSON5 사용
        setSourceJson(parsed);
        setIsCP(!!parsed.Changes);
      } catch (err) {
        alert("JSON 파싱 오류: " + err);
      }
    };
    reader.readAsText(file);
  };

  // 옵션 변경 시 재변환
  useEffect(() => {
    if (!sourceJson) return;

    let deJson;
    if (isCP) {
      deJson = convertCPtoDE(sourceJson);
    } else {
      deJson = convertGameFileToDialogueExpander(sourceJson, expandAll);
    }

    setConverted(JSON.stringify(deJson, null, 2));
  }, [sourceJson, expandAll, isCP]);

  // Monaco Editor onChange
  const handleEditorChange: OnChange = (value) => {
    setConverted(value || "{}");
  };

  // JSON 다운로드
  const handleDownload = () => {
    const blob = new Blob([converted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_dialogue.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <h2>게임 내 파일 → DialogueExpander 변환기</h2>
      <p>
        Content Patcher JSON(content.json) 또는 게임 내 기본 대사 JSON을
        업로드하면 DialogueExpander 형식으로 변환합니다.
      </p>

      <input type="file" accept=".json" onChange={handleFileUpload} />

      {!isCP && (
        <CheckboxRow>
          <input
            type="checkbox"
            checked={expandAll}
            onChange={(e) => setExpandAll(e.target.checked)}
          />
          대사 확장 (모든 하트에 공통 대사 복사)
        </CheckboxRow>
      )}

      <h3>변환된 JSON</h3>
      <MonacoEditor
        height="300px"
        language="json"
        value={converted}
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
        {converted}
      </SyntaxHighlighter>

      <Button onClick={handleDownload}>JSON 다운로드</Button>
    </Container>
  );
}
