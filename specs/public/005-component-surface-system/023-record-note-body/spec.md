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
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Body home defaulted below the properties; the four sheet surfaces re-verified green"
    next_safe_action: "The operator opens a record on device and sees the note"
    blockers:
      - "Shape undecided: display-only render versus editable body"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "device-note-body-in-obsidian.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-023"
      parent_session_id: null
    completion_pct: 89
    open_questions:
      - "Display-only with a tap-through to the note, or editable in place?"
      - "Where does a body live in a sheet already carrying 13+ properties?"
    answered_questions:
      - "The data supports it already: every row is a note, properties are its frontmatter."
      - "The plugin serializes frontmatter writes per file; a body writer would sit outside that queue."
---
# Feature Specification: Markdown Note Body in the Record View

> Phase chain: parent [`../spec.md`](../spec.md). Not started, and **deliberately not startable**:
> §12's first question decides the size of the work by roughly an order of magnitude, and it is the
> operator's to answer.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Every row in the database **is** a markdown note in the vault, and the properties the plugin renders
are that note's frontmatter. The body already exists on disk for every record. The plugin has simply
never surfaced it.

So this is new capability rather than new plumbing, and the interesting question is not whether it
can be done but which of two very different things is being asked for. Rendering a body is a small
piece of work. Editing one in place is a much larger one, and the hard part is not the interface —
it is that the plugin would become the second writer to a file it already writes through a
different, carefully serialized path.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 023-record-note-body |
| **Level** | 3 |
| **Priority** | P2 |
| **Status** | Implemented — editable in place, chosen by the operator; shipped in 1.3.9, not device-confirmed |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | None |
| **Successor** | None |
| **Blocks** | Nothing |
| **Blocked by** | **The operator's answer to §12's first question** |
| **CSS lane** | Will take the lane if a body lands in the sheet |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### The Request

The operator:

> *"Is it also possible to add normal written markdown notes and text to an item? Currently you can
> only add properties but it should also support full markdown text alongside those properties."*

`device-note-body-in-obsidian.png` is the same record opened in Obsidian's own view — the note, its
frontmatter rendered as a Properties block, and the body beneath it. That image is the target and
also the argument: Obsidian already shows this, for this exact file, and the plugin does not.

### Nothing Is Missing At The Data Layer

Established by reading the source, not assumed:

| Fact | Evidence |
|---|---|
| The plugin already reads note bodies | **Nine** `vault.read` / `cachedRead` call sites across five files: `data-source.ts` (2), `database-view.ts` (3), `main.ts` (2), `csv-markdown-zip-export.ts` (1), `embedded-database-renderer.ts` (1) |
| It already writes a body in exactly one place | `embedded-database-renderer.ts:3436`, via `vault.modify` |
| `MarkdownRenderer` is imported and working | `main.ts:16` |
| It is called in exactly one place, and never for note content | `main.ts:438`, rendering the changelog modal |
| `record-detail-panel.ts` has no concept of a body | 539 lines; its only markdown is *inline* markdown inside a text field's value |

### Why It Matters

A database row that cannot show its own note is a database over notes that has quietly redefined
what a note is. The operator is not asking for a feature so much as pointing out that half of each
record is invisible.

### Goals

- The body of the opened record is visible in the plugin.
- Frontmatter survives untouched, byte for byte, on any path that writes.
- The sheet does not regress: floor, navigation bar, backdrop and grab band stay green.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `record-detail-panel.ts` — the opened record's presentation.
- Rendering a body through Obsidian's own `MarkdownRenderer`.
- A decided home for the body in the phone sheet.
- Whatever write path the chosen shape requires, and its frontmatter-preservation proof.

### Out of Scope

- Rendering a body for rows that are merely listed. Reading a body per row is not free, and the
  table, board, gallery and list renderers stay as they are.
- The embedded renderer's existing `vault.modify` at `:3436`. It is prior art to read, not a surface
  to change.
- Frontmatter editing. The plugin already owns that and this phase does not touch it.

### The Fork That Decides The Size Of The Work

**Display only.** Read the file, strip the frontmatter, render the remainder below the properties.
Links, embeds, task checkboxes and transclusions all work, because it is Obsidian's own renderer.
Tapping the body opens the note for editing. No new write path, so no new way to corrupt a file.

**Editable in place.** Substantially larger, and the hard part is not the UI.

The plugin writes frontmatter through `app.fileManager.processFrontMatter`
(`property-service.ts:214`, `data-source.ts:336`). It does not do so naively: `data-source.ts`
maintains a **per-file write queue** (`writeQueues`, `:122`) whose own comment states the reason —
*"concurrent processFrontMatter calls into the same file corrupt each other"* — plus an "owned path"
credit system so the plugin does not react to its own writes.

A body writer using `vault.modify` would rewrite the whole file, including the frontmatter, from
**outside** that queue. That is not a hypothetical hazard; it is the exact hazard the queue was built
to prevent, approached from a direction the queue cannot see.

It is also the same defect shape this program has already found twice: two owners of one child list
produced a sheet gesture that silently stopped working (`012`, `016`), and two owners of a
checkbox's appearance produced a control that painted differently depending on where it was mounted
(`004`).

A plain textarea is achievable. A real editor inside a bottom sheet is a much larger commitment.

**Recommendation: display-only first**, with a tap-through to the full note, and revisit inline
editing once it has been lived with.

### The Layout Question

