import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";

const mClient = { release: vi.fn() };
const mPool = {
  connect: vi.fn().mockResolvedValue(mClient),
  query: vi.fn().mockResolvedValue({ rows: [] }),
  on: vi.fn(),
  end: vi.fn(),
};

// Mock pg module before importing app to avoid database connections
vi.mock("pg", () => {
  return {
    Pool: class {
      connect = mPool.connect;
      query = mPool.query;
      on = mPool.on;
      end = mPool.end;
    },
  };
});

// Mock environment variables
beforeAll(() => {
  process.env.JWT_SECRET = "testsecret12345678901234567890";
  process.env.CORS_ORIGIN = "http://localhost:3000,http://localhost:3001";
});

describe("App Integration Tests", () => {
  it("should return 200 for swagger documentation endpoint", async () => {
    const { default: app } = await import("../src/app.js");
    
    // Swagger UI setup sets up /api/docs/ redirecting or rendering HTML
    const res = await request(app).get("/api/docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger");
  });

  it("should run validators and return 400 for register with invalid fields", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Errores de validación");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should run validators and return 400 for login with invalid fields", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "not-an-email",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 200 for public provider search even with empty params", async () => {
    const { default: app } = await import("../src/app.js");
    
    mPool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/providers/search");
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Prestadores encontrados");
    expect(res.body.data.providers).toEqual([]);
  });

  it("should return 401 for authenticated endpoints if no token is provided", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/api/providers/me/profile");
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No autorizado. Token no proporcionado");
  });

  it("should return 401 for authenticated endpoints with invalid token", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app)
      .get("/api/providers/me/profile")
      .set("Authorization", "Bearer invalid-token-string");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Token invalido o expirado");
  });

  it("should return 403 if authenticated user is not PROVIDER on /me/profile", async () => {
    const { default: app } = await import("../src/app.js");
    const { generateToken } = await import("../src/config/jwt.js");

    const customerToken = generateToken({ id: "cust-1", role: "CUSTOMER" });

    const res = await request(app)
      .get("/api/providers/me/profile")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No tienes permisos para realizar esta accion");
  });
});
