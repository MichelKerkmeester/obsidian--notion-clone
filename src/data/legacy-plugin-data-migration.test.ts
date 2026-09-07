// ───────────────────────────────────────────────────────────────────
// MODULE:    legacy-plugin-data-migration.test
// COMPONENT: the copy-never-move data.json bridge, and what it must never do
// ───────────────────────────────────────────────────────────────────
//
// The rename's whole safety story rests on this being a copy: an existing install must survive
// with its settings intact, and the old folder must survive untouched so nothing here is a
// one-way door. So besides the happy path, this covers every edge `spec.md` §8 names by name.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { migrateLegacyPluginData, type LegacyMigrationAdapter } from "./legacy-plugin-data-migration";

function fakeAdapter(files: Record<string, string>): LegacyMigrationAdapter & { files: Record<string, string> } {
  return {
    files,
    async exists(path) {
      return Object.prototype.hasOwnProperty.call(this.files, path);
    },
    async read(path) {
      if (!Object.prototype.hasOwnProperty.call(this.files, path)) throw new Error(`ENOENT: ${path}`);
      return this.files[path];
    },
    async write(path, data) {
      this.files[path] = data;
    },
  };
}

// A fake adapter's path strings, not a real Vault.adapter call — the function under test takes
// its paths as plain arguments and never looks up the vault's actual config directory itself, so
// there is no `Vault#configDir` to call here.
// eslint-disable-next-line obsidianmd/hardcoded-config-path
const OLD = ".obsidian/plugins/note-database/data.json";
// eslint-disable-next-line obsidianmd/hardcoded-config-path
const NEW = ".obsidian/plugins/obnotion/data.json";

// ───────────────────────────────────────────────────────────────────
// 2. CASES
// ───────────────────────────────────────────────────────────────────

describe("migrateLegacyPluginData", () => {
  it("copies the old folder's data.json into the new folder, byte-identical, leaving the source in place", async () => {
    const adapter = fakeAdapter({ [OLD]: '{"databases":[{"id":"d1"}]}' });

    const result = await migrateLegacyPluginData(adapter, OLD, NEW);

    expect(result).toEqual({ copied: true, reason: "copied" });
    expect(adapter.files[NEW]).toBe(adapter.files[OLD]);
    expect(adapter.files[OLD]).toBe('{"databases":[{"id":"d1"}]}');
  });

  it("does nothing when the new folder already has data, even if the old one also does", async () => {
    const adapter = fakeAdapter({ [OLD]: '{"databases":[{"id":"old"}]}', [NEW]: '{"databases":[{"id":"new"}]}' });

    const result = await migrateLegacyPluginData(adapter, OLD, NEW);

    expect(result).toEqual({ copied: false, reason: "already-present" });
    expect(adapter.files[NEW]).toBe('{"databases":[{"id":"new"}]}');
  });

  it("does nothing when the old folder has no data.json to copy", async () => {
    const adapter = fakeAdapter({});

    const result = await migrateLegacyPluginData(adapter, OLD, NEW);

    expect(result).toEqual({ copied: false, reason: "no-legacy-data" });
    expect(adapter.files[NEW]).toBeUndefined();
  });

  it("copies an unparseable old data.json verbatim rather than dropping it", async () => {
    const adapter = fakeAdapter({ [OLD]: "{not valid json" });

    const result = await migrateLegacyPluginData(adapter, OLD, NEW);

    expect(result.copied).toBe(true);
    expect(adapter.files[NEW]).toBe("{not valid json");
  });

  it("a second run after a successful copy is a no-op, satisfying 'logged once' by construction", async () => {
    const adapter = fakeAdapter({ [OLD]: '{"databases":[]}' });

    await migrateLegacyPluginData(adapter, OLD, NEW);
    const second = await migrateLegacyPluginData(adapter, OLD, NEW);

    expect(second).toEqual({ copied: false, reason: "already-present" });
  });
});
