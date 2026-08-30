# 020 — Harness fidelity repair

## WHY

A verifier returned PASS WITH FINDINGS on the previous batch. Seven findings, and six of them
share one shape: a check that reported a number nobody could have arrived at by measuring the
thing it named. A gate made of those is worse than no gate, because it spends its authority
certifying whatever it happens to compute.

This phase repairs the measuring instruments, and changes exactly one rule in the stylesheet —
the one the corrected instrument showed was under its own floor.

## WHAT CHANGED

### 1. The grab-band arithmetic double-counted the bar

`verify-placement.mjs` walked outward from the handle bar's centre and then added the bar's
height back. Both arms already cross the bar, so 4px were counted twice. The same file computes
the correct form — `up + down + 1` — a few hundred lines away in `usableHeight`.

| surface | reported | true | threshold | was | now |
| --- | --- | --- | --- | --- | --- |
| add-view sheet | 45px | 42px | >= 44 | FAILED once corrected | 48px |
| owned-menu sheet | 41px (in a comment only) | 38px | none existed | no check at all | 44px |
| record sheet | 35px | 32px | >= 30 | passes | 32px, unchanged |

The add-view number was the one that mattered: at 42px the surface missed the 44px floor its own
check declares, and the double-count carried it over the line.

### 2. The band was raised, not the threshold

The 44px floor is not this phase's invention. It is WCAG 2.5.5 target size, and the stylesheet
already uses `min-height: 44px` for phone menu rows — so it is the project's own established
value, adopted rather than argued for.

The operator has already accepted 32px on the record sheet, after being shown that 48px there
needs a taller sheet header. That precedent does not transfer, and the measurement is why: the
record sheet has 33px of chrome above its header, so its band has nowhere to go without moving
content. The add-view sheet has 44px of continuous inert chrome from its top edge — 1px border,
8px padding, a 16px handle margin-box, and a 19px static "Add view" heading with zero interactive
descendants — and its first interactive control sits at y=101. The owned-menu sheet, the tighter
of the two, has its first row at y=47.

So the constraint that forced 32px on the record sheet is absent here, and reaching 44px costs no
layout change at all: the band is a pseudo-element that does not participate in layout.

The rule now anchors the band to the sheet's top edge rather than centring it on the bar, which is
where the missing pixels were going — half of a 48px band was overhanging an edge the sheet clips.
`bottom: -28px` is forced, not chosen: 24px leaves the owned menu at 41px, under the floor, and
32px reaches 49px and starts taking that sheet's first row.

Both ends are now asserted on both surfaces, so a band that clears the floor by eating a row fails
instead of passing.

### 3. Seven of eight evidence artefacts were stale and nothing checked

`evidence.mjs` could date an artefact against the tree that produced it. Nothing called it. The
committed `cascade-audit.json` had been measured against a `styles.css` 351 lines shorter than
HEAD's; `checkbox-appearance.json` recorded 171 checkboxes across 51 fixtures where the same tool
on the same tree produced 202 across 54, and the roadmap quoted the stale figure as evidence.

`--check-all` now discovers every artefact carrying an `inputs` map — discovered, not listed, so
the ninth joins the gate by being written — and `tools/gate.mjs` runs it. All eight regenerated.

### 4. A coverage fixture photographed nothing

`chrome-selection-status-bar` produced four byte-identical 80x64 fully transparent PNGs. The bar
is `position: fixed`, so it contributed no height to the captured element. The harness had the
remedy already — a `captureCss` block that restores flow without restyling the subject — and its
own comment describes this exact failure.

The durable half is the second: nothing could tell a photograph of a component from a photograph
of nothing. `verify.mjs` now decodes each PNG and rejects a single-coloured image, and rejects a
pair that is byte-identical across light and dark. Across 224 captures those two rules fire on
nothing but the defect.

### 5. Two checkbox families were never asked about

The coverage collector matched `cls:\s*"([a-z0-9-]+)"`, which cannot match a two-class value. Four
call sites declare two classes, so `db-invalid-event-select` and `base-import-include-checkbox`
dropped out entirely and "0 uncovered" was a statement about ten families rather than twelve.
Neither had a fixture. One carries its own placement rules — `justify-self: center` in a 28px grid
column, `grid-area: select` in the compact layout — which is exactly what this batch was about.

Both now have fixtures built from the modals' real markup.

### 6. The agreement check confirmed itself

The same suite derived a fixture's expected role from that fixture's own class list, then asked the
factory what that role produces. A fixture at the wrong role agreed with itself. The two roles paint
at different sizes, so the mutation photographed a control the plugin does not build.

The role now comes from the call site. Controlled: with a modal fixture's role swapped from field to
row, the old suite passed 3/3 and the new one fails, naming the source file and the role it asks for.

### 7. The DOM shim was more permissive than the device

Verified against the shipped runtime (`obsidian.asar` -> `enhance.js`): `setCssStyles` assigns
`style[name]`, `setCssProps` calls `setProperty(name, value)`. `setProperty` takes a CSS property
name, so a camelCase key is dropped in silence. The repo's shim implemented `setCssProps` with the
`setCssStyles` body, so every camelCase key worked in the harness and vanished on a phone.

The shim now matches the device, and that immediately turned a silent drop into a visible failure:
`popover-position.ts` sets `maxHeight`, and the check asserting the inline cap began reporting
`inline=NaNpx`. All 23 camelCase keys across 6 files are now hyphenated.

### 8. Three orphaned probe suites now run

63 checks from `probe-desktop-placement.mjs`, `probe-inventory.mjs`, `drag-probe.mjs`,
`sheet-audit.mjs` and `transition-probe.mjs` were lifted into `verify-placement.mjs`. Two harness
defects in the drag probe were repaired on the way in — a 2px scan step with a non-inclusive width,
and a read taken in the same tick as the dispatch — and neither check was weakened. Three genuine
product defects the probes measure are declared in `KNOWN` rather than fixed here, so the run
reports an unexpected pass the moment any of them is repaired.

## VERIFICATION

- gate: 14 green, exit 0 (13 before; `evidence` is the new one)
- vitest: 444 passed
- placement: 173/177, 4 red for a declared reason, exit 0 (114 before; 63 lifted)
- screenshots: 224 entries current, none blank, none identical across themes
- evidence: 8 of 8 artefacts describe this tree

## OUT OF SCOPE, MEASURED AND NOT FIXED

`.db-selection-status-bar` clips its own content on a phone: at 402px its content is 36px tall in a
28px box, so the action labels wrap and are cut. Measured identically with `position: fixed` and
with the fixture's `position: static`, so it is the shipped layout and not the capture override.
The blank fixture had been hiding it. Fixing it is a decision between wrapping, scrolling and
shorter labels, and belongs to whoever owns that bar.
