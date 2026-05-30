import { parseEventDate } from "./event-date";
import type { ThemePreset } from "./types";

export type EventUpdateDraft = {
  defaultVisibleFrom: string;
  eventDate: string;
  eventId: string;
  name: string;
  theme: ThemePreset;
};

export function buildEventUpdateInput(draft: EventUpdateDraft) {
  const parsedEventDate = parseEventDate(draft.eventDate);
  const name = draft.name.trim();

  if (!parsedEventDate || !name) {
    return null;
  }

  return {
    eventId: draft.eventId,
    name,
    date: parsedEventDate.date,
    year: parsedEventDate.year,
    dateLabel: parsedEventDate.dateLabel,
    theme: draft.theme,
    defaultVisibleFrom: draft.defaultVisibleFrom ? new Date(draft.defaultVisibleFrom).toISOString() : null,
  };
}

export function toDateTimeLocalInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
