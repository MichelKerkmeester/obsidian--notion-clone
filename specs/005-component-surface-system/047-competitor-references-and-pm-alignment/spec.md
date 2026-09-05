---
title: "Feature Specification: Competitor References and Closer PM Alignment"
description: "Capture Anytype and AppFlowy references beside the Project Manager set, and close the board and gantt fidelity gap the operator named as 'align closer' with in-repo comparison criteria."
trigger_phrases:
  - "competitor references"
  - "anytype appflowy captures"
  - "047 pm alignment"
  - "align closer board timeline"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T07:35:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Opened the phase from the rows 37/38 align-closer ruling"
    next_safe_action: "Widen the reference contract in manifest-schema.mjs before any capture lands"
    blockers:
      - "manifest-schema.mjs hard-codes group project-manager for reference entries"
    key_files:
      - "tools/screenshots/manifest-schema.mjs"
      - "screenshots/manifest.json"
      - "src/views/board-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How does the freshness lane treat a capture with no in-repo source?"
      - "Which Anytype and AppFlowy surfaces are in scope beyond board, table, calendar, timeline?"
    answered_questions:
      - "Both Homebrew casks exist and neither app is installed: anytype 0.56.5, appflowy 0.14.1"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Competitor References and Closer PM Alignment

<!-- SPECKIT_LEVEL: 2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Opened 2026-09-05 from the operator's ruling on
> `../roadmap.md` §4 rows 37 and 38: **"align closer"**, plus Anytype and AppFlowy references.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Not started |
| **Created** | 2026-09-05 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Phase** | 47 of 47 |
| **Predecessor** | `046-linked-views-notion-parity` |
| **Successor** | None |
| **Handoff Criteria** | Reference captures land with a widened, still-strict manifest contract; every fidelity gap is measured before it is closed |
| **Complexity** | 53/100, confidence 92% — `recommend-level.sh --loc 500 --files 18 --api`. Phase score **10/50** against a threshold of 25, so a standard child rather than a phased packet: `phase-definitions.md` §2 needs both thresholds and this meets neither the phase one nor the level-3 one |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 47** of the Component Surface System.

**Scope Boundary**: reference captures and the board/gantt fidelity pass. Not a new port — `037` and
`038` did the ports and both landed.

**Dependencies**: `037` and `038`'s reference captures already landed under
`screenshots/project-manager/` (`295401ad`, reconciled `04814e24`), so the comparison half has
something to compare against.

**Deliverables**:
- `screenshots/anytype/` and `screenshots/appflowy/` with manifest entries in
  `screenshots/project-manager/`'s style.
- A widened reference contract in `tools/screenshots/manifest-schema.mjs` that still rejects a
  malformed entry.
- A measured board and gantt fidelity comparison against Project Manager, gap by gap.
- Every closed gap carrying a before and an after number.

**Changelog**: when this phase closes, refresh the matching file in `../changelog/` using the parent
packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Rows 37 and 38 have been open since 2026-09-04 waiting for one thing no in-repo session can do: the
operator installing both plugins in one vault and comparing them. On 2026-09-05 the operator read
0.0.22 and returned a verdict rather than a confirmation — **"align closer"** — and asked for two
further reference sets beside Project Manager: **Anytype** and **AppFlowy**, boards, tables,
calendar and timeline, from both the official product images and the apps installed locally.

The in-repo comparison halves of both rows are already `Met`: `037`'s AC-007 matched 60 of 60
`pm-gantt-*` classes with zero divergence at `30c4b746`, and `038`'s T12 matched fourteen
carried-forward elements to the pixel at `c563f08`. So "align closer" is not a claim that those
measurements were wrong. It is a statement that matching the reference on the elements we chose to
carry is not the same as looking like it, and that one reference is a narrow basis for a judgment
about how a database plugin should look.

