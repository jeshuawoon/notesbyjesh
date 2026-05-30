import { describe, expect, it } from "vitest";
import { buildEventUpdateInput, toDateTimeLocalInput } from "./studio-event-form";

describe("toDateTimeLocalInput", () => {
  it("turns an ISO timestamp into a datetime-local input value", () => {
    expect(toDateTimeLocalInput("2026-06-01T14:30:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:30$/);
  });

  it("returns an empty value when letters open immediately", () => {
    expect(toDateTimeLocalInput(null)).toBe("");
  });
});

describe("buildEventUpdateInput", () => {
  it("builds a normalized event update payload from studio form values", () => {
    expect(
      buildEventUpdateInput({
        defaultVisibleFrom: "",
        eventDate: "2027-01-19",
        eventId: "event-1",
        name: "  LifeGen Camp  ",
        theme: "gold",
      }),
    ).toEqual({
      date: "2027-01-19",
      dateLabel: "January 2027",
      defaultVisibleFrom: null,
      eventId: "event-1",
      name: "LifeGen Camp",
      theme: "gold",
      year: 2027,
    });
  });

  it("rejects invalid event date values", () => {
    expect(
      buildEventUpdateInput({
        defaultVisibleFrom: "",
        eventDate: "2027-02-31",
        eventId: "event-1",
        name: "LifeGen Camp",
        theme: "teal",
      }),
    ).toBeNull();
  });
});
