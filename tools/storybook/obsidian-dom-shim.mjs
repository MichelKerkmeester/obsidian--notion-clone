// ───────────────────────────────────────────────────────────────────
// MODULE:    obsidian-dom-shim
// COMPONENT: Obsidian's HTMLElement extensions, for rendering outside Obsidian
// ───────────────────────────────────────────────────────────────────
//
// Obsidian monkey-patches a set of convenience methods onto HTMLElement at
// runtime. They never appear in an import, so a module can look dependency-free
// and still fail the moment it builds any DOM. This plugin calls them roughly
// 2,586 times across 68 source files, so nothing presentational renders in a
// plain browser until they exist.
//
// Each is a thin convenience over createElement, classList and setAttribute,
// which is why a shim is viable at all. Signatures follow obsidian.d.ts rather
// than the native lookalikes — most importantly toggleClass, whose `value` is
// required, unlike classList.toggle where omitting it means "flip".
//
// This installs onto the prototype and changes no plugin source. Anything
// reaching a vault or metadata cache is out of scope and stays that way.

// ───────────────────────────────────────────────────────────────────
// 1. ELEMENT CONSTRUCTION
// ───────────────────────────────────────────────────────────────────

/** Apply a DomElementInfo bag to a freshly created element. */
function applyInfo(el, info) {
  if (typeof info === "string") {
    if (info) el.className = info;
    return;
  }
  if (!info) return;

  if (info.cls) {
    const classes = Array.isArray(info.cls) ? info.cls : info.cls.split(/\s+/);
    for (const cls of classes) if (cls) el.classList.add(cls);
  }
  if (info.text !== undefined) {
    if (typeof info.text === "string") el.textContent = info.text;
    else el.appendChild(info.text);
  }
  if (info.attr) {
    for (const [name, value] of Object.entries(info.attr)) {
      if (value === null || value === false) continue;
      el.setAttribute(name, String(value));
    }
  }
  if (info.title !== undefined) el.title = info.title;
  if (info.value !== undefined) el.value = info.value;
  if (info.type !== undefined) el.type = info.type;
  if (info.placeholder !== undefined) el.placeholder = info.placeholder;
  if (info.href !== undefined) el.href = info.href;
}

/** Attach to the requested parent, honouring `prepend`. */
function attach(parent, el, info) {
  const target = (info && typeof info !== "string" && info.parent) || parent;
  if (!target) return;
  if (info && typeof info !== "string" && info.prepend) target.insertBefore(el, target.firstChild);
  else target.appendChild(el);
}

function createEl(tag, info, callback) {
  const el = this.ownerDocument.createElement(tag);
  applyInfo(el, info);
  attach(this, el, info);
  if (callback) callback(el);
  return el;
}

// ───────────────────────────────────────────────────────────────────
// 2. INSTALLATION
// ───────────────────────────────────────────────────────────────────

const extensions = {
  createEl,
  createDiv(info, callback) {
    return createEl.call(this, "div", info, callback);
  },
  createSpan(info, callback) {
    return createEl.call(this, "span", info, callback);
  },
  setText(val) {
    if (typeof val === "string") this.textContent = val;
    else {
      this.textContent = "";
      this.appendChild(val);
    }
  },
  addClass(...classes) {
    for (const cls of classes) if (cls) this.classList.add(cls);
  },
  removeClass(...classes) {
    for (const cls of classes) if (cls) this.classList.remove(cls);
  },
  // `value` is required here, unlike classList.toggle. Treating it as optional would silently
  // flip classes the caller meant to set, which is a hard bug to see in a rendered catalogue.
  toggleClass(classes, value) {
    const list = Array.isArray(classes) ? classes : [classes];
    for (const cls of list) if (cls) this.classList.toggle(cls, value);
  },
  hasClass(cls) {
    return this.classList.contains(cls);
  },
  setAttr(name, value) {
    if (value === null || value === false) this.removeAttribute(name);
    else this.setAttribute(name, String(value));
  },
  setCssProps(props) {
    for (const [name, value] of Object.entries(props)) {
      if (name.startsWith("--")) this.style.setProperty(name, value);
      else this.style[name] = value;
    }
  },
  empty() {
    while (this.firstChild) this.removeChild(this.firstChild);
  },
  detach() {
    this.remove();
  },
};

/**
 * Install the extensions onto the element prototypes.
 *
 * Idempotent, and non-destructive: a property that already exists is left alone, so running this
 * inside Obsidian itself would be a no-op rather than a silent behaviour swap.
 */
export function installObsidianDomShim(target = globalThis) {
  const prototypes = [target.HTMLElement?.prototype, target.DocumentFragment?.prototype];
  let installed = 0;
  for (const proto of prototypes) {
    if (!proto) continue;
    for (const [name, fn] of Object.entries(extensions)) {
      if (name in proto) continue;
      Object.defineProperty(proto, name, { value: fn, writable: true, configurable: true });
      installed += 1;
    }
  }
  return installed;
}

/** A labelled placeholder reads more clearly in a catalogue than a real glyph would. */
export function setIcon(parent, iconId) {
  const el = parent.ownerDocument.createElement("span");
  el.className = "db-story-icon-stub";
  el.setAttribute("data-icon", iconId);
  el.setAttribute("aria-hidden", "true");
  parent.appendChild(el);
  return el;
}

export function setTooltip(el, text) {
  el.setAttribute("aria-label", text);
  el.setAttribute("data-tooltip", text);
}
