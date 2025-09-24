import { useState } from "react";
import styled from "styled-components";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEditorStore } from "../store/useEditorStore";

import MonacoEditor, { type OnChange } from "@monaco-editor/react";

// ---------------- 타입 정의 ----------------
type ConditionType =
  | "weather"
  | "time"
  | "location"
  | "date"
  | "item"
  | "flag"
  | "event";

type FlagType =
  | "mail"
  | "event"
  | "order"
  | "orderdone"
  | "recipe"
  | "craft"
  | "bool";

type Condition =
  | { type: "weather"; value: string }
  | { type: "time"; value: string }
  | { type: "location"; value: string }
  | { type: "date"; value: string }
  | { type: "item"; value: number | number[] }
  | { type: "event"; value: string }
  | { type: "flag"; key: FlagType; value: string };

interface DialogueJson {
  hearts: {
    [heart: number]: {
      [line: string]: Record<string, unknown> | string;
    };
  };
}

// ---------------- 스타일 ----------------
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

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

const Button = styled.button`
  background: #4caf50;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  margin-left: auto;
  width: 100%;
  &:hover {
    background: #45a049;
  }
`;

const ConditionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  li {
    background: #f0f0f0;
    margin: 0.2rem 0;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
  }
`;

// ---------------- 메인 컴포넌트 ----------------
export default function Editor() {
  const { json, setJson } = useEditorStore();
  const [heart, setHeart] = useState<number>(0);
  const [line, setLine] = useState<string>("");

  // 조건 빌더 상태
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [currentType, setCurrentType] = useState<ConditionType>("weather");
  const [currentValue, setCurrentValue] = useState<string>("");
  const [flagKey, setFlagKey] = useState<FlagType>("mail");
  const [flagValue, setFlagValue] = useState<string>("");

  const [dateMode, setDateMode] = useState<"season" | "weekday">("season");
  const [season, setSeason] = useState<string>("spring");
  const [day, setDay] = useState<number>(1);
  const [weekday, setWeekday] = useState<string>("Mon");

  // 조건 추가
  const addCondition = () => {
    let newCond: Condition;

    if (currentType === "flag") {
      if (!flagValue.trim()) return;
      newCond = { type: "flag", key: flagKey, value: flagValue };
    } else if (currentType === "item") {
      // 아이템은 숫자 or 배열
      try {
        const parsed = JSON.parse(currentValue);
        if (Array.isArray(parsed)) {
          newCond = { type: "item", value: parsed.map(Number) };
        } else {
          newCond = { type: "item", value: Number(parsed) };
        }
      } catch {
        newCond = { type: "item", value: Number(currentValue) };
      }
    } else {
      if (!currentValue.trim()) return;
      newCond = { type: currentType, value: currentValue };
    }

    setConditions([...conditions, newCond]);
    setCurrentValue("");
    setFlagValue("");
  };

  // 대사 추가
  const addLine = () => {
    // 대사 비어있으면 컨펌
    if (!line.trim()) {
      const confirmed = window.confirm(
        "대사가 비어있습니다. 그래도 추가하시겠습니까?"
      );
      if (!confirmed) return;
    }

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
      parsed.hearts[heart][line || ""] = condObj; // 대사 비어있으면 key는 "" 처리
    } else {
      parsed.hearts[heart]["default"] = line || "";
    }

    setJson(JSON.stringify(parsed, null, 2));
    setLine("");
    setConditions([]);
  };

  // Monaco Editor onChange
  const handleEditorChange: OnChange = (value) => {
    setJson(value || "");
  };
  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialogue.json"; // 파일명
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Dialogue JSON Editor</h2>

      {/* 입력 폼 */}
      <Form>
        <InputRow>
          <Label>하트 수: {heart}</Label>
          <input
            type="range"
            min={0}
            max={10}
            value={heart}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setHeart(Number(e.target.value))
            }
          />
          {"❤️".repeat(heart)}
          {"🤍".repeat(10 - heart)}
        </InputRow>

        <InputRow>
          <Label>대사</Label>
          <Input
            type="text"
            value={line}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLine(e.target.value)
            }
            placeholder="대사 입력"
          />
        </InputRow>

        {/* 조건 빌더 */}
        <InputRow>
          <Label>조건</Label>
          <select
            value={currentType}
            onChange={(e) => setCurrentType(e.target.value as ConditionType)}
          >
            <option value="weather">날씨</option>
            <option value="time">시간</option>
            <option value="location">장소</option>
            <option value="date">날짜</option>
            <option value="item">아이템</option>
            <option value="event">이벤트</option>
            <option value="flag">플래그</option>
          </select>

          {/* 날씨 조건 → 드롭다운 */}
          {currentType === "weather" && (
            <select
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            >
              <option value="">날씨 선택</option>
              <option value="Sunny">맑음 (Sunny)</option>
              <option value="Rainy">비 (Rainy)</option>
              <option value="Snow">눈 (Snow)</option>
              <option value="Storm">폭풍 (Storm)</option>
            </select>
          )}
          {currentType === "date" && (
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              {/* 모드 선택 */}
              <select
                value={dateMode}
                onChange={(e) =>
                  setDateMode(e.target.value as "season" | "weekday")
                }
              >
                <option value="season">계절 + 날짜</option>
                <option value="weekday">요일</option>
              </select>

              {dateMode === "season" ? (
                <>
                  {/* 계절 선택 */}
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="spring">봄 (spring)</option>
                    <option value="summer">여름 (summer)</option>
                    <option value="fall">가을 (fall)</option>
                    <option value="winter">겨울 (winter)</option>
                  </select>

                  {/* 날짜 슬라이더 */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: "24px",
                        textAlign: "right",
                      }}
                    >
                      {day}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={28}
                      value={day}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDay(Number(e.target.value))
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* 요일 선택 */}
                  <select
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                  >
                    <option value="Mon">월 (Mon)</option>
                    <option value="Tue">화 (Tue)</option>
                    <option value="Wed">수 (Wed)</option>
                    <option value="Thu">목 (Thu)</option>
                    <option value="Fri">금 (Fri)</option>
                    <option value="Sat">토 (Sat)</option>
                    <option value="Sun">일 (Sun)</option>
                  </select>
                </>
              )}
            </div>
          )}

          {/* flag 조건 → key + value 입력 */}
          {currentType === "flag" && (
            <>
              <select
                value={flagKey}
                onChange={(e) => setFlagKey(e.target.value as FlagType)}
              >
                <option value="mail">메일</option>
                <option value="event">이벤트</option>
                <option value="order">특수 주문</option>
                <option value="orderdone">주문 완료</option>
                <option value="recipe">레시피</option>
                <option value="craft">제작법</option>
                <option value="bool">특수 bool</option>
              </select>
              <Input
                type="text"
                value={flagValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFlagValue(e.target.value)
                }
                placeholder="플래그 값"
              />
            </>
          )}

          {/* 그 외 조건 → 텍스트 입력 */}
          {currentType !== "weather" &&
            currentType !== "date" &&
            currentType !== "flag" && (
              <Input
                type="text"
                value={currentValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentValue(e.target.value)
                }
                placeholder="조건 값"
              />
            )}

          <Button
            type="button"
            style={{ width: "160px" }}
            onClick={addCondition}
          >
            조건 추가
          </Button>
        </InputRow>

        {/* 조건 리스트 */}
        <ConditionList>
          {conditions.map((c, i) => (
            <li key={i}>
              {c.type === "flag"
                ? `flag.${c.key} = ${c.value}`
                : `${c.type}: ${JSON.stringify(c.value)}`}
            </li>
          ))}
        </ConditionList>

        <Button type="button" onClick={addLine}>
          대사 추가
        </Button>
      </Form>

      {/* 코드 에디터 */}
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
          autoIndent: "full",
          minimap: { enabled: false },
        }}
      />

      {/* 미리보기 */}
      <h3>미리보기</h3>
      <SyntaxHighlighter language="json" style={vscDarkPlus}>
        {json}
      </SyntaxHighlighter>
      <div>
        <Button onClick={handleDownload}>JSON 다운로드</Button>
      </div>
    </div>
  );
}