**There is a contract problem in the way.** `tools/screenshots/manifest-schema.mjs:118` rejects any
reference entry whose `group` is not `"project-manager"`, and `:52` restricts `REFERENCE_RENDERERS`
to `pm-kanban` and `pm-gantt`. A capture under `screenshots/anytype/` cannot enter the manifest at
all today. That is the first thing this phase touches, and widening it carelessly would turn a
strict contract into a permissive one.

**There is a second, deeper mismatch.** The Project Manager references are *rendered from vendored
source* — each entry's `sources` array names `specs/context/obsidian-pm-main/src/views/gantt/*.ts`
and the freshness lane hashes them. An Anytype screenshot has no in-repo source to hash. The
manifest's freshness model does not have an answer for that yet, and inventing a fake source would
be worse than declaring the gap.

### Purpose

Give the fidelity judgment more than one reference to stand on, and turn "align closer" into a list
of measured gaps rather than an impression.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Anytype** and **AppFlowy** reference captures: board, table, calendar and timeline surfaces,
  from **both** official product images **and** the locally installed apps. Both Homebrew casks
  exist — `anytype` 0.56.5 and `appflowy` 0.14.1 — and **neither is installed today**, so the
  install is part of the work.
- `screenshots/anytype/` and `screenshots/appflowy/` as new capture roots, flat, the way
  `screenshots/project-manager/` is.
- Manifest entries in the project-manager style, with the provenance a downloaded image or an app
  screenshot needs and a rendered capture does not.
- Widening `manifest-schema.mjs`'s reference contract without loosening it.
- The board and gantt fidelity pass against Project Manager: every difference measured, then either
  closed or dispositioned.

### Out of Scope
- Re-porting the board or the gantt. `037` and `038` landed; this is a fidelity pass over what
  shipped.
- Rows 37 and 38 themselves. They close on the operator's own vault comparison and nothing here
  substitutes for that.
- Anytype's or AppFlowy's source code. There is no vendored copy and this phase does not create one.
- Redistributing competitor product images beyond what their terms allow — see §6.
- `045-board-card-properties`'s per-view card fields, which sit behind `boardExtensionsEnabled` and
  deliberately do not move the reference path.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `tools/screenshots/manifest-schema.mjs` | Modify | Widen the reference contract past `project-manager`, `pm-kanban` and `pm-gantt` |
| `screenshots/manifest.json` | Modify | The new reference entries |
| `screenshots/anytype/`, `screenshots/appflowy/` | Create | The capture roots |
| `screenshots/README.md` | Modify | What the two new roots are and where they came from |
| `tools/screenshots/verify.mjs` | Modify | How a capture with no in-repo source is classified |
| `src/views/board-renderer.ts`, `styles.css` | Modify | Whatever the board fidelity pass measures and closes |
| `src/views/calendar-timeline-renderer.ts`, `styles.css` | Modify | Whatever the gantt fidelity pass measures and closes |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | `screenshots/anytype/` and `screenshots/appflowy/` exist and carry board, table, calendar and timeline captures from **both** sources the operator named: official product images and the locally installed apps |
| REQ-002 | Every new capture has a manifest entry carrying its provenance — which source it came from, which app version, and when — in the shape `screenshots/project-manager/`'s entries use |
| REQ-003 | The board and gantt are compared against Project Manager with **in-repo comparison criteria**, in the style `037`'s AC-007 and `038`'s T12 used: named elements, measured values, zero-divergence or a numbered gap |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | `manifest-schema.mjs`'s widened reference contract still **rejects** a malformed entry. A negative control proves it, observed red |
| REQ-005 | Every fidelity gap that is closed carries a before and an after number. A gap dispositioned rather than closed says why |
| REQ-006 | `npm run gate` exits 0 read from `$?`, and `npm run screenshots:verify` accounts for every new capture rather than silently skipping it |
| REQ-007 | The licence and attribution position for each competitor image is recorded before it is committed |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: a reviewer can open `screenshots/anytype/`, `screenshots/appflowy/` and
  `screenshots/project-manager/` beside our own captures and compare four products without leaving
  the repository.
