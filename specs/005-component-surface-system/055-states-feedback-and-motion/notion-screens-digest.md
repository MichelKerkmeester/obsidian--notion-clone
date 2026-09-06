---
title: "Notion Screens Digest: Empty, Loading, Error and Offline States, Toasts and Undo, Confirmations, Onboarding Hints, Skeletons, Motion and Transitions"
description: "A read of the Notion Mobbin harvest against the seven-state vocabulary this phase owns: which screens were opened, what each measures, the recurring patterns, and where they diverge from our tree and from the Anytype-derived design-trueup."
date: 2026-09-06
surface: "005-component-surface-system/055-states-feedback-and-motion"
phase: "055-states-feedback-and-motion"
---

# Notion Screens Digest: States, Feedback and Motion

> Companion read to `design-trueup.md` (Anytype). Method: measure the Notion capture or the current
> tree, then compare. Nothing here amends a decision; `design-trueup.md`'s Anytype-derived rulings
> stand unless named as amended in §5. Every claim is anchored to a screen id and `mobbin_url`, or to
> a `file:line` in this tree, per `repo-rules/evidence-and-proof.md`.

---

## 1. Selection

**65 screens opened**, from `screenshots/notion/{ios,web}/states/`, `onboarding/`, `web/dialogs/`, and
nine flow folders, widened by grepping the per-file index for the query words the surface implies
(`empty`, `loading`, `error`, `offline`, `success confirmation`, `delete confirmation`, `trash`,
`onboarding`, `welcome`, `notifications`). All are the light theme: **OBSERVED** — every file opened
rendered a white/light-grey canvas, and a check of the two theme-switching flow folders
(`web/flows/switching-to-dark-mode{,-2,-3}`, 20 files, none in this surface's folders) found the one
post-switch dark frame in the harvest is a template-gallery screen, not a states/onboarding/dialogs
screen. **Notion's harvest carries no dark-theme capture of this surface at all** — unlike
`screenshots/anytype/`, no Notion filename carries a `-dark`/`-light` suffix, so the gap is total, not
partial, and is recorded as a pattern-level open question in §6 rather than assumed absent.

**By folder:**

| Folder | Read | Of | Note |
|---|---:|---:|---|
| `ios/states/` | 21 | 21 | All files in the folder |
| `web/states/` | 4 | 4 | All files in the folder |
| `web/dialogs/` | 6 | 6 | All files in the folder |
| `ios/onboarding/` | 4 | 34 | `login`, `onboarding`, `welcome`, `templates` slugs, one each |
| `web/onboarding/` | 4 | 8 | `onboarding`, `signup`, `welcome` slugs |
| `ios/flows/deleting-a-page/` | 3 | 3 | All files |
| `ios/flows/deleting-a-view/` | 4 | 5 | Skipped `-03` (duplicate confirm-sheet framing of `-02`) |
| `ios/flows/moving-a-page-to-trash/` | 2 | 2 | All files |
| `ios/flows/reverting-an-action/` | 3 | 3 | All files |
| `ios/flows/searching-offline-pages/` | 1 | 3 | Skipped `-02`/`-03`: identical list to `-01`, no offline signal |
| `ios/flows/home/` | 2 | 6 | `-01` (hint card), `-05` (dense list); rest are scroll duplicates |
| `web/flows/deleting-a-page/` | 2 | 2 | All files |
| `web/flows/deleting-a-page-permanently/` | 3 | 5 | Skipped `-04`/`-05`: same trashed-page banner as `-02`/`-03` |
| `web/flows/trash/` | 2 | 2 | All files |
| `web/flows/trash-2/` | 1 | 3 | `-02` (trash popover + retention note); `-01`/`-03` are the underlying page |
| `web/flows/trash-3/` | 2 | 2 | All files (home screen + trash popover) |
| `ios/sheets/`, `web/flows/switching-to-dark-mode*` | 0 | 15 | Referenced for context (§ above), not opened as primary evidence |

**Skipped as off-topic or duplicate, and why**, per the README's own loose-grouping caveat: three
`ios/states/empty-*` files (`-04` chat empty state, `-14` blank-page editor) and one
`ios/states/empty-database-*` file (`-09`, a populated to-do list) are the query's relevance noise the
README warns about — kept in the table below because two of them (a second "no chats yet" duplicate,
and a populated page) are the concrete evidence *for* that noise, not filtered silently. `ios/states/`
`offline-02`/`-07` and `ios/flows/searching-offline-pages` all resolve to the same feature (a cached
"Offline pages" list), not a network-connectivity state — noted once here rather than three times in
the pattern table.

**Scale caveat.** iOS captures are 299×678/680px, web captures 768×521/523px — Mobbin-served
thumbnails, confirmed by direct `PIL.Image.size` reads (**OBSERVED**) on ten sampled files. Unlike
`design-trueup.md`'s Anytype iOS reading, this index states no device-pixel ratio for Notion, so the
pixel figures below are **relative and comparable to each other**, not a stated points conversion.
Colour hex values were sampled with the same per-pixel method `design-trueup.md` uses (`PIL`, exact
RGB, not eyeballed); pixel counts are given wherever a "zero occurrences" claim is load-bearing, the
same discipline `design-trueup.md` §1 C3 uses for Anytype's menus.

---

## 2. Per-screen table

One row per screen opened. "Measured" carries what could be read at capture scale; a screen with
nothing measurable (a plain menu) says so.

| ID (mobbin screen) | Platform | Theme | Path | Content | Measured |
|---|---|---|---|---|---|
| `e186b09b` | iOS | light | `ios/states/…empty-01…` | "Offline pages" list, no downloaded pages | Centered grey line "No pages available", no icon, no action |
| `1885a9b9` | iOS | light | `ios/states/…empty-02…` | Page History with no snapshots yet | Top-anchored (not vertically centered) one-line message, no icon |
| `dd3458f6` | iOS | light | `ios/states/…empty-04…` | AI "Chats" tab, no chats | Icon (sparkle) + bold title "No chats yet" + body + text-link CTA "Start new chat" |
| `15f3126a` | iOS | light | `ios/states/…empty-09…` | A page currently in Trash | Full-width red banner pinned under the nav bar, two outline pill buttons "↩ Restore page" / "🗑 Permanently delete"; banner colour **#D9615C** (dominant of 1,274 sampled px) |
| `e1f4852b` | iOS | light | `ios/states/…empty-14…` | Blank new page, editor focused | Off-topic for "empty state": a populated editor with slash-menu suggestion chips, no empty-state chrome |
| `a984fe81` | iOS | light | `ios/states/…empty-database-01…` | AI "Chats" tab (duplicate of `dd3458f6`) | Same icon/title/body/link shape |
| `0192421d` | iOS | light | `ios/states/…empty-database-03…` | In-page search, no results | Centered grey "No Results", no icon, search bar pinned at the bottom |
| `d658e522` | iOS | light | `ios/states/…empty-database-09…` | A populated to-do list page | Off-topic: no empty state, kept as evidence of query noise |
| `53f4023b` | iOS | light | `ios/states/…error-02…` | Embed error modal | Dimmed overlay, white card, bold centred title, 3 stacked full-width buttons: link-style "View guide", bordered "Copy debugging information", bordered "Cancel" |
| `f318b5e0` | iOS | light | `ios/states/…error-03…` | Pop-up-blocked error modal | Same chrome, 1 sentence + 1 full-width bordered "OK" |
| `a335360d` | iOS | light | `ios/states/…error-08…` | Persistent "Working offline" banner over page content | Dark pill banner near the bottom of the content column: "Working offline / Last sync on {date}" — a mistagged `offline`, not `error`, capture |
| `a059332d` | iOS | light | `ios/states/…error-09…` | Delete-account confirm (full page, not a sheet) | Red exclamation icon, bold title, secondary body, boxed workspace-impact summary, type-your-email-to-confirm input, full-width **filled** red button, text-link "Cancel" below |
| `9748e66c` | iOS | light | `ios/states/…error-11…` | Inline embed error chip | Icon-label pill inline in page body: "Embed Go… ⚠ Unrecognized URL ›" — no modal, no dismiss |
| `47ecb9cf` | iOS | light | `ios/states/…loading-01…` | Full-page provisioning | Small spinner + "Getting set up…", vertically centred, blank canvas |
| `19af1746` | iOS | light | `ios/states/…loading-04…` | AI meeting-notes recording | Bottom pill "⏱ Transcribing…", persistent input-bar-style dock |
| `a483c1af` | iOS | light | `ios/states/…loading-06…` | AI notes: multi-step progress | In-card checklist (✓ done step, spinner in-progress step) **and** a bottom bar "Transcribing meeting / Keep the app open…" with a spinning icon — two loading affordances at once |
| `a36c0cce` | iOS | light | `ios/states/…loading-08…` | AI notes: earlier step of the same flow | Same two-tier pattern, step label "Uploading audio", bottom bar with a ring icon |
| `ccc30760` | iOS | light | `ios/states/…offline-02…` | "Offline pages" search, populated | Not a network state — a cached-pages feature list |
| `712f6960` | iOS | light | `ios/states/…offline-07…` | "Offline pages" full list | Same feature, no empty/error framing |
| `c839e4dc` | iOS | light | `ios/states/…success-01…` | Password-changed confirm | Sheet card over dimmed settings page: ✓ icon, bold title "Your password has been set", body, dismiss ✕ top-right, no action button |
| `1325061c` | iOS | light | `ios/states/…success-02…` | Purchase-successful confirm | Bottom sheet (rounded top), "You're all set / Your purchase was successful.", one full-width filled-blue "OK" |
| `0725c79d` | web | light | `web/states/…empty-01…` | Fresh database, table view | No empty-state block: faint grey skeleton rows + an "+ New page" row is the only affordance |
| `7d42dbdc` | web | light | `web/states/…empty-02…` | Modal over "Welcome to Notion" page | Blank white card, one static icon centred, no text, no button — an unresolved-content placeholder, not a designed empty state |
| `e4e12e4b` | web | light | `web/states/…empty-03…` | Blank new page | Greyed placeholder title + bottom "Get started with" row of 5 pill shortcuts (Ask AI, AI Meeting Notes, Database, Form, Templates) |
| `120f4d36` | web | light | `web/states/…empty-04…` | "My Tasks", filtered to nothing | **Genuine desktop empty-state block**: checklist icon (stroke colour ≈ **#A9A9A9**, achromatic), "No matching tasks.", text-link "+ New task" below |
| `e0bcd679` | web | light | `web/dialogs/…command-palette-01…` | AI chat, empty history | Off-topic (AI chat): "Meow… what's your request?" hero prompt + input + suggestion pills; small "No chats yet" sub-empty-state under "Recent chats" |
| `af8c3aec` | web | light | `web/dialogs/…dialog-01…` | Post-signup collaborate hint | Small modal, ✕ top-right, one workspace row, full-width filled-blue CTA "Create a new workspace" |
| `ba93ce22` | web | light | `web/dialogs/…dialog-02…` | Cancel-trial confirm | Title, icon-list "what you lose", **0 reddish px in the two-button footer** (checked directly, region-scanned) — both buttons neutral: light/bordered primary "Yes, cancel trial on {date}", bordered "Go back" |
| `ad51a8b8` | web | light | `web/dialogs/…dialog-03…` | Agent-builder side panel | Off-topic for states, but its own "No preview yet" line is a third small inline empty state |
| `27ae8065` | web | light | `web/dialogs/…dialog-04…` | Import-in-progress modal | Icon pair + arrow, bold title "Import in progress…", body explains it emails on completion, text-link "Go back to Notion" — **no progress bar**, message-only loading modal |
| `9150b32f` | web | light | `web/dialogs/…dialog-05…` | Import-a-file confirm | Icon, title, selected-file chip with ✕, destination dropdown, full-width filled-blue "Continue", text-link "Learn about imports" |
| `1892ba9a` | iOS | light | `ios/onboarding/…onboarding-01…` | Sign-up method picker | 6 stacked full-width outline rows (Google/Apple/Microsoft/Passkey/SSO/Email) |
| `8a755986` | iOS | light | `ios/onboarding/…onboarding-06…` | "How do you want to use Notion?" | 3 selectable outline cards, primary CTA rendered **pale/disabled** until a card is picked |
| `df6a041c` | iOS | light | `ios/onboarding/…welcome-01…` | "Work across devices" | Centred toast-like card "Getting ready… ⟳" floats over the step, primary CTA below is **disabled (darker-blue fill)** while it resolves |
| `4bf5c754` | iOS | light | `ios/onboarding/…templates-02…` | Database-template picker | Two rows (Checklist, Empty=default) + "+ New template", no state signal |
| `a5950f8e` | web | light | `web/onboarding/…onboarding-01…` | "Welcome to Notion" seed page | Callout card + unchecked-checkbox task list, no dismiss |
| `2a8c0c5d` | web | light | `web/onboarding/…onboarding-03…` | Same page, localized (ja) | Confirms the seed page is locale-aware; no new state |
| `09c6a582` | web | light | `web/onboarding/…signup-01…` | Desktop-app upsell interstitial | Icon, bold title, 3-item bullet list with faint icons, illustration, full-width filled-blue primary + full-width light-grey "Skip for now" |
| `c237ff84` | web | light | `web/onboarding/…welcome-01…` | Same seed page, action just taken | **Small dark toast bottom-left: "Successfully sent"** — the one web success-toast capture in the whole harvest |
| `8897295c` | iOS | light | `ios/flows/deleting-a-page/…01…` | Trash list | Rows: icon + title/subtitle + restore-arrow icon + trash icon, no confirm on this screen |
| `28751c29` | iOS | light | `ios/flows/deleting-a-page/…02…` | Permanent-delete confirm sheet | "Are you sure you want to permanently delete this page?" + 2 stacked full-width buttons: **red text on white/bordered** "Permanently delete", plain bordered "Cancel" |
| `3779c4f7` | iOS | light | `ios/flows/deleting-a-page/…03…` | Home after permanent delete | No toast, no undo — matches "permanent" semantics |
| `838f7123` | iOS | light | `ios/flows/moving-a-page-to-trash/…01…` | Page "Actions" sheet | "Move to Trash" row: trash icon + plain black text, **0 reddish px** (full-frame scan) |
| `7a0e976e` | iOS | light | `ios/flows/moving-a-page-to-trash/…02…` | After tapping it | **Toast, no confirm shown**: dark pill "Moved to Trash  Undo", bbox **139×33px**, bg **#0F0F0F**, symmetric 80px margins either side (exactly centred) |
| `07cec641` | iOS | light | `ios/flows/deleting-a-view/…01…` | View list | 3 rows + "New view"/"New data source" adders |
| `2f0d2563` | iOS | light | `ios/flows/deleting-a-view/…02…` | "View options" sheet | 9 rows, last is "Delete view" in **red text**, others plain |
| `348fd2b7` | iOS | light | `ios/flows/deleting-a-view/…04…` | Delete-the-last-view confirm | Trash icon, title, **two radio-selectable consequence cards** ("Delete view only" vs "Delete view and data source", the destructive one pre-selected and red-tinted), then full-width **filled** red "Delete view and data source" (**#E66459**, 670 sampled px), bordered "Cancel" |
| `56d9b984` | iOS | light | `ios/flows/deleting-a-view/…05…` | After confirming | Toast, **no Undo offered**: "Deleted view and New data source data source" (Notion's own string bug) |
| `2aeeb92a` | iOS | light | `ios/flows/reverting-an-action/…01…` | AI chat, action just taken | Baseline frame before revert is opened |
| `4e97a1c9` | iOS | light | `ios/flows/reverting-an-action/…02…` | Undo popover | Small 2-row popover anchored above the input bar: "✕ Cancel" / "🗑 Confirm undo" (red text), not a sheet |
| `5415dd8d` | iOS | light | `ios/flows/reverting-an-action/…03…` | After confirming | Inline "Reverted" badge chip next to the affected item, and "Changes reverted" replaces the prior status text — an **inline label, not a toast** |
| `dddf6bca` | iOS | light | `ios/flows/searching-offline-pages/…01…` | Offline-pages list with a filter chip | Confirms the cached-pages reading above |
| `56bedefe` | iOS | light | `ios/flows/home/…01…` | Home, feature announcement | Dismissible hint card: icon, bold title "Introducing AI Meeting Notes", body, ✕ top-right, full-width filled-blue CTA |
| `0e1837f1` | iOS | light | `ios/flows/home/…05…` | Home, dense recents list | No state signal; row density reference only |
| `21f47747` | web | light | `web/flows/deleting-a-page/…01…` | Page "…" context menu | "Move to Trash" plain row among 20+ others, no colour, no separator emphasis beyond the section rule |
| `56f376d3` | web | light | `web/flows/deleting-a-page/…02…` | After clicking it | **Toast, no confirm shown**: dark pill "Moved to Trash  Restore", bbox **≈100×26px**, bg ≈**#2B2B2B** (anti-aliased core), left-aligned under the content column (not viewport-centred) |
| `3955648d` | web | light | `web/flows/deleting-a-page-permanently/…01…` | Trash search popover | List rows: icon + title/subtitle + restore-arrow + trash icon, tabs "All pages / In current page / Last edited by me" |
| `4e2f2124` | web | light | `web/flows/deleting-a-page-permanently/…02…` | A page open while it sits in Trash | **Persistent full-width red banner** at the very top: "This page is in the Trash." + two bordered white-on-red buttons "Restore page" / "Delete permanently"; banner colour **#DB615C** (dominant of 2,623 sampled px, matches iOS `empty-09`'s #D9615C within webp-compression noise) |
| `97a5dcce` | web | light | `web/flows/deleting-a-page-permanently/…03…` | Same banner, different page | Confirms the banner is a per-page persistent state, not a one-off toast |
| `b6260a73` | web | light | `web/flows/trash/…01…` | Sidebar Trash view, empty page selected | No content-area empty state distinct from `empty-01`'s skeleton pattern |
| `d32a48bc` | web | light | `web/flows/trash/…02…` | Trash view populated | Standard table rows, no special empty/error framing |
| `b1cbe4f8` | web | light | `web/flows/trash-2/…02…` | Trash popover with retention note | Footer line: "Once a page has been in Trash for 30 days, it will be automatically deleted." |
| `8d3114c7` | web | light | `web/flows/trash-3/…01…` | Home, "Good afternoon" greeting | Recently-visited card row; no state signal |
| `ba35284f` | web | light | `web/flows/trash-3/…02…` | Same home, Trash popover open | Same list chrome as `trash-2` |

---

## 3. Patterns

Ordered by how much of the surface's seven-state vocabulary each one defines.

### P1 — Reversible destructive actions skip the confirm; irreversible ones keep it, and the toast's Undo/Restore tracks exactly that split

**Screens:** `838f7123`, `7a0e976e` (iOS single-item trash: no confirm → toast + Undo) against
`2f0d2563`, `348fd2b7`, `56d9b984` (iOS view+data-source delete: confirm *with* a consequence picker →
toast, **no** Undo); `21f47747`, `56f376d3` (web single-item trash: no confirm → toast + Restore).

**Measured.** Trash-move toast: iOS bbox 139×33px, bg `#0F0F0F`, action word "Undo" set inline in the
same pill, not a separate button; web equivalent bbox ≈100×26px, bg ≈`#2B2B2B`, action word
**"Restore"**, not "Undo" — the same reversible action is labelled differently by platform. The
data-source-delete confirm carries a **filled** red button (`#E66459`) and a **binary radio choice**
between the reversible and irreversible consequence before the button is even reachable; its resulting
toast drops the action slot entirely.

**Why it ranks first.** This is the exact axis `goal.md`'s 2026-09-06 amendment (E4: "No confirm for
single delete, Undo toast") already rules on, and Notion's own product independently lands on the same
split — reversible-with-a-safety-net skips the gate, irreversible earns it — which is corroborating
evidence for a ruling this packet made from the operator's word alone, not from a capture.

### P2 — The destructive *row* is colour-neutral; the destructive *button* (in a confirm) is red, text-only on iOS, filled on data-loss

**Screens:** `838f7123` (0 reddish px, "Move to Trash" menu row), `21f47747` (same, web context menu)
against `28751c29` (red **text**, white/bordered button, "Permanently delete") and `348fd2b7` (red
**fill**, `#E66459`, "Delete view and data source").

**Measured.** Three distinct destructive treatments on iOS alone: a neutral menu row (0 px), a
text-only red confirm button (page delete), and a filled red confirm button (view+data-source delete).
The differentiator reads as reversibility-again, not platform: the page-delete's "permanent" framing
still gets the lighter (text-only) red, while the view-delete's framing that destroys a data source and
every page under it gets the heavier (filled) red. Web's own destructive confirm (`ba93ce22`, cancel a
paid trial) has **0 reddish px anywhere in its two-button footer** — a financial/plan action, not a
delete, and it stays fully neutral.

### P3 — A page sitting in Trash carries a persistent banner, not a modal or a toast, and it is cross-platform identical

**Screens:** `15f3126a` (iOS), `4e2f2124`/`97a5dcce` (web).

**Measured.** iOS banner colour `#D9615C` (dominant of 1,274 px), web banner colour `#DB615C`
(dominant of 2,623 px) — the same red within webp-compression noise. Both carry exactly two
outline/bordered pill buttons in white-on-red: a restore action and a permanent-delete action, pinned
at the very top of the page, always visible while the page is open (not a dismiss-and-forget toast).
This is a *sustained* destructive-adjacent state with its own chrome, distinct from every other row in
this digest — none of our seven states currently names "the object you're viewing is itself deleted."

### P4 — The desktop empty state is real, and it is icon + one line + a text-link action, not a full "card"

**Screens:** `120f4d36` (My Tasks, no matches) against `0725c79d` (fresh database: skeleton rows, no
block at all) and `e4e12e4b` (blank page: suggestion-chip row, not an empty-state block).

**Measured.** `120f4d36`'s icon stroke samples ≈`#A9A9A9`, achromatic, small (roughly a 24×24 glyph at
capture scale); the action is a text link, not a button. This directly narrows Anytype's own C4/C6
finding ("the desktop renders no empty-state block") — that finding is Anytype-specific, not a
platform-general truth. Notion's desktop *does* render one, and it is lighter than Notion's own iOS
three-tier ladder (`design-trueup.md`'s reading of `sheet-cell-multiselect-empty` etc.), landing closer
to Anytype's iOS "tier 2" (illustration + one line, no title/body split) than to its own iOS "tier 3."

### P5 — Loading is two-tiered on a multi-step operation: an in-place step list plus a persistent bottom bar

**Screens:** `a483c1af`, `a36c0cce` (AI meeting notes: upload → transcribe).

**Measured.** The in-card list uses a checkmark for the completed step and a spinning glyph for the
active one (a real step tracker, not a single spinner); the bottom bar restates the same state in one
line ("Uploading meeting…", "Transcribing meeting…") with its own independent spinner/ring icon and the
instruction "Keep the app open for faster processing" — redundant by design, because the bar survives
scrolling the card out of view. `27ae8065`'s import modal is the web analogue at a coarser grain: one
message, no step list, no progress bar, and an explicit "you can leave, we'll email you" release valve.

### P6 — An undo/revert affordance is not always a toast: a menu row, a small popover, or an inline label all carry it

**Screens:** `7a0e976e`/`56f376d3` (toast action slot), `4e97a1c9` (2-row popover anchored to a
toolbar: Cancel / Confirm undo), `5415dd8d` (inline "Reverted" badge + "Changes reverted" replacing
prior text, no toast at all).

**Why this matters.** `design-trueup.md`'s own "half seen" finding for `success.notice`/`undo` already
named a persistent menu-row undo as a *second* placement worth recording for later, sourced from one
Anytype capture (`sheet-object-more`). This digest adds a *third* and *fourth* shape from Notion: a
scoped confirm-style popover for undoing a specific AI action, and a **replace-the-text-in-place**
pattern that needs no dismissable surface because it isn't transient — the state simply *is* now
"reverted."

### P7 — Onboarding hints are dismissible cards with one CTA, and disabled buttons gate on precondition, not on submission

**Screens:** `56bedefe` (feature-announcement card, ✕ dismiss + 1 CTA), `af8c3aec` (post-signup hint,
✕ dismiss + 1 CTA), `09c6a582` (upsell interstitial, primary + "Skip for now" secondary — no ✕),
`8a755986` (disabled "Next" until a card is picked), `df6a041c` ("Getting ready…" toast-shaped overlay
+ disabled CTA while a background step resolves).

**Measured.** Every onboarding hint in this sample carries exactly one primary action; the two that
offer an out (`09c6a582`) spell it as a full-width secondary button, never a text link, unlike the
dismiss pattern elsewhere in this digest (`af8c3aec`, `dialog-04`, `dialog-05`) which is consistently
a text link. Disabled-button colour is a flatter, lower-contrast fill of the same hue (pale blue for
`8a755986`, darker-saturated blue for `df6a041c`) rather than a grey — two different "disabled" tints
for two different reasons (no selection yet vs. an async step in flight).

### P8 — Error surfaces split by blast radius: a blocking modal for a failed action, an inline chip for a stale reference

**Screens:** `53f4023b`, `f318b5e0` (modal, dimmed overlay, stacked full-width buttons) against
`9748e66c` (inline pill, no modal, no dismiss, lives permanently in the page until the source is fixed).

**Measured.** Both modals put the message above the buttons and never colour the buttons red — an
embed failure and a popup-blocked failure are read as informational, not destructive, so neither takes
the P2 red treatment. The inline chip carries a warning triangle (not red) plus a chevron, implying it
is itself actionable (tap to reconfigure), unlike the plain text failures in `empty-state-renderer.ts`.

### P9 — "Offline" in this harvest names a feature (cached pages), not a state; no network-loss capture exists on either platform

**Screens:** `e186b09b`, `ccc30760`, `712f6960`, `dddf6bca`, and the `a335360d` mistagging.

This is a negative pattern, recorded because the query names could otherwise be read as coverage they
are not: five files tagged `offline` or found via `Notion offline`/`Notion searching offline pages`
all show the same cached-pages-for-offline-reading feature, and the one screen with an actual
connectivity-lost banner (`a335360d`, "Working offline") was filed under `error` by the query that
found it, not under `offline`. **Neither platform's connectivity-loss chrome beyond that one banner is
in the harvest.**

---

## 4. Divergences from our surface

For each pattern, what the current tree does, cited by `file:line`, and where design-trueup.md's
figure is stale against it — **OBSERVED** by direct `grep`/`sed` read of this worktree, 2026-09-06,
not carried over from the doc.

**P1 (reversible vs. irreversible confirm split).** `row-menu.ts:166-176`'s single-row delete already
carries the comment *"No confirm here: Anytype parity for a single row is delete-then-Undo… it still
confirms when the row can't be snapshotted for the toast's Undo to restore"* — the E4 ruling
`goal.md`'s 2026-09-06 amendment records as the day's decision is **already implemented**, not pending.
`database-view.ts:4962`'s bulk `deleteSelectedRows` is unchanged and keeps its confirm, matching P1's
irreversible branch. **Gap against Notion:** nothing in our tree offers a *radio-choice consequence
picker* like `348fd2b7`'s "Delete view only" vs "Delete view and data source" — our confirm primitive
(`ConfirmModal`, `modals/confirm-modal.ts:35`) supports a `secondaryButton` option (`:28`) but not a
selectable-choice body; this is a genuine capability gap if a future surface needs to disambiguate two
destructive outcomes the way Notion's view-delete does.

**P2 (colour-neutral row, red confirm button).** `bulk-edit-field-menu.ts:31-38` now carries the
never-empty floor (`t("menu.noActions")` fallback row) that `design-trueup.md`'s Item 8 called the one
real gap — **also already closed**, contradicting `goal.md`'s "Today: 1 file can violate it" status
line. `ConfirmModal`'s `danger` option (`confirm-modal.ts:28`, `:74`) drives `mod-warning` on the
confirm button, a host-theme class, not a hard-coded hex — consistent with `design-trueup.md`'s ruling
that `#FF4A4D`/`#E1E1E1` are not adopted because this is a themed host. **No gap**: our one confirm
button doesn't distinguish "text-only red" from "filled red" the way Notion's two confirms do, but
`design-trueup.md` already named that as Anytype's own platform split (desktop neutral vs iOS red+icon)
and resolved it as "pair colour with an icon, don't split further" — Notion's *third* variant (two
different reds for two severities within one platform) is new evidence, not yet ruled on; flagged in §6.

**P3 (persistent in-trash banner).** **No equivalent exists in our tree.** `getEmptyStateReason`
(`empty-state-renderer.ts:233`) and its 14 `EmptyStateReason` members (`:24-39`, now including
`group-relation-deleted` at `:38` and `source-missing` at `:39` — both **already implemented**, at
`:206` and `:211` respectively, and wired at `database-view.ts:10665` and `:8267` — contradicting
`design-trueup.md`'s "twelve reasons ship" and `goal.md`'s "0 of them is the deleted-relation state")
cover *why a view has nothing to show*, not *this exact object is itself in Trash and I'm looking at
it*. Our row-menu already offers Move to Trash (`row-menu.ts:172`) and the file-level Trash toast
carries Undo, but nothing renders a sticky "you're viewing a trashed item" banner if a user navigates
back into one. This is a real, unaddressed gap this phase does not own fixing (no requirement in
`goal.md` §3 asks for it) but should be named for the next phase that touches trash/restore.

**P4 (desktop empty-state ladder).** `empty-state-renderer.ts:145-149`'s `no-database` (icon, title,
body, four starter presets) already exceeds Notion's `120f4d36` shape (icon + one line + text link) —
consistent with `design-trueup.md`'s own reading that ours is richer than the reference for this
flavour. **No new gap**; P4 corroborates the existing ruling rather than contesting it.

**P5 (two-tier loading).** `db-skeleton-loader` (`database-view.ts:11847`, CSS `styles.css:2709-2755`)
is a single-tier shimmer, not a step tracker — matching `design-trueup.md`'s "the row is complete
today" verdict for the `loading` state, since no requirement in this phase's vocabulary asks for a
multi-step progress list. Recorded as a pattern this phase does not own building.

**P6 (undo shape variety).** The toast component (`src/views/toast.ts`, header comment: *"a message
promising 'Undo to keep it a gallery' had nowhere to put the Undo… gives every owned call site one
surface"*) **is already built and wired**: `showToast`/`ToastAction`/`ToastHandle` are consumed at
`database-view.ts:2718-2720` (`notice.galleryMigrated`, `src/i18n.ts:1473` — not `:1455`, the doc's
line has drifted 18 lines) and `:8369` (deleteRow's undo). This closes the exact gap `goal.md`'s
directive opens with ("a migration notice that promises an Undo its plain `Notice` cannot carry") —
**already fixed, not open**. CSS (`styles.css:2724-2860`) matches the Anytype-measured toast almost
exactly: 384px width (`:2727`), 12px radius (`:2742`), 64px min-height (`:2739`), action row
`gap`/`margin-top` at the measured values (`:2833-2834`), `:empty` auto-hide (`:2837`), collapsed
stacking (`:2766`) — the `design-trueup.md` adoption table is faithfully implemented. **Gap against
Notion:** neither of Notion's non-toast undo shapes (`4e97a1c9`'s scoped popover, `5415dd8d`'s
replace-in-place label) has a counterpart; not required by any `goal.md` §3 criterion, named for the
research loop.

**P7 (onboarding hints).** No componentized onboarding-hint-card exists in `src/`; this phase's
`goal.md` §1 directive doesn't scope onboarding UI (its four owned `050` items are 5/8/9/14, none of
which is onboarding). Recorded as **out of this phase's scope**, not a gap this phase should close.

**P8 (error split by blast radius).** `error` today is two shapes (`empty-state-renderer.ts:36`'s
persistent `read-failed` card, `showOperationResult`'s transient rail,
`database-view.ts:9433-9437` — this citation still resolves at that line, checked directly) plus 242
bare `new Notice(` call sites (`grep -rn "new Notice(" src --include="*.ts" | grep -v test`,
**recounted 2026-09-06: 242**, not `goal.md`'s 247 — a small drift, five sites closed since that count
was taken). Neither of our two shapes is a blocking modal; Notion's `53f4023b`/`f318b5e0` are. Not a
gap this phase's criteria ask to close (no AC names a blocking error modal), named for the research
loop.

**Motion.** `styles.css:142-146` already defines all five true-up tokens
(`--db-motion-fast/-surface/-sheet/-emphatic/-scale-from`) at exactly `design-trueup.md`'s decided
values (200ms ease-out for `-surface`, 0.98 for `-scale-from`, etc.) — **the whole motion leg has
landed**. The untokenized-`120ms` census is now **7** occurrences (`grep -c "120ms" styles.css`),
down from the doc's measured 78, and `var(--db-transition-fast)` now has **6** uses, down from 7 —
both **already migrated**, contradicting `goal.md`'s "Today: 42" status line entirely. No screen in
this digest measures motion (P5's note in §1 applies here too: a still cannot show a duration), so
nothing here contests `design-trueup.md`'s source-read values; this section only updates the tree-side
half of the comparison.

**One packet-level flag, not a screen finding.** Every citation above that contradicts `goal.md` or
`design-trueup.md`'s "Today" figures was verified directly against this worktree on 2026-09-06
(**OBSERVED**, not carried from either document — see `repo-rules/evidence-and-proof.md` §11: "where a
document and the code disagree, the code wins and the doc is now a defect"). The pattern is
consistent: every one of this phase's `goal.md` §3 completion criteria that reads "Today: 0" or
"Pending" in the version read for this digest already has its implementation in the tree. This digest
does not update those tracking documents — that is this phase's own T00x task, out of this digest's
scope — but the drift is large enough (an entire toast component, both restated empty-state reasons,
the full motion-token migration, and the E4 single-delete ruling) that treating `goal.md`'s "Today"
column as current would misstate the phase's status to whoever reads it next.

---

## 5. Anytype vs Notion

Named per the operator's standing rule: Anytype parity holds by default; a Notion refinement must not
silently undo a landed Anytype ruling.

- **Desktop empty-state existence.** Anytype: no desktop empty-state block exists anywhere
  (`design-trueup.md` C4/C6, confirmed desktop-scoped). Notion: a real one exists (P4, `120f4d36`).
  **No conflict** — `design-trueup.md`'s finding was already scoped to Anytype specifically
  ("Desktop-scoped… the phone renders three different ones"), and this digest's P4 finding sits
  alongside that scoping rather than contradicting it. Nothing to reopen.

- **Destructive-row colour.** Anytype: desktop neutral (0 reddish px, `design-trueup.md` C3), iOS red
  text + red icon. Notion: menu **row** neutral on both platforms (P2, `838f7123`, `21f47747`, 0 px
  each), but the **confirm button** goes red on iOS in two different weights (text-only vs filled) and
  stays neutral on the one web confirm captured (`ba93ce22`, a plan-cancellation, not a delete).
  **Refines, doesn't conflict**: `design-trueup.md`'s ruling was "wherever a destructive action is red,
  it carries a matching icon" — a row-level rule. Notion's evidence is about the *confirm button*,
  which our `ConfirmModal` already handles as one `danger` boolean → `mod-warning` (host-owned red).
  Whether that boolean should have two weights is new evidence, not a reopened ruling — recorded as an
  open question, §6.

- **Undo placement.** Anytype: a persistent menu row (`design-trueup.md`'s `success.notice` row, one
  capture). Notion: toast action slot (P1) **and** a scoped popover **and** an inline replace-in-place
  label (P6) — three more shapes. **No conflict**: `design-trueup.md` explicitly deferred the menu-row
  placement to "the next phase," naming it "the model rather than built." Nothing here proposes
  building any of the four shapes now; all are named for the research loop in §6.

- **Toast terminology.** Anytype's source carries no user-facing undo string to compare (its evidence
  was structural: container, sizing, stacking — `design-trueup.md` §2). Notion splits **"Undo"**
  (iOS) from **"Restore"** (web) for the identical action (P1). Our tree uses "Undo" uniformly
  (`toast.ts`'s `ToastAction.label` is caller-supplied text, not a fixed string, so nothing forces
  either wording). **No ruling to reopen** — this is new, and named as an open question.

- **Motion.** Anytype ships no `prefers-reduced-motion` story at all (`design-trueup.md` §2, §5, C5)
  and its toast enters/exits on one `0.2s` (§2). Notion's captures cannot speak to motion (P5's note:
  a still is not evidence of a duration) — **no comparison is possible**, and none is claimed. The
  tokens already in `styles.css:142-146` remain Anytype-sourced, unchanged, unconflicted.

---

## 6. Open questions for the research loop

1. **Two red weights on one platform.** Notion's iOS shows a text-only red confirm (`28751c29`) and a
   filled red confirm (`348fd2b7`) differentiated by how much the action destroys. Our `ConfirmModal`
   has one `danger` boolean. Is a second severity tier worth adding, and at what threshold (data-source
   loss vs. single-object loss, the same line Notion appears to draw)?
2. **Radio-choice consequence picker.** Should the confirm primitive (`051`'s, per `goal.md` D5) grow a
   selectable-body option for the rare case where a destructive action has two distinct outcomes (view
   only vs. view+data), on `348fd2b7`'s evidence? No current requirement asks for this.
3. **In-trash persistent banner.** Neither platform's reference shows Anytype building this (no Bin
   concept was in scope for `design-trueup.md`'s sweep), but Notion builds it identically on iOS and
   web (P3). Is "the object I'm viewing is itself deleted" a state this vocabulary should name, given
   our own row-menu already offers Move to Trash?
4. **Undo-word consistency.** Notion says "Undo" on iOS and "Restore" on web for the same reversal.
   Should our toast's caller-supplied action labels be audited for the same cross-surface consistency
   this packet's D5 asks of the component itself?
5. **Two-tier loading for multi-step operations.** Is there a current or planned surface in this
   plugin with a multi-step async operation (import, bulk transform) that would benefit from Notion's
   step-list-plus-persistent-bar pattern (P5), or does the single shimmer already cover every case we
   have?
6. **Dark-theme evidence gap.** This entire harvest is light-theme only for the states/onboarding/
   dialogs surface (§1). Should a follow-up Mobbin sweep specifically target Notion's dark mode for
   this surface, or is the Anytype dark-theme evidence (which does exist) sufficient given `design-
   trueup.md` already treats Anytype as the primary reference and Notion as refinement-only?
7. **`goal.md`/`design-trueup.md` staleness.** This digest found five load-bearing "Today" figures in
   `goal.md` (Items 8 and 9's gaps, the toast component, the `120ms` census, the E4 ruling) that no
   longer match the tree. That reconciliation is this phase's own task, not this digest's — flagged
   here so the research loop routes it rather than treats this digest as having silently fixed it.
