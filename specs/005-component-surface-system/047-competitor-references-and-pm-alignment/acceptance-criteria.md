---
title: "Acceptance Criteria: Competitor References and Closer PM Alignment"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "047 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T12:10:00Z"
    last_updated_by: "code-agent"
    recent_action: "Rewrote AC-001/AC-008 to Anytype-only scope per ADR-003 (AppFlowy removed)"
    next_safe_action: "Write the negative control red-first, then widen the reference contract"
    blockers:
      - "manifest-schema.mjs rejects any reference group but project-manager"
      - "AC-007 is operator-only"
    key_files:
      - "spec.md"
      - "tools/screenshots/manifest-schema.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Competitor References and Closer PM Alignment

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/047-competitor-references-and-pm-alignment
**Level:** 2
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the operator's ask, **When** the captures land, **Then** `screenshots/anytype/` carries board, table, calendar and timeline from **both** official product images and the locally installed app. **Failing value today: 0 of 8 rows** — the root did not exist and `brew info --cask` reported the app "Not installed". **2026-09-05: cask installed (0.56.5). Of the 8 product×surface×source rows: 6 captured — board/table/calendar-official + board/table/calendar-installed (all three reached once the capture pass switched to driving Anytype over the Chrome DevTools Protocol — a same-process DOM `el.click()` after OS-level clicks proved unreliable and were then forbidden by the operator to avoid interrupting their concurrent use of the machine). 2 N/A (Anytype has no timeline/gantt view — confirmed against its own documentation, both sources). All 8 rows now carry a final disposition — 6 captured, 2 N/A — with none blocked. Beyond the matrix, Anytype also carries an official properties image plus 31 installed captures total (18 keyboard-phase: search/slash menu/object creation/settings/type pages; 13 CDP-phase: all six set layouts, view settings, filter/relation pickers, new-object type picker, object context menu). **2026-09-05, later: this row was originally a 16-row Anytype+AppFlowy matrix and closed `Waived` (ADR-002) on AppFlowy's two unreached rows. The operator then removed AppFlowy from the reference set entirely — `decision-record.md` ADR-003, superseding ADR-002 — narrowing this criterion to the 8-row Anytype-only matrix above, which is fully captured or N/A** **2026-09-05, mobile leg (ADR-005): a `mobile/` sibling now carries 59 mobile states in light and dark (118 files), captured from the open-source iOS client built from `anytype-swift@77ef5ea2` and run on an iPhone 17 Pro simulator against this same demo space, joined over the network. It extends this row's evidence to the phone form factor without reopening the 8-row matrix: iOS ships no Calendar and no Graph layout at all, so on mobile those are absent for a product reason rather than a capture one** **2026-09-05, menus**: beyond the matrix again — 150 distinct Anytype menus captured in both themes, clipped and full-window (600 files in `screenshots/anytype/menus/`), covering the set controls bar, grid cell editors for all eleven relation formats, the object page, navigation and settings, and the kanban/calendar/gallery/list card surfaces; six unreachable items are recorded with their exact refusal in `screenshots/anytype/README.md`, and the demo space reads back unchanged at both ends of every run | `screenshots/anytype/`, its contents, and the uncaptured-row record for anything that could not be taken — see `screenshots/anytype/README.md`, "Views not captured, and why" | Met | - |
| AC-002 | REQ-002 | **Given** each new capture, **When** its manifest entry is read, **Then** it names its source, the app version and the capture date. **Failing value today: 546 entries, 16 references, all Project Manager, and none of them needs a version because they are rendered from vendored source. 2026-09-05: still 0 Anytype manifest entries, deliberately — `manifest-schema.mjs:52,118` accepts only `group: "project-manager"` and `pm-kanban`/`pm-gantt`, confirmed by reading the schema. Adding an entry today would either fail validation or require loosening the contract outside this leg's scope (T006, a separate task). Provenance (source URL/licence for official images, app version/capture date for installed ones) is instead recorded in each folder's `sources.md` and `README.md`** | The entries, and `screenshots:verify` accounting for each | Unmet | - |
| AC-003 | REQ-004 | **Given** the widened reference contract, **When** a malformed entry is validated, **Then** it is still rejected. **Failing value today: no negative control exists**, and `manifest-schema.mjs:118` rejects everything that is not `project-manager` — which is strict but also why nothing new can land | A negative control observed red against BOTH the old and the widened schema, covering an unknown group, an unknown renderer, a missing `referenceOf` and a path escaping its root | Unmet | - |
| AC-004 | REQ-006 | **Given** a capture with no in-repo source, **When** `verify.mjs` classifies it, **Then** the class is deterministic and distinct from `vendor-unavailable`, which means an *unavailable* source rather than *no* source. **Failing value today: no such class** | The classification, run twice, producing the same answer | Unmet | - |
| AC-005 | REQ-003 | **Given** the board, **When** it is compared against Project Manager in `038`'s T12 style, **Then** every difference is a named element with a measured value. **Failing value today: unknown** — T12 matched 14 carried-forward elements at `c563f08` and the operator still says "align closer" | The comparison table, element by element | Unmet | - |
| AC-006 | REQ-003, REQ-005 | **Given** the gantt, **When** it is compared in `037`'s AC-007 style, **Then** the same holds, and every gap closed carries a before and an after number. **Failing value today: unknown** — AC-007 matched 60 of 60 `pm-gantt-*` classes with zero divergence at `30c4b746`, and the verdict is still "align closer" | The comparison table, plus a before/after per closed gap | Unmet | - |
| AC-007 | REQ-003 | **Given** a released build, **When** the operator reads the board and the timeline, **Then** they no longer say "align closer". **Only the operator closes this row** | An operator report against a named release, recorded on `../roadmap.md` §4 rows 37 and 38 | Unmet | - |
| AC-008 | REQ-007 | **Given** each competitor image, **When** it is committed, **Then** a licence and attribution position for its source is already recorded. **Failing value today: 0 positions recorded. 2026-09-05: all 5 official Anytype images have a recorded position in `screenshots/anytype/sources.md`, written before this commit — each cites its source URL and states the position is "terms unclear, cited by URL, used for internal comparison" since the product does not publish an editorial-use licence for these images. (AppFlowy's 4 official images and their `sources.md` entry were removed with the rest of `screenshots/appflowy/` — `decision-record.md` ADR-003.)** | The committed licence record, dated before the image commit — `screenshots/anytype/sources.md` | Met | - |

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

**Closeable:** No

The capture leg (AC-001, AC-002, AC-008) ran 2026-09-05: AC-008 is Met, AC-002 stays Unmet for a
structural reason recorded against its row, and AC-001 closed the same day as `Waived` (ADR-002,
2026-09-05) on a 16-row Anytype+AppFlowy matrix — the operator had chosen to skip AppFlowy's two
remaining installed-app rows rather than spend real click time on a Flutter app with no scriptable
surface. **Later the same day the operator removed AppFlowy from the reference set entirely**
(`decision-record.md` ADR-003, superseding ADR-002); AC-001 was rewritten to the narrower 8-row
Anytype-only matrix and now reads `Met`. The
contract-widening and fidelity legs (AC-003 through AC-006) have not run. AC-003 is the row that
decides whether this packet leaves the repository better or
worse: widening a contract is easy, and widening it while it still rejects is the actual work — a
negative control that only ever ran against the old schema proves nothing about the new one. AC-005
and AC-006 read "unknown" today rather than carrying a number, which is honest: both prior
comparisons measured zero divergence on what they carried, so the number this phase needs does not
exist yet and inventing one would be worse than saying so. AC-007 is the operator's and an agent
never ticks it.
<!-- /ANCHOR:closure -->
