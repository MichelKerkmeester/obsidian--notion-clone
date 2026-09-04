// ───────────────────────────────────────────────────────────────────
// MODULE:    constructed-capture.test
// COMPONENT: the constructed scenario contract — manifest marking, readiness refusal, fixture declaration
// ───────────────────────────────────────────────────────────────────
//
// The capture pipeline photographs two kinds of scenario: hand-written fixtures and
// constructed renders of the shipped renderers. The facts this suite exists to pin:
// a constructed capture is marked in the manifest so it can be told from a fixture,
// a constructed scenario that cannot signal readiness is refused before it runs, and
// every fixture that a constructed capture supersedes declares that relationship so
// the manifest can mark it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { validateManifestEntry } from "./manifest-schema.mjs";
import {
  CONSTRUCTED_SCENARIOS,
  validateConstructedScenario,
} from "./constructed-scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. MANIFEST SCHEMA
// ───────────────────────────────────────────────────────────────────

describe("manifest schema", () => {
  it("accepts a constructed entry carrying a per-view scenario id", () => {
    const entry = {
      id: "constructed-list",
      source: "constructed",
      renderer: "list",
      bag: "file-view",
      theme: "dark",
      device: "desktop",
      file: "screenshots/views/constructed-list-desktop-dark.png",
      pixelHash: "0123456789ab",
      sourceHashes: { "src/views/list-renderer.ts": "0123456789ab" },
    };
    expect(validateManifestEntry(entry).ok).toBe(true);
  });

  it("rejects a constructed entry without the view it photographs", () => {
    const entry = {
      id: "constructed-list",
      source: "constructed",
      theme: "dark",
      device: "desktop",
      file: "screenshots/views/constructed-list-desktop-dark.png",
      pixelHash: "0123456789ab",
      sourceHashes: {},
    };
    expect(validateManifestEntry(entry).ok).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. READINESS REFUSAL
// ───────────────────────────────────────────────────────────────────

describe("constructed scenario readiness", () => {
  it("refuses a constructed scenario whose mount carries no readiness signal", () => {
    // A synchronous mount returns before the renderer has signalled ready, so
    // there is nothing for the capture to wait on and the screenshot would
    // photograph an unmounted view.
    expect(() =>
      validateConstructedScenario({
        id: "constructed-list",
        mount: () => {},
      }),
    ).toThrow(/readiness/);
  });

  it("accepts a constructed scenario whose mount awaits the ready signal", () => {
    expect(() =>
      validateConstructedScenario({
        id: "constructed-list",
        mount: async () => null,
      }),
    ).not.toThrow();
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. REGISTRY COVERAGE
// ───────────────────────────────────────────────────────────────────

describe("constructed scenario registry", () => {
  it("registers one scenario per view with a constructed-<view> id", () => {
    const ids = CONSTRUCTED_SCENARIOS.map((s) => s.id).sort();
    expect(ids).toEqual([
      "constructed-board",
      "constructed-calendar-day",
      "constructed-calendar-month",
      "constructed-calendar-week",
      "constructed-chart",
      "constructed-gallery",
      "constructed-list",
      "constructed-table",
      "constructed-timeline",
    ]);
  });

  it("every registered constructed scenario passes the readiness check", () => {
    for (const scenario of CONSTRUCTED_SCENARIOS) {
      expect(() => validateConstructedScenario(scenario)).not.toThrow();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. FIXTURE DECLARATIONS
// ───────────────────────────────────────────────────────────────────

describe("fixture declarations", () => {
  it("marks every hand-written fixture the constructed captures supersede", async () => {
    const { SCENARIOS } = await import("./scenarios.mjs");
    const declared = SCENARIOS
      .filter((s) => s.fixtureOf)
      .map((s) => `${s.id} -> ${s.fixtureOf}`)
      .sort();
    expect(declared).toEqual([
      "board-view -> constructed-board",
      "calendar-month-view -> constructed-calendar-month",
      "calendar-week-time-grid -> constructed-calendar-week",
      "gallery-view -> constructed-gallery",
      "list-view -> constructed-list",
      "table-view -> constructed-table",
      "timeline-view -> constructed-timeline",
    ]);
  });

  it("every fixtureOf names a registered constructed scenario", async () => {
    const { SCENARIOS } = await import("./scenarios.mjs");
    const constructedIds = new Set(CONSTRUCTED_SCENARIOS.map((s) => s.id));
    for (const scenario of SCENARIOS) {
      if (!scenario.fixtureOf) continue;
      expect(constructedIds.has(scenario.fixtureOf)).toBe(true);
    }
  });
});
