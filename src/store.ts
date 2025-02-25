import { create } from "zustand";
import { fetchXRIF } from "./endpoints";

type StoreState = {
  xrifPromise: Promise<any> | null;
  xrifKey: string;
  highlightedAction: number;
};

interface StoreFunctions {
  getXrif: (message: string) => void;
  highlightAction: (idx: number) => void;
}

const defaultState: StoreState = {
  xrifPromise: null,
  xrifKey: "actions.0",
  highlightedAction: 0,
};

export const useStore = create<StoreState & StoreFunctions>((set) => ({
  ...defaultState,
  getXrif: (message: string) => {
    const response = fetchXRIF(message);
    set({ xrifPromise: response });
  },
  highlightAction: (idx: number) => {
    set({ xrifKey: `actions.${idx}`, highlightedAction: idx });
  },
}));
