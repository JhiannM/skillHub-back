import { describe, it, expect, vi, beforeEach } from "vitest";
import pool from "../../../src/config/database.js";
import {
  findUserByEmail,
  findExistingUserByEmail,
  createUser,
  createCustomerProfile,
  createProviderProfile,
  roleSpecificInsert,
  findUserById,
} from "../../../src/modules/auth/auth.repository.js";

// Mock the database pool
vi.mock("../../../src/config/database.js", () => {
  return {
    default: {
      query: vi.fn(),
    },
  };
});

describe("Auth Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findUserByEmail", () => {
    it("should query users table by email and return the first row", async () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockUser] });

      const result = await findUserByEmail("test@example.com");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, email, password, role FROM users WHERE email = $1"),
        ["test@example.com"]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("findExistingUserByEmail", () => {
    it("should query users table for existing user checks", async () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockUser] });

      const result = await findExistingUserByEmail("test@example.com");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, email FROM users WHERE email = $1"),
        ["test@example.com"]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("createUser", () => {
    it("should insert user and return user details", async () => {
      const mockUser = { id: "123", name: "John", email: "john@example.com", role: "CUSTOMER" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockUser] });

      const result = await createUser("123", "John", "john@example.com", "hash", "CUSTOMER");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        ["123", "John", "john@example.com", "hash", "CUSTOMER"]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("createCustomerProfile", () => {
    it("should insert customer profile", async () => {
      const mockProfile = { user_id: "123", phone: "12345", city: "City" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockProfile] });

      const result = await createCustomerProfile("123", { phone: "12345", city: "City" });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO customers"),
        ["123", "12345", "City"]
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe("createProviderProfile", () => {
    it("should insert provider profile", async () => {
      const mockProfile = { user_id: "123", phone: "12345", city: "City", bio: "Bio", skills: [], portfolio_url: "url", schedule: {} };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockProfile] });

      const result = await createProviderProfile("123", {
        phone: "12345",
        city: "City",
        bio: "Bio",
        skills: [],
        portfolioUrl: "url",
        schedule: {},
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO providers"),
        ["123", "12345", "City", "Bio", [], "url", {}]
      );
      expect(result).toEqual(mockProfile);
    });
  });

  describe("roleSpecificInsert", () => {
    it("should insert provider record if role is PROVIDER", async () => {
      await roleSpecificInsert("123", "PROVIDER");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO providers (user_id) VALUES ($1)"),
        ["123"]
      );
    });

    it("should insert customer record if role is CUSTOMER", async () => {
      await roleSpecificInsert("123", "CUSTOMER");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO customers (user_id) VALUES ($1)"),
        ["123"]
      );
    });

    it("should do nothing for unknown roles", async () => {
      await roleSpecificInsert("123", "ADMIN");

      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe("findUserById", () => {
    it("should select user by id", async () => {
      const mockUser = { id: "123", name: "John", email: "john@example.com", role: "CUSTOMER" };
      vi.mocked(pool.query).mockResolvedValue({ rows: [mockUser] });

      const result = await findUserById("123");

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, name, email, role FROM users WHERE id = $1"),
        ["123"]
      );
      expect(result).toEqual(mockUser);
    });
  });
});
