// ───────────────────────────────────────────────────────────────────
// MODULE:    probe-navbar-compare.test
// COMPONENT: the cross-check's comparison, tested without the application
// ───────────────────────────────────────────────────────────────────
//
// The probe can only take its reading from a running Obsidian, which no automated run here has. That
// is a real limit on the READING and not on the COMPARISON: whether a live value agrees with what
// the harness models is arithmetic over two objects, and leaving it untestable would mean the one
// artefact the contract phase receives was produced by logic nothing ever checked.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { MODELLED_NAVBAR, compareNavbar } from "./probe.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. THE COMPARISON
// ───────────────────────────────────────────────────────────────────

describe("the live reading is compared against what the harness models", () => {
  it("agrees when the app reports what the stylesheet says", () => {
    // These are the values transcribed from the installed application stylesheet, which is what the
    // placement lane draws its own navbar with.
    expect(compareNavbar({ position: "fixed", height: 80, zIndex: "auto" }))
      .toEqual({ agrees: true, disagreements: [] });
  });

  it("tolerates a sub-pixel height but not a real one", () => {
    // A device reporting 80.4 is the same navbar; one reporting 72 is the number this harness used
    // to invent, and catching exactly that is why the artefact exists.
    expect(compareNavbar({ position: "fixed", height: 80.4, zIndex: "auto" }).agrees).toBe(true);
    const off = compareNavbar({ position: "fixed", height: 72, zIndex: "auto" });
    expect(off.agrees).toBe(false);
    expect(off.disagreements[0]).toContain("app 72px");
    expect(off.disagreements[0]).toContain("harness 80px");
  });

  it("reports a stacking context the harness does not model", () => {
    // The invented z-index: 100 that made a navbar win a hit test it does not win on a device.
    const off = compareNavbar({ position: "fixed", height: 80, zIndex: "100" });
    expect(off.agrees).toBe(false);
    expect(off.disagreements.join(" ")).toContain("z-index: app 100");
  });

  it("counts a field the app did not report as a disagreement, not a match", () => {
    // Treating absent as equal is how a cross-check certifies a harness against nothing.
    const missing = compareNavbar({});
    expect(missing.agrees).toBe(false);
    expect(missing.disagreements).toHaveLength(3);
    expect(missing.disagreements.join(" ")).toContain("(not reported)");
  });

  it("names every field it disagrees on, not just the first", () => {
    const off = compareNavbar({ position: "static", height: 44, zIndex: "9999" });
    expect(off.disagreements).toHaveLength(3);
  });

  it("models the values this repository actually draws with", () => {
    // A guard on the constant itself: if someone edits the model to match a reading rather than the
    // stylesheet, the artefact stops being a cross-check and becomes a mirror.
    expect(MODELLED_NAVBAR).toEqual({ position: "fixed", height: 80, zIndex: "auto" });
  });
});
