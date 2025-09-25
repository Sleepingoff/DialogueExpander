import { useState } from "react";
import styled from "styled-components";

export type ConditionType =
  | "weather"
  | "time"
  | "location"
  | "date"
  | "item"
  | "flag"
  | "event";

export type FlagType =
  | "mail"
  | "event"
  | "order"
  | "orderdone"
  | "recipe"
  | "craft"
  | "bool";

export type Conditions =
  | { type: "weather"; value: string }
  | { type: "time"; value: string }
  | { type: "location"; value: string }
  | { type: "date"; value: string }
  | { type: "item"; value: number | number[] }
  | { type: "event"; value: string }
  | { type: "flag"; key: FlagType; value: string };

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

  const [dateMode, setDateMode] = useState<"season" | "weekday">("season");
  const [season, setSeason] = useState<string>("spring");
  const [day, setDay] = useState<number>(1);
  const [weekday, setWeekday] = useState<string>("Mon");

  const addCondition = () => {
    let newCond: Conditions;

    if (currentType === "flag") {
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
      if (dateMode === "season") {
        newCond = { type: "date", value: `${season}_${day}` };
      } else {
        newCond = { type: "date", value: weekday };
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
          <option value="weather">weather</option>
          <option value="time">time</option>
          <option value="location">location</option>
          <option value="date">date</option>
          <option value="item">item</option>
          <option value="event">event</option>
          <option value="flag">flag</option>
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
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  <option value="spring">spring</option>
                  <option value="summer">summer</option>
                  <option value="fall">fall</option>
                  <option value="winter">winter</option>
                </select>
                <div>
                  <span style={{ minWidth: "24px", display: "inline-block" }}>
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
              <select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
              >
                <option value="Mon">Mon</option>
                <option value="Tue">Tue</option>
                <option value="Wed">Wed</option>
                <option value="Thu">Thu</option>
                <option value="Fri">Fri</option>
                <option value="Sat">Sat</option>
                <option value="Sun">Sun</option>
              </select>
            )}
          </div>
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
          ADD MORE
        </Button>
      </InputRow>

      {/* 리스트 */}
      <ConditionList>
        {conditions.map((c, i) => (
          <li key={i}>
            {c.type === "flag"
              ? `flag.${c.key} = ${c.value}`
              : `${c.type}: ${JSON.stringify(c.value)}`}
          </li>
        ))}
      </ConditionList>

      <Button style={{ width: "100%" }} onClick={handleSubmit}>
        ADD ALL
      </Button>
    </div>
  );
}
