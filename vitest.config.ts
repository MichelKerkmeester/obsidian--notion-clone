import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The `obsidian` package ships types only — its package.json declares an empty `main`, so there
  // is no runtime entry to load. Vite 6 tolerated that; Vite 7 refuses to resolve it, which broke
  // fifteen suites that had never imported anything from it at runtime. Suites that need real
  // behaviour still declare their own `vi.mock("obsidian", ...)` factory; this only gives the
  // resolver a file to point at, and reuses the catalogue's stub so there is one stand-in rather
  // than two that can disagree.
  resolve: {
    alias: { obsidian: resolve(__dirname, "tools/storybook/obsidian-stub.mjs") },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    setupFiles: ["src/__tests__/setup.ts"],
  },
});
