import { notFound } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { getStudioSnapshot } from "@/lib/repository";

export default async function StudioPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_STUDIO !== "true") {
    notFound();
  }

  const snapshot = await getStudioSnapshot();

  return <StudioShell snapshot={snapshot} />;
}
