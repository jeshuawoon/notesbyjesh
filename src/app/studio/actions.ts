"use server";

import { revalidatePath } from "next/cache";
import { createEvent, createPerson, deleteEvent, deleteNote, deletePerson, upsertNote } from "@/lib/repository";
import { assertStudioRequestAuthorized } from "@/lib/studio-request-auth";
import type { ThemePreset } from "@/lib/types";
import { suggestMotivationalVerse } from "@/lib/verse-suggestion";

export async function createPersonAction(input: { displayName: string; aliases: string[] }) {
  await assertStudioRequestAuthorized();
  const person = await createPerson(input);
  revalidatePath("/studio");
  return person;
}

export async function createEventAction(input: {
  name: string;
  date: string;
  year: number;
  dateLabel: string;
  theme: ThemePreset;
  defaultVisibleFrom: string | null;
}) {
  await assertStudioRequestAuthorized();
  const event = await createEvent(input);
  revalidatePath("/studio");
  return event;
}

export async function saveNoteAction(input: {
  id?: string;
  personId: string;
  eventId: string;
  message: string;
  verseText: string;
  verseRef: string;
}) {
  await assertStudioRequestAuthorized();
  const note = await upsertNote(input);
  revalidatePath("/studio");
  return note;
}

export async function deletePersonAction(personId: string) {
  await assertStudioRequestAuthorized();
  await deletePerson(personId);
  revalidatePath("/studio");
}

export async function deleteEventAction(eventId: string) {
  await assertStudioRequestAuthorized();
  await deleteEvent(eventId);
  revalidatePath("/studio");
}

export async function deleteNoteAction(noteId: string) {
  await assertStudioRequestAuthorized();
  await deleteNote(noteId);
  revalidatePath("/studio");
}

export async function suggestVerseAction(input: {
  eventDateLabel: string;
  eventName: string;
  message: string;
  personName: string;
  previousVerseRef?: string;
  previousVerseText?: string;
}) {
  await assertStudioRequestAuthorized();
  return suggestMotivationalVerse(input);
}
