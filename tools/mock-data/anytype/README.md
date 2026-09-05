---
title: "tools/mock-data/anytype: loading the catalogue into Anytype"
description: "Builds the Anytype reference environment from catalogue.json — ten sets, 326 records, every column a typed relation — over Anytype's local HTTP API, with the views and the capture sweep driven through the renderer because the API has no route for them."
trigger_phrases:
  - "load catalogue into anytype"
  - "anytype local api loader"
  - "anytype app key pairing"
  - "anytype view layouts script"
  - "anytype capture sweep"
---

# tools/mock-data/anytype: loading the catalogue into Anytype

This folder turns `tools/mock-data/catalogue.json` into a live Anytype space: ten collections, one
per use case, 326 records, and every neutral column created as a correctly typed Anytype relation.
It then gives each collection six view layouts, a sort and a filter, and photographs all of it in
both themes.

It exists because the comparison this repository wants — our board and property surfaces against
Anytype's — is only a comparison when both hold the same records. Anytype's own shipped demo is not
that.

## 1. QUICK START

```bash
# 1. pair once; the app shows a 4-digit code, readable over CDP (see section 3)
#    the key is written to a file you name and is never committed
export ANYTYPE_KEY_FILE=/path/outside/the/repo/anytype-key.txt

# 2. build the space: types, properties, options, objects, collections
node tools/mock-data/anytype/load.mjs --reset

# 3. confirm it landed, cell by cell rather than by record count alone
node tools/mock-data/anytype/load.mjs --verify

# 4. the six layouts, the sort and the filter, per set
node tools/mock-data/anytype/views.mjs --target <cdpTargetId>

#    repair pass: name every tab after the layout it renders
node tools/mock-data/anytype/views.mjs --target <cdpTargetId> --names

# 5. the capture sweep, both themes
node tools/mock-data/anytype/capture.mjs --target <cdpTargetId> --out screenshots/anytype
```

Anytype must be running with `--remote-debugging-port=9222` for steps 4 and 5:

```bash
open -a Anytype --args --remote-debugging-port=9222
curl -s localhost:9222/json      # the app tabs; --target picks one by id
```

## 2. THE TWO TRANSPORTS, AND WHY THERE ARE TWO

| Leg | Transport | Why |
|-----|-----------|-----|
| Data: spaces, types, properties, options, objects, collection membership | Local HTTP API on `localhost:31009` | Bulk, fast, no UI driving at all |
| Views: layouts, group-by, sort, filter | Chrome DevTools Protocol into the renderer | `POST /v1/spaces/{id}/lists/{id}/views` is **404** — only `GET` is routed |
| Captures | CDP `Page.captureScreenshot` | Renders from the page, so it needs no window focus and no visible window |
| Theme | CDP → the app's own main-process bridge | `Electron.Api(winId, 'setTheme', [id])` — what the Settings UI itself calls |

Nothing here moves the OS pointer, activates the window, or changes the frontmost application. A
`el.click()` evaluated in the page is a real React click the renderer dispatched itself. That is the
property that makes this safe to run against an app somebody is using on another display.

## 3. PAIRING

`POST /v1/auth/challenges` returns a `challenge_id` and opens a small window showing a 4-digit code.
That window is **its own CDP target** (`.../dist/challenge/index.html`), so the code can be read
without touching the app:

```js
Array.from(document.querySelectorAll('*'))
  .filter((e) => e.children.length === 0 && /^\d$/.test((e.textContent || '').trim()))
  .map((e) => e.textContent.trim()).join('')
```

Read the digits structurally like this rather than regexing the window's text: the prose above the
code contains the phrase "4-digit", and a `\b\d\b` match picks that 4 up as a fifth digit.

`POST /v1/auth/api_keys` with `{challenge_id, code}` returns the bearer key. **Each new challenge
invalidates the previous one and raises a fresh dialog in front of whoever is at the machine**, so
create exactly one and read the code from the window that challenge opened.

## 4. FILES

| File | Role |
|------|------|
| `api.mjs` | The HTTP client: auth header, paged GETs, and the rate limiter |
| `mapping.mjs` | Neutral catalogue column type → Anytype relation format, and the value coercions |
| `load.mjs` | The data leg. `--reset` rebuilds, `--verify` re-reads and compares, `--only <id>` scopes to one set |
| `cdp.mjs` | Raw-WebSocket CDP client |
| `driver.mjs` | DOM primitives: click, hover, type, navigate, screenshot, view tabs |
| `views.mjs` | The six layouts, the Kanban group-by, the Calendar date property, the sort and the filter. `--names` re-labels existing tabs from the layout each one actually renders |
| `capture.mjs` | The capture sweep, both themes |
| `load-report.json` | What the load built: collection ids, property keys and display names. **`views.mjs` and `capture.mjs` read this**, so it is an input, not just a record |
| `views-report.json` | What each set's views became. `capture.mjs` reads it to know which tabs to photograph |
| `verify-report.json` | The cell-by-cell comparison against the catalogue |
| `capture-report.json` | One row per capture, with the row count the DOM held when it was taken |

## 5. THE RATE LIMIT

Writes are capped at roughly **one per second with a burst of seven** — `Ratelimit-Limit`,
`Ratelimit-Remaining` and `Ratelimit-Reset` on every response, and a `429` rather than a queue on
overrun. `api.mjs` spends the burst, then holds at the refill rate, and retries a `429` with
backoff. Both live in `req()` rather than at the call sites: a bulk load makes thousands of calls
and a limiter handled per call site is a limiter handled wrong in one of them.

A full load takes about twenty-five minutes because of this, not because of the work.

## 6. WHAT THE API CANNOT DO

- **Create a view.** `POST .../views` is 404. This is why `views.mjs` exists.
- **Delete a space.** `DELETE /v1/spaces/{id}` is 404, so `--reset` clears a space's contents
  instead of removing it.
- **Attach a file.** `POST /v1/spaces/{id}/files` exists but wants a real multipart upload, so
  `file` columns are created with the right `files` format and left without values.

## 7. VALIDATION

```bash
node tools/mock-data/anytype/load.mjs --verify   # records and cells, read back from the live space
npm run gate                                     # the repository's own gate
```

`--verify` is the one that matters here. A record count matches whenever the right *number* of
objects exists, including when every one of them is empty — which is exactly what a bulk loader
produces when a value shape is wrong. `--verify` compares cell by cell instead.

## 8. RELATED

- `tools/mock-data/README.md` — the catalogue this reads, and the other two emitters
- `screenshots/anytype/README.md` — the capture index, the relation-type mapping table, and the
  per-set counts read back from the live space
