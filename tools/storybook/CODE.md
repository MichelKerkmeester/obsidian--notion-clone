---
title: "tools/storybook: harness topology and flow"
description: "How the catalogue bundles and verifies: the Obsidian import alias, prototype shim installation, the render assertion that rejects empty shells, and the boundary where a surface stops being renderable outside Obsidian."
trigger_phrases:
  - "storybook harness topology"
  - "obsidian stub alias esbuild"
  - "catalogue render assertion"
---

# tools/storybook: harness topology and flow

## 1. OVERVIEW

Two independently runnable gates. `verify-shim.mjs` proves the shim matches Obsidian's documented
behaviour; `build.mjs` proves real components render through it. Neither trusts the other.

## 2. ARCHITECTURE

```
stories.ts ──imports──> src/views/*.ts ──imports──> "obsidian"
                                                        │
                                          esbuild onResolve alias
                                                        ▼
                                              obsidian-stub.mjs
build.mjs ──bundles──> dist/catalogue.js ──loads in──> Chrome
                                                        │
                              installObsidianDomShim(window) first
                                                        ▼
                                        real components build real DOM
```

The alias is what makes bundling real modules possible at all: without it, esbuild resolves
`obsidian`, which is not installable outside the app.

## 3. KEY FILES

- `obsidian-dom-shim.mjs` — thirteen prototype methods. Idempotent and non-destructive: an existing
  property is left alone, so running inside Obsidian is a no-op rather than a silent behaviour swap.
- `obsidian-stub.mjs` — `setIcon`, `setTooltip`, `normalizePath`, `Platform`. Everything reaching a
  vault throws with a message naming the boundary.
- `build.mjs` — bundle, load, assert, report.

## 4. BOUNDARIES AND FLOW

The signatures follow `obsidian.d.ts`, not the native lookalikes. The divergences are where a
careless implementation passes a shallow test and then misbehaves in the catalogue:

- `toggleClass(classes, value)` — `value` is **required**; it never means "flip"
- `setAttr(name, null)` — removes the attribute rather than writing `"null"`
- `createEl(tag, "cls")` — a bare string is the class, not a tag
- `DomElementInfo.prepend` — inserts first rather than appending
- `DomElementInfo.parent` — overrides the receiver as the attachment target

## 5. ENTRYPOINTS

`npm run storybook` and `npm run storybook:verify`. Both resolve the system Chrome the same way the
capture harness does, honouring `SCREENSHOT_CHROME`; neither downloads a browser.

## 6. VALIDATION

`verify-shim.mjs` runs 29 checks and is proven to fail: breaking `toggleClass` into a native flip
drops it to 28/29 with exit 1, naming the assertion.

`build.mjs` rejects a story unless its stage produced a subtree, text, **and** plugin classes. Any
one alone can be true of an empty shell — which is how a blank popover survived an earlier round of
this programme. That check has already rejected a story that rendered a container and nothing else.

## 7. RELATED

- `tools/screenshots/CODE.md` — the fixture harness and its fingerprinting model
- `tools/naming/scan-folder-docs.mjs` — why this file exists
