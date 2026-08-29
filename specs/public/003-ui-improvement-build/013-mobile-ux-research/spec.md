---
title: "Feature Specification: Mobile UX Research — Eight Architecture Decisions"
description: "A ten-iteration source audit that turns eighteen device-reported phone defects into eight settled architecture decisions: the overlay presentation/placement seam, a layer scale that does not regress sibling field editors, a modal presentation taxonomy, bounded wrapping over a second row-height system, one canonical touch predicate, plugin-owned menu semantics, calendar model reuse, and a serializable computed-output format descriptor."
trigger_phrases:
  - "mobile ux research"
  - "eight architecture decisions mobile"
  - "sheet presentation placement seam"
  - "layer scale sibling field editors"
  - "modal presentation taxonomy phone"
  - "bounded wrapping row density"
  - "canonical touch predicate"
  - "device defect inventory"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/013-mobile-ux-research"
    last_updated_at: "2026-08-29T06:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Ten iterations complete; decision matrix rebuilt"
    next_safe_action: "Land decision-matrix.md, then cut build phases 014+ from it"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "device-defect-inventory.md"
      - "research/lineages/luna/research.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-013"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "Is percent input a ratio or 0-100 for the computed-output format descriptor?"
      - "Replace all native menus for visual consistency, or only the hierarchical column submenu that carries the private .dom liability?"
    answered_questions: []
---
# Feature Specification: Mobile UX Research — Eight Architecture Decisions

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `012-mobile-name-column-and-fab`, successor `014+` build phases.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 013-mobile-ux-research |
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | In Progress |
| **Created** | 2026-08-29 |
| **Branch** | `impl` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Eighteen mobile defects accumulated across several rounds of device testing. Treated as eighteen
independent CSS bugs they invite eighteen local patches, several of which would regress each other:
raising sheets to the modal tier breaks the detail panel's relationship with its sibling field
editors, and building a row-height model duplicates one that already exists end to end. Three
earlier attempts in this programme shipped fixes that either targeted the wrong component or never
reached the device at all, so the cost of guessing here is already demonstrated rather than
hypothetical.

### Purpose

Establish, from the current branch's source rather than from inspection of the running app, what the
defects actually share; settle the architecture contracts the build phases depend on; and record
which claims are confirmed, which are inference, and which cannot be closed without a device.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A ten-iteration source audit answering eight architecture questions, forced to full depth by
  `stopPolicy: max-iterations` so convergence could not truncate it.
- An authoritative device defect inventory, written into the packet so it is auditable rather than
  reconstructed from conversation.
- A per-defect decision matrix keyed to the eight questions, with dependency order and collision risk.
- A resource map of the surfaces the build phases will touch.

### Out of Scope

- Implementation code. The build phases `014+` own that.
- Desktop behaviour changes.
- Device, screen-reader, virtual-keyboard and visual-comparison validation, which this source-only
  lineage explicitly cannot perform and records as UNKNOWN.
- Copying anything from AnyType or AppFlowy, which are licence-incompatible with this MIT plugin.

### Files to Change

| Path | Change |
|---|---|
| `device-defect-inventory.md` | Authoritative eighteen-item list plus two formula-track items |
| `research/` | Config, ledger, strategy, registry, ten iterations, deltas |
| `research/lineages/luna/research.md` | Seventeen-section synthesis |
| `research/lineages/luna/resource-map.md` | Surface inventory |
| `decision-matrix.md` | Per-defect root cause, decision, governing question, evidence |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001** Answer all eight architecture questions with current-branch `file:line` evidence,
  distinguishing confirmed fact from inference.
- **REQ-002** Run all ten iterations; convergence is telemetry only and must not stop the loop early.
- **REQ-003** Reconcile every defect against the authoritative inventory, not a substituted list.
- **REQ-004** State the device-validation limits plainly rather than presenting source reading as
  device proof.

### P1 - Required (complete OR user-approved deferral)

- **REQ-005** Produce a dependency order and a `styles.css` collision map so the build phases can be
  sequenced without merge conflicts on a file that cannot be split.
- **REQ-006** Record disputed items — anything believed to be a non-defect, already fixed, or
  mis-framed — with the evidence that says so.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- Ten of ten iterations completed with per-iteration narrative, delta and gateway event.
- Eight of eight questions resolved; zero open research questions.
- Every load-bearing claim carries a verifiable `file:line`.
- The decision matrix keys to the authoritative inventory.

### Acceptance Scenarios

1. **Given** the eighteen defects, **when** the audit completes, **then** each maps to a governing
   architecture question or is explicitly marked as governed by none.
2. **Given** a proposed fix that would regress another surface, **when** the audit examines it,
   **then** the regression is named with evidence rather than discovered during implementation.
3. **Given** a claim that cannot be settled from source, **when** it is recorded, **then** it is
   marked UNKNOWN and the validation that would close it is named.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|---|---|---|
| Research reconciles against the wrong defect list | Decisions answer a different programme | Authoritative inventory written into the packet; matrix rebuilt against it |
| Source reading mistaken for device proof | A defect is closed while still present on the phone | Confidence markers are mandatory; UNKNOWN is a valid verdict |
| A recommended fix regresses a surface it does not touch | Silent breakage found late | Sibling-editor ordering and layer tiers verified before any numeric change |
| Licence contamination from reference products | An MIT plugin absorbs AGPL material | Behaviour-only reading; no code, CSS values, token scales or asset geometry |

**Dependencies:** the `system-spec-memory` MCP is down, so `description.json` cannot be generated and
every leaf in this tree carries two environmental validation errors. Those are expected and must not
be suppressed; done means no *authoring* errors.

<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

**Percent semantics are undecided.** Whether a computed percent value is stored as a ratio or already
scaled to 0-100 changes every consumer of the output-format descriptor. This must be settled before
phase 021 ships anything.

**Menu replacement scope is an operator decision.** Replacing every native menu buys visual
consistency; replacing only the hierarchical column submenu retires the private-DOM liability, where
24 of the 26 accesses live, at a fraction of the surface area. Both are defensible.

**Device-validation limits are structural, not incidental.** This lineage read source only. Screen
reader behaviour, virtual keyboard interaction, haptics and final visual comparison are UNKNOWN and
close only on a device.

<!-- /ANCHOR:questions -->
