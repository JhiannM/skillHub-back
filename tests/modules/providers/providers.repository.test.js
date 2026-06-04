import { describe, it, expect, vi, beforeEach } from "vitest";
import pool from "../../../src/config/database.js";
import {
  findProviderByUserId,
  updateProviderProfile,
  getProviderProfileCompletion,
  searchProviders,
  getPublicProviderProfile,
} from "../../../src/modules/providers/providers.repository.js";

// Mock the database pool
vi.mock("../../../src/config/database.js", () => {
  return {
    default: {
      query: vi.fn(),
    },
  };
});

describe("Providers Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findProviderByUserId", () => {
    it("should query provider details by user id", async () => {
      const mockProvider = { user_id: "1", bio: "Bio info" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockProvider] });

      const result = await findProviderByUserId("1");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM providers p"),
        ["1"]
      );
      expect(result).toEqual(mockProvider);
    });
  });

  describe("updateProviderProfile", () => {
    it("should call UPDATE query with correct params and handle skills/schedule json stringification", async () => {
      const mockResult = { user_id: "1", bio: "Updated bio" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockResult] });

      const updateData = {
        phone: "987654321",
        city: "Madrid",
        bio: "Updated bio",
        skills: ["JS", "Node"],
        portfolioUrl: "http://portfolio.com",
        schedule: { Lunes: { enabled: true, inicio: "09:00", fin: "17:00" } },
        basePrice: 50000,
        serviceDescription: "Coding services",
        mainCategory: "TECNOLOGIA",
        yearsExperience: 5,
      };

      const result = await updateProviderProfile("1", updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE providers SET"),
        [
          "1",
          "987654321",
          "Madrid",
          "Updated bio",
          JSON.stringify(["JS", "Node"]),
          "http://portfolio.com",
          JSON.stringify({ Lunes: { enabled: true, inicio: "09:00", fin: "17:00" } }),
          50000,
          "Coding services",
          "TECNOLOGIA",
          5,
        ]
      );
      expect(result).toEqual(mockResult);
    });

    it("should pass null values as is without json stringifying them", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [{ user_id: "1" }] });

      await updateProviderProfile("1", {
        phone: null,
        city: null,
        bio: null,
        skills: null,
        portfolioUrl: null,
        schedule: null,
        basePrice: null,
        serviceDescription: null,
        mainCategory: null,
        yearsExperience: null,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["1", null, null, null, null, null, null, null, null, null, null]
      );
    });
  });

  describe("getProviderProfileCompletion", () => {
    it("should query completion percentage and return it", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [{ completion_percentage: 75 }] });

      const result = await getProviderProfileCompletion("1");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("AS completion_percentage"),
        ["1"]
      );
      expect(result).toBe(75);
    });

    it("should return 0 if no row is returned", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] });

      const result = await getProviderProfileCompletion("1");

      expect(result).toBe(0);
    });
  });

  describe("searchProviders", () => {
    it("should build search query with default limits and offset when no filters are provided", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] });

      await searchProviders({});

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY relevance_score DESC"),
        [20, 0] // Default limit = 20, offset = 0
      );
    });

    it("should build search query with all filters", async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] });

      await searchProviders({
        category: "TECNOLOGIA",
        city: "Bogota",
        keyword: "developer",
        minPrice: 10000,
        maxPrice: 50000,
        limit: 10,
        offset: 5,
        excludeProviderId: "provider-123",
      });

      // Assert that conditions for each filter are present in the SQL query
      const lastCallArgs = vi.mocked(pool.query).mock.calls[0];
      const sqlQuery = lastCallArgs[0];
      const sqlParams = lastCallArgs[1];

      expect(sqlQuery).toContain("p.user_id != $1");
      expect(sqlQuery).toContain("p.main_category = $2");
      expect(sqlQuery).toContain("LOWER(p.city) = LOWER($3)");
      expect(sqlQuery).toContain("LOWER(u.name) LIKE $4");
      expect(sqlQuery).toContain("p.base_price >= $5");
      expect(sqlQuery).toContain("p.base_price <= $6");

      expect(sqlParams).toEqual([
        "provider-123",
        "TECNOLOGIA",
        "Bogota",
        "%developer%",
        10000,
        50000,
        10,
        5,
      ]);
    });
  });

  describe("getPublicProviderProfile", () => {
    it("should select public fields for provider", async () => {
      const mockPublicProfile = { user_id: "1", name: "John", email: "john@example.com" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockPublicProfile] });

      const result = await getPublicProviderProfile("1");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("portfolio_url"),
        ["1"]
      );
      expect(result).toEqual(mockPublicProfile);
    });
  });
});
