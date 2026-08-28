# Handover — UI research, UI build, and the screenshot system

Covers packets **002**, **003** and **004** under `specs/public/`. Written at commit
`d5e3ba1`, which is the head of both `impl` and `main` on `origin`
(`MichelKerkmeester/obsidian--notion-clone`). The `upstream` remote (`pangy9`) has not been
pushed to.

Read this before continuing any of the three. It records what is real, what is claimed but
unverified, and where the traps are — a previous round of this work passed its own checks
while carrying a false P0, so the distinction matters more than the summary.

---

## Current state at a glance

| Packet | What it is | Children | Ticked / open | Validates |
|---|---|---|---|---|
| 002-ui-improvement-research | 20 research iterations + synthesis | none (research only) | n/a | 0 of 2 — see below |
| 003-ui-improvement-build | 10 build phases + 2 defect phases | 11 | 320 / 6 | 12 of 12 |
| 004-component-screenshot-system | capture harness, registry, freshness, coverage | 4 | 82 / 57 | 5 of 6 |

Repository gate at this commit: `npx tsc --noEmit` clean, `npm run build` clean,
`npx vitest run` **386 passed across 49 files**, `npm run screenshots:verify` clean at
**180 entries**, `npm run lint` **115 problems (100 errors, 15 warnings)** — unchanged
baseline, not introduced by this work.

---

## 002 — UI improvement research

Twenty research iterations across two model lineages plus a synthesis, examining the plugin's
UI against Anytype and AppFlowy. It produced no code by design; it is the source the 003
phases were written from.

**It does not conform to spec-kit structure and does not validate.** The packet holds only
`spec.md` and `research/`, missing the required plan, tasks, checklist and the generated
`description.json` / `graph-metadata.json`. The `research/` subfolder is additionally scanned
as though it were a phase child and reports its own missing files.

This is a pre-existing gap, not a regression. The research content is complete and was
consumed by 003. Bringing the packet to conformance is a documentation task that nobody has
done; decide whether it is worth doing or whether the packet should be marked research-exempt.

---

## 003 — UI improvement build

Ten phases built from the 002 synthesis, plus two later phases fixing defects found after the
fact. All twelve folders validate strict with zero errors and zero warnings.

**What shipped, in the code:** empty and first-run states, table and grid work, popovers and
an elevation scale, toolbar and view controls, design tokens and typography, per-view parity
polish, micro-interactions, mobile and accessibility, then `009-header-affordance-defects`
and `010-add-view-popover-layout`.

### The two defect phases are worth understanding

Both fixed regressions this programme introduced, and both root causes are instructive.

The column menu button had been positioned absolutely in the header cell's corner. The
accessibility phase later gave it `position: relative` for a touch target, which put it back
in flow as a block and dropped it onto its own line beneath every column name. The header is
now a flex row that owns the button as a sibling of the label, so it cannot recur that way.

The add-view popover's tiles are buttons, and the host app pins a bare button to a
single-line height with `nowrap`. The tile declared a grid but no height, so it stayed one
line tall while its contents needed roughly eighty pixels — and because buttons do not clip,
the icon and caption painted outside the tile onto the row beneath. A suspected cause was
recorded as **disproved** in `010/spec.md:68-70`: the shared menu-item class was blamed for a
competing row layout but declares no `display` at all. Do not re-investigate it.

### What is still open — all six are real

- `008 CHK-026 [P0]` — the passive-listener claim is **not met**. The pointer listeners in
  `src/data/TouchEnvironment.ts:91-95` register with no options argument; the passive
  bindings that exist are in `CalendarTimelineRenderer.ts`, `BoardRenderer.ts` and
  `ActiveViewControlsRenderer.ts`, none of which that item cited. Either make the listeners
  passive, or decide passive is wrong there (long-press may need `preventDefault`) and
  rewrite the requirement.
- `006 CHK-011 [P0]` — `CardFieldRenderer.test.ts` covers helper classification and
  keyboard/ARIA behaviour, not per-display-family render assertions.
- `003 CHK-024 [P1]` — the overlay edge-case matrix covers LIFO dismissal and boundary flips;
  zero-result search, IME composition and elevation-token consumption are untested.
- `006 CHK-036 [P1]` — the "N empty properties" accordion in Record Detail was never built.
- `009 CHK-019 [P1]` and `010 CHK-023 [P1]` — visual confirmation in the running plugin.
  These cannot be closed from a screenshot; they need eyes on the real app.

### Accessibility work is verified by source only

The screen-reader, tab-contract, embedded-codeblock, focus-trap and touch-envelope items in
phase 008 say what the source proves. **No screen-reader session and no on-device run has
happened.** The wording was corrected to say so after an audit found it claiming otherwise.
Treat any accessibility claim here as static analysis until someone runs VoiceOver, TalkBack
or NVDA against it.

### The two-level card roving has never run in the app

Card keyboard traversal — Enter or F2 to enter a card, arrows between fields, Escape out — is
covered by unit tests against a mock DOM. It has not been exercised in Obsidian against real
re-renders. If you touch card focus, verify in the vault, not only in vitest.

---

## 004 — Component screenshot system

Captures fixture markup rendered against the shipped `styles.css` in headless Chrome, driven
by `playwright-core` against the system Chrome (no bundled browser download; set
`SCREENSHOT_CHROME` to override the path).

