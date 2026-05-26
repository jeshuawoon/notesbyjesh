"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createEventAction, deleteEventAction } from "@/app/studio/actions";
import { parseEventDate } from "@/lib/event-date";
import { sortEventsForStudio } from "@/lib/studio";
import type { Event, ThemePreset } from "@/lib/types";

const themes: ThemePreset[] = ["teal", "gold", "rose", "violet", "ember"];

export function EventEditor({ events }: { events: Event[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("LifeGen Camp");
  const [eventDate, setEventDate] = useState("2026-06-01");
  const [theme, setTheme] = useState<ThemePreset>("teal");
  const [defaultVisibleFrom, setDefaultVisibleFrom] = useState("");
  const parsedEventDate = parseEventDate(eventDate);
  const sortedEvents = useMemo(() => sortEventsForStudio(events), [events]);

  function submit() {
    if (!parsedEventDate) {
      return;
    }

    startTransition(async () => {
      await createEventAction({
        name,
        date: parsedEventDate.date,
        year: parsedEventDate.year,
        dateLabel: parsedEventDate.dateLabel,
        theme,
        defaultVisibleFrom: defaultVisibleFrom ? new Date(defaultVisibleFrom).toISOString() : null,
      });
      router.refresh();
    });
  }

  function deleteEvent(event: Event) {
    if (!window.confirm(`Delete ${event.name} · ${event.dateLabel}? This also removes every note for this event.`)) {
      return;
    }

    startTransition(async () => {
      await deleteEventAction(event.id);
      router.refresh();
    });
  }

  return (
    <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
      <section className="border border-black/10 bg-white/60 p-3">
        <h2 className="font-medium">Create event</h2>
        <div className="mt-3 space-y-2.5">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            placeholder="Event name"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-black/45">
              Event date
            </span>
            <input
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
              type="date"
            />
          </label>
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemePreset)}
            className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-black/45">
              Letters open at
            </span>
            <input
              value={defaultVisibleFrom}
              onChange={(event) => setDefaultVisibleFrom(event.target.value)}
              type="datetime-local"
              className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            />
          </label>
          <button
            onClick={submit}
            disabled={isPending || !name.trim() || !parsedEventDate}
            className="w-full bg-[#181714] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create event"}
          </button>
        </div>
      </section>

      <section className="border border-black/10 bg-white/60 p-3">
        <h2 className="font-medium">Events</h2>
        <div className="mt-3 max-h-[560px] space-y-2 overflow-auto pr-1">
          {sortedEvents.map((event) => (
            <div key={event.id} className={`theme-${event.theme} border border-black/10 bg-white p-3`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{event.name}</p>
                <span className="h-3 w-3 rounded-full bg-[var(--theme-pip)]" />
              </div>
              <p className="mt-1 text-sm text-black/55">
                {event.dateLabel} · {event.theme}
              </p>
              <p className="mt-2 text-xs text-black/40">
                Event date {new Date(`${event.date}T00:00:00`).toLocaleDateString()}
              </p>
              <p className="mt-1 text-xs text-black/40">
                {event.defaultVisibleFrom
                  ? `Letters open ${new Date(event.defaultVisibleFrom).toLocaleString()}`
                  : "Letters open immediately"}
              </p>
              <button
                type="button"
                onClick={() => deleteEvent(event)}
                disabled={isPending}
                className="mt-3 border border-red-900/20 bg-red-50/40 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-900/65 transition hover:border-red-900/35 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Deleting..." : "Delete event"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
