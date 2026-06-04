import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login } from "../../../src/modules/auth/auth.controller.js";
import * as authService from "../../../src/modules/auth/auth.service.js";
import { successResponse } from "../../../src/utils/response.js";

// Mock service and response helper
vi.mock("../../../src/modules/auth/auth.service.js", () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

vi.mock("../../../src/utils/response.js", () => ({
  successResponse: vi.fn(),
}));

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: {},
    };
    res = {};
    next = vi.fn();
  });

  describe("register", () => {
    it("should call authService.register and send successResponse", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
        role: "CUSTOMER",
      };

      const mockResult = {
        token: "jwt_token",
        user: { name: "Test User", email: "test@example.com", role: "CUSTOMER" },
      };
      vi.mocked(authService.register).mockResolvedValue(mockResult);

      await register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "Password123",
        "CUSTOMER"
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Usuario registrado exitosamente",
        mockResult,
        201
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      req.body = {};
      const mockError = new Error("Validation failed");
      vi.mocked(authService.register).mockRejectedValue(mockError);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should call authService.login and send successResponse", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123",
      };

      const mockResult = {
        token: "jwt_token",
        user: { name: "Test User", email: "test@example.com", role: "CUSTOMER" },
      };
      vi.mocked(authService.login).mockResolvedValue(mockResult);

      await login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith("test@example.com", "Password123");
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Inicio de sesión exitoso",
        mockResult,
        200
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware during login", async () => {
      req.body = {};
      const mockError = new Error("Invalid credentials");
      vi.mocked(authService.login).mockRejectedValue(mockError);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });
});
