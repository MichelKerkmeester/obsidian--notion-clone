// ───────────────────────────────────────────────────────────────────
// MODULE:    storybook-main
// COMPONENT: catalogue configuration — story discovery and framework
// ───────────────────────────────────────────────────────────────────
//
// The plugin is vanilla TypeScript that writes DOM directly, so the HTML
// framework is the honest fit: a story is a function returning an element,
// which is what the render functions here already are.
//
// Stories sit beside the module they demonstrate. The alternative — one
// central story file — is what the previous catalogue did, and it drifted:
// a component could change with nothing next to it to update.
//
// `obsidian` is aliased to a stub because Vite must resolve the import at
// build time. Vault-touching exports throw when called rather than returning
// empty values, so a story that strays outside the presentational boundary
// fails loudly instead of rendering something subtly wrong.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/html-vite";

const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: { name: "@storybook/html-vite", options: {} },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        obsidian: resolve(here, "../tools/storybook/obsidian-stub.mjs"),
      },
    },
  }),
};

export default config;