- **SC-002**: "align closer" is a numbered list of measured differences, each closed or
  dispositioned, rather than a verdict.
- **SC-003**: the manifest contract is wider and no weaker — the negative control still goes red.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Widening the reference contract turns a strict check into a permissive one | High | REQ-004: a negative control observed red before the widening is accepted |
| Risk | A competitor image is committed without a licence position | High — it is a redistribution question, not a technical one | REQ-007 records the position per source before the commit, and an image whose terms are unclear is cited by URL rather than vendored |
| Risk | The freshness lane silently skips the new captures | Medium — a skipped capture is a check measuring nothing, this program's founding failure | REQ-006 requires them accounted for; `verify.mjs` already has a `vendor-unavailable` class for a git-ignored source and it is the nearest existing shape |
| Risk | "Align closer" is closed by opinion | High | REQ-003 and REQ-005: measured elements, before and after numbers |
| Risk | The installed-app screenshots drift as the apps auto-update | Medium — `anytype` is `auto_updates` | REQ-002 records the app version in the entry, so a later reader knows what they are looking at |
| Dependency | `screenshots/project-manager/` | Green — landed `295401ad`, reconciled `04814e24` | None |
| Dependency | Homebrew casks `anytype` and `appflowy` | Green — both exist, neither installed | Installation is a scoped mutation and needs the operator's go-ahead |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: the capture set grows. Record `npm run screenshots:verify`'s entry count and wall
  time before and after, so "bigger" is measured rather than assumed.

### Security
- **NFR-S01**: no credential is used to obtain a competitor image. Anything behind a login is out.
- **NFR-S02**: downloaded images are inspected before they are committed; nothing is fetched into
  the repository unreviewed.

### Reliability
- **NFR-R01**: a reference capture with no in-repo source must be classified deterministically by
  `verify.mjs` — always fresh, always vendor-unavailable, or always stale. Never "sometimes".
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- An app whose surface has no counterpart in this plugin — AppFlowy's kanban has a board, its
  "grid" is a table, and neither maps exactly. Capture it and say what it is, rather than forcing a
  name.
- An official product image at a resolution or aspect that matches no device profile: record it as a
  marketing image, not as a device capture.

### Error Scenarios
- The cask install fails or the app requires an account: record the surface as uncaptured with the
  reason. An absent capture reported as absent is fine; an absent capture reported as zero gaps is not.
- The manifest schema rejects a new entry: that is the contract working. Widen it deliberately, in
  its own commit, with the negative control.

### State Transitions
- An app auto-updates between capture and review: the entry's recorded version is what makes that
  visible instead of silent.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 16/25 | ~18 files; two new capture roots; a schema contract |
| Risk | 14/25 | Licence and contract-loosening are the real risks, not the code |
| Research | 12/20 | Four products, four surfaces, two sources each |
| **Total** | **42/70** | **Level 2** — matching `recommend-level.sh`'s 53/100 and its phase score of 10/50 |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- **How does `verify.mjs` classify a capture with no in-repo source?** Its `vendor-unavailable`
  class exists for a git-ignored source and is the nearest fit, but a competitor screenshot has no
  source at all rather than an unavailable one. Inventing a fake `sources` entry to satisfy the lane
  would be worse than widening the lane honestly.
- **Which surfaces beyond board, table, calendar and timeline?** The operator's words were "boards,
  tables, calendar, timeline etc." — the "etc." is not scoped. Recommend: capture those four per
  product first, then ask.
- **Do the competitor images ship in the repository or are they cited?** REQ-007 records the
  position per source. Official press-kit images usually permit editorial use; a screenshot of a
  locally installed open-source app is a different question again from a marketing render.
- **Does "align closer" have a stopping point?** `037`'s in-repo half already measured zero
  divergence on 60 of 60 classes. If the next pass also measures zero, the gap is in what was
  carried rather than in how faithfully it was carried — and that is a scope conversation with the
  operator, not a fidelity fix.
<!-- /ANCHOR:questions -->
