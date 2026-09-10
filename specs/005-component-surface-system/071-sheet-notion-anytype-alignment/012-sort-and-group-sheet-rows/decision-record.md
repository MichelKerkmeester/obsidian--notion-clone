---
title: "Decision Record: Sort and Group Sheet Rows"
description: "ADR-001 on which sort reorder affordance survives, why the × became a labelled warning row, and how the group sheet's shown/hidden partition reuses the vocabulary that already ships."
trigger_phrases:
  - "071 phase 12 adr"
  - "sort reorder decision"
  - "012 sort and group decision"
importance_tier: "normal"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/012-sort-and-group-sheet-rows"
    last_updated_at: "2026-09-10T02:45:00Z"
    last_updated_by: "278-sort-group-rows-implementation"
    recent_action: "Recorded the reorder ruling: the arrow pair survives, the grip goes"
    next_safe_action: "The operator's device read (D3) closes the alignment judgement"
    blockers: []
    key_files:
      - "src/views/sort-panel-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-sort-and-group-sheet-rows-implementation"
      parent_session_id: "012-sort-and-group-sheet-rows-scaffold"
    completion_pct: 90
    open_questions:
      - "ADR-001's Notion half stays provisional until the operator's device capture (the audit's C-4): no capture in the repository shows a Notion sort rule being reordered, so which affordance Notion uses is observed nowhere"
    answered_questions:
      - "The ↑↓ arrow pair survives; the ⋮⋮ grip goes — the pair carries the keyboard path, the grip carried none (ADR-001)"
      - "The group sheet's shown/hidden partition reuses panel.shownSection/panel.hiddenSection/panel.hideAllProperties/panel.showAllProperties verbatim — the same four strings the record sheet already consumes"
---
# Decision Record: Sort and Group Sheet Rows

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The ↑↓ arrow pair is the sort sheet's one reorder affordance; the ⋮⋮ grip goes

**Decision.** The sort rule's property row keeps the up/down arrow pair and loses the drag grip. The HTML5 row drag stays wired (a pointer dragging the property row still reorders), but nothing on the sheet asks the eye to find a grip.

**Evidence, measured 2026-09-10 before the change (lane, both clauses red):**

| Question | Measurement | Reading |
|---|---|---|
| What does each affordance answer to? | The arrows are two `<button type="button">` elements carrying `title` and `aria-label` ("Move up" / "Move down"); the grip is a `<span>` whose only interaction is the row's `draggable` attribute — HTML5 drag, which neither a Tab nor a keys-only pass can reach | The pair carries the keyboard path; the grip is pointer-only. The packet's own threshold: the survivor must carry the keyboard path |
| What does the sheet carry today? | Lane RED: 2 affordances (drag + arrow pair) on 1 row of 5 controls; 2/2 rows, 5 interactive controls on the heaviest | Both mechanisms, one crowded row |
| What ships? | Lane GREEN: 1 affordance, 3 interactive controls on the heaviest row, the rule at 6/6 rows inside 44–52px (48, 44, 44, 48, 44, 44) | The grip's removal is what took the row from 5 controls to 3; nothing else had to |

**Notion half: PROVISIONAL.** The audit's §3.10 records that no capture shows a Notion sort rule being reordered, and lists it as needing the operator's device capture (§5 C-4). This ruling therefore decides ours by our own evidence — the keyboard threshold — and holds the Notion question open for that capture. If the operator's capture shows a 6-dot grip, the finding amends here rather than being absorbed.

**What did not change.** The direction control keeps the plugin's own picker (0 native selects, lane-proven both runs). The rule row's 44–52px pitch, the 16px insets, the 1px-first-0px/later divider grammar and the row span (357px = 357px) are regression-checked, not redesigned: identical clauses, green, in the same run.

<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The × became a labelled warning row, and the glyph's hit-area number is recorded — this is legibility, not a touch-target fix

**Decision.** The rule's third row is a `<button class="obnotion-panel-row obnotion-sort-delete-row is-warning">` — a trash icon, the word "Delete" (`common.delete`, shipped), the whole box its own hit target.

