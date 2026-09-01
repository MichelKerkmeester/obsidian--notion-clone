// ───────────────────────────────────────────────────────────────────
// MODULE:    probe-exit-codes.test
// COMPONENT: the three codes 009 exists to keep apart
// ───────────────────────────────────────────────────────────────────
//
// `009` asks that the probe "exits non-zero when an assertion fails and zero when it passes;
// infrastructure failure is a distinct exit 2", and recorded it as unreachable because no probe
// existed. One does, with exactly those codes — and nothing checked them.
//
// The ASKING needs a running Obsidian and stays unreachable from this repository. The DECISION is a
// pure function of whatever the app said, and that is reachable here, which is the whole reason it
// was lifted out of `checkTransport`.
//
// The distinction under test is the packet's founding one: a caller that reads "could not ask" as
// "nothing wrong" has rebuilt the blindness. So the cases that matter most are the ones that could
// plausibly be miscoded as a pass.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  transportVerdict,
  EXIT_PASS,
  EXIT_ASSERTION,
  EXIT_INFRASTRUCTURE,
} from "./probe.mjs";

const loaded = {
  ok: true,
  kind: "value",
  value: { vault: "Notes", plugin: true, version: "1.3.9", theme: "dark", navbar: false },
};

// ───────────────────────────────────────────────────────────────────
// 2. THE THREE CODES ARE THREE DIFFERENT ANSWERS
// ───────────────────────────────────────────────────────────────────

describe("the probe separates a wrong product from a question it could not ask", () => {
  it("exits 0 when the app answered and the plugin is loaded", () => {
    const verdict = transportVerdict(loaded);
    expect(verdict.exit).toBe(EXIT_PASS);
    expect(verdict.err).toEqual([]);
    // The vault name is in the output because it is the thing no fixture can fabricate.
    expect(verdict.out.join("\n")).toContain("Notes");
  });

  it("exits 1 when the app answered and the plugin is NOT loaded", () => {
    const verdict = transportVerdict({ ...loaded, value: { ...loaded.value, plugin: false } });
    expect(verdict.exit).toBe(EXIT_ASSERTION);
    expect(verdict.err.join("\n")).toContain("not loaded");
  });

  it("exits 2 when the app could not be asked at all", () => {
    const verdict = transportVerdict({ ok: false, kind: "infrastructure", reason: "Obsidian is not running" });
    expect(verdict.exit).toBe(EXIT_INFRASTRUCTURE);
    expect(verdict.err.join("\n")).toContain("not running");
  });

  it("gives the three states three different codes", () => {
    // Stated as a set rather than three separate assertions, because the defect this guards is two
    // of them collapsing onto one another — which each assertion above would still pass.
    const codes = new Set([EXIT_PASS, EXIT_ASSERTION, EXIT_INFRASTRUCTURE]);
    expect(codes.size).toBe(3);
    expect(EXIT_PASS).toBe(0);
    expect(EXIT_ASSERTION).not.toBe(0);
    expect(EXIT_INFRASTRUCTURE).not.toBe(EXIT_ASSERTION);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE ANSWERS THAT LOOK LIKE PASSES AND ARE NOT
// ───────────────────────────────────────────────────────────────────

describe("a malformed answer is not a pass", () => {
  it("reads unparseable output as infrastructure, not as a failing product", () => {
    // The CLI printing a banner instead of JSON says nothing about the plugin. Coding it as 1
    // would report a product defect nobody has evidence for; coding it 0 is worse.
    const verdict = transportVerdict({ ok: true, kind: "text", value: "Obsidian v1.5.3" });
    expect(verdict.exit).toBe(EXIT_INFRASTRUCTURE);
  });

  it("reads an empty payload as infrastructure", () => {
    expect(transportVerdict({ ok: true, kind: "value", value: null }).exit)
      .toBe(EXIT_INFRASTRUCTURE);
  });

  it("reads no result at all as infrastructure", () => {
    expect(transportVerdict(undefined).exit).toBe(EXIT_INFRASTRUCTURE);
  });
});
