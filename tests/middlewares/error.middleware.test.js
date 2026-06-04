import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorMiddleware } from "../../src/middlewares/error.middleware.js";
import { errorResponse } from "../../src/utils/response.js";

vi.mock("../../src/utils/response.js", () => ({
  errorResponse: vi.fn(),
}));

describe("Error Middleware", () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    // Suppress console.error during tests to avoid cluttered logs
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it("should handle express-validator errors", () => {
    const mockErrors = [{ path: "email", msg: "Invalid email" }];
    const err = {
      array: vi.fn().mockReturnValue(mockErrors),
    };

    errorMiddleware(err, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, "Error de validacion", 400, mockErrors);
  });

  it("should handle JsonWebTokenError", () => {
    const err = { name: "JsonWebTokenError" };

    errorMiddleware(err, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, "Token invalido", 401);
  });

  it("should handle TokenExpiredError", () => {
    const err = { name: "TokenExpiredError" };

    errorMiddleware(err, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, "Token expirado", 401);
  });

  it("should handle generic custom status errors (e.g., 404) without stack trace when not in development", () => {
    process.env.NODE_ENV = "production";
    const err = {
      statusCode: 404,
      message: "Resource not found",
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found",
      data: null,
    });
  });

  it("should handle generic custom status errors (e.g., 400) with default message", () => {
    process.env.NODE_ENV = "production";
    const err = {
      statusCode: 400,
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error en la solicitud",
      data: null,
    });
  });

  it("should return 500 Internal Server Error for unhandled errors", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("Database went away");

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error interno del servidor",
      data: null,
    });
  });

  it("should include stack trace in development environment", () => {
    process.env.NODE_ENV = "development";
    const err = new Error("Database went away");
    err.stack = "Error stack trace";

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error interno del servidor",
      data: {
        stack: "Error stack trace",
      },
    });
  });
});
