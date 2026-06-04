import { describe, it, expect, vi } from "vitest";
import { successResponse, errorResponse } from "../../src/utils/response.js";

describe("Response Utils", () => {
  const createMockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  describe("successResponse", () => {
    it("should send success response with default 200 status code", () => {
      const res = createMockResponse();
      const message = "Success message";
      const data = { id: 1 };

      successResponse(res, message, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it("should send success response with custom status code", () => {
      const res = createMockResponse();
      const message = "Created message";
      const data = { id: 2 };

      successResponse(res, message, data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });
  });

  describe("errorResponse", () => {
    it("should send error response with default 400 status code and null data", () => {
      const res = createMockResponse();
      const message = "Error message";

      errorResponse(res, message);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message,
        data: null,
      });
    });

    it("should send error response with custom status code and custom data", () => {
      const res = createMockResponse();
      const message = "Unauthorized";
      const data = { reason: "Expired token" };

      errorResponse(res, message, 401, data);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message,
        data,
      });
    });
  });
});
