// ───────────────────────────────────────────────────────────────────
// MODULE:    vault-read-obsidian-stub
// COMPONENT: "obsidian" module stand-in with a working TFile/Vault/MetadataCache/App
// ───────────────────────────────────────────────────────────────────
//
// The catalogue's own stub (`tools/storybook/obsidian-stub.mjs`) deliberately throws for
// TFile/Vault/MetadataCache/App/EventRef/Notice/getAllTags/parseYaml/stringifyYaml — those reach
// the vault or the metadata cache, out of scope for a presentational catalogue that never mounts a
// data source. A harness proving DataSource's own read/cache behavior needs exactly those to
// actually work, so this module re-exports everything else from that stub (icons, tooltip,
// normalizePath, Platform) and replaces only the vault-facing surface with small, honest
// implementations: a real TFile with path/basename/stat, a Vault over an in-memory file list, a
// MetadataCache whose readiness the calling script drives directly (construct it genuinely cold,
// then resolve one file or all of them, on cue, exactly like the timing this harness exists to
// pin down), and a minimal App wiring the two together.

export * from "../storybook/obsidian-stub.mjs";

// ───────────────────────────────────────────────────────────────────
// 1. FILE & EVENT PRIMITIVES
// ───────────────────────────────────────────────────────────────────

export class TFile {
  constructor({ path, ctime = 0, mtime = 0, size = 0 }) {
    this.path = path;
    const slash = path.lastIndexOf("/");
    this.name = slash >= 0 ? path.slice(slash + 1) : path;
    const dot = this.name.lastIndexOf(".");
    this.basename = dot > 0 ? this.name.slice(0, dot) : this.name;
    this.extension = dot > 0 ? this.name.slice(dot + 1) : "";
    this.parent = slash >= 0 ? { path: path.slice(0, slash) } : null;
    this.stat = { ctime, mtime, size };
  }
}

class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  on(name, cb) {
    const set = this.listeners.get(name) || new Set();
    set.add(cb);
    this.listeners.set(name, set);
    return { offref: () => set.delete(cb) };
  }
  trigger(name, ...args) {
    for (const cb of [...(this.listeners.get(name) || [])]) cb(...args);
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. VAULT
// ───────────────────────────────────────────────────────────────────

export class Vault extends EventBus {
  constructor(files) {
    super();
    this.files = files;
  }
  getMarkdownFiles() {
    return this.files.filter((f) => f.extension === "md");
  }
  getAbstractFileByPath(path) {
    return this.files.find((f) => f.path === path) || null;
  }
  async cachedRead() { return ""; }
  async read() { return ""; }
  async create() { throw new Error("vault-read-obsidian-stub: Vault.create is a read-only stand-in"); }
  async modify() { throw new Error("vault-read-obsidian-stub: Vault.modify is a read-only stand-in"); }
}

// ───────────────────────────────────────────────────────────────────
// 3. METADATA CACHE — the readiness surface this harness drives directly
// ───────────────────────────────────────────────────────────────────

export class MetadataCache extends EventBus {
  constructor() {
    super();
    this.frontmatterByPath = new Map();
    this.resolvedPaths = new Set();
  }

  /** Test driver: sets the frontmatter a path will report once resolved, without resolving it. */
  seed(path, frontmatter) {
    this.frontmatterByPath.set(path, frontmatter);
  }

  /** Test driver: marks one file resolved and fires the named per-file event for it — the shape
   *  a real metadata-cache update takes (`"changed"`, or `"create"`/`"rename"` off the Vault). */
  resolveFile(file, eventTarget, eventName) {
    this.resolvedPaths.add(file.path);
    eventTarget.trigger(eventName, file);
  }

  /** Test driver: marks every given path resolved with no per-file event — the shape a bulk
   *  initial-load completion takes if the only signal fired is the identity-less `"resolved"`. */
  resolveAllSilently(paths) {
    for (const path of paths) this.resolvedPaths.add(path);
  }

  /** Test driver: fires `"resolved"`, which carries no file identity, matching the real API. */
  fireResolved() {
    this.trigger("resolved");
  }

  getFileCache(file) {
    if (!this.resolvedPaths.has(file.path)) return undefined;
    return { frontmatter: this.frontmatterByPath.get(file.path) || {} };
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. APP
// ───────────────────────────────────────────────────────────────────

export class App {
  constructor(vault, metadataCache) {
    this.vault = vault;
    this.metadataCache = metadataCache;
    this.workspace = { getLeaf: () => ({}) };
    this.fileManager = {
      processFrontMatter: async () => {
        throw new Error("vault-read-obsidian-stub: fileManager.processFrontMatter is a read-only stand-in");
      },
      trashFile: async () => {},
      renameFile: async () => {},
    };
  }
}

export class EventRef {}
export class Notice {
  constructor() {}
}
export function getAllTags() {
  return [];
}
export function parseYaml() {
  return {};
}
export function stringifyYaml(value) {
  return JSON.stringify(value);
}
