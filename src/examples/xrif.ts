const xrif_example1 = {
  actions: [
    {
      action: "navigate",
      input: {
        name: "Room 2241",
        x: 1817,
        y: 1334,
        floor: 2,
        keywords: ["office", "Zach"],
      },
    },
    {
      action: "speak",
      input: "Hey Zach, Can you hand me the keys?",
    },
    {
      action: "wait",
      input: 10,
    },
    {
      action: "navigate",
      input: {
        name: "Room 1427 - Ideas Clinic",
        x: 2065,
        y: 1008,
        floor: 1,
        keywords: ["classroom", "workshop", "lab"],
      },
    },
  ],
};

export const XRIF_EXAMPLES = [xrif_example1];
