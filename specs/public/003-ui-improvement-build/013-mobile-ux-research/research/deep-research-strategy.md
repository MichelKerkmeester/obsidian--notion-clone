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

Mobile UX remediation for the Obsidian Note Database plugin at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`. Eighteen defects reported from a real phone across many rounds. Notion is the visual target. AnyType and AppFlowy are engineering references for interaction semantics only — both are AGPL or source-available while this plugin is MIT (`LICENSE:1-3`), so they may be read for behaviour and never copied for code, CSS values, token scales or asset geometry.

---

<!-- ANCHOR:key-questions -->
## 3. KEY QUESTIONS (remaining)
Generated from the reducer registry. Add external or late questions through `{spec_folder}/research/inbox.jsonl`; direct edits are imported as compatibility input and may be replaced on the next reduce step.

- [ ] Q1 Sheet presentation vs positioning. `positionToolbarPopover` (`src/views/popover-position.ts:47`) fuses sheet chrome to an anchored-positioning engine; 18 files call it and 0 of 17 `Modal` subclasses can. Where is the correct seam between shareable presentation and per-surface positioning?
- [ ] Q2 Layering. `.db-mobile-bottom-sheet` (`styles.css:139`) has no `z-index`; promoting it regresses `.db-record-detail-panel`, pinned to panel tier at `styles.css:8852-8859` because its field editors are siblings. `--db-layer-sticky` is referenced (`:18983`) but never declared; `.db-record-peek-panel` sits outside the scale at a literal 998; an `!important` tail at `:18441-18457` re-declares every tier. What layer model resolves this without regression?
- [ ] Q3 Presentation taxonomy. Which modals want a bottom sheet and which want full-screen? Three are 860-1240px workbenches; two are dead code.
- [ ] Q4 Row height. `RowDensity` presets already exist end to end. Confirm or refute that ragged rows come from `td.db-cell-wrap` `height:auto` (`styles.css:4796-4803`) plus list view never receiving `data-row-density`, and determine the bounded-wrap design.
- [ ] Q5 Mobile predicate. `isTouchDevice` and `isMobileBottomSheet` disagree; the FAB breaks in the 701-760px gap. What is the single correct predicate?
- [ ] Q6 Native `Menu` replacement. 11 sites, 55 `addItem`, 26 accesses to `MenuItem`'s undocumented private `.dom` (24 in `column-menu.ts`), absent from `obsidian.d.ts:4178-4193`. What is the minimum plugin-owned menu that retires that liability?
- [ ] Q7 Calendar month view. Can `calendar-mini-calendar-renderer.ts` be reused as the phone month view, and what does Notion's dot-per-day model actually require?
- [ ] Q8 Formula output format. `ComputedFieldDef` (`types.ts:143-150`) has no format field and `getColumnDisplayType` cannot return currency. What schema and formatter path supports percentage and configurable decimal count?
<!-- /ANCHOR:key-questions -->

---

## 4. NON-GOALS

- Desktop behaviour changes. Desktop must not regress; mobile is allowed to differ.
- Writing implementation code. This session produces findings and design decisions; `/speckit:plan` and the 014+ build phases own the code.
- Splitting `styles.css`. Its header at `:1-10` states the single file is deliberate, and six test files plus `capture.mjs:127` read that exact path.
- Copying anything from AnyType or AppFlowy. Licence-incompatible with this MIT plugin.
- Re-litigating the sk-code-obsidian surface packet, which is complete and lives on `impl`.

---

## 5. STOP CONDITIONS

- `stopPolicy` is `max-iterations`: convergence is telemetry only and the loop runs all 10 iterations. Early convergence does NOT stop this session.
- Halt if an iteration cannot cite `file:line` evidence for its load-bearing claims.
- Halt if research begins proposing code edits rather than design decisions.

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

Prior architecture review of this exact question set is already on record and should be treated as the starting position to test, not as settled fact. Its load-bearing claims, each carrying `file:line`:

- The tree is red before work starts. `npx tsc --noEmit` fails with TS2440 at `src/views/record-detail-panel.ts:43` against a byte-identical local declaration at `:292`; the cause is an uncommitted half-finished extraction, and `src/views/mobile-bottom-sheet.ts` is untracked dead code. `release.yml:33` runs `tsc` before `build`, so a tag today produces no release.
- Root cause A is real but misdiagnosed: the blocker is that sheet chrome is fused to an anchored-positioning engine, not that nobody shared it.
- Root cause B is real but its obvious fix is a regression, for the reason recorded in the comment at `styles.css:8852-8859`.
- Root cause C is wrong: `RowDensity` exists end to end (`types.ts:33,425-426`; `styles.css:87-90,4807-4825`; `table-renderer.ts:483`; `view-config-panel-renderer.ts:330-336`).
- An unnamed fourth root cause: there is no single mobile predicate.
- Two modals are dead code with zero call sites; three are 860-1240px workbenches that want full-screen rather than a sheet.
- `safe-area-inset-top` having zero uses is likely a non-defect: every fixed element the plugin owns is bottom-anchored.

### Bounded Context Snapshot

- Source pointers: `src/views/popover-position.ts`, `src/views/mobile-bottom-sheet.ts` (untracked), `src/views/table-record-peek.ts`, `src/views/record-detail-panel.ts`, `src/views/modals/` (17 files), `src/data/touch-environment.ts`, `src/data/types.ts`, `styles.css`, `tools/screenshots/`.
- Reuse candidates: `calendar-mini-calendar-renderer.ts` for the phone month view; `formatEuroCurrency` (`src/data/euro-format.ts:49`); the existing `RowDensity` preset chain; `openRecordDetailPanel`, which every view except table already routes through.
- Integration points: `database-view.ts:1322-1333` `portalSelectors` (new portal classes must register or interaction scope breaks); `mode-registry.json`; the 196-entry screenshot manifest.
- Constraints and risks: vitest runs `environment:"node"` with no jsdom, so every CSS test is a text assertion and behavioural DOM tests are impossible; all 196 captures fingerprint `styles.css`, and `capture.mjs:224` only rewrites the manifest when `--only`/`--theme`/`--device` are all unset, so partial re-capture cannot satisfy the gate; `column-header-menu-affordance.test.ts:79-87` asserts rule counts and fails if a positioning rule for `.db-column-menu-trigger` is added inside any media query.

### Bounded Context Snapshot

Populate during initialization when the target is codebase-scoped. Keep this pointer-based and small:

- Source pointers: paths, symbols, or resource-map entries relevant to the topic.
- Reuse candidates: existing utilities, patterns, docs, or agents worth extending.
- Integration points: files or contracts the research is likely to touch.
- Constraints and risks: scope limits, stale graph or memory gaps, and known non-goals.

Do not inline full source bodies. Do not dispatch the retired standalone context loop. Use `@context` for one-shot retrieval, and use this snapshot only to seed the research loop.

---

## 13. RESEARCH BOUNDARIES
- Max iterations: 10
- Convergence threshold: 0.05 (telemetry only — `stopPolicy: max-iterations`)
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
- Started: 2026-08-29
- Executor: `cli-codex` / `gpt-5.6-luna` / reasoning `xhigh` / service tier `fast`
