---
title: "Acceptance Criteria: Sheet Inline Edit Alignment"
description: "Five criteria met on the sheet's two inline editors and one provisional. The sixth needed no stylesheet change, but its 0.9px rests on a host token the harness declares and this repo infers."
trigger_phrases:
  - "021 acceptance criteria"
  - "inline editor centre line closure"
  - "title editor open criterion"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/021-sheet-inline-edit-alignment"
    last_updated_at: "2026-08-30T19:45:00Z"
    last_updated_by: "criterion-6-closure"
    recent_action: "Host token read from Obsidian 1.13.4: 15px on desktop, user text size on mobile"
    next_safe_action: "The operator taps a value and the title on device"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-021"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Does a per-anchor correction in the placement path earn its own phase"
    answered_questions: []
---
# Acceptance Criteria: Sheet Inline Edit Alignment

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> Each criterion is measured through the **real** open-and-edit path: the shipped
> `openRecordDetailPanel` with both `editCell` and `editFileName` wired to the shipped `CellRenderer`,
> a click on the value element and a double-click on the title. Nothing here builds an editor by hand.
>
> Failing numbers are from the tree as received.
>
> **Criterion 6** was added by a fresh review after shipping. It is now measured through that same
> real path and the stylesheet did not change to meet it — but its margin is supplied by a host token
> the harness declares, so it is `Provisional` rather than `Met`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 021-sheet-inline-edit-alignment
**Level:** 3
**Status:** Partial
**Date:** 2026-08-30
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Measurement | Threshold | Before | After | Verification | Status |
|---|---|---|---|---|---|---|---|
| AC-001 | REQ-001 | Distance between the inline editor's centre line and its label's, through the shipped open-and-edit path | <= 1px | **7.6px** | 1.0px | `tools/storybook/verify-placement.mjs:4244` | Met |
| AC-002 | REQ-002 | Editor overhang past the bottom of the row that contains it | <= 1px | **2.5px below the row** | 0.5px | `tools/storybook/verify-placement.mjs:4234` | Met |
| AC-003 | REQ-003 | Inline editor height against the thumb floor the sheet's textarea editor already holds | >= 44px | **34.8px** | 44px | `styles.css:9391` | Met |
| AC-004 | REQ-004 | AC-001 and AC-002 re-measured with a host stylesheet inflating every input | <= 1px each | **15.2px / 17.7px** | 1.0px / 0.5px | `styles.css:9399` | Met |
| AC-005 | REQ-005 | Desktop panel editor rectangle, frozen against a leak from the two new selectors | exact, ±0.5px | 34.8px / 8px / 12px | 34.8px / 8px / 12px | `tools/storybook/verify-placement.mjs:4172` | Met |
| AC-006 | REQ-007 | **The title's rename editor** — the second inline editor — on its own centre line, driven through the shipped double-click rename and measured against a page that declares the host's `--font-ui-medium` | <= 1px | **2.4px** | **0.9px** at a harness-declared 15px | `tools/storybook/verify-placement.mjs` — "the sheet's rename editor sits on the title's centre line" | **Provisional** |

### Why AC-006 exists, and why its failing number was the harness's and not the product's

The harness could not reach the title editor for two independent reasons: it stubbed the rename entry
point as a no-op, and the trigger is a double-click rather than a click. **Either alone would have
hidden it.** The stub is now wired to the shipped `CellRenderer.editFileName`, the check drives a
double-click, and the editor it opens is the same `.db-cell-line-edit-popover` a value opens, for
column `file.name`. That pairing is asserted, because without it the geometry below could measure
some other box and read as no defect.

With the editor reachable, the criterion was **observed red at 2.4px** and then diagnosed, and the
diagnosis is not the one written when it was raised.

The offset is written in terms of `--db-font-lg`'s line height, which is the **value's** metric, so
the concern was real: a non-value anchor inherits a correction computed for a box it does not have.
But the title's box is not 18.85px on any device. The title sizes from `--font-ui-medium`, a **host**
token, and declares no line-height, so it inherits the container's unitless `1.45` and its line box is
the *host's* font size times the plugin's ratio. The harness page declared no `--font-ui-medium`, the
token reference was therefore invalid at computed-value time, `font-size` fell back to the inherited
13px, and 18.85px is 13 × 1.45 — the fallback, measured. `tools/screenshots/theme.css` records
Obsidian's default as 15px, which gives 15 × 1.45 = **21.75px**, against the value's 16 × 1.35 =
**21.6px**. The two anchors' line boxes agree to 0.15px, so one correction serves both, and the
shipped −11.2px is within 0.07px of what the title alone would want.

Modelling that token on the page — the same repair the bare-control rule already performs, for the
reason that file states — takes the measured offset to **0.9px**. **No stylesheet declaration
changed**; `styles.css` is byte-identical across this work. What changed is that the page now renders
the title at the size a reader sees.

### The residual, stated

0.9px against a 1px threshold is 0.1px of headroom, and the offset is linear in the host token. Swept
through the shipped path, the title's centre offset is 2.4px at 13px (and with the token absent),
1.7px at 14px, **0.9px at 15px**, 0.2px at 16px, −0.5px at 17px and −1.2px at 18px. So the single
correction holds within 1px for a host UI font of roughly **14.7px to 17.7px** and drifts linearly
outside it. Obsidian's default sits inside that band; a theme that moves the token far enough takes
this red, which is correct — it would be visibly off on the device too.

