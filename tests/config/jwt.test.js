import { describe, it, expect, beforeAll } from "vitest";

// Set environment variables before importing the module
beforeAll(() => {
  process.env.JWT_SECRET = "testsecret12345678901234567890";
  process.env.JWT_EXPIRES_IN = "1h";
});

describe("JWT Config", () => {
  it("should generate a valid JWT token and verify it", async () => {
    // Import dynamically after env variables are set
    const { generateToken, verifyToken } = await import("../../src/config/jwt.js");

    const payload = { id: "user-123", role: "CUSTOMER" };
    const token = generateToken(payload);

    expect(token).toBeTypeOf("string");
    expect(token.length).toBeGreaterThan(0);

    const decoded = verifyToken(token);
    expect(decoded).toMatchObject(payload);
    expect(decoded.exp).toBeTypeOf("number");
  });
});
