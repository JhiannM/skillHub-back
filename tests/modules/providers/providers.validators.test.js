import { describe, it, expect } from "vitest";
import { validationResult } from "express-validator";
import { updateProfileValidator, searchValidator } from "../../../src/modules/providers/providers.validators.js";

async function runValidator(req, validators) {
  // express-validator chains are middleware arrays.
  // We need to run them sequentially or in parallel.
  const contexts = validators.map(validator => {
    // If it's a validation chain, it has a run method, or we can just call it as middleware
    if (typeof validator === "function") {
      return validator(req, {}, () => {});
    }
    return Promise.resolve();
  });
  await Promise.all(contexts);
}

describe("Providers Validators", () => {
  describe("updateProfileValidator", () => {
    it("should pass for valid optional fields", async () => {
      const req = {
        body: {
          bio: "Just a bio",
          phone: "+573001234567",
          city: "Bogota",
          skills: ["JavaScript", "HTML"],
          basePrice: 15000,
          mainCategory: "hogar", // will be sanitized to HOGAR
          yearsExperience: 5,
          schedule: {
            Lunes: { enabled: true, inicio: "08:00", fin: "17:00" },
            Martes: { enabled: false },
          },
          serviceDescription: "Coding stuff",
        },
      };

      await runValidator(req, updateProfileValidator);
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
      expect(req.body.mainCategory).toBe("HOGAR"); // Check sanitization
    });

    it("should fail for invalid phone format", async () => {
      const req = { body: { phone: "12" } }; // too short
      await runValidator(req, updateProfileValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "phone")).toBe(true);
    });

    it("should fail for too long bio", async () => {
      const req = { body: { bio: "a".repeat(501) } };
      await runValidator(req, updateProfileValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "bio")).toBe(true);
    });

    it("should fail for invalid mainCategory", async () => {
      const req = { body: { mainCategory: "INVALID_CAT" } };
      await runValidator(req, updateProfileValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "mainCategory")).toBe(true);
    });

    it("should fail for invalid yearsExperience", async () => {
      const req = { body: { yearsExperience: 65 } }; // max is 60
      await runValidator(req, updateProfileValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "yearsExperience")).toBe(true);
    });

    describe("schedule custom validation", () => {
      it("should fail if schedule is not an object", async () => {
        const req = { body: { schedule: "not-an-object" } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail for invalid day in schedule", async () => {
        const req = { body: { schedule: { Juernes: { enabled: false } } } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail if slot is not an object", async () => {
        const req = { body: { schedule: { Lunes: null } } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail if enabled is not a boolean", async () => {
        const req = { body: { schedule: { Lunes: { enabled: "yes" } } } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail if enabled is true but hours are in invalid format", async () => {
        const req = { body: { schedule: { Lunes: { enabled: true, inicio: "8:00", fin: "17:00" } } } }; // missing leading zero
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail if enabled is true but fin hour is invalid format", async () => {
        const req = { body: { schedule: { Lunes: { enabled: true, inicio: "08:00", fin: "25:00" } } } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });

      it("should fail if enabled is true but inicio >= fin", async () => {
        const req = { body: { schedule: { Lunes: { enabled: true, inicio: "12:00", fin: "08:00" } } } };
        await runValidator(req, updateProfileValidator);
        const errors = validationResult(req).array();
        expect(errors.some(err => err.path === "schedule")).toBe(true);
      });
    });
  });

  describe("searchValidator", () => {
    it("should pass for valid query options and sanitize category", async () => {
      const req = {
        query: {
          category: "salud", // will be sanitized to SALUD
          minPrice: "100",
          maxPrice: "500.5",
          page: "3",
        },
      };

      await runValidator(req, searchValidator);
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
      expect(req.query.category).toBe("SALUD");
    });

    it("should fail for invalid category", async () => {
      const req = { query: { category: "invalid-cat" } };
      await runValidator(req, searchValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "category")).toBe(true);
    });

    it("should fail for negative minPrice", async () => {
      const req = { query: { minPrice: "-10" } };
      await runValidator(req, searchValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "minPrice")).toBe(true);
    });

    it("should fail for negative maxPrice", async () => {
      const req = { query: { maxPrice: "-5" } };
      await runValidator(req, searchValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "maxPrice")).toBe(true);
    });

    it("should fail for negative or float page", async () => {
      const req = { query: { page: "-1" } };
      await runValidator(req, searchValidator);
      const errors = validationResult(req).array();
      expect(errors.some(err => err.path === "page")).toBe(true);
    });
  });
});
