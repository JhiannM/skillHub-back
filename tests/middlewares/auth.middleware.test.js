import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate, optionalAuthenticate, authorize } from "../../src/middlewares/auth.middleware.js";
import { verifyToken } from "../../src/config/jwt.js";
import { errorResponse } from "../../src/utils/response.js";

// Mock jwt and response utils
vi.mock("../../src/config/jwt.js", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("../../src/utils/response.js", () => ({
  errorResponse: vi.fn(),
}));

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("authenticate", () => {
    it("should return 401 if Authorization header is missing", () => {
      authenticate(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "No autorizado. Token no proporcionado",
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if Authorization header does not start with Bearer", () => {
      req.headers.authorization = "Basic somehash";

      authenticate(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "No autorizado. Token no proporcionado",
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should set req.user and call next if token is valid", () => {
      req.headers.authorization = "Bearer validtoken";
      const payload = { id: 1, role: "PROVIDER" };
      vi.mocked(verifyToken).mockReturnValue(payload);

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("validtoken");
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
      expect(errorResponse).not.toHaveBeenCalled();
    });

    it("should return 401 if token validation throws an error", () => {
      req.headers.authorization = "Bearer invalidtoken";
      vi.mocked(verifyToken).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticate(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, "Token invalido o expirado", 401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuthenticate", () => {
    it("should call next and not set user if authorization header is missing", () => {
      optionalAuthenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(errorResponse).not.toHaveBeenCalled();
    });

    it("should set user and call next if authorization header contains valid token", () => {
      req.headers.authorization = "Bearer validtoken";
      const payload = { id: 2, role: "CUSTOMER" };
      vi.mocked(verifyToken).mockReturnValue(payload);

      optionalAuthenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("validtoken");
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if token is present but invalid", () => {
      req.headers.authorization = "Bearer invalidtoken";
      vi.mocked(verifyToken).mockImplementation(() => {
        throw new Error("Expired");
      });

      optionalAuthenticate(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, "Token invalido o expirado", 401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authorize", () => {
    it("should return 403 if req.user is missing", () => {
      const middleware = authorize("ADMIN", "PROVIDER");
      middleware(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "No tienes permisos para realizar esta accion",
        403
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if req.user.role is not allowed", () => {
      req.user = { id: 1, role: "CUSTOMER" };
      const middleware = authorize("PROVIDER");
      middleware(req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "No tienes permisos para realizar esta accion",
        403
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next if req.user.role is allowed", () => {
      req.user = { id: 1, role: "PROVIDER" };
      const middleware = authorize("CUSTOMER", "PROVIDER");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(errorResponse).not.toHaveBeenCalled();
    });
  });
});
