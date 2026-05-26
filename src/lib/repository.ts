import { generateFriendlyCode, normalizeCode } from "./code";
import { events, notes, people, snapshot } from "./mock-data";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "./supabase/server";
import { sortNotesForTimeline } from "./timeline";
import type { Event, Note, Person, StudioSnapshot, ThemePreset, UnlockedTimeline } from "./types";

export type PersonRow = {
  id: string;
  display_name: string;
  aliases: string[];
  code_display: string;
  code_hash: string;
  created_at: string;
};

export type EventRow = {
  id: string;
  name: string;
  slug: string;
  event_date: string;
  year: number;
  date_label: string;
  theme: ThemePreset;
  default_visible_from: string | null;
  created_at: string;
};

export type NoteRow = {
  id: string;
  person_id: string;
  event_id: string;
  message: string;
  verse_text: string;
  verse_ref: string;
  created_at: string;
  updated_at: string;
};

type SupabaseError = {
  message: string;
};

type SupabaseResult<T> = {
  data: T | null;
  error: SupabaseError | null;
};

export async function unlockTimeline(code: string): Promise<UnlockedTimeline | null> {
  if (isSupabaseServerConfigured()) {
    return unlockSupabaseTimeline(code);
  }

  const normalized = normalizeCode(code);
  const person = people.find((item) => item.codeHash === normalized);

  if (!person) {
    return null;
  }

  return getTimelineForPerson(person.id);
}

export async function getTimelineForPerson(personId: string): Promise<UnlockedTimeline | null> {
  if (isSupabaseServerConfigured()) {
    return getSupabaseTimelineForPerson(personId);
  }

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
  if (isSupabaseServerConfigured()) {
    return getSupabaseSnapshot();
  }

  return snapshot();
}

export async function createPerson(input: { displayName: string; aliases: string[] }) {
  if (isSupabaseServerConfigured()) {
    return createSupabasePerson(input);
  }

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
  if (isSupabaseServerConfigured()) {
    return createSupabaseEvent(input);
  }

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
  if (isSupabaseServerConfigured()) {
    return upsertSupabaseNote(input);
  }

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
  if (isSupabaseServerConfigured()) {
    await deleteSupabaseRow("people", personId);
    return;
  }

  removeById(people, personId);
  removeWhere(notes, (note) => note.personId === personId);
}

export async function deleteEvent(eventId: string) {
  if (isSupabaseServerConfigured()) {
    await deleteSupabaseRow("events", eventId);
    return;
  }

  removeById(events, eventId);
  removeWhere(notes, (note) => note.eventId === eventId);
}

export async function deleteNote(noteId: string) {
  if (isSupabaseServerConfigured()) {
    await deleteSupabaseRow("notes", noteId);
    return;
  }

  removeById(notes, noteId);
}

export function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    displayName: row.display_name,
    aliases: row.aliases,
    codeDisplay: row.code_display,
    codeHash: row.code_hash,
    createdAt: row.created_at,
  };
}

export function mapEventRow(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    date: row.event_date,
    year: row.year,
    dateLabel: row.date_label,
    theme: row.theme,
    defaultVisibleFrom: row.default_visible_from,
    createdAt: row.created_at,
  };
}

export function mapNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    personId: row.person_id,
    eventId: row.event_id,
    message: row.message,
    verseText: row.verse_text,
    verseRef: row.verse_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function unlockSupabaseTimeline(code: string): Promise<UnlockedTimeline | null> {
  const normalized = normalizeCode(code);
  const client = getSupabaseServerClient();
  const result = (await client
    .from("people")
    .select("*")
    .eq("code_hash", normalized)
    .maybeSingle()) as SupabaseResult<PersonRow>;

  assertSupabaseResult(result);

  if (!result.data) {
    return null;
  }

  return getSupabaseTimelineForPerson(result.data.id, mapPersonRow(result.data));
}

async function getSupabaseTimelineForPerson(
  personId: string,
  knownPerson?: Person,
): Promise<UnlockedTimeline | null> {
  const client = getSupabaseServerClient();
  let person = knownPerson;

  if (!person) {
    const personResult = (await client
      .from("people")
      .select("*")
      .eq("id", personId)
      .maybeSingle()) as SupabaseResult<PersonRow>;

    assertSupabaseResult(personResult);

    if (!personResult.data) {
      return null;
    }

    person = mapPersonRow(personResult.data);
  }

  const noteResult = (await client
    .from("notes")
    .select("*")
    .eq("person_id", personId)
    .order("created_at", { ascending: true })) as SupabaseResult<NoteRow[]>;

  assertSupabaseResult(noteResult);

  const personNotes = (noteResult.data ?? []).map(mapNoteRow);
  const eventIds = Array.from(new Set(personNotes.map((note) => note.eventId)));

  if (eventIds.length === 0) {
    return { person, items: [] };
  }

  const eventResult = (await client
    .from("events")
    .select("*")
    .in("id", eventIds)) as SupabaseResult<EventRow[]>;

  assertSupabaseResult(eventResult);

  const eventsById = new Map((eventResult.data ?? []).map((row) => [row.id, mapEventRow(row)]));
  const items = personNotes
    .map((note) => {
      const event = eventsById.get(note.eventId);
      return event ? { note, event } : null;
    })
    .filter((item): item is { note: Note; event: Event } => item !== null);

  return {
    person,
    items: sortNotesForTimeline(items),
  };
}

