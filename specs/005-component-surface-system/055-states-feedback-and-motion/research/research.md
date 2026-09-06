# Deep Research Synthesis — Notion states, feedback and motion refinements for the note-database surface

Spec: `specs/005-component-surface-system/055-states-feedback-and-motion`
Run: `dr-1788706596667` · fan-out run `1788706611202-9hvcld` · 1 lineage (`glm-openrouter-states`, cli-pi / `z-ai/glm-5.3-flash`, reasoning max, 5 iterations)
Topic: how Notion's UI for empty, loading, error and offline states, toasts and undo, confirmations, onboarding hints, skeletons, motion and transitions should refine this plugin's surface — the Notion screen digest as the only source of Notion facts, against our implementation and design record.

Evidence policy: local claims use `[SOURCE: file:path:line]`; digest claims use `[SOURCE: screen:<mobbin-id>]`; document claims name the packet doc. Inferences are marked **inference**. Notion pixels are never adopted as numbers (the digest states no device-pixel ratio); the digest's screen ids point into `notion-screens-digest.md` §2, which carries the `mobbin_url` for each.

## 1. Executive Summary

The Notion harvest mostly **corroborates** what this phase already built, and the code — checked directly against this worktree, not carried from any document — has landed further than the phase's own tracking documents claim. Four items survive as work; everything else is have-and-richer, additive-and-deferred, or refused with a reason.

1. **The undo window is 2.2 seconds** (R1). `toast.ts` auto-dismisses every success toast at `AUTO_DISMISS_MS = 2200` — a budget inherited from the operation-result rail, never measured for undo — and the delete-then-Undo flow raises its toast as `severity: "success"` *with an Undo action attached* (`database-view.ts:8369-8374`). An expired Undo is the exact failure class the component's own comment reserves for errors ("a failure that vanishes on its own is a failure nobody had to see"), reached through the success path. `[SOURCE: file:src/views/toast.ts:77]` `[SOURCE: file:src/views/toast.ts:137]` `[SOURCE: file:src/views/database-view.ts:8369-8374]` `[SOURCE: file:specs/005-component-surface-system/055-states-feedback-and-motion/design-trueup.md:350]`
2. **The delete-failure path bypasses the owned toast** (R2). `deleteRow`'s catch raises a bare `new Notice` (`database-view.ts:8376-8379`) two lines below the owned success toast — one instance of **242** bare-Notice sites (recounted this run) whose class the rail's own `showOperationResult` already models correctly: severity, action (Undo/Retry), reduced-motion marker. `[SOURCE: file:src/views/database-view.ts:8376-8379]` `[SOURCE: file:src/views/database-view.ts:11316-11334]`
3. **Stale references have no inline, actionable shape** (R3). Notion splits error surfaces by blast radius — blocking modal for a failed action (`53f4023b`, `f318b5e0`), permanent inline chip for a stale reference (`9748e66c`); ours has the persistent card and the transient toast but no chip. `[SOURCE: screen:9748e66c]` `[SOURCE: file:src/views/empty-state-renderer.ts:197-201]`
4. **`goal.md` §3's "Today" column is stale on at least five rows** (R4) — including the E4 row that says the confirm is still present when `row-menu.ts:166-176` shows it removed with the landed comment in place. Reconciliation is bookkeeping with negative controls, not new work. `[SOURCE: file:specs/005-component-surface-system/055-states-feedback-and-motion/goal.md:172-173]` `[SOURCE: file:src/views/row-menu.ts:166-176]`

Everything else Notion does well, we already do — in three cases richer than Notion (the empty-state ladder, the confirm/undo split, reduced-motion coverage) — and the two places Notion disagrees with a landed Anytype ruling (destructive-red weights, toast placement) are proposed **HOLD** with reasons, never silent overrides.

## 2. Research Question and Decision Standard

Six questions bound the loop: ranked user-impact improvements with concrete changes and thresholds; which claimed behaviours verify; which conflict with Anytype rulings; which need device-only checks; the ranked remediation plan. The decision standard, fixed at init: the digest is the only Notion source; `051` ADR-007's Anytype-parity default binds — a Notion refinement must be additive, and where they disagree the conflict is named with a proposal and a reason, never applied against a landed ruling.

"User impact" ranks by demonstrated reach: how many readers hit the surface and what failing it costs them — not pattern elegance. That is an **inference** about prioritization, stated as such.