That 15px is Obsidian's default is **inferred** from this repo's own host model rather than confirmed
against Obsidian's `app.css`, which is not readable from here. The check prints the title's measured
font size and line box on every run, so a device confirmation is a one-line comparison.

### Why AC-006 is Provisional and the other five are not

Asked of each row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?*

AC-001, AC-002, AC-003 and AC-005 measure a plugin-declared box through the shipped open-and-edit
path. The numbers are the stylesheet's own — a 44px floor, a frozen `34.8 / 8 / 12` rectangle, a
centre-line delta between two elements the plugin sizes. A device supplies nothing they read.
AC-004 is stronger than sound: it deliberately *simulates* an adversarial host stylesheet inflating
every input and re-measures underneath it, which is the failure mode the absent `app.css` creates,
modelled rather than ignored.

AC-006 is the one that inverts. Its 0.9px is not the plugin's number; it is the plugin's number
*given a host token the harness supplies*. `--font-ui-medium` belongs to Obsidian, the title declares
no line-height, and the whole offset is linear in that token — 2.4px at 13px, 0.9px at 15px, −1.2px
at 18px, by this phase's own sweep. The harness pins 15px from `tools/screenshots/theme.css`, which
the paragraph above concedes is inferred and not read from `app.css`.

So the check can fail, and it did fail at 2.4px — but its *pass* is 0.1px of headroom standing on an
unverified host value, and a theme or a platform that moves the token takes it red. That is the same
shape as `022`'s withdrawn AC-1 with the sign flipped: there the harness supplied a variable the
plugin never publishes and manufactured a green; here the harness supplies a token the host owns and
manufactures the margin. The correction shipped is right — the reasoning for keeping −11.2px stands
on its own, and no stylesheet declaration changed — so this is `Provisional`, not `Withdrawn`. It
closes when the goal's outstanding item does: `--font-ui-medium` read off a device.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No. Five criteria are `Met` and AC-006 is `Provisional` — its 0.9px is a function of a
host token the harness declares and this phase infers. The packet stays `Partial` for the older
reason too: none of this is operator-confirmed on device, and shipped, verified and confirmed are
three different states.

AC-006 closed **without a stylesheet change**. The criterion was failing a correct implementation,
which is one of the two banned shapes this program watches for, and the repair was to the page rather
than to the product.

The five met criteria all concern the number and currency editor and were each shown red on the tree
as received. AC-005 deserves a note of its own: **its first version passed the mistake it existed to
catch.** It asserted the desktop editor's `margin-top` was still `0px`, and unscoping both new
selectors left `margin-top` reading `0px` anyway — `--db-sheet-row-min-height` is declared only on the
sheet, so off it the declaration is invalid at computed-value time and falls back to the initial
value. Meanwhile the input rule **did** leak and shrank the desktop editor from 34.8px to 31px. The
rewritten check measures the rectangle and, under the same control, reports `31/6.1/8.2` against the
frozen `34.8/8/12` and exits 1.

AC-006 has the same shape from the other side, and it is the more expensive one to have got wrong.
AC-005's first instrument passed the defect it existed to catch; AC-006's environment **failed a
correction that is right on the device**. Both were invisible until something drove the shipped path
against a page that declares what the app declares.

`plan.md` ADR-002 offered two shapes and both are now declined on measurement rather than left open.

*A second literal for the title* would encode −12.6px, which is what the title's **fallback** box
wants. On a device that box is 21.75px, not 18.85px, so the literal would take the measured offset
from 0.9px to roughly 2.3px — it fixes the harness and breaks the device.

*Deriving the offset from the anchor* is the general answer and is correct at every host font, but
the only in-stylesheet form of it is a `calc()` over `--font-ui-medium`, a token the plugin does not
own. Where that token is absent the whole declaration is invalid at computed-value time and
`margin-top` falls back to `0` — measured at **13.6px** out, six times worse than the 2.4px it would
replace. That is the identical trap AC-005 documents one paragraph above, and writing a second
declaration with it into this stylesheet is a bad trade. The CSS-only version would also have to key
on the popover's column rather than on its anchor, so a config whose title field is not `file.name`
would hand a title's correction to an ordinary value row.

The decision is therefore to **keep −11.2px**, deriving one correction from `--db-font-lg`, because
at the shipped host values the two anchors' line boxes agree to 0.15px and one number genuinely
serves both. A per-anchor correction belongs in the placement path, where the anchor is in hand and
no host token has to survive a cascade; that is a change to that path, not to this stylesheet.

### Named, measured, not criteria of this packet

`spec.md` §12 records five findings this phase measured and did not fix: the `setPosition`
border-box/padding-box conversion (**sheet-only**; desktop measures 0.00 displacement in both axes),
the desktop record panel's identical alignment defect, the date editor reaching y=1001 against a sheet
bottom of 848.8, the type shrinking two steps at the moment of tap, and the 13px input against the
16px iOS zoom floor. Each carries its number and none is counted here.
<!-- /ANCHOR:closure -->
