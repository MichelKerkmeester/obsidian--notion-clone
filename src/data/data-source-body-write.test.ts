// ───────────────────────────────────────────────────────────────────
// MODULE:    data-source-body-write.test
// COMPONENT: a body write and a property write on one file never interleave
// ───────────────────────────────────────────────────────────────────
//
// The body writer is the plugin's second writer onto a file it already writes,
// and the first that rewrites the whole file rather than a set of frontmatter
// keys. `processFrontMatter` calls were serialized because concurrent ones on
// the same file corrupt each other; a whole-file write reaches that same
// corruption from a direction a queue around only the frontmatter path cannot
// see.
//
// So the claim under test is not "the body write works". It is that the two
// writers take the file one at a time. The fixtures below make every IO step
// announce itself and then yield, so an unserialized pair WOULD interleave —
// and the last case proves exactly that by driving the same operations around
// the queue and asserting the interleaving appears. Without that control the
// assertion could be passing because nothing ever overlaps.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { App, TFile } from "obsidian";
import { DataSource } from "./data-source";

vi.mock("obsidian", () => ({
  App: class {},
  EventRef: class {},
  MetadataCache: class {},
  TFile: class {},
  Vault: class {},
  getAllTags: vi.fn(),
  normalizePath: (path: string) => path,
  parseYaml: vi.fn(),
  stringifyYaml: (value: Record<string, unknown>) =>
    Object.entries(value).map(([key, entry]) => `${key}: ${String(entry)}`).join("\n") + "\n",
}));

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { activeDocument: { documentElement: { lang: "en" } } },
});

// ───────────────────────────────────────────────────────────────────
// 2. AN OBSERVABLE VAULT
// ───────────────────────────────────────────────────────────────────

const PATH = "notes/record.md";
const START = "---\n# hand written\nzeta: last\nalpha: first\n---\n\nOriginal body.\n";

/** Yield long enough that anything genuinely concurrent gets a turn in between. */
const yieldTurn = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 1));

function makeVault() {
  const log: string[] = [];
  const state = { content: START };
  const file = { path: PATH, extension: "md" } as unknown as TFile;

  /** Every step announces its two edges, so an overlap shows up as an enter inside another pair. */
  const step = async <T>(label: string, run: () => T): Promise<T> => {
    log.push(`enter:${label}`);
    await yieldTurn();
    const result = run();
    await yieldTurn();
    log.push(`exit:${label}`);
    return result;
  };

  const app = {
    vault: {
      read: () => step("body-read", () => state.content),
      cachedRead: () => step("body-read", () => state.content),
      modify: (_target: TFile, next: string) => step("body-write", () => { state.content = next; }),
      getAbstractFileByPath: () => null,
    },
    metadataCache: { getFileCache: () => null },
    fileManager: {
      processFrontMatter: async (_target: TFile, mutate: (fm: Record<string, unknown>) => void) => {
        await step("frontmatter", () => {
          const parsed: Record<string, unknown> = {};
          const match = /^---\n([\s\S]*?)\n---\n/.exec(state.content);
          for (const line of (match?.[1] ?? "").split("\n")) {
            const pair = /^([^#:][^:]*):\s*(.*)$/.exec(line);
            if (pair) parsed[pair[1]] = pair[2];
          }
          mutate(parsed);
          const yaml = Object.entries(parsed).map(([k, v]) => `${k}: ${String(v)}`).join("\n");
          state.content = state.content.replace(/^---\n[\s\S]*?\n---\n/, `---\n${yaml}\n---\n`);
        });
      },
    },
  } as unknown as App;

  return { app, file, log, state };
}

/** No `enter` may appear while another label is still open. */
function interleavings(log: string[]): string[] {
  const found: string[] = [];
  let open: string | null = null;
  for (const entry of log) {
    const [edge, label] = entry.split(":");
    if (edge === "enter") {
      if (open !== null) found.push(`${label} started inside ${open}`);
      open = label;
      continue;
    }
    open = null;
  }
  return found;
}

// ───────────────────────────────────────────────────────────────────
// 3. SERIALIZATION
// ───────────────────────────────────────────────────────────────────

describe("DataSource body and frontmatter writes on one file", () => {
  it("does not interleave a body write with a property write", async () => {
    const { app, file, log } = makeVault();
    const dataSource = new DataSource(app);

    await Promise.all([
      dataSource.updateFrontmatter(file, { alpha: "changed" }),
      dataSource.updateNoteBody(file, "Rewritten body.\n"),
    ]);

    expect(interleavings(log)).toEqual([]);
  });

  it("loses neither write when both land together", async () => {
    const { app, file, state } = makeVault();
    const dataSource = new DataSource(app);

    await Promise.all([
      dataSource.updateFrontmatter(file, { alpha: "changed" }),
      dataSource.updateNoteBody(file, "Rewritten body.\n"),
    ]);

    expect(state.content).toContain("alpha: changed");
    expect(state.content).toContain("Rewritten body.");
    expect(state.content).not.toContain("Original body.");
  });

  it("keeps the hand-written frontmatter comment a property write would drop", async () => {
    const { app, file, state } = makeVault();
    const dataSource = new DataSource(app);

    await dataSource.updateNoteBody(file, "Rewritten body.\n");

    expect(state.content).toBe("---\n# hand written\nzeta: last\nalpha: first\n---\n\nRewritten body.\n");
  });

  it("writes nothing when the body has not changed", async () => {
    const { app, file, log } = makeVault();
    const dataSource = new DataSource(app);

    await dataSource.updateNoteBody(file, "Original body.\n");

    expect(log).toContain("enter:body-read");
    expect(log).not.toContain("enter:body-write");
  });

  it("serializes two body writes against each other", async () => {
    const { app, file, log, state } = makeVault();
    const dataSource = new DataSource(app);

    await Promise.all([
      dataSource.updateNoteBody(file, "First.\n"),
      dataSource.updateNoteBody(file, "Second.\n"),
    ]);

    expect(interleavings(log)).toEqual([]);
    expect(state.content).toContain("Second.");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE NEGATIVE CONTROL
// ───────────────────────────────────────────────────────────────────

describe("the interleaving check itself", () => {
  // Driving the same two operations around the queue has to trip the detector, or a green result
  // above would only mean the fixtures never overlap in the first place.
  it("reports an overlap when the same writes bypass the queue", async () => {
    const { app, file, log } = makeVault();
    const vault = app.vault as unknown as {
      read: () => Promise<string>;
      modify: (target: TFile, next: string) => Promise<void>;
    };
    const fileManager = app.fileManager as unknown as {
      processFrontMatter: (target: TFile, mutate: (fm: Record<string, unknown>) => void) => Promise<void>;
    };

    await Promise.all([
      fileManager.processFrontMatter(file, (fm) => { fm.alpha = "changed"; }),
      vault.read().then((content) => vault.modify(file, content)),
    ]);

    expect(interleavings(log).length).toBeGreaterThan(0);
  });
});
