// ───────────────────────────────────────────────────────────────────
// MODULE:    toast
// COMPONENT: source assertions for the shared feedback surface
// ───────────────────────────────────────────────────────────────────
//
// Asserts against source text rather than a rendered DOM: vitest runs these suites under a plain
// Node environment with no `document`, so a component that mounts real elements is exercised by
// the browser-backed capture and placement harnesses instead, and this stays the cheap regression
// guard that a later edit did not quietly drop a severity pairing, the auto-dismiss budget, or the
// accessible wiring the component promises.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const toastSource = readFileSync(resolve(__dirname, "./toast.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. STRUCTURE ASSERTIONS
// ───────────────────────────────────────────────────────────────────

describe("toast", () => {
  it("exports the constructor every owned call site now migrates through", () => {
    expect(toastSource).toContain("export function showToast(");
  });

  it("pairs each severity with its own icon rather than colour alone", () => {
    expect(toastSource).toContain('options.severity === "success" ? "check" : "alert-triangle"');
    expect(toastSource).toContain('cls: `db-toast is-${options.severity}`');
  });

  it("auto-dismisses a success toast on the existing 2200ms budget and never times out an error one", () => {
    expect(toastSource).toMatch(/const AUTO_DISMISS_MS = 2200;/);
    expect(toastSource).toMatch(/if \(options\.severity === "success"\) timer = window\.setTimeout\(close, AUTO_DISMISS_MS\);/);
  });

  it("announces itself as a live status region", () => {
    expect(toastSource).toContain('role: "status"');
    expect(toastSource).toContain('"aria-live": "polite"');
    expect(toastSource).toContain('"aria-atomic": "true"');
  });

  it("gives the close control a real, keyboard-reachable button with an accessible name", () => {
    expect(toastSource).toMatch(/closeBtn = header\.createEl\("button",/);
    expect(toastSource).toContain('attr: { type: "button", "aria-label": t("common.close") }');
    expect(toastSource).toContain('setIcon(closeBtn, "x");');
  });

  it("wires the action's callback and closes on the click that triggered it", () => {
    expect(toastSource).toContain("void options.action?.onClick();\n      close();");
  });

  it("mounts on a db-surface stack so the token scale and reduced-motion reset both reach it", () => {
    expect(toastSource).toContain('cls: "db-surface db-toast-stack"');
  });

  it("stacks the newest toast in front rather than queuing it behind the visible one", () => {
    expect(toastSource).toContain("stack.prepend(card);");
  });

  it("clears its own timer on close so a dismissed toast cannot fire a stray auto-close later", () => {
    expect(toastSource).toMatch(/const close = \(\) => \{\s*\n\s*clearAutoDismiss\(\);\s*\n\s*card\.remove\(\);\s*\n\s*\};/);
  });
});
