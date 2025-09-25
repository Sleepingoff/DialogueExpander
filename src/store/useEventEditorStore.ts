import { create } from "zustand";

interface EventEditorState {
  json: string;
  setJson: (json: string) => void;
}

export const useEventEditorStore = create<EventEditorState>((set) => ({
  json: '{\n  "events": { "0": {} }\n}', // 기본 구조
  setJson: (json) => set({ json }),
}));
