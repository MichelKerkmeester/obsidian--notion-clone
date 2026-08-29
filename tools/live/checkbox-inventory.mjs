// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-inventory
// COMPONENT: joins every checkbox the plugin creates to the rule that styles it
// ───────────────────────────────────────────────────────────────────
//
// A previous attempt styled the boolean *cell*, shipped, and the operator still
// saw round checkboxes everywhere else. The list of creation sites was not the
// problem — that list was easy. What was missing is the other half: which rule,
// if any, actually reaches each site.
//
// So this joins the two. Every `type: "checkbox"` construction on one side,
// every selector that could style a checkbox on the other, and the pairing
// between them. Three things fall out of the join that neither list shows alone:
//
//   UNSTYLED   a checkbox whose class no rule mentions. It renders the platform
//              box — a circle on iOS — and nothing in the tree says so.
//   BORROWED   a classless input styled only because the call site put a class
//              on its parent a line or two earlier. It looks correct today and
//              reverts silently the first time someone changes a wrapper.
//   ANCESTOR   a rule that reaches its input only through an ancestor selector.
//              Same fragility, written in CSS instead of TypeScript.
//
// The join is the inventory. A creation-site list is not one.
//
// It reads the code with the TypeScript parser rather than by matching lines.
// A line-window version of this was written first and was wrong in both
// directions: it attributed a neighbouring element's class to the checkbox
// because both fell inside the window, and it failed to find the parent a
// classless input borrows from because the call was wrapped differently than
// expected. Numbers from it looked authoritative and were not, which is the
// failure this whole effort exists to stop — so the object graph is read as an
// object graph.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 3. COLLECT — the creation sites
// ───────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.ts$/.test(entry) && !/\.test\.ts$/.test(entry)) out.push(abs);
  }
  return out;
}

/**
 * Find every object literal carrying `type: "checkbox"`, and read the `cls` from that same
 * literal — never from a neighbouring one.
 *
 * When the literal has no `cls`, walk outward to the enclosing statement and take the class from
 * the nearest preceding element creation in the same block. That is what "borrowing" means here,
 * and resolving it structurally is the only way to name the parent a site actually depends on.
 */
function creationSites() {
  const sites = [];
  for (const file of walk(join(REPO, "src"))) {
    const text = readFileSync(file, "utf8");
    if (!text.includes('"checkbox"')) continue;
    const rel = relative(REPO, file);
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

    const classOf = (node) => {
      if (!ts.isObjectLiteralExpression(node)) return null;
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (prop.name.getText(source) !== "cls") continue;
        if (ts.isStringLiteral(prop.initializer)) return prop.initializer.text;
        return "(computed)";
      }
      return null;
    };

    const declaresCheckboxType = (node) =>
      ts.isObjectLiteralExpression(node) &&
      node.properties.some(
        (prop) =>
          ts.isPropertyAssignment(prop) &&
          prop.name.getText(source) === "type" &&
          ts.isStringLiteral(prop.initializer) &&
          prop.initializer.text === "checkbox"
      );

    /**
     * The literal that owns the element, which is not always the one naming the type.
     *
     * These calls are written `createEl("input", { cls: "...", attr: { type: "checkbox" } })`, so
     * the type sits one level down inside `attr` while the class stays on the outer object. Reading
     * the type-bearing literal and asking it for a class finds none — every site then looks
     * classless, which is how an earlier version of this file reported all thirty-seven as
     * borrowing a parent's class. Climb out of `attr` before asking.
     */
    const elementLiteralFor = (node) => {
      const parent = node.parent;
      if (parent && ts.isPropertyAssignment(parent) && parent.name.getText(source) === "attr") {
        const grandparent = parent.parent;
        if (grandparent && ts.isObjectLiteralExpression(grandparent)) return grandparent;
      }
      return node;
    };

    /**
     * Every place in the file, in source order, that puts a class on an element.
     *
     * Two forms, and both matter. `createEl("div", { cls: "x" })` names it at construction, and
     * `el.addClass("x")` adds it afterwards — the second is precisely how the known dangerous sites
     * work, classing the parent one line before creating an unclassed input inside it. A search
     * that reads only object literals finds no parent for those sites and reports them as depending
     * on nothing, which is the opposite of true.
     */
    const literals = [];
    const collect = (node) => {
      if (ts.isObjectLiteralExpression(node)) {
        literals.push({ node, cls: classOf(node) });
      } else if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ["addClass", "add", "addClasses"].includes(node.expression.name.getText(source)) &&
        node.arguments.length > 0
      ) {
        const named = node.arguments
          .filter((arg) => ts.isStringLiteral(arg))
          .map((arg) => arg.text)
          .join(" ");
        if (named) literals.push({ node, cls: named, viaAddClass: true });
      }
      ts.forEachChild(node, collect);
    };
    collect(source);
    literals.sort((a, b) => a.node.getStart(source) - b.node.getStart(source));

    literals.forEach((entry, index) => {
      if (!declaresCheckboxType(entry.node)) return;
      const owner = elementLiteralFor(entry.node);
      const ownClass = classOf(owner);
      const { line } = source.getLineAndCharacterOfPosition(owner.getStart(source));

      let borrowed = null;
      if (!ownClass) {
        // The nearest earlier literal that named a class is the ancestor this input is styled
        // through — the wrapper a call site classes one or two lines before creating the input.
        for (let back = index - 1; back >= 0; back -= 1) {
          if (!literals[back].cls || literals[back].cls === "(computed)") continue;
          if (literals[back].node === owner) continue;
          const at = source.getLineAndCharacterOfPosition(literals[back].node.getStart(source));
          borrowed = { cls: literals[back].cls, line: at.line + 1, viaAddClass: !!literals[back].viaAddClass };
          break;
        }
      }

      sites.push({
        file: rel,
        line: line + 1,
        classes: ownClass && ownClass !== "(computed)" ? ownClass.split(/\s+/).filter(Boolean) : [],
        computedClass: ownClass === "(computed)",
        borrowed,
      });
    });
  }
  return sites;
}

