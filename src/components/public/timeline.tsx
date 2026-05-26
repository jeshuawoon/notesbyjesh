"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ThemePreset, UnlockedTimeline } from "@/lib/types";
import { findNextReadableTimelineIndex, getNextTimelineUnlockDate, isFutureTimelineItem } from "@/lib/timeline";
import { createStarField } from "@/lib/starfield";
import { CountdownSection } from "./countdown-section";
import { EventSeparator } from "./event-separator";
import { StandoutText } from "./standout-text";
import { splitParagraphs } from "@/lib/text";

const starVisibility = 1.5;
const defaultStarMultiplier = 1.14;
const footerStarMultiplier = 1.45;
const neutralFooterTheme = {
  glow: "rgba(237, 241, 238, 0.11)",
  soft: "rgba(237, 241, 238, 0.58)",
  text: "rgba(237, 241, 238, 0.9)",
};
const footerEasterEggWindowMs = 2_200;
const footerEasterEggTapCount = 4;

const starThemes: Record<
  ThemePreset,
  { glow: [number, number, number]; soft: [number, number, number]; text: [number, number, number] }
> = {
  ember: { glow: [238, 126, 88], soft: [238, 172, 150], text: [255, 226, 212] },
  gold: { glow: [224, 178, 88], soft: [224, 197, 142], text: [245, 232, 200] },
  rose: { glow: [214, 118, 136], soft: [222, 164, 176], text: [245, 220, 226] },
  teal: { glow: [0, 210, 230], soft: [150, 216, 222], text: [200, 240, 240] },
  violet: { glow: [182, 154, 246], soft: [203, 192, 242], text: [232, 226, 255] },
};

const timelineStars = createStarField({
  count: 58,
  maxDuration: 6,
  maxOpacity: 0.26,
  maxSize: 1.72,
  minDuration: 3.2,
  minOpacity: 0.12,
  minSize: 0.7,
  seed: "timeline-background",
}).map((star) => ({
  ...star,
  visibility: starVisibility,
}));

function mixChannel(from: number, to: number, progress: number) {
  return Math.round(from + (to - from) * progress);
}

function mixRgb(from: [number, number, number], to: [number, number, number], progress: number) {
  return [
    mixChannel(from[0], to[0], progress),
    mixChannel(from[1], to[1], progress),
    mixChannel(from[2], to[2], progress),
  ] as const;
}

