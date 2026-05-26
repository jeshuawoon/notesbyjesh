import { describe, expect, it } from "vitest";
import {
  createEvent,
  createPerson,
  deleteEvent,
  deleteNote,
  deletePerson,
  getStudioSnapshot,
  upsertNote,
} from "./repository";

describe("repository deletes", () => {
  it("deletes a note without removing its person or event", async () => {
    const suffix = crypto.randomUUID();
    const person = await createPerson({ aliases: [], displayName: `Note Delete ${suffix}` });
    const event = await createEvent({
      date: "2027-01-01",
      dateLabel: "Test 2027",
      defaultVisibleFrom: null,
      name: `Note Delete Event ${suffix}`,
      theme: "teal",
      year: 2027,
    });
    const note = await upsertNote({
      eventId: event.id,
      message: "Delete me.",
      personId: person.id,
      verseRef: "",
      verseText: "",
    });

    await deleteNote(note.id);

    const snapshot = await getStudioSnapshot();
    expect(snapshot.notes.some((candidate) => candidate.id === note.id)).toBe(false);
    expect(snapshot.people.some((candidate) => candidate.id === person.id)).toBe(true);
    expect(snapshot.events.some((candidate) => candidate.id === event.id)).toBe(true);
  });

  it("deletes a person and their notes", async () => {
    const suffix = crypto.randomUUID();
    const person = await createPerson({ aliases: [], displayName: `Person Delete ${suffix}` });
    const event = await createEvent({
      date: "2028-01-01",
      dateLabel: "Test 2028",
      defaultVisibleFrom: null,
      name: `Person Delete Event ${suffix}`,
      theme: "gold",
      year: 2028,
    });
    const note = await upsertNote({
      eventId: event.id,
      message: "Delete with person.",
      personId: person.id,
      verseRef: "",
      verseText: "",
    });

    await deletePerson(person.id);

    const snapshot = await getStudioSnapshot();
    expect(snapshot.people.some((candidate) => candidate.id === person.id)).toBe(false);
    expect(snapshot.notes.some((candidate) => candidate.id === note.id)).toBe(false);
    expect(snapshot.events.some((candidate) => candidate.id === event.id)).toBe(true);
  });

  it("deletes an event and its notes", async () => {
    const suffix = crypto.randomUUID();
    const person = await createPerson({ aliases: [], displayName: `Event Delete ${suffix}` });
    const event = await createEvent({
      date: "2029-01-01",
      dateLabel: "Test 2029",
      defaultVisibleFrom: null,
      name: `Event Delete Event ${suffix}`,
      theme: "rose",
      year: 2029,
    });
    const note = await upsertNote({
      eventId: event.id,
      message: "Delete with event.",
      personId: person.id,
      verseRef: "",
      verseText: "",
    });

    await deleteEvent(event.id);

    const snapshot = await getStudioSnapshot();
    expect(snapshot.events.some((candidate) => candidate.id === event.id)).toBe(false);
    expect(snapshot.notes.some((candidate) => candidate.id === note.id)).toBe(false);
    expect(snapshot.people.some((candidate) => candidate.id === person.id)).toBe(true);
  });
});
