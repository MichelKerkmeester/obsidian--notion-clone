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
 * lucide-style paths: recognisable by shape and drawn in lucide's grammar (24-unit box, stroked,
 * unfilled), not byte-exact copies of its art, which is not vendored here to copy from.
 *
 * The set covers the ids the bundle's mounted renderers actually reach. It was first traced by
 * grepping the BUILT bundle for every `setIcon(...)` call site; it is now kept by measurement,
 * which is stricter: mounting every constructed scenario and collecting the ids that fell through
 * to the placeholder. The toolbar, its popovers, the anchored panels and the field editors each
 * ask for a dozen icons the view renderers never did, so a set traced when only the views mounted
 * left those surfaces drawing rows of diamonds. An id outside the set still gets the original
 * placeholder, so a story or a capture reaching an icon this stub does not know stays reviewable
 * rather than silently blank.
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
  "circle-dot": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
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
  "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  "arrow-up": '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  "arrow-up-down": '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  "arrow-left-right": '<path d="m8 3-4 4 4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  "bold": '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
  "italic": '<path d="M19 4h-9"/><path d="M14 20H5"/><path d="M15 4 9 20"/>',
  "strikethrough": '<path d="M16 4H9a3 3 0 0 0-2.8 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><path d="M4 12h16"/>',
  "code": '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  "highlighter": '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  "sigma": '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
  "file-symlink": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 15h5"/><path d="m10 18 3-3-3-3"/>',
  "file-output": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M4 15h8"/><path d="m9 12 3 3-3 3"/>',
  "file-plus-2": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M12 12v6"/>',
  "folder-plus": '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M9 13h6"/><path d="M12 10v6"/>',
  "image-plus": '<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M16 5h6"/><path d="M19 2v6"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  "calendar": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  "calendar-range": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M17 14h-6"/><path d="M13 18H7"/>',
  "calendar-plus": '<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M16 19h6"/><path d="M19 16v6"/>',
  "calendar-clock": '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="17" cy="17" r="5"/><path d="M17 15v2l1.5 1.5"/>',
  "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  "clock-3": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4.5"/>',
  "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "list": '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  "list-filter": '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  "list-checks": '<path d="M11 6h10M11 12h10M11 18h10"/><path d="m3 5 2 2 3-3"/><path d="m3 13 2 2 3-3"/>',
  "table": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/>',
  "columns": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
  "columns-3": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18"/>',
  "rows-3": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18"/>',
  "layout-grid": '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  "chart-gantt": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M8 7h10M6 12h9M9 17h7"/>',
  "trending-up": '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  "hash": '<path d="M4 9h16M4 15h16"/><path d="M10 3 8 21M16 3l-2 18"/>',
  "group": '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="7" height="5" x="7" y="7" rx="1"/><rect width="7" height="5" x="10" y="12" rx="1"/>',
  "more-horizontal": '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  "ellipsis": '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  "pencil": '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  "edit": '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  "trash": '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  "trash-2": '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  "eye-off": '<path d="M10.7 5.1A9 9 0 0 1 12 5c7 0 10 7 10 7a13 13 0 0 1-1.7 2.7"/><path d="M6.6 6.6A13 13 0 0 0 2 12s3 7 10 7a9 9 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/>',
  "settings-2": '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  "undo-2": '<path d="m9 14-5-5 5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  "clipboard-copy": '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/>',
  "terminal": '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  "shuffle": '<path d="M2 18h2a4 4 0 0 0 3.3-1.8l4.4-6.4A4 4 0 0 1 15 8h7"/><path d="m18 4 4 4-4 4"/><path d="M2 6h2a4 4 0 0 1 3.3 1.8l.5.7"/><path d="M14.2 15.5l.5.7A4 4 0 0 0 18 18h4"/><path d="m18 14 4 4-4 4"/>',
  "play": '<path d="M6 3v18l14-9Z"/>',
  "star": '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
  "sparkles": '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M18 16v4M16 18h4M5 4v2M4 5h2"/>',
  "palette": '<path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 10 10 0 0 0-9-11"/><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>',
  "paintbrush": '<path d="m14.6 12.6 3.8-3.8a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0l-3.8 3.8"/><path d="m9 11-5 5c-1 1-1 3 0 4s3 1 4 0l5-5"/>',
  "paint-bucket": '<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4"/>',
  "ruler": '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  "briefcase-business": '<rect width="20" height="14" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18 18 0 0 1-20 0"/><path d="M12 12h.01"/>',
  "circle-slash-2": '<circle cx="12" cy="12" r="10"/><path d="M22 2 2 22"/>',
  "text-cursor-input": '<path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M9 7v10"/>',
  "wrap-text": '<path d="M3 6h18"/><path d="M3 18h6"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><path d="m16 16-2 2 2 2"/>',
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
// 2. REFERENCE-VENDOR SHIMS
// ───────────────────────────────────────────────────────────────────
//
// The reference-capture bundle also mounts the vendored Project Manager plugin
// (specs/context/obsidian-pm-main) against this same stub. Its render path needs three
// names the plugin-under-test never calls, and none of them can be a throw: a gantt mount
// constructs ButtonComponents for its granularity controls on every render, the label rows
// build an ExtraButtonComponent per task, and `displayName` parses wikilinks through
// parseLinktext while resolving assignees. Each shim implements only the surface the
// reference's render path reaches; anything else the vendored code might call stays a
// throw in section 3.

