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
    // `tools/**` joins `src/**` because the live probe's exit-code contract is testable and was
    // not tested. Its three codes are `009`'s whole point — conflating "the product is wrong" with
    // "I could not ask" is the blindness that packet exists to remove — and the ASKING needs a
    // running Obsidian while the DECISION does not. Only files that end `.test.mjs` are picked up,
    // so a harness script is not mistaken for a suite.
    include: ["src/**/*.test.ts", "tools/**/*.test.mjs"],
    environment: "node",
    setupFiles: ["src/__tests__/setup.ts"],
  },
});
