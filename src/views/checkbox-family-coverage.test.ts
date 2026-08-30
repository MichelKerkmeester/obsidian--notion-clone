/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading shipped source and the scenario registry from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-family-coverage.test
// COMPONENT: holds the capture fixtures and the checkbox factory in step
// ───────────────────────────────────────────────────────────────────
//
// Five checkbox families had a call site, a stylesheet rule and no fixture: the board subgroup,
// the gallery group, the list group, the selection-clear box and the modal box. Nothing
// photographed them and no browser check could reach them, so every measurement of "all the
// checkboxes" was silently a measurement of the ones somebody happened to write markup for.
//
// The two assertions here are the pair. Coverage alone would pass on a fixture that renders the
// right class over the wrong markup; agreement alone would pass on a family with no fixture at
// all. Both run against the real factory rather than a copy of what it is believed to emit — a
// hand-maintained expected-class list would agree with itself forever.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";
import { createCheckbox, type CheckboxRole } from "./checkbox";

const REPO = resolve(__dirname, "..", "..");

// ───────────────────────────────────────────────────────────────────
// 2. WHAT THE FACTORY EMITS
// ───────────────────────────────────────────────────────────────────

/**
 * Run the shipped factory and read back the class list it asks for.
 *
 * `createCheckbox` builds through Obsidian's `createEl`, which does not exist under a node
 * environment, so the parent is a recorder rather than a DOM node. What is under test is the class
 * list the factory composes, and that is decided before any element exists.
 */
function factoryClasses(role: CheckboxRole, family?: string): string[] {
  let asked: string[] = [];
  const recorder = {
    createEl: (_tag: string, info: { cls: string[] }) => {
      asked = info.cls;
      return {} as HTMLInputElement;
    },
  } as unknown as HTMLElement;
  createCheckbox(recorder, family ? { role, cls: family } : { role });
  return asked;
}

// ───────────────────────────────────────────────────────────────────
// 3. WHAT THE SOURCE ASKS FOR
// ───────────────────────────────────────────────────────────────────

function collectSources(dir: string, acc: { file: string; text: string }[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectSources(full, acc);
    // Stories and suites never ship, and the factory's own file is the one place the raw
    // attribute is supposed to appear.
    else if (
      entry.endsWith(".ts")
      && !entry.endsWith(".test.ts")
      && !entry.endsWith(".stories.ts")
      && full !== join(REPO, "src/views/checkbox.ts")
    ) {
      acc.push({ file: full.slice(REPO.length + 1), text: readFileSync(full, "utf8") });
    }
  }
  return acc;
}

interface CallSite {
  file: string;
  role: string;
  /** The whole `cls` value as written, which is what the factory is handed. */
  cls?: string;
  /** That value split into the individual classes it puts on the element. */
  families: string[];
}

/**
 * Every `createCheckbox` call in the plugin, with the role and family it passes.
 *
 * The argument text is taken by matching brackets rather than by a line window. A window credits
 * whatever a neighbouring call declared, and this file exists because a family nobody enumerated
 * went unmeasured.
 */
function callSites(): CallSite[] {
  const found: CallSite[] = [];
  for (const { file, text } of collectSources(join(REPO, "src"))) {
    let from = 0;
    for (;;) {
      const at = text.indexOf("createCheckbox(", from);
      if (at === -1) break;
      from = at + 1;
      let depth = 0;
      let end = at + "createCheckbox".length;
      for (; end < text.length; end++) {
        if (text[end] === "(") depth++;
        else if (text[end] === ")" && --depth === 0) break;
      }
      const args = text.slice(at, end);
      const role = /\brole:\s*"([a-z]+)"/.exec(args)?.[1];
      if (!role) continue;
      // `cls` is a class LIST, not a class. Matching `[a-z0-9-]+` stopped at the first space, so the
      // four sites that declare two classes matched nothing at all and were dropped whole — and a
      // family that is never asked about reads as covered, which is how "0 uncovered" came to be a
      // count over ten families rather than the twelve declared.
      const cls = /\bcls:\s*"([^"]+)"/.exec(args)?.[1];
      found.push({ file, role, cls, families: cls ? cls.split(/\s+/).filter(Boolean) : [] });
    }
  }
  return found;
}

/** The classes the factory puts on every box itself, which no call site declares. */
const FACTORY_OWNED = /^db-checkbox(-row|-field)?$/;

/** A class list reduced to what the call site asked for, in a form two of them can be compared by. */
function declaredKey(classes: string[]): string {
  return classes.filter((cls) => !FACTORY_OWNED.test(cls)).join(" ");
}

/**
 * Every distinct `cls` the source declares, keyed by that value and carrying the role beside it.
 *
 * This is the half the agreement assertion was missing. It read the role off the fixture's own
 * class list and then asked the factory what that role produces, so the fixture was compared
 * against a restatement of itself: a fixture at the wrong role agreed with itself and passed, while
 * photographing a box at a size the plugin never builds there. The role has one source of truth and
 * it is the call site.
 *
 * A `cls` declared at two sites with two different roles is a genuine ambiguity in the source, and
 * is recorded as such rather than resolved by taking whichever was parsed first.
 */
