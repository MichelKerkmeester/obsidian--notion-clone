---
title: "Acceptance Criteria: Sheet Design Fundamentals"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "015-sheet-design-fundamentals acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Design Fundamentals

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals
**Level:** 2
**Status:** Draft — not implemented
**Date:** 2026-09-10
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given `.obnotion-calendar-mini-nav`, When measured under a coarse pointer, Then it is ≥28×28px | Lane RED→GREEN: RED 24×24px → GREEN ≥28×28px; `tools/live/sheet-grammar.mjs` / `touch-targets.mjs` | Unmet | - |
| AC-002 | REQ-002 | Given the capture harness, When it runs, Then a `group` scenario exists with ≥1 light and ≥1 dark mobile capture naming `toolbar-renderer.ts` in `sources` | `screenshots/manifest.json` entry count and `sources` field | Unmet | - |
| AC-003 | REQ-002 | Given the new `group` captures, When opened, Then a human (or this review's continuation) has looked at both and recorded what they show | Task completion note in `tasks.md` T007 | Unmet | - |
| AC-004 | REQ-003 | Given the two changes, When every landed sheet clause reruns, Then all still pass on both engines | `tools/live/sheet-grammar.mjs` exit 0, `npm run gate` green | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Not closeable yet.** This child is scaffolded by `../sheet-design-review.md`, not implemented.
All four criteria are Unmet pending a GLM implementation pass.
<!-- /ANCHOR:closure -->
