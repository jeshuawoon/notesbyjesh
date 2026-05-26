export const FRIENDLY_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const FRIENDLY_CODE_LENGTH = 5;

export function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, "").trim();
}

export function normalizeFriendlyCodeInput(value: string) {
  return normalizeCode(value).slice(0, FRIENDLY_CODE_LENGTH);
}

export function isCompleteFriendlyCode(value: string) {
  return normalizeCode(value).length === FRIENDLY_CODE_LENGTH;
}

export function generateFriendlyCode(existingCodes: Iterable<string> = []) {
  const existing = new Set(Array.from(existingCodes, normalizeCode));

  for (let attempt = 0; attempt < 1000; attempt++) {
    let code = "";

    for (let index = 0; index < FRIENDLY_CODE_LENGTH; index++) {
      const randomIndex = Math.floor(Math.random() * FRIENDLY_CODE_ALPHABET.length);
      code += FRIENDLY_CODE_ALPHABET[randomIndex];
    }

    if (!existing.has(code)) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique code.");
}
