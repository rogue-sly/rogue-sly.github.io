import { formatDate } from "$lib/utils/date";
import { describe, it, expect } from "vitest";

describe("formatDate", () => {
    it("formats a standard ISO date string", () => {
        const result = formatDate("2024-01-15");
        expect(result).toContain("January 15, 2024");
    });

    it("handles different date styles", () => {
        const result = formatDate("2024-01-15", "short");
        expect(result).toMatch(/1\/15\/24|15\/01\/2024|24\/01\/15/);
    });

    it("handles hyphens properly (Safari compatibility check)", () => {
        const result = formatDate("2024-12-25");
        expect(result).toContain("December 25, 2024");
    });
});
