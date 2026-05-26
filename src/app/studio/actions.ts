"use server";

import { revalidatePath } from "next/cache";
import { createEvent, createPerson, deleteEvent, deleteNote, deletePerson, upsertNote } from "@/lib/repository";
import type { ThemePreset } from "@/lib/types";
import { suggestMotivationalVerse } from "@/lib/verse-suggestion";

export async function createPersonAction(input: { displayName: string; aliases: string[] }) {
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
  const note = await upsertNote(input);
  revalidatePath("/studio");
  return note;
}

export async function deletePersonAction(personId: string) {
  await deletePerson(personId);
  revalidatePath("/studio");
}

export async function deleteEventAction(eventId: string) {
  await deleteEvent(eventId);
  revalidatePath("/studio");
}

export async function deleteNoteAction(noteId: string) {
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
  return suggestMotivationalVerse(input);
}
