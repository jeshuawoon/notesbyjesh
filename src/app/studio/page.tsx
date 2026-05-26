import { notFound } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { getStudioSnapshot } from "@/lib/repository";
import { canAccessStudio } from "@/lib/studio-access";

export default async function StudioPage() {
  if (!canAccessStudio(process.env)) {
    notFound();
  }

  const snapshot = await getStudioSnapshot();

  return <StudioShell snapshot={snapshot} />;
}
