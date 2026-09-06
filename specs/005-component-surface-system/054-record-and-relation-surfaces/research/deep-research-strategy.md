---
title: Deep Research Strategy Template
description: Runtime template copied to research/ during initialization to track research progress, focus decisions, and outcomes across iterations.
trigger_phrases:
  - "deep research strategy"
  - "research strategy template"
  - "research session tracking"
  - "exhausted research approaches"
  - "research stop conditions"
  - "ruled out research directions"
importance_tier: normal
contextType: planning
version: 1.14.0.19
---

# Deep Research Strategy - Session Tracking Template

Runtime template copied to `{spec_folder}/research/` during initialization. Tracks research progress across iterations.

## 1. OVERVIEW

### Purpose

Serves as the "persistent brain" for a deep research session. Records what to investigate, what worked, what failed, and where to focus next. Read by the orchestrator and agents at every iteration.

### Usage

- **Init:** Orchestrator copies this template to `{spec_folder}/research/deep-research-strategy.md` and populates Topic, Key Questions, Known Context, and Research Boundaries from config and memory context.
- **Per iteration:** Agent reads Next Focus, writes iteration evidence, and the reducer refreshes What Worked/Failed, answered questions, carried-forward questions, ruled-out directions, and Next Focus.
- **Mutability:** Mutable — analyst-owned sections remain stable, while machine-owned sections are rewritten by the reducer after each iteration. Section 3 is a generated projection from the reducer registry.
- **Protection:** Shared state with explicit ownership boundaries. Orchestrator validates consistency on resume.

### Question Injection Surface

Use `{spec_folder}/research/inbox.jsonl` to append external questions during an active run. Each line is one JSON object with:

- `id`: stable inbox record identifier
- `text`: question text to promote
- `source`: concrete source label, such as an angle bank entry, analyst strategy, or operator note
- `origin`: one of `angle-bank`, `analyst-strategy`, `operator`, or `legacy-import`
- `injectedAtIteration`: iteration number when the question was introduced
- `promotedQuestionId`: promoted registry question id, or `null` until promotion

The reducer reads the inbox on every reduce step and carries `origin` into the question registry and dashboard badges. Direct edits to Section 3 still work as a compatibility path, but they are attributed as `legacy-import`.

Question ownership is explicit:

- Inbox rows are immutable input.
- The reducer registry is canonical question state.
- Section 3 is rendered only from the registry view.

When an inbox row targets an existing registry question but carries different text, the reducer keeps the registry value, records `operatorDecision: needs_decision`, and appends a `question_conflict` event with both `inboxValue` and `registryValue`.

---

