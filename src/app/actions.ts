"use server";

import { unlockTimeline } from "@/lib/repository";

export async function unlockCodeAction(code: string) {
  return unlockTimeline(code);
}