## 3. Scope, Boundaries, and Code Surface

Read inventory (bounded, as configured): `notion-screens-digest.md` (whole); `src/views/empty-state-renderer.ts`, `src/views/toast.ts`, `src/views/confirm-sheet.ts` (whole); the `--db-motion-*` block, toast/rail/skeleton/empty-state blocks and reduced-motion blocks of `styles.css`; `055/{goal.md,design-trueup.md,decision-record.md,tasks.md}`; `design-system.md`; `roadmap.md` §6A. The one-extra-file allowance was spent on `src/views/modals/confirm-modal.ts` (the digest's `modals/confirm-modal.ts` citation, resolved with a `find`) and on targeted line-range verification of digest-cited anchors in `row-menu.ts` and `database-view.ts`.

No production code, spec, or packet document was modified by the loop; no repository tooling (`generate-context.js`, `validate.sh`, git writes) was run inside the lineage; no nested executor was launched — every iteration executed inline per the fan-out contract, with the lineage directory as its entire write surface. No PNG was opened at any point; all Notion facts enter through the digest's screen ids.

## 4. Method and Convergence Record

Five inline iterations in one lineage, each with a distinct focus, an iteration narrative, a delta record, and one state event in `lineages/glm-openrouter-states/deep-research-state.jsonl`:

| Iter | Focus | Ratio | Result |
|---:|---|---:|---|
| 1 | Seven-state vocabulary (P4/P5/P8/P9) vs the empty/skeleton/toast surfaces | 0.72 | All four digest census claims verified; P4 have-and-richer; chip gap + 242 sites surfaced |
| 2 | Toasts, undo, confirmations (P1/P2/P6) vs `toast.ts`, `confirm-sheet.ts`, `ConfirmModal` | 0.66 | E4 verified per call site; 2200ms undo window found; two conflicts named |
| 3 | Motion tokens, residuals, reduced-motion vs ADR-005 | 0.58 | Coverage exceeds both references; census refined to 4 real sites; 2200ms provenance traced |
| 4 | Onboarding, conflict map, device checks, `goal.md` staleness | 0.52 | Conflict map complete; `goal.md` falsified row-by-row; D-1/D-2 recorded |
| 5 | Ranked remediation plan | 0.45 | Plan delivered; last digest anchor reverified (`showOperationResult` → `:11316`) |

**Stop reason: `maxIterationsReached`.** `stopPolicy: max-iterations` governed: convergence (final ratio 0.45 against a 0.05 threshold) was treated as telemetry only and no iteration synthesized early; instead each iteration's focus broadened (census refinement, conflict map, staleness audit, plan assembly). Quality guards pass: five source classes (repo, digest screens, Anytype true-up, roadmap §6A, phase docs), every finding carries ≥2 independent refs or is marked inference, no single-weak-source finding, no exhausted-approach retry.

Merge: `fanout-merge.cjs --loop-type research` consolidated the single lineage registry into `research/findings-registry.json` (23 key findings, 0 skipped, attribution in `research/fanout-attribution.md`). The lineage registry used the non-canonical key `findings`; the merge coerced 23 entries to `keyFindings` and recorded the schema mismatch as a warning.

## 5. What Notion Does That We Already Have — Verified

- **P1, the confirm/undo split, fully implemented.** `row-menu.ts:166-176` carries the landed "No confirm here" comment and calls `deleteRow` only; `deleteRow` attaches Undo exactly when a snapshot exists (`database-view.ts:8364-8368`); the bulk path keeps its confirm (`:4962-4968`, and `confirmWithModal(..., danger: true)` at `:9430-9436`); 17 `danger: true` sites across 9 files inventory the confirm surface. Notion's own product lands on the same split — independent corroboration of the E4 ruling this phase closed 2026-09-06. `[SOURCE: file:src/views/row-menu.ts:166-176]` `[SOURCE: file:src/views/database-view.ts:4962-4968]` `[SOURCE: screen:7a0e976e]`
- **P4, the desktop empty-state ladder, exceeded.** Notion's best (`120f4d36`) is icon + one line + a text link; ours renders icon + title + body + diagnostics + per-reason recovery actions (clearSearch / resetFilters / clearAll / showAll / chooseDatabase at `database-view.ts:8233-8267`) and a four-preset hero (`STARTER_PRESETS`, `empty-state-renderer.ts:80-143`). `[SOURCE: file:src/views/empty-state-renderer.ts:295-365]` `[SOURCE: screen:120f4d36]`
- **Reduced-motion coverage, absent from both references, present nine times over here.** Anytype ships zero `prefers-reduced-motion` rules (`design-trueup.md:41`); ours covers the container subtree (infinite shimmer included), the `.db-surface` body mounts that the container cannot reach, and overlays. `[SOURCE: file:styles.css:21095-21113]` `[SOURCE: file:styles.css:1007-1030]` `[SOURCE: file:styles.css:835]`
- **The motion set** sits at `styles.css:142-146` at exactly ADR-005's decided values, with `--db-motion-scale-from` shared by popover and toast entrances; `--db-sheet-enter` 260ms is reasoned in-tree (the drag-to-dismiss bound, `styles.css:114-120`) and uncontested by either reference. `[SOURCE: file:specs/005-component-surface-system/055-states-feedback-and-motion/decision-record.md:412-466]`
- **Undo wording is already consistent** — one i18n key (`toolbar.undo`, `i18n.ts:324`) at both undo call sites, against Notion's own iOS-Undo/web-Restore split. `[SOURCE: file:src/views/database-view.ts:2720]` `[SOURCE: file:src/views/database-view.ts:8370]`
- **Toast CSS matches the Anytype measurements** (384px card, 12px radius, 64px min-height, action-row gap/margin at the measured values, `:empty` auto-hide, collapsed stacking, `is-inline` rail clamp `min(384px, calc(100vw - 32px))`). `[SOURCE: file:styles.css:2724-2771]`
- **The single-tier loading surface is complete for today's surfaces.** `db-skeleton-loader` + `.db-skeleton-cell` shimmer on `--db-motion-emphatic` (1.1s ease-in-out infinite), with `is-wide`/`is-short` variants. `[SOURCE: file:styles.css:2864-2910]`

## 6. Gaps Notion Exposes — Ranked by User Impact

1. **Action-carrying toasts inherit the plain-success dismissal budget** (F-203, F-304). 2200ms governs a reader who must read, aim and act. The budget is a recorded rail inheritance, not a measured value: `design-trueup.md:350` records the rail's 2200ms as an existing budget and ADR-005's toast row measures only the Anytype *transition* (0.2s enter/exit) — no capture ever measured a dismissal. Splitting the budget refines an unmeasured inheritance rather than overriding a ruling. `[SOURCE: file:src/views/toast.ts:77]` `[SOURCE: file:specs/005-component-surface-system/055-states-feedback-and-motion/design-trueup.md:350]` `[SOURCE: file:specs/005-component-surface-system/055-states-feedback-and-motion/decision-record.md:452-460]`
2. **Owned operation failures escape to bare host notices** (F-205, F-103). `deleteRow`'s catch is the clearest instance; 242 `new Notice(` sites are the lane. The in-tree model already exists — `showOperationResult` (`database-view.ts:11316-11334`) mounts the owned toast into the rail with severity plus an action (Undo on success, Retry on error) and marks the rail `db-surface` so the reduced-motion reset reaches it. `[SOURCE: file:src/views/database-view.ts:8376-8379]` `[SOURCE: file:src/views/database-view.ts:11316-11334]` `[SOURCE: file:src/views/toast.ts:12-15]`
3. **No inline, permanent, actionable error chip** (F-103). Notion's `9748e66c` is a warning triangle + label + chevron, tap to reconfigure, for a stale reference — a third error shape between our persistent card and our transient rail. Our `source-missing` and `group-relation-deleted` reasons render as full cards even in compact contexts. `[SOURCE: screen:9748e66c]` `[SOURCE: file:styles.css:2711-2718]`
4. **Fast-band duration literals remain** (F-303). Four real untokenized declarations (`styles.css:200`, `:473`, `:7431`, `:22638`), all `120ms ease-out` against a token that is `ease` — a blind migration would silently change the curve. Five residual `var(--db-transition-fast)` uses remain (`:2037`, `:5461`, `:5678`, `:20110`, `:21747`). `[SOURCE: file:styles.css:200]` `[SOURCE: file:styles.css:122]`
5. **In-trash persistent banner** (F-104), a genuine gap with no owner in this phase. Notion pins a red banner with Restore / Delete permanently on any page in Trash, cross-platform identical (`15f3126a`, `4e2f2124`); our 14-reason vocabulary names *why a view is empty*, never *the object you are viewing is itself in Trash*. `[SOURCE: screen:15f3126a]` `[SOURCE: file:src/views/empty-state-renderer.ts:25-39]`
6. **Two-tier loading** (F-102), conditional. Notion's in-card step list plus persistent bottom bar (`a483c1af`, `a36c0cce`) has no counterpart because no surface here runs a multi-step, leave-it-running async operation. `[SOURCE: screen:a483c1af]`

## 7. Conflicts with Anytype Rulings — Named, with Proposals

1. **Destructive-confirm weight.** Notion differentiates text-only red (`28751c29`) from filled red `#E66459` (`348fd2b7`) *within one platform* by how much the action destroys. Landed ruling: one `danger` boolean → themed `mod-warning` (`confirm-modal.ts:28`, `confirm-sheet.ts:69`), colour paired with an icon (`051` E3), "don't split further" (design-trueup). **Proposal: HOLD, pending operator.** The only data-destroying case Notion's split exists for has no consumer in this tree (our views are configs over vault notes; nothing deletes a data source), and a second weight would need a 17-site severity classification no requirement drives. If a future phase needs it, the threshold is: heavier red only where the action destroys a data source or a batch beyond undo's snapshot capacity. `[SOURCE: screen:348fd2b7]` `[SOURCE: file:src/views/confirm-sheet.ts:69]`
2. **Toast placement.** Notion centres its iOS undo pill (80px symmetric margins) and left-aligns its web one under the content column — its own platforms disagree; ours is the Anytype-measured bottom-right 384px corner card shared with the rail. **Proposal: HOLD, pending operator** — landed, measured, unified across two placements, and the reference's internal disagreement is itself evidence against switching. `[SOURCE: screen:56f376d3]` `[SOURCE: file:styles.css:2724-2736]`

Additive refinements that touch no ruling: the inline chip (R3), the in-trash banner (R6, future — though E4's own logic means a trash surface inherits a Bin-shaped design question), the non-toast undo shapes (P6 — recorded; no analogue of Notion's AI-action context exists here), and the undo-word convention (a one-line note; we're already consistent). Notion's disabled-button treatment (tinted fill of the same hue, `8a755986`/`df6a041c`) contrasts with our `--db-disabled-opacity: 0.40` + `not-allowed` (`styles.css:148-149`) but conflicts with no captured Anytype ruling.

## 8. Device-Only Checks

- **D-1:** iOS `Reduce Motion` must stop the shimmer and snap entrances *inside the plugin's WKWebView* — media-query behavior in a webview is unverifiable from source or captures. (F-302)
- **D-2:** the 5s undo window is only meaningful if the Undo target is one-hand reachable at the rail's clamped phone width `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`); rides the existing operator device pass (`tasks.md` T017). (F-404)
- **Blanket rule:** the digest states no device-pixel ratio, so **no Notion pixel number is adopted without an on-device remeasure** — this plan adopts Notion shapes and behaviours only, and takes every number from the Anytype-measured token system or in-tree values.

## 9. The Ranked Remediation Plan

Full per-task detail (change, threshold, red-first check) is in `lineages/glm-openrouter-states/iterations/iteration-005.md` §F-502; the merged registry carries the same rows. Summary, ranked by user impact:

| # | Task | Size | Phase | Source findings |
|---|---|---|---|---|
| R1 | Split toast auto-dismiss: `ACTION_AUTO_DISMISS_MS = 5000` for action-carrying toasts (`toast.ts:77,137`) | S | now | F-203, F-304 |
| R2 | Route owned operation-failure paths through the toast, starting with `deleteRow`'s catch (`database-view.ts:8376-8379`), then the 242-site lane | S→M | now | F-205, F-103 |
| R3 | Inline stale-reference chip: `renderInlineChip` + `.db-inline-chip` (themed tokens, `aria-live`, chevron action) | M | now | F-103 |
| R4 | Reconcile `goal.md` §3 Today column + `tasks.md` T003/T019-amendment checkboxes, each restatement verified same-day | S | now | F-402 |
| R5 | Fast-band duration census → 0 (`styles.css:200,473,7431,22638`), resolving ease-vs-ease-out by ADR-note | S | now | F-303 |
| R6 | In-trash persistent banner — *future trash/restore phase; E4's Bin-shaped question rides along* | M | future | F-104 |
| R7 | Two-tier loading — *conditional on a future multi-step async surface* (≥2 named steps, >2s) | M | conditional | F-102 |

Every R-task lands a permanent lane row under `tools/live/` per the phase's verification criterion, each negative control observed red before green (`goal.md` §3's lane-row clause); R1/R2/R5 are observed red today in exactly the ways their checks state.

## 10. Concrete Changes, Thresholds and Red-First Checks

**R1 — `src/views/toast.ts`.** Add `const ACTION_AUTO_DISMISS_MS = 5000;` beside `AUTO_DISMISS_MS` (`:77`) and select at `:137`: `timer = window.setTimeout(close, options.action ? ACTION_AUTO_DISMISS_MS : AUTO_DISMISS_MS);`. Threshold: an action-carrying toast stays connected ≥5s; a plain success keeps 2200ms; `error` keeps wait-for-reader. Red-first: mount an action toast, assert connected at 3s; mount a plain success, assert dismissed by 2.5s — both fail today. The 5s figure is an **inference** — the shortest window that comfortably covers read-aim-act; no capture can show a Notion duration.

**R2 — `src/views/database-view.ts:8376-8379`.** Replace `new Notice(t("errors.deleteFailed", { error: String(err) }))` with `showToast(this.containerEl_?.ownerDocument ?? document, { severity: "error", message: t("errors.deleteFailed", { error: String(err) }) })`, then continue the migration lane for the remaining owned-operation sites. Threshold: every error path in `database-view.ts` that reports an operation outcome renders `.db-toast.is-error`, and `is-error` never auto-dismisses. Red-first: a forced delete failure renders a host `Notice` today; the `new Notice(` census for owned operations trends to 0 with each merged slice.

**R3 — `src/views/empty-state-renderer.ts` + `styles.css`.** Add `renderInlineChip(container, { label, icon, onClick })` alongside `renderCard` (`:295`); add a `.db-inline-chip` block beside the `.db-empty-card` family: warning icon + label + chevron, background `color-mix(in srgb, var(--background-modifier-error) 12%, transparent)`, icon `var(--text-error)`, no dismiss control, `aria-live="polite"`. Render it for `source-missing` and `group-relation-deleted` where compact mode applies. Threshold: stale references in compact contexts render the chip, never auto-dismiss, and their tap target meets the host's interactive floor (§6A's 44px ruling governs table rows, not chips; the chip matches the row-menu/empty-action floor). Red-first: a board group whose relation was deleted renders no chip today; `grep -c "db-inline-chip" styles.css` is 0, and after the change ≥1 with themed tokens and zero hex literals.

