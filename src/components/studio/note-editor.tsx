"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteNoteAction, saveNoteAction, suggestVerseAction } from "@/app/studio/actions";
import type { Event, Note, Person } from "@/lib/types";

export function NoteEditor({
  event,
  note,
  person,
}: {
  event: Event;
  note?: Note;
  person: Person;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuggestingVerse, startSuggestingVerse] = useTransition();
  const [message, setMessage] = useState(note?.message ?? "");
  const [verseText, setVerseText] = useState(note?.verseText ?? "");
  const [verseRef, setVerseRef] = useState(note?.verseRef ?? "");
  const [verseError, setVerseError] = useState("");
  const hasVerseDraft = Boolean(verseText.trim() || verseRef.trim());

  function submit() {
    startTransition(async () => {
      await saveNoteAction({
        id: note?.id,
        personId: person.id,
        eventId: event.id,
        message,
        verseText,
        verseRef,
      });
      if (!note) {
        setMessage("");
        setVerseText("");
        setVerseRef("");
      }
      router.refresh();
    });
  }

  function deleteCurrentNote() {
    if (!note || !window.confirm(`Delete ${event.dateLabel} for ${person.displayName}?`)) {
      return;
    }

    startTransition(async () => {
      await deleteNoteAction(note.id);
      router.refresh();
    });
  }

  function suggestVerse() {
    setVerseError("");
    startSuggestingVerse(async () => {
      try {
        const suggestion = await suggestVerseAction({
          eventDateLabel: event.dateLabel,
          eventName: event.name,
          message,
          personName: person.displayName,
          previousVerseRef: verseRef,
          previousVerseText: verseText,
        });

        setVerseText(suggestion.verseText);
        setVerseRef(`${suggestion.verseRef} (${suggestion.version})`);
      } catch (error) {
        setVerseError(error instanceof Error ? error.message : "Could not suggest a verse right now.");
      }
    });
  }

  return (
    <section className="border border-black/10 bg-white/70 p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">{event.name}</p>
          <h3 className="mt-1 text-base font-medium">{event.dateLabel}</h3>
        </div>
        {note ? (
          <button
            type="button"
            onClick={deleteCurrentNote}
            disabled={isPending}
            className="inline-flex shrink-0 self-start border border-red-900/20 bg-red-50/40 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-900/65 transition hover:border-red-900/35 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Deleting..." : "Delete note"}
          </button>
        ) : (
          <span className="inline-flex shrink-0 self-start border border-black/10 bg-white/60 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-black/35">
            no note yet
          </span>
        )}
      </div>
      <div className="grid gap-2.5">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={note ? 7 : 5}
          placeholder="Main note. Use [[WORD]] for a standout word."
          className="resize-y border border-black/15 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-black/40"
        />
        <textarea
          value={verseText}
          onChange={(event) => setVerseText(event.target.value)}
          rows={3}
          placeholder="Bible verse text"
          className="resize-y border border-black/15 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-black/40"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-black/40">Verse version: NIV</p>
          <button
            type="button"
            onClick={suggestVerse}
            disabled={isSuggestingVerse}
            className="inline-flex self-start items-center justify-center gap-2 border border-black/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-black/65 transition hover:border-black/30 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSuggestingVerse && (
              <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            )}
            {isSuggestingVerse ? "Suggesting..." : hasVerseDraft ? "Suggest another" : "Suggest NIV verse"}
          </button>
        </div>
        {verseError && (
          <p className="border border-amber-700/20 bg-amber-100/70 px-3 py-2 text-xs leading-5 text-amber-950">
            {verseError}
          </p>
        )}
        <input
          value={verseRef}
          onChange={(event) => setVerseRef(event.target.value)}
          placeholder="Verse reference"
          className="border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !message.trim()}
          className="bg-[#181714] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : note ? "Save changes" : "Save note"}
        </button>
      </div>
    </section>
  );
}