```
npm run screenshots         # capture everything, rewrite manifest and index
npm run screenshots:verify  # fail if any capture's sources changed since it was taken
```

**Layout:** `tools/screenshots/` holds `capture.mjs` (runner), `verify.mjs` (freshness),
`theme.css` (host theme + form-control baseline), `runtime-vars.css` (the ~50 custom
properties the plugin sets from JavaScript), and `scenarios/` — one module per surface family
(`core`, `temporal`, `panels`, `chrome`, `fields`) aggregated by `scenarios.mjs`. Output and
`manifest.json` live in `screenshots/`, with a generated `README.md` index.

**Two capture modes.** A view is photographed inside a device frame — desktop 1440x900 and
phone 402x874, both themes. A component is photographed at its own size on a transparent
ground. Scenarios may override with an explicit `capture` field; the default follows the
group. **180 PNGs at this commit**, roughly 14 MB.

### Things that will bite you

**Phone captures need the body class.** Obsidian marks phone layouts with `is-phone`, and a
large part of the responsive CSS keys off it. Without the class a narrow viewport is only a
cramped desktop and the mobile design never appears.

**Never invent a class name.** A class the plugin does not emit is styled by nothing, so the
capture photographs unstyled markup while looking like a successful screenshot. It documents
a surface that does not exist. `src/views/ScreenshotFixtures.test.ts` walks every class in
the fixtures and fails naming any that appears in neither `styles.css` nor `src/`. This has
already caught real mistakes twice.

**The card field classes are parameters, not classes.** `CardFieldRenderer` takes
`labelClass` / `valueClass` / `fieldClass` and each view passes its own
(`db-board-card-field-label`, `db-gallery-field-value`, `db-list-field-value`). Fixtures that
used the parameter names rendered label and value with no separator, because nothing styles
the generic names.

**Runtime values are stand-ins.** `runtime-vars.css` supplies what the plugin measures at
runtime, and loads after the stylesheet targeting `.note-database-container` as well as
`:root` — a custom property inherits from the nearest ancestor that sets it, so a `:root`-only
override never reaches the element. Calendar row heights are viewport-derived on purpose; a
fixed value leaves the grid floating in dead space. **A surface that looks wrong in a capture
may be a gap in these stand-ins rather than a plugin defect. Check which before filing a bug.**

**The runner refuses absurd sizes.** A fixture that resolves past 12000px is skipped with its
dimensions reported rather than allowed to take the browser down. That guard turned an
unexplained Chrome crash into `chrome-group-header-row: 1000088x368px`, caused by a fixture
omitting the `<colgroup>` the plugin builds at runtime. `table-layout: fixed` with no column
widths runs away.

**Captures are fixture markup, not the real renderers**, which need a live Obsidian `App`,
vault and metadata cache. Markup drift therefore shows up as a screenshot that stops matching
the code rather than as a capture error.

### Coverage is a foundation, not coverage

An independent audit at this commit (`specs/public/003-ui-improvement-build/review/` holds
the earlier reviews; this one is summarised here) measured the gap:

- **1,196** styled `.db-*` classes exist; the fixtures reference **427**. **769 are
  referenced by nothing.**
- **~145 distinct surfaces** have no screenshot — 88 P1, 85 P2, 13 P3.
- **All 17 modals under `src/views/modals/` are unphotographed** — `AddDatabaseModal`,
  `FormulaModal`, `CreatePropertyModal`, `StatusOptionsModal`, `DeleteDatabaseModal` and
  twelve more.
- The **settings tab**, roughly 25 popovers and dropdowns, and **11 of 13 cell-editor types**
  are missing.

The modals were missed because the surface inventory used `ls src/views/*.ts`, which does not
recurse. **`src/views/modals/` is a whole directory nobody has photographed.** Start there.

Phase `004/004-coverage-expansion` is the work plan and is marked Planned with nothing ticked;
its 57 open items are that plan, not neglected work.

### The parent packet does not validate

Four of five children pass; `004`'s parent reports `METADATA_DISK_PATH_CONSISTENCY` — generated metadata path drift. It is
a warning, not an error; every on-disk path is correct and the metadata is structurally
identical to the 003 parent, which passes. The rule does not name the offending field. Four of
the five children pass clean. Unresolved rather than papered over.

---

## How to work on this safely

Run `npm run screenshots:verify` before claiming any UI work is done. It names the captures
whose sources moved. Refresh with `npm run screenshots` and then **look at the changed PNGs** —
a capture can succeed and still photograph an empty box, which is how a blank popover survived
one round. Byte count is not proof.

Adding a view, component or state means adding a scenario in the same change. The verifier
reports a registered-but-never-captured scenario as a failure, so an unphotographed surface
cannot pass quietly.

The conventions live in `AGENTS.md` at the repository root, which is tracked. A copy of the
routing notes sits in `.claude/CLAUDE.md`, which is **not** tracked — do not put anything
load-bearing only there.

## A note on trust

Two independent audits of this work found ticks that the code did not support: a P0 asserting
passive listeners that were never registered, several items claiming screen-reader
verification that never happened, a deferred lint figure understated by an order of
magnitude, and citations pointing at unrelated code. All were corrected, and the wording now
distinguishes what the source proves from what was actually exercised.

The lesson is worth carrying: **a green checklist in this packet has been wrong before.** When
something matters, verify it against the code rather than the document.
