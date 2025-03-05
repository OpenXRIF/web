import { create } from "zustand";
import { fetchXRIF } from "./endpoints";

type StoreState = {
  xrifPromise: Promise<any> | null;
  xrifKey: string;
  highlightedAction: number;
  log: string[];
};

interface StoreFunctions {
  getXrif: (message: string) => void;
  highlightAction: (idx: number) => void;
  executeAction: () => void;
}

const defaultState: StoreState = {
  xrifPromise: null,
  xrifKey: "actions.0",
  highlightedAction: 0,
  log: [],
};

export const useXrifStore = create<StoreState & StoreFunctions>((set) => ({
  ...defaultState,
  getXrif: (message: string) => {
    const response = fetchXRIF(message);
    set({ xrifPromise: response });
  },
  highlightAction: (idx: number) => {
    set({ xrifKey: `actions.${idx}`, highlightedAction: idx });
  },
  executeAction: () => {
    set((state) => {
      // Execute the action here.

      state.log.push(`Executed action ${state.highlightedAction}`);
      console.log(`Executed action ${state.highlightedAction}`);

      return {
        highlightedAction: state.highlightedAction + 1,
        xrifKey: `actions.${state.highlightedAction + 1}`,
        log: state.log,
      };
    });
  },
}));
