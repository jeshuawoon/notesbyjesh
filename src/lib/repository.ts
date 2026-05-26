import { generateFriendlyCode, normalizeCode } from "./code";
import { getSupabasePublicClient, getSupabaseServerClient } from "./supabase/server";
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

type UnlockTimelineRpcResponse = {
  person: PersonRow;
  items: Array<{
    event: EventRow;
    note: NoteRow;
  }>;
};

export async function unlockTimeline(code: string): Promise<UnlockedTimeline | null> {
  return unlockSupabaseTimeline(code);
}

export async function getTimelineForPerson(personId: string): Promise<UnlockedTimeline | null> {
  return getSupabaseTimelineForPerson(personId);
}

export async function getStudioSnapshot(): Promise<StudioSnapshot> {
  return getSupabaseSnapshot();
}

export async function createPerson(input: { displayName: string; aliases: string[] }) {
  return createSupabasePerson(input);
}

export async function createEvent(input: {
  name: string;
  date: string;
  year: number;
  dateLabel: string;
  theme: ThemePreset;
  defaultVisibleFrom: string | null;
}) {
  return createSupabaseEvent(input);
}

export async function upsertNote(input: {
  id?: string;
  personId: string;
  eventId: string;
  message: string;
  verseText: string;
  verseRef: string;
}) {
  return upsertSupabaseNote(input);
}

export async function deletePerson(personId: string) {
  await deleteSupabaseRow("people", personId);
}

export async function deleteEvent(eventId: string) {
  await deleteSupabaseRow("events", eventId);
}

export async function deleteNote(noteId: string) {
  await deleteSupabaseRow("notes", noteId);
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

export function mapUnlockTimelineResponse(value: UnlockTimelineRpcResponse | null): UnlockedTimeline | null {
  if (!value?.person) {
    return null;
  }

  return {
    person: mapPersonRow(value.person),
    items: sortNotesForTimeline(
      (value.items ?? []).map((item) => ({
        event: mapEventRow(item.event),
        note: mapNoteRow(item.note),
      })),
    ),
  };
}

async function unlockSupabaseTimeline(code: string): Promise<UnlockedTimeline | null> {
  const normalized = normalizeCode(code);
  const client = getSupabasePublicClient();
  const result = (await client.rpc("unlock_timeline", {
    input_code_hash: normalized,
  })) as SupabaseResult<UnlockTimelineRpcResponse>;

  assertSupabaseResult(result);

  return mapUnlockTimelineResponse(result.data);
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
