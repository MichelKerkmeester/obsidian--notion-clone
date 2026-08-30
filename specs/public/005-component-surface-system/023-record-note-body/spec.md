---
title: "Feature Specification: Markdown Note Body in the Record View"
description: "Every row is a markdown note whose frontmatter the plugin renders as properties, while the note's actual body is never surfaced anywhere in the plugin."
trigger_phrases:
  - "record note body"
  - "markdown notes on an item"
  - "note content in record panel"
  - "properties and text"
  - "023 note body"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/023-record-note-body"
    last_updated_at: "2026-08-30T13:25:00Z"
    last_updated_by: "phase-author"
    recent_action: "Cut from an operator question; feasibility established, shape not decided"
    next_safe_action: "Operator picks display-only or editable before any implementation"
    blockers:
      - "Shape undecided: display-only render versus editable body"
    key_files:
      - "spec.md"
      - "device-note-body-in-obsidian.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-023"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Display-only with a tap-through to the note, or editable in place?"
      - "Where does a body live in a sheet already carrying 13+ properties?"
    answered_questions:
      - "The data supports it already: every row is a note, properties are its frontmatter."
---
# Feature Specification: Markdown Note Body in the Record View

## 1. THE REQUEST

The operator:

> *"Is it also possible to add normal written markdown notes and text to an item? Currently you can
> only add properties but it should also support full markdown text alongside those properties."*

`device-note-body-in-obsidian.png` is the same record opened in Obsidian's own view — the note, its
frontmatter rendered as a Properties block, and the body beneath it.

## 2. NOTHING IS MISSING AT THE DATA LAYER

Every row **is** a markdown note in the vault, and the properties are its frontmatter. The body
already exists on disk for every record. The gap is entirely in what the plugin surfaces.

Established by reading, not assumed:

- The plugin already **reads** note bodies in eight places — `vault.read` / `cachedRead` across the
  data source, the main view, and CSV export.
- It already **writes** a body in one — `embedded-database-renderer.ts:3436` via `vault.modify`.
- `MarkdownRenderer` is already imported and working, but is called in exactly **one** place, for
  the changelog modal. Never for note content.
- `record-detail-panel.ts` has no concept of a body at all. Its only markdown is *inline* markdown
  inside a text field's value.

So this is new capability rather than new plumbing.

## 3. THE FORK THAT DECIDES THE SIZE OF THE WORK

**Display only.** Read the file, strip the frontmatter, render the remainder below the properties.
Links, embeds, task checkboxes and transclusions all work, because it is Obsidian's own renderer.
Tapping the body opens the note for editing.

**Editable in place.** Substantially larger, and the hard part is not the UI. Writing a body back
means preserving frontmatter byte-exactly on every save, while the plugin already owns frontmatter
through a different write path — two writers on one file. That is the same class of defect as the
sheet's grab bar, where two owners of one child list produced a gesture that silently stopped
working. A plain textarea is achievable; a real editor inside a bottom sheet is a much larger
commitment.

**Recommendation: display-only first**, with a tap-through to the full note, and revisit inline
editing once it has been lived with.

## 4. THE LAYOUT QUESTION

The phone sheet already carries thirteen or more properties and a keyboard-avoidance inset. A body
of arbitrary length needs a decided home — below the properties, behind a collapsed section, or on
its own tab — and that decision belongs with the operator rather than to whoever implements first.

## 5. CONSTRAINTS

- **Frontmatter must survive untouched.** Any write path must round-trip a note whose frontmatter
  the plugin did not author, including comments and key order.
- Reading a body per row is not free; whatever renders it must not do so for rows that are merely
  listed. Scope it to the opened record.
- Must not regress the sheet: the floor, the navigation bar, the backdrop and the grab band are all
  asserted and stay green.
- Comment hygiene: no spec paths, phase numbers or task ids in code comments.

## 6. ACCEPTANCE CRITERIA

Written by the phase once the shape is chosen. Each needs a number with a threshold shown failing
first, from a check that drives the production path, and an image a person opened.
