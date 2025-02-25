import { create } from "zustand";

type StoreState = {
  xrifProfmise: Promise<any> | null;
  xrifKey: string;
  highlightedAction: number;
};

interface StoreFunctions {
  getXrif: (message: string) => void;
  highlightAction: (idx: number) => void;
}

const defaultState: StoreState = {
  xrifProfmise: null,
  xrifKey: "actions.0",
  highlightedAction: 0,
};

export const useStore = create<StoreState & StoreFunctions>((set) => ({
  ...defaultState,
  getXrif: (message: string) => {
    const response = fetchEcho(message);
    set({ xrifProfmise: response });
  },
  highlightAction: (idx: number) => {
    set({ xrifKey: `actions.${idx}`, highlightedAction: idx });
  },
}));

const ENDPOINTS = {
  xrif: "/api/xrif",
  echo: "/api/echo",
};

const fetchEcho = (message: string) => {
  const url = new URL(ENDPOINTS.echo, location.href);
  // Create a promise that fetches the API and parses the JSON.
  const promise = fetch(url, {
    method: "POST",
    body: JSON.stringify({ message }),
  }).then((res) => res.json());

  return promise;
};
