---
title: "Implementation Summary: Excluded parity items"
description: "Honest scaffold status: five Notion parity items are excluded on purpose; each exclusion and the single revisit trigger are recorded, nothing is built."
trigger_phrases:
  - "excluded parity items"
  - "out of scope parity"
  - "implementation summary"
  - "person people property"
  - "me() function"
  - "goodbases renderer"
  - "notion file cdn"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/017-excluded-parity-items"
    last_updated_at: "2026-08-26T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Recorded HOLD packet as empty-diff deliverable"
    next_safe_action: "Keep closed; reopen person/me() only on identity + Wave 6"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 017-excluded-parity-items |
| **Completed** | On Hold (DO-NOT-BUILD) — packet is the deliverable; fork proof is empty diff |
| **Level** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

This phase is On Hold by design, not a planned build. Wave 6 records five Notion parity items as out of scope: person/people property, `style()`/`unstyle()` rich-text formula output, `me()`, GoodBases as the table renderer, and fetching Notion file CDN URLs. Each exclusion and its reason live in `spec.md`. `plan.md` and `tasks.md` state that no build is planned; T004–T008 are retired exclusion reasons, not a work breakdown.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Created (scaffold) | Level 1 out-of-scope decision spec |
| `plan.md` | Created (scaffold) | Level 1 plan stating no build |
| `tasks.md` | Created (scaffold) | Level 1 task list with no plugin work |
| `implementation-summary.md` | Created (scaffold) | Honest HOLD status |

Plugin fork (`MEGA/Development/Obsidian Plugin`): no files created or modified.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Authored as an Out-of-scope packet. The four Level 1 documents were written from the phase brief and the parent Wave 6 map. No implementation work has been performed; the deliverable is the HOLD packet plus an empty fork diff.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Exclude person/people property | Obsidian has no user directory to resolve people against; model people as a `Clients` relation instead. |
| Exclude `style()` / `unstyle()` formula output | The fork's markdown `textRenderMode` already renders styled text, so a formula-level styling API adds surface without new capability. |
| Exclude `me()` | There is no person type to resolve "me" to; it depends on the excluded person/people model. |
| Do not adopt GoodBases as the renderer | Chrome-only, with no formulas, rollups, or footers; building on it would drop the fork's engines. Mine only its hover-open idea in `014-record-detail-panel`. |
| Exclude fetching Notion file CDN URLs | Network fetch plus iCloud duplication of the bytes; the `012-files-column` ruling already rejects this. |
| Single revisit trigger | Reopen **only person/people and `me()`** if Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered. CDN fetch and GoodBases never reopen. `style()`/`unstyle()` stays excluded even after identity. Notion-parity-for-its-own-sake is not a trigger. |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Plugin typecheck / tests | N/A — no new code; HOLD packet is the deliverable, not a typecheck of a module |
| Any excluded item present in the fork | Must remain absent (emoji `people` keys do not count) |
| Notion CDN fetch on a files column | Must remain absent |
| Fork diff for this phase | Must be empty — empty `git diff --stat` is the fork proof |

Concrete gate: a `git diff --stat` in the fork must show no change from this phase, and `validate.sh 017-excluded-parity-items --strict` is the packet gate (Errors: 0 required).

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **HOLD, mostly never.** Fork proof is an empty diff, not a typecheck of new code. `plan.md` and `tasks.md` describe a non-build; T004–T008 are retired exclusion reasons, not an implementation sequence.
2. **People are a relation, not a directory.** Until Obsidian provides a user/identity model **and** Wave 6 is explicitly entered, person/people and `me()` have no owned data to resolve against.
3. **Hover-open is the only GoodBases takeaway.** Its renderer is excluded; only the interaction idea carries forward, in `014-record-detail-panel`.
4. **The revisit trigger is three buckets.** Identity unlocks **only** person/people and `me()`. CDN fetch and GoodBases-as-renderer **never** reopen. `style()`/`unstyle()` stays excluded even after identity.

<!-- /ANCHOR:limitations -->

---

<!--
CORE TEMPLATE: Post-implementation documentation, created AFTER work completes.
Write in human voice: active, direct, specific. No em dashes, no hedging, no AI filler.
-->
