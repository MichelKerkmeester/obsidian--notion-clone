// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-trace.test
// COMPONENT: the device trace records nothing until it is asked to, and no content ever
// ───────────────────────────────────────────────────────────────────
//
// Two properties carry the whole justification for shipping a diagnostic in a release build, and
// neither is visible by reading a call site. The first is that it is inert while off: the producer
// hooks are behind a boolean, and a trace that allocated or subscribed anyway would be a cost
// everyone pays for a defect one person has. The second is that it records no content — the
// operator is asked to paste this into a conversation, and a log carrying note text would make that
// an unreasonable thing to ask of them.
//
// A hand-built document rather than jsdom, for the reason overlay-stack.test gives: what is under
// test is which listeners get installed, not an engine's dispatch semantics. The no-content
// property is checked against the source, because the recorder narrows its target with
// `instanceof Element` and this environment has no such global to satisfy.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The no-content guard below reads this module's source, which needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  beginSheetGeneration,
  clearSheetTrace,
  isSheetTraceEnabled,
  readSheetTrace,
  setSheetTraceEnabled,
  traceSheet,
} from "./sheet-trace";

interface FakeDoc {
  listeners: Map<string, EventListener>;
}

function createDocument(): Document & FakeDoc {
  const listeners = new Map<string, EventListener>();
  return {
    listeners,
    defaultView: { visualViewport: undefined } as unknown as Window,
    addEventListener(type: string, listener: EventListener) { listeners.set(type, listener); },
    removeEventListener(type: string) { listeners.delete(type); },
  } as unknown as Document & FakeDoc;
}

afterEach(() => {
  setSheetTraceEnabled(false, undefined);
  clearSheetTrace();
});

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("sheet trace", () => {
  it("records nothing and subscribes to nothing while it is off", () => {
    const doc = createDocument();
    expect(isSheetTraceEnabled()).toBe(false);
    traceSheet("sheet-open", "db-filter-panel");
    beginSheetGeneration("db-filter-panel");
    expect(doc.listeners.size).toBe(0);
    expect(readSheetTrace()).toContain("not recording");
  });

  it("subscribes on the named document and releases every listener when turned off", () => {
    const doc = createDocument();
    setSheetTraceEnabled(true, doc);
    // Capture-phase listeners for the whole tap sequence: the fork this exists to settle is whether
    // a click arrives at all and on what, so a subset would answer half the question.
    expect([...doc.listeners.keys()].sort())
      .toEqual(["click", "pointerdown", "touchend", "touchstart"]);
    setSheetTraceEnabled(false, doc);
    expect(doc.listeners.size).toBe(0);
  });

  it("groups events under the generation of the sheet that was open", () => {
    setSheetTraceEnabled(true, createDocument());
    beginSheetGeneration("db-filter-panel");
    traceSheet("panel-refill", "filter");
    beginSheetGeneration("db-sort-panel");
    traceSheet("dismiss", "outside-pointerdown");
    const lines = readSheetTrace().split("\n");
    // A generation begins at a mount, so the refill belongs to the sheet that was open when it
    // happened and the dismissal to the one after it. Without that a reader has to reconstruct
    // which surface an event belonged to from timestamps alone.
    expect(lines.find((line) => line.includes("panel-refill"))).toContain("g1");
    expect(lines.find((line) => line.includes("dismiss"))).toContain("g2");
  });

  it("cannot record note content, because it never reads any", () => {
    // Asserted against the source rather than through a dispatched event: the recorder narrows an
    // EventTarget with `instanceof Element`, which does not exist in this environment, so the one
    // reachable guard is that the property names capable of carrying content never appear. A trace
    // the operator is asked to paste into a conversation has to be safe to paste by construction,
    // not by the reviewer of the day remembering to check.
    const source = readFileSync(resolve(__dirname, "./sheet-trace.ts"), "utf-8");
    for (const leak of ["textContent", "innerText", "innerHTML", ".value", "dataset", "getAttribute"]) {
      expect(source).not.toContain(leak);
    }
    // And the things it does read, so the guard above cannot pass by the recorder reading nothing.
    expect(source).toContain("target.tagName");
    expect(source).toContain("target.className");
  });

  it("survives more events than it can hold and keeps the most recent", () => {
    setSheetTraceEnabled(true, createDocument());
    for (let i = 0; i < 600; i += 1) traceSheet("click", `mark-${i}`);
    const text = readSheetTrace();
    // The end explains what just happened; a buffer that filled up and stopped would keep only the
    // part nobody asked about.
    expect(text).toContain("mark-599");
    expect(text).not.toContain("mark-0 ");
    expect(text.split("\n").length).toBeLessThanOrEqual(402);
  });
});
