import { describe, expect, it } from "vitest";
import { findNextReadableTimelineIndex, isFutureTimelineItem, sortNotesForTimeline } from "./timeline";
import type { Event, Note, TimelineItem } from "./types";

const baseNote: Note = {
  id: "note-1",
  personId: "person-1",
  eventId: "event-1",
  message: "Hello.",
  verseText: "Grace upon grace.",
  verseRef: "John 1:16",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

describe("isFutureTimelineItem", () => {
  it("locks notes when their event opens after now", () => {
    expect(
      isFutureTimelineItem(
        {
          event: { ...baseEvent, defaultVisibleFrom: "2026-06-01T12:00:00.000Z" },
          note: baseNote,
        },
        new Date("2026-05-26T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("does not lock notes when their event has no opening time", () => {
    expect(isFutureTimelineItem({ event: baseEvent, note: baseNote }, new Date("2026-05-26T12:00:00.000Z"))).toBe(false);
  });
});

describe("sortNotesForTimeline", () => {
  it("sorts notes by full event date descending", () => {
    const notes = [
      {
        note: { ...baseNote, id: "june" },
        event: {
          id: "event-1",
          name: "Camp",
          slug: "camp-june",
          date: "2026-06-01",
          year: 2026,
          dateLabel: "June 2026",
          theme: "rose" as const,
          defaultVisibleFrom: null,
          createdAt: "",
        },
      },
      {
        note: { ...baseNote, id: "july" },
        event: {
          id: "event-2",
          name: "Camp",
          slug: "camp-july",
          date: "2026-07-01",
          year: 2026,
          dateLabel: "July 2026",
          theme: "teal" as const,
          defaultVisibleFrom: null,
          createdAt: "",
        },
      },
    ];

    expect(sortNotesForTimeline(notes).map((item) => item.note.id)).toEqual(["july", "june"]);
  });
});

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

function timelineItem(id: string, defaultVisibleFrom: string | null = null): TimelineItem {
  return {
    event: { ...baseEvent, id: `event-${id}`, defaultVisibleFrom },
    note: { ...baseNote, id },
  };
}

describe("findNextReadableTimelineIndex", () => {
  it("returns the next unlocked note index after the current note", () => {
    const items = [timelineItem("one"), timelineItem("two"), timelineItem("three")];

    expect(findNextReadableTimelineIndex(items, 0, new Date("2026-05-26T12:00:00.000Z"))).toBe(1);
  });

  it("skips locked notes and returns null when no readable note remains", () => {
    const now = new Date("2026-05-26T12:00:00.000Z");
    const items = [
      timelineItem("one"),
      timelineItem("two", "2026-06-01T12:00:00.000Z"),
      timelineItem("three", "2026-06-02T12:00:00.000Z"),
    ];

    expect(findNextReadableTimelineIndex(items, 0, now)).toBeNull();
  });
});
