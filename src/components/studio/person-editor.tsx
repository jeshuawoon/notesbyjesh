"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createPersonAction } from "@/app/studio/actions";
import type { Person } from "@/lib/types";

export function PersonEditor({ people, query }: { people: Person[]; query: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [aliases, setAliases] = useState("");

  const possibleDuplicates = useMemo(() => {
    const target = normalize(displayName || query);
    if (target.length < 2) {
      return [];
    }

    return people.filter((person) =>
      [person.displayName, ...person.aliases].some((value) => normalize(value).includes(target) || target.includes(normalize(value))),
    );
  }, [displayName, people, query]);

  function submit() {
    startTransition(async () => {
      await createPersonAction({
        displayName,
        aliases: aliases
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean),
      });
      setDisplayName("");
      setAliases("");
      router.refresh();
    });
  }

  return (
    <section className="mb-7 border border-black/10 bg-white/45 p-3">
      <h2 className="text-sm font-semibold">Create person</h2>
      <div className="mt-3 space-y-2.5">
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        <input
          value={aliases}
          onChange={(event) => setAliases(event.target.value)}
          placeholder="Aliases, comma separated"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        {possibleDuplicates.length > 0 && (
          <div className="border border-amber-700/20 bg-amber-100/70 p-3 text-xs leading-5 text-amber-950">
            Possible existing person: {possibleDuplicates.map((person) => person.displayName).join(", ")}
          </div>
        )}
        <button
          onClick={submit}
          disabled={isPending || !displayName.trim()}
          className="w-full bg-[#181714] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create with permanent code"}
        </button>
      </div>
    </section>
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
