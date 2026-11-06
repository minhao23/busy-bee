export const quadrants = [
  { id: 1, title: "Do now", description: "Urgent & important" },
  { id: 2, title: "Plan ahead", description: "Important, not urgent" },
  { id: 3, title: "Handle soon", description: "Urgent, less important" },
  { id: 4, title: "Low priority", description: "Not urgent or important" },
] as const;

export type Importance = typeof quadrants[number]["id"];
