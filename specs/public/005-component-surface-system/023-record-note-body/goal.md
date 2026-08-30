---
title: "Goal: Markdown Note Body in the Record View"
description: "The durable directive for surfacing a record's note body, and the criteria that decide when it is done."
trigger_phrases:
  - "023 goal"
  - "record note body goal"
  - "note body directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/023-record-note-body"
    last_updated_at: "2026-08-30T21:00:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored; phase not started, 0 of 9 criteria met"
    next_safe_action: "Operator picks display-only or editable before any implementation"
    blockers:
      - "Shape undecided: display-only render versus editable body"
      - "The body's home in a sheet already carrying 13+ properties is undecided"
    key_files:
      - "spec.md"
      - "plan.md"
      - "device-note-body-in-obsidian.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-023"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Display-only with a tap-through to the note, or editable in place?"
      - "Where does a body live in a sheet already carrying 13+ properties?"
      - "If editable: how does a body write serialize against the frontmatter write queue?"
    answered_questions:
      - "The data supports it already: every row is a note, properties are its frontmatter"
      - "The plugin serializes frontmatter writes per file; a body writer would sit outside that queue"
---
# Goal: Markdown Note Body in the Record View

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The opened record shows its note's body alongside its properties, without the plugin
becoming a second, unserialized writer to that file.

**Why.** Every row **is** a markdown note and the properties are its frontmatter, so the body
already exists on disk for every record and the plugin has never surfaced it. Half of each record is
invisible.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The fork closes before implementation starts. The two shapes score 40 and 64 on one scale; only one can damage a file. |
| D2 | The body renders through Obsidian's own `MarkdownRenderer`, not a reimplementation. |
| D3 | A body is read only for the opened record, never for rows that are merely listed. |
| D4 | Frontmatter round-trips byte-exactly, comments and key order included, on any path that writes. |
| D5 | If editable: the body write uses the same per-file serialization as the frontmatter writes, or argues in writing why it is safe outside it. |
| D6 | The body's home in the sheet is decided by the operator, not by implementation order. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its third decision governs closure here:
shipped, verified and operator-confirmed are three states, and only the third closes anything.

**Not started, and not startable.** The first criterion below is the operator's to answer and it
changes the size of the work by roughly an order of magnitude.

The two criteria marked *editable only* do not apply if display-only is chosen. They are not waived
by that choice; they cease to exist. Every other criterion holds either way.

The embedded renderer's `vault.modify` at `embedded-database-renderer.ts:3436` is prior art to read,
not a surface to change.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] The operator has chosen display-only or editable in place, recorded in this folder. Nothing
      below starts first.
- [ ] The body's home in the sheet is chosen by the operator: below the properties, a collapsed
      section, or its own tab.
- [ ] The opened record's body renders through `MarkdownRenderer`, non-empty for a note that has one.
- [ ] A note with no body renders pixel-identically to today: no empty container, no reserved space.
- [ ] Listed rows trigger **0** body reads beyond the opened record.
- [ ] Sheet floor, navigation bar, backdrop and grab band stay asserted and green.
- [ ] *Editable only:* frontmatter the plugin did not author round-trips byte-exactly, comments and
      key order included.
- [ ] *Editable only:* a concurrent property edit and body edit on one file lose neither write.
- [ ] The operator opens a record on device and sees the note.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

**Nothing has started, and that is deliberate.** The phase is blocked on one decision the operator
owns, and the two shapes are different phases wearing one folder name.

**Display only.** Read the file, strip the frontmatter, render the remainder below the properties.
Links, embeds, task checkboxes and transclusions all work, because it is Obsidian's own renderer.
Tapping the body opens the note for editing. No new write path, so no new way to corrupt a file.

**Editable in place**, and the hard part is not the interface. The plugin writes frontmatter through
`app.fileManager.processFrontMatter` (`property-service.ts:214`, `data-source.ts:336`) behind a
**per-file write queue** (`data-source.ts:122`) whose own comment states the reason: *"concurrent
processFrontMatter calls into the same file corrupt each other."* A body writer using `vault.modify`
would rewrite the whole file, frontmatter included, from **outside** that queue — the exact hazard
the queue was built to prevent, approached from a direction it cannot see.

That is the same defect shape this program has already found twice: two owners of one child list
produced a sheet gesture that silently stopped working (`012`, `016`), and two owners of a
checkbox's appearance produced a control that painted differently depending on where it was mounted
(`004`).

**The concurrency criterion is the one that decides whether editable is viable**, and it is the one
an implementation would naturally defer. The queue exists because this case has already been hit
once from a single writer.

### Nothing is missing at the data layer

Established by reading the source, not assumed.

| Fact | Evidence |
|------|----------|
| The plugin already reads note bodies | **Nine** `vault.read` / `cachedRead` sites across five files |
| It already writes a body in exactly one place | `embedded-database-renderer.ts:3436`, via `vault.modify` |
| `MarkdownRenderer` is imported and working | `main.ts:16` |
| It is called in exactly one place, never for note content | `main.ts:438`, the changelog modal |
| `record-detail-panel.ts` has no concept of a body | 539 lines; its only markdown is inline, inside a text field's value |

`device-note-body-in-obsidian.png` is the same record opened in Obsidian's own view. It is the target
and also the argument: Obsidian already shows this, for this exact file, and the plugin does not.

**`plan.md` ADR-001 proposes display-only first and is `Proposed`, not accepted.** This goal does not
pick the fork. The criteria above are written so that either answer leaves them describing the work.
<!-- /ANCHOR:log -->
