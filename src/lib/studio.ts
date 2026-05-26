import type { Event, Note } from "./types";

export function sortEventsForStudio(events: Event[]) {
  return [...events].sort((left, right) => right.date.localeCompare(left.date));
}

export function getNoteEditorSlots({
  events,
  notes,
  personId,
}: {
  events: Event[];
  notes: Note[];
  personId: string;
}) {
  const notesByEventId = new Map(
    notes.filter((note) => note.personId === personId).map((note) => [note.eventId, note]),
  );

  return sortEventsForStudio(events).map((event) => ({
      event,
      note: notesByEventId.get(event.id),
  }));
}
