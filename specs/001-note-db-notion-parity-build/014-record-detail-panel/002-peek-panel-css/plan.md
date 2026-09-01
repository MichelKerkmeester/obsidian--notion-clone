---
title: "Implementation Plan: Peek Panel CSS"
description: "Plan for one appended styles.css block: hover/phone OPEN, CSS-docked peek panel, theme variables only, zero toolbar and zero calendar-detail selectors."
trigger_phrases:
  - "peek panel css plan"
  - "db-record-open-btn"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/002-peek-panel-css"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-panel CSS child from synthesis ranks 4 and 6 and final-plan step 4"
    next_safe_action: "Append the delimited styles.css block after class names from child 001"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-peek-panel-css"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Peek Panel CSS

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Plugin-root `styles.css` (Obsidian loads only this file) |
| **Framework** | Theme CSS variables already documented at `styles.css:35-45` |
| **Storage** | None |
| **Testing** | `git diff styles.css` plus grep of that diff |

### Overview
Final-plan step 4. Prefix-by-construction under `.note-database-container`. Container is already `position: relative; overflow: auto` (`styles.css:121-125`); dock with absolute right edges, skip `getVisiblePopoverBounds`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 4 and rank 6 CSS half plus final-plan step 4 read.
- [x] Class names locked by child 001.
- [x] Calendar `.db-record-detail-*` truncation at `:7592-7597` recorded as forbidden reuse.

### Definition of Done
- [ ] `git diff styles.css` is one appended block.
- [ ] Grep of the diff for `toolbar` / `patchToolbarNew` / `.db-record-detail-` is empty.
- [ ] Phone opacity-1 rule present; z-index 998; wrap not ellipsis.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Append-only stylesheet hunk. Same hover-reveal idiom as `styles.css:770`.

### Key Components
- **OPEN button**: opacity 0 default; row-hover 1; phone 1.
- **Peek panel**: absolute dock inside `.note-database-container`.
- **Fields**: wrap; `overflow-y: auto` on the panel body.

### Data Flow
No JS. Phone uses `body.is-phone` already applied by Obsidian. Dismiss-on-scroll is a later TypeScript listener (child 001 module) against this `overflow: auto` box.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Only `styles.css`. Do not restyle `.db-toolbar*` or `.db-record-detail-*`. Algorithm invariant: theme variables only; long values wrap.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm class names from child 001 and container rules at `styles.css:63-125`.

### Phase 2: Core Implementation
- [ ] Append the delimited block at EOF.

### Phase 3: Verification
- [ ] Diff/grep audit for toolbar and calendar-detail selectors.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Diff audit | One appended block; no toolbar / `.db-record-detail-*` | `git diff styles.css` + grep |
| Manual | Hover reveal + phone persistent OPEN | Deferred to child 005 |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child `001-table-record-peek-module` class names | Internal | Specified | CSS would miss the DOM |
| Plugin-root `styles.css` | Internal | Exists | Only stylesheet Obsidian loads |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Toolbar selectors, calendar-detail reuse, or hard-coded colors.
- **Procedure**: Delete the appended block only. Do not revert unrelated `styles.css` hunks.
<!-- /ANCHOR:rollback -->
