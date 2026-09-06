// ───────────────────────────────────────────────────────────────────
// MODULE:    manifest-schema.test
// COMPONENT: the reference-entry contract, read against the tree as it stands today
// ───────────────────────────────────────────────────────────────────
//
// The fact this module exists to answer: a second reference product cannot enter the manifest
// yet. `validateManifestEntry` hard-codes `group === "project-manager"` and a two-item
// `REFERENCE_RENDERERS` allowlist, so an otherwise well-formed reference entry for a different
// product is rejected today, not merely untested. This suite pins that current, narrower
// behavior as an observed red rather than an assumption — the negative control a later widening
// of the contract must still pass.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { validateManifestEntry } from "./manifest-schema.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. A WELL-FORMED PROJECT MANAGER REFERENCE ENTRY
// ───────────────────────────────────────────────────────────────────

function pmGanttEntry(overrides = {}) {
  return {
    id: "reference-gantt-desktop-light",
    file: "screenshots/project-manager/reference-gantt-desktop-light.png",
    theme: "light",
    device: "desktop",
    pixelHash: "deadbeef",
    sourceHashes: { "gantt.css": "abc123" },
    source: "reference",
    renderer: "pm-gantt",
    group: "project-manager",
    referenceOf: "constructed-timeline",
    ...overrides,
  };
}

describe("validateManifestEntry accepts the shape it was built for", () => {
  it("passes a well-formed project-manager reference entry", () => {
    expect(validateManifestEntry(pmGanttEntry())).toEqual({ ok: true, problems: [] });
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. A SECOND REFERENCE PRODUCT, REJECTED TODAY
// ───────────────────────────────────────────────────────────────────

describe("validateManifestEntry rejects a second reference product today", () => {
  it("rejects a group other than project-manager", () => {
    const result = validateManifestEntry(pmGanttEntry({ group: "anytype" }));
    expect(result.ok).toBe(false);
    expect(result.problems.some((p) => p.includes("project-manager"))).toBe(true);
  });

  it("rejects a renderer outside pm-kanban/pm-gantt even under the project-manager group", () => {
    const result = validateManifestEntry(pmGanttEntry({ renderer: "anytype-set-kanban" }));
    expect(result.ok).toBe(false);
    expect(result.problems.some((p) => p.includes("pm-kanban") || p.includes("pm-gantt"))).toBe(true);
  });

  it("rejects a reference entry with no referenceOf", () => {
    const result = validateManifestEntry(pmGanttEntry({ referenceOf: undefined }));
    expect(result.ok).toBe(false);
    expect(result.problems.some((p) => p.includes("referenceOf"))).toBe(true);
  });

  // `startsWith` is a textual prefix check on its own, so a `file` value carrying a literal ".."
  // segment reads as prefixed by its capture root string even though the path it resolves to
  // escapes that root. The prefix test alone therefore says nothing about where the file lands,
  // which is the only thing it is asked for.
  it("rejects a file path escaping its capture root through a .. segment", () => {
    const result = validateManifestEntry(
      pmGanttEntry({ file: "screenshots/project-manager/../../etc/passwd.png" })
    );
    expect(result.ok).toBe(false);
    expect(result.problems.some((p) => p.includes("escapes"))).toBe(true);
  });

  // The same escape spelled through the constructed root, so the guard is shown to sit on the
  // path rather than on the one reference prefix.
  it("rejects the same escape under the constructed capture root", () => {
    const result = validateManifestEntry(
      pmGanttEntry({ source: undefined, renderer: undefined, group: undefined, referenceOf: undefined,
        file: "screenshots/notion-clone/../../etc/passwd.png" })
    );
    expect(result.ok).toBe(false);
    expect(result.problems.some((p) => p.includes("escapes"))).toBe(true);
  });
});
