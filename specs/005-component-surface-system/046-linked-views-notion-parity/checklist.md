---
title: "Verification Checklist: Linked Views Notion Parity"
description: "Acceptance criteria with the failing number recorded first, so a pass means an embed actually stopped being a block."
trigger_phrases:
  - "046 linked views checklist"
  - "embed parity verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Linked Views Notion Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Chrome measurements are taken on a rendered embed inside
a real reading view, not on a harness mount, because the ancestor chain is the mechanism.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Block-furniture elements on an embed | 3: card border, duplicate database title, expand/collapse chevron | 0 | 1 left — title and chevron gone (`embedded-database-renderer.test.ts:487`); the border is `styles.css:15652`, untouched |
| C2 | Table columns clipped at an embed's right edge | at least 1 — the operator's capture cuts the third column mid-cell | 0 | unmeasured — the ancestor walk is gone and the width releases in percentages, but no capture or device has read it |
| C3 | Independent read-only gates keyed on `persistMode === "codeblock"` | 6 reads across 4 decisions (`:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593`), none with a recorded intent | 1 resolved capability value | [x] one `isViewReadOnly()`; the whole-file count fell 10 → 3 and the survivors are presentation |
| C4 | Clipboard steps to place a linked view | 1, and it is the only path | 0 | [x] the create flow inserts the fence at the cursor, or appends to the active file when no editor holds the caret |
| C5 | Ways to move a placed linked view | 0 (cut and paste in the editor is not one of ours) | 2: desktop drag, phone action | [x] both built — header drag and a **Move to page…** row; neither driven on a device yet |
| C6 | Block shapes covered by a round-trip test | 0 — no such test exists | 16 plus 3 adversarial | [x] green at `embedded-database-renderer.test.ts:653`, plus a cross-check against the rendering path's own parser at `:630` |
| C7 | Embeds with a photographed constructed scenario | 0 | at least 1 at both widths and themes | still 0 — T011 |

**C1 and C2 are the operator's complaint. C3 is why the fix cannot be incremental. C7 is what stops
the parity claim resting on one screenshot.**

### Blank Failing Numbers

C1's count is from reading the operator's capture, not from a script; a chrome census does not exist
yet and T001 is where it gets written. That is recorded rather than dressed up as a measurement,
because the difference between "three things I can see in a PNG" and "three elements a check found"
is exactly the difference this program keeps being caught by.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The three mechanisms are cited by file:line, not paraphrased — `implementation-summary.md` carries the census
- [ ] CHK-002 [P0] The host-layout question is answered against real Obsidian before any CSS rule
- [x] CHK-003 [P0] ADR-001 has a status other than `Proposed` before any capability gate is touched — `Accepted` 2026-09-05, and the gates moved after
- [ ] CHK-004 [P1] The `styles.css` lane holder is named before the first stylesheet edit — no stylesheet edit was made; the lane is free at `ad1dea7437ad` and the CSS leg is T015
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0 — `tsc --noEmit` exits 0. `npm run lint` does not, and did not before this packet: 175 errors across the repository, none of them a gate lane (`npm run gate` runs `lint:tools`, green). The move's inline width release adds six `obsidianmd/no-static-styles-assignment` errors that the T015 stylesheet leg would remove
- [ ] CHK-011 [P0] No console errors while rendering, moving and creating an embed
- [ ] CHK-012 [P1] An unresolvable block still shows the read-failed card with its retry action
      rather than a blank region
- [ ] CHK-013 [P1] The ADR-002 refactor lands as its own commit with no behaviour change, proven by
      an identical rendered DOM before and after — not honoured. The split arrived inside the same
      commit as the capability change it exists to make statable, so the no-behaviour-change half was
      never separately provable
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence
- [x] CHK-021 [P0] `npm run gate` exits 0, read without a pipe — 25 green, 0 red
- [x] CHK-022 [P0] The 16-row round trip plus the three adversarial rows is green
- [x] CHK-023 [P1] An interrupted move leaves the destination written and the source intact, never
      the reverse — `embedded-database-renderer.test.ts:592`
