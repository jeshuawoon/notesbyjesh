import { describe, expect, it } from "vitest";
import { createStarField } from "./starfield";

describe("createStarField", () => {
  it("returns the same star field for the same seed", () => {
    expect(createStarField({ count: 5, seed: "notes" })).toEqual(
      createStarField({ count: 5, seed: "notes" }),
    );
  });

  it("scatters star positions without a repeating linear delta", () => {
    const stars = createStarField({ count: 12, seed: "notes" });
    const leftValues = stars.map((star) => Number.parseFloat(star.left));
    const deltas = leftValues
      .slice(1)
      .map((left, index) => Number((left - leftValues[index]).toFixed(3)));

    expect(new Set(deltas).size).toBeGreaterThan(6);
  });
});
