import { create } from "zustand";
import { fetchXRIF } from "./endpoints";

type ActionNavigate = {
  action: "navigate";
  input: {
    name: string;
    x: number;
    y: number;
  };
};

type ActionSpeak = {
  action: "speak";
  input: string;
};

type ActionWait = {
  action: "wait";
  input: number;
};

type Action = ActionNavigate | ActionSpeak | ActionWait;

type XRIF = Record<string, any> & {
  actions: Action[];
};

type StoreState = {
  xrifPromise: Promise<any> | null;
  xrifValue: XRIF | null;
  xrifKey: string;
  highlightedAction: number;
  logArray: string[];
};

interface StoreFunctions {
  getXrif: (message: string) => void;
  highlightAction: (idx: number) => void;
  executeAction: () => void;
  log: (message: string) => void;
}

const defaultState: StoreState = {
  xrifPromise: null,
  xrifValue: null,
  xrifKey: "actions.0",
  highlightedAction: 0,
  logArray: [],
};

export const useXrifStore = create<StoreState & StoreFunctions>((set) => ({
  ...defaultState,
  log: (message: string) => {
    set((state) => {
      state.logArray.push(message);
      console.log(message);
      return {
        logArray: state.logArray,
      };
    });
  },
  getXrif: (message: string) => {
    const response = fetchXRIF(message);
    set((state) => {
      state.log(`Fetched XRIF for message: ${message}`);
      return {
        ...defaultState,
        xrifPromise: response,
      };
    });
    response.then((xrif) => {
      set({ xrifValue: xrif });
    });
  },
  highlightAction: (idx: number) => {
    set({
      xrifKey: `actions.${idx}`,
      highlightedAction: idx,
    });
  },
  executeAction: () => {
    set((state) => {
      // Reset if past length
      if (state.highlightedAction >= state.xrifValue?.actions.length) {
        // TODO: Set finished condition
        state.log("Finished executing XRIF.");
        return {};
      }

      const action = state.xrifValue?.actions[state.highlightedAction];
      if (!action) {
        state.log(`No action found for index ${state.highlightedAction}`);
        return {};
      }

      // TODO: Execute the action here.
      if (action.action === "speak") {
        state.log(`Speaking: ${action.input}`);
      }

      if (action.action === "navigate") {
        state.log(`Navigating to ${action.input.name}`);
      }

      if (action.action === "wait") {
        state.log(`Waiting for ${action.input} seconds`);
      }

      state.log(`Executed action ${state.highlightedAction}`);

      return {
        highlightedAction: state.highlightedAction + 1,
        xrifKey: `actions.${state.highlightedAction + 1}`,
        logArray: state.logArray,
      };
    });
  },
}));
