const STUDIO_LOGIN_WINDOW_MS = 60 * 1000;
const STUDIO_LOGIN_MAX_ATTEMPTS = 6;
const STUDIO_LOGIN_LOCKOUT_MS = 5 * 60 * 1000;

type StudioLoginAttempt = {
  count: number;
  windowStartedAt: number;
  lockedUntil: number;
};

const studioLoginAttempts = new Map<string, StudioLoginAttempt>();

export function isStudioLoginBlocked(key: string, now = Date.now()) {
  const attempt = studioLoginAttempts.get(key);

  if (!attempt) {
    return false;
  }

  if (attempt.lockedUntil <= now) {
    return false;
  }

  return true;
}

export function recordFailedStudioLoginAttempt(key: string, now = Date.now()) {
  const current = studioLoginAttempts.get(key);
  const attempt =
    current && now - current.windowStartedAt <= STUDIO_LOGIN_WINDOW_MS
      ? current
      : { count: 0, lockedUntil: 0, windowStartedAt: now };

  attempt.count += 1;

  if (attempt.count >= STUDIO_LOGIN_MAX_ATTEMPTS) {
    attempt.lockedUntil = now + STUDIO_LOGIN_LOCKOUT_MS;
  }

  studioLoginAttempts.set(key, attempt);

  return attempt;
}

export function clearStudioLoginAttempts(key: string) {
  studioLoginAttempts.delete(key);
}

export function resetStudioLoginAttemptsForTests() {
  studioLoginAttempts.clear();
}
