import { normalizeCode } from "./code";
import type { Event, Note, Person, StudioSnapshot } from "./types";

const now = "2026-05-26T00:00:00.000Z";

export const people: Person[] = [
  {
    id: "person-mark",
    displayName: "Mark",
    aliases: ["MARK26"],
    codeDisplay: "K7M2Q",
    codeHash: normalizeCode("K7M2Q"),
    createdAt: now,
  },
  {
    id: "person-sarah",
    displayName: "Sarah",
    aliases: ["SAR26"],
    codeDisplay: "S4R9A",
    codeHash: normalizeCode("S4R9A"),
    createdAt: now,
  },
];

export const events: Event[] = [
  {
    id: "event-2026",
    name: "LifeGen Camp",
    slug: "lifegen-camp-2026",
    date: "2026-06-01",
    year: 2026,
    dateLabel: "June 2026",
    theme: "teal",
    defaultVisibleFrom: "2026-06-01T14:30:00.000Z",
    createdAt: now,
  },
  {
    id: "event-2025",
    name: "LifeGen Camp",
    slug: "lifegen-camp-2025",
    date: "2025-06-01",
    year: 2025,
    dateLabel: "June 2025",
    theme: "gold",
    defaultVisibleFrom: null,
    createdAt: now,
  },
  {
    id: "event-2024",
    name: "Undefeated",
    slug: "undefeated-2024",
    date: "2024-05-01",
    year: 2024,
    dateLabel: "May 2024",
    theme: "rose",
    defaultVisibleFrom: null,
    createdAt: now,
  },
];

export const notes: Note[] = [
  {
    id: "note-mark-2026",
    personId: "person-mark",
    eventId: "event-2026",
    message:
      "It's always amazing to see you put your talents to use and grow in the Lord. I saw [[SURRENDER]] in the way you kept choosing Him, not just on stage.\n\nI pray that you continue to let Him lead beside you in everything. Stay strong, stay undefeated.",
    verseText:
      "Humble yourselves under the mighty hand of God, so that at the proper time He may exalt you, casting all your anxieties on Him, because He cares for you.",
    verseRef: "1 Peter 5:6-7",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "note-mark-2025",
    personId: "person-mark",
    eventId: "event-2025",
    message:
      "It was such a joy walking through this camp with you. I saw a boldness that was not there before. Do not let that fire go out when you get back home.",
    verseText: "For God gave us a spirit not of fear but of power and love and self-control.",
    verseRef: "2 Timothy 1:7",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "note-mark-2024",
    personId: "person-mark",
    eventId: "event-2024",
    message: "I'm so glad we got to be at camp together this year. Keep pressing in. The best is still ahead.",
    verseText: "He who began a good work in you will carry it to completion.",
    verseRef: "Philippians 1:6",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "note-sarah-2026",
    personId: "person-sarah",
    eventId: "event-2026",
    message:
      "Sarah, the way you show up for people at camp quietly and consistently says so much about the kind of person God is shaping you to be.\n\nI hope you feel [[SEEN]]. Because you are.",
    verseText: "She is clothed with strength and dignity, and she laughs without fear of the future.",
    verseRef: "Proverbs 31:25",
    createdAt: now,
    updatedAt: now,
  },
];

export function snapshot(): StudioSnapshot {
  return {
    people,
    events,
    notes,
  };
}
