// ───────────────────────────────────────────────────────────────────
// MODULE:    i18n.test
// COMPONENT: the dictionary-level copy rules — one ellipsis spelling, and no locale
//            keeping a pointer gesture its English dropped
// ───────────────────────────────────────────────────────────────────
//
// The dictionaries are plain objects, so nothing here can import them: the
// module exports only the lookup, not the data. These clauses therefore read
// the source the same way the key-coverage suite does — from disk — because
// the property they hold lives in the source text itself. The sheet-grammar
// lane measures the same copy through the shipped t() lookup at what a phone
// sheet actually renders; this suite holds the dictionary that lookup reads,
// so a regression here fails before any sheet mounts.
//
// The gesture patterns deliberately distinguish pointer words (click, its
// compounds and hover) from touch words (tap, 轻点): a phone cannot click,
// so a string it renders must not say click, in any locale. Dragging IS a
// touch gesture and is not in the pattern.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the dictionary source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 1. DICTIONARY EXTRACTION
// ───────────────────────────────────────────────────────────────────

const DICT_SOURCE = readFileSync(resolve(__dirname, "i18n.ts"), "utf-8");

/** A dictionary block's key → value pairs, read straight out of the source. */
const readDictionary = (name: string): Record<string, string> => {
  const block = DICT_SOURCE.match(new RegExp(`const ${name}: Dictionary = \\{([\\s\\S]*?)\\n\\};`));
  expect(block, `the ${name} dictionary block is missing from i18n.ts — has its declaration moved?`).toBeTruthy();
  const entries: Record<string, string> = {};
  // A missed parse must not pass quietly: the key-count guard below catches it.
  for (const match of block![1].matchAll(/"([^"]+)":\s"((?:[^"\\]|\\.)*)"/g)) {
    entries[match[1]] = match[2];
  }
  return entries;
};

const en = readDictionary("en");
const zhCN = readDictionary("zhCN");
const zhTW = readDictionary("zhTW");

// The guard: a parse that silently captured three keys would make every
// "zero violations" clause below vacuous.
const MIN_KEY_COUNT = 1000;

describe("the i18n dictionaries parse in full", () => {
  for (const [name, dict] of [["en", en], ["zhCN", zhCN], ["zhTW", zhTW]] as const) {
    it(`the ${name} dictionary carries more than ${MIN_KEY_COUNT} keys, not a stub`, () => {
      expect(Object.keys(dict).length).toBeGreaterThan(MIN_KEY_COUNT);
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 2. ONE ELLIPSIS SPELLING, ACROSS ALL THREE LOCALES
// ───────────────────────────────────────────────────────────────────

// The settled spelling is the typographic one: a truncated affordance ends in
// U+2026, never in three periods. Each dictionary must carry at least one
// spelled-ellipsis key (a zero there means the scan lost the values) and no
// three-period spelling anywhere — the old 13-against-10 split fails here.
describe("one ellipsis spelling across every dictionary", () => {
  for (const [name, dict] of [["en", en], ["zhCN", zhCN], ["zhTW", zhTW]] as const) {
    it(`the ${name} dictionary ends its truncations with U+2026 only`, () => {
      let ascii = 0;
      let u2026 = 0;
      for (const value of Object.values(dict)) {
        if (value.includes("...")) ascii += 1;
        if (value.includes("…")) u2026 += 1;
      }
      expect(u2026).toBeGreaterThan(0);
      expect(ascii).toBe(0);
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 3. A PROPERTY IS CALLED BY ONE WORD ON THE SHEET SURFACES
// ───────────────────────────────────────────────────────────────────

// The sheet-facing label (the dropdown heading the filter, sort and property-visibility
// panels give the property picker) and the filter rules' own field label are the same
// concept, so they must resolve to the same word in every locale. They are visually
// hidden (`hideLabel: true`) — read by assistive tech, not painted — which is why the
//Screenshot corpus cannot catch this divergence and the dictionary must.
const PROPERTY_LABEL_PAIRS = [
  ["panel.field", "filter.field"],
] as const;

for (const [labelKey, otherKey] of PROPERTY_LABEL_PAIRS) {
  it(`the property label is one word: "${labelKey}" resolves exactly as "${otherKey}" in every locale`, () => {
    for (const [name, dict] of [["en", en], ["zh-CN", zhCN], ["zh-TW", zhTW]] as const) {
      expect(dict[labelKey], `${name}["${labelKey}"]`)
        .toBe(dict[otherKey] ?? dict[otherKey]);
    }
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. NO KEY THAT LOST ITS POINTER GESTURE IN ENGLISH KEEPS ONE
// ───────────────────────────────────────────────────────────────────

const GESTURE_EN = /click|hover/i;
const GESTURE_ZH = /点击|點擊|单击|單擊|雙擊|双击|點選|懸停|悬停/;

// The keys whose English no longer names a pointer gesture a phone cannot
// perform. Their translations moved with them: a locale may not silently
// keep 双击 or 点击 when the English dropped the gesture.
const GESTURELESS_KEYS = [
  "panel.emptyFilters",
  "panel.emptySorts",
  "panel.doubleClickEdit",
  "viewConfig.computedSync.manualHint",
  "viewConfig.computedSync.manualDesc",
];

describe("no key that lost its pointer gesture in English keeps one in a locale", () => {
  for (const key of GESTURELESS_KEYS) {
    it(`no gesture survives in any locale of "${key}"`, () => {
      expect(GESTURE_EN.test(en[key] ?? ""), `en["${key}"] = "${en[key] ?? "MISSING"}"`).toBe(false);
      for (const [name, dict] of [["zh-CN", zhCN], ["zh-TW", zhTW]] as const) {
        const value = dict[key] ?? en[key];
        expect(GESTURE_ZH.test(value), `${name}["${key}"] = "${value}"`).toBe(false);
      }
    });
  }
});
