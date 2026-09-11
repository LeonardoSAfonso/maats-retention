import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve os aliases declarados no tsconfig.json (`@/*` -> `src/*`).
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts"],
  },
});
