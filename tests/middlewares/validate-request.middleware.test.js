import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateRequest } from "../../src/middlewares/validate-request.middleware.js";
import { validationResult } from "express-validator";
import { errorResponse } from "../../src/utils/response.js";

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
}));

vi.mock("../../src/utils/response.js", () => ({
  errorResponse: vi.fn(),
}));

describe("Validate Request Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {};
    res = {};
    next = vi.fn();
  });

  it("should call next if there are no validation errors", () => {
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(errorResponse).not.toHaveBeenCalled();
  });

  it("should return 400 with formatted errors if validation errors exist", () => {
    const rawErrors = [
      { path: "email", msg: "Invalid email value" },
      { path: "password", msg: "Password too short" },
    ];
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => false,
      array: () => rawErrors,
    });

    validateRequest(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Errores de validación",
      400,
      [
        { field: "email", message: "Invalid email value" },
        { field: "password", message: "Password too short" },
      ]
    );
    expect(next).not.toHaveBeenCalled();
  });
});
