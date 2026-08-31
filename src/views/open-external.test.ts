// ───────────────────────────────────────────────────────────────────
// MODULE:    open-external.test
// COMPONENT: the allowlist and the opener severance, and that nothing bypasses them
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The last suite reads the renderers' source to prove no second way to open a URL exists.
   Scoped to this test, which never ships. */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openExternalUrl } from "./open-external";

// ───────────────────────────────────────────────────────────────────
// 1. HARNESS
// ───────────────────────────────────────────────────────────────────

function withStubbedWindow(): { open: ReturnType<typeof vi.fn> } {
  const open = vi.fn();
  Object.defineProperty(globalThis, "window", { value: { open }, configurable: true, writable: true });
  return { open };
}

afterEach(() => {
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "window");
});

// ───────────────────────────────────────────────────────────────────
// 2. WHAT IT REFUSES
// ───────────────────────────────────────────────────────────────────

describe("openExternalUrl", () => {
  // The exact strings, not a description of them: a rule stated in prose can be satisfied by a
  // guard that rejects for some unrelated reason, and these are the inputs that must not open.
  it.each([
    ["javascript:", "javascript:alert(document.domain)#x.png"],
    ["data: with an html payload", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==#a.png"],
    ["file:", "file:///etc/passwd#x.png"],
  ])("refuses %s and does not call window.open at all", (_label, target) => {
    const { open } = withStubbedWindow();

    expect(openExternalUrl(target)).toBe(false);
    // Not "opened something harmless" — nothing was opened. A guard that rewrote the target and
    // opened anyway would still be handing the browser a navigation the user did not ask for.
    expect(open).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────
  // 3. WHAT IT ALLOWS, AND HOW
  // ───────────────────────────────────────────────────────────────────

  it("opens an https target with the opener severed", () => {
    const { open } = withStubbedWindow();

    expect(openExternalUrl("https://example.com/real.png")).toBe(true);
    expect(open).toHaveBeenCalledWith("https://example.com/real.png", "_blank", "noopener,noreferrer");
  });

  it("upgrades a bare domain rather than refusing it", () => {
    const { open } = withStubbedWindow();

    expect(openExternalUrl("example.com/page")).toBe(true);
    expect(open).toHaveBeenCalledWith("https://example.com/page", "_blank", "noopener,noreferrer");
  });

  // ───────────────────────────────────────────────────────────────────
  // 4. THAT THERE IS NO SECOND DOOR
  // ───────────────────────────────────────────────────────────────────

  // The two suites above prove this function is safe. They say nothing about whether the renderers
  // use it — and before this phase there were ten bare `window.open` calls that did not. A guard
  // with a way around it is not a guard, and that fact lives in the source rather than in any
  // single behaviour, so this is the one thing here worth asserting by reading it.
  it("is the only place in src/ that calls window.open", () => {
    const root = resolve(__dirname, "..");
    const offenders: string[] = [];

    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = resolve(dir, entry.name);
        if (entry.isDirectory()) { walk(path); continue; }
        if (!entry.name.endsWith(".ts")) continue;
        if (entry.name.endsWith(".test.ts")) continue;
        if (path === resolve(__dirname, "open-external.ts")) continue;
        const source = readFileSync(path, "utf-8");
        if (/\bwindow\s*\.\s*open\s*\(/.test(source)) offenders.push(path.slice(root.length + 1));
      }
    };
    walk(root);

    expect(offenders).toEqual([]);
  });
});
