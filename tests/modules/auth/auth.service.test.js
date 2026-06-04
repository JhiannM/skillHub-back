import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login } from "../../../src/modules/auth/auth.service.js";
import {
  findExistingUserByEmail,
  findUserByEmail,
  createUser,
  createCustomerProfile,
  createProviderProfile,
} from "../../../src/modules/auth/auth.repository.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../src/config/jwt.js";

// Mock the dependencies
vi.mock("../../../src/modules/auth/auth.repository.js", () => ({
  findExistingUserByEmail: vi.fn(),
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  createCustomerProfile: vi.fn(),
  createProviderProfile: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../../../src/config/jwt.js", () => ({
  generateToken: vi.fn(),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user and return user and token", async () => {
      const email = "new@example.com";
      const password = "Password123";
      const name = "New User";
      const role = "CUSTOMER";
      const userId = "uuid-1234";

      vi.mocked(findExistingUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password");
      vi.mocked(createUser).mockResolvedValue({
        id: userId,
        name,
        email,
        role,
      });
      vi.mocked(createCustomerProfile).mockResolvedValue({ user_id: userId });
      vi.mocked(generateToken).mockResolvedValue("jwt_token_abc");

      const result = await register(name, email, password, role);

      expect(findExistingUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(createUser).toHaveBeenCalledWith(
        expect.any(String), // crypto.randomUUID()
        name,
        email,
        "hashed_password",
        role
      );
      expect(createCustomerProfile).toHaveBeenCalledWith(userId, { phone: null, city: null });
      expect(generateToken).toHaveBeenCalledWith({
        id: userId,
        name,
        email,
        role,
      });
      expect(result).toEqual({
        token: "jwt_token_abc",
        user: { name, email, role },
      });
    });

    it("should register a provider and call createProviderProfile", async () => {
      const email = "provider@example.com";
      const password = "Password123";
      const name = "Provider User";
      const role = "PROVIDER";
      const userId = "uuid-5678";

      vi.mocked(findExistingUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password");
      vi.mocked(createUser).mockResolvedValue({
        id: userId,
        name,
        email,
        role,
      });
      vi.mocked(createProviderProfile).mockResolvedValue({ user_id: userId });
      vi.mocked(generateToken).mockResolvedValue("jwt_token_provider");

      const result = await register(name, email, password, role);

      expect(createProviderProfile).toHaveBeenCalledWith(userId, { phone: null, city: null });
      expect(result).toEqual({
        token: "jwt_token_provider",
        user: { name, email, role },
      });
    });

    it("should throw a 409 error if email already exists", async () => {
      vi.mocked(findExistingUserByEmail).mockResolvedValue({ id: "existing-id" });

      await expect(
        register("Name", "existing@example.com", "pass", "CUSTOMER")
      ).rejects.toThrowError("El email ya esta registrado");

      // Verify status code is 409
      try {
        await register("Name", "existing@example.com", "pass", "CUSTOMER");
      } catch (err) {
        expect(err.statusCode).toBe(409);
      }
    });
  });

  describe("login", () => {
    it("should login successfully and return token and user info", async () => {
      const email = "user@example.com";
      const password = "password123";
      const mockUser = {
        id: "1",
        name: "User Name",
        email,
        password: "hashed_password",
        role: "CUSTOMER",
      };

      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      vi.mocked(generateToken).mockResolvedValue("signed_token");

      const result = await login(email, password);

      expect(findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, "hashed_password");
      expect(generateToken).toHaveBeenCalledWith({
        id: "1",
        name: "User Name",
        email,
        role: "CUSTOMER",
      });
      expect(result).toEqual({
        token: "signed_token",
        user: {
          name: "User Name",
          email,
          role: "CUSTOMER",
        },
      });
    });

    it("should throw 401 if user is not found", async () => {
      vi.mocked(findUserByEmail).mockResolvedValue(null);

      await expect(login("notfound@example.com", "pass")).rejects.toThrowError("Credenciales inválidas");

      try {
        await login("notfound@example.com", "pass");
      } catch (err) {
        expect(err.statusCode).toBe(401);
      }
    });

    it("should throw 401 if password does not match", async () => {
      const mockUser = {
        id: "1",
        name: "User",
        email: "user@example.com",
        password: "hashed_password",
        role: "CUSTOMER",
      };
      vi.mocked(findUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      await expect(login("user@example.com", "wrongpass")).rejects.toThrowError("Credenciales inválidas");

      try {
        await login("user@example.com", "wrongpass");
      } catch (err) {
        expect(err.statusCode).toBe(401);
      }
    });
  });
});
