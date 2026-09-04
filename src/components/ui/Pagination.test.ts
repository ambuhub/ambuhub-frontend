import { describe, expect, it } from "vitest";
import { buildPageWindow } from "./Pagination";

describe("buildPageWindow", () => {
  it("lists every page when they all fit", () => {
    expect(buildPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns a single page", () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
  });

  it("returns nothing for zero pages", () => {
    expect(buildPageWindow(1, 0)).toEqual([]);
  });

  it("collapses the tail when near the start", () => {
    const pages = buildPageWindow(1, 20);
    expect(pages[0]).toBe(1);
    expect(pages).toContain("gap");
    expect(pages[pages.length - 1]).toBe(20);
  });

  it("collapses the head when near the end", () => {
    const pages = buildPageWindow(20, 20);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(20);
    expect(pages).toContain("gap");
  });

  it("keeps first, last and current reachable in the middle", () => {
    const pages = buildPageWindow(10, 20);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(20);
    expect(pages).toContain(10);
    expect(pages.filter((p) => p === "gap")).toHaveLength(2);
  });

  it("never exceeds the button budget by more than the two ellipses", () => {
    for (let current = 1; current <= 50; current += 1) {
      const pages = buildPageWindow(current, 50);
      const numbers = pages.filter((p) => p !== "gap");
      expect(numbers.length).toBeLessThanOrEqual(7);
    }
  });

  it("always includes the current page", () => {
    for (let current = 1; current <= 30; current += 1) {
      expect(buildPageWindow(current, 30)).toContain(current);
    }
  });

  it("never emits duplicate page numbers", () => {
    for (let current = 1; current <= 30; current += 1) {
      const numbers = buildPageWindow(current, 30).filter(
        (p): p is number => p !== "gap",
      );
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });

  it("keeps pages in ascending order", () => {
    for (let current = 1; current <= 30; current += 1) {
      const numbers = buildPageWindow(current, 30).filter(
        (p): p is number => p !== "gap",
      );
      expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
    }
  });

  it("never places a gap where pages are actually consecutive", () => {
    for (let current = 1; current <= 30; current += 1) {
      const pages = buildPageWindow(current, 30);
      pages.forEach((page, i) => {
        if (page !== "gap") return;
        const before = pages[i - 1] as number;
        const after = pages[i + 1] as number;
        expect(after - before).toBeGreaterThan(1);
      });
    }
  });
});
