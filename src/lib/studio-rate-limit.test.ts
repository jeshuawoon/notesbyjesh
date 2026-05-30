import { afterEach, describe, expect, it } from "vitest";
import {
  clearStudioLoginAttempts,
  isStudioLoginBlocked,
  recordFailedStudioLoginAttempt,
  resetStudioLoginAttemptsForTests,
} from "./studio-rate-limit";

describe("studio login rate limit", () => {
  afterEach(() => {
    resetStudioLoginAttemptsForTests();
  });

  it("locks a key after repeated failures", () => {
    const now = Date.UTC(2026, 4, 30, 12);

    for (let index = 0; index < 5; index += 1) {
      recordFailedStudioLoginAttempt("1.2.3.4", now + index);
    }

    expect(isStudioLoginBlocked("1.2.3.4", now + 5)).toBe(false);

    recordFailedStudioLoginAttempt("1.2.3.4", now + 6);

    expect(isStudioLoginBlocked("1.2.3.4", now + 7)).toBe(true);
  });

  it("clears attempts after successful login", () => {
    const now = Date.UTC(2026, 4, 30, 12);

    recordFailedStudioLoginAttempt("1.2.3.4", now);
    clearStudioLoginAttempts("1.2.3.4");

    expect(isStudioLoginBlocked("1.2.3.4", now + 1)).toBe(false);
  });
});
