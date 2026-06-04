import { describe, it, expect, vi, beforeEach } from "vitest";
import { roleMiddleware } from "../../src/middlewares/role.middleware.js";
import { errorResponse } from "../../src/utils/response.js";

vi.mock("../../src/utils/response.js", () => ({
  errorResponse: vi.fn(),
}));

describe("Role Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {};
    res = {};
    next = vi.fn();
  });

  it("should return 401 if req.user is missing or role is missing", () => {
    const middleware = roleMiddleware(["PROVIDER"]);
    middleware(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, "Rol de usuario no encontrado", 401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if user role is not in the allowed roles list", () => {
    req.user = { role: "CUSTOMER" };
    const middleware = roleMiddleware(["PROVIDER", "ADMIN"]);
    middleware(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, "No tienes permisos para acceder a este recurso", 403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user role is in the allowed list", () => {
    req.user = { role: "PROVIDER" };
    const middleware = roleMiddleware(["PROVIDER", "ADMIN"]);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(errorResponse).not.toHaveBeenCalled();
  });
});
