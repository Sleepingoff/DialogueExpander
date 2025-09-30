import { useState } from "react";
import styled from "styled-components";
import DatePicker from "./DatePicker";

export type ConditionType =
  | "weather"
  | "time"
  | "location"
  | "date"
  | "daysInState"
  | "action"
  | "item"
  | "flag"
  | "event"
  | "kids"
  | "chance"
  | "rel";

export type Conditions =
  | { type: "weather"; value: string }
  | { type: "time"; value: string }
  | { type: "location"; value: string }
  | { type: "date"; value: string | (string | number)[] }
  | { type: "daysInState"; value: number }
  | { type: "action"; value: string }
  | { type: "item"; value: number | number[] }
  | { type: "event"; value: string }
  | { type: "flag"; key: FlagType; value: string }
  | { type: "kids"; value: number }
  | { type: "chance"; value: number }
  | { type: "rel"; value: string };

export type FlagType =
  | "mail"
  | "event"
  | "order"
  | "orderdone"
  | "recipe"
  | "craft"
  | "bool";

interface Props {
  onSubmit: (heart: number, line: string, conditions: Conditions[]) => void;
}

// ---------------- 스타일 ----------------
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
  margin: 8px;
  cursor: pointer;
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

export default function ConditionForm({ onSubmit }: Props) {
  const [heart, setHeart] = useState<number>(0);
  const [line, setLine] = useState<string>("");

  const [conditions, setConditions] = useState<Conditions[]>([]);
  const [currentType, setCurrentType] = useState<ConditionType>("weather");
  const [currentValue, setCurrentValue] = useState<string>("");

  const [flagKey, setFlagKey] = useState<FlagType>("mail");
  const [flagValue, setFlagValue] = useState<string>("");

  const addCondition = () => {
    let newCond: Conditions;

    if (currentType === "daysInState") {
      newCond = { type: "daysInState", value: Number(currentValue) };
    } else if (currentType === "action") {
      newCond = { type: "action", value: currentValue };
    } else if (currentType === "kids") {
      newCond = { type: "kids", value: Number(currentValue) };
    } else if (currentType === "chance") {
      newCond = { type: "chance", value: Number(currentValue) };
    } else if (currentType === "rel") {
      newCond = { type: "rel", value: currentValue };
    } else if (currentType === "flag") {
      if (!flagValue.trim()) return;
      newCond = { type: "flag", key: flagKey, value: flagValue };
    } else if (currentType === "item") {
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
    } else if (currentType === "date") {
      try {
        const parsed = JSON.parse(currentValue);
        if (Array.isArray(parsed)) {
          newCond = { type: "date", value: parsed };
        } else {
          newCond = { type: "date", value: parsed }; // 문자열 (Mon, spring_15, spring_Mon)
        }
      } catch {
        newCond = { type: "date", value: currentValue }; // fallback
      }
    } else {
      if (!currentValue.trim()) return;
      newCond = { type: currentType, value: currentValue };
    }

    setConditions([...conditions, newCond]);
    setCurrentValue("");
    setFlagValue("");
  };

  const handleSubmit = () => {
    if (!line.trim()) {
      const confirmed = window.confirm("대사가 비어있습니다. 그래도 추가?");
      if (!confirmed) return;
    }

    onSubmit(heart, line, conditions);

    setLine("");
    setConditions([]);
  };

  return (
    <div>
      {/* 하트 선택 */}
      <InputRow>
        <Label>Heart: {heart}</Label>
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

      {/* 대사 입력 */}
      <InputRow>
        <Label>Script</Label>
        <Input
          type="text"
          value={line}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLine(e.target.value)
          }
          placeholder="input script"
        />
      </InputRow>

      {/* 조건 빌더 */}
      <InputRow>
        <Label>Condition</Label>
        <select
          value={currentType}
          onChange={(e) => setCurrentType(e.target.value as ConditionType)}
        >
          <option value="weather">날씨</option>
          <option value="time">시간</option>
          <option value="location">장소</option>
          <option value="date">날짜</option>
          <option value="daysInState">상태 경과일</option>
          <option value="action">행동</option>
          <option value="item">아이템</option>
          <option value="event">이벤트</option>
          <option value="flag">플래그</option>
          <option value="kids">아이 수</option>
          <option value="chance">확률</option>
          <option value="rel">관계</option>
        </select>

        {/* weather */}
        {currentType === "weather" && (
          <select
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          >
            <option value="">select weather</option>
            <option value="Sunny">Sunny</option>
            <option value="Rainy">Rainy</option>
            <option value="Snow">Snow</option>
          </select>
        )}

        {/* date */}
        {currentType === "date" && (
          <DatePicker
            onSelect={(value) => {
              // 문자열 또는 배열이 들어올 수 있음
              setCurrentValue(JSON.stringify(value));
            }}
          />
        )}

        {currentType === "kids" && (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="아이 수 (0~2)"
          />
        )}

        {currentType === "chance" && (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="확률 (0~100)"
          />
        )}

        {currentType === "rel" && (
          <select
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          >
            <option value="">관계 선택</option>
            <option value="spouse">배우자</option>
            <option value="exspouse">전 배우자</option>
            <option value="dating">연애 중</option>
          </select>
        )}

        {/* flag */}
        {currentType === "flag" && (
          <>
            <select
              value={flagKey}
              onChange={(e) => setFlagKey(e.target.value as FlagType)}
            >
              <option value="mail">mail</option>
              <option value="event">event</option>
              <option value="order">order</option>
              <option value="orderdone">orderdone</option>
              <option value="recipe">recipe</option>
              <option value="craft">craft</option>
              <option value="bool">bool</option>
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

        {/* 기본 input */}
        {currentType !== "weather" &&
          currentType !== "date" &&
          currentType !== "flag" && (
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="조건 값"
            />
          )}

        <Button type="button" onClick={addCondition}>
          +
        </Button>
        <Button
          style={{ background: "#f44336" }}
          onClick={() => setConditions([])}
        >
          -
        </Button>
      </InputRow>

      {/* 리스트 */}
      <ConditionList>
        {conditions.map((c, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {c.type === "flag"
                ? `flag.${c.key} = ${c.value}`
                : `${c.type}: ${JSON.stringify(c.value)}`}
            </span>
            <button
              style={{
                marginLeft: "0.5rem",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "0.2rem 0.5rem",
                cursor: "pointer",
              }}
              onClick={() => {
                const newConds = conditions.filter((_, idx) => idx !== i);
                setConditions(newConds);
              }}
            >
              -
            </button>
          </li>
        ))}
      </ConditionList>

      <Button style={{ width: "100%" }} onClick={handleSubmit}>
        ADD ALL
      </Button>
    </div>
  );
}
