import {
  formatDate,
  formatYear,
  extractYearFromDate,
} from "@/app/utils/formatting/dateUtils";

describe("Date Formatter Utils", () => {
  describe("formatDate", () => {
    it("formats date in the desired format", () => {
      const testDate = "2020-05-15T12:34:56.000Z";
      const formattedDate = formatDate(testDate);

      // Check format is as expected (e.g., "May 15, 2020")
      expect(formattedDate).toMatch(/May 15, 2020/);
    });

    it("handles different date input formats", () => {
      // ISO string
      expect(formatDate("2020-05-15T00:00:00.000Z")).toMatch(/May 15, 2020/);

      // Date object
      expect(formatDate(new Date(2020, 4, 15))).toMatch(/May 15, 2020/);
    });

    it("returns placeholder for invalid dates", () => {
      expect(formatDate("")).toBe("Unknown date");
      expect(formatDate(null)).toBe("Unknown date");
      expect(formatDate("invalid-date")).toBe("Unknown date");
    });

    it("applies custom formatting when specified", () => {
      const testDate = "2020-05-15T12:34:56.000Z";

      // Test with custom format
      const customFormat = formatDate(testDate, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      expect(customFormat).toMatch(/May 15, 2020/);
    });
  });

  describe("formatYear", () => {
    it("extracts and formats the year from a date", () => {
      expect(formatYear("2020-05-15T12:34:56.000Z")).toBe("2020");
    });

    it("returns placeholder for invalid dates", () => {
      expect(formatYear("")).toBe("Unknown");
      expect(formatYear(null)).toBe("Unknown");
      expect(formatYear("invalid-date")).toBe("Unknown");
    });
  });

  describe("extractYearFromDate", () => {
    it("extracts year as number from date string", () => {
      expect(extractYearFromDate("2020-05-15T12:34:56.000Z")).toBe(2020);
    });

    it("handles date objects", () => {
      expect(extractYearFromDate(new Date(2020, 4, 15))).toBe(2020);
    });

    it("returns null for invalid dates", () => {
      expect(extractYearFromDate("")).toBeNull();
      expect(extractYearFromDate(null)).toBeNull();
      expect(extractYearFromDate("invalid-date")).toBeNull();
    });
  });
});
