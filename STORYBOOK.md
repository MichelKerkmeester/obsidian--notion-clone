# The Note Database component catalogue

Storybook is a live catalogue of the plugin's visual pieces — menu rows, dropdowns, checkboxes,
number displays, icons — each shown on its own so you can look at it, flip it between light and
dark, and read what it is for, without opening Obsidian or a vault.

## See it (one command)

```bash
npm install        # first time only
npm run storybook
```

Open http://localhost:6006. Nothing here touches your notes; it is a read-only catalogue.

## What you'll see

- **A sidebar** grouping every piece (Menus, Fields, Chrome). Click one to see it live.
- **A theme switch** in the toolbar — light and dark, through the same colour variables the plugin
  reads inside Obsidian, so what you see matches what ships.
- **A Docs tab** per component, generated from the notes written above each story.
- **An Accessibility panel** flagging contrast and labelling problems on whatever you are viewing.

Stories deliberately show states that never appear together in the real app — empty beside full,
enabled beside disabled — because that side-by-side view is what makes drift visible.

---

## For developers

### Why this exists

Menu rows had been built by hand in five different files. They drifted: centred in one popover,
left-aligned in another, icons on some rows and not their siblings. Nobody noticed for a long time
because the two versions never appeared on the same screen. A catalogue is how that stops
happening, and how the next person avoids writing a sixth implementation.

### Add a story when you add a component

```bash
npm run story:new src/views/<module>.ts
```

That writes a correct stub beside the module and lists its renderable exports. Fill in the TODOs
with **real calls to the real function** — never hand-write the markup you expect it to produce.
That distinction is the whole point: the screenshot fixtures render hand-built HTML, so a capture
can look healthy while the renderer that ships is broken.

### The coverage gate keeps it complete

```bash
npm run story:coverage
```

Fails when a module exporting a `create`/`render` function that takes a parent element has no
co-located story. Genuinely unrenderable modules — anything resolving notes through the vault —
are exempt in `tools/storybook/story-coverage-allowlist.json`, each with a written reason. The gate
also fails on **stale** exemptions, so an allowlist entry can never quietly outlive its excuse.

### Verify a change didn't break rendering

```bash
npm run build-storybook   # the catalogue compiles
npm run story:smoke       # every story renders in light and dark, zero errors
npm run storybook:verify  # the DOM shim matches Obsidian's documented behaviour
npm run storybook:coverage # the shim and stub still cover what the source uses
```

`story:smoke` fails on a thrown error, a console error, **or a story that renders nothing** — the
last one matters most, because a silently empty story passes any check that only looks for errors.

### Measuring placement, not just markup

```bash
npm run storybook:placement
```

Everything else here checks structure. This one checks **geometry**: it builds the workspace
Obsidian builds — a root split holding the editor with a right sidebar beside it — puts the
plugin's container inside, runs the shipped positioner, and measures the rectangle that comes out.
On a phone viewport it does the same for the bottom sheet.

It answers the questions a string match cannot: does the popover slide under the sidebar, is a
four-item menu rendered 520px wide, does the sheet dock to the bottom and stop at 90svh. Each check
was confirmed to fail before it was trusted — reverting the clamp target moves the bound from
1140px back to the full 1440px window, and that is the defect it exists to catch.

It does not replace opening Obsidian. The real app has its own CSS and a workspace this only
approximates.

### How it runs outside Obsidian

The plugin builds nearly all its DOM through Obsidian's `HTMLElement` extensions — `createDiv`,
`createEl`, `createSvg` and a dozen more — which Obsidian patches onto the prototype at runtime and
which appear in no import statement. There are over 2,500 such calls. `tools/storybook/obsidian-dom-shim.mjs`
installs them before stories load, which is what unlocks the whole presentational layer without
changing a line of plugin source.

`obsidian-stub.mjs` stands in for the `obsidian` package. Anything reaching the vault or metadata
cache **throws** rather than returning an empty value, so a story straying outside the boundary
fails loudly instead of quietly documenting a shape nobody ships.

Both are hand-written lists, and hand-written lists fall behind. `storybook:coverage` re-derives
what they need directly from the source, which is how three real gaps were caught: the
`activeDocument` global, the `createSvg` and `appendText` extensions, and `SVGElement.prototype`
never being patched at all.

### Does it replace the screenshot fixtures?

Not yet. The 196 captures cover whole views — table, board, calendar, gallery — which need a vault
and are out of scope here. The catalogue covers the component layer those views are assembled from.
They overlap only where a fixture hand-builds markup for a component that now has a real story; those
fixtures are the ones worth retiring first.
