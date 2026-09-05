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
| C1 | One site decides chrome (AC-001) | **4** — `db-modal.ts:92-113`, `src/main.ts:3047`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34` | **1**, or each survivor reasoned in the inventory | [ ] |
| C2 | Declared titles (AC-002) | **0 declared / 20 scraped** — `getSheetTitle` (`db-modal.ts:83-88`) finds the first `h1`/`h2`/`h3` outside `.db-sheet-modal-header`, falling back to `t("menu.title")` | 20 declared; the scrape counted, not assumed | [ ] |
| C3 | Sub-page replaces in place (AC-003) | **0 of 4 paths assertable** — no shell affordance exists | 4 of 4; parent box `\|Δ\| ≤ 1px`; picker over an undimmed parent | [ ] |
| C4 | Inventory dispositions every surface (AC-004) | **file does not exist**; census = 20 subclasses (13 `sheet`, 4 `fullscreen`, 3 default) + 3 non-`DbModal` outliers + 12 `createSheetHeader` sites | every row, six cells, zero unknown | [ ] |
| C5 | One exported confirm, 7/7 grammar (AC-005) | **0 exported, 0 of 7 asserted** — `openAndWait` (`modals/confirm-modal.ts:45`, entry `:98`) is correct but unexported as the family confirm | 1 path; 7 of 7 elements; `053` and `055` consume it | [ ] |
| C6 | Shell geometry from named values (AC-006) | **per-surface literals; no shell geometry** — T002 records the literal count | 8px / 16px / 8px / 8px / 28px / 360px / 44px, zero literals in the shell path | [ ] |
| C7 | Motion tokens + reduced motion (AC-007) | **per-surface literals** — T002 records the count | enter 200ms `ease-out`, exit 150ms `ease-in`; reduced-motion holds | [ ] |
| C8 | `044` grammar and `048` stacking hold (AC-008 regression half) | conforming today — **12** surfaces, **31** pairs green; the migrations must not regress it | 12 and 31 still green after every leg | [ ] |
| C9 | PM board and gantt parity (parent D5) | baseline **not yet captured** — T003 records the `pixelHash` before the first shared-chrome commit | `pixelHash`-identical, or an operator ruling | [ ] |
| C10 | Gate + replay + lane rows (AC-008) | **not yet run for this phase**; the shell's rows do not exist | gate exit **0**, one row per deliverable, controls red→green; replay reversed **0** | [ ] |
| C11 | Operator device pass (AC-010) | **not asked yet** | the operator reads the family as one; **operator-only row, stays unticked until they say so** | [ ] |

**C1, C3 and C5 are what a later reader will check first. C10 is the check that C1-C9 are not
theatre. C11 is the check that only the operator can pass.**
<!-- /ANCHOR:protocol -->
