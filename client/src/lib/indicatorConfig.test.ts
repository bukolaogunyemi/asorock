import { describe, it, expect } from "vitest";
import { getIndicatorColor, getIndicatorTrend, INDICATORS } from "./indicatorConfig";

describe("indicatorConfig", () => {
  it("returns 8 indicators", () => {
    expect(INDICATORS).toHaveLength(8);
  });

  it("colors approval green when above 60", () => {
    expect(getIndicatorColor("approval", 65)).toBe("green");
  });

  it("colors approval yellow when 40-60", () => {
    expect(getIndicatorColor("approval", 50)).toBe("yellow");
  });

  it("colors approval red when below 40", () => {
    expect(getIndicatorColor("approval", 30)).toBe("red");
  });

  it("colors treasury green above 1.5", () => {
    expect(getIndicatorColor("treasury", 2.0)).toBe("green");
  });

  it("colors inflation green below 10", () => {
    expect(getIndicatorColor("inflation", 8)).toBe("green");
  });

  it("colors inflation red above 20", () => {
    expect(getIndicatorColor("inflation", 25)).toBe("red");
  });

  it("returns no trend on day 1", () => {
    const result = getIndicatorTrend(50, undefined);
    expect(result).toEqual({ direction: "none", delta: 0 });
  });

  it("returns up trend when value increased", () => {
    const result = getIndicatorTrend(55, 50);
    expect(result).toEqual({ direction: "up", delta: 5 });
  });

  it("returns down trend when value decreased", () => {
    const result = getIndicatorTrend(45, 50);
    expect(result).toEqual({ direction: "down", delta: -5 });
  });
});
