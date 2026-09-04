---
title: "Goal: Linked Views Notion Parity"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "046 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the durable directive from operator report 42"
    next_safe_action: "Answer the host-layout question and decide ADR-001"
    blockers:
      - "ADR-001 (may an embed write) is Proposed and gates the capability leg"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "styles.css"
      - "src/main.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does full-bleed survive Obsidian's reading-view layout"
      - "Does a move rewrite both files, or cut and paste one block"
    answered_questions: []
---
# Goal: Linked Views Notion Parity

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** An embedded linked view is the database, not a picture of one — same chrome, same
width — and placing, moving or creating one is an action in the plugin rather than clipboard work.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | The block format does not change. Every existing `note-database` and `database-view` fence keeps resolving, and the new flows write the fence `serializeCodeBlockReference` already produces. That constraint is what keeps the create and move legs small. |
| D2 | Presentation and capability are separate questions (ADR-002). `persistMode` keeps meaning where writes go and stops standing in for how the surface is dressed and what it may do. |
| D3 | **Whether an embed may write is ADR-001 and is not assumed.** The four read-only gates change together or not at all. Relaxing them one at a time produces a surface nobody can describe. |
| D4 | The host wins. If Obsidian's reading view will not give up the width, that is recorded as a constraint and AC-002 is waived against an ADR — not narrowed quietly until it passes. |
| D5 | A move writes the destination first and removes the source second. A duplicate is recoverable; a loss is not. |
| D6 | `hideHeader` stays honoured for existing blocks. Its removal as a *default* is the fix; removing the capability would break pages that use it deliberately. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Three to seven bullets, each checkable without opening another file.

- [ ] An embed renders with no card border, no duplicate database title and no expand/collapse
      chevron. **Today: all three present** in the operator's `report-42-embedded-view-clipped.png`,
      where a second "Reports" title sits under the page's own heading.
- [ ] No table column is clipped in an embed at either captured device width. **Today: clipped** —
      the same capture cuts the third column mid-cell. The mechanism is the up-to-eight-ancestor
      `note-database-embed-codeblock-host` walk at `embedded-database-renderer.ts:600-611`.
- [ ] ADR-001 has a status other than `Proposed`, and the embed's affordance set matches it.
      **Today: 4 independent read-only gates** keyed on `persistMode === "codeblock"`, none carrying
      a recorded intent.
- [ ] A linked view moved from one page to another resolves the same database, view and options, and
      exactly one block exists across the two files. **Today: no move exists** — cut and paste is
      the only path.
- [ ] Creating a linked view takes no clipboard step. **Today: clipboard is the only path** —
      `copyCurrentViewCode` (`database-view.ts:3912`) and `copyEmbeddedViewCode`
      (`embedded-database-renderer.ts:3561`) write the fence and stop.
- [ ] All sixteen block shapes the current writers can produce round-trip byte-identically, plus the
      three adversarial rows. **Today: untested** — no round-trip test exists.
- [ ] **The operator opens the Overview page and reports the nested views as reading like real
      databases.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Operator directives 2026-09-04 ~20:41 CEST, screenshots `report-42-embedded-view-clipped.png` and `report-42-standalone-reference.png` |
| Three mechanisms read | Done | Chrome: `embedded-database-renderer.ts:600-611`, `:1724-1745`. Capability: `:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593`. Format: `:3555`, `database-view.ts:3912` |
| Host-layout question | Pending | `tasks.md` T002 — the critical path |
| ADR-001 | Proposed | `decision-record.md` |

### Deviations and findings

| Item | Note |
|------|------|
| The embed already renders the real toolbar | `renderToolbar` (`:1409`) builds real view tabs, which is why the operator's screenshot shows "All" and "2026" inside the block. The gap is smaller than the screenshot suggests — it is chrome and capability, not a second renderer. |
| The chevron exists to hide chrome the embed should not have | `renderHeaderChromeToggle` (`:1724`) and `hideHeader: true` are a workaround for the nested title. Fixing the default makes the option close to vacuous, and a vacuous option left in a format is a trap for the next reader — recorded in `spec.md` §12. |
| Four read-only gates, no recorded intent | None of `:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593` carries a comment saying why. The decision exists only as a repeated conditional, which is why ADR-001 is a precondition rather than a write-up. |
<!-- /ANCHOR:log -->
