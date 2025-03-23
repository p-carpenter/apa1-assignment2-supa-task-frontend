import {
  generateSlug,
  findIncidentBySlug,
  getIncidentIndexBySlug,
} from "@/app/utils/navigation/slugUtils.js";

describe("Slug Utilities", () => {
  // Test generateSlug function
  describe("generateSlug", () => {
    it("converts a string to a valid slug using first two words", () => {
      expect(generateSlug("Hello World Example")).toBe("hello-world");
      expect(generateSlug("Tech Incident 123")).toBe("tech-incident");
      expect(generateSlug("One Two Three Four")).toBe("one-two");
    });

    it("handles special characters", () => {
      expect(generateSlug("Special@#Characters! Test")).toBe(
        "specialcharacters-test"
      );
      expect(generateSlug("Weird$%^ Symbols&*()")).toBe("weird-symbols");
    });

    it("handles extra spaces", () => {
      expect(generateSlug("  Extra   Spaces   Here  ")).toBe("extra-spaces");
      expect(generateSlug(" Single  Word ")).toBe("single-word");
    });

    it("handles single word input", () => {
      expect(generateSlug("SingleWord")).toBe("singleword");
    });

    it("handles empty strings and non-string input", () => {
      expect(generateSlug("")).toBe("unknown");
      expect(generateSlug(null)).toBe("unknown");
      expect(generateSlug(undefined)).toBe("unknown");
      expect(generateSlug(123)).toBe("123");
      expect(generateSlug({})).toBe("object-object");
    });
  });

  // Test findIncidentBySlug function
  describe("findIncidentBySlug", () => {
    const mockIncidents = [
      { id: 1, name: "Test Incident One" },
      { id: 2, name: "Test Incident Two" },
      { id: 3, name: "Another Incident" },
      { id: 4, name: "Similar Start Word" },
    ];

    it("finds incident by exact slug match", () => {
      expect(findIncidentBySlug(mockIncidents, "test-incident")).toEqual(
        mockIncidents[0]
      );
      expect(findIncidentBySlug(mockIncidents, "another-incident")).toEqual(
        mockIncidents[2]
      );
    });

    it("returns null when no match is found", () => {
      expect(findIncidentBySlug(mockIncidents, "non-existent-slug")).toBeNull();
    });

    it("handles empty input", () => {
      expect(findIncidentBySlug([], "test-incident")).toBeNull();
      expect(findIncidentBySlug(null, "test-incident")).toBeNull();
      expect(findIncidentBySlug(mockIncidents, "")).toBeNull();
      expect(findIncidentBySlug(mockIncidents, null)).toBeNull();
    });

    it("finds incident by first word of slug if exact match fails", () => {
      // This tests the partial matching fallback feature
      expect(findIncidentBySlug(mockIncidents, "test-something-else")).toEqual(
        mockIncidents[0]
      );
      expect(findIncidentBySlug(mockIncidents, "similar-not-matching")).toEqual(
        mockIncidents[3]
      );
    });

    it("returns first incident that matches partial slug if multiple matches exist", () => {
      // Both "Test Incident One" and "Test Incident Two" start with "test"
      expect(findIncidentBySlug(mockIncidents, "test")).toEqual(
        mockIncidents[0]
      );
    });
  });

  // Test getIncidentIndexBySlug function
  describe("getIncidentIndexBySlug", () => {
    const mockIncidents = [
      { id: 1, name: "Test Incident One" },
      { id: 2, name: "Test Incident Two" },
      { id: 3, name: "Another Incident" },
    ];

    it("returns the correct index for an exact match", () => {
      expect(getIncidentIndexBySlug(mockIncidents, "test-incident")).toBe(0);
      expect(getIncidentIndexBySlug(mockIncidents, "another-incident")).toBe(2);
    });

    it("returns the correct index for a partial match", () => {
      expect(getIncidentIndexBySlug(mockIncidents, "test-something")).toBe(0);
    });

    it("returns -1 when no match is found", () => {
      expect(getIncidentIndexBySlug(mockIncidents, "non-existent-slug")).toBe(
        -1
      );
    });

    it("handles empty input", () => {
      expect(getIncidentIndexBySlug([], "test-incident")).toBe(-1);
      expect(getIncidentIndexBySlug(null, "test-incident")).toBe(-1);
      expect(getIncidentIndexBySlug(mockIncidents, "")).toBe(-1);
      expect(getIncidentIndexBySlug(mockIncidents, null)).toBe(-1);
    });
  });
});
