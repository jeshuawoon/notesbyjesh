import { cookies } from "next/headers";
import { STUDIO_SESSION_COOKIE, canAccessStudio } from "./studio-auth";

export async function isStudioRequestAuthorized(env = process.env) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STUDIO_SESSION_COOKIE)?.value;

  return canAccessStudio(env, sessionToken);
}

export async function assertStudioRequestAuthorized(env = process.env) {
  if (!(await isStudioRequestAuthorized(env))) {
    throw new Error("Unauthorized studio request.");
  }
}
