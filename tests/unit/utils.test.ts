import { describe, it, expect } from "vitest";
import { formatDate, createHeadings } from "$lib/utils";

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

describe("createHeadings", () => {
    it("returns empty array for empty TOC", () => {
        expect(createHeadings([])).toEqual([]);
    });

    it("creates a flat structure for same-level headings", () => {
        const toc = [
            { id: "h1", text: "H1", level: 1 },
            { id: "h2", text: "H2", level: 1 },
        ];
        const result = createHeadings(toc);
        expect(result).toHaveLength(2);
        expect(result[0].children).toHaveLength(0);
        expect(result[1].children).toHaveLength(0);
    });

    it("nests lower-level headings under higher-level ones", () => {
        const toc = [
            { id: "h1", text: "H1", level: 1 },
            { id: "h1-1", text: "H1-1", level: 2 },
            { id: "h1-2", text: "H1-2", level: 2 },
            { id: "h2", text: "H2", level: 1 },
        ];
        const result = createHeadings(toc);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("h1");
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0].id).toBe("h1-1");
        expect(result[0].children[1].id).toBe("h1-2");
        expect(result[1].id).toBe("h2");
        expect(result[1].children).toHaveLength(0);
    });

    it("handles deeply nested headings", () => {
        const toc = [
            { id: "1", text: "1", level: 1 },
            { id: "1.1", text: "1.1", level: 2 },
            { id: "1.1.1", text: "1.1.1", level: 3 },
        ];
        const result = createHeadings(toc);
        expect(result[0].children[0].children[0].id).toBe("1.1.1");
    });
});
