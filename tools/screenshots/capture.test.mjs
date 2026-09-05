// ───────────────────────────────────────────────────────────────────
// MODULE:    capture.test
// COMPONENT: coverage for the generated README's Reference roots section
// ───────────────────────────────────────────────────────────────────
//
// screenshots/README.md is generated and lists our own scenario groups by walking the
// capture manifest, so it never mentioned screenshots/project-manager/ or screenshots/anytype/
// as roots — the former reads as an ordinary manifest group, the latter carries no manifest
// entries at all and would otherwise be invisible from this file. buildReadme() is exported so
// this section's presence, wording and lane-scope lookup are testable without a Chrome capture
// run, which the rest of capture.mjs requires.
//
// Deliberately red-first: before buildReadme() named both roots and looked up their lane
// coverage, no generated text described either.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { buildReadme } from "./capture.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

const MANIFEST = [
  {
    id: "constructed-table",
    title: "Table view",
    group: "views",
    theme: "dark",
    note: null,
    sources: ["src/views/table-renderer.ts"],
    file: "screenshots/notion-clone/views/constructed-table-desktop-dark.png",
  },
  {
    id: "constructed-table",
    title: "Table view",
    group: "views",
    theme: "light",
    note: null,
    sources: ["src/views/table-renderer.ts"],
    file: "screenshots/notion-clone/views/constructed-table-desktop-light.png",
  },
];

// ───────────────────────────────────────────────────────────────────
// 3. REFERENCE ROOTS SECTION
// ───────────────────────────────────────────────────────────────────

describe("buildReadme", () => {
  it("names both reference roots, whether each is our render or a photograph, and its index", () => {
    const readme = buildReadme(MANIFEST, ["screenshots/notion-clone/", "screenshots/project-manager/"]);

    expect(readme).toContain("## Reference roots");
    expect(readme).toContain("`screenshots/project-manager/` — our render");
    expect(readme).toContain("indexed above under the `project-manager` group");
    expect(readme).toContain("`screenshots/anytype/` — photograph");
    expect(readme).toContain("its own index at `screenshots/anytype/README.md`");
  });

  it("reports lane scope from the css-lane in-scope root list rather than a fixed guess", () => {
    const inScope = buildReadme(MANIFEST, ["screenshots/notion-clone/", "screenshots/project-manager/"]);
    expect(inScope).toMatch(/`screenshots\/project-manager\/` — our render.*Lane scope: in scope/s);
    expect(inScope).toMatch(/`screenshots\/anytype\/` — photograph.*Lane scope: not in scope/s);

    const noneScoped = buildReadme(MANIFEST, ["screenshots/notion-clone/"]);
    expect(noneScoped).toMatch(/`screenshots\/project-manager\/` — our render.*Lane scope: not in scope/s);
  });

  it("still lists the existing scenario groups unchanged", () => {
    const readme = buildReadme(MANIFEST, []);
    expect(readme).toContain("## views");
    expect(readme).toContain("### Table view");
    expect(readme).toContain("Sources: `src/views/table-renderer.ts`");
  });
});