**R4 — `goal.md` §3 and `tasks.md`.** Restate five rows (toast, item 9, E4, motion, Notices count) to verified figures; check T003 and the T019 amendment with their done-evidence. Threshold: every restated figure carries a same-day `file:line` verification; no figure copied from the digest without re-checking. Red-first: each old claim is reproduced as false against the tree before the edit lands — the stale claim is its own negative control.

**R5 — `styles.css`.** Either add `--db-motion-fast-out: 120ms ease-out;` to the token block (`:142-146`) and alias the four sites, or migrate them to `var(--db-motion-fast)` accepting the `ease` curve; record which and why in an ADR note. Threshold: raw fast-band duration literals = 0, comments excluded. Red-first: the comment-excluded census is 4 today, 0 after.

**R6 (future) / R7 (conditional)** carry their thresholds in §9's source findings: banner pinned while the trashed object is open with exactly two outline actions from the host error token (red-first: `grep db-trash-banner` = 0 today); step-list + persistent bar only for ≥2 named steps and >2s expected duration (red-first: both tiers render for a 3-step mock, the bar survives the card scrolling out of view, a single-step operation still renders only the shimmer).

## 11. Recommendations

1. **Open a child phase carrying R1–R5 as legs**, with R6/R7 recorded as future/conditional rows rather than tasks. R1, R2 and R5 are small and independently landable; R3 is the only new component shape; R4 is bookkeeping that must not be folded into another leg, because its negative control is the stale claim itself.
2. **Take the two Anytype conflicts to the operator as Proposed ADRs**, both recommending HOLD. Neither has a consumer in this tree today, and both landed rulings are measured.
3. **Do not adopt any Notion number.** Adopt shapes and behaviours; take values from the Anytype-measured token system or from in-tree reasoning, and remeasure on device where a number is unavoidable.
4. **Reconcile the phase's tracking documents before the next status read.** Five load-bearing "Today" lines misstate a phase whose implementation has largely landed; any planning that reads them will re-derive work that is already done.
5. **Keep the digest's citation drift recorded, not corrected in place** — `modals/confirm-modal.ts` → `src/views/modals/confirm-modal.ts`, and `showOperationResult` `:9433-9437` → `:11316-11334`.