async function getSupabaseSnapshot(): Promise<StudioSnapshot> {
  const client = getSupabaseServerClient();
  const [peopleResult, eventsResult, notesResult] = await Promise.all([
    client.from("people").select("*").order("created_at", { ascending: true }) as PromiseLike<
      SupabaseResult<PersonRow[]>
    >,
    client.from("events").select("*").order("event_date", { ascending: false }) as PromiseLike<
      SupabaseResult<EventRow[]>
    >,
    client.from("notes").select("*").order("created_at", { ascending: true }) as PromiseLike<
      SupabaseResult<NoteRow[]>
    >,
  ]);

  assertSupabaseResult(peopleResult);
  assertSupabaseResult(eventsResult);
  assertSupabaseResult(notesResult);

  return {
    people: (peopleResult.data ?? []).map(mapPersonRow),
    events: (eventsResult.data ?? []).map(mapEventRow),
    notes: (notesResult.data ?? []).map(mapNoteRow),
  };
}

async function createSupabasePerson(input: { displayName: string; aliases: string[] }) {
  const displayName = input.displayName.trim();
  const aliases = input.aliases.map((alias) => alias.trim()).filter(Boolean);

  if (!displayName) {
    throw new Error("Name is required.");
  }

  const client = getSupabaseServerClient();
  const existingCodesResult = (await client
    .from("people")
    .select("code_display")) as SupabaseResult<Array<Pick<PersonRow, "code_display">>>;

  assertSupabaseResult(existingCodesResult);

  const codeDisplay = generateFriendlyCode((existingCodesResult.data ?? []).map((person) => person.code_display));
  const insertResult = (await client
    .from("people")
    .insert({
      display_name: displayName,
      aliases,
      code_display: codeDisplay,
      code_hash: normalizeCode(codeDisplay),
    })
    .select("*")
    .single()) as SupabaseResult<PersonRow>;

  assertSupabaseResult(insertResult);

  if (!insertResult.data) {
    throw new Error("Supabase did not return the created person.");
  }

  return mapPersonRow(insertResult.data);
}

async function createSupabaseEvent(input: {
  name: string;
  date: string;
  year: number;
  dateLabel: string;
  theme: ThemePreset;
  defaultVisibleFrom: string | null;
}) {
  const client = getSupabaseServerClient();
  const insertResult = (await client
    .from("events")
    .insert({
      name: input.name.trim(),
      slug: slugify(`${input.name}-${input.date}-${crypto.randomUUID().slice(0, 8)}`),
      event_date: input.date,
      year: input.year,
      date_label: input.dateLabel.trim(),
      theme: input.theme,
      default_visible_from: input.defaultVisibleFrom,
    })
    .select("*")
    .single()) as SupabaseResult<EventRow>;

  assertSupabaseResult(insertResult);

  if (!insertResult.data) {
    throw new Error("Supabase did not return the created event.");
  }

  return mapEventRow(insertResult.data);
}

async function upsertSupabaseNote(input: {
  id?: string;
  personId: string;
  eventId: string;
  message: string;
  verseText: string;
  verseRef: string;
}) {
  const client = getSupabaseServerClient();
  const payload = {
    person_id: input.personId,
    event_id: input.eventId,
    message: input.message,
    verse_text: input.verseText,
    verse_ref: input.verseRef,
    updated_at: new Date().toISOString(),
  };
  const result = input.id
    ? ((await client
        .from("notes")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .single()) as SupabaseResult<NoteRow>)
    : ((await client.from("notes").insert(payload).select("*").single()) as SupabaseResult<NoteRow>);

  assertSupabaseResult(result);

  if (!result.data) {
    throw new Error("Supabase did not return the saved note.");
  }

  return mapNoteRow(result.data);
}

async function deleteSupabaseRow(table: "people" | "events" | "notes", id: string) {
  const result = (await getSupabaseServerClient().from(table).delete().eq("id", id)) as SupabaseResult<null>;
  assertSupabaseResult(result);
}

function assertSupabaseResult<T>(result: SupabaseResult<T>) {
  if (result.error) {
    throw new Error(result.error.message);
  }
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
