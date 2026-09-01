---
title: "Goal: Sheet Inline Edit Alignment"
description: "The durable directive for the record sheet's inline editors, and the criteria that decide when it is done."
trigger_phrases:
  - "021 goal"
  - "inline edit alignment goal"
  - "sheet editor centre line directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/021-sheet-inline-edit-alignment"
    last_updated_at: "2026-08-30T21:00:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Host token read from Obsidian 1.13.4: 15px on desktop, user text size on mobile"
    next_safe_action: "The operator taps a value and the title on device"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-021"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Is Obsidian's --font-ui-medium default really 15px, or is that this repo's host model"
    answered_questions:
      - "The sheet opens five editors, not four, and two of them are inline"
      - "The title's 2.4px was the harness rendering it two font steps small, not the correction"
      - "The 1px residue is sheet-only; desktop measures 0.00 displacement in both axes"
---
# Goal: Sheet Inline Edit Alignment

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Tapping a value or the title in the phone record sheet opens an editor on the line it
replaced, inside its row, at the thumb floor.

**Why.** The record sheet is the phone's primary editing surface. The reported defect was the
offset; the unreported one is worse — an editor overhanging the row beneath is ambiguous about what
it is editing.

### Decisions

| ID | Decision |
|----|----------|
| D1 | One mechanism, one fix. The offset and the overhang are the same arithmetic. |
| D2 | Size the editor to the row. An out-of-flow box cannot make its row grow: a constraint, not a preference. |
| D3 | Declare the row height once as a token. Three rules must agree and two derive a negative margin from it. |
| D4 | Freeze desktop rather than fix it. Its numbers are pinned so a phase that fixes it must update them. |
| D5 | Keep the single -11.2px correction. At the shipped host values both anchors' line boxes agree to 0.15px. |
| D6 | Name the `setPosition` box-conversion defect, do not fix it. Its repair reaches desktop callers. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

The parent packet's `goal.md` outranks this document. Its third decision governs closure here:
shipped, verified and operator-confirmed are three states, and only the third closes anything.

Every check drives the shipped open-and-edit path. Nothing builds an editor by hand, and a check
whose page omits a host token measures a device nobody has.

Five defects `spec.md` §12 names and measures are not criteria here.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] The value editor sits on its label's centre line, <= 1px: **7.6px** -> **1.0px**.
- [x] The value editor stays inside its row, <= 1px overhang: **2.5px below** -> **0.5px**.
- [x] The inline editor meets the 44px thumb floor: **34.8px** -> **44px**.
- [x] Both hold under a host stylesheet inflating every input: **15.2px / 17.7px** -> **1.0px /
      0.5px**.
- [x] The desktop editor rectangle is frozen at **34.8 / 8 / 12** within 0.5px, and its control
      reports **31 / 6.1 / 8.2** and exits 1.
- [x] The title's rename editor sits on its own centre line, <= 1px: **9.0px** -> **0.9px**, driven
      through the shipped double-click against a page declaring `--font-ui-medium`. `styles.css` is
      byte-identical: the 2.4px was the harness rendering the title two font steps small.
      **Closed for desktop, with the phone named.** The 15px it rests on is confirmed below, read
      from the installed host's own `app.css`, so the 0.1px of headroom no longer rests on an
      unverified value. What the confirmation also showed is that `--font-ui-medium` is redefined
      under `.is-mobile` to follow the user's text size, so this correction is bounded on desktop
      and user-dependent on a phone.
- [x] Obsidian's `--font-ui-medium` default is confirmed on a device rather than inferred from this
      repo's host model. One correction holds within 1px from **14.7px to 17.7px**; the check prints
      the title's measured size and line box on every run.
      **Confirmed from the host's own stylesheet — `body { --font-ui-medium: 15px }`**, read out of
      `app.css` inside `obsidian.asar` in the installed **Obsidian 1.13.4**. That is the value this
      repo's host model declares, so the inference was right, and it is now a reading of the host
      rather than a guess about it. The 0.9px correction sits well inside the 14.7-17.7px band.
      **And the reading found something the inference could not.** The same stylesheet carries a
      second declaration: `.is-mobile { --font-ui-medium: var(--font-text-size) }`. **On a phone the
      token is not 15px at all** — it follows the user's configurable text size. A reader who has
      raised that setting moves the title's font outside the band this row names, and the ≤1px
      correction is not guaranteed for them.
      *So the desktop half is settled and the phone half is now a known, bounded risk* rather than
      an unexamined assumption. Recorded here rather than folded away, because the row above depends
      on this number and now depends on it only for desktop.
- [ ] The operator taps a value and the title on device and sees each editor where it started.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

**The sixth criterion was added by a fresh review after shipping, and its first diagnosis was
wrong.** The offset is written in terms of `--db-font-lg`'s line height, which is the *value's*
metric, so a title inheriting it looked like a correction derived from the wrong box. But the title
sizes from `--font-ui-medium`, a **host** token, and declares no line-height. The harness page
declared no such token, the reference was invalid at computed-value time, `font-size` fell back to
the inherited 13px, and the 18.85px line box that the wrong-box theory rested on is just 13 x 1.45 —
the fallback, measured. At Obsidian's 15px the title's box is 21.75px against the value's 21.6px, so
the two agree to 0.15px and one number genuinely serves both.

**The prescribed fix would have made a device worse.** A second literal encoding -12.6px fits the
title's *fallback* box; on a device it would take the measured offset from 0.9px to roughly 2.3px.
The general form, a `calc()` over `--font-ui-medium`, is invalid at computed-value time wherever
that token is absent, and `margin-top` then falls back to 0 — measured at **13.6px** out, six times
worse than the 2.4px it would replace. A per-anchor correction belongs in the placement path, where
the anchor is in hand and no host token has to survive a cascade.

**The residual is 0.1px of headroom** and is linear in the host token: 2.4px at 13px, 1.7px at 14px,
0.9px at 15px, 0.2px at 16px, -0.5px at 17px, -1.2px at 18px. A theme that moves the token far
enough takes this red, which is correct — it would be visibly off on the device too.

**Criterion 5's first instrument passed the mistake it existed to catch.** It asserted the desktop
editor's `margin-top` was still `0px`; unscoping both new selectors left it reading `0px` anyway,
because `--db-sheet-row-min-height` is declared only on the sheet and off it the declaration is
invalid and falls back to the initial value. Meanwhile the input rule did leak, shrinking the
desktop editor from 34.8px to 31px. A control that cannot fail is the same defect as a check that
cannot fail, one level up.

**`spec.md` and `implementation-summary.md` still read 2.4px and Open** for the title editor, and
`completion_pct: 88`. `acceptance-criteria.md`, written later, recorded AC-006 Met at 0.9px. The
supply audit has since moved it to `Provisional` and every document now reads 85: the 0.9px is real
and the correction is right, but the margin belongs to a `--font-ui-medium` the harness declares and
this repo infers. Those two documents' `Open` was closer to the truth than the closure that replaced
it.

**Verification at ship:** `npm run gate` 14 green exit 0; `npx vitest run` 444 passed;
`npm run storybook:placement` 186/190 with 4 red for a declared reason, exit 0;
`npm run screenshots:verify` 224 entries; `evidence.mjs --check-all` 8 of 8. Commit `0ff9f9a`,
review `3d4d2f2`.
<!-- /ANCHOR:log -->
