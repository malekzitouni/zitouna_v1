export type LevelId = "first" | "second" | "third" | "bac";

export const LEVELS_META: Array<{ id: LevelId; title: string; subtitle: string }> = [
  { id: "first", title: "1ère année secondaire", subtitle: "Physique – Chimie" },
  { id: "second", title: "2ème année secondaire", subtitle: "Sciences / Informatique" },
  { id: "third", title: "3ème année secondaire", subtitle: "Sciences expérimentales / Mathématiques / Informatique" },
  { id: "bac", title: "Baccalauréat", subtitle: "Session 2027" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  lesson: "Cours",
  practice: "Exercices",
  media: "Vidéos",
  lab: "Travaux pratiques",
};