- [ ] CHK-024 [P1] A page with several embeds still renders them lazily after the width change
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [x] CHK-FIX-001 [P0] Finding class recorded. Report 42 is `algorithmic` for the width (the
      ancestor walk is the mechanism) and `class-of-bug` for the chrome.
- [x] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'persistMode' src/views/embedded-database-renderer.ts`,
      count stated before and after: `persistMode === "codeblock"` 10 → 3, every survivor presentation
- [x] CHK-FIX-003 [P0] Consumer inventory run for `note-database-embed-codeblock-host`,
      `note-database-embed-headerless` and `db-embed-header-toggle` across `src/`, `styles.css` and
      `tools/`. Nothing in `src/` or `tools/` adds the host class or the toggle any more; three
      `styles.css` blocks now match nothing (`:15857`, `:15879`, `:15908`) and are T015's to retire
- [x] CHK-FIX-004 [P0] The move writes two files. Adversarial rows required: a `dbPath` containing a
      colon, an empty `viewId:` value, trailing whitespace, and an interruption between the writes —
      all four covered
- [x] CHK-FIX-005 [P1] Matrix axes listed: 16 block shapes plus 3 adversarial rows
- [x] CHK-FIX-006 [P1] Applies — the reading view's DOM is host-owned global state, and the ancestor
      walk reads it. It also writes it: the width release sets inline styles on host elements and
      clears them on unload, which is why T002 must measure against a real preview
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA — `c2e0cb5`
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Neither the move nor the create flow constructs a vault path from unvalidated
      block content — every path is a `TFile` from the file picker, the drop target or the active
      file, and the vault adapter refuses a path that does not already resolve to a file
- [x] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [x] CHK-040 [P1] Spec/plan/tasks/decision-record agree on requirement numbering and ADR ids
- [x] CHK-041 [P1] The comment above the capability resolver states the ADR-001 outcome as intent,
      without naming the ADR id in code — `isViewReadOnly()` carries it, and no spec id, task id or
      requirement id appears in any comment this packet wrote
- [ ] CHK-042 [P1] `../roadmap.md` §4 row 42 carries the measured result
- [ ] CHK-043 [P2] The release note says plainly that notes created from an embed survive a revert
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [x] CHK-050 [P1] Temp files in scratch/ only — nothing written inside the repository
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 9/14 |
| P1 Items | 16 | 12/16 |
| P2 Items | 1 | 1/1 |

Open P0s: CHK-002 (host layout), CHK-010 (`npm run lint`, pre-existing repo-wide), CHK-011 and
CHK-020 (device), CHK-121 (write flag, T016). Open P1s: CHK-004 and CHK-122 (the CSS leg and its
capture), CHK-013 (the split did not land as its own commit), CHK-024 and CHK-042/043/110-113/120/123
(device, roadmap and release-note work that follows the lane).

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [x] CHK-101 [P1] All ADRs have status (Proposed/Accepted) — ADR-001 and ADR-002 both `Accepted`
- [x] CHK-102 [P1] Alternatives documented with rejection rationale
- [x] CHK-103 [P2] Migration path documented — N/A, no stored shape changes
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] The lazy-render gate still fires after the width change (NFR-P01)
- [ ] CHK-111 [P1] No new layout thrash on the embed's render path (NFR-P02)
- [ ] CHK-112 [P2] A page with many embeds measured, not assumed
- [ ] CHK-113 [P2] Numbers recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured if ADR-001 permits writes — writes shipped without one.
      A plugin ships as one bundle with no in-flight server edits, so reverting the release may be
      the whole rollback this item was written for. Raised as T016 rather than answered here
- [ ] CHK-122 [P1] A constructed embed scenario is in the capture manifest, so a chrome regression
      shows in `screenshots-fresh` rather than on the operator's page — still absent, which is why
      the chrome change moved no capture (T011)
- [ ] CHK-123 [P1] The release note states what a revert does and does not undo
- [ ] CHK-124 [P2] Deployment steps reviewed
<!-- /ANCHOR:deploy-ready -->
