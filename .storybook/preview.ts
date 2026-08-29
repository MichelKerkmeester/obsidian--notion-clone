// ───────────────────────────────────────────────────────────────────
// MODULE:    storybook-preview
// COMPONENT: catalogue runtime — DOM shim, tokens, and the theme switch
// ───────────────────────────────────────────────────────────────────
//
// Two things have to exist before any story renders.
//
// The plugin builds nearly all of its DOM through Obsidian's HTMLElement
// extensions — createDiv, createEl, addClass and ten more — which Obsidian
// patches onto the prototype at runtime and which appear in no import
// statement. There are 2,586 such calls across 68 source files, so without
// the shim nothing presentational renders at all. Installing it here rather
// than per-story means components need no change to appear in the catalogue.
//
// The stylesheet reads Obsidian's CSS variables and declares none of them.
// The token file is shared with the screenshot harness on purpose: two
// definitions of "what colour is this" would drift, and the catalogue would
// stop matching the captures it is meant to explain.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/html-vite";
import { installObsidianDomShim } from "../tools/storybook/obsidian-dom-shim.mjs";
import "../tools/screenshots/theme.css";
import "../styles.css";

// ───────────────────────────────────────────────────────────────────
// 2. RUNTIME SETUP
// ───────────────────────────────────────────────────────────────────

installObsidianDomShim(globalThis);

// ───────────────────────────────────────────────────────────────────
// 3. PREVIEW
// ───────────────────────────────────────────────────────────────────

const preview: Preview = {
  decorators: [
    // Obsidian marks the theme on the document element, and the stylesheet keys off
    // `.theme-dark`. Matching that exactly is what makes the switch show real output
    // rather than an approximation of it.
    withThemeByClassName({
      themes: { light: "theme-light", dark: "theme-dark" },
      defaultTheme: "light",
      parentSelector: "html",
    }),
    // Every surface here is a child of the plugin's container in the real app, and a
    // large share of the stylesheet is scoped to it. Without this wrapper a story would
    // render unstyled and the catalogue would quietly lie about what ships.
    (story) => {
      const host = document.createElement("div");
      host.className = "note-database-container";
      const rendered = story();
      if (typeof rendered === "string") host.innerHTML = rendered;
      else host.appendChild(rendered as Node);
      return host;
    },
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
  },
  tags: ["autodocs"],
};

export default preview;
