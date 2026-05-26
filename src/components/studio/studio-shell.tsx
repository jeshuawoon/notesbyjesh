"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deletePersonAction } from "@/app/studio/actions";
import { getNoteEditorSlots } from "@/lib/studio";
import type { StudioSnapshot } from "@/lib/types";
import { EventEditor } from "./event-editor";
import { NoteEditor } from "./note-editor";
import { PersonEditor } from "./person-editor";
import { PersonSearch } from "./person-search";

export function StudioShell({ snapshot }: { snapshot: StudioSnapshot }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState(snapshot.people[0]?.id ?? "");
  const [isDeletingPerson, startDeletingPerson] = useTransition();

  const selectedPerson = snapshot.people.find((person) => person.id === selectedPersonId) ?? snapshot.people[0];

  function deleteSelectedPerson() {
    if (!selectedPerson || !window.confirm(`Delete ${selectedPerson.displayName}? This also removes all of their notes.`)) {
      return;
    }

    startDeletingPerson(async () => {
      await deletePersonAction(selectedPerson.id);
      setSelectedPersonId("");
      router.refresh();
    });
  }

  const noteEditorSlots = useMemo(
    () => {
      if (!selectedPerson) {
        return [];
      }

      return getNoteEditorSlots({
        events: snapshot.events,
        notes: snapshot.notes,
        personId: selectedPerson.id,
      });
    },
    [selectedPerson, snapshot.events, snapshot.notes],
  );

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#181714]">
      <div className="mx-auto grid min-h-screen max-w-[1760px] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-[#ebe7dc] p-5 lg:border-b-0 lg:border-r">
          <div className="mb-7">
            <p className="font-cinzel text-xs uppercase tracking-[0.32em] text-black/45">by Jeshua</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Notes studio</h1>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Local creator for people, permanent codes, events, and note history.
            </p>
          </div>

          <PersonEditor people={snapshot.people} query={query} />

          <PersonSearch
            people={snapshot.people}
            query={query}
            selectedPersonId={selectedPerson?.id ?? ""}
            onQueryChange={setQuery}
            onSelect={setSelectedPersonId}
          />
        </aside>

        <section className="p-5 lg:p-6">
          {!selectedPerson ? (
            <div className="flex min-h-[60vh] items-center justify-center text-black/45">
              Create a person to begin.
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div>
                <div className="mb-5 flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-black/40">selected person</p>
                    <h2 className="font-playfair mt-2 text-4xl italic leading-none lg:text-5xl">
                      {selectedPerson.displayName}
                    </h2>
                    <p className="mt-3 font-mono text-sm tracking-[0.24em] text-black/55">{selectedPerson.codeDisplay}</p>
                  </div>
                  <div className="text-sm text-black/55 sm:text-right">
                    {selectedPerson.aliases.length > 0 ? selectedPerson.aliases.join(", ") : "No aliases yet"}
                    <button
                      type="button"
                      onClick={deleteSelectedPerson}
                      disabled={isDeletingPerson}
                      className="mt-3 inline-flex border border-red-900/20 bg-red-50/40 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-red-900/65 transition hover:border-red-900/35 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isDeletingPerson ? "Deleting..." : "Delete person"}
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {noteEditorSlots.map(({ event, note }) => (
                    <NoteEditor
                      key={`${selectedPerson.id}-${event.id}-${note?.id ?? "new"}`}
                      event={event}
                      note={note}
                      person={selectedPerson}
                    />
                  ))}
                </div>
              </div>

              <EventEditor events={snapshot.events} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
