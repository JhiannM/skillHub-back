import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "node_modules/**",
        "migrate.js",
        "index.js",
        "eslint.config.js",
        "src/database/migrations/**",
      ],
    },
  },
});