## Eliminated Alternatives

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Replace `renderCard`'s action buttons with Notion-style text links | Ours already generalize (icon + label + primary flag); a subset relationship, not a gap | F-101; `empty-state-renderer.ts:295-330` | 1 |
| Build the two-tier loader now | No multi-step async surface exists; no criterion asks for one | F-102; `styles.css:2864-2910`, `screen:a483c1af` | 1 |
| Blocking error modal for read failures | `read-failed` is already persistent; the digest's modal screens are action-failures, a different class; modality would conflict with sheet-grammar ownership (**inference**) | F-103; `screen:53f4023b` | 1 |
| Adopt Notion's offline/cached-pages pattern | Connectivity is Obsidian's domain; no surface here owns sync state | F-105; `screen:a335360d`, `screen:e186b09b` | 1 |
| Radio-choice consequence picker in `ConfirmModal` | No consumer: our views are configs; nothing destroys a data source | F-201; `confirm-modal.ts:30,75`, `screen:348fd2b7` | 2 |
| Second destructive red weight | Conflicts with the landed don't-split + `051` E3 rulings, and no consumer exists | F-202; `confirm-sheet.ts:69`, `screen:28751c29` | 2 |
| Re-place the toast stack centred / left-aligned | Landed Anytype corner card is measured and unified with the rail; Notion's own two platforms disagree | F-202 corollary; `styles.css:2724-2736`, `screen:56f376d3` | 2 |
| Audit undo wording for drift | One i18n key at both call sites; already consistent | F-204; `i18n.ts:324`, `database-view.ts:2720,8370` | 2 |
| Build the other three undo shapes (popover, inline replace, menu row) | No requirement in `goal.md` §3; Notion's AI-action-revert context has no analogue here | F-206; `screen:4e97a1c9`, `screen:5415dd8d` | 2 |
| Read Notion motion values from the digest | Structurally impossible — a still is not a duration; the digest states the same | F-301; digest §1 | 3 |
| Treat the digest's 7-literal census as 7 migration targets | 3 of 7 are comments/definition; the real set is 4, with an easing distinction to resolve first | F-303; `styles.css:122,123,430` | 3 |
| Mirror Anytype's lack of reduced motion as "parity" | The design true-up records our coverage as the deliberate non-mirror | F-302; `design-trueup.md:129` | 3 |
| Build an onboarding-hint component this phase | Out of scope; no `goal.md` §3 criterion | F-401; `empty-state-renderer.ts:333-365` | 4 |
| Notion dark-theme capture sweep | Refinement-only reference; Anytype dark evidence already on file, and the themed-token rule guards the gap | F-405; digest §1, `design-trueup.md:2-3` | 4 |
| Adopt any Notion pixel number directly | No stated device-pixel ratio in the digest; shapes only | F-404; digest §1 scale caveat | 4 |
| Rank R6/R7 above R1–R3 | They lack an owning requirement today; impact ranking follows demonstrated reach, not pattern elegance (**inference**) | F-502 | 5 |
| Fold R4's reconciliation into this research output | The lineage's write surface is the research directory; reconciliation is a phase task with its own negative controls | F-502 | 5 |

