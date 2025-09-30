import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayCell = styled.button<{ selected: boolean }>`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: ${(p) => (p.selected ? "#4caf50" : "#fff")};
  color: ${(p) => (p.selected ? "#fff" : "#333")};
  cursor: pointer;
  &:hover {
    background: ${(p) => (p.selected ? "#45a049" : "#f0f0f0")};
  }
`;

const seasons = ["spring", "summer", "fall", "winter"];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  onSelect: (value: string | (string | number)[]) => void;
}
type Mode = "weekday" | "seasonDay" | "seasonWeekday" | "array";
export default function DatePicker({ onSelect }: Props) {
  const [mode, setMode] = useState<Mode>("seasonDay");
  const [season, setSeason] = useState("spring");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [weekday, setWeekday] = useState("Mon");

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const wd = weekdays[(day - 1) % 7];

    if (mode === "seasonDay") {
      onSelect(`${season}_${day}`);
    } else if (mode === "array") {
      onSelect([season, wd, day]);
    }
  };

  const handleSelectWeekday = (wd: string) => {
    setWeekday(wd);
    if (mode === "weekday") {
      onSelect(wd);
    } else if (mode === "seasonWeekday") {
      onSelect(`${season}_${wd}`);
    } else if (mode === "array" && selectedDay !== null) {
      onSelect([season, wd, selectedDay]);
    }
  };

  return (
    <Container>
      {/* 모드 선택 */}
      <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
        <option value="weekday">요일만</option>
        <option value="seasonDay">계절+날짜</option>
        <option value="seasonWeekday">계절+요일</option>
        <option value="array">계절+요일+날짜 (배열)</option>
      </select>

      {/* 시즌 선택 */}
      {(mode === "seasonDay" ||
        mode === "seasonWeekday" ||
        mode === "array") && (
        <select value={season} onChange={(e) => setSeason(e.target.value)}>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* 요일 선택 */}
      {(mode === "weekday" || mode === "seasonWeekday" || mode === "array") && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {weekdays.map((wd) => (
            <button
              key={wd}
              onClick={() => handleSelectWeekday(wd)}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                background: wd === weekday ? "#4caf50" : "#eee",
                color: wd === weekday ? "#fff" : "#333",
              }}
            >
              {wd}
            </button>
          ))}
        </div>
      )}

      {/* 달력 */}
      {(mode === "seasonDay" || mode === "array") && (
        <Grid>
          {Array.from({ length: 28 }, (_, i) => {
            const day = i + 1;
            const wd = weekdays[i % 7];
            return (
              <DayCell
                key={day}
                selected={selectedDay === day}
                onClick={() => handleSelectDay(day)}
              >
                {day}
                <br />
                <small>{wd}</small>
              </DayCell>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
