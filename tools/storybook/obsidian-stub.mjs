// ───────────────────────────────────────────────────────────────────
// MODULE:    obsidian-stub
// COMPONENT: the "obsidian" module, for presentational components only
// ───────────────────────────────────────────────────────────────────
//
// Stands in for the `obsidian` package when bundling stories.
//
// It must export every name the source imports, not merely the ones a story
// touches: the bundler resolves the whole module graph, so one story pulling
// in a renderer that transitively imports a maths helper fails the build even
// though nothing calls it. An earlier, deliberately minimal stub broke exactly
// that way. `verify-coverage` now re-derives the required list from source, so
// the stub cannot silently fall behind the code again.
//
// The heavy exports — App, TFile, Modal, Notice, WorkspaceLeaf — belong to
// modules that reach the vault or the metadata cache. Those are out of scope
// for a catalogue and stay that way, so the stubs here throw rather than
// pretending. A story that trips one is asking for a surface that cannot
// honestly be rendered outside Obsidian, and should fail loudly.

// ───────────────────────────────────────────────────────────────────
// 1. RENDERING HELPERS
// ───────────────────────────────────────────────────────────────────

/**
 * A labelled placeholder rather than the real glyph.
 *
 * Obsidian ships Lucide and injects the SVG at runtime. Reproducing that here
 * would mean vendoring an icon set to make a catalogue look prettier, while
 * hiding which icon a component actually asked for. The placeholder carries
 * the icon id, which is the reviewable fact.
 */
export function setIcon(parent, iconId) {
  const el = parent.ownerDocument.createElement("span");
  el.className = "db-story-icon";
  el.setAttribute("data-icon", iconId);
  el.setAttribute("aria-hidden", "true");
  el.textContent = "◆";
  parent.appendChild(el);
  return el;
}

export function setTooltip(el, text) {
  el.setAttribute("aria-label", text);
  el.setAttribute("data-tooltip", text);
}

export function normalizePath(path) {
  return String(path).replace(/\\/g, "/").replace(/\/+/g, "/");
}

export const Platform = {
  isMobile: false,
  isPhone: false,
  isTablet: false,
  isDesktop: true,
};

// ───────────────────────────────────────────────────────────────────
// 2. OUT-OF-SCOPE SURFACES
// ───────────────────────────────────────────────────────────────────

/** Fail loudly: a story reaching these wants a surface the catalogue cannot honestly render. */
const outOfScope = (name) => {
  const fail = function () {
    throw new Error(
      `obsidian-stub: ${name} is not available outside Obsidian. This surface reaches the vault or `
      + `the metadata cache, so it cannot be rendered in the catalogue.`,
    );
  };
  return fail;
};

export const App = outOfScope("App");
export const CachedMetadata = outOfScope("CachedMetadata");
export const Component = outOfScope("Component");
export const EventRef = outOfScope("EventRef");
export const FileSystemAdapter = outOfScope("FileSystemAdapter");
export const FileView = outOfScope("FileView");
export const FuzzySuggestModal = outOfScope("FuzzySuggestModal");
export const HoverParent = outOfScope("HoverParent");
export const HoverPopover = outOfScope("HoverPopover");
export const MarkdownRenderChild = outOfScope("MarkdownRenderChild");
export const MarkdownRenderer = outOfScope("MarkdownRenderer");
export const MarkdownSectionInformation = outOfScope("MarkdownSectionInformation");
export const MarkdownView = outOfScope("MarkdownView");
export const Menu = outOfScope("Menu");
export const MenuItem = outOfScope("MenuItem");
export const MetadataCache = outOfScope("MetadataCache");
export const Modal = outOfScope("Modal");
export const Notice = outOfScope("Notice");
export const Plugin = outOfScope("Plugin");
export const PluginSettingTab = outOfScope("PluginSettingTab");
export const Scope = outOfScope("Scope");
export const Setting = outOfScope("Setting");
export const TFile = outOfScope("TFile");
export const TFolder = outOfScope("TFolder");
export const Vault = outOfScope("Vault");
export const ViewStateResult = outOfScope("ViewStateResult");
export const WorkspaceLeaf = outOfScope("WorkspaceLeaf");
export const finishRenderMath = outOfScope("finishRenderMath");
export const getAllTags = outOfScope("getAllTags");
export const getIconIds = outOfScope("getIconIds");
export const loadMathJax = outOfScope("loadMathJax");
export const parseYaml = outOfScope("parseYaml");
export const renderMath = outOfScope("renderMath");
export const stringifyYaml = outOfScope("stringifyYaml");