## Divergence Map

No divergent pivots were recorded. The merged registry (`research/findings-registry.json`) carries no `divergence` block, and the run used `convergenceMode: default` with `stopPolicy: max-iterations` — breadth came from per-iteration focus rotation, not from divergent pivots.

- **Saturated directions:** motion values from captures (closed iter 3); Notion pixel adoption (closed iter 4); Notion dark-theme sweep (closed iter 4).
- **Pivots taken:** none.
- **Council artifact references:** none.
- **Pivot failures / audited overrides:** none.
- **Remaining frontier:** closed. All seven digest open questions are dispositioned (see `lineages/glm-openrouter-states/deep-research-strategy.md` § Divergence Frontier).

Breadth is not convergence: the loop stopped at its iteration cap with a final `newInfoRatio` of 0.45, well above the 0.05 threshold.

## 12. Open Questions

Every configured Key Question (Q1–Q5) was answered; the questions that remain are decisions and device facts, not research gaps.

1. **Operator ruling on the two named conflicts** — destructive-red weight and toast placement. Both are proposed HOLD; neither is decided until the operator rules. (§7)
2. **D-1** — does iOS `Reduce Motion` stop the shimmer and snap entrances inside the plugin's WKWebView? Unverifiable from source or captures. (§8)
3. **D-2** — is the Undo target one-hand reachable at the rail's clamped phone width, so a 5s window is actually usable? (§8)
4. **R5's easing choice** — an explicit `ease-out` fast-band token versus accepting `ease` as the one fast-band curve. Either satisfies the threshold; the choice needs an ADR note, not more research. (§10)
5. **R6's Bin-shaped question** — E4 skips confirms because Anytype's Bin makes deletion reversible; a trash/restore surface therefore inherits a design question this phase never had to answer. (§7)
6. **The 5s undo window itself** is an inference, not a measured parity value; D-2 is the check that would confirm or move it. (§10)

