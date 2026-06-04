import { describe, it, expect, vi } from "vitest";

const mClient = {
  release: vi.fn(),
};
const mPool = {
  connect: vi.fn().mockResolvedValue(mClient),
  query: vi.fn(),
  on: vi.fn(),
  end: vi.fn(),
};

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

describe("Database Config", () => {
  it("should create pool and call testConnection", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    
    const { default: pool } = await import("../../src/config/database.js");

    expect(pool).toBeDefined();
    expect(mPool.connect).toHaveBeenCalled();
    
    // Wait a brief moment for the connection promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    expect(consoleLogSpy).toHaveBeenCalledWith("Conexion a PostgreSQL exitosa");
    expect(mClient.release).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });
});
