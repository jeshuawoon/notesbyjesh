"use client";

import { useRef, useState, useTransition, type CSSProperties } from "react";
import { unlockCodeAction } from "@/app/actions";
import {
  FRIENDLY_CODE_LENGTH,
  isCompleteFriendlyCode,
  normalizeCode,
  normalizeFriendlyCodeInput,
} from "@/lib/code";
import { createStarField } from "@/lib/starfield";
import type { UnlockedTimeline } from "@/lib/types";
import { Timeline } from "./timeline";

const entryStars = createStarField({
  count: 55,
  maxDuration: 6,
  maxOpacity: 0.32,
  maxSize: 1.55,
  minDuration: 2.5,
  minOpacity: 0.16,
  minSize: 0.5,
  seed: "entry-background",
});

export function CodeEntry() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [timeline, setTimeline] = useState<UnlockedTimeline | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSubmittedCodeRef = useRef<string | null>(null);

  function submit(normalized = normalizeCode(code)) {
    if (isPending || lastSubmittedCodeRef.current === normalized) {
      return;
    }

    if (!isCompleteFriendlyCode(normalized)) {
      setError("Enter the full code from your note.");
      return;
    }

    lastSubmittedCodeRef.current = normalized;
    startTransition(async () => {
      const result = await unlockCodeAction(normalized);

      if (!result) {
        setError("Code not found. Check your note and try again.");
        setTimeline(null);
        return;
      }

      setError("");
      setTimeline(result);
    });
  }

  if (timeline) {
    return <Timeline timeline={timeline} />;
  }

  return (
    <main className="relative flex h-[100svh] items-center justify-center overflow-hidden px-6 py-7 text-left">
      <EntryBackground />
      <section className="relative z-10 flex h-full w-full max-w-[360px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-[320px]">
          <p
            className="font-crimson mb-3 text-[18px] italic leading-none text-[#edf1ee]/54"
            style={{ animation: "fade-up 0.7s ease both" }}
          >
            psst...
          </p>
          <h1
            className="mb-4 max-w-[320px] text-[50px] font-medium leading-[0.98] text-[#edf1ee]/94"
            style={{
              animation: "fade-up 0.7s ease both",
              fontFamily: '"Times New Roman", Georgia, serif',
            }}
          >
            Got your note code?
          </h1>
          <p
            className="font-crimson mb-8 max-w-[320px] text-[18px] italic leading-7 text-[#edf1ee]/46"
            style={{ animation: "fade-up 0.7s ease both 170ms" }}
          >
            Enter it here and I&apos;ll unfold what was written for you.
          </p>

          <input
            value={code}
            onChange={(event) => {
              const nextCode = normalizeFriendlyCodeInput(event.target.value);

              setCode(nextCode);

              if (!isCompleteFriendlyCode(nextCode)) {
                lastSubmittedCodeRef.current = null;
                setError("");
                return;
              }

              submit(nextCode);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
            maxLength={FRIENDLY_CODE_LENGTH}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label="Your code"
            placeholder="Your Code"
            aria-describedby="code-entry-status"
            className={`code-entry-input mb-3 w-full rounded-[8px] border border-[#edf1ee]/18 bg-[#edf1ee]/[0.035] px-5 py-4 text-center text-[22px] tracking-[0.18em] text-[#edf1ee]/92 outline-none transition placeholder:text-[#edf1ee]/28 focus:border-cyan-100/42 focus:bg-[#edf1ee]/[0.055] ${error ? "animate-[shake_0.35s_ease]" : ""}`}
          />
          <p
            id="code-entry-status"
            aria-live="polite"
            className="min-h-5 w-full text-center text-[12px] leading-5 tracking-wide text-[#edf1ee]/42"
          >
            {isPending
              ? "Opening your note..."
              : error || (normalizeCode(code).length > 0 ? `${normalizeCode(code).length}/${FRIENDLY_CODE_LENGTH}` : "")}
          </p>
          </div>
        </div>
        <p className="font-crimson shrink-0 border-t border-[#edf1ee]/12 pt-4 text-center text-[16px] italic text-[#edf1ee]/38">
          Notes by Jeshua
        </p>
      </section>
    </main>
  );
}

function EntryBackground() {
  return (
    <div className="absolute inset-0 bg-[#040b0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_28%,rgba(0,200,220,0.08),transparent_55%),radial-gradient(ellipse_at_22%_75%,rgba(0,100,130,0.1),transparent_48%)]" />
      {entryStars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-cyan-100"
          style={{
            "--star-opacity": star.opacity,
            "--star-visibility": 1.22,
            opacity: `calc(${star.opacity} * 1.22)`,
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `star-twinkle ${star.duration} ease-in-out infinite ${star.delay} both`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