The phone sheet already carries thirteen or more properties and a keyboard-avoidance inset. A body of
arbitrary length needs a decided home — below the properties, behind a collapsed section, or on its
own tab — and that decision belongs with the operator rather than to whoever implements first.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| REQ-001 | The operator chooses display-only or editable before implementation begins. | P0 |
| REQ-002 | The opened record's body is rendered through Obsidian's `MarkdownRenderer`, not a reimplementation. | P0 |
| REQ-003 | Frontmatter round-trips byte-exactly, including comments and key order, on any path that writes. | P0 |
| REQ-004 | A body is read only for the opened record, never for rows that are merely listed. | P0 |
| REQ-005 | The body has a decided home in the sheet, chosen by the operator rather than by implementation order. | P0 |
| REQ-006 | The sheet does not regress: floor, navigation bar, backdrop and grab band stay asserted and green. | P0 |
| REQ-007 | If the editable shape is chosen, the body write goes through the same per-file serialization the frontmatter writes use, or the phase states in writing why it is safe outside it. | P0 |
| REQ-008 | A record with no body renders as it does today, with no empty container and no reserved space. | P1 |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Written by the phase once the shape is chosen. Each needs a number with a threshold shown failing
first, from a check that drives the production path, and an image a person opened.

| # | Criterion | Threshold | Applies to |
|---|---|---|---|
| C1 | The opened record's body is present in the panel | rendered, non-empty for a note with a body | both shapes |
| C2 | A note with no body renders exactly as today | pixel-identical | both shapes |
| C3 | Listed rows trigger no body read | 0 reads beyond the opened record | both shapes |
| C4 | Frontmatter round-trips byte-exactly, including comments and key order | byte equality | editable only |
| C5 | Concurrent property edit and body edit on one file | neither write is lost or corrupted | editable only |
| C6 | Sheet floor, navbar, backdrop and grab band | unchanged, still green | both shapes |

C5 is the criterion that decides whether the editable shape is viable, and it is the one an
implementation would naturally defer. The write queue exists because this case has already been hit
once from a single writer; a second writer makes it reachable again from a direction the queue does
not cover.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | A body write clobbers frontmatter the plugin did not author | **H** | M | REQ-003, REQ-007, C4; display-only avoids the risk entirely |
| R-002 | Two writers on one file race, outside the existing per-file queue | **H** | M | REQ-007 routes the body write through the same serialization, or requires a written argument for why it is safe |
| R-003 | Body reads are added to the row pipeline and every list view slows down | M | M | REQ-004, C3 |
| R-004 | A body of arbitrary length breaks the sheet's layout or its keyboard inset | M | H | REQ-005; the home is decided before implementation, not discovered by it |
| R-005 | Implementation begins on the smaller shape and grows into the larger one mid-flight | M | M | REQ-001; the fork is closed before work starts |

**Dependencies.** `MarkdownRenderer`, already imported and working. `data-source.ts`'s write queue,
if the editable shape is chosen. The css lane, if a body lands in the sheet.

**Dependents.** None.

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-P01 | Reading a body per row is not free. Whatever renders it does so only for the opened record. |
| NFR-D01 | **Frontmatter must survive untouched.** Any write path round-trips a note whose frontmatter the plugin did not author, including comments and key order. |
| NFR-M01 | Comment hygiene: no spec paths, phase numbers or task ids in code comments. |

---

## 8. EDGE CASES

- **A note with frontmatter and no body.** Renders as today: no empty container, no reserved space.
- **A note with a body and no frontmatter.** It is still a row. The body renders; the properties
  block is empty, which is the existing behaviour.
- **Frontmatter the plugin did not author** — comments, unusual key order, a key it has no schema
  for. This is the case NFR-D01 exists for and the one a round-trip test must use.
- **A very long body in a phone sheet** already carrying thirteen properties and a keyboard inset.
  §12's second question.
- **A body containing a transclusion of the same note.** Obsidian's renderer handles the recursion;
  this phase should confirm rather than assume it.
- **A body edited in Obsidian while the panel is open.** Display-only needs a refresh story;
  editable needs a conflict story.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 10/25 display-only · 20/25 editable | One render path, or a second writer on a file with an existing serialized write path |
| Risk | 8/25 display-only · 22/25 editable | Display-only writes nothing; editable can corrupt a user's notes |
| Research | 12/20 | The data layer was traced; the layout and the conflict story are not designed |
| Multi-Agent | 3/15 | Single lane |
| Coordination | 7/15 | Touches the record panel every phone phase has worked on |
| **Total** | **40/100 display-only · 64/100 editable** | The fork is the phase's defining fact, and the score reports it rather than averaging it away |

Reporting one number here would hide the only thing this assessment has to say. The two shapes are
different phases wearing one folder name, which is why REQ-001 comes before everything.

---

## 10. RISK MATRIX

See §6. R-001 and R-002 are the phase's real content; the rest are ordinary.

---

## 11. USER STORIES

### US-001: See the note (Priority: P0)

**As an** operator, **I want** the record I opened to show its note body alongside its properties,
**so that** the plugin shows me the whole record rather than half of it.

**Acceptance:** C1, C2, C6.

### US-002: Not lose the note (Priority: P0)

**As an** operator, **I want** any write the plugin makes to leave my frontmatter exactly as I wrote
it, **so that** using the panel is not a risk to my vault.

**Acceptance:** C4, C5.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- **Display-only, or editable in place?** This decides the size of the work by roughly an order of
  magnitude and is the reason the phase has not started. §3 recommends display-only first.
- **Where does the body live in a sheet already carrying 13+ properties?** Below the properties,
  behind a collapsed section, or on its own tab. A decision, not a discovery.
- **If editable: how does a body write serialize against the frontmatter write queue?** Through the
  same queue is the safe answer. Anything else needs an argument, not an assumption.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) · [`tasks.md`](tasks.md)
- `device-note-body-in-obsidian.png` — the same record in Obsidian's own view
- [`../spec.md`](../spec.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md) — the sheet this body would live in
- [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md) — the two-owners defect shape, in a different surface
