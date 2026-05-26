export type ThemePreset = "teal" | "gold" | "rose" | "violet" | "ember";

export type Person = {
  id: string;
  displayName: string;
  aliases: string[];
  codeDisplay: string;
  codeHash: string;
  createdAt: string;
};

export type Event = {
  id: string;
  name: string;
  slug: string;
  date: string;
  year: number;
  dateLabel: string;
  theme: ThemePreset;
  defaultVisibleFrom: string | null;
  createdAt: string;
};

export type Note = {
  id: string;
  personId: string;
  eventId: string;
  message: string;
  verseText: string;
  verseRef: string;
  createdAt: string;
  updatedAt: string;
};

export type TimelineItem = {
  note: Note;
  event: Event;
};

export type UnlockedTimeline = {
  person: Person;
  items: TimelineItem[];
};

export type StudioSnapshot = {
  people: Person[];
  events: Event[];
  notes: Note[];
};
