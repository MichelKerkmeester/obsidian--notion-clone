---
title: "Implementation Plan: Markdown Note Body in the Record View"
description: "Close the display-only versus editable fork first, then render the opened record's body through Obsidian's own renderer, and treat any write path as a second writer on a file that already has one."
trigger_phrases:
  - "023 note body plan"
  - "display only versus editable"
  - "frontmatter round trip"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Markdown Note Body in the Record View

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This plan forecasts work that has not started**, and it deliberately stops short of designing the
larger of the two shapes it describes.

The phase has one decision and then one of two very different pieces of work. Stage 1 is the
decision. Stages 2 and 3 are the display-only build, which is small. Stage 4 exists only if the
editable shape is chosen, and it is mostly not interface work — it is the design of a second writer
onto a file the plugin already writes through a serialized path.

Planning both shapes in full would be planning a phase that will not happen. So this plan is complete
for display-only and is explicit about what the editable shape would still need.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Gate | `npm run gate` | exit 0 |
| Placement | `npm run storybook:placement` | sheet floor, navbar, backdrop and grab band still green |
| Captures | `npm run screenshots:verify` | current, none blank, none identical across themes |
| **Round trip** | editable shape only | a note whose frontmatter the plugin did not author, written and re-read, is byte-identical |
| **Concurrency** | editable shape only | a property edit and a body edit on one file lose neither |

The last two do not exist yet and would be this phase's most important output if the editable shape
is chosen. They are named here so that choosing that shape means accepting them, rather than
discovering them.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### What is already there

Reading is solved. Nine `vault.read` / `cachedRead` call sites already exist across five files, so
getting a note's text is a call, not a design. Rendering is solved too: `MarkdownRenderer` is
imported at `main.ts:16` and used at `main.ts:438` for the changelog modal — the mechanism works in
this codebase today and has simply never been pointed at note content.

`record-detail-panel.ts` is 539 lines with no concept of a body. Its only markdown is *inline*
markdown inside a text field's value, which is a different thing rendered by a different path.

### Display-only

Read the file for the opened record, strip the frontmatter, hand the remainder to
`MarkdownRenderer`, mount it below the properties. Tapping it opens the note.

Everything that makes Obsidian's rendering good — links, embeds, task checkboxes, transclusions —
arrives for free, and none of it is this phase's to maintain. There is no new write path, so R-001
and R-002 do not apply and C4 and C5 do not exist.

The one real constraint is REQ-004: the read happens for the opened record only. Adding a body read
to the row pipeline would put a file read behind every rendered row in every view.

### Editable, and why it is a different phase

The plugin writes frontmatter through `app.fileManager.processFrontMatter`
(`property-service.ts:214`, `data-source.ts:336`), and it does so through machinery that exists for a
reason. `data-source.ts:122` holds a per-file write queue whose comment states it plainly:

> Writes to the same file path are serialized through a queue (`writeQueues`) because concurrent
> `processFrontMatter` calls into the same file corrupt each other.

There is also an "owned path" credit system so the plugin does not react to its own writes.

A body writer using `vault.modify` — the shape of the one existing body write, at
`embedded-database-renderer.ts:3436` — rewrites the whole file including the frontmatter, from
outside that queue. The queue cannot serialize against a writer it does not know about.

So the editable shape's design question is not "textarea or editor". It is: does the body write go
through `enqueueWrite` on the same path key, and if not, what makes that safe? REQ-007 requires an
answer in writing either way.

This is a familiar shape in this program. `012` and `016` found two owners of one child list produce
a gesture that silently stops working. `004` found two owners of a checkbox's appearance produce a
control that paints differently depending on where it is mounted. Both were found after shipping.

### The layout

A body of arbitrary length in a sheet already carrying thirteen properties and a keyboard inset needs
a decided home — below the properties, behind a collapsed section, or on its own tab. `spec.md` §12
keeps it open. It is a decision, and discovering it by implementing is how the sheet acquires a
fourth scroll container.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Close the fork

Put §12's first question to the operator with §3's recommendation attached, and get an answer. This
phase cannot start without one: the two shapes score 40 and 64 on the same complexity scale and share
almost no implementation.

Get the layout answer in the same conversation. Both are operator decisions and asking twice wastes a
round trip.

### Phase 2 — Render the opened record's body

Read, strip frontmatter, render through `MarkdownRenderer`, mount in the chosen home. Confirm the
transclusion-of-self case rather than assuming Obsidian's renderer handles it.

### Phase 3 — Prove what did not change

A record with no body renders exactly as it does today. Listed rows trigger no body read. The sheet's
floor, navigation bar, backdrop and grab band stay green. All three are assertions about absence,
which is the kind that gets skipped.

### Phase 4 — Editable, only if chosen

Not designed here beyond its entry condition. It begins with the write-path question — through
`enqueueWrite` or with a written argument for why not — and the round-trip and concurrency gates in
§2. If the answer to REQ-007 cannot be written down, the shape is not ready to build.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | Frontmatter stripping, including a note with no frontmatter and one with only frontmatter | `vitest` |
| Unit | Body read is scoped to the opened record | `vitest`, counting reads |
| Placement | Sheet floor, navbar, backdrop, grab band unchanged | `verify-placement.mjs` |
| Capture | The panel with a body and without one, both themes | `screenshots` + `screenshots:verify` |
| **Round trip** | Frontmatter the plugin did not author survives a write byte-exactly | `vitest`, editable only |
| **Concurrency** | A property edit and a body edit on one file | `vitest`, editable only |

