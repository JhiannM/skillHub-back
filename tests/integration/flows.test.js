import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { generateToken } from "../../src/config/jwt.js";

const mClient = { release: vi.fn() };
const mPool = {
  connect: vi.fn().mockResolvedValue(mClient),
  query: vi.fn(),
  on: vi.fn(),
  end: vi.fn(),
};

// Mock pg module globally for these flows
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

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret12345678901234567890";
});

describe("Integration Flows", () => {
  describe("Flujo 1: Registro e Inicio de Sesión de Proveedor", () => {
    it("should successfully register a provider and then allow them to login", async () => {
      const { default: app } = await import("../../src/app.js");

      // 1. REGISTRO
      // Mock findExistingUserByEmail => empty (user doesn't exist yet)
      mPool.query.mockResolvedValueOnce({ rows: [] });
      // Mock createUser => returns created user
      mPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: "provider-uuid",
            name: "Jhiann",
            email: "jhiann@example.com",
            role: "PROVIDER",
          },
        ],
      });
      // Mock createProviderProfile => returns empty profile
      mPool.query.mockResolvedValueOnce({
        rows: [{ user_id: "provider-uuid" }],
      });

      const regRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Jhiann",
          email: "jhiann@example.com",
          password: "Password123",
          role: "PROVIDER",
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user).toEqual({
        name: "Jhiann",
        email: "jhiann@example.com",
        role: "PROVIDER",
      });
      expect(regRes.body.data.token).toBeTypeOf("string");

      // 2. INICIO DE SESIÓN (LOGIN)
      const testPassword = "Password123";
      const hashedPassword = await bcrypt.hash(testPassword, 12);

      // Mock findUserByEmail => returns user with password hash
      mPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: "provider-uuid",
            name: "Jhiann",
            email: "jhiann@example.com",
            password: hashedPassword,
            role: "PROVIDER",
          },
        ],
      });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "jhiann@example.com",
          password: testPassword,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.user).toEqual({
        name: "Jhiann",
        email: "jhiann@example.com",
        role: "PROVIDER",
      });
      expect(loginRes.body.data.token).toBeTypeOf("string");
    });
  });

  describe("Flujo 2: Búsqueda y Filtrado de Prestadores Públicos", () => {
    it("should allow public users to search and apply criteria", async () => {
      const { default: app } = await import("../../src/app.js");

      // Mock searchProviders query returning list of providers
      mPool.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: "prov-1",
            name: "Alex",
            city: "Lima",
            bio: "Senior developer",
            skills: ["JS", "Node"],
            main_category: "TECNOLOGIA",
            base_price: 25000,
            profile_completion: 100,
            relevance_score: 95,
          },
        ],
      });

      const res = await request(app)
        .get("/api/providers/search")
        .query({
          category: "TECNOLOGIA",
          city: "Lima",
          keyword: "developer",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.providers.length).toBe(1);
      expect(res.body.data.providers[0]).toMatchObject({
        name: "Alex",
        city: "Lima",
        main_category: "TECNOLOGIA",
      });
    });
  });

  describe("Flujo 3: Consulta y Actualización de Perfil de Prestador", () => {
    it("should retrieve profile and let user update fields with profile completion updates", async () => {
      const { default: app } = await import("../../src/app.js");
      const providerToken = generateToken({ id: "provider-uuid", role: "PROVIDER" });

      // 1. CONSULTA PERFIL (GET)
      // Mock findProviderByUserId => returns existing profile
      mPool.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: "provider-uuid",
            name: "Jhiann",
            email: "jhiann@example.com",
            role: "PROVIDER",
            bio: "Old bio",
            phone: "12345",
            city: "Bogota",
          },
        ],
      });
      // Mock getProviderProfileCompletion => 50%
      mPool.query.mockResolvedValueOnce({
        rows: [{ completion_percentage: 50 }],
      });

      const getRes = await request(app)
        .get("/api/providers/me/profile")
        .set("Authorization", `Bearer ${providerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.profile_completion).toBe(50);
      expect(getRes.body.data.bio).toBe("Old bio");

      // 2. ACTUALIZACIÓN PERFIL (PATCH)
      // Mock findProviderByUserId (exists check) => returns profile
      mPool.query.mockResolvedValueOnce({
        rows: [{ user_id: "provider-uuid" }],
      });
      // Mock updateProviderProfile => returns updated profile
      mPool.query.mockResolvedValueOnce({
        rows: [
          {
            user_id: "provider-uuid",
            name: "Jhiann",
            email: "jhiann@example.com",
            role: "PROVIDER",
            bio: "New bio details",
            phone: "12345",
            city: "Bogota",
            base_price: 35000,
          },
        ],
      });
      // Mock getProviderProfileCompletion => 75%
      mPool.query.mockResolvedValueOnce({
        rows: [{ completion_percentage: 75 }],
      });

      const patchRes = await request(app)
        .patch("/api/providers/me/profile")
        .set("Authorization", `Bearer ${providerToken}`)
        .send({
          bio: "New bio details",
          basePrice: 35000,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.bio).toBe("New bio details");
      expect(patchRes.body.data.profile_completion).toBe(75);
    });
  });
});