function rgbCss([red, green, blue]: readonly [number, number, number], alpha: number) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function Timeline({ timeline }: { timeline: UnlockedTimeline }) {
  const footerRef = useRef<HTMLElement | null>(null);
  const footerTapTimesRef = useRef<number[]>([]);
  const footerGlintTimerRef = useRef<number | null>(null);
  const footerEggTimerRef = useRef<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(timeline.items[0]?.event.theme ?? "teal");
  const [footerStarsActive, setFooterStarsActive] = useState(false);
  const [footerGlint, setFooterGlint] = useState<{ id: number; left: number; top: number } | null>(null);
  const [footerEggVisible, setFooterEggVisible] = useState(false);
  const [starTheme, setStarTheme] = useState(() => ({
    glow: rgbCss(starThemes[timeline.items[0]?.event.theme ?? "teal"].glow, 0.14),
    text: rgbCss(starThemes[timeline.items[0]?.event.theme ?? "teal"].text, 0.88),
    soft: rgbCss(starThemes[timeline.items[0]?.event.theme ?? "teal"].soft, 0.68),
  }));

  useEffect(() => {
    const nextUnlockDate = getNextTimelineUnlockDate(timeline.items, now);

    if (!nextUnlockDate) {
      return;
    }

    const delay = Math.max(0, nextUnlockDate.getTime() - now.getTime());
    const timer = window.setTimeout(() => setNow(new Date()), Math.min(delay + 50, 2_147_483_647));

    return () => window.clearTimeout(timer);
  }, [now, timeline.items]);

  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".timeline-reveal"));

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((element) => element.classList.add("timeline-reveal-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("timeline-reveal-in");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.08,
      },
    );

    revealEls.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [timeline, now]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline-theme]"));

    if (sections.length === 0) {
      return;
    }

    let frame = 0;

    const updateStarTheme = () => {
      frame = 0;
      const anchorY = window.innerHeight * 0.45;
      const sectionRects = sections.map((section) => ({
        rect: section.getBoundingClientRect(),
        theme: section.dataset.timelineTheme as ThemePreset,
      }));
      const visibleIndex = sectionRects.findIndex(({ rect }) => rect.bottom > anchorY);
      const currentIndex = visibleIndex === -1 ? sectionRects.length - 1 : visibleIndex;
      const current = sectionRects[currentIndex] ?? sectionRects[0];
      const next = sectionRects[currentIndex + 1];

      if (!current) {
        return;
      }

      const currentTheme = starThemes[current.theme] ?? starThemes.teal;
      const nextTheme = next ? (starThemes[next.theme] ?? currentTheme) : currentTheme;
      const blendDistance = window.innerHeight * 0.35;
      const progress = next
        ? Math.min(1, Math.max(0, (anchorY + blendDistance - next.rect.top) / blendDistance))
        : 0;

      const glow = mixRgb(currentTheme.glow, nextTheme.glow, progress);
      const soft = mixRgb(currentTheme.soft, nextTheme.soft, progress);
      const text = mixRgb(currentTheme.text, nextTheme.text, progress);

      setStarTheme({
        glow: rgbCss(glow, 0.14),
        text: rgbCss(text, 0.88),
        soft: rgbCss(soft, 0.68),
      });
    };

    const scheduleUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateStarTheme);
    };

    updateStarTheme();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [timeline, now]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline-theme]"));

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const visibleSections = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target);
          }
        });

        const activeSection = Array.from(visibleSections.keys()).sort((a, b) => {
          const aDistance = Math.abs(a.getBoundingClientRect().top - 96);
          const bDistance = Math.abs(b.getBoundingClientRect().top - 96);
          return aDistance - bDistance;
        })[0] as HTMLElement | undefined;

        const nextTheme = activeSection?.dataset.timelineTheme as ThemePreset | undefined;

        if (nextTheme) {
          setActiveTheme(nextTheme);
        }
      },
      {
        rootMargin: "-72px 0px -52% 0px",
        threshold: [0, 0.08, 0.35, 0.65],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [timeline, now]);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterStarsActive(entry.isIntersecting && entry.intersectionRatio > 0.38);
      },
      {
        threshold: [0, 0.2, 0.38, 0.6],
      },
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (footerGlintTimerRef.current) {
        window.clearTimeout(footerGlintTimerRef.current);
      }

      if (footerEggTimerRef.current) {
        window.clearTimeout(footerEggTimerRef.current);
      }
    };
  }, []);

  const triggerFooterEasterEgg = () => {
    const timestamp = Date.now();
    const recentTaps = [...footerTapTimesRef.current.filter((tap) => timestamp - tap < footerEasterEggWindowMs), timestamp];
    footerTapTimesRef.current = recentTaps;

    if (footerGlintTimerRef.current) {
      window.clearTimeout(footerGlintTimerRef.current);
    }

    setFooterGlint({
      id: timestamp,
      left: 8 + Math.round(Math.random() * 84),
      top: 8 + Math.round(Math.random() * 74),
    });
    footerGlintTimerRef.current = window.setTimeout(() => setFooterGlint(null), 820);

    if (recentTaps.length < footerEasterEggTapCount) {
      return;
    }

    footerTapTimesRef.current = [];
    setFooterEggVisible(true);

    if (footerEggTimerRef.current) {
      window.clearTimeout(footerEggTimerRef.current);
    }

    footerEggTimerRef.current = window.setTimeout(() => setFooterEggVisible(false), 3_200);
  };

  const scrollToTimelineIndex = (timelineIndex: number) => {
    const target = document.querySelector<HTMLElement>(`[data-timeline-index="${timelineIndex}"]`);

    if (!target) {
      return;
    }

    const targetY = target.getBoundingClientRect().top + window.scrollY - 68;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetY });
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 1600;
    let startTime: number | null = null;

    const easeInOutCubic = (progress: number) =>
      progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const animate = (time: number) => {
      startTime ??= time;
      const progress = Math.min(1, (time - startTime) / duration);

      window.scrollTo({ top: startY + distance * easeInOutCubic(progress) });

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  };

  return (
    <main
      className={`theme-${activeTheme} relative isolate min-h-screen overflow-clip bg-[#040b0f] text-cyan-50`}
      style={{ "--scroll-theme-text": footerStarsActive ? neutralFooterTheme.text : starTheme.text } as CSSProperties}
    >
      <TimelineStars footerActive={footerStarsActive} starTheme={starTheme} />
      <header
        id="timeline-sticky-header"
        className="sticky top-0 z-40 bg-[#040b0f] animate-[sticky-in_0.5s_ease_both]"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[#040b0f]/15 backdrop-blur-xl" />
        <div className="mx-auto max-w-[480px] px-6">
          <div className="pb-[11px] pt-[18px]">
            <p className="font-playfair text-[40px] font-bold leading-none text-[#edf1ee]/92">
              <span className="not-italic">Hey, </span>
              <span className="italic text-[var(--scroll-theme-text)] transition-colors duration-700">
                {timeline.person.displayName}.
              </span>
            </p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[480px]">
        <div className="relative pl-12 before:absolute before:bottom-0 before:left-6 before:top-0 before:w-px before:bg-[#edf1ee]/14">
          {timeline.items.map((item, index) => {
            if (isFutureTimelineItem(item, now)) {
              return <CountdownSection key={item.note.id} index={index} item={item} />;
            }

            const paragraphs = splitParagraphs(item.note.message);
            const verseDelay = `${Math.min(paragraphs.length, 5) * 90}ms`;
            const nextReadableIndex = findNextReadableTimelineIndex(timeline.items, index, now);
            const keepReadingDelay = `${(Math.min(paragraphs.length, 5) + 1) * 90}ms`;

            return (
              <article
                key={item.note.id}
                data-timeline-section
                data-timeline-index={index}
                data-timeline-theme={item.event.theme}
                className={`theme-${item.event.theme} relative min-h-[calc(100svh-68px)] scroll-mt-[68px]`}
              >
                <EventSeparator item={item} />
                <div className="timeline-reveal flex min-h-[calc(100svh-118px)] flex-col py-10 pr-6">
                  <div className="font-crimson space-y-5 text-[20px] font-light leading-[1.9] text-cyan-50/84">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraph}
                        className="timeline-stagger"
                        style={{ "--reveal-delay": `${paragraphIndex * 90}ms` } as CSSProperties}
                      >
                        <StandoutText value={paragraph} />
                      </p>
                    ))}
                  </div>
                  <div className="min-h-8 flex-1" />
                  {(item.note.verseText || item.note.verseRef) && (
                    <div
                      className="timeline-stagger mb-6 border-t border-[color:var(--theme-glow)] pt-5"
                      style={{ "--reveal-delay": verseDelay } as CSSProperties}
                    >
                      <p className="font-crimson text-[18px] italic leading-8 text-[var(--theme-text)] opacity-70">
                        {item.note.verseText}
                      </p>
                      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-soft)]">
                        {item.note.verseRef}
                      </p>
                    </div>
                  )}
                  {nextReadableIndex !== null && (
                    <div
                      className="timeline-stagger mb-6 mt-2 flex justify-center"
                      style={{ "--reveal-delay": keepReadingDelay } as CSSProperties}
                    >
                      <button
                        type="button"
                        onClick={() => scrollToTimelineIndex(nextReadableIndex)}
                        className="group flex flex-col items-center gap-2 rounded-full px-3 py-2 text-[#edf1ee]/46 transition hover:translate-y-0.5 hover:text-[#edf1ee]/76 focus-visible:text-[#edf1ee]/86"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Continue reading</span>
                        <span aria-hidden="true" className="h-3 w-3 rotate-45 border-b border-r border-current" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <footer
          ref={footerRef}
          className="timeline-reveal relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
        >
          <div className="timeline-stagger mb-8 h-px w-24 bg-[#edf1ee]/12" />
          <button
            type="button"
            onClick={triggerFooterEasterEgg}
            className="timeline-stagger max-w-xs cursor-default appearance-none border-0 bg-transparent p-0 text-center outline-none"
            style={{ "--reveal-delay": "90ms" } as CSSProperties}
          >
            <span className="font-playfair block text-[30px] font-bold italic leading-[1.12] text-[#edf1ee]/88 transition hover:text-[#edf1ee] focus-visible:text-[#edf1ee]">
              Let&apos;s stay connected.
            </span>
          </button>
          <div
            className="timeline-stagger relative mt-8 flex flex-col items-center gap-3"
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            <a
              href="https://instagram.com/jeshuawoon"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram, @jeshuawoon"
              className="text-[16px] tracking-[0.03em] text-[#edf1ee]/48 transition hover:text-[#edf1ee]/82"
            >
              @jeshuawoon
            </a>
            <span className="h-[5px] w-[5px] rounded-full bg-[#edf1ee]/20" />
            <button
              type="button"
              onClick={triggerFooterEasterEgg}
              className="font-crimson cursor-default border-0 bg-transparent p-0 text-[17px] italic text-[#edf1ee]/26 outline-none transition hover:text-[#edf1ee]/42 focus-visible:text-[#edf1ee]/42"
            >
              see you around
            </button>
          </div>
        </footer>
      </section>
      {footerGlint && (
        <span
          key={footerGlint.id}
          aria-hidden="true"
          className="footer-secret-glint pointer-events-none fixed z-50 h-[5px] w-[5px]"
          style={
            {
              left: `${footerGlint.left}%`,
              top: `${footerGlint.top}%`,
            } as CSSProperties
          }
        />
      )}
      {footerEggVisible && (
        <div className="footer-secret-egg pointer-events-none fixed left-[calc(50%+56px)] top-[calc(50%+128px)] z-50 w-[112px] -translate-x-1/2 overflow-hidden rounded-[12px] opacity-0">
          <iframe
            title="Secret dancing cat"
            src="https://tenor.com/embed/5034219186050115128"
            className="block aspect-square w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin"
            allowFullScreen
          />
        </div>
      )}
    </main>
  );
}

function TimelineStars({
  footerActive,
  starTheme,
}: {
  footerActive: boolean;
  starTheme: { glow: string; soft: string; text: string };
}) {
  const starMultiplier = defaultStarMultiplier * (footerActive ? footerStarMultiplier : 1);
  const glow = footerActive ? neutralFooterTheme.glow : starTheme.glow;
  const soft = footerActive ? neutralFooterTheme.soft : starTheme.soft;

  return (
    <div
      aria-hidden="true"
      className="timeline-stars pointer-events-none fixed left-0 top-0 z-0 h-[100lvh] w-screen overflow-hidden"
      data-footer-active={footerActive}
      style={
        {
          "--theme-glow": glow,
          "--theme-soft": soft,
          opacity: footerActive ? 0.82 : 0.66,
        } as CSSProperties
      }
    >
      {timelineStars.map((star) => (
        <span
          key={star.id}
          className="timeline-star absolute rounded-full"
          style={
            {
              "--star-delay": star.delay,
              "--star-duration": star.duration,
              "--star-opacity": star.opacity,
              "--star-visibility": star.visibility * starMultiplier,
              height: star.size,
              left: star.left,
              top: star.top,
              width: star.size,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
