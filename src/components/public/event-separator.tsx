import type { TimelineItem } from "@/lib/types";

export function EventSeparator({ item }: { item: TimelineItem }) {
  return (
    <div
      className={`theme-${item.event.theme} sticky top-[68px] z-30 -ml-12 isolate flex items-center gap-2 py-4 pl-12 pr-6`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,rgba(4,11,15,0.96),rgba(4,11,15,0.96)_72%,rgba(4,11,15,0))]"
      />
      <span className="absolute left-[24.5px] top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[var(--theme-pip)] bg-[#040b0f] shadow-[0_0_9px_var(--theme-glow)] animate-[pip-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]" />
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--theme-soft)] sm:tracking-[0.18em]">
        {item.event.name} · {item.event.dateLabel}
      </span>
    </div>
  );
}
