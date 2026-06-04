import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMyProfile,
  updateProfile,
  searchProviders,
  getPublicProfile,
} from "../../../src/modules/providers/providers.controller.js";
import * as providersService from "../../../src/modules/providers/providers.service.js";
import { successResponse } from "../../../src/utils/response.js";

// Mock service and response helper
vi.mock("../../../src/modules/providers/providers.service.js", () => ({
  getMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  search: vi.fn(),
  getPublicProfile: vi.fn(),
}));

vi.mock("../../../src/utils/response.js", () => ({
  successResponse: vi.fn(),
}));

describe("Providers Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      user: { id: "user-123", role: "PROVIDER" },
      body: {},
      query: {},
      params: {},
    };
    res = {};
    next = vi.fn();
  });

  describe("getMyProfile", () => {
    it("should call providersService.getMyProfile and return successResponse", async () => {
      const mockProfile = { user_id: "user-123", bio: "Bio info", profile_completion: 80 };
      vi.mocked(providersService.getMyProfile).mockResolvedValue(mockProfile);

      await getMyProfile(req, res, next);

      expect(providersService.getMyProfile).toHaveBeenCalledWith("user-123");
      expect(successResponse).toHaveBeenCalledWith(res, "Perfil obtenido", mockProfile);
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass error to next middleware if getMyProfile throws", async () => {
      const error = new Error("Failed to get profile");
      vi.mocked(providersService.getMyProfile).mockRejectedValue(error);

      await getMyProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should call providersService.updateProfile with destructured body and return successResponse", async () => {
      req.body = {
        phone: "123456789",
        city: "Madrid",
        bio: "Bio",
        skills: ["JS"],
        portfolioUrl: "http://portfolio.com",
        schedule: {},
        basePrice: 5000,
        serviceDescription: "desc",
        mainCategory: "TECNOLOGIA",
        yearsExperience: 2,
      };

      const mockProfile = { user_id: "user-123", ...req.body, profile_completion: 90 };
      vi.mocked(providersService.updateProfile).mockResolvedValue(mockProfile);

      await updateProfile(req, res, next);

      expect(providersService.updateProfile).toHaveBeenCalledWith("user-123", req.body);
      expect(successResponse).toHaveBeenCalledWith(res, "Perfil actualizado exitosamente", mockProfile);
    });

    it("should pass error to next middleware if updateProfile throws", async () => {
      const error = new Error("Failed to update");
      vi.mocked(providersService.updateProfile).mockRejectedValue(error);

      await updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("searchProviders", () => {
    it("should call providersService.search with search filters and paginate correctly", async () => {
      req.query = {
        category: "TECNOLOGIA",
        city: "Bogota",
        keyword: "js",
        minPrice: "1000",
        maxPrice: "5000",
        page: "2",
        limit: "10",
      };

      const mockProvidersList = [{ user_id: "p1" }];
      vi.mocked(providersService.search).mockResolvedValue(mockProvidersList);

      await searchProviders(req, res, next);

      expect(providersService.search).toHaveBeenCalledWith({
        category: "TECNOLOGIA",
        city: "Bogota",
        keyword: "js",
        minPrice: 1000,
        maxPrice: 5000,
        limit: 10,
        offset: 10, // (2 - 1) * 10
        excludeProviderId: "user-123", // since req.user.role is PROVIDER
      });

      expect(successResponse).toHaveBeenCalledWith(res, "Prestadores encontrados", {
        providers: mockProvidersList,
        page: 2,
        limit: 10,
      });
    });

    it("should default page to 1, limit to 20, and handle null excludeProviderId when role is CUSTOMER", async () => {
      req.user = { id: "user-456", role: "CUSTOMER" };
      req.query = {}; // empty query

      vi.mocked(providersService.search).mockResolvedValue([]);

      await searchProviders(req, res, next);

      expect(providersService.search).toHaveBeenCalledWith({
        category: undefined,
        city: undefined,
        keyword: undefined,
        minPrice: null,
        maxPrice: null,
        limit: 20,
        offset: 0,
        excludeProviderId: null,
      });
    });

    it("should pass error to next middleware if search throws", async () => {
      const error = new Error("Search failed");
      vi.mocked(providersService.search).mockRejectedValue(error);

      await searchProviders(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getPublicProfile", () => {
    it("should call providersService.getPublicProfile with param providerId and return successResponse", async () => {
      req.params = { providerId: "provider-xyz" };
      const mockProfile = { name: "Jane" };
      vi.mocked(providersService.getPublicProfile).mockResolvedValue(mockProfile);

      await getPublicProfile(req, res, next);

      expect(providersService.getPublicProfile).toHaveBeenCalledWith("provider-xyz");
      expect(successResponse).toHaveBeenCalledWith(res, "Perfil del prestador obtenido", mockProfile);
    });

    it("should pass error to next middleware if getPublicProfile throws", async () => {
      const error = new Error("Not found");
      vi.mocked(providersService.getPublicProfile).mockRejectedValue(error);

      await getPublicProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
