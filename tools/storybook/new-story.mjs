// ───────────────────────────────────────────────────────────────────
// MODULE:    new-story
// COMPONENT: scaffolds a co-located story beside a module
// ───────────────────────────────────────────────────────────────────
//
// Writing the boilerplate by hand is how stories end up inconsistent: a
// different title convention, a missing autodocs tag, a render that returns
// the wrong thing. This emits the shape the catalogue expects and lists the
// module's renderable exports so the author fills in real calls rather than
// inventing a component that does not exist.
//
// Usage: node tools/storybook/new-story.mjs src/views/<module>.ts

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

// ───────────────────────────────────────────────────────────────────
// 2. INPUT
// ───────────────────────────────────────────────────────────────────

const target = process.argv[2];
if (!target) {
  console.error("usage: node tools/storybook/new-story.mjs src/views/<module>.ts");
  process.exit(2);
}

const modulePath = resolve(target);
if (!existsSync(modulePath)) {
  console.error(`new-story: ${target} does not exist`);
  process.exit(2);
}

const stem = basename(modulePath, ".ts");
const storyPath = join(dirname(modulePath), `${stem}.stories.ts`);
if (existsSync(storyPath)) {
  console.error(`new-story: ${stem}.stories.ts already exists — edit it rather than regenerating.`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 3. SCAFFOLD
// ───────────────────────────────────────────────────────────────────

const source = readFileSync(modulePath, "utf8");
const exports = [...source.matchAll(/^export function ((?:create|render)\w+)/gm)].map((m) => m[1]);
if (exports.length === 0) {
  console.error(`new-story: ${stem} exports no create or render function — is it renderable?`);
  process.exit(1);
}

const title = stem.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const primary = exports[0];

// The numbered box-drawing sections are not decoration: the comment scanner requires them on every
// file under src and tools, so a template without them emits code that fails the gate on arrival.
const RULE = "// " + "\u2500".repeat(67);

const template = `${RULE}
// MODULE:    ${stem}.stories
// COMPONENT: catalogue entries for ${title.toLowerCase()}
${RULE}
//
// TODO: say what a reviewer should be checking here, not what the code does.
// The useful stories are the ones showing states that never appear together
// in the app — empty beside full, enabled beside disabled.

${RULE}
// 1. IMPORTS
${RULE}

import type { Meta, StoryObj } from "@storybook/html-vite";
import { ${exports.join(", ")} } from "./${stem}";

${RULE}
// 2. CATALOGUE ENTRY
${RULE}

const meta: Meta = { title: "TODO-section/${title}" };
export default meta;

type Story = StoryObj;

${RULE}
// 3. STORIES
${RULE}

export const Default: Story = {
  render: () => {
    const host = document.createElement("div");
    // TODO: call ${primary} with real values. Never invent a shape the app does not produce.
    ${primary}(host);
    return host;
  },
};
`;

writeFileSync(storyPath, template);
console.log(`new-story: wrote ${storyPath.replace(process.cwd() + "/", "")}`);
console.log(`  renderable exports: ${exports.join(", ")}`);
console.log("  fill in the TODOs, then: npm run build-storybook && npm run story:smoke");
