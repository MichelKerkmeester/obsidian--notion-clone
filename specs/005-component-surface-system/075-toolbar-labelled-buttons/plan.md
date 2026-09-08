---
title: "Implementation Plan: Phone toolbar icon+label buttons matching the Notion/Anytype/Bases reference, with horizontal overflow scroll"
description: "Adds an icon+label span to the phone toolbar's filter/sort/group/columns/settings/more buttons via a new appendToolbarControlLabel helper, shown only under .is-phone; a new phone-toolbar-scroll lane proves the row stays single-line, scrolls horizontally and meets 44px, red before the fix and green after."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phone toolbar icon+label buttons matching the Notion/Anytype/Bases reference, with horizontal overflow scroll

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin), plain CSS (styles.css) |
| **Framework** | None — hand-rolled DOM builders (`toolbar-renderer.ts`, `toolbar-primitives.ts`) |
| **Storage** | None — presentation-only change |
| **Testing** | Playwright-driven live harnesses under `tools/live/` (real Chrome, real bundled renderer), vitest for unit tests |

### Overview
The phone toolbar's filter/sort/group/columns/settings/more controls each gain a text label beside
their icon, shown only under `.is-phone` via a new `appendToolbarControlLabel` helper shared by both
button-building primitives (`createControlClusterButton`, `createIconButton`). The row's own existing
`overflow-x: auto` (already shipped for `.obnotion-toolbar-right`) is what carries the horizontal
scroll once the wider labelled buttons no longer fit; this plan widens the buttons to 44px and adds
one `flex-wrap: nowrap` rule to make D1's "never wrap" ruling explicit, rather than building new
scroll machinery. A new `phone-toolbar-scroll` live lane (red before the change, green after) proves
the row stays single-line, scrolls, and meets the 44px floor; desktop and the embedded/codeblock
toolbar are untouched (ADR-001, `decision-record.md`).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Hand-rolled DOM builders — no component framework. Shared button-building primitives
(`toolbar-primitives.ts`) are called by the view-specific renderer (`toolbar-renderer.ts`), the
pattern every other toolbar control in this file already follows.

### Key Components
- **`appendToolbarControlLabel`** (new, `toolbar-primitives.ts`): appends a `.obnotion-toolbar-control-label`
  text span to a button, reusing the same label text already passed for the button's `aria-label`
  and tooltip — one source of truth for the control's name across all three surfaces (screen reader,
  hover tooltip, visible label).
- **`createControlClusterButton`** (existing, modified): now calls the label helper for filter/sort/columns.
- **`createIconButton`** (existing, unmodified signature): its three call sites (settings, utilities/
  "more", group) each call the label helper themselves, since the group button's icon is appended
  externally via `appendSvg` after `createIconButton` returns — calling the helper inside
  `createIconButton` itself would draw the label before an icon that has not been appended yet for
  that one call site.
- **`.is-phone`-scoped CSS**: the label's base rule is `display: none`; the phone rule turns it on and
  widens the six named control classes to `min-width: 44px; height: 44px`. Desktop and the embedded/
  codeblock toolbar are unaffected by construction (see `decision-record.md` ADR-001).

### Data Flow
No data flow change — this is a presentation-only edit. The same `ToolbarActions`/`DatabaseViewState`
inputs drive the same buttons; only their rendered markup (an added label span) and their phone-only
CSS geometry change.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:measurement -->
## MEASUREMENT: REFERENCE VS IMPLEMENTED (AC-001)

Measured directly off the operator's reference screenshot (an Obsidian Bases calendar toolbar,
1206x2622 physical px at what the image's own status-bar clock and battery glyphs place at an
iPhone-class 3x device pixel ratio, i.e. a 402pt logical viewport — the same width AC-003's lane
uses). Reported as **approximate, confirmed by eye against the decoded image**, not a pixel-perfect
tool measurement — the reference is a different application (a website, `obsidianstats.com`,
rendering Obsidian Bases) on a different device class than this plugin ships to, so a pixel-for-pixel
match is not a meaningful bar; a proportionate match is.

