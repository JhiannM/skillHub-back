import { describe, it, expect, vi } from "vitest";

// Mock swagger-jsdoc and swagger-ui-express to avoid heavy dependency loading issues or path issues
vi.mock("swagger-jsdoc", () => {
  return {
    default: vi.fn().mockReturnValue({ openapi: "3.0.0" }),
  };
});

vi.mock("swagger-ui-express", () => {
  return {
    default: {
      serve: [vi.fn()],
      setup: vi.fn().mockReturnValue([vi.fn()]),
    },
  };
});

describe("Swagger Config", () => {
  it("should initialize swagger spec and docs", async () => {
    const { swaggerSpec, swaggerUi, swaggerDocs } = await import("../../src/config/swagger.js");

    expect(swaggerSpec).toBeDefined();
    expect(swaggerUi).toBeDefined();
    expect(swaggerDocs).toBeDefined();
    expect(Array.isArray(swaggerDocs)).toBe(true);
  });
});
