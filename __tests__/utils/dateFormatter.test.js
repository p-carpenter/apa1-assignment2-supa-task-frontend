import {
  formatDate,
  extractYear,
  calculateDecade,
} from "@/app/utils/formatting/dateUtils";

describe("Date Formatter Utils", () => {
  describe("formatDate", () => {
    it("formats date in the default (medium) format", () => {
      expect(formatDate("2020-05-15T12:34:56.000Z")).toMatch(/May 15, 2020/);
    });

    it("formats date in short format", () => {
      expect(formatDate("2020-05-15T12:34:56.000Z", "short")).toMatch(
        /5\/15\/2020/
      );
    });

    it("formats date in long format", () => {
      expect(formatDate("2020-05-15T12:34:56.000Z", "long")).toMatch(
        /May 15, 2020/
      );
    });

    it("formats date in full format", () => {
      expect(formatDate("2020-05-15T12:34:56.000Z", "full")).toMatch(
        /Friday, May 15, 2020/
      );
    });

    it("handles different date input formats", () => {
      expect(formatDate("2020-05-15T00:00:00.000Z")).toMatch(/May 15, 2020/);
      expect(formatDate(new Date(2020, 4, 15))).toMatch(/May 15, 2020/);
    });

    it("returns input string when given an invalid date", () => {
      expect(formatDate("invalid-date")).toBe("invalid-date");
    });

    it("returns empty string when given no input", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate(null)).toBe("");
    });
  });

  describe("extractYear", () => {
    it("extracts the correct year from a valid date string", () => {
      expect(extractYear("2020-05-15T12:34:56.000Z")).toBe(2020);
    });

    it("extracts the correct year from a Date object", () => {
      expect(extractYear(new Date(2020, 4, 15))).toBe(2020);
    });

    it("returns null for invalid date strings", () => {
      expect(extractYear("invalid-date")).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(extractYear("")).toBeNull();
      expect(extractYear(null)).toBeNull();
    });
  });

  describe("calculateDecade", () => {
    it("calculates the correct decade from a year string", () => {
      expect(calculateDecade("2020-05-15T12:34:56.000Z")).toBe(2020);
    });

    it("calculates the correct decade from a number", () => {
      expect(calculateDecade(1995)).toBe(1990);
      expect(calculateDecade(2007)).toBe(2000);
      expect(calculateDecade(2023)).toBe(2020);
    });

    it("calculates the correct decade from a Date object", () => {
      expect(calculateDecade(new Date(2007, 6, 15))).toBe(2000);
    });

    it("returns null for invalid date strings", () => {
      expect(calculateDecade("invalid-date")).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(calculateDecade("")).toBeNull();
      expect(calculateDecade(null)).toBeNull();
    });
  });
});
