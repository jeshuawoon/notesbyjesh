export type VerseSuggestion = {
  verseText: string;
  verseRef: string;
  version: "NIV";
};

type SuggestVerseInput = {
  excludedVerseRefs?: string[];
  eventDateLabel: string;
  eventName: string;
  message: string;
  personName: string;
  previousVerseRef?: string;
  previousVerseText?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const MAX_VERSE_SUGGESTION_ATTEMPTS = 2;

export async function suggestMotivationalVerse(input: SuggestVerseInput): Promise<VerseSuggestion> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Add GEMINI_API_KEY to .env.local to use AI verse suggestions.");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const excludedVerseRefs = collectExcludedVerseRefs(input);

  for (let attempt = 0; attempt < MAX_VERSE_SUGGESTION_ATTEMPTS; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildVersePrompt({ ...input, excludedVerseRefs }),
                },
              ],
            },
          ],
          generationConfig: {
            candidateCount: 1,
            maxOutputTokens: 180,
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                verseText: { type: "string" },
                verseRef: { type: "string" },
                version: { type: "string", enum: ["NIV"] },
              },
              required: ["verseText", "verseRef", "version"],
            },
            temperature: 0.95,
            topP: 0.95,
          },
        }),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Gemini could not suggest a verse right now.");
    }

    const data = (await response.json()) as GeminiResponse;
    const text = extractGeminiText(data);
    const suggestion = parseVerseSuggestion(text);

    if (!suggestion) {
      throw new Error("Gemini returned a verse suggestion I could not read.");
    }

    if (!isExcludedVerseRef(suggestion.verseRef, excludedVerseRefs)) {
      return suggestion;
    }

    excludedVerseRefs.push(suggestion.verseRef);
  }

  throw new Error("Gemini kept suggesting the same verse. Try again in a moment.");
}

export function parseVerseSuggestion(text: string): VerseSuggestion | null {
  const cleanText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const value = JSON.parse(cleanText) as Partial<VerseSuggestion>;
    if (
      typeof value.verseText !== "string" ||
      typeof value.verseRef !== "string" ||
      value.version !== "NIV" ||
      !value.verseText.trim() ||
      !value.verseRef.trim()
    ) {
      return null;
    }

    return {
      verseText: value.verseText.trim(),
      verseRef: value.verseRef.trim(),
      version: "NIV",
    };
  } catch {
    return null;
  }
}

export function buildVersePrompt(input: SuggestVerseInput) {
  const excludedVerseRefs = collectExcludedVerseRefs(input);

  return [
    "Pick 1 motivational Bible verse for a warm Christian camp note.",
    'Use NIV. Return only JSON: {"verseText":"...","verseRef":"Book 1:2","version":"NIV"}',
    "Fit: courage, identity, endurance, peace, hope, calling, or God's faithfulness.",
    "Do not repeat any avoid ref, even with different wording.",
    "No markdown, commentary, or extra keys.",
    `Person: ${compact(input.personName, 40) || "Unknown"}`,
    `Event: ${compact(`${input.eventName} ${input.eventDateLabel}`, 60)}`,
    `Draft: ${compact(input.message, 280) || "No draft."}`,
    `Avoid ref: ${compact(excludedVerseRefs.join(", "), 120) || "None"}`,
    `Seed: ${Math.random().toString(36).slice(2, 8)}`,
  ].join("\n");
}

export function isExcludedVerseRef(verseRef: string, excludedVerseRefs: string[]) {
  const normalizedVerseRef = normalizeVerseRef(verseRef);

  return excludedVerseRefs.some((excludedVerseRef) => normalizeVerseRef(excludedVerseRef) === normalizedVerseRef);
}

function extractGeminiText(data: GeminiResponse) {
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

function collectExcludedVerseRefs(input: SuggestVerseInput) {
  return [input.previousVerseRef, ...(input.excludedVerseRefs ?? [])]
    .map((verseRef) => verseRef?.replace(/\s*\(NIV\)\s*$/i, "").trim())
    .filter((verseRef): verseRef is string => Boolean(verseRef));
}

function normalizeVerseRef(verseRef: string) {
  return verseRef
    .replace(/\s*\(NIV\)\s*$/i, "")
    .replace(/\s+/g, "")
    .replace(/[.:]/g, "")
    .trim()
    .toLowerCase();
}

function compact(value: string | undefined, maxLength: number) {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
