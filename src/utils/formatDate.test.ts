import { describe, it, expect } from "vitest";

import { formatDateLong, formatDateShort } from "./formatDate";

describe("formatDateLong", () => {
  it("formats an ISO date as a long date string", () => {
    expect(formatDateLong("2026-06-28")).toBe("June 28, 2026");
  });

  it("does not shift the day behind UTC (timezone bug regression)", () => {
    expect(formatDateLong("2026-06-20")).toBe("June 20, 2026");
    expect(formatDateLong("2026-01-01")).toBe("January 1, 2026");
    expect(formatDateLong("2026-12-31")).toBe("December 31, 2026");
  });

  it("returns the input unchanged for an invalid date", () => {
    expect(formatDateLong("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateShort", () => {
  it("formats an ISO date as a short date string", () => {
    expect(formatDateShort("2026-06-28")).toBe("Jun 28, 2026");
  });

  it("does not shift the day behind UTC (timezone bug regression)", () => {
    expect(formatDateShort("2026-06-20")).toBe("Jun 20, 2026");
  });

  it("returns the input unchanged for an invalid date", () => {
    expect(formatDateShort("not-a-date")).toBe("not-a-date");
  });
});
