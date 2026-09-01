---
title: "tools/storybook: the component catalogue"
description: "Renders the plugin's real presentational modules in a browser by shimming the Obsidian HTMLElement extensions they depend on, so components can be reviewed side by side and theme-dependent defects can be seen rather than inferred."
trigger_phrases:
  - "obsidian plugin component catalogue"
  - "storybook shim obsidian dom extensions"
  - "render plugin components outside obsidian"
---

# tools/storybook: the component catalogue

`tools/storybook/` renders the plugin's **real** modules in headless Chrome. That is the whole
point, and the difference from `tools/screenshots/`: the capture harness photographs hand-written
fixture markup, so a capture can pass while the renderer that ships is broken, and a class the
plugin never emits can be photographed looking healthy.

## 1. OVERVIEW

Obsidian monkey-patches a set of convenience methods onto `HTMLElement` at runtime — `createDiv`,
`createEl`, `addClass`, `setCssProps` and nine more. They never appear in an import, so a module
can look dependency-free and still fail the moment it builds any DOM. The plugin calls them roughly
2,586 times across 68 source files.

The shim installs those thirteen methods onto the real prototypes. That unlocks the presentational
layer without changing a line of plugin source, and without refactoring components to suit a
harness.

## 2. QUICK START

```
npm run storybook          # bundle the catalogue, render it in Chrome, assert every story is real
npm run storybook:verify   # check the shim against Obsidian's documented behaviour
```

Both exit non-zero on failure. `npm run storybook` prints the catalogue's `file://` path; open it
to review components side by side.

## 3. STRUCTURE

| File | Role |
|---|---|
| `obsidian-dom-shim.mjs` | The thirteen HTMLElement extensions, installed onto the prototype |
| `obsidian-stub.mjs` | Stands in for the `obsidian` module; vault-touching exports throw |
| `stories.ts` | Catalogue entries, each calling a real component |
| `build.mjs` | Bundles with `obsidian` aliased to the stub, then asserts the render |
| `verify-shim.mjs` | 29 checks against real Chrome, including a proven failure case |
| `catalogue.css` | Catalogue chrome only — components are styled by the shipped stylesheet |

## 4. WHAT BELONGS HERE

Anything whose input is data plus a parent element: menu rows and sections, the popover shell,
chips and badges, field renderers, checkboxes, toolbar chrome, the sheet presentation layer.

Anything reaching the vault or metadata cache does not. The stub throws for those exports rather
than pretending, so a story asking for an unrenderable surface fails loudly instead of quietly
documenting a shape nobody ships.

## 5. RELATED

- `tools/screenshots/` — the fixture-based capture harness this is intended to retire
- `specs/003-ui-improvement-build/024-storybook-harness/boundary-scope.md` — why, and the measurements behind it
