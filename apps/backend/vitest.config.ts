import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mantém aliases do tsconfig (`@/*` -> `src/*`) nos testes.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts"],
  },
});
