import {
  formatDateForDisplay,
  parseDate,
  formatDateInput,
} from "@/app/utils/formatting/dateUtils";

describe("Date Utils", () => {
  describe("formatDateForDisplay", () => {
    it("formats a valid ISO date string correctly", () => {
      expect(formatDateForDisplay("2023-05-15T12:34:56.000Z")).toBe("15 May 2023");
    });

    it("formats a Date object correctly", () => {
      expect(formatDateForDisplay(new Date(2023, 4, 15))).toBe("15 May 2023");
    });

    it("formats a timestamp number correctly", () => {
      const timestamp = new Date(2023, 4, 15).getTime();
      expect(formatDateForDisplay(timestamp)).toBe("15 May 2023");
    });

    it("handles DD-MM-YYYY format string correctly", () => {
      expect(formatDateForDisplay("15-05-2023")).toBe("15 May 2023");
    });

    it("returns empty string for invalid date string", () => {
      expect(formatDateForDisplay("invalid-date")).toBe("");
    });

    it("returns empty string for empty input", () => {
      expect(formatDateForDisplay("")).toBe("");
      expect(formatDateForDisplay(null)).toBe("");
      expect(formatDateForDisplay(undefined)).toBe("");
    });

    it("handles edge cases with date boundaries", () => {
      // Year boundary
      expect(formatDateForDisplay("2023-12-31")).toBe("31 December 2023");
      expect(formatDateForDisplay("2024-01-01")).toBe("1 January 2024");
      
      // Month with 30 days
      expect(formatDateForDisplay("2023-04-30")).toBe("30 April 2023");
      
      // February in leap year
      expect(formatDateForDisplay("2024-02-29")).toBe("29 February 2024");
      
      // February in non-leap year (should be handled gracefully by JS Date)
      expect(formatDateForDisplay("2023-02-29")).not.toBe("29 February 2023");
    });
  });

  describe("parseDate", () => {
    it("parses valid DD-MM-YYYY format correctly", () => {
      const result = parseDate("15-05-2023");
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(4); // 0-based index, so May is 4
      expect(result.getDate()).toBe(15);
    });

    it("returns null for invalid format", () => {
      expect(parseDate("2023-05-15")).toBeNull(); // ISO format not supported
      expect(parseDate("15/05/2023")).toBeNull(); // Wrong separator
      expect(parseDate("invalid")).toBeNull();
    });

    it("returns null for empty or null input", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    it("returns null for invalid dates", () => {
      // Day out of range
      expect(parseDate("32-05-2023")).toBeNull();
      // Month out of range
      expect(parseDate("15-13-2023")).toBeNull();
      // February 30th doesn't exist
      expect(parseDate("30-02-2023")).toBeNull();
      // February 29th in non-leap year
      expect(parseDate("29-02-2023")).toBeNull();
    });

    it("handles valid edge cases", () => {
      // Last day of year
      const lastDayOfYear = parseDate("31-12-2023");
      expect(lastDayOfYear.getFullYear()).toBe(2023);
      expect(lastDayOfYear.getMonth()).toBe(11);
      expect(lastDayOfYear.getDate()).toBe(31);

      // February 29th in leap year
      const leapDay = parseDate("29-02-2024");
      expect(leapDay.getFullYear()).toBe(2024);
      expect(leapDay.getMonth()).toBe(1);
      expect(leapDay.getDate()).toBe(29);

      // First day of year
      const firstDayOfYear = parseDate("01-01-2023");
      expect(firstDayOfYear.getFullYear()).toBe(2023);
      expect(firstDayOfYear.getMonth()).toBe(0);
      expect(firstDayOfYear.getDate()).toBe(1);
    });
  });

  describe("formatDateInput", () => {
    it("formats digits with hyphens in DD-MM-YYYY format", () => {
      expect(formatDateInput("15052023")).toBe("15-05-2023");
      expect(formatDateInput("150520")).toBe("15-05-20");
      expect(formatDateInput("1505")).toBe("15-05");
      expect(formatDateInput("15")).toBe("15");
    });

    it("strips non-digit characters before formatting", () => {
      expect(formatDateInput("15/05/2023")).toBe("15-05-2023");
      expect(formatDateInput("15.05.2023")).toBe("15-05-2023");
      expect(formatDateInput("15 05 2023")).toBe("15-05-2023");
    });

    it("converts ISO date format to DD-MM-YYYY", () => {
      expect(formatDateInput("2023-05-15")).toBe("15-05-2023");
      expect(formatDateInput("2023-05-15T12:34:56.000Z")).toBe("15-05-2023");
    });

    it("returns empty string for empty input", () => {
      expect(formatDateInput("")).toBe("");
      expect(formatDateInput(null)).toBe("");
      expect(formatDateInput(undefined)).toBe("");
    });

    it("handles partial ISO dates", () => {
      // These aren't valid ISO dates but have similar patterns
      expect(formatDateInput("2023-5-")).not.toBe("05-05-2023");
      expect(formatDateInput("2023-5")).not.toBe("05-05-2023");
    });

    it("handles progressive input as user types", () => {
      expect(formatDateInput("1")).toBe("1");
      expect(formatDateInput("15")).toBe("15");
      expect(formatDateInput("150")).toBe("15-0");
      expect(formatDateInput("1505")).toBe("15-05");
      expect(formatDateInput("15052")).toBe("15-05-2");
      expect(formatDateInput("150520")).toBe("15-05-20");
      expect(formatDateInput("1505202")).toBe("15-05-202");
      expect(formatDateInput("15052023")).toBe("15-05-2023");
    });

    it("handles overlong input gracefully", () => {
      expect(formatDateInput("150520231")).toBe("15-05-2023");
      expect(formatDateInput("150520231234")).toBe("15-05-2023");
    });
  });
});
