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
  // SVG needs the namespaced constructor: createElement("circle") yields an unknown HTML element
  // that renders as nothing, which is a silent failure rather than a loud one.
  createSvg(tag, info, callback) {
    const el = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", tag);
    applyInfo(el, info);
    attach(this, el, info);
    if (callback) callback(el);
    return el;
  },
  appendText(val) {
    this.appendChild(this.ownerDocument.createTextNode(val));
    return this;
  },
  // Obsidian adds this so a node can be type-checked across window boundaries, where a plain
  // `instanceof` fails because the popped-out window has its own HTMLElement. The plugin's own
  // dom-guards route every element check through it, so without it those guards throw rather
  // than returning false — which is how a missing shim method takes down a whole positioner.
  instanceOf(type) {
    return this instanceof type;
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
  // These are two different methods on the device and the difference is the whole point.
  //
  // In Obsidian's own enhance.js, setCssStyles assigns through the style object by key, while
  // setCssProps goes through setProperty. That one difference is what this pair has to preserve.
  //
  // setProperty takes a CSS property name, so a camelCase key like objectFit names no property and
  // is dropped without error. This shim used to implement setCssProps with the setCssStyles body,
  // which made the harness MORE permissive than the app: every camelCase key worked here and
  // silently did nothing on a phone, so no check could see the difference. A harness that accepts
  // what the device rejects certifies code the device does not run.
  setCssProps(props) {
    for (const [name, value] of Object.entries(props)) this.style.setProperty(name, value);
  },
  setCssStyles(styles) {
    for (const [name, value] of Object.entries(styles)) this.style[name] = value;
  },
  empty() {
    while (this.firstChild) this.removeChild(this.firstChild);
  },
  detach() {
    this.remove();
  },
  // Visibility runs through inline display rather than a class. The typed contract fixes this:
  // its isShown() is specified as "attached to the DOM and none of the parent and ancestor
  // elements are hidden with display: none", so display is the property the pair has to move.
  // A class-based stand-in would need a rule the harness's stylesheet does not carry, and the
  // element would stay visible here while disappearing on the device.
  //
  // Only the day-scale calendar's current-time line calls these today, and it called them from a
  // surface no bench drove until now — which is why their absence stayed invisible.
  show() {
    this.style.removeProperty("display");
  },
  hide() {
    this.style.setProperty("display", "none");
  },
  toggleVisibility(visible) {
    if (visible) this.show();
    else this.hide();
  },
};

/**
 * Install the extensions onto the element prototypes.
 *
 * Idempotent, and non-destructive: a property that already exists is left alone, so running this
 * inside Obsidian itself would be a no-op rather than a silent behaviour swap.
 */
export function installObsidianDomShim(target = globalThis) {
  // SVGElement is patched too, not only HTMLElement: Obsidian's extensions live on the shared
  // element prototype, so nested SVG construction — an <svg> creating its own <circle> — calls
  // them on an SVGElement. Omitting it fails only on the few surfaces that draw their own graphics,
  // which is exactly the kind of gap that hides until someone opens that one story.
  const prototypes = [
    target.HTMLElement?.prototype,
    target.SVGElement?.prototype,
    target.DocumentFragment?.prototype,
  ];
  let installed = 0;

  // Obsidian defines `activeDocument` as a global so a plugin can address the right document when
  // the workspace has been popped out into a second window. There are 244 references across 30
  // source files, and without it roughly a third of the view layer throws on first render rather
  // than displaying anything. Outside Obsidian there is only ever one document.
  if (!("activeDocument" in target) && target.document) {
    Object.defineProperty(target, "activeDocument", {
      get: () => target.document,
      configurable: true,
    });
    installed += 1;
  }
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