## 13. Confidence and Limitations

- **High confidence (≥0.9):** the verified have-and-richer claims — P1's split (0.93), the motion token set (0.95), reduced-motion coverage (0.92), `goal.md` staleness (0.94), the P9 non-applicability (0.95). Each was checked directly against this worktree.
- **Medium-high (0.82–0.88):** the three gap findings — the 2200ms undo window (0.88), the bare-Notice delete failure (0.87), the missing inline chip (0.83), and the named conflicts (0.82).
- **Lower (0.78–0.80):** the future/conditional rows — two-tier loading (0.78) and the non-toast undo shapes (0.80), both bounded by the absence of an owning surface.
- **Structural limitation:** a still image cannot show a duration or a device-pixel ratio. No Notion timing or pixel value enters this synthesis as a number.
- **Single-lineage limitation:** one executor produced all five iterations, so there is no cross-lineage disagreement to arbitrate. Every finding's independence comes from source diversity within the lineage (repo, digest screens, Anytype true-up, roadmap §6A, phase docs), not from a second opinion.
- **Document-versus-code:** where a packet document and the tree disagreed, the tree was taken as truth and the document flagged (R4). Findings 1–3 were re-verified after `055` landed further changes; any later commit to `toast.ts`, `database-view.ts` or `styles.css` invalidates the specific line anchors, not the findings.

