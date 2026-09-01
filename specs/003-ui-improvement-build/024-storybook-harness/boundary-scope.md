# Storybook boundary scope

The goal puts Storybook first because it unblocks the rest, and the first question is not "which
stories" but "what can render at all outside Obsidian". This answers that from measurement.

## 1. THE REAL DEPENDENCY IS NOT THE IMPORT

42 of 72 modules under `src/views/` import from `"obsidian"`, which suggests 30 render freely.
That number is misleading. The plugin builds almost all of its DOM through Obsidian's HTMLElement
extensions, which are monkey-patched onto the prototype at runtime and never appear in an import
statement.

Measured across `src/`, excluding tests:

| Extension | Calls |
|---|---:|
| `createDiv` | 761 |
| `createEl` | 564 |
| `createSpan` | 422 |
| `addClass` | 249 |
| `toggleClass` | 113 |
| `setAttr` | 113 |
| `removeClass` | 102 |
| `empty` | 94 |
| `setIcon` | 75 |
| `setCssProps` | 39 |
| `setText` | 27 |
| `hasClass` | 26 |
| `detach` | 1 |

**2,586 calls across 68 of 192 source files.** Nothing presentational renders until these exist.

## 2. WHAT THAT MEANS — THE COST IS ONE SHIM

This is a better result than it first looks. Thirteen methods is a small, well-understood surface:
each is a thin convenience over `document.createElement`, `classList` and `setAttribute`. A single
shim module that installs them on `HTMLElement.prototype` before stories load unlocks the whole
presentational layer at once, with no change to plugin source.

`setIcon` and `setTooltip` are imported functions rather than prototype methods and need stubbing
separately — an icon stub can emit a labelled placeholder, which is arguably clearer in a catalogue
than the real glyph.

**Nothing about this requires refactoring components to be "Storybook-friendly".** That matters,
because a refactor for the harness's benefit would be the tail wagging the dog.

## 3. WHAT CAN AND CANNOT RENDER

**Can, once shimmed.** Anything whose input is data plus a parent element: menu rows and sections,
the popover shell, chips and badges, field renderers, checkboxes, the selection bar, toolbar
chrome, the sheet presentation layer. This is exactly the surface the popover research found has no
shared vocabulary, and precisely what the operator wants reviewable side by side.

**Cannot.** Anything reaching the vault or the metadata cache: the database view itself, record
resolution, relation and rollup evaluation, file-backed icons, anything calling `app.vault` or
`app.metadataCache`. Stories for those would need fixtures deep enough to be their own maintenance
burden, which is how the current screenshot harness already went wrong.

## 4. DOES IT REPLACE THE SCREENSHOT FIXTURES?

**No — it should retire them.** They are not the same tool badly done; they are a worse tool aimed
at the same target.

The capture harness renders hand-written fixture markup, not the real renderers. That is its
defining weakness: a capture can pass while the renderer that ships is broken, and a class the
plugin never emits can be photographed looking healthy. It also fingerprints `styles.css` on all
196 entries, so any CSS edit stales every capture and forces a full re-run — which is why CSS work
has to be a single serialized lane.

Storybook rendering the *real* modules removes both problems: the markup is the shipped markup, and
a component's story does not depend on the whole stylesheet's hash.

**Recommendation:** build the shim, port the surfaces that already have fixtures, confirm each
renders from real source, then delete the corresponding fixture. Do not run both indefinitely —
two harnesses disagreeing is worse than one that is honest about its limits.

## 5. WHY THIS IS WORTH DOING BEYOND COMPONENT REVIEW

Three defects this programme investigated could not be settled from source at all — the New button's
appearance, the round checkboxes, and the ~500px option-editor offset. Each turned out to depend on
computed styles that the theme or Obsidian contributes, which no amount of reading the repository
can reveal. A real browser rendering real components is the cheapest way to answer that class of
question, and this programme has now generated three instances of it.
