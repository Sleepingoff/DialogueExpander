import { create } from "zustand";

interface EditorState {
  json: string;
  setJson: (json: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  json: '{\n  "hearts": {}\n}',
  setJson: (json) => set({ json }),
}));
