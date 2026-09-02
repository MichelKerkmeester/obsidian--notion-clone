---
title: "Feature Specification: Visual Pass Product Defects"
description: "The seventeen product defects the 2026-09-02 visual pass read on real surfaces, which 020's D5 forbids 020 from fixing."
trigger_phrases: ["visual pass defects", "035 product defects", "P1 P17 visual pass", "035 visual pass"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T23:55:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "16 of 17 defects fixed and read on recaptures; P4 open"
    next_safe_action: "Take the operator call on P4 needing a wider month column"
    blockers: ["P4 truncates 4 of 11 titles from a 48px column at 402px"]
    key_files: ["spec.md", "goal.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035"
      parent_session_id: null
    completion_pct: 89
    open_questions: ["Does a 48px phone column earn a wider month cell (P4)"]
    answered_questions: ["The selection bar clips because it scrolls and a capture cannot"]
---
# Feature Specification: Visual Pass Product Defects

> Phase chain: parent [`../spec.md`](../spec.md). Opened from the 2026-09-02 visual pass.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 035-visual-pass-product-defects |
| **Level** | 2 |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `../034-packet-doc-truth/spec.md` |
| **Status** | **In progress.** Sixteen of the seventeen are fixed and read on a recapture; P4 stays open with what was measured recorded against it — P4 improved 6 truncated segments to 4 without reaching the 0 it asks for. Every row below is a defect read on a capture and then re-verified against the source |
| **Complexity** | 41/100, confidence 80% |

**On the declared level.** `recommend-level.sh --loc 400 --files 12` returned **Level 1** at 41/100
(LOC +28, files +13, no auth/api/db/architectural flag); `--loc 300 --files 9` returned Level 1 at
34/100. This folder declares **Level 2**, and the raise is recorded here rather than left silent.

What fails at Level 1 is not the line count, it is the closure contract. The parent's §7 requires
each child's `acceptance-criteria.md` to carry the full proof tuple as a coverage table, and §6
requires each criterion to record its failing number before work starts. A Level 1 packet owes no
such document, so declaring Level 1 would put this phase outside the program's own definition of
done while seventeen independent acceptance shapes went unrecorded. The scorer reads LOC and file
counts and cannot see a doctrine.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

The 2026-09-02 visual pass read captures across the modal, calendar, board, list, toolbar, popover
and panel families and found seventeen defects that are **in the product, not in the harness**.
`020-harness-fidelity-repair` is the phase that ran the pass, and its own D5 binds it:

> *"Declare a revealed product defect in `KNOWN` rather than fix it here; a silent repair then
> reports as an unexpected pass."*

So `020` may name these and may not repair them. This phase owns the repair. It exists because the
alternative — folding them into the harness phase — is the exact failure D5 was written to prevent.

**Every file:line below was re-opened on disk for this document**, because a finding is a
hypothesis. Two of the seventeen did not survive that read as stated, and they are recorded as
found rather than corrected into agreement: see **P12** and **P16**.

### The defect list, frozen

Each row carries the surface, what the pass observed with its measured value where one exists, the
file:line as it is on disk today, and the shape a recapture must show.

| ID | Surface | Observed, with its number | On disk today | The recapture must show |
|----|---------|---------------------------|---------------|--------------------------|
| **P1** | invalid-events modal, compact | `grid-area: span` is unparseable — `span` is the grid-line keyword, not an area reference — so the rule never applied. **The pass read CSSOM `cssText` back empty.** At narrow width the span cell lands in the 28px select gutter at **0px wide** | `styles.css:11244` on `.note-database-modal.is-invalid-events-compact .db-invalid-event-span-cell`. The area **is** named `span` in `grid-template-areas` at `styles.css:11208-11210`, so the intent is legible; the four siblings `grid-area: select\|name\|start\|end` at `styles.css:11217, 11222, 11228, 11232` parse and apply | A node CSSOM parse of the rule returns a **non-empty** `cssText`, and the span cell paints right-aligned in the fourth `max-content` track at non-zero width |
| **P2** | board card, drop target | Reads `--background-interactive-hover` with no fallback; the host stylesheet never defines it, so the drop-target background is **unreachable on every device** | `styles.css:9153` on `.note-database-container .db-board-card.is-drop-target`. The surrounding hover rule at `styles.css:9142` uses `--db-hover-bg`, which the plugin does define | The drop-target background resolves to a real colour, distinct from the card's resting fill, using the token the surrounding rules use — read them, do not invent one |
| **P3** | invalid-events modal, coarse pointer | **Twelve controls under the project's 28px floor.** `tools/live/touch-targets-baseline.json` was raised **224 → 228** on 2026-09-02 to record four of them as net new | `.db-invalid-event-row-fix` declares `height: 24px` at `styles.css:11161` — 4px short — and is **absent** from the coarse-pointer raise list at `styles.css:18458-18472`, where sibling modal controls get `min-width/min-height: 28px` | `touch-targets` reports **0** of the twelve under the floor and the baseline `under` falls from **228 to 216**; the modal's action bar is otherwise unchanged in the recapture |
| **P4** | calendar-month-view, phone | An always-visible "+" in **all 35 day cells** eats ~40% of each cell, so every title truncates. Desktop shows it on hover only | Base `opacity: 0` at `styles.css:15505`, revealed on `:hover`/`:focus` at `styles.css:15518-15520`. Under `@media (pointer: coarse), (max-width: 760px)` it is forced `opacity: 1` at `styles.css:18474-18476` and floored to 28×28 at `styles.css:18469-18471` — a 28px control in a ~53px cell at 390px | Day titles render untruncated in cells that fit them, **and** the add affordance is still reachable by touch. The shipped pattern elsewhere is a corner control or a long-press; pick the smallest that keeps it reachable and **say which** |
| **P5** | chrome-toolbar, "N hidden" badge | `position: absolute` with `right: -5px` and `min-width: 16px` carrying **~60px of text**, so it overhangs across the Group button. Its border-on-muted text reads **below AA** | `.db-toolbar-badge` at `styles.css:2293-2308` (`min-width: 16px` :2294, `right: -5px` :2304, `top: -5px` :2306); `.db-toolbar-badge-neutral` overrides to `background: var(--background-modifier-border)` / `color: var(--text-muted)` at `styles.css:20152-20156`. It carries a phrase, not a count: `src/views/database-view.ts:4972` writes `t("toolbar.hiddenCount", { count })` into it | The badge is sized to its content and stays inside its own button's box; its text-on-background pair measures **≥4.5:1**, using the badge tokens sibling badges use |
| **P6** | chrome-selection-status-bar, phone | **"Copy CSV" clipped to "Cop" at 402px**; the fixed bar's three actions did not fit | The bar was built to scroll: `overflow-x: auto` with `width: max-content` at `styles.css:2497`, repeated by the `.is-phone` rule with `> * { flex: 0 0 auto }`. Nothing truncated — the box was capped at `calc(100vw - 32px)` = 370px against 416px of content, so "Copy CSV" sat 55px outside a port a capture cannot scroll. **The scroll lane was the cause, and it contradicted the wrap this row asks for; the operator chose the wrap on 2026-09-02** | **Closed.** The phone bar wraps at `styles.css:2511-2527` — `height: auto; min-height: 48px; flex-wrap: wrap; overflow-x: hidden`, the 44px action floor kept — and the placement check at `tools/storybook/verify-placement.mjs:907` was retargeted from the scroll lane to the wrapped shape. Observed red at maxActionRight 567px against clientRight 373px before the fix, green at 341px after; the content box 46px → 96px; all three labels read whole in the dark and light recaptures |
| **P7** | list-view, field cell | `"February 14, 2027"` truncates at 150px while **~900px of row is empty** | `flex: 0 0 var(--db-card-field-width, 150px)` at `styles.css:10446` on `.note-database-container .db-list-field`. The case that already works is `.db-list.is-compact-fields .db-list-field:not(.db-list-field-wrap)` at `styles.css:10453-10457` — `flex: 0 1 auto; width: max-content` — the list-sparse-fields **190px** case. The phone rule at `styles.css:18880-18884` already uses `flex: 1 1` | A date field renders its value in full when the row has room, capped at a stated maximum; the 190px sparse case measures **unchanged** |
| **P8** | field-cell-edit-select, desktop | The unregistered "Archive" row's dot and label sit **~35px left** of registered rows, because the hidden drag handle collapses the leading track | `src/views/cell-renderer.ts:1271` adds `is-hidden`; `.db-cell-option-popover .is-hidden` declares `display: none` at `styles.css:7041-7043`, which removes the element from flow rather than hiding it in place | Registered and unregistered rows share a leading edge — the track is reserved with `visibility`/`opacity`, not `display` — and the hidden handle is still non-interactive |
| **P9** | relation values | The renderer sets `is-compact` and no rule consumes it — a dead class | `src/views/relation-value-renderer.ts:36` writes `db-relation-values${compact ? " is-compact" : ""}`. `grep -n "db-relation-values" styles.css` returns **exactly one line**, `styles.css:18997`, and it carries no `.is-compact` variant | **Either** a `.db-relation-values.is-compact` rule exists and the compact treatment is visible in the recapture, **or** the class is gone from the renderer. Read the renderer's intent first, then say which and why |
| **P10** | calendar/timeline toolbar | **Four range inputs** paint as unstyled OS sliders beside themed toggles | Both rules declare layout only and no appearance: `.db-view-config-range input[type="range"]` at `styles.css:11398-11401` and `.db-calendar-range-row input[type="range"]` at `styles.css:15889-15892`, each `flex: 1; min-width: 0`. Nothing in `styles.css` sets `appearance`, a track, or a thumb | All four sliders carry the host's slider treatment. Every colour is **transcribed from a host token** the rest of the theme work uses; none invented |
| **P11** | field-icon-picker, header | Search input clipped, Remove colliding with the shuffle glyph, settings gear off-frame | `.db-icon-picker-header` at `styles.css:18366` declares `flex: 0 0 37px; height: 37px; min-height: 37px` and is `display: flex` via `styles.css:18365`, with **no `flex-wrap` and no narrow-width rule** | At the captured narrow width every header control is fully inside the popover and nothing overlaps — the header wraps, or its non-essential controls shrink |
| **P12** | cell-renderer, transient row | Reported as: reorder controls created unconditionally while the drag handle is guarded. **This does not hold on disk.** | `src/views/cell-renderer.ts:1331` creates `db-mobile-reorder-controls` and **`:1332` applies exactly the guard `:1271` gives the drag handle** — `if (isFileTags \|\| isTransient) …addClass("is-hidden")`. Both are hidden by the same class through the same `display: none` at `styles.css:7041-7043` | **Record, do not fix**, unless a recapture actually shows arrows on a transient row. If it does, the cause is a specificity or scope miss on `.is-hidden` — name it before changing anything, because the guard the report says is missing is present |
| **P13** | table footer, date aggregates | EARLIEST/LATEST print a dateKey — **`"2026-03-02"`** — while the column prints **"March 1, 2026"** | `src/views/table-footer-renderer.ts:214` returns `parseDateTimeParts(value)?.dateKey \|\| value.toISOString().slice(0, 10)`, reached from the EARLIEST/LATEST branches at `src/views/table-footer-renderer.ts:66-67` | The footer aggregate reads in the column's **own** date format, and a unit test pins the formatted output rather than the key |
| **P14** | chrome-chart-options-popover | "Export PNG"/"Copy PNG" use the muted tone while every other row label is normal, so the two **acting** rows read as disabled. Current-value texts measure **~#6c6f74 on #2e2e2e**, below AA | `.db-chart-options-export` sets `color: var(--text-muted)` at `styles.css:4506`, and `src/views/chart-toolbar-renderer.ts:895` puts that class on both rows. Sibling labels are `--text-normal`: `.db-chart-options-row-label` at `styles.css:4612`, `.db-chart-options-label` at `styles.css:4622`. `.db-chart-options-value` is `--text-faint` at `styles.css:4631` | The two acting rows carry the same label tone as their siblings, and value texts measure **≥4.5:1** in the dark recapture — both moved to the tokens sibling popovers use |
| **P15** | field-file-fields, uncoloured tag | The "saas" tag is a bare outline pill whose border looks **below 3:1** | `src/views/file-field-renderer.ts:81` creates a `status-badge` with **no `status-color-*` class**, so `--db-status-bg` falls to its `transparent` default and `--db-status-fg` to `--text-normal` (`styles.css:7253-7256`); the only edge left is the dark-theme `border-color: color-mix(in srgb, currentColor 20%, transparent)` at `styles.css:7292-7294`. The fallback the badge renderer already uses for an unregistered option is `src/views/group-label-renderer.ts:57`: `status-color-${option?.color \|\| "gray"}` | The "saas" tag carries the **gray status tokens**, and its edge or fill against the surface measures **≥3:1** |
| **P16** | panel-sort-calendar-empty | "+ Add sort" renders at the same muted tone and weight as the explanatory copy, so the only control on the panel does not read as one | `src/views/sort-panel-renderer.ts:108` uses `db-panel-button`, styled `color: var(--text-muted)`, `background: transparent`, `border: 0` at `styles.css:11868-11877`. **The report's reference is wrong**: the sibling "+ Add condition" at `src/views/filter-panel-renderer.ts:207-209` uses the **same class** and is styled identically. There is no better-styled sibling to copy | "+ Add sort" is distinguishable from the copy beside it. The change lands on `.db-panel-button`, so **"+ Add condition" moves with it** — its capture is reviewed too, or the change is scoped to the sort panel and that scoping is stated |
| **P17** | gate tooling | The gate-logs directory a red lane creates is itself rejected by the folder-docs lane for a missing README, so **one red manufactures a second** | `tools/gate.mjs:127` sets `LOG_DIR = join(REPO, "tools/lane/gate-logs")`; `tools/gate.mjs:46` runs the `folder-docs` lane as `node tools/naming/scan-folder-docs.mjs` | A deliberately reddened lane produces **exactly one** failure, not two, **and** folder-docs still fails a genuinely undocumented source folder — observe that control red. Choose the option that does not weaken folder-docs and say why |
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.** The seventeen rows above, and nothing else. `styles.css` for P1-P8, P10, P11, P14-P16;
`src/views/` for P9, P12, P13; `tools/` for P17. The recapture that reads each fix, and the
stylesheet lane handoff around it.

**Out of scope.** The harness repairs `020` owns; the 224-row touch-target ratchet, of which this
phase moves only the twelve in P3; and the 37-class resize the parent's §4a records as an operator
decision rather than a repair.

**Not in scope and named rather than absorbed:** P16's fix moves a shared class, so it reaches the
filter panel. That is a caller, not an adjacent defect — but it widens the diff and the recapture
set, so it is called out here rather than discovered mid-change.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | Every defect P1-P17 is either fixed, or recorded as not existing on disk with what was observed. |
| REQ-002 | No fix is claimed on a browser number the implementing lane cannot reach; the recapture is a separate, in-runtime step. |
| REQ-003 | Each CSS change names its selector and its before/after declaration. |
| REQ-004 | Every colour introduced is transcribed from a host or plugin token that exists; none is invented. |
| REQ-005 | The stylesheet lane is acquired before the first `styles.css` edit and released only after the captures are read. |
| REQ-006 | P12 and P16, whose reports did not survive the disk read as written, are resolved as substance rather than edited into agreement. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [ ] All seventeen rows are closed as fixed or as not-a-defect, each with its evidence. **Fourteen
      are. P4's reported mechanism proved false, P6 contradicts a pinned assertion from another
      phase, and P15's fix landed against a threshold no tag in the corpus meets.**
- [x] The visual rows are confirmed on a recapture a person has read, not on a claim. **240
      recaptured, 63 moved, read in dark and light across seventeen surfaces.**
- [x] `touch-targets` baseline `under` falls, and no other class regresses. **228 → 215, measured
      twice before it was written. The packet predicted 216; 215 is what the tree reads.**
- [x] `npm run gate` prints `gate: PASS` and exits 0, read from `$?` and not through a pipe.
      **`gate: PASS — 25 green, 0 red for a declared reason`, `$?` = 0.**
- [x] The stylesheet lane is released with a `reviewed` array naming the changed captures.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS

| Risk | Why it bites here | Response |
|---|---|---|
| A fix claimed on a number nobody could measure | The implementing lane's sandbox cannot reach Chrome, and twelve of seventeen are visual | The lane reports what it changed; a separate in-runtime verifier reads the captures and closes the row |
| A report adopted as fact | P12 and P16 were both wrong as written, and were caught only by opening the file | Every row's file:line was re-verified for this document; the implementing lane re-verifies before editing |
| A shared-class fix widening silently | P16 touches `.db-panel-button`, used by the filter panel too | Named in §2; the filter-panel capture is reviewed or the scoping is stated |
| The lane left held | Seventeen defects across one 19k-line stylesheet is a long hold | D3: the verifier releases, and only after reading the captures |
<!-- /ANCHOR:risks -->
