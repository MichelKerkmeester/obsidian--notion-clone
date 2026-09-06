---
title: "Acceptance Criteria: Gallery Deprecation Docs and Release"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 4 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/004-docs-and-release"
    last_updated_at: "2026-09-06T00:30:00Z"
    last_updated_by: "gallery-007-004-docs-and-release"
    recent_action: "AC-001 through AC-006 verified Met; AC-007 stays Unmet, operator-only"
    next_safe_action: "None here — only the operator's own device confirmation remains"
    blockers:
      - "AC-007 is operator-only"
    key_files:
      - "spec.md"
      - "README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-004-ac"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Gallery Deprecation Docs and Release

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/004-docs-and-release
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** `README.md` after this phase, **When** a reader looks for the views the plugin offers, **Then** the gallery is not among them. **Failing value today: 7 gallery references, including "Six database views" at `:22` and a screenshot row at `:43-45`** | `rg -n -i gallery README.md`, and a read of the rendered table | Met | - |
| AC-002 | REQ-002 | **Given** `001`'s declared-loss list, **When** `CHANGELOG.md` is written, **Then** every loss appears **individually**. A summary such as "some gallery settings" fails this row. **Failing value today: no entry exists** | Each loss found by name in the CHANGELOG entry | Met | - |
| AC-003 | REQ-003 | **Given** a user considering a rollback, **When** they read `CHANGELOG.md`, **Then** it says plainly that a migrated view stays a board and that the only reversal is the per-view in-app undo. **Failing value today: unstated** | The sentence, present and unambiguous | Met | - |
| AC-004 | REQ-004 | **Given** `030-gallery-view-deprecation`, **When** this retirement ships, **Then** its documents read as closed against it, keeping their own measurements. **Failing value today: `030` is 4/6 and open against a view that will not exist** | `030/spec.md`'s Status line, its measurements still present, and the §5.A row | Met | - |
| AC-005 | REQ-005 | **Given** `package.json`, **When** its plugin `description` is read, **Then** it does not name the gallery. **Failing value today: it does** | `rg -n gallery package.json` | Met | - |
| AC-006 | REQ-006 | **Given** the finished docs, **When** the release is considered, **Then** a version number carries the removal — or the cut is handed to the orchestrator **with the target version recorded**. `006`'s `008` prepared docs and left the cut owed; recording the target is what makes the handoff checkable | The release tag, or the recorded target version in `implementation-summary.md` | Met | - |
| AC-007 | REQ-001 | **Given** a released build, **When** the operator opens a vault that had a gallery view, **Then** they report it as migrated rather than broken. **Only the operator closes this row** | An operator report against a named release, recorded on `../../005-component-surface-system/roadmap.md` §4 | Unmet | - |

**Verification observed, 2026-09-06:**

- **AC-001:** `rg -n -i gallery README.md` returns nothing. "Six database views" is now "Five database views" (`:22`); the Gallery screenshot row is removed; the page-preview and cover-settings prose (`:87`, `:120-123`) name only the surviving views.
- **AC-002:** `CHANGELOG.md`'s `## 0.0.28` entry names all six `gallery*` fields by name: `galleryImageField`, `galleryImageAspectRatio` and `galleryImageFit` as full carries; `galleryImageAspectRatioPreset` as a softened loss (the number carries, the preset name does not); `galleryCardSize` and `galleryCardSizePreset` as genuine losses with no board equivalent.
- **AC-003:** the `## 0.0.28` Removed section states plainly that reinstalling an older plugin version does not turn a migrated board back into a gallery, and that immediately after migration the notice's own Undo action is the one reversal.
- **AC-004:** `030/spec.md`'s Status reads Superseded, its measured footprint and its `goal.md`/`tasks.md` evidence tables are unchanged in substance (only the rows the retirement resolved were ticked), and `005/roadmap.md` §5.A's row is trued up to **83% — 5/6**.
- **AC-005:** `rg -n gallery package.json` returns nothing; also removed from `keywords`, since `rg -i gallery README.md package.json` (SC-001) checks the whole file.
- **AC-006:** release **0.0.28** (`d3433d81`) already carries children `001`-`003` — `manifest.json`, `package.json` and `versions.json` all read `0.0.28`, and `932fa3a9`/`fb27ba5b` are both confirmed ancestors of the release commit.

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No — AC-007 is the only row left, and it is the operator's.

AC-001 through AC-006 are `Met`, each against evidence observed 2026-09-06 rather than assumed. AC-002
was the row this phase existed for: the difference between a declared loss and a discovered one is
whether it was named, and naming it individually is more work than summarising it — `CHANGELOG.md`'s
`## 0.0.28` entry names all six `gallery*` fields by name. AC-006 did not need an assumption: release
**0.0.28** (`d3433d81`) already carries children `001`-`003`, cut before this doc phase started rather
than left owed the way `006`'s `008` left 0.0.23. AC-007 is the operator's and an agent never ticks it.
<!-- /ANCHOR:closure -->
