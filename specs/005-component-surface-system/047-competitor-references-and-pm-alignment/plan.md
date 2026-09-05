---
title: "Implementation Plan: Competitor References and Closer PM Alignment"
description: "Widen the reference contract first with a negative control, then capture Anytype and AppFlowy from both sources, then measure the board and gantt against Project Manager gap by gap."
trigger_phrases:
  - "implementation plan"
  - "competitor reference plan"
  - "047 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Competitor References and Closer PM Alignment

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Node capture tooling under `tools/screenshots/` |
| **Framework** | Headless Chrome for our own captures; macOS screen capture for the installed apps |
| **Storage** | PNGs under `screenshots/`, indexed by `screenshots/manifest.json` |
| **Testing** | `npm run gate` (25 lanes), `npm run screenshots:verify`, the placement harness |

### Overview

Contract first, captures second, measurement third. `manifest-schema.mjs:118` currently rejects any
reference entry not grouped `project-manager`, and `:52` allows only `pm-kanban` and `pm-gantt` as
reference renderers — so nothing from Anytype or AppFlowy can enter the manifest until that widens.
Widen it with a negative control observed red, then land the captures, then run the board and gantt
comparison the way `037`'s AC-007 and `038`'s T12 ran theirs: named elements, measured values, and a
numbered gap or a zero.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] The operator has approved installing the two Homebrew casks — installation is a scoped mutation
- [ ] The licence position per image source is recorded (REQ-007)
- [ ] `037/acceptance-criteria.md` AC-007 and `038/tasks.md` T12 read, so the comparison style is
      copied rather than reinvented

### Definition of Done
- [ ] All acceptance criteria met
- [ ] The widened contract still rejects a malformed entry, proven by a negative control
- [ ] Every closed gap carries a before and an after number
- [ ] `npm run gate` exits 0 read from `$?`; `npm run screenshots:verify` accounts for every new
      capture rather than skipping it
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Reference-beside-subject. `screenshots/project-manager/` already establishes it: a competitor's
surface sits flat in its own root, and our own captures live under `screenshots/notion-clone/`. Two
more roots join it on the same terms.

### Key Components

- **`tools/screenshots/manifest-schema.mjs`**: `CAPTURE_ROOT`, `captureRootFor()`,
  `REFERENCE_RENDERERS` at `:52`, and the reference validation at `:108-126` which hard-codes
  `group === "project-manager"` and requires a `referenceOf` naming the constructed scenario the
  entry mirrors.
- **`tools/screenshots/verify.mjs`**: the freshness lane. It hashes each entry's `sources` and
  classifies a missing one as `vendor-unavailable` when a git-ignore rule explains it, or as a real
  `MISSING` otherwise. A competitor screenshot has no source at all — a third case.
- **`screenshots/manifest.json`**: 546 entries today, `generatedFrom.stylesheet` at the top.
- **The comparison**: `037`'s reference gantt entries name their vendored sources and pair through
  `referenceOf`. An Anytype capture has no constructed counterpart, so `referenceOf` cannot mean the
  same thing for it.

### Data Flow

A capture is produced (rendered, downloaded or screenshotted), written under its root, and indexed
by a manifest entry that names its provenance. The gate's `screenshots-fresh` lane then re-checks
every entry against what it claims to depict.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `manifest-schema.mjs:118` | Rejects a reference entry not grouped `project-manager` | update — widen to a named allowlist | The negative control still goes red on a malformed entry |
| `manifest-schema.mjs:52` | `REFERENCE_RENDERERS` = `pm-kanban`, `pm-gantt` | update — add the new products' surfaces | A capture with an unlisted renderer is still rejected |
| `manifest-schema.mjs:108-126` | Requires `referenceOf` on a reference entry | update — decide what it means with no constructed counterpart | An entry missing required provenance is still rejected |
| `verify.mjs` | Classifies a missing source as vendor-unavailable or MISSING | update — a third class for "no in-repo source by design" | The classification is deterministic; the same entry never flips |
| `screenshots/manifest.json` | 546 entries | update — new reference entries | `screenshots:verify` accounts for each |
| `screenshots/README.md` | Documents the roots | update | Both new roots described with their provenance |
| `src/views/board-renderer.ts`, `styles.css` | The board | update per measured gaps only | Before and after numbers per gap |
| `src/views/calendar-timeline-renderer.ts`, `styles.css` | The gantt | update per measured gaps only | Before and after numbers per gap |
| `screenshots/notion-clone/**` | Our own captures | **unchanged unless a fidelity fix moves one** | Any move is explained by a named gap, never rebaselined silently |

Required inventories:
- Same-class producers: `rg -n 'project-manager|pm-kanban|pm-gantt' tools/screenshots tools/live` — every place the reference contract is spelled out.
- Consumers of changed symbols: `rg -n 'REFERENCE_RENDERERS|captureRootFor|referenceOf' . --glob '*.mjs' --glob '*.ts'`.
- Matrix axes: product (anytype, appflowy) × surface (board, table, calendar, timeline) × source
  (official image, installed app). Sixteen rows, and a row that cannot be captured is recorded as
  uncaptured with its reason.
- Algorithm invariant: **a widened contract must still reject.** Prove it with the negative control
  before the widening is accepted, not after.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `manifest-schema.mjs`'s widened validation, including the negative control | Vitest |
| Integration | `npm run screenshots:verify` over the enlarged manifest; `npm run gate` | Node, headless Chrome |
| Manual | Reading our board and gantt beside the three reference sets, at both themes | Reading the PNGs |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `screenshots/project-manager/` | Internal | Green — 16 PNGs landed `295401ad`, reconciled `04814e24` | None |
| Homebrew casks `anytype`, `appflowy` | External | Green — 0.56.5 and 0.14.1 exist; neither installed | The installed-app half of REQ-001 cannot be met; record it uncaptured rather than claiming zero gaps |
| Operator approval to install | External | Yellow | Installation is a scoped mutation and waits for a yes |
| Each product's image licence terms | External | Yellow | REQ-007; an unclear source is cited by URL rather than vendored |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the widened contract lets a malformed entry through, or an image's licence position
  turns out to be wrong.
- **Procedure**: revert the schema commit to restore the strict contract; `git rm` any image whose
  position is wrong and replace it with a URL citation. Because the schema, the captures and the
  fidelity fixes land as separate commits, each reverts without taking the others.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Contract widening ──┐
                    ├──► Captures ──► Fidelity comparison ──► Fixes with before/after
Licence position ───┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Contract widening | None | Captures |
| Licence position | None | Captures |
| Captures | Both above | Comparison |
| Comparison | Captures | Fixes |
| Fixes | Comparison | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Medium | Licence positions, cask installs, reading `037`/`038`'s comparison style. 2-3 hours |
| Core Implementation | High | Contract widening plus sixteen capture rows plus the comparison. 8-14 hours |
| Verification | Medium | Gate, verify, negative control, a by-hand read. 2-3 hours |
| **Total** | | **12-20 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Board and gantt capture hashes recorded before any fidelity fix, so a move is visible
- [ ] The negative control observed red on the pre-widening schema, so "still rejects" is a comparison
- [ ] Each licence position written down before its image is committed

### Rollback Procedure
1. Revert the schema commit; the strict contract returns and the new entries fail validation, which
   is the correct failure.
2. `git rm` the affected captures and their manifest entries.
3. Re-run `npm run screenshots:verify` and confirm the entry count returns to its prior value.
4. Tell the operator if an image was published in a release.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A. Images and manifest entries revert with their commits.
<!-- /ANCHOR:enhanced-rollback -->
