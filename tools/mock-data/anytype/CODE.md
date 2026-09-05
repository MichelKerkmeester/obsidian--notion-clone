---
title: "tools/mock-data/anytype: loader topology and flow"
description: "Code map for the Anytype loader: two transports meeting at one report file, a rate limiter that lives in the client rather than the call sites, and the three renderer behaviours the DOM leg is shaped around."
trigger_phrases:
  - "anytype loader code map"
  - "anytype cdp driver"
  - "anytype rate limit backoff"
  - "anytype dataview menu selectors"
---

# tools/mock-data/anytype: loader topology and flow

---

## 1. OVERVIEW

Seven source files, two transports, one handoff:

```
                 ┌─ HTTP ─────────────────────────────────┐
catalogue.json ─▶│ mapping.mjs ─▶ load.mjs ─▶ api.mjs ────┼─▶ localhost:31009
                 └────────────────┬───────────────────────┘
                                  │ writes
                                  ▼
                        load-report.json          ← the handoff
                                  │ read by
                 ┌─ CDP ──────────┴───────────────────────┐
                 │ views.mjs ─┐                           │
                 │            ├─▶ driver.mjs ─▶ cdp.mjs ──┼─▶ localhost:9222
                 │ capture.mjs┘                           │
                 └────────────────────────────────────────┘
```

`load-report.json` is the seam. It is not a log: it carries the collection ids the CDP leg navigates
to and the property **display names** the CDP leg matches menu rows on, and neither is derivable
from the catalogue alone. A run that loses it cannot build views without reloading.

The split is forced, not chosen. Anytype's HTTP API can create every object and every relation in
bulk but has no route that creates a view, so the data leg and the view leg cannot share a
transport.

---

## 2. WHERE EACH DECISION LIVES

| Decision | File | Why there |
|---|---|---|
| What an Anytype relation format is, per neutral column type | `mapping.mjs` | One table, read by both the loader and the capture index's documentation |
| How a catalogue value becomes an API value | `mapping.mjs` `valueEntry()` | Same place as the format that decides it |
| How often a write may be sent | `api.mjs` `req()` | Thousands of calls; a limiter at the call sites is a limiter missing from one of them |
| Which display name a property gets | `load.mjs` `buildPropertyNames()` | Needs every use case at once to know which labels repeat |
| Which DOM node to click, and how | `driver.mjs` | The three renderer behaviours in section 4 are all handled once, here |
| Which views a set gets | `views.mjs` `buildSet()` | The only file that knows the six layouts are a sequence, not a set |

---

## 3. THE TWO-PASS LOAD

`load.mjs` writes each set twice on purpose.

Pass one creates the objects with every value that can be known from the record alone. Pass two
`PATCH`es the record-to-record links, because a link names another record by its catalogue id and
that record has no Anytype object id until pass one has finished creating it. Doing it in one pass
would mean resolving forward references, which is the same work with an ordering constraint added.

Person columns are resolved *inside* pass one, not deferred: their targets are the use case's own
option list, so every person object can be created before the first record is.

---

## 4. THREE RENDERER BEHAVIOURS THE DOM LEG IS SHAPED AROUND

Each of these was found by driving the app, and each silently breaks a script that does not know it.

**Submenus open on hover, and ignore clicks.** The row that picks Kanban's group-by property has
`arrow: true`, and the menu's `onClick` returns early for exactly those rows. `el.click()` does
nothing at all. `driver.mjs` dispatches a `MouseEvent('mouseover')` on the row instead — and a
`mousemove` on the document *first*, because the app latches a mouse-disabled flag after any key
press and clears it only on a mousemove.

**Menus are virtualised.** The relation list and the property picker render only the rows in view,
so reading them undercounts, and a property already on the view is reported as missing. `views.mjs`
reads the **grid header** for the authoritative answer, and treats the menu only as a way to act.

**Only Enter commits a view name.** Blurring the input leaves the typed text sitting in the field
and discards it when the menu closes — a rename that reads back correctly from the DOM the whole
time and is simply gone afterwards. This cost a full ten-set build: every view was created with the
right layout, the right group-by and the right filter, and all sixty tabs were still called "All".
Enter also closes the settings menu, so anything that follows a rename has to reopen it.

The general shape is worth keeping: **the DOM agreeing with you is not the app agreeing with you.**
`views.mjs --names` exists to repair exactly this, and it reads each tab's layout back off the
controls bar rather than trusting the order it created them in.

---

## 5. WHY VIEWS ARE DUPLICATED RATHER THAN ADDED

A set's twenty-seven properties are added to one view and then carried to the other five by
duplicating it. Adding a view fresh gives it the default three columns, so the properties would be
paid six times per set instead of once — and the group-by and sort pickers only offer relations the
view already holds, so a fresh view cannot be grouped by a status column it does not show.

---

## 6. VALIDATION

```bash
node tools/mock-data/anytype/load.mjs --verify
```

`--verify` re-reads every object from the live space and compares it against the catalogue field by
field. It exists because the count check the loader already does cannot fail on the loader's most
likely bug: a wrong value shape creates the right number of objects and leaves every one of them
empty.
