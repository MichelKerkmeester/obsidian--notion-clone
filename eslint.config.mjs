import js from "@eslint/js";
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

// The Obsidian rule set includes rules that need type information, so applying it to a plain .mjs
// file makes ESLint abort rather than report — which is why the whole `tools/` tree, every harness
// this project's gates depend on, was silently unlinted. Scoping the set to TypeScript is a no-op
// for `src` (all TypeScript) and lets the tooling be checked at all.
const TOOLING = "tools/**/*.mjs";
const obsidianTypescriptOnly = obsidianmd.configs.recommended.map((entry) => ({
  ...entry,
  ignores: [...(entry.ignores ?? []), TOOLING],
}));

export default defineConfig([
  ...obsidianTypescriptOnly,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      // 使用 FileManager.trashFile() 替代 Vault.trash()
      "obsidianmd/prefer-file-manager-trash-file": "error",
    },
  },
  {
    files: [TOOLING],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        // Present only inside page.evaluate bodies, which are authored here but run in the browser.
        document: "readonly",
        window: "readonly",
        location: "readonly",
        getComputedStyle: "readonly",
        requestAnimationFrame: "readonly",
        Event: "readonly",
        MouseEvent: "readonly",
        PointerEvent: "readonly",
        navigator: "readonly",
        matchMedia: "readonly",
        CSS: "readonly",
      },
    },
  },
]);
