import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_SCRIPT, type TitleStyle, type Verdict } from "./model";

export type TitleDraft = {
  line1: string;
  line2: string;
  style: TitleStyle;
};

type EtagereState = {
  title: TitleDraft;
  script: string;
  verdicts: Record<string, Verdict>;
  setTitle: (patch: Partial<TitleDraft>) => void;
  setScript: (script: string) => void;
  setVerdict: (id: string, verdict: Verdict) => void;
  resetScript: () => void;
};

export const useEtagere = create<EtagereState>()(
  persist(
    (set) => ({
      title: {
        line1: "Awa Koné",
        line2: "Monteuse · Abidjan",
        style: "nuit",
      },
      script: DEFAULT_SCRIPT,
      verdicts: {},
      setTitle: (patch) => set((state) => ({ title: { ...state.title, ...patch } })),
      setScript: (script) => set({ script }),
      setVerdict: (id, verdict) =>
        set((state) => ({ verdicts: { ...state.verdicts, [id]: verdict } })),
      resetScript: () => set({ script: DEFAULT_SCRIPT, verdicts: {} }),
    }),
    {
      name: "etagere-v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
