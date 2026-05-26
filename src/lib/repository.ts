import { generateFriendlyCode, normalizeCode } from "./code";
import { events, notes, people, snapshot } from "./mock-data";
import { sortNotesForTimeline } from "./timeline";
import type { Event, Note, Person, StudioSnapshot, ThemePreset, UnlockedTimeline } from "./types";

export async function unlockTimeline(code: string): Promise<UnlockedTimeline | null> {
  const normalized = normalizeCode(code);
  const person = people.find((item) => item.codeHash === normalized);

  if (!person) {
    return null;
  }

  return getTimelineForPerson(person.id);
}

export async function getTimelineForPerson(personId: string): Promise<UnlockedTimeline | null> {
  const person = people.find((item) => item.id === personId);

  if (!person) {
    return null;
  }

  const items = notes
    .filter((note) => note.personId === personId)
    .map((note) => {
      const event = events.find((candidate) => candidate.id === note.eventId);
      if (!event) {
        return null;
      }

      return { note, event };
    })
    .filter((item): item is { note: Note; event: Event } => item !== null);

  return {
    person,
    items: sortNotesForTimeline(items),
  };
}

export async function getStudioSnapshot(): Promise<StudioSnapshot> {
  return snapshot();
}

export async function createPerson(input: { displayName: string; aliases: string[] }) {
  const displayName = input.displayName.trim();
  const aliases = input.aliases.map((alias) => alias.trim()).filter(Boolean);

  if (!displayName) {
    throw new Error("Name is required.");
  }

  const codeDisplay = generateFriendlyCode(people.map((person) => person.codeDisplay));
  const person: Person = {
    id: `person-${crypto.randomUUID()}`,
    displayName,
    aliases,
    codeDisplay,
    codeHash: normalizeCode(codeDisplay),
    createdAt: new Date().toISOString(),
  };

  people.push(person);
  return person;
}

export async function createEvent(input: {
  name: string;
  date: string;
  year: number;
  dateLabel: string;
  theme: ThemePreset;
  defaultVisibleFrom: string | null;
}) {
  const event: Event = {
    id: `event-${crypto.randomUUID()}`,
    name: input.name.trim(),
    slug: slugify(`${input.name}-${input.year}`),
    date: input.date,
    year: input.year,
    dateLabel: input.dateLabel.trim(),
    theme: input.theme,
    defaultVisibleFrom: input.defaultVisibleFrom,
    createdAt: new Date().toISOString(),
  };

  events.push(event);
  return event;
}

export async function upsertNote(input: {
  id?: string;
  personId: string;
  eventId: string;
  message: string;
  verseText: string;
  verseRef: string;
}) {
  const existing = input.id ? notes.find((note) => note.id === input.id) : null;
  const now = new Date().toISOString();

  if (existing) {
    existing.eventId = input.eventId;
    existing.message = input.message;
    existing.verseText = input.verseText;
    existing.verseRef = input.verseRef;
    existing.updatedAt = now;
    return existing;
  }

  const note: Note = {
    id: `note-${crypto.randomUUID()}`,
    personId: input.personId,
    eventId: input.eventId,
    message: input.message,
    verseText: input.verseText,
    verseRef: input.verseRef,
    createdAt: now,
    updatedAt: now,
  };

  notes.push(note);
  return note;
}

export async function deletePerson(personId: string) {
  removeById(people, personId);
  removeWhere(notes, (note) => note.personId === personId);
}

export async function deleteEvent(eventId: string) {
  removeById(events, eventId);
  removeWhere(notes, (note) => note.eventId === eventId);
}

export async function deleteNote(noteId: string) {
  removeById(notes, noteId);
}

function removeById<T extends { id: string }>(items: T[], id: string) {
  const index = items.findIndex((item) => item.id === id);

  if (index !== -1) {
    items.splice(index, 1);
  }
}

function removeWhere<T>(items: T[], predicate: (item: T) => boolean) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      items.splice(index, 1);
    }
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
