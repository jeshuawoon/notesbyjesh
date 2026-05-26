import { parseStandoutText } from "@/lib/text";

export function StandoutText({ value }: { value: string }) {
  return (
    <>
      {parseStandoutText(value).map((part, index) => {
        if (part.kind === "standout") {
          return (
            <span
              key={`${part.value}-${index}`}
              className="font-cinzel mx-1 inline-block text-[0.9em] uppercase tracking-[0.22em] text-[var(--theme-text)] drop-shadow-[0_0_10px_var(--theme-glow)]"
            >
              {part.value}
            </span>
          );
        }

        return <span key={`${part.value}-${index}`}>{part.value}</span>;
      })}
    </>
  );
}
