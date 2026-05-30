import { cookies } from "next/headers";
import { StudioPasswordGate } from "@/components/studio/studio-password-gate";
import { StudioShell } from "@/components/studio/studio-shell";
import { getStudioSnapshot } from "@/lib/repository";
import { STUDIO_SESSION_COOKIE, canAccessStudio, isStudioPasswordConfigured } from "@/lib/studio-auth";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STUDIO_SESSION_COOKIE)?.value;
  const passwordConfigured = isStudioPasswordConfigured(process.env);
  const isAuthorized = canAccessStudio(process.env, sessionToken);

  if (!isAuthorized) {
    const query = await searchParams;
    const error = typeof query.error === "string" ? query.error : undefined;

    return (
      <StudioPasswordGate
        error={error === "locked" ? "locked" : error === "1" ? "invalid" : undefined}
        passwordConfigured={passwordConfigured}
      />
    );
  }

  const snapshot = await getStudioSnapshot();

  return <StudioShell snapshot={snapshot} />;
}
