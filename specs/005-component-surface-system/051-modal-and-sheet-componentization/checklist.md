---
title: "Verification Checklist: Modal and Sheet Componentization"
description: "The thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added."
trigger_phrases:
  - "051 checklist"
  - "shell primitive verification"
  - "modal componentization thresholds"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Modal and Sheet Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per acceptance criterion, numbered to match `AC-0NN`. Desktop measurements are taken on the
real renderer at the production mount point; phone measurements on a 390×844 profile with a navbar
present. **T002 fills every `Today` cell that carries a mechanism rather than a figure** — a "today"
cell written after the fix is a cell nobody can check against the tree that produced it.

**Priority:** C1-C5 and C8 are P0. C6, C7 and C9 are P1. C10 is the check that the rest are not
theatre and is P0. C11 is the operator's.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | One site decides chrome (AC-001) | **4** — `db-modal.ts:92-113`, `src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34`. **T002, 2026-09-05**: `rg -n "attachSheetChromeToModal\(" src/ --type ts` → 5 lines, 1 the definition (`mobile-bottom-sheet.ts:219`), 4 callers, matching exactly the four cited | **1**, or each survivor reasoned in the inventory | [ ] |
| C2 | Declared titles (AC-002) | **0 declared / 20 scraped** — `getSheetTitle` (`db-modal.ts:83-88`) finds the first `h1`/`h2`/`h3` outside `.db-sheet-modal-header`, falling back to `t("menu.title")`. **T002, 2026-09-05**: `rg -n "extends DbModal\b" src/ --type ts` → 20; `rg -n "declaredTitle\|declareTitle\|sheetTitle\s*[:=]" src/views/ --type ts` → 0 matches (exit 1, no declared-title mechanism anywhere); `rg -n "getSheetTitle" src/ --type ts` → base at `db-modal.ts:82` plus one override at `create-linked-view-modal.ts:55`, both scrape-family | 20 declared; the scrape counted, not assumed | [ ] |
| C3 | Sub-page replaces in place (AC-003) | **0 of 4 paths assertable** — no shell affordance exists. **T002, 2026-09-05**: `ls src/views/surface-shell.ts` → No such file or directory; `rg -n "createSurfaceShell\|replaceInPlace\|sub-page" src/ --type ts` → 0 matches (exit 1) | 4 of 4; parent box width and anchored edge `\|Δ\| ≤ 1px` (cross-axis not asserted, per the corrected threshold); picker over an undimmed parent | [ ] |
| C4 | Inventory dispositions every surface (AC-004) | **Superseded by T001 — stale text corrected 2026-09-05.** The file now exists: `design-trueup.md`. **T002, 2026-09-05**: `grep -c "^\| [0-9]* \|" design-trueup.md` → 35 (20 subclasses + 3 non-`DbModal` outliers + 12 header sites); AC-004 in `acceptance-criteria.md` is already `Met` for this row — this cell was left saying "file does not exist" after T001 landed, and is corrected here rather than left contradicting AC-004 | every row, six cells, zero unknown | [x] |
| C5 | One exported confirm, 7/7 grammar (AC-005) | **0 exported, 0 of 7 asserted** — `openAndWait` (`modals/confirm-modal.ts:45`, entry `:98`) is correct but unexported as the family confirm. **T002, 2026-09-05**: `sed -n '35,45p;96,99p' src/views/modals/confirm-modal.ts` → `class ConfirmModal` (line 35) carries no `export` keyword; only `export function confirmWithModal` (line 97) is public, and it wraps `openAndWait()` rather than exporting it directly; `grep -n "confirm" tools/live/sheet-grammar.mjs` → the only hits are the `confirm over a sheet` and `import confirm dropdown chain` *stacking* pair names — no lane asserts the confirm sheet's own 7 header-grammar elements | 1 path; 7 of 7 elements; `053` and `055` consume it | [ ] |
| C6 | Shell geometry from named values (AC-006) | **per-surface literals; no shell geometry, red at ≥20 for the 360px width alone** — T002 records the literal count against the ADR-006-accepted form. **T002, 2026-09-05**: `ls src/views/surface-shell.ts` → absent; `rg -c "360px" styles.css` → 20 separate declarations, none reading a shared constant; `rg -n "border-radius: var\(--db-radius-lg\)" styles.css` → the 8px value is a design-system-wide token (`--db-radius-lg`, `styles.css:83`) reused ad hoc per surface, not a shell-owned geometry declaration | 8px / 16px / 8px / 8px / 28px / 360px / 44px; **zero of the shell's seven properties (radius, horizontal padding, vertical padding, divider clearance, row height, panel width, phone close) declared as raw literals outside `surface-shell.ts`'s named constants** (`decision-record.md` ADR-006, Accepted 2026-09-05 ~18:20, restating the count from a not-yet-existing shell path to today's scattered occurrences) | [ ] |
| C7 | Motion tokens + reduced motion (AC-007) | **per-surface literals** — T002 records the count. **T002, 2026-09-05**: `rg -n "\-\-db-sheet-enter" styles.css` → one shared var, `260ms` (`styles.css:121`), used only for sheet entrance (`ease-out`) with no matching exit/`ease-in` token; `rg -n "animation:.*ms\|transition:.*transform.*ms" styles.css` (excluding shimmer/shake) → `120ms` (`.db-overlay-enter`, menus/popovers, `:175`), `180ms` (`.is-stack-parent` scale-back, `:255`), `260ms` (sheet entrance), each a distinct per-surface-class value, none matching the target 200ms/150ms | enter 200ms `ease-out`, exit 150ms `ease-in`; reduced-motion holds | [ ] |
| C8 | `044` grammar and `048` stacking hold (AC-008 regression half) | conforming today — **12** surfaces, **31** pairs green; the migrations must not regress it. **T002, 2026-09-05**: `node tools/live/sheet-grammar.mjs` → exit 0; 12 `sheet-grammar: <surface>` blocks (`sort-panel`, `filter-panel`, `add-view`, `record-detail`, `record-peek`, `column-width`, `settings`, `board-card-properties`, `owned-menu`, `date-picker`, `icon-picker`, `option-color-picker`); 31 `sheet-grammar: stacked pair` blocks; 0 `FAIL` lines; final line `PASS — every registered surface satisfies all eight grammar columns … every registered parent-to-child row keeps one scrim …` | 12 and 31 still green after every leg | [ ] |
| C9 | PM board and gantt parity (parent D5) | baseline **not yet captured** — T003 records the `pixelHash` before the first shared-chrome commit. **T002, 2026-09-05**: `find . -iname "*051*baseline*" -not -path "*/node_modules/*"` → 0 results; no `pixelHash` reference exists yet under this packet — confirmed still red, T003's task, not measured further here | `pixelHash`-identical, or an operator ruling | [ ] |
| C10 | Gate + replay + lane rows (AC-008) | **not yet run for this phase**; the shell's rows do not exist. **T002, 2026-09-05**: `rg -n "shell" tools/gate.mjs` → the only hits are an unrelated comment ("a shell loop") and the `shell: false` spawn option — zero shell-deliverable check entries; `node tools/live/replay.mjs` → exit 0, `replay: PASS — all 28 results still hold`, `reversed: 0` (per `tools/live/replay.json`, reverted after reading — not a packet artifact). Full `npm run gate` (tsc/tests/lint/21 scanners) not run for this leg — out of T002's scope and would touch unrelated tracked stamp files; the shell-specific absence above is what this row asks for | gate exit **0**, one row per deliverable, controls red→green; replay reversed **0** | [ ] |
| C11 | Operator device pass (AC-010) | **not asked yet** | the operator reads the family as one; **operator-only row, stays unticked until they say so** | [ ] |

**C1, C3 and C5 are what a later reader will check first. C10 is the check that C1-C9 are not
theatre. C11 is the check that only the operator can pass.**
<!-- /ANCHOR:protocol -->
