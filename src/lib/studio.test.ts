import { describe, expect, it } from "vitest";
import { getNoteEditorSlots, sortEventsForStudio } from "./studio";
import type { Event, Note } from "./types";

const baseEvent: Event = {
  id: "event-1",
  name: "Camp",
  slug: "camp",
  date: "2026-06-01",
  year: 2026,
  dateLabel: "June 2026",
  theme: "teal",
  defaultVisibleFrom: null,
  createdAt: "2026-05-01T00:00:00.000Z",
};

const baseNote: Note = {
  id: "note-1",
  personId: "person-1",
  eventId: "event-1",
  message: "Hello.",
  verseText: "",
  verseRef: "",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

describe("getNoteEditorSlots", () => {
  it("returns one note editor slot per event with the selected person's note when present", () => {
    const events = [
      baseEvent,
      { ...baseEvent, date: "2025-06-01", id: "event-2", slug: "camp-2", year: 2025 },
    ];
    const notes = [
      { ...baseNote, eventId: "event-1", personId: "person-1" },
      { ...baseNote, id: "other-person-note", eventId: "event-2", personId: "person-2" },
    ];

    expect(
      getNoteEditorSlots({ events, notes, personId: "person-1" }).map((slot) => ({
        eventId: slot.event.id,
        noteId: slot.note?.id ?? null,
      })),
    ).toEqual([
      { eventId: "event-1", noteId: "note-1" },
      { eventId: "event-2", noteId: null },
    ]);
  });
});

describe("sortEventsForStudio", () => {
  it("orders events by event date newest first without mutating the input order", () => {
    const events = [
      { ...baseEvent, date: "2025-06-01", id: "event-2025", slug: "camp-2025", year: 2025 },
      { ...baseEvent, date: "2027-01-19", id: "event-2027", slug: "camp-2027", year: 2027 },
      { ...baseEvent, date: "2026-06-01", id: "event-2026", slug: "camp-2026", year: 2026 },
    ];

    expect(sortEventsForStudio(events).map((event) => event.id)).toEqual([
      "event-2027",
      "event-2026",
      "event-2025",
    ]);
    expect(events.map((event) => event.id)).toEqual(["event-2025", "event-2027", "event-2026"]);
  });
});
