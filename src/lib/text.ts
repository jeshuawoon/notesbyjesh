export type ParsedTextPart =
  | { kind: "text"; value: string }
  | { kind: "standout"; value: string };

export function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function parseStandoutText(value: string): ParsedTextPart[] {
  const parts: ParsedTextPart[] = [];
  const markerPattern = /\[\[([^\]]+)\]\]/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = markerPattern.exec(value)) !== null) {
    if (match.index > cursor) {
      parts.push({ kind: "text", value: value.slice(cursor, match.index) });
    }

    parts.push({ kind: "standout", value: match[1].trim() });
    cursor = markerPattern.lastIndex;
  }

  if (cursor < value.length) {
    parts.push({ kind: "text", value: value.slice(cursor) });
  }

  return parts.filter((part) => part.value.length > 0);
}

