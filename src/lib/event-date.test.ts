import { describe, expect, it } from "vitest";
import { parseEventDate } from "./event-date";

describe("parseEventDate", () => {
  it("turns a date picker value into an event date, year, and month-year display label", () => {
    expect(parseEventDate("2026-06-14")).toEqual({
      date: "2026-06-14",
      dateLabel: "June 2026",
      year: 2026,
    });
  });

  it("rejects invalid date picker values", () => {
    expect(parseEventDate("June 2026")).toBeNull();
    expect(parseEventDate("2026-02-31")).toBeNull();
    expect(parseEventDate("2026-13-01")).toBeNull();
  });
});