**The measured number the packet's own note demanded (T003, taken before any markup moved):** the glyph's own box measured **28.0×28.0**; its painted hit box, grown by the `::before` inset (`inset: -6px 0 -6px -12px`), measured **40.0×40.0**. The lane printed this on its own INFO line in the pre-change run and reports "removed — the labelled row carries its own hit area" after. **One correction to the record:** the audit (§3.10, and this packet's goal decision D3) states the expanded hit area "already clears the 44px floor"; the lane measures 40.0×40.0, which is 4px short of it. The packet's ruling — the change is legibility, not a touch-target fix — is therefore *stronger* than scaffolded: the labelled row is what gave the delete its 44px box (min-height 44px), so the note's bracketed claim is amended here by measurement rather than silently repeated. The filter sheet's own narrow buttons keep the same class and the same 40×40 geometry; that is their packet's scope, not this one's.

**What did not change.** The `is-warning` colour: the menu family's own destructive-row rule (`.obnotion-menu-item.is-warning` → `var(--text-error)`) is what three producers already use; the sort row carries the class and the sheet-scoped rule repeats only the token, so the colour stays the one the rest of the plugin reads.

<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The group sheet's shown/hidden partition reuses the record sheet's four strings, and both sections always render

**Decision.** The "Group by" property list partitions into "Shown" (`panel.shownSection`) and "Hidden" (`panel.hiddenSection`), the partition read from the view state's own hidden-column set — the same set the column manager's shown/hidden count reads and the toolbar's hidden-properties badge counts. Each section header carries its bulk action on its own line: "Hide all" (`panel.hideAllProperties`) beside Shown, "Show all" (`panel.showAllProperties`) beside Hidden, both wired through one new optional `ToolbarActions.setHiddenColumns(keys)` action implemented in both hosts (the main view guards required columns — title, grouping, board subgroup — exactly as its own hide-all already does; the embedded renderer mirrors its own column-visibility plumbing). Neither the partition nor the four strings is new vocabulary.

**Both sections render even when one side is empty.** A list that rearranges itself as soon as the first property hides reads as two different lists; the partition is the vocabulary, not the counts. The clause asserts ≥2 section headings with ≥2 bulk actions, which is what the empty-Hidden case still satisfies.

**Prose.** The calendar hint shortened to 74 characters (`"Spanning, all-day and overlapping events sort first; rules order the rest."`, 跨度、全天与重叠时段的事件先排；排序规则决定其余顺序。) — under the 80-character target by measurement (the clause reads 126 → 74). The shorter copy drops the "Calendar views" prefix in both locales: the hint only renders inside the calendar sort sheet, where the context is the sheet itself.

**The one structural exception, recorded:** the direction row and the delete row indent to 42px so both read under the property row's own picker (the arrow pair's 42px column); the block box keeps the row's full 341px span, which is why the lane's one-inset-to-inset-span clause stays green.

<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:evidence -->
## Evidence: RED → GREEN, the numbers

| Clause | RED (2026-09-10, pre-change) | GREEN (same day, post-change) |
|---|---|---|
| Sort rule = 2 picker rows + labelled delete | 1 row, 5 controls, 2 × glyphs, 0 warning rows, 2 affordances | 6/6 rows 44–52px, 3 controls heaviest, 0 ×, 2 warning rows, 1 affordance |
| Group partition | 1 heading, 0 bulk actions | 3 headings (16/16 inset, dividers 0,1,1), 2 with a bulk action on their own line |
| Group row controls | heaviest 1 (unasserted before) | heaviest 1, clause ≤4 |
| Sheet prose | longest run 126 characters | 74 characters |
| 90svH / keyboard inset, 5 rules | 5 rules via 3 presses of the sheet's own add control, 378px (under the ceiling) | 759.6px = the 90svH ceiling exactly, the body scrolls (759.6/759.6) |
| Unit contract (`sort-panel-renderer.test.ts`) | — (new) | 3/3; red-then-green proven by reverting the producer: 1 failed \| 2 passed → 3 passed |

Regression: the 005 clauses (rows 44–52px, 16px/16px, 1px divider, 0 native selects, one row span, extent == clientWidth) ran unchanged and green on both engines in the same run, alongside the group clause set. Full battery: `npx tsc --noEmit` 0, `npx vitest run` 1601/1601 (158 files), `npm run build` 0, `node tools/live/render-assertions.mjs` 0, `node tools/storybook/verify-placement.mjs` 0 (418/420, 2 declared), `node tools/live/evidence.mjs --check-all` 16/16 fresh, `npm run gate` 28 green / 0 red, `node tools/naming/scan-comments.mjs` 0, `node tools/naming/scan-failing-values.mjs` 0. Captures: four `npm run screenshots` runs exit 0 (two judged pairs, the second after the hand fixtures were mirrored onto the new markup); 16 content-changed captures judged by decoded pixel delta and kept (the four constructed-sort-panel, four constructed-sort-panel-calendar, four panel-sort-rules, four panel-sort-calendar-empty); two one-run jitters (board-view-desktop-dark, 8px@Δ1) restored to their committed bytes with their manifest rows patched; the recurring 66px@209 import-modal mover stayed pixelHash-identical and named as byte-only. The stylesheet moved fcaf3fec28cf → 6e10b42f6324 inside one acquire/edit/release triplet, holder 012-sort-and-group-sheet-rows, all 16 content movers named.

<!-- /ANCHOR:evidence -->