function declaredFamilies(): Map<string, { roles: string[]; cls: string; files: string[] }> {
  const map = new Map<string, { roles: string[]; cls: string; files: string[] }>();
  for (const site of callSites()) {
    // A site with no `cls` is keyed by the empty string. It still constrains its fixtures: the
    // plain box exists at whichever roles the source asks for it at, and a fixture rendering a
    // plain box at some other role is describing a control nothing creates.
    const key = declaredKey(site.families);
    const seen = map.get(key);
    if (seen) {
      if (!seen.files.includes(site.file)) seen.files.push(site.file);
      if (!seen.roles.includes(site.role)) seen.roles.push(site.role);
    } else {
      map.set(key, { roles: [site.role], cls: key, files: [site.file] });
    }
  }
  return map;
}

// ───────────────────────────────────────────────────────────────────
// 4. WHAT THE FIXTURES RENDER
// ───────────────────────────────────────────────────────────────────

interface FixtureBox {
  scenario: string;
  classes: string[];
}

async function fixtureBoxes(): Promise<FixtureBox[]> {
  const { SCENARIOS } = (await import(
    join(REPO, "tools/screenshots/scenarios.mjs")
  )) as { SCENARIOS: { id: string; html?: () => string }[] };
  const boxes: FixtureBox[] = [];
  for (const scenario of SCENARIOS) {
    if (typeof scenario.html !== "function") continue;
    let html: string;
    try {
      html = scenario.html();
    } catch {
      continue;
    }
    for (const tag of html.matchAll(/<input\b[^>]*type="checkbox"[^>]*>/g)) {
      const cls = /class="([^"]*)"/.exec(tag[0])?.[1] ?? "";
      boxes.push({ scenario: scenario.id, classes: cls.split(/\s+/).filter(Boolean) });
    }
  }
  return boxes;
}

/**
 * The one checkbox in the shipped DOM that the factory does not build.
 *
 * Eight call sites create the switch with a raw `createEl`, so it carries neither `db-checkbox`
 * nor a role class. Naming it here is what keeps the agreement assertion exact: any other
 * unrecognised checkbox in a fixture is markup the plugin does not produce, and fails.
 */
const NOT_FROM_THE_FACTORY = ["db-toggle-switch"];

// ───────────────────────────────────────────────────────────────────
// 5. TESTS
// ───────────────────────────────────────────────────────────────────

describe("every checkbox family the plugin builds is also rendered by a fixture", () => {
  it("leaves no family with a call site and no fixture", async () => {
    const wanted = new Set(
      callSites()
        .flatMap((site) => site.families)
        .filter((family) => family !== "db-checkbox" && !family.startsWith("db-checkbox-"))
    );
    const rendered = new Set((await fixtureBoxes()).flatMap((box) => box.classes));
    const uncovered = [...wanted].filter((family) => !rendered.has(family)).sort();
    expect(
      uncovered,
      `these families are created in source and rendered by no fixture, so no capture shows them `
        + `and no browser check can reach them: ${uncovered.join(", ")}`
    ).toEqual([]);
  });

  it("renders each family at the role its call site asks for", async () => {
    const declared = declaredFamilies();
    const mismatched: string[] = [];
    for (const box of await fixtureBoxes()) {
      if (box.classes.some((cls) => NOT_FROM_THE_FACTORY.includes(cls))) continue;
      const key = declaredKey(box.classes);
      const site = declared.get(key);
      if (!site) {
        mismatched.push(
          `${box.scenario}: .${box.classes.join(".") || "(classless)"} matches no createCheckbox call`
        );
        continue;
      }
      // The roles come from the source; the fixture's own role class is part of what is being
      // judged, so swapping it now produces a mismatch instead of a new expectation.
      const expected = site.roles.map((role) => factoryClasses(role as CheckboxRole, site.cls).join(" "));
      const actual = box.classes.join(" ");
      if (!expected.includes(actual)) {
        mismatched.push(
          `${box.scenario}: fixture "${actual}" vs factory "${expected.join('" or "')}" `
            + `(${site.files.join(", ")} asks for role ${site.roles.map((r) => `"${r}"`).join(" and ")})`
        );
      }
    }
    expect(
      mismatched,
      `a fixture whose class list differs from the factory's photographs a control the plugin does `
        + `not build, and any geometry measured on it describes nothing: ${mismatched.join(" | ")}`
    ).toEqual([]);
  });

  it("keeps the switch the only checkbox built outside the factory", () => {
    // A ninth raw creation site would be a family with no role, no shared appearance contract and
    // no place in the coverage assertion above — invisible to both checks unless this one fails.
    // The switch's own sites are recognised by the class on the same statement, so moving one to a
    // new file stays allowed while inventing a new bare checkbox does not.
    const raw: string[] = [];
    for (const { file, text } of collectSources(join(REPO, "src"))) {
      const lines = text.split("\n");
      lines.forEach((line, index) => {
        if (!/type:\s*"checkbox"/.test(line)) return;
        const statement = lines.slice(Math.max(0, index - 3), index + 1).join("\n");
        if (NOT_FROM_THE_FACTORY.some((cls) => statement.includes(cls))) return;
        raw.push(`${file}:${index + 1}`);
      });
    }
    expect(
      raw,
      `these create a checkbox without the factory and without being the known switch: ${raw.join(", ")}`
    ).toEqual([]);
  });
});
