---
title: "src/views: the rendering layer"
description: "Everything the plugin draws: the seven view renderers, the table internals, the cell editors and value renderers, the toolbar and its panels and popovers, and the modal dialogs under modals/."
trigger_phrases:
  - "note database views renderers"
  - "plugin rendering layer obsidian"
  - "where is the table renderer"
---

# src/views: the rendering layer

`src/views/` builds every pixel the plugin shows. It holds the seven view renderers (Table, Board,
Gallery, List, Chart, Calendar, Timeline), the table internals, the cell editors and value
renderers, the toolbar and the panels and popovers it opens, and the `modals/` dialogs. Renderers
read from `src/data/` and emit the `db-*` DOM that `styles.css` styles.

---

## 1. OVERVIEW

A view is assembled top down: `DatabaseView` owns the container and toolbar, a view renderer draws
the body, and cell renderers, panels and popovers fill in the interactive parts. The DOM these
files emit is the contract the screenshot harness photographs and the stylesheet targets, so class
names here and rules in `styles.css` move together.

Start with `DatabaseView.ts` for the container, `ToolbarRenderer.ts` for the controls, and
`TableRenderer.ts` for the densest view. See [`CODE.md`](./CODE.md) for the grouped map.

---

## 2. STRUCTURE

```text
src/views/
+-- DatabaseView.ts        # The main view container
+-- TableRenderer.ts       # The table body
+-- ToolbarRenderer.ts     # The toolbar and view switcher
+-- ...                    # ~90 renderers, cells, panels and popovers
`-- modals/                # Obsidian Modal subclasses
```

The folder is flat apart from `modals/`. See [`CODE.md`](./CODE.md) for the grouping by concern.

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the grouped code map.
- [`modals/README.md`](./modals/README.md) — the dialog layer.
- [`../data/README.md`](../data/README.md) — the logic these renderers read.
- [`../../screenshots/README.md`](../../screenshots/README.md) — the shots that photograph this DOM.
</content>
