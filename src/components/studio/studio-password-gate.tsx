import { unlockStudioAction } from "@/app/studio/auth-actions";

export function StudioPasswordGate({
  error,
  passwordConfigured,
}: {
  error?: "invalid" | "locked";
  passwordConfigured: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#ebe7dc] px-6 py-10 text-[#171714]">
      <section className="w-full max-w-[380px] border border-black/10 bg-[#f7f6f0] p-6 shadow-sm">
        <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-black/40">By Jeshua</p>
        <h1 className="font-playfair text-[42px] font-bold leading-none">Studio</h1>
        <p className="mt-4 text-[15px] leading-7 text-black/55">
          This space is locked for editing notes, people, and events.
        </p>
        <form action={unlockStudioAction} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-black/45">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={!passwordConfigured}
              className="w-full border border-black/14 bg-white px-4 py-3 text-[18px] outline-none transition focus:border-black/40 disabled:cursor-not-allowed disabled:bg-black/5"
            />
          </label>
          <button
            type="submit"
            disabled={!passwordConfigured}
            className="w-full bg-[#171714] px-4 py-3 text-[16px] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/35"
          >
            Unlock studio
          </button>
        </form>
        {error === "invalid" && (
          <p className="mt-4 text-center text-[13px] text-[#a33a3a]">That password did not unlock the studio.</p>
        )}
        {error === "locked" && (
          <p className="mt-4 text-center text-[13px] text-[#a33a3a]">Too many tries. Wait a few minutes and try again.</p>
        )}
        {!passwordConfigured && (
          <p className="mt-4 text-center text-[13px] text-[#a33a3a]">Studio password is not configured.</p>
        )}
      </section>
    </main>
  );
}