## 14. Validation Matrix

| Claim | Check | Status today |
|---|---|---|
| Action toasts dismiss at 2200ms | Mount an action toast; assert connected at 3s | Red (observed) |
| Delete failure renders the owned toast | Force a delete failure; assert `.db-toast.is-error` | Red (observed) |
| Inline chip exists | `grep -c "db-inline-chip" styles.css` | Red (observed, 0) |
| Fast-band literals eliminated | Comment-excluded `120ms` census in `styles.css` | Red (observed, 4) |
| `goal.md` §3 Today column matches the tree | Re-derive each of the five figures with `file:line` | Red (observed, 5 rows) |
| E4 confirm removed | Read `row-menu.ts:166-176` | Green |
| 14 empty-state reasons ship | Read `empty-state-renderer.ts:25-39` | Green |
| Motion tokens at ADR-005 values | Read `styles.css:142-146` | Green |
| Reduced-motion blocks cover the shimmer | Read `styles.css:21095-21113`, `:1007-1030` | Green |
| Undo wording single-keyed | Read `i18n.ts:324`, `database-view.ts:2720,8370` | Green |
| iOS Reduce Motion honored in WKWebView | Operator device pass (D-1) | Unverified — device only |
| Undo one-hand reachable at clamped width | Operator device pass (D-2) | Unverified — device only |

## 15. Traceability and Acceptance

