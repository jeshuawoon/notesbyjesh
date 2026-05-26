"use client";

import type { Person } from "@/lib/types";

export function PersonSearch({
  people,
  query,
  selectedPersonId,
  onQueryChange,
  onSelect,
}: {
  people: Person[];
  query: string;
  selectedPersonId: string;
  onQueryChange: (query: string) => void;
  onSelect: (personId: string) => void;
}) {
  const normalized = query.trim().toLowerCase();
  const filtered = people.filter((person) => {
    const haystack = [person.displayName, person.codeDisplay, ...person.aliases].join(" ").toLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  return (
    <section className="mb-8">
      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-black/45">
        search people
      </label>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Name, alias, or code"
        className="w-full border border-black/15 bg-white/60 px-3 py-2.5 text-sm outline-none transition focus:border-black/40"
      />
      <div className="mt-3 max-h-[280px] space-y-2 overflow-auto">
        {filtered.map((person) => (
          <button
            key={person.id}
            onClick={() => onSelect(person.id)}
            className={`w-full border px-3 py-2.5 text-left transition ${
              person.id === selectedPersonId
                ? "border-black bg-[#181714] text-white"
                : "border-black/10 bg-white/45 hover:border-black/30"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{person.displayName}</span>
              <span className="font-mono text-xs opacity-65">{person.codeDisplay}</span>
            </div>
            <p className="mt-1 truncate text-xs opacity-55">
              {person.aliases.length > 0 ? person.aliases.join(", ") : "No aliases"}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