/** A real button, because the gantt's control bar constructs these during render. */
export class ButtonComponent {
  constructor(parent) {
    const doc = parent.ownerDocument ?? document;
    this.buttonEl = doc.createElement("button");
    parent.appendChild(this.buttonEl);
  }

  setButtonText(text) {
    this.buttonEl.textContent = text;
    return this;
  }

  setIcon(icon) {
    setIcon(this.buttonEl, icon);
    return this;
  }

  setTooltip(text) {
    setTooltip(this.buttonEl, text);
    return this;
  }

  setCta() {
    this.buttonEl.classList.add("mod-cta");
    return this;
  }

  removeCta() {
    this.buttonEl.classList.remove("mod-cta");
    return this;
  }

  setWarning() {
    this.buttonEl.classList.add("mod-warning");
    return this;
  }

  setClass(cls) {
    this.buttonEl.classList.add(cls);
    return this;
  }

  setDisabled(disabled) {
    this.buttonEl.classList.toggle("is-disabled", disabled);
    if (disabled) this.buttonEl.setAttribute("disabled", "");
    else this.buttonEl.removeAttribute("disabled");
    return this;
  }

  onClick(callback) {
    this.buttonEl.addEventListener("click", callback);
    return this;
  }
}

/** The icon-only button the reference's IconButton primitive wraps. */
export class ExtraButtonComponent {
  constructor(parent) {
    const doc = parent.ownerDocument ?? document;
    this.buttonEl = doc.createElement("button");
    parent.appendChild(this.buttonEl);
    // IconButton reads `extraSettingsEl` off the component and attaches its own
    // classes and click listeners to it, so it is the button element itself.
    this.extraSettingsEl = this.buttonEl;
  }

  setIcon(icon) {
    setIcon(this.buttonEl, icon);
    return this;
  }

  setTooltip(text) {
    setTooltip(this.buttonEl, text);
    return this;
  }

  setClass(cls) {
    this.buttonEl.classList.add(cls);
    return this;
  }

  setDisabled(disabled) {
    this.buttonEl.classList.toggle("is-disabled", disabled);
    if (disabled) this.buttonEl.setAttribute("disabled", "");
    else this.buttonEl.removeAttribute("disabled");
    return this;
  }

  onClick(callback) {
    this.buttonEl.addEventListener("click", callback);
    return this;
  }
}

/**
 * Splits a linktext into its path and subpath ("note#heading" -> note + heading). The
 * reference's displayName reads only the path; the alias is split off the same way
 * Obsidian's implementation does so a display name never includes it.
 */
export function parseLinktext(linktext) {
  const aliasSep = linktext.indexOf("|");
  const alias = aliasSep >= 0 ? linktext.slice(aliasSep + 1) : "";
  const pathPart = aliasSep >= 0 ? linktext.slice(0, aliasSep) : linktext;
  const hash = pathPart.indexOf("#");
  return {
    path: hash >= 0 ? pathPart.slice(0, hash) : pathPart,
    subpath: hash >= 0 ? pathPart.slice(hash + 1) : "",
    alias,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. OUT-OF-SCOPE SURFACES
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
// Reachable from the vendored reference's modal graph, constructed only on interaction.
export const Keymap = outOfScope("Keymap");
export const SuggestModal = outOfScope("SuggestModal");
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
// Reachable from the vendored reference's note-link suggest, interaction-only.
export const prepareFuzzySearch = outOfScope("prepareFuzzySearch");
export const renderMath = outOfScope("renderMath");
export const stringifyYaml = outOfScope("stringifyYaml");
