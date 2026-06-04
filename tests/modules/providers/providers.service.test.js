import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMyProfile,
  updateProfile,
  search,
  getPublicProfile,
} from "../../../src/modules/providers/providers.service.js";
import {
  findProviderByUserId,
  updateProviderProfile,
  getProviderProfileCompletion,
  searchProviders,
  getPublicProviderProfile,
} from "../../../src/modules/providers/providers.repository.js";

// Mock repository functions
vi.mock("../../../src/modules/providers/providers.repository.js", () => ({
  findProviderByUserId: vi.fn(),
  updateProviderProfile: vi.fn(),
  getProviderProfileCompletion: vi.fn(),
  searchProviders: vi.fn(),
  getPublicProviderProfile: vi.fn(),
}));

describe("Providers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyProfile", () => {
    it("should return the provider profile and completion percentage", async () => {
      const mockProvider = { user_id: "user-123", bio: "Developer bio" };
      vi.mocked(findProviderByUserId).mockResolvedValue(mockProvider);
      vi.mocked(getProviderProfileCompletion).mockResolvedValue("87.5");

      const result = await getMyProfile("user-123");

      expect(findProviderByUserId).toHaveBeenCalledWith("user-123");
      expect(getProviderProfileCompletion).toHaveBeenCalledWith("user-123");
      expect(result).toEqual({
        user_id: "user-123",
        bio: "Developer bio",
        profile_completion: 87.5,
      });
    });

    it("should throw 404 error if provider profile is not found", async () => {
      vi.mocked(findProviderByUserId).mockResolvedValue(null);

      await expect(getMyProfile("nonexistent")).rejects.toThrowError("Perfil de prestador no encontrado");

      try {
        await getMyProfile("nonexistent");
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });
  });

  describe("updateProfile", () => {
    it("should update profile, normalize mainCategory to uppercase, and return updated profile with completion", async () => {
      const mockProvider = { user_id: "user-123" };
      const mockUpdated = { user_id: "user-123", bio: "updated bio", main_category: "TECNOLOGIA" };
      
      vi.mocked(findProviderByUserId).mockResolvedValue(mockProvider);
      vi.mocked(updateProviderProfile).mockResolvedValue(mockUpdated);
      vi.mocked(getProviderProfileCompletion).mockResolvedValue("100");

      const updateData = {
        bio: "updated bio",
        mainCategory: "tecnologia", // lowercase
      };

      const result = await updateProfile("user-123", updateData);

      expect(findProviderByUserId).toHaveBeenCalledWith("user-123");
      expect(updateData.mainCategory).toBe("TECNOLOGIA"); // Normalization check
      expect(updateProviderProfile).toHaveBeenCalledWith("user-123", {
        bio: "updated bio",
        mainCategory: "TECNOLOGIA",
      });
      expect(getProviderProfileCompletion).toHaveBeenCalledWith("user-123");
      expect(result).toEqual({
        user_id: "user-123",
        bio: "updated bio",
        main_category: "TECNOLOGIA",
        profile_completion: 100,
      });
    });

    it("should throw 404 error if provider profile to update is not found", async () => {
      vi.mocked(findProviderByUserId).mockResolvedValue(null);

      await expect(updateProfile("nonexistent", {})).rejects.toThrowError("Perfil de prestador no encontrado");

      try {
        await updateProfile("nonexistent", {});
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });
  });

  describe("search", () => {
    it("should call searchProviders repo function and return result", async () => {
      const mockProvidersList = [{ user_id: "1" }, { user_id: "2" }];
      vi.mocked(searchProviders).mockResolvedValue(mockProvidersList);

      const filters = { category: "TECNOLOGIA" };
      const result = await search(filters);

      expect(searchProviders).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockProvidersList);
    });
  });

  describe("getPublicProfile", () => {
    it("should return the public provider profile and completion percentage", async () => {
      const mockPublicProvider = { user_id: "user-123", name: "John Doe" };
      vi.mocked(getPublicProviderProfile).mockResolvedValue(mockPublicProvider);
      vi.mocked(getProviderProfileCompletion).mockResolvedValue("50.0");

      const result = await getPublicProfile("user-123");

      expect(getPublicProviderProfile).toHaveBeenCalledWith("user-123");
      expect(getProviderProfileCompletion).toHaveBeenCalledWith("user-123");
      expect(result).toEqual({
        user_id: "user-123",
        name: "John Doe",
        profile_completion: 50,
      });
    });

    it("should throw 404 error if public provider profile is not found", async () => {
      vi.mocked(getPublicProviderProfile).mockResolvedValue(null);

      await expect(getPublicProfile("nonexistent")).rejects.toThrowError("Prestador no encontrado");

      try {
        await getPublicProfile("nonexistent");
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });
  });
});
