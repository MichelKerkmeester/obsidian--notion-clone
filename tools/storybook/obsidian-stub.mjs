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
 * Real glyphs for the icons the render-assertion bundle actually mounts, a labelled placeholder
 * for everything else.
 *
 * Obsidian ships Lucide and injects the SVG at runtime; this project does not depend on Lucide
 * (`node_modules` carries no `lucide`/`lucide-static` package), so there is nothing to inline by
 * name. A text placeholder proved which icon a component asked for but drew nothing a screenshot
 * could recognise as a glyph — which is exactly what left the constructed captures unable to show
 * that a real icon renders, not only that some icon was requested. This carries hand-drawn
 * lucide-style paths for the icon names actually reachable from the render-assertion bundle's
 * mounted renderers, traced by grepping the BUILT bundle for every `setIcon(...)` call site
 * (including the two nav-button helpers that forward their icon through a parameter) rather than
 * guessed from source. An id outside that set still gets the original placeholder, so a story or
 * a capture reaching an icon this stub does not know stays reviewable rather than silently blank.
 */
const REAL_ICONS = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevrons-left": '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
  "chevrons-right": '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  "arrow-left": '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "more-vertical": '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  "grip-vertical": '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>'
    + '<circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
  "maximize-2": '<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>'
    + '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/>'
    + '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  "bar-chart": '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  "calendar-days": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'
    + '<path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
  "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>'
    + '<path d="M12 9v4"/><path d="M12 17h.01"/>',
  "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>'
    + '<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
};

export function setIcon(parent, iconId) {
  const el = parent.ownerDocument.createElement("span");
  el.className = "db-story-icon";
  el.setAttribute("data-icon", iconId);
  el.setAttribute("aria-hidden", "true");
  const paths = REAL_ICONS[iconId];
  if (paths) {
    el.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" `
      + `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  } else {
    el.textContent = "◆";
  }
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
