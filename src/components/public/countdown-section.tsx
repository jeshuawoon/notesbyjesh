"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { TimelineItem } from "@/lib/types";
import { EventSeparator } from "./event-separator";

export function CountdownSection({ item, index }: { item: TimelineItem; index: number }) {
  const target = useMemo(() => new Date(item.event.defaultVisibleFrom ?? ""), [item]);
  const [now, setNow] = useState(() => new Date());
  const remaining = Math.max(0, target.getTime() - now.getTime());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <section
      data-timeline-section
      data-timeline-index={index}
      data-timeline-theme={item.event.theme}
      className={`theme-${item.event.theme} relative min-h-screen`}
    >
      <EventSeparator item={item} />
      <div className="timeline-reveal flex min-h-[calc(100vh-48px)] flex-col justify-center py-14 pr-6">
        <h2
          className="timeline-stagger mb-5 max-w-[320px] text-[48px] font-medium leading-[0.98] text-[var(--theme-text)]"
          style={
            {
              "--reveal-delay": "60ms",
              fontFamily: '"Times New Roman", Georgia, serif',
            } as CSSProperties
          }
        >
          You&apos;re a little earlier than expected.
        </h2>
        <p
          className="timeline-stagger font-crimson mb-8 max-w-[320px] text-[18px] italic leading-7 text-cyan-100/46"
          style={{ "--reveal-delay": "140ms" } as CSSProperties}
        >
          Come back later when it&apos;s letter opening time for everyone.
        </p>
        <div
          className="timeline-stagger grid max-w-[320px] grid-cols-4 gap-2"
          style={{ "--reveal-delay": "220ms" } as CSSProperties}
        >
          <TimeBlock label="days" value={days} />
          <TimeBlock label="hours" value={hours} />
          <TimeBlock label="mins" value={minutes} />
          <TimeBlock label="secs" value={seconds} />
        </div>
      </div>
    </section>
  );
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-cyan-100/16 bg-cyan-100/[0.035] px-2 py-4 text-center">
      <div
        className="text-[28px] font-medium leading-none text-cyan-50"
        style={{ fontFamily: '"Times New Roman", Georgia, serif' }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-2 text-[9px] uppercase tracking-[0.16em] text-cyan-100/34">{label}</div>
    </div>
  );
}