- **Q1** (ranked improvements + concrete change + threshold) → §6, §9, §10. Answered.
- **Q2** (which claimed behaviours verify; which "Today" figures are stale) → §5, F-402's five-row table. Answered.
- **Q3** (conflicts with a landed Anytype ruling) → §7, two conflicts, both HOLD-proposed. Answered.
- **Q4** (device-only checks) → §8, D-1/D-2 plus the blanket no-Notion-numbers rule. Answered.
- **Q5** (ranked remediation plan as child-phase tasks) → §9, §10, R1–R7. Answered.
- **Acceptance for a downstream child phase:** each of R1–R5 becomes a leg with the threshold and red-first check in §10 verbatim; the two conflicts become Proposed ADRs pending the operator; D-1/D-2 extend the existing operator device pass (`tasks.md` T017) rather than opening a new lane; R6/R7 are recorded rows, not tasks.

## 16. References

**Loop artifacts**
- `specs/005-component-surface-system/055-states-feedback-and-motion/research/resource-map.md` — emitted from 5 converged lineage deltas
- `research/findings-registry.json` — merged registry, 23 key findings
- `research/fanout-attribution.md` — lineage attribution table
- `research/lineages/glm-openrouter-states/research.md` — lineage synthesis
- `research/lineages/glm-openrouter-states/iterations/iteration-001.md` … `iteration-005.md`
- `research/lineages/glm-openrouter-states/deep-research-strategy.md`, `deep-research-dashboard.md`, `deep-research-state.jsonl`, `deltas/iter-001.jsonl` … `iter-005.jsonl`

**Notion evidence (via the digest only)**
- `specs/005-component-surface-system/055-states-feedback-and-motion/notion-screens-digest.md` §2 (screen ids + `mobbin_url`), §3 (P1–P9), §4–§5 (tree-side claims and open questions)
- Screens cited: `120f4d36`, `0725c79d`, `9748e66c`, `53f4023b`, `f318b5e0`, `15f3126a`, `4e2f2124`, `a483c1af`, `a36c0cce`, `a335360d`, `e186b09b`, `ccc30760`, `712f6960`, `dddf6bca`, `7a0e976e`, `56f376d3`, `28751c29`, `348fd2b7`, `4e97a1c9`, `5415dd8d`, `56bedefe`, `8a755986`, `df6a041c`

**Repository**
- `src/views/toast.ts:12-15,77,137` · `src/views/empty-state-renderer.ts:25-39,80-143,197-201,246-266,295-372` · `src/views/confirm-sheet.ts:69` · `src/views/modals/confirm-modal.ts:28,30,75` · `src/views/row-menu.ts:166-176` · `src/i18n.ts:324`
- `src/views/database-view.ts:2718-2723,4962-4968,8225-8282,8344-8379,9430-9436,11316-11334`
- `styles.css:114-150,200,473,835,1007-1030,2037,2700-2771,2864-2910,5461,5678,7431,20110,21095-21113,21747,22501-22587,22638`

**Packet and design record**
- `055-states-feedback-and-motion/goal.md:99-183,211-235` · `design-trueup.md:41-68,99-129,298-299,350` · `decision-record.md:412-466` · `tasks.md:649-651`
- `specs/005-component-surface-system/design-system.md` (no motion section — grep empty) · `roadmap.md` §6A · `051` ADR-007 / E3 / E4

## 17. Convergence Report

- Stop reason: `maxIterationsReached`
- Total iterations: 5 (1 lineage × 5)
- Questions answered: 5 / 5
- Remaining questions: 0 configured Key Questions open; 6 decision/device items recorded in §12
- Last 3 iteration summaries: run 3: motion tokens, residuals, reduced-motion (0.58); run 4: onboarding, conflict map, device checks, goal.md staleness (0.52); run 5: ranked remediation plan (0.45)
- Convergence threshold: 0.05 (final `newInfoRatio` 0.45 — telemetry only under `stopPolicy: max-iterations`)
- newInfoRatio series: 0.72 → 0.66 → 0.58 → 0.52 → 0.45
- Divergence summary: no divergent pivots recorded; frontier closed (see Divergence Map)
- Merge: 1 lineage merged, 0 skipped for a missing registry, 23 key findings; one schema-mismatch warning (`findings` → `keyFindings`, 23 entries coerced)
- Known deviations: the lineage did not run `generate-context.js` (the detached fan-out write-surface contract forbids writes outside the lineage directory); the orchestrator recorded 6 timestamp anomalies in the lineage state log (local-offset timestamps written after the orchestrator's completion window) — telemetry only, no artifact affected.
- Segment transitions, wave scores, and checkpoint metrics are experimental and omitted from the live report.