## 2. TOPIC
Research how Notion's UI for the record/page surface (page header and icon/cover, property rows and their editors, relation and rollup rows, add property, hidden properties group, comments area, the phone record sheet) should refine the note-database Obsidian plugin's surface, using the Notion screen digest at specs/005-component-surface-system/054-record-and-relation-surfaces/notion-screens-digest.md as the ONLY source of Notion facts (it was written by an image-capable analyst from the Mobbin captures; you cannot read PNG files — never open image files), against our implementation and design record: src/views/record-surface/*.ts src/views/record-detail-panel.ts src/views/table-record-peek.ts the record blocks of styles.css specs/005-component-surface-system/054-record-and-relation-surfaces/{goal.md,design-trueup.md,decision-record.md,tasks.md} specs/005-component-surface-system/058-card-title-and-title-formats/{goal.md,spec.md}, specs/005-component-surface-system/design-system.md, and roadmap.md 6A rulings. Bounded scope: read those files and nothing beyond them unless a finding requires one more source file. Operator context: Anytype parity is the default ruling for these surfaces (051 ADR-007, 056, 057); Notion refinements are additive — where Notion and Anytype disagree, name the conflict and propose which to adopt with the reason, never override a landed operator ruling. Questions to answer with file:line and screen-id evidence: which Notion patterns from the digest would improve this surface for a user (rank by user impact); for each, the concrete change to our code and CSS (file, rule/function, value) and its measurable threshold; which Notion behaviours we already have; which conflict with an Anytype ruling; which need a device-only check; and a ranked remediation plan as concrete phase tasks with thresholds and red-first checks suitable for a new child phase. Cite every claim; mark inferences as inferences.

---

<!-- ANCHOR:key-questions -->
## 3. KEY QUESTIONS (remaining)
Generated from the reducer registry. Add external or late questions through `{spec_folder}/research/inbox.jsonl`; direct edits are imported as compatibility input and may be replaced on the next reduce step.

- [ ] Q1. Which Notion patterns in `notion-screens-digest.md` (header/icon/cover, property rows and editors, relation and rollup rows, add property, hidden-properties group, comments, phone record sheet) would measurably improve our record surface for a user, ranked by user impact, each with a screen-id citation?
- [ ] Q2. For each ranked pattern, what is the concrete change in our code and CSS — file, rule or function name, and value — plus a measurable threshold, cited to `src/views/record-surface/*.ts`, `src/views/record-detail-panel.ts`, `src/views/table-record-peek.ts`, or the record blocks of `styles.css` at file:line?
- [ ] Q3. Which Notion behaviours from the digest do we already have, evidenced at file:line in our implementation or in `design-trueup.md` / `decision-record.md` / `tasks.md`?
- [ ] Q4. Which Notion patterns conflict with a landed Anytype ruling (051 ADR-007, 056, 057, roadmap.md §6A, 058 goal/spec), and for each conflict which platform should be adopted and why — without overriding a landed operator ruling?
- [ ] Q5. Which findings can only be settled by a device-only check (real Obsidian on phone/desktop), and what exactly should be checked?
- [ ] Q6. What is the ranked remediation plan as concrete phase tasks with thresholds and red-first checks, suitable for a new child phase under 005-component-surface-system?
<!-- /ANCHOR:key-questions -->

---

## 4. NON-GOALS
- Not implementing anything. `src/`, `styles.css` and `tools/` are read-only for this run; no edits to them.
- Not re-deriving Anytype facts already measured in `design-trueup.md`; that document is the stronger claim for Anytype.
- Not opening any image/PNG file. The ONLY source of Notion facts is `notion-screens-digest.md`.
- Not overriding a landed operator ruling (051 ADR-007, 056, 057, roadmap.md §6A). Conflicts are named and a recommendation is proposed, never applied.
- Not researching surfaces outside record/page: no board, calendar, table-grid, toolbar or dropdown work.
- Not reading beyond the bounded file list unless a specific finding requires one additional source file (which must be named).

---

## 5. STOP CONDITIONS
- Stop policy is `max-iterations`: convergence is telemetry only; the loop runs all 5 iterations.
- Halt early only on: the digest being unreadable, the bounded source files being absent, or a write-containment violation.
- Every one of Q1-Q6 answered with file:line and screen-id citations, and every inference explicitly marked as an inference.

---

<!-- ANCHOR:answered-questions -->
## 6. ANSWERED QUESTIONS
[None yet -- populated as iterations answer questions]
<!-- /ANCHOR:answered-questions -->

---

<!-- MACHINE-OWNED: START -->
<!-- ANCHOR:what-worked -->
## 7. WHAT WORKED
[First iteration -- populated after iteration 1 completes]
- [Approach]: [Why it worked] (iteration N)
<!-- /ANCHOR:what-worked -->

---

<!-- ANCHOR:what-failed -->
## 8. WHAT FAILED
[First iteration -- populated after iteration 1 completes]
- [Approach]: [Why it failed] (iteration N)
<!-- /ANCHOR:what-failed -->

---

<!-- ANCHOR:exhausted-approaches -->
## 9. EXHAUSTED APPROACHES (do not retry)
[Populated when an approach has been tried from multiple angles without success]

### [Category Name] -- BLOCKED (iteration N, N attempts)
- What was tried: [specific approaches attempted]
- Why blocked: [root cause of exhaustion]
- Do NOT retry: [explicit prohibition]

### [Category Name] -- PRODUCTIVE (iteration N)
- What worked: [successful approaches in this category]
- Prefer for: [related questions where this category may help]
<!-- /ANCHOR:exhausted-approaches -->

---

<!-- ANCHOR:ruled-out-directions -->
## 10. RULED OUT DIRECTIONS
[Approaches that were investigated and definitively eliminated -- consolidated from iteration dead-end data]
- [Approach]: [Why ruled out] (iteration N, evidence: [source])
<!-- /ANCHOR:ruled-out-directions -->

---

<!-- ANCHOR:divergence-frontier -->
## 10A. SATURATED DIRECTIONS AND DIVERGENCE FRONTIER
- Completed pivots: 0
- Failed pivots: 0
- Audited overrides: 0
- Saturated: none yet
- Pivot lineage: none yet
- Remaining frontier: none recorded
<!-- /ANCHOR:divergence-frontier -->

---

<!-- ANCHOR:carried-forward-open-questions -->
## 11A. CARRIED-FORWARD OPEN QUESTIONS
[Self-owned open questions from iteration write-back -- populated after iteration 1 completes]
<!-- /ANCHOR:carried-forward-open-questions -->

---

<!-- ANCHOR:next-focus -->
## 11. NEXT FOCUS
[Recommended focus area for the next iteration -- updated at end of each iteration]
<!-- /ANCHOR:next-focus -->

---

<!-- MACHINE-OWNED: END -->
## 12. KNOWN CONTEXT
From the continuity ladder for `005-component-surface-system/054-record-and-relation-surfaces` (no `handover.md`; `implementation-summary.md` `_memory.continuity`, last updated 2026-09-05):

- Completion 14%. T001 landed; the record-surface primitives and the card-field shim landed at milestone m2. Next safe action recorded: switch `record-detail-panel.ts` and `table-record-peek.ts` onto the primitives at T030 and T031.
- `design-trueup.md` measured the object-page menus, grid-cell editors and iOS relations panel against the packet's seven behaviour rows and found nine wrong, including the anatomy P2 was to be built to. It is the stronger claim for Anytype and this run defers to it.
- Recorded answered questions relevant here: the Anytype relation row is NOT "type icon left, value right" (no format icon on a value row, nothing right-aligned, on either platform); Anytype has NO hidden-properties group with a count (its axis is Header vs Properties panel, decided at type level); A5's search-first picker is real on the phone, placeholdered "Search or create new".
- Known blockers: AC-012 is operator-owned and unclosable from this repository; `checklist.md` Today cells still carry pre-true-up figures.
- Key files already flagged: `design-trueup.md`, `src/views/record-detail-panel.ts`, `src/views/cell-renderer.ts`, `styles.css`.

### Bounded Context Snapshot

- Source pointers: `src/views/record-surface/*.ts`, `src/views/record-detail-panel.ts`, `src/views/table-record-peek.ts`, record blocks of `styles.css`; packet docs `goal.md`, `design-trueup.md`, `decision-record.md`, `tasks.md`; `058-card-title-and-title-formats/{goal.md,spec.md}`; `005-component-surface-system/design-system.md`; `roadmap.md` §6A.
- Notion evidence: `specs/005-component-surface-system/054-record-and-relation-surfaces/notion-screens-digest.md` (97 screens, screen-ids). Sole Notion source.
- Integration points: the record-surface primitives and the two consumers (`record-detail-panel.ts`, `table-record-peek.ts`) that T030/T031 will switch over.
- Constraints and risks: Anytype parity is the default ruling; Notion is additive. No image reads. No writes to `src/`, `styles.css`, `tools/`.

### Bounded Context Snapshot

Populate during initialization when the target is codebase-scoped. Keep this pointer-based and small:

- Source pointers: paths, symbols, or resource-map entries relevant to the topic.
- Reuse candidates: existing utilities, patterns, docs, or agents worth extending.
- Integration points: files or contracts the research is likely to touch.
- Constraints and risks: scope limits, stale graph or memory gaps, and known non-goals.

Do not inline full source bodies. Do not dispatch the retired standalone context loop. Use `@context` for one-shot retrieval, and use this snapshot only to seed the research loop.

---

## 13. RESEARCH BOUNDARIES
- Max iterations: 5 (stop policy: max-iterations — all 5 run)
- Convergence threshold: 0.05 (telemetry only under this stop policy)
- Per-iteration budget: 12 tool calls, 10 minutes
- Progressive synthesis: true (default)
- research/research.md ownership: workflow-owned canonical synthesis output
- Lifecycle branches: `resume`, `restart` (live); `fork`, `completed-continue` (deferred, not runtime-wired)
- Machine-owned sections: reducer controls Sections 3, 6, 7-11A, including Section 10A pivot lineage
- Question injection surface: `{spec_folder}/research/inbox.jsonl`
- Question conflict owner: reducer registry; `question_conflict` events surface inbox/registry disagreements for operator decision
- Canonical pause sentinel: `research/.deep-research-pause`
- Capability matrix: `.opencode/skills/system-deep-loop/deep-research/assets/runtime-capabilities.json`
- Capability matrix doc: `.opencode/skills/system-deep-loop/deep-research/references/guides/capability-matrix.md`
- Capability resolver: `.opencode/skills/system-deep-loop/deep-research/scripts/runtime-capabilities.cjs`
- Current generation: 1
- Started: 2026-09-06T14:59:40.851Z