The round-trip test's fixture matters more than the test. Frontmatter the plugin authored will
round-trip trivially, since it was written by the same serializer that reads it. The case that finds
defects is frontmatter with comments, unusual key order, and a key the plugin has no schema for.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| The operator's shape decision | External | **Open** | The phase cannot start |
| The operator's layout decision | External | **Open** | Phase 2 has nowhere to mount |
| `MarkdownRenderer` | External (Obsidian) | Green, in use at `main.ts:438` | The render path would have to be built |
| `data-source.ts` write queue | Internal | Green | Editable shape only; its absence would make the shape unsafe |
| The css lane | Internal | Acquire if the sheet's layout changes | No stylesheet edit may proceed |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the body breaks the sheet's layout or its keyboard inset, or — editable shape — any
  frontmatter loss is observed.
- **Procedure**: display-only reverts to a render call and a container, and the panel returns to
  today's behaviour. **Editable does not revert cleanly**: a write that has already damaged a note is
  in the vault, and reverting the code does not undo it.
- **Data reversal**: none for display-only, which writes nothing. For editable, the reversal story is
  the user's own file history, which is why C4 and C5 are gates rather than tests.

That asymmetry is the strongest argument for §3's recommendation. Display-only is a change that can
be undone; editable is a change that can leave damage behind it.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
operator: shape + layout
        │
        ├──▶ display-only ──▶ Phase 2 render ──▶ Phase 3 prove-no-change ──▶ done
        │
        └──▶ editable ─────▶ REQ-007 write-path answer
                                      │
                             ┌────────┴────────┐
                             ▼                 ▼
                    round-trip gate    concurrency gate
                             └────────┬────────┘
                                      ▼
                              Phase 4 (not designed here)
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Shape decision | Operator | Which phase this actually is | Everything |
| Layout decision | Operator | A home for the body | Phase 2 |
| Render path | Both decisions | C1 | Phase 3 |
| Prove-no-change | Render path | C2, C3, C6 | Completion |
| Write-path answer | Shape = editable | REQ-007 in writing | The round-trip and concurrency gates |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **The shape decision** - blocking, and an operator question rather than work.
2. **The layout decision** - blocking for Phase 2, and best asked in the same conversation.
3. **Phase 2, the render path** - CRITICAL for display-only. Small.
4. **REQ-007's write-path answer** - CRITICAL for editable, and the point at which that shape is
   either designed or deferred.

**Total Critical Path**: decisions → render → prove-no-change, for display-only. The editable path's
length is not estimated here, and estimating it before the write-path question is answered would be
inventing a number.

**Parallel Opportunities**:
- The frontmatter-stripping unit tests need no layout decision.
- The round-trip fixture — frontmatter with comments and unusual key order — can be built while the
  shape question is open, and is useful either way.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | The phase knows what it is | Shape and layout decided and recorded | End of Phase 1 |
| M2 | The body is visible | C1 | End of Phase 2 |
| M3 | Nothing else moved | C2, C3, C6 | End of Phase 3 |
| M4 | Editable is safe, or deferred | REQ-007 answered in writing; C4 and C5 green, or the shape recorded as not built | Phase 4, if reached |

<!-- /ANCHOR:milestones -->
---

## 11. L3: ARCHITECTURE DECISION RECORD

### ADR-001: Display-only first, with a tap-through to the note

**Status**: Proposed — the operator owns this decision (`spec.md` §12).

**Context**: The request does not distinguish between seeing a body and editing one. The two shapes
score 40 and 64 on the same complexity scale, and only one of them can damage a user's file.

**Decision**: Build display-only first. Tapping the body opens the note in Obsidian, which is already
the best editor available and is one tap away.

**Consequences**:
- The capability arrives quickly and cannot corrupt anything.
- Editing requires leaving the panel, which is a real ergonomic cost and the thing the operator may
  actually have been asking for.
- The layout question still has to be answered, so the harder half of the small shape is not avoided.

**Alternatives Rejected**:
- *Editable in place, now*: makes the plugin the second writer to a file it already writes through a
  serialized queue built specifically because concurrent writes to one file corrupt each other. That
  is buildable, but it is a design task with a data-loss failure mode, and it should not be entered
  through a request that may have meant "let me read my notes".
- *Do nothing and document the workaround*: the record genuinely is half-invisible in the plugin. The
  workaround is to leave the plugin.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The operator has chosen display-only or editable
- [ ] The operator has chosen where the body lives in the sheet
- [ ] The nine read sites and the one write site have been read, not taken from this document
- [ ] For the editable shape: REQ-007's write-path answer is written down before any code

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | No implementation before the shape decision. The two shapes share almost no code |
| TASK-DATA | No write path lands without a byte-exact round-trip proof on frontmatter the plugin did not author |
| TASK-QUEUE | A body write is serialized against the frontmatter write queue, or the phase states in writing why it is safe outside it |
| TASK-SCOPE | The body is read for the opened record only. The row pipeline is not touched |
| TASK-EVIDENCE | A task closes on a measured number or a command whose output and exit status were read |
| TASK-HYGIENE | No spec paths, phase numbers or task ids in code comments |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. A task belonging to the editable shape names itself as
such, so a display-only build cannot appear to have discharged it.

### Blocked Task Protocol

A task is BLOCKED when the shape or layout decision is outstanding, or when REQ-007 cannot be
answered. On BLOCK: record the blocker in `tasks.md` and stop. **Do not begin on the smaller shape
intending to grow into the larger one** — the write-path design is the work, and arriving at it with
an interface already built is the worst order to meet it in.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md)
- [`../spec.md`](../spec.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md) — the two-owners defect shape
