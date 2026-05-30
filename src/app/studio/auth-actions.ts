"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  STUDIO_SESSION_COOKIE,
  STUDIO_SESSION_MAX_AGE_SECONDS,
  createStudioSessionToken,
  verifyStudioPassword,
} from "@/lib/studio-auth";
import { clearStudioLoginAttempts, isStudioLoginBlocked, recordFailedStudioLoginAttempt } from "@/lib/studio-rate-limit";

export async function unlockStudioAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const attemptKey = await getAttemptKey();

  if (isStudioLoginBlocked(attemptKey)) {
    await slowFailedAttempt();
    redirect("/studio?error=locked");
  }

  if (!verifyStudioPassword(process.env, password)) {
    recordFailedStudioLoginAttempt(attemptKey);
    await slowFailedAttempt();
    redirect("/studio?error=1");
  }

  clearStudioLoginAttempts(attemptKey);

  const cookieStore = await cookies();
  cookieStore.set({
    name: STUDIO_SESSION_COOKIE,
    value: createStudioSessionToken(process.env),
    httpOnly: true,
    maxAge: STUDIO_SESSION_MAX_AGE_SECONDS,
    path: "/studio",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/studio");
}

async function slowFailedAttempt() {
  await new Promise((resolve) => setTimeout(resolve, 850 + Math.round(Math.random() * 350)));
}

async function getAttemptKey() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || requestHeaders.get("x-real-ip")?.trim() || requestHeaders.get("cf-connecting-ip")?.trim() || "local";
}
