**Phase 000 — Surface contract and truthful harness**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`, branch `main`. **This phase blocks the other seven — and it now runs AFTER `009`.** Holds the `styles.css` lane.

**WHY.** A surface's appearance is decided by where it was mounted. Tokens are declared on nine selectors (`styles.css:19-27`); `.db-owned-menu` is the **only** body-portal surface missing from that list. Measured: **29/29 probed overlay classes compute differently on `document.body` vs inside `.note-database-container`; 25/29 carry no tokens there.** Menus ship square-cornered at 14px where the design says 8px and 13px. Five `var(--db-*)` uses on that subtree have no fallback.

**AND NO HARNESS CAN SEE IT.** `.storybook/preview.ts` wraps every story in the container that supplies the tokens. The screenshot fixtures do the same. No harness contains a `.mobile-navbar`.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../adversarial-review.md`, `../architecture-findings.md`, `../design-system.md`, `../roadmap.md`, then this folder's `spec.md` and `acceptance-criteria.md`. Cite them; never restate them.

**LANE.** One phase holds `styles.css`. Release only after full recapture **and a human looking at the PNGs**.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.** Every criterion measured at the production mount point, a number or hit test with a threshold, **proven to fail on today's tree with the number recorded**, and paired with a negative control. Plus the five stateful dimensions: semantic identity, transition trace, action outcome, resource ownership, negative-control mutation. **Plus the tenth condition: an instrument this phase did not repair.** Class names and call counts are **banned** — every 1.3.1 criterion was that shape and every one passed.

**DONE MEANS** the numbers moved from their recorded failing values, the negative controls hold, **every harness number agrees with `009`'s live number or is listed uncorroborated with a reason**, both named exit criteria are recorded for `001` and `003`, and the operator confirms on device.
**HARNESS DEPENDENCE, 2026-08-31 — 17 sound / 2 dependent / 1 unknown.** Two acceptance bullets do
not survive the question *would this still fail on a device*. The **action-outcome** dimension drives
`openRow` and `editCell`, which are no-op stubs, so a model delta asserted against them is the
`editFileName` false green again. And **AC-016's checker implements the opposite of AC-016**:
`scan-pinned-values.mjs:128` skips a property `src/` also assigns, which is the population the
criterion names — `--db-table-header-top`, `--db-board-column-width` and `--db-gallery-card-width`
are all still pinned and all skipped. **The tenth condition is the one that holds**: AC-013's live
pairing is the only row in the program that can catch a supply nobody has named yet. Full row-by-row
classification in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**THE THING THAT CHANGED: YOU CANNOT BE YOUR OWN INSTRUMENT.**

This phase repairs the harness in Stage 1 and then asserts its own criteria through that repaired harness. Every negative control runs inside the instrument this phase just rewrote. A repair that is subtly wrong in a way that makes all the checks pass is indistinguishable from a correct one — **1.3.1's failure mode with a different wrapper supplying the illusion.**

`009` now runs first and stands up the live probe against the running Obsidian: the one measurement surface this phase cannot edit. **Stage 1.5 pairs every harness number with the live number for the same surface, and a disagreement BLOCKS this phase.** Not adjudicated by preference — the harness can be blind and the probe can be measuring the wrong node, and the point is to find out which. Surfaces the probe cannot reach go on an **uncorroborated list with reasons**; a surface absent from both the pairs and that list means the cross-check was incomplete, not that the surface was fine.

**T0 — DO THIS BEFORE ANYTHING ELSE.** `tools/storybook/verify-placement.mjs:164-171` asserts a widthless caller renders **wider than 320px**, labelled as intentional, and runs on every push via `.github/workflows/gates.yml:67`. **It asserts the defect.** Invert it before the census, before the cascade audit, before any product code — or phase 001 turns CI red and the cheapest reading of a red pipeline is to revert the fix.

**Rebase risk is explicit.** Four lines in a file `001`, `002`, `003` and `005` all edit later. A conflict resolved toward `main` silently restores it. Ship the inversion **with a guard that fails when the old predicate returns**, demonstrate the guard against the pre-inversion file, then rebase onto `main` once and rerun it.

**T2 — THE DESKTOP PAGE HAS NO CASCADE AT ALL.** `verify-placement.mjs:220` loads `styles.css` on the **phone page only**; the desktop checks at `:130-178` run against a document with no stylesheet. Every desktop geometry result to date is structurally irrelevant to the shipped product. Load it on the desktop page — **and record at least one desktop measurement that CHANGES because of it, before and after.** A repair that moves no number did not repair anything; if nothing moves, the desktop checks never touched the cascade and that is the finding.

**T4 — FOUR PINNED VALUES, NOT ONE, AND ONE IS A TYPE ERROR.** `tools/screenshots/runtime-vars.css` hardcodes:

| Variable | Line | Why it is wrong |
|---|---|---|
| `--db-mobile-sheet-bottom` | `:43` | computed at `popover-position.ts:115`; pinning `0px` pins the sheet defect to its correct answer |
| `--db-header-height` | `:24` | **never assigned in `src/` at all**; the sole consumer `styles.css:17698` takes its `34px` fallback in production, so `40px` is a value the product never produces |
| `--db-card-field-width` | `:29` | set conditionally at `card-field-renderer.ts:108`; pinning it means the unset branch never renders |
| `--db-timeline-row` | `:63` | **a type error.** The runtime assigns a unitless grid line index (`calendar-timeline-renderer.ts:588`, `:660`); `styles.css:16316` and `:16554` read it as `grid-row: var(--db-timeline-row, 1)`. `34px` is invalid — **every timeline capture ever taken is void** |

**All four go in Stage 1, before any baseline is recorded** — every later phase measures against the baseline this stage produces. Then add a scan: **no harness file may assign a custom property the runtime also assigns.** The four are its first fixtures; the scan is what stops a fifth. Expect a large timeline recapture diff — that is a correction, not a regression.

**T4b — THE FINGERPRINT IGNORES THE HARNESS.** `capture.mjs:205` fingerprints `[...scenario.sources, "styles.css"]` and no scenario lists a harness file, so editing `runtime-vars.css`, `.storybook/preview.ts` or `verify-placement.mjs` triggers no recapture. Add all three.

**T7b/T7c/T7d — THREE CHECKERS THIS PHASE OWNS FOR THE WHOLE PROGRAM.**
- **Input hashes.** Every recorded criterion value carries the hashes of the files it was measured against. This was `008`'s AC-010; it moves here because evidence can only be content-addressed **at the moment it is measured**, and `008` is already the most loaded phase. Reconstructing vintage afterwards is archaeology.
- **Blank-cell checker.** No phase moves `Planned` → `In Progress` while a *census*/*trace* "today" cell is empty. The doctrine already said a blank cell blocks acceptance; prose is not a gate. Every such row must also name **what produces its number and at which stage**.
- **Checkbox-parent guard.** Five checkbox inputs are created classless and styled only because the call site classes their parent one line earlier: `table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`, `record-detail-panel.ts:339`. `004` owns the fix and starts after this phase, while `004` and `005` both unblock here — so a wrapper change in either breaks them with no failing test. Fail when any of the five parents stops being classed.

**BUILD.**
- `openSurface()` returning a typed `SurfaceHandle` **registered through the existing `overlayStack` + interaction scope**, not beside them. `overlay-stack.ts` has exactly one importer; `owned-menu.ts` uses neither and hand-rolls capture-phase document listeners for ten caller files.
- Explicit mount adapter: local | body portal | shadow root | top layer. Never auto-select top layer.
- Owned token boundary: a **versioned snapshot copied onto the surface root**. Never set plugin variables on `body`, `documentElement` or an Obsidian ancestor.
- Logical `AnchorRef` lease: scope + row/cell/event key + record identity. The DOM node is a render-epoch cache. States `open → anchored(A) → anchor-missing(pending) → anchored(B) → close`.
- Cascade audit: 87 duplicated selectors, 124 silently overridden values, each classified intentional or dead. **Unknown is a blocker, not permission to keep the last one.**

**INVENTORY BY CONSTRUCTION, NOT GREP.** Static analysis provably misses surfaces here — five modules are already invisible to the story-coverage gate. Instrument `createDiv`, drive every surface, log class + mount parent + resolved tokens + rect. **The delta against the grep is the deliverable.**

**MIGRATE, DON'T REWRITE.** Add `openSurface()` as an adapter over `positionToolbarPopover` and `OwnedMenuHandle`. **Delete nothing** — `008` owns every compatibility retirement.

**TWO NAMED EXIT CRITERIA, WITH NAMED CONSUMERS.** Neither is tradable for the A1/A2/A7 subset at a handoff:
- **Registry equality → consumed by `001`.** `001` migrates surfaces against this registry; an incomplete one defers the discovery to `008`, weeks later.
- **The `AnchorRef` lease, PROVEN → consumed by `003`.** Proven means a surface survives its anchor being destroyed by a wholesale `refresh()` and still repositions. A partial lease that satisfies A1/A2/A7 hands `003` a foundation it discovers is hollow after committing to it.

**MECHANISM CLAIMS ARE BANNED, INCLUDING FOR CI.** The contract scan closes on **two exit statuses in order** — non-zero with a deliberately reintroduced bypass present, then 0 once it is removed, both read without a pipe. "A CI check exists" is the shape every 1.3.1 criterion had, and every one of those passed.

**CITE BY SYMBOL, NOT BY LINE.** This phase's cascade audit invalidates every `styles.css` line number cited anywhere in the program. From here on, a citation to a file this program edits names the selector or symbol **plus the grep that finds it** — `styles.css § .db-owned-menu .db-menu-item` (`rg -n '\.db-owned-menu \.db-menu-item' styles.css`). A human greps; an autonomous agent may trust the number and edit the wrong line. Numbers already recorded as *measurements* stay verbatim — they are evidence of a dated tree, not navigation.

**TRAPS.** A pipe makes `$?` the pipe's status — this hid three failures in one session; use `cmd >log 2>&1; echo $?`. `validate.sh` needs the hub cwd and a fresh `dist`.
<!-- /ANCHOR:log -->
