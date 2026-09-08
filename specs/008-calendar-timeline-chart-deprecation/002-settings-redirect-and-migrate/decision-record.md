---
title: "Decision Record: Calendar/Timeline/Chart Settings Redirect and Migration"
description: "ADR-001 the fallback rule per type — which two close for free at the sanitizer and which one needs the real migration, and why."
trigger_phrases:
  - "008 phase 2 adr"
  - "calendar timeline chart fallback rule"
  - "settings redirect decision"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-08T15:20:00Z"
    last_updated_by: "redirect-and-migrate-run"
    recent_action: "Took the fallback-rule ADR this phase's implementation needed"
    next_safe_action: "Hand off for a release cut; 003 waits for it"
    blockers: []
    key_files:
      - "src/main.ts"
      - "src/data/chart-migration.ts"
      - "src/data/calendar-migration.ts"
      - "src/data/timeline-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "calendar-timeline-chart-008-002-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Chart and calendar close for free at the settings-load sanitizer; timeline routes through a real migration — ADR-001"
---
# Decision Record: Calendar/Timeline/Chart Settings Redirect and Migration

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The fallback rule per type

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Implementation, applying `001-usage-and-migration-audit/inventory.md` §1.2/§5's already-decided redirect targets |

### Context

`001`'s audit named three redirect targets — chart→table, calendar→table, timeline→board — and
flagged that two of them (chart, calendar) equal the unknown-type fallback the settings-load
sanitizer already applies to anything it does not recognize, while the third (timeline) does not.
007-002's own ADR-002 established the criterion this phase inherits rather than re-derives: closing
an accepting surface's exemption by deletion is only safe when the migration's target equals the
generic fallback. Gallery's target (board) did not equal it, so 007-002 routed gallery through a real
migration at the sanitizer instead of a bare coercion. 006's list case is the mirror: list's target
(table) equalled the fallback, so its exemption closed by simple deletion with no stranded field.

### Decision

The three types split the same way, on purpose, matching whichever precedent their own target lines
up with rather than being treated as one group:

1. **Chart and calendar close for free.** Both `src/main.ts` sanitizer sites' `!== "chart"`
   exemption is deleted outright — chart falls straight through to the bare `viewType = "table"`
   coercion, the same edge 006's `e0e1c568` proved safe for list. Calendar was never exempted in the
   first place (the exemption list only ever named `board` and, until this phase, `chart`), so it
   required no code change at the sanitizer at all. Neither type has anything worth carrying at
   settings-load time by this same reasoning: chart's fields (aggregation, bucketing, palette,
   reference lines) have no table equivalent, and calendar's one carryable field
   (`calendarStartDateField`→table `sortColumn`) is carried by the **on-open** migration instead,
   which runs before any host renders the redirected view — settings-load happens earlier, before a
   render host exists to act on the carried value, so there is nothing lost by leaving the carry to
   the on-open hook alone.
2. **Timeline routes through the real migration.** `src/data/timeline-migration.ts`'s
   `planTimelineMigration`/`applyTimelineMigration` are called from both settings-load sanitizer
   sites in place of the bare fallback, carrying `timelineGroupField` onto `boardGroupField` (an
   existing `boardGroupField` wins, mirroring gallery's `boardImageField` precedent). A bare
   coercion to `table` at settings-load time would strand the lane grouping before the on-open
   migration in `database-view.ts`/`embedded-database-renderer.ts` ever got a chance to carry it —
   the identical failure mode 007-002 avoided for gallery's cover field.
3. **The on-open migration exists for all three regardless of the sanitizer's shape.** Chart and
   calendar each get `migrateChartViewOnOpen`/`migrateCalendarViewOnOpen` in both render hosts, using
   a plain `Notice` (matching `migrateListViewOnOpen`'s shape, since their target equals the
   fallback and there is no undo-worthy field carry to announce with a toast). Timeline gets
   `migrateTimelineViewOnOpen` using an undo-carrying toast (matching `migrateGalleryViewOnOpen`'s
   shape, since its target differs from the fallback and the lane-grouping carry is exactly the kind
   of change an operator would want to undo).

### Consequences

- REQ-002 ("every existing view of the three types opens through the settings redirect") is
  satisfied identically for all three at the frontmatter-storage path (the on-open migration, which
  is the path all 33 of `001`'s live views actually take), and satisfied at the settings-json storage
  path by two different mechanisms that both terminate at the same three target types.
- Chart and calendar's settings-load sanitizer change is a one-line deletion each, not a new module
  call — smaller and more auditable than treating all three uniformly would have been, and it
  matches the shape the codebase already has two precedents for (006/list, and — for the fields that
  are NOT carried — chart's own "everything is a declared loss" character from `001`'s audit).
- `parseViewType()` stays open for all three, unconditionally: closing it for any of the three at
  read time would strand the same fields the sanitizer's naive form would have, since there is no
  plan/apply step available at parse time without duplicating the migration into the parser itself —
  the identical reasoning 007-002 gave for why `parseViewType()` stays open for gallery.

### Alternatives Rejected

- **Route all three through a dedicated migration at the sanitizer, uniformly.** Rejected: chart and
  calendar have nothing to carry at settings-load time (their one carryable field, for calendar, is
  carried by the on-open hook instead), so adding a plan/apply call there would be dead code passing
  every test by doing no work — the same shape `gallery-migration.ts`'s own header comment warns
  against for a different guard it once carried.
- **Close `chart`'s exemption by leaving `calendar` newly exempted too, for symmetry.** Rejected:
  calendar was never exempted before this phase and adding a new exemption for it now would be
  strictly worse than its current (correct) bare-fallback behavior — there is no reason to invent a
  no-op branch.
- **Treat the settings-json storage path as unreachable and skip the sanitizer change.** Rejected:
  `001`'s audit found the frontmatter path to be the only one with live instances, but the two
  storage paths are not mutually exclusive, and 006/007 both treated the settings-json path as an
  accepting surface worth closing on the same evidence-of-absence footing this phase inherits.
<!-- /ANCHOR:adr-001 -->