// ───────────────────────────────────────────────────────────────────
// 4. COLLECT — the rules that could style one
// ───────────────────────────────────────────────────────────────────

/**
 * Index the stylesheet by class, recording for each whether any rule naming it removes the native
 * appearance, and whether that rule reaches the input only through an ancestor.
 *
 * An earlier version collected only selectors containing `input[type=checkbox]`, so a rule written
 * as `.db-board-column-checkbox { … }` was invisible and its site was reported as styled by
 * nothing. Index by class and the question becomes answerable.
 */
function stylesheetIndex() {
  const text = readFileSync(join(REPO, "styles.css"), "utf8");
  const lines = text.split("\n");
  const byClass = new Map();

  lines.forEach((line, index) => {
    if (!line.includes("{") || line.trim().startsWith("@")) return;
    const selector = line.slice(0, line.indexOf("{")).trim();
    if (!selector || selector.includes("}")) return;

    // Look ahead to the block's closing brace for the declaration that matters.
    let body = "";
    for (let ahead = index; ahead < Math.min(lines.length, index + 40); ahead += 1) {
      body += lines[ahead] + "\n";
      if (lines[ahead].includes("}")) break;
    }
    const killsAppearance = /appearance:\s*none/.test(body);

    for (const m of selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      const cls = m[1];
      // Ancestor-scoped when something stands to the left of this class in the selector.
      const at = selector.indexOf(`.${cls}`);
      const before = selector.slice(0, at).trim();
      const entry = byClass.get(cls) || { rules: 0, killsAppearance: false, ancestorOnly: true };
      entry.rules += 1;
      if (killsAppearance) {
        entry.killsAppearance = true;
        if (before === "") entry.ancestorOnly = false;
      }
      byClass.set(cls, entry);
    }
  });
  return byClass;
}

// ───────────────────────────────────────────────────────────────────
// 5. JOIN
// ───────────────────────────────────────────────────────────────────

const sites = creationSites();
const index = stylesheetIndex();

if (sites.length === 0 || index.size === 0) {
  console.error(`checkbox-inventory: sites=${sites.length} classes=${index.size} — the scan matched`);
  console.error("nothing, which is not the same as a tree with no checkboxes.");
  process.exit(2);
}

const classless = sites.filter((s) => s.classes.length === 0);
const named = sites.filter((s) => s.classes.length > 0);
const unmentioned = named.filter((s) => !s.classes.some((c) => index.has(c)));
const noAppearanceRule = named.filter((s) =>
  s.classes.some((c) => index.has(c)) && !s.classes.some((c) => index.get(c)?.killsAppearance)
);

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

console.log(`checkbox-inventory: ${sites.length} creation sites, ${index.size} classes in the stylesheet\n`);
console.log(`  classless — styled only through an ancestor, if at all   ${classless.length}`);
console.log(`  named by a class the stylesheet never mentions           ${unmentioned.length}`);
console.log(`  mentioned, but by no rule removing the native appearance ${noAppearanceRule.length}\n`);
console.log("  Whether a given checkbox ACTUALLY computes appearance:none is a runtime question —");
console.log("  it depends on which selectors match, in what order, under which ancestors. This is the");
console.log("  inventory the runtime check measures against, not a verdict on any single site.\n");

if (classless.length) {
  console.log("CLASSLESS — the input carries no class, so only an ancestor can reach it:");
  for (const c of classless) {
    console.log(`  ${c.file}:${c.line}`);
    console.log(`    nearest classed element: .${c.borrowed?.cls ?? "(none found)"} (line ${c.borrowed?.line ?? "?"})`);
  }
  console.log("");
}
if (unmentioned.length) {
  console.log("UNMENTIONED — the stylesheet contains no selector naming these classes at all:");
  for (const u of unmentioned) console.log(`  ${u.file}:${u.line}  .${u.classes.join(" .")}`);
  console.log("");
}
if (noAppearanceRule.length) {
  console.log("NO APPEARANCE RULE — a rule names the class, but none of them removes the native box:");
  for (const n of noAppearanceRule) console.log(`  ${n.file}:${n.line}  .${n.classes.join(" .")}`);
  console.log("");
}

stamp("tools/live/checkbox-inventory.json", {
  totals: {
    sites: sites.length,
    classless: classless.length,
    unmentioned: unmentioned.length,
    noAppearanceRule: noAppearanceRule.length,
  },
  classless,
  unmentioned,
  noAppearanceRule,
  sites,
}, ["styles.css", "tools/live/checkbox-inventory.mjs"]);
