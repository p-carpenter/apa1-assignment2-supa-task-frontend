import {
  generateSlug,
  findIncidentBySlug,
} from "@/app/utils/navigation/slugUtils.js";

describe("Slug Utilities", () => {
  // Test generateSlug function
  describe("generateSlug", () => {
    it("converts a string to a valid slug", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
      expect(generateSlug("Tech Incident 123")).toBe("tech-incident-123");
      expect(generateSlug("Special@#Characters!")).toBe("specialcharacters");
    });

    it("handles edge cases", () => {
      expect(generateSlug("")).toBe("");
      expect(generateSlug(null)).toBe("");
      expect(generateSlug(undefined)).toBe("");
    });
  });

  // Test findIncidentBySlug function
  describe("findIncidentBySlug", () => {
    const mockIncidents = [
      { id: 1, name: "Test Incident One" },
      { id: 2, name: "Test Incident Two" },
      { id: 3, name: "Another Incident" },
    ];

    it("finds incident by exact slug match", () => {
      expect(findIncidentBySlug(mockIncidents, "test-incident-one")).toEqual(
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
      expect(findIncidentBySlug([], "test-incident-one")).toBeNull();
      expect(findIncidentBySlug(null, "test-incident-one")).toBeNull();
    });
  });
});