| Dimension | Reference (measured, ±30% tolerance) | Implemented | Source |
|---|---|---|---|
| Icon size | ~20pt | 19px (unchanged) | Pre-existing `.obnotion-toolbar-icon-button svg` rule |
| Label font size | ~15-18pt | 13px (`var(--obnotion-font-md)`) | Existing design token, reused rather than a bespoke value |
| Icon-to-label gap | ~9pt | 6px (`var(--obnotion-space-3)`) | Existing design token |
| Button horizontal padding | not separately measurable (buttons abut their own label) | 8px each side (`var(--obnotion-space-4)`) | Existing design token |
| Gap between button groups | ~20-27pt (visually open) | 4px + a 1px divider border (existing `.obnotion-toolbar-cluster + .obnotion-toolbar-cluster` rule, unchanged) | Deliberate deviation, see below |
| Button height | ~30pt (the reference's own row, not touch-target-driven) | 44px | REQ-002's own floor, not the reference |

**Deliberate deviations, and why:**
- **Button count.** The reference shows 4 controls (Sort, Filter, Properties, New); this toolbar
  carries 6 (filter, sort, group, columns, settings, more). Matching the reference's wide inter-group
  gaps at 6 controls would push the row's natural width well past what any phone viewport shows before
  scrolling, defeating the point of measuring spacing at all — the existing divider-separated grouping
  (a 1px border rather than open space) is the density adaptation this extra control count requires.
- **Button height.** The reference's own row is not built to any accessibility floor — it is a website
  screenshot, not a native touch surface. REQ-002's 44px is this packet's own requirement, not
  something borrowed from the reference, and takes precedence where the two would otherwise disagree.
- **Design tokens over bespoke values.** Every implemented value above an existing `--obnotion-*`
  token (space-3, space-4, font-md) rather than a new one-off pixel value, matching this plugin's
  own design-system convention (`sk-code`'s stack-pattern-compliance) even where the reference's own
  measurement would suggest a slightly different number.
<!-- /ANCHOR:measurement -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Use this section when `research_intent=fix_bug`, when planning from a deep-review FAIL/CONDITIONAL verdict, or when any finding touches security, path handling, env precedence, schema boundaries, persistence, public responses, or shared policy.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| [producer/helper/policy] | [what owns the behavior] | [update/unchanged/not a consumer] | [grep/test/doc evidence] |
| [consumer/status/docs/tests] | [how it observes the behavior] | [update/unchanged/not a consumer] | [grep/test/doc evidence] |

Required inventories:
- Same-class producers: `rg -n '<field|string|helper|literal|error-pattern>' <module-or-files>`.
- Consumers of changed symbols: `rg -n '<changedSymbol>|<changedConstant>|<changedPublicField>' . --glob '*.ts' --glob '*.js' --glob '*.md'`.
- Matrix axes: list every independent input axis and the required rows before implementation.
- Algorithm invariant: for path/redaction/parser/resolver/security fixes, state the invariant and adversarial cases.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| New live lane | Full phone toolbar at 402px: labels present, single line, ≥44px, scrolls, last control reachable, scrollbar hidden | `tools/live/run-phone-toolbar-scroll.mjs` (new), red-then-green proven by a one-line CSS revert |
| Regression (embedded/desktop) | The pre-existing collapse ladder is unaffected | `tools/live/run-toolbar-collapse-sweep.mjs` (009), `tools/live/sheet-grammar.mjs` (044) |
| Touch-target floor | The 6 phone-labelled controls never regress below 44px | `tools/live/touch-targets.mjs`'s `RAISED` list, new entries for the 6 control classes |
| Type/unit/build | No regressions in the wider codebase | `npx tsc --noEmit`, `npx vitest run`, `npm run build` |
| Full gate | Every registered lane, once | `npm run gate` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| [System/Library] | [Internal/External] | [Green/Yellow/Red] | [Impact] |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: [Conditions requiring rollback]
- **Procedure**: [How to revert changes]
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──────┐
                      ├──► Phase 2 (Core) ──► Phase 3 (Verify)
Phase 1.5 (Config) ───┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core, Config |
| Config | Setup | Core |
| Core | Setup, Config | Verify |
| Verify | Core | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | [Low/Med/High] | [e.g., 1-2 hours] |
| Core Implementation | [Low/Med/High] | [e.g., 4-8 hours] |
| Verification | [Low/Med/High] | [e.g., 1-2 hours] |
| **Total** | | **[e.g., 6-12 hours]** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created (if data changes)
- [ ] Feature flag configured
- [ ] Monitoring alerts set

### Rollback Procedure
1. [Immediate action - e.g., disable feature flag]
2. [Revert code - e.g., git revert or redeploy previous version]
3. [Verify rollback - e.g., smoke test critical paths]
4. [Notify stakeholders - if user-facing]

### Data Reversal
- **Has data migrations?** [Yes/No]
- **Reversal procedure**: [Steps or "N/A"]
<!-- /ANCHOR:enhanced-rollback -->

---

