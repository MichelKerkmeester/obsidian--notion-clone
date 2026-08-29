// ───────────────────────────────────────────────────────────────────
// MODULE:    obsidian-stub
// COMPONENT: the "obsidian" module, for presentational components only
// ───────────────────────────────────────────────────────────────────
//
// Stands in for the `obsidian` package when bundling stories. Deliberately
// tiny: the presentational layer imports almost nothing from it — `setIcon`
// (37 call sites) and `setTooltip` (16) account for nearly all of it, and the
// row, popover, colour-picker and type-icon modules import either just
// `setIcon` or nothing at all.
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
export const TFile = outOfScope("TFile");
export const TFolder = outOfScope("TFolder");
export const Modal = outOfScope("Modal");
export const Notice = outOfScope("Notice");
export const Menu = outOfScope("Menu");
export const MenuItem = outOfScope("MenuItem");
export const Setting = outOfScope("Setting");
export const WorkspaceLeaf = outOfScope("WorkspaceLeaf");
export const FuzzySuggestModal = outOfScope("FuzzySuggestModal");
export const parseYaml = outOfScope("parseYaml");
export const stringifyYaml = outOfScope("stringifyYaml");
export const getAllTags = outOfScope("getAllTags");
