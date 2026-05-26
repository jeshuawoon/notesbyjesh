import { describe, expect, it } from "vitest";
import { mapEventRow, mapNoteRow, mapPersonRow } from "./repository";

describe("repository row mappers", () => {
  it("maps Supabase people rows into app people", () => {
    expect(
      mapPersonRow({
        aliases: ["MARK26"],
        code_display: "K7M2Q",
        code_hash: "K7M2Q",
        created_at: "2026-05-26T00:00:00.000Z",
        display_name: "Mark",
        id: "person-id",
      }),
    ).toEqual({
      aliases: ["MARK26"],
      codeDisplay: "K7M2Q",
      codeHash: "K7M2Q",
      createdAt: "2026-05-26T00:00:00.000Z",
      displayName: "Mark",
      id: "person-id",
    });
  });

  it("maps Supabase event and note rows into app data", () => {
    expect(
      mapEventRow({
        created_at: "2026-05-26T00:00:00.000Z",
        date_label: "June 2026",
        default_visible_from: null,
        event_date: "2026-06-01",
        id: "event-id",
        name: "LifeGen Camp",
        slug: "lifegen-camp-2026",
        theme: "teal",
        year: 2026,
      }),
    ).toEqual({
      createdAt: "2026-05-26T00:00:00.000Z",
      date: "2026-06-01",
      dateLabel: "June 2026",
      defaultVisibleFrom: null,
      id: "event-id",
      name: "LifeGen Camp",
      slug: "lifegen-camp-2026",
      theme: "teal",
      year: 2026,
    });

    expect(
      mapNoteRow({
        created_at: "2026-05-26T00:00:00.000Z",
        event_id: "event-id",
        id: "note-id",
        message: "Hello.",
        person_id: "person-id",
        updated_at: "2026-05-26T01:00:00.000Z",
        verse_ref: "John 1:16",
        verse_text: "Grace upon grace.",
      }),
    ).toEqual({
      createdAt: "2026-05-26T00:00:00.000Z",
      eventId: "event-id",
      id: "note-id",
      message: "Hello.",
      personId: "person-id",
      updatedAt: "2026-05-26T01:00:00.000Z",
      verseRef: "John 1:16",
      verseText: "Grace upon grace.",
    });
  });
});
