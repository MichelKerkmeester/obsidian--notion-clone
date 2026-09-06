# Fibery — capture index

Everything in this folder is a reference capture of Fibery's web app, harvested from Mobbin through its MCP
search tools on 2026-09-06, for comparing our board, table, timeline and property surfaces against Fibery.
Like `screenshots/anytype/`, nothing here is tracked by `tools/screenshots/manifest.json` (see the note at the
bottom). Every file is a Mobbin preview render (768 px wide, WebP, with Mobbin's "curated by" footer strip),
not a capture of an installed app, and every one is cited by its `mobbin_url` in the index below.

Operator's words: "let fresh fable (medium) orchestrator through claude2 use sonnet agents to harvest all
screenshots from Fibery that can be harvested from Mobbin" — platforms: web only (desktop), so there is no `ios/` folder.

## Layout — how to find a capture

**Non-flow groups are classified by content; flows stay grouped by flow name.** The harvest originally filed
every standalone screen under whichever folder its Mobbin query matched — `web/navigation/` for the one
sidebar query, `web/screens/` (flat) for everything else — and query relevance is loose the same way it was
for Notion. On 2026-09-06 all 702 non-flow files (105 navigation + 597 screens) were opened with the Read tool
and reassigned to the group the screen's main pane actually shows — a rendered calendar behind an
always-visible sidebar is a view, not navigation, and a "Getting Started" checklist is onboarding wherever it
happens to sit; 694 of them moved. `reclassification-2026-09-06.tsv` records each move with its old path, new
path and a one-line reason. Filenames were renamed to match: a moved file's `fibery-web-<group>-*` segment now
names its new folder, not the query that originally filed it — provenance for a file lives in the "Found by"
column of the index below, not in its name. Files under `flows/` were not reclassified: their folder is the
Mobbin flow name, already a reading of the sequence rather than a search term.

| Folder | Files | Holds |
|--------|------:|-------|
| `web/navigation/` | 35 | home, sidebar destinations, workspace switcher, search overlay, trash, inbox |
| `web/views/` | 115 | rendered board, table, calendar, timeline/Gantt, list, gallery, feed, map and entity-tree views |
| `web/database/` | 136 | fields, field types, filters, sorts, group-by, color coding, view options, imports, opened card/entity detail panels |
| `web/editors/` | 76 | document editor, embeds, formatting, slash/block menus, version history, Read.me bodies |
| `web/reports/` | 87 | report and chart wizards, metric (KPI) setup, formula/calculation editors |
| `web/onboarding/` | 68 | Getting Started checklist, sign-up/login, workspace creation, password reset |
| `web/settings/` | 54 | account/workspace settings, notifications, billing, connections, emoji, AI toggle |
| `web/automations/` | 30 | automation rule and button builders (When/Then), execution results |
| `web/whiteboard/` | 30 | whiteboard canvases, diagrams, sticky notes, entity-relationship maps |
| `web/collaboration/` | 31 | comments, invites, members, activity log, user groups/permissions |
| `web/forms/` | 21 | form builder, share-form panel, submission confirmation |
| `web/marketing/` | 11 | template gallery, share-as-template, pricing/marketing pages |
| `web/ai/` | 3 | Fibery AI chat panel, AI writing assistant menu in the document editor |
| `web/states/` | 2 | empty states |
| `web/dialogs/` | 3 | delete-confirmation modals |
| `web/flows/<flow>/` | 1098 | 233 flows, one folder per Mobbin flow, files numbered in flow order (not reclassified) |

Totals: 1800 files, 860 distinct Mobbin screen ids, 38.6 MB.
700 screen ids appear both standalone and inside a flow (the same bytes, filed twice so a flow reads in order);
158 ids exist only inside a flow.

**Census before/after the 2026-09-06 reclassification (non-flow files only, 702 total):**

| Group | Before | After |
|-------|-------:|------:|
| navigation | 105 | 35 |
| screens (flat, unclassified) | 597 | 0 |
| views | 0 | 115 |
| database | 0 | 136 |
| editors | 0 | 76 |
| reports | 0 | 87 |
| onboarding | 0 | 68 |
| settings | 0 | 54 |
| automations | 0 | 30 |
| whiteboard | 0 | 30 |
| collaboration | 0 | 31 |
| forms | 0 | 21 |
| marketing | 0 | 11 |
| ai | 0 | 3 |
| states | 0 | 2 |
| dialogs | 0 | 3 |
| **Total** | **702** | **702** |

File count on disk is unchanged (694 moved, 8 already-navigation files kept their path); `web/flows/` (1098
files, 233 folders) is untouched.

## Provenance

- **Source**: Mobbin, app page https://mobbin.com/apps/fibery-web-97be63a0-3e3e-4101-8de7-abda8a39e500/b7cb0942-1a70-4dac-846d-f5557c418ce5/screens
- **Captured**: 2026-09-06, in two sessions (the first was cut off by a session cap after downloading 1,755 files; the second downloaded the 45 files the first had found but not fetched, then re-swept until nothing new appeared).
- **Tool**: the Mobbin MCP (`api.mobbin.com/mcp`) called through Code Mode (`mcp__code_mode__call_tool_chain`), tools `mobbin.mobbin.search_screens` (`platform: "web"`, `mode: "standard"`, `limit: 15`, `exclude_screen_ids` of the ids already seen within the query) and `mobbin.mobbin.search_flows` (`platform: "web"`, `limit: 10`, paging up to `has_next_page`). Only results whose `app_name` is `Fibery` were kept. Images are the `image_url` each result returned, fetched with curl in the format Mobbin served (WebP).
- **App version**: not reported by Mobbin's tools; the screens show Fibery's 2025–2026 web UI (the calendar screens display January 2026).
- **Rate limit and auth**: 60 requests/min per user, self-capped at 40/min; no 429 and no 401 in the second session, and the first session's saved execution results carry no rate-limit or auth error either.
- **Convergence**: the screen sweep stopped after nine consecutive surface queries returned only known ids (most of them still returning up to 60 Fibery screens, all already on disk); the flow sweep stopped after eight consecutive journeys returned only known flows.
- **Large exclude lists**: passing all ~860 known ids in `exclude_screen_ids` makes the API return zero screens without an error, so the sweep excluded per query and deduplicated against the global set on the client.
- **Reclassification (2026-09-06)**: every non-flow file (105 `navigation/` + 597 `screens/`, 702 total) was opened with the Read tool and judged by content, and 694 moved into the group their screen primarily shows; `reclassification-2026-09-06.tsv` is the map from query-derived path to content group (694 rows). After the pass the file count on disk is unchanged at 1800, no path repeats, and the per-file index below resolves 1:1 to the files on disk. `web/flows/` was not reclassified.

### Query sets

Standalone screens, `search_screens`, each query prefixed with the app name (the sidebar set came from one earlier query, `Fibery left sidebar navigation`):

```
Fibery kanban board view
Fibery table view with columns
Fibery calendar view
Fibery timeline gantt view
Fibery list view
Fibery gallery cards view
Fibery feed view
Fibery map view
Fibery whiteboard canvas
Fibery report chart
Fibery metric KPI widget
Fibery form view
Fibery hierarchical entity tree
Fibery grouped board columns
Fibery view switcher
Fibery database fields configuration
Fibery relation field
Fibery formula field
Fibery automation rule editor
Fibery action button
Fibery workflow state
Fibery import CSV mapping
Fibery database description
Fibery entity type list
Fibery field type picker
Fibery document editor
Fibery entity detail page
Fibery comments thread
Fibery rich text formatting toolbar
Fibery slash command menu
Fibery embed youtube
Fibery table in document
Fibery cover image
Fibery checklist
Fibery code block
Fibery context menu
Fibery dropdown menu
Fibery filter panel
Fibery sort menu
Fibery group by menu
Fibery date picker
Fibery assignee picker
Fibery color coding menu
Fibery column settings
Fibery invite people dialog
Fibery delete confirmation
Fibery create new dialog
Fibery share dialog
Fibery keyboard shortcuts
Fibery home page
Fibery left sidebar
Fibery workspace switcher
Fibery search
Fibery inbox notifications
```

Flows, `search_flows`, each query prefixed with `Fibery `:

```
onboarding after sign up
creating a new workspace
creating a database
adding fields to a database
creating a kanban board view
creating a table view
filtering and sorting a table
creating a calendar view
creating a timeline view
creating a document
adding a comment
inviting team members
setting up an automation rule
importing data
sharing a page
searching the workspace
changing workspace settings
picking a template
editing an entity
app
creating a report
using the whiteboard
configuring notifications
creating a relation between databases
managing permissions
signing up
logging in
```

## Index — standalone screens

Content groups in alphabetical order (`web/ai/` through `web/whiteboard/`), each sorted by screen id.
"Found by" is the query that first surfaced the screen — the query the harvest used, not necessarily
the folder the screen now sits in (see the classification paragraph under Layout above).

| File | Folder | Found by | mobbin_url |
|------|--------|----------|------------|
| `fibery-web-ai-b055ccb8-1b35-45c5-94f2-fe466a7ec28d.webp` | `web/ai/` | left sidebar navigation | https://mobbin.com/screens/b055ccb8-1b35-45c5-94f2-fe466a7ec28d |
| `fibery-web-ai-b0d971c1-f820-4b1b-b390-2ed93a4fc8df.webp` | `web/ai/` | Fibery timeline gantt view | https://mobbin.com/screens/b0d971c1-f820-4b1b-b390-2ed93a4fc8df |
| `fibery-web-ai-d868ebec-3f34-4390-b8ae-73ed3d956de4.webp` | `web/ai/` | left sidebar navigation | https://mobbin.com/screens/d868ebec-3f34-4390-b8ae-73ed3d956de4 |
| `fibery-web-automations-03c651dd-0e52-4baf-91ad-ffeb753f759d.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/03c651dd-0e52-4baf-91ad-ffeb753f759d |
| `fibery-web-automations-0c3706ec-661e-460d-917c-a4c6ca36ea98.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/0c3706ec-661e-460d-917c-a4c6ca36ea98 |
| `fibery-web-automations-0f215f61-a831-4f54-bb9a-78bd6ab45627.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/0f215f61-a831-4f54-bb9a-78bd6ab45627 |
| `fibery-web-automations-13137d0e-2692-4c9e-aa1f-970fa8ab9bbe.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/13137d0e-2692-4c9e-aa1f-970fa8ab9bbe |
| `fibery-web-automations-14782894-abd9-4e01-9900-ae7eb40c2663.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/14782894-abd9-4e01-9900-ae7eb40c2663 |
| `fibery-web-automations-186ff36f-1e55-48b2-9a8f-6298e50e03dc.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/186ff36f-1e55-48b2-9a8f-6298e50e03dc |
| `fibery-web-automations-5027654d-637b-4c0c-b183-1253c1b8849d.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/5027654d-637b-4c0c-b183-1253c1b8849d |
| `fibery-web-automations-50e31c4b-f103-41e7-bfaf-1f5ce5204389.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/50e31c4b-f103-41e7-bfaf-1f5ce5204389 |
| `fibery-web-automations-5431c4af-380f-4d95-98c3-592eeb6d4b87.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/5431c4af-380f-4d95-98c3-592eeb6d4b87 |
| `fibery-web-automations-67602200-dc48-4471-af19-070db75a13f5.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/67602200-dc48-4471-af19-070db75a13f5 |
| `fibery-web-automations-74c183f4-d990-4c8c-bc99-2b829e0c947e.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/74c183f4-d990-4c8c-bc99-2b829e0c947e |
| `fibery-web-automations-7630d249-a5ce-4283-9428-573cb1cbdb1a.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/7630d249-a5ce-4283-9428-573cb1cbdb1a |
| `fibery-web-automations-833c971a-d6ed-4608-ab43-16d9503ad0b7.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/833c971a-d6ed-4608-ab43-16d9503ad0b7 |
| `fibery-web-automations-8c84407d-8184-4298-aceb-525286778699.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/8c84407d-8184-4298-aceb-525286778699 |
| `fibery-web-automations-8d9b55e8-241c-417c-ad8d-647b89e58719.webp` | `web/automations/` | left sidebar navigation | https://mobbin.com/screens/8d9b55e8-241c-417c-ad8d-647b89e58719 |
| `fibery-web-automations-8ec948fe-e144-4bca-9ec7-15ed18a11bd9.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/8ec948fe-e144-4bca-9ec7-15ed18a11bd9 |
| `fibery-web-automations-9c953702-1a3c-436f-807e-8a146f4961c7.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/9c953702-1a3c-436f-807e-8a146f4961c7 |
| `fibery-web-automations-9cc76ebd-deaa-456e-976b-73ef56076868.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/9cc76ebd-deaa-456e-976b-73ef56076868 |
| `fibery-web-automations-a81106b6-1ad3-45a0-927a-f92341f8be35.webp` | `web/automations/` | Fibery list view | https://mobbin.com/screens/a81106b6-1ad3-45a0-927a-f92341f8be35 |
| `fibery-web-automations-ab5a1c6b-c624-4b26-93eb-b75744f849e2.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/ab5a1c6b-c624-4b26-93eb-b75744f849e2 |
| `fibery-web-automations-b40b4666-ceb8-409d-a40c-88b736538bab.webp` | `web/automations/` | Fibery form view | https://mobbin.com/screens/b40b4666-ceb8-409d-a40c-88b736538bab |
| `fibery-web-automations-c3a8c042-5479-4e6e-a71b-38b543876308.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/c3a8c042-5479-4e6e-a71b-38b543876308 |
| `fibery-web-automations-c6c3ead9-d1b8-4da6-af0e-9acc995f56b1.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/c6c3ead9-d1b8-4da6-af0e-9acc995f56b1 |
| `fibery-web-automations-c9d57997-9fcd-42c3-8db7-e47b0c2f2661.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/c9d57997-9fcd-42c3-8db7-e47b0c2f2661 |
| `fibery-web-automations-cdb3e4cd-9334-4485-bf99-165640f33d91.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/cdb3e4cd-9334-4485-bf99-165640f33d91 |
| `fibery-web-automations-d0b8a1c0-8ba0-4ed3-b866-b362917bb5bb.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/d0b8a1c0-8ba0-4ed3-b866-b362917bb5bb |
| `fibery-web-automations-d0f3ce1b-e3ae-460d-a8df-c6678243f6c3.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/d0f3ce1b-e3ae-460d-a8df-c6678243f6c3 |
| `fibery-web-automations-df4ef8dd-8ccb-4bf5-bc03-006f23237854.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/df4ef8dd-8ccb-4bf5-bc03-006f23237854 |
| `fibery-web-automations-f4481d64-5137-424f-80b4-ca3a65304b42.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/f4481d64-5137-424f-80b4-ca3a65304b42 |
| `fibery-web-automations-f729fa81-2d81-4c9c-99fd-7db55f7a4f0e.webp` | `web/automations/` | Fibery automation rule editor | https://mobbin.com/screens/f729fa81-2d81-4c9c-99fd-7db55f7a4f0e |
| `fibery-web-collaboration-0dfa5e18-0eee-450b-923d-1b48054ea527.webp` | `web/collaboration/` | Fibery slash command menu | https://mobbin.com/screens/0dfa5e18-0eee-450b-923d-1b48054ea527 |
| `fibery-web-collaboration-28061776-b4aa-4963-8db5-09225289918e.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/28061776-b4aa-4963-8db5-09225289918e |
| `fibery-web-collaboration-2a5a43c6-d29b-4461-9c87-a49aba0d6234.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/2a5a43c6-d29b-4461-9c87-a49aba0d6234 |
| `fibery-web-collaboration-34873bdf-a564-400d-a720-5aa249dc366a.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/34873bdf-a564-400d-a720-5aa249dc366a |
| `fibery-web-collaboration-3d23c483-b654-4ad4-b574-1ee7787c1848.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/3d23c483-b654-4ad4-b574-1ee7787c1848 |
| `fibery-web-collaboration-454548ed-2cd2-49cf-ae11-57dcbaa8726b.webp` | `web/collaboration/` | Fibery database fields configuration | https://mobbin.com/screens/454548ed-2cd2-49cf-ae11-57dcbaa8726b |
| `fibery-web-collaboration-4fcb80bb-4def-4765-87dd-207c0313d4f4.webp` | `web/collaboration/` | Fibery database description | https://mobbin.com/screens/4fcb80bb-4def-4765-87dd-207c0313d4f4 |
| `fibery-web-collaboration-51cd7582-9372-45e5-97f4-9f8b9e78831d.webp` | `web/collaboration/` | left sidebar navigation | https://mobbin.com/screens/51cd7582-9372-45e5-97f4-9f8b9e78831d |
| `fibery-web-collaboration-5212defb-5248-49ce-92d3-1ac2993e0e63.webp` | `web/collaboration/` | Fibery grouped board columns | https://mobbin.com/screens/5212defb-5248-49ce-92d3-1ac2993e0e63 |
| `fibery-web-collaboration-64ae2190-20c2-451a-b096-ee3642d2d505.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/64ae2190-20c2-451a-b096-ee3642d2d505 |
| `fibery-web-collaboration-6580ffbb-261d-4c92-a491-e58c9411c3fd.webp` | `web/collaboration/` | Fibery grouped board columns | https://mobbin.com/screens/6580ffbb-261d-4c92-a491-e58c9411c3fd |
| `fibery-web-collaboration-67288eb8-4c73-4dbe-b141-83a1a35e6a46.webp` | `web/collaboration/` | Fibery slash command menu | https://mobbin.com/screens/67288eb8-4c73-4dbe-b141-83a1a35e6a46 |
| `fibery-web-collaboration-676444c3-e9b2-49d2-bba9-5bcfe7fb752c.webp` | `web/collaboration/` | Fibery slash command menu | https://mobbin.com/screens/676444c3-e9b2-49d2-bba9-5bcfe7fb752c |
| `fibery-web-collaboration-6d2eedff-707a-47d7-8f99-416059c1ed54.webp` | `web/collaboration/` | Fibery timeline gantt view | https://mobbin.com/screens/6d2eedff-707a-47d7-8f99-416059c1ed54 |
| `fibery-web-collaboration-8ebb779a-53f5-4ba8-b717-ea5b9cda1017.webp` | `web/collaboration/` | Fibery database description | https://mobbin.com/screens/8ebb779a-53f5-4ba8-b717-ea5b9cda1017 |
| `fibery-web-collaboration-90c40053-d70d-41c8-a438-c8bb144333a6.webp` | `web/collaboration/` | Fibery delete confirmation | https://mobbin.com/screens/90c40053-d70d-41c8-a438-c8bb144333a6 |
| `fibery-web-collaboration-94ad5a19-976a-4301-a5b9-c62e1c3f7b00.webp` | `web/collaboration/` | left sidebar navigation | https://mobbin.com/screens/94ad5a19-976a-4301-a5b9-c62e1c3f7b00 |
| `fibery-web-collaboration-96626867-28de-4fa1-b7ec-4fb2d2e4510c.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/96626867-28de-4fa1-b7ec-4fb2d2e4510c |
| `fibery-web-collaboration-9e8c6498-766a-435d-86ba-854d8176832a.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/9e8c6498-766a-435d-86ba-854d8176832a |
| `fibery-web-collaboration-a1d440f4-4c07-42a4-bfee-e6995ad56a20.webp` | `web/collaboration/` | Fibery slash command menu | https://mobbin.com/screens/a1d440f4-4c07-42a4-bfee-e6995ad56a20 |
| `fibery-web-collaboration-a53c0089-20b0-49c1-b0b0-41099859ae99.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/a53c0089-20b0-49c1-b0b0-41099859ae99 |
| `fibery-web-collaboration-a6205e03-fb82-4524-991d-cf38366cc04b.webp` | `web/collaboration/` | Fibery gallery cards view | https://mobbin.com/screens/a6205e03-fb82-4524-991d-cf38366cc04b |
| `fibery-web-collaboration-ae126527-aca8-400b-9783-bf902e2000ef.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/ae126527-aca8-400b-9783-bf902e2000ef |
| `fibery-web-collaboration-b4c9353a-3e6c-4a65-98de-d95fd05c7543.webp` | `web/collaboration/` | Fibery grouped board columns | https://mobbin.com/screens/b4c9353a-3e6c-4a65-98de-d95fd05c7543 |
| `fibery-web-collaboration-bb8e23d0-bc69-4b2f-8b62-d91ea0bc833c.webp` | `web/collaboration/` | Fibery delete confirmation | https://mobbin.com/screens/bb8e23d0-bc69-4b2f-8b62-d91ea0bc833c |
| `fibery-web-collaboration-d15d531d-2b1d-42f5-85f1-49d00dfbd954.webp` | `web/collaboration/` | Fibery timeline gantt view | https://mobbin.com/screens/d15d531d-2b1d-42f5-85f1-49d00dfbd954 |
| `fibery-web-collaboration-e143b162-e97d-495b-9db8-f7b93dbba131.webp` | `web/collaboration/` | Fibery table view with columns | https://mobbin.com/screens/e143b162-e97d-495b-9db8-f7b93dbba131 |
| `fibery-web-collaboration-e2d656a6-35ba-4e9a-b5c7-a14e4fa61bb3.webp` | `web/collaboration/` | left sidebar navigation | https://mobbin.com/screens/e2d656a6-35ba-4e9a-b5c7-a14e4fa61bb3 |
| `fibery-web-collaboration-ef1e4556-966c-4f9e-bdca-172e3c87a7fd.webp` | `web/collaboration/` | left sidebar navigation | https://mobbin.com/screens/ef1e4556-966c-4f9e-bdca-172e3c87a7fd |
| `fibery-web-collaboration-faeb1efe-acd7-442f-a5e2-e3c6153f0fcf.webp` | `web/collaboration/` | Fibery form view | https://mobbin.com/screens/faeb1efe-acd7-442f-a5e2-e3c6153f0fcf |
| `fibery-web-collaboration-fc1aaea0-59df-4cb3-8747-69a9469f0962.webp` | `web/collaboration/` | Fibery form view | https://mobbin.com/screens/fc1aaea0-59df-4cb3-8747-69a9469f0962 |
| `fibery-web-database-0436dd80-3159-46bb-a424-5e59948d1993.webp` | `web/database/` | Fibery dropdown menu | https://mobbin.com/screens/0436dd80-3159-46bb-a424-5e59948d1993 |
| `fibery-web-database-04b7bbcd-dca1-4725-af32-8bcd52973ceb.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/04b7bbcd-dca1-4725-af32-8bcd52973ceb |
| `fibery-web-database-06024252-58ed-405a-8ba2-89a48cd2e6b8.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/06024252-58ed-405a-8ba2-89a48cd2e6b8 |
| `fibery-web-database-0735ba00-b48e-41cc-b886-3a468f4d04cc.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/0735ba00-b48e-41cc-b886-3a468f4d04cc |
| `fibery-web-database-0772ade8-9a33-4c63-932b-4136f4eb50b2.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/0772ade8-9a33-4c63-932b-4136f4eb50b2 |
| `fibery-web-database-08d7b60d-c231-4aa7-96e8-0520c41bfae0.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/08d7b60d-c231-4aa7-96e8-0520c41bfae0 |
| `fibery-web-database-08e19bee-7c9b-4314-a417-4fa01fbef1b9.webp` | `web/database/` | Fibery dropdown menu | https://mobbin.com/screens/08e19bee-7c9b-4314-a417-4fa01fbef1b9 |
| `fibery-web-database-0b1101af-3ee5-46e4-8fdb-ba531f96e467.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/0b1101af-3ee5-46e4-8fdb-ba531f96e467 |
| `fibery-web-database-0d385e48-2ee8-40e0-b967-51643add17fa.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/0d385e48-2ee8-40e0-b967-51643add17fa |
| `fibery-web-database-1122955a-5781-4dfb-b874-257add90f32b.webp` | `web/database/` | Fibery formula field | https://mobbin.com/screens/1122955a-5781-4dfb-b874-257add90f32b |
| `fibery-web-database-11bc62e0-9141-49ac-bc8a-3835df66bb5f.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/11bc62e0-9141-49ac-bc8a-3835df66bb5f |
| `fibery-web-database-11d83909-9067-410a-9c7d-bdbeeca06c4a.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/11d83909-9067-410a-9c7d-bdbeeca06c4a |
| `fibery-web-database-157894c4-4085-4869-9295-1b78e576a072.webp` | `web/database/` | Fibery automation rule editor | https://mobbin.com/screens/157894c4-4085-4869-9295-1b78e576a072 |
| `fibery-web-database-172ed7d6-abee-4dec-b26c-667bfd45ef49.webp` | `web/database/` | Fibery view switcher | https://mobbin.com/screens/172ed7d6-abee-4dec-b26c-667bfd45ef49 |
| `fibery-web-database-1e2df515-bb0a-4c83-8545-ee6dd4a8be60.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/1e2df515-bb0a-4c83-8545-ee6dd4a8be60 |
| `fibery-web-database-200d3220-dc64-41d5-b315-bc546356b189.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/200d3220-dc64-41d5-b315-bc546356b189 |
| `fibery-web-database-2669b291-6998-4d88-aac0-dd303c58b0f9.webp` | `web/database/` | Fibery automation rule editor | https://mobbin.com/screens/2669b291-6998-4d88-aac0-dd303c58b0f9 |
| `fibery-web-database-2938792d-e7f6-477a-86c6-975e53ecd510.webp` | `web/database/` | Fibery kanban board view | https://mobbin.com/screens/2938792d-e7f6-477a-86c6-975e53ecd510 |
| `fibery-web-database-2dacb77f-cdd1-48da-99c0-22d05f5785d1.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/2dacb77f-cdd1-48da-99c0-22d05f5785d1 |
| `fibery-web-database-2e2bcb6d-6531-4dcb-ac2d-01f4667a510a.webp` | `web/database/` | Fibery automation rule editor | https://mobbin.com/screens/2e2bcb6d-6531-4dcb-ac2d-01f4667a510a |
| `fibery-web-database-308ed3b9-d340-49cc-885e-394b57f28b83.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/308ed3b9-d340-49cc-885e-394b57f28b83 |
| `fibery-web-database-32d43676-b7a3-476c-9c4e-b8ef42dc6131.webp` | `web/database/` | Fibery dropdown menu | https://mobbin.com/screens/32d43676-b7a3-476c-9c4e-b8ef42dc6131 |
| `fibery-web-database-374ba702-d3bc-49bf-a7d5-69f6a7eff23d.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/374ba702-d3bc-49bf-a7d5-69f6a7eff23d |
| `fibery-web-database-377a8444-642d-4a1e-ae09-234ddef45d4c.webp` | `web/database/` | Fibery kanban board view | https://mobbin.com/screens/377a8444-642d-4a1e-ae09-234ddef45d4c |
| `fibery-web-database-3c1e916b-3fe1-4eec-8335-09d976983fb0.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/3c1e916b-3fe1-4eec-8335-09d976983fb0 |
| `fibery-web-database-3e934311-48a8-4049-acc8-c5097887435e.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/3e934311-48a8-4049-acc8-c5097887435e |
| `fibery-web-database-423229a8-9bfa-454f-9067-2e05b6cf9827.webp` | `web/database/` | Fibery kanban board view | https://mobbin.com/screens/423229a8-9bfa-454f-9067-2e05b6cf9827 |
| `fibery-web-database-45196409-e3f2-403b-add6-702eec7a5611.webp` | `web/database/` | Fibery gallery cards view | https://mobbin.com/screens/45196409-e3f2-403b-add6-702eec7a5611 |
| `fibery-web-database-492b3e00-32ea-469a-b2d5-eb96a32b457b.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/492b3e00-32ea-469a-b2d5-eb96a32b457b |
| `fibery-web-database-49ad0339-2d1e-40ea-8d79-b7f4c7a276a8.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/49ad0339-2d1e-40ea-8d79-b7f4c7a276a8 |
| `fibery-web-database-4c1d7942-8da3-4082-93d3-f0c706851101.webp` | `web/database/` | Fibery kanban board view | https://mobbin.com/screens/4c1d7942-8da3-4082-93d3-f0c706851101 |
| `fibery-web-database-4f290a2e-92e2-4d3f-9645-0468df349084.webp` | `web/database/` | Fibery slash command menu | https://mobbin.com/screens/4f290a2e-92e2-4d3f-9645-0468df349084 |
| `fibery-web-database-508bc07f-dcda-444d-b3b1-655c0ab04f4b.webp` | `web/database/` | Fibery field type picker | https://mobbin.com/screens/508bc07f-dcda-444d-b3b1-655c0ab04f4b |
| `fibery-web-database-51deb964-cbeb-4860-a2f6-fc987fca100a.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/51deb964-cbeb-4860-a2f6-fc987fca100a |
| `fibery-web-database-5238351a-83be-45e2-9ecc-ef2589816f6a.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/5238351a-83be-45e2-9ecc-ef2589816f6a |
| `fibery-web-database-56d364d2-12cd-4beb-9833-e38466fa6ec2.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/56d364d2-12cd-4beb-9833-e38466fa6ec2 |
| `fibery-web-database-58c50b56-38eb-4419-b96e-01281bbc0ee5.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/58c50b56-38eb-4419-b96e-01281bbc0ee5 |
| `fibery-web-database-5caf3193-9dca-47ee-96b7-716c76abd1a3.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/5caf3193-9dca-47ee-96b7-716c76abd1a3 |
| `fibery-web-database-61f89f3f-4703-498a-bfef-97ee8f654654.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/61f89f3f-4703-498a-bfef-97ee8f654654 |
| `fibery-web-database-629af65d-55c9-4b52-8a06-bca57f4cbec2.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/629af65d-55c9-4b52-8a06-bca57f4cbec2 |
| `fibery-web-database-63fe8c58-245b-413b-9cba-eae57c49a94f.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/63fe8c58-245b-413b-9cba-eae57c49a94f |
| `fibery-web-database-65b484d9-036d-4664-99ec-b132fa573a64.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/65b484d9-036d-4664-99ec-b132fa573a64 |
| `fibery-web-database-68319dc2-cada-408d-a0b2-44ae679ceaa9.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/68319dc2-cada-408d-a0b2-44ae679ceaa9 |
| `fibery-web-database-6b610910-2be1-4a05-a24d-5c055ca152eb.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/6b610910-2be1-4a05-a24d-5c055ca152eb |
| `fibery-web-database-6c26d20a-1baa-46ec-8cbd-433b8222bdcf.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/6c26d20a-1baa-46ec-8cbd-433b8222bdcf |
| `fibery-web-database-6c27509b-9185-4d93-bf39-b34ff97a3d98.webp` | `web/database/` | Fibery slash command menu | https://mobbin.com/screens/6c27509b-9185-4d93-bf39-b34ff97a3d98 |
| `fibery-web-database-6f96ae86-4aff-4a98-acf1-24c5009cdf7d.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/6f96ae86-4aff-4a98-acf1-24c5009cdf7d |
| `fibery-web-database-75ce0fea-8d41-46cb-a374-340820905253.webp` | `web/database/` | Fibery form view | https://mobbin.com/screens/75ce0fea-8d41-46cb-a374-340820905253 |
| `fibery-web-database-7b37cfc8-8d0d-419d-874f-0bd22055414a.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/7b37cfc8-8d0d-419d-874f-0bd22055414a |
| `fibery-web-database-7b4b28a8-b399-4a1b-b5f3-1ac2057acfc6.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/7b4b28a8-b399-4a1b-b5f3-1ac2057acfc6 |
| `fibery-web-database-7c734ceb-8261-4bf5-88b9-f88e8b32dcb7.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/7c734ceb-8261-4bf5-88b9-f88e8b32dcb7 |
| `fibery-web-database-7d7a4544-617e-400f-9239-67eb639d0a83.webp` | `web/database/` | Fibery feed view | https://mobbin.com/screens/7d7a4544-617e-400f-9239-67eb639d0a83 |
| `fibery-web-database-80a43c07-1d56-4084-9574-72dc3998c6ec.webp` | `web/database/` | Fibery map view | https://mobbin.com/screens/80a43c07-1d56-4084-9574-72dc3998c6ec |
| `fibery-web-database-86f7fb5e-1962-4fc7-8e46-55562aa9a526.webp` | `web/database/` | Fibery database description | https://mobbin.com/screens/86f7fb5e-1962-4fc7-8e46-55562aa9a526 |
| `fibery-web-database-8ac9dc00-070d-47ae-a12f-7c30df1c383a.webp` | `web/database/` | Fibery calendar view | https://mobbin.com/screens/8ac9dc00-070d-47ae-a12f-7c30df1c383a |
| `fibery-web-database-8b328f2a-6be4-42e3-86a1-caedbd724986.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/8b328f2a-6be4-42e3-86a1-caedbd724986 |
| `fibery-web-database-8b5155af-07a3-4bae-bc0b-2b043a8bfb09.webp` | `web/database/` | Fibery assignee picker | https://mobbin.com/screens/8b5155af-07a3-4bae-bc0b-2b043a8bfb09 |
| `fibery-web-database-8e82db2c-ddf6-4a47-87a2-6bffd725fabc.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/8e82db2c-ddf6-4a47-87a2-6bffd725fabc |
| `fibery-web-database-8fd42332-a1f1-4d03-ab46-b7c08c4c119f.webp` | `web/database/` | Fibery timeline gantt view | https://mobbin.com/screens/8fd42332-a1f1-4d03-ab46-b7c08c4c119f |
| `fibery-web-database-93f23008-08b0-4d6f-854c-2e5d39346f1d.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/93f23008-08b0-4d6f-854c-2e5d39346f1d |
| `fibery-web-database-94eec80e-c3f2-4d8c-9caf-3eab71d2f73a.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/94eec80e-c3f2-4d8c-9caf-3eab71d2f73a |
| `fibery-web-database-9609ea53-2e9f-4628-9ba5-1d7437f20be7.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/9609ea53-2e9f-4628-9ba5-1d7437f20be7 |
| `fibery-web-database-9695ed0c-c1d2-47fd-9c07-21e6d140c41d.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/9695ed0c-c1d2-47fd-9c07-21e6d140c41d |
| `fibery-web-database-9961676a-ab74-4301-ba98-977c8ea52667.webp` | `web/database/` | Fibery map view | https://mobbin.com/screens/9961676a-ab74-4301-ba98-977c8ea52667 |
| `fibery-web-database-99741643-6f33-4727-8a4a-594c33d3b2ba.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/99741643-6f33-4727-8a4a-594c33d3b2ba |
| `fibery-web-database-99e4c270-3bea-4e89-a78b-5aca8693f963.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/99e4c270-3bea-4e89-a78b-5aca8693f963 |
| `fibery-web-database-a119a87a-d0c0-475a-8017-8bec8b9706a8.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/a119a87a-d0c0-475a-8017-8bec8b9706a8 |
| `fibery-web-database-a1cbb76b-8cbe-412a-b48c-e892394d11df.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/a1cbb76b-8cbe-412a-b48c-e892394d11df |
| `fibery-web-database-a286c8fc-645e-41a8-8af6-8d67d70660ac.webp` | `web/database/` | Fibery grouped board columns | https://mobbin.com/screens/a286c8fc-645e-41a8-8af6-8d67d70660ac |
| `fibery-web-database-a2a7b74e-d436-480b-9f7e-6852951deabe.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/a2a7b74e-d436-480b-9f7e-6852951deabe |
| `fibery-web-database-a2fa99a8-c17e-47a6-96c8-65a18cd2736f.webp` | `web/database/` | Fibery calendar view | https://mobbin.com/screens/a2fa99a8-c17e-47a6-96c8-65a18cd2736f |
| `fibery-web-database-a4ff4d45-040b-4127-aa3b-14cd507564fe.webp` | `web/database/` | Fibery database description | https://mobbin.com/screens/a4ff4d45-040b-4127-aa3b-14cd507564fe |
| `fibery-web-database-a55dbc07-bdfb-4e53-84f4-74a504d30d8f.webp` | `web/database/` | Fibery calendar view | https://mobbin.com/screens/a55dbc07-bdfb-4e53-84f4-74a504d30d8f |
| `fibery-web-database-a5e090a9-1c35-4b5b-b232-9107b4ec835f.webp` | `web/database/` | Fibery form view | https://mobbin.com/screens/a5e090a9-1c35-4b5b-b232-9107b4ec835f |
| `fibery-web-database-a624cc0a-c157-43b3-b933-80274057f9ad.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/a624cc0a-c157-43b3-b933-80274057f9ad |
| `fibery-web-database-a6a4a5b5-c600-4a72-8d07-24eb818110ac.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/a6a4a5b5-c600-4a72-8d07-24eb818110ac |
| `fibery-web-database-a7c1f3a8-dcd9-4c64-8b97-7257a0e53dc3.webp` | `web/database/` | Fibery formula field | https://mobbin.com/screens/a7c1f3a8-dcd9-4c64-8b97-7257a0e53dc3 |
| `fibery-web-database-ab75f041-4568-4459-b179-30df350e1f75.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/ab75f041-4568-4459-b179-30df350e1f75 |
| `fibery-web-database-ad2650e2-d69e-476e-9939-67f0ea3332c1.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/ad2650e2-d69e-476e-9939-67f0ea3332c1 |
| `fibery-web-database-aef935a2-cc36-4ab0-9d09-f11c159b8e56.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/aef935a2-cc36-4ab0-9d09-f11c159b8e56 |
| `fibery-web-database-b16b2640-b23e-4e47-b515-49b5729e80f3.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/b16b2640-b23e-4e47-b515-49b5729e80f3 |
| `fibery-web-database-b17fe4dd-1408-4729-8f51-81e44cdea773.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/b17fe4dd-1408-4729-8f51-81e44cdea773 |
| `fibery-web-database-b1c1016d-82db-4150-83c4-32f8eb6d761f.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/b1c1016d-82db-4150-83c4-32f8eb6d761f |
| `fibery-web-database-b257c91b-eee6-42c1-82cb-3843a630c010.webp` | `web/database/` | Fibery slash command menu | https://mobbin.com/screens/b257c91b-eee6-42c1-82cb-3843a630c010 |
| `fibery-web-database-b3d6302f-cf7d-4c32-b0e0-b68d0c456d78.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/b3d6302f-cf7d-4c32-b0e0-b68d0c456d78 |
| `fibery-web-database-b777e868-fb0f-462f-99b4-c01e0ceafc23.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/b777e868-fb0f-462f-99b4-c01e0ceafc23 |
| `fibery-web-database-b8b582bc-96d5-4276-a8c2-d10b2863eac3.webp` | `web/database/` | Fibery database description | https://mobbin.com/screens/b8b582bc-96d5-4276-a8c2-d10b2863eac3 |
| `fibery-web-database-b96c0928-1338-42c6-8a28-bf79c38cf44f.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/b96c0928-1338-42c6-8a28-bf79c38cf44f |
| `fibery-web-database-ba007df0-c925-4b57-82e1-d14750b3f7c9.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/ba007df0-c925-4b57-82e1-d14750b3f7c9 |
| `fibery-web-database-ba12f893-a958-4ded-ab57-b00e9718ece5.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/ba12f893-a958-4ded-ab57-b00e9718ece5 |
| `fibery-web-database-bb0c8afd-696e-4b35-8703-bf8267fd159c.webp` | `web/database/` | Fibery hierarchical entity tree | https://mobbin.com/screens/bb0c8afd-696e-4b35-8703-bf8267fd159c |
| `fibery-web-database-bc294597-4af1-4e9a-9b40-5fc43b2a9cee.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/bc294597-4af1-4e9a-9b40-5fc43b2a9cee |
| `fibery-web-database-bd898227-ac4b-451f-b393-0068d8a7e5b5.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/bd898227-ac4b-451f-b393-0068d8a7e5b5 |
| `fibery-web-database-bebc80e4-9d63-4e9e-8344-2c7f5a732978.webp` | `web/database/` | Fibery action button | https://mobbin.com/screens/bebc80e4-9d63-4e9e-8344-2c7f5a732978 |
| `fibery-web-database-c1f8250b-8082-4c8f-a408-7dfe71af1be2.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/c1f8250b-8082-4c8f-a408-7dfe71af1be2 |
| `fibery-web-database-c30e7fcc-ca7c-4b55-8d57-f08dea258040.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/c30e7fcc-ca7c-4b55-8d57-f08dea258040 |
| `fibery-web-database-c3a84dce-9b39-4f58-9805-2b086756c12d.webp` | `web/database/` | Fibery database description | https://mobbin.com/screens/c3a84dce-9b39-4f58-9805-2b086756c12d |
| `fibery-web-database-c462001c-9385-413b-bde8-c171b31cfc47.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/c462001c-9385-413b-bde8-c171b31cfc47 |
| `fibery-web-database-c5fcaba4-1c58-4a0f-bd74-441c94e28786.webp` | `web/database/` | Fibery form view | https://mobbin.com/screens/c5fcaba4-1c58-4a0f-bd74-441c94e28786 |
| `fibery-web-database-c693c0c2-6419-499d-805d-32d35dfc1f6d.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/c693c0c2-6419-499d-805d-32d35dfc1f6d |
| `fibery-web-database-c9817067-ab0e-43c8-96e0-954492da25cd.webp` | `web/database/` | Fibery map view | https://mobbin.com/screens/c9817067-ab0e-43c8-96e0-954492da25cd |
| `fibery-web-database-cd166589-0fc4-49ce-ba52-945582f88537.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/cd166589-0fc4-49ce-ba52-945582f88537 |
| `fibery-web-database-ce9712d1-4068-488f-a6e8-5be935c61d2f.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/ce9712d1-4068-488f-a6e8-5be935c61d2f |
| `fibery-web-database-cf43eee5-8c2d-4378-bc35-29d8ee5c3687.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/cf43eee5-8c2d-4378-bc35-29d8ee5c3687 |
| `fibery-web-database-d00bbfd6-9f6f-4add-b9fa-f3678fe69160.webp` | `web/database/` | Fibery dropdown menu | https://mobbin.com/screens/d00bbfd6-9f6f-4add-b9fa-f3678fe69160 |
| `fibery-web-database-d130ed3d-3eab-4e93-bdca-582b213e17c6.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/d130ed3d-3eab-4e93-bdca-582b213e17c6 |
| `fibery-web-database-d34b4f1e-5425-4867-bbee-1fabcc84bca5.webp` | `web/database/` | Fibery timeline gantt view | https://mobbin.com/screens/d34b4f1e-5425-4867-bbee-1fabcc84bca5 |
| `fibery-web-database-d40726cc-48e8-4aff-b162-188d402df937.webp` | `web/database/` | Fibery calendar view | https://mobbin.com/screens/d40726cc-48e8-4aff-b162-188d402df937 |
| `fibery-web-database-d4dfd6b4-c0c4-4845-972a-d9e2d0a3b059.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/d4dfd6b4-c0c4-4845-972a-d9e2d0a3b059 |
| `fibery-web-database-d7798090-514e-4884-8fe9-1afd950251d6.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/d7798090-514e-4884-8fe9-1afd950251d6 |
| `fibery-web-database-d78219c4-91e4-4ec9-8be4-fb1dc21ea664.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/d78219c4-91e4-4ec9-8be4-fb1dc21ea664 |
| `fibery-web-database-d92d0f91-750b-49bc-85d7-8b35b23c605b.webp` | `web/database/` | Fibery formula field | https://mobbin.com/screens/d92d0f91-750b-49bc-85d7-8b35b23c605b |
| `fibery-web-database-d9bfc14d-e2a6-429e-8791-ed3d35173d3c.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/d9bfc14d-e2a6-429e-8791-ed3d35173d3c |
| `fibery-web-database-db0bfd7e-0270-4ff5-a3a9-71ea494a8f07.webp` | `web/database/` | Fibery action button | https://mobbin.com/screens/db0bfd7e-0270-4ff5-a3a9-71ea494a8f07 |
| `fibery-web-database-e087d90b-e28a-4e11-beef-09fe8faffa29.webp` | `web/database/` | Fibery dropdown menu | https://mobbin.com/screens/e087d90b-e28a-4e11-beef-09fe8faffa29 |
| `fibery-web-database-e1b6f757-4cbb-4ac6-9368-5f92d6ad4233.webp` | `web/database/` | Fibery color coding menu | https://mobbin.com/screens/e1b6f757-4cbb-4ac6-9368-5f92d6ad4233 |
| `fibery-web-database-e1cde025-323c-4e9a-a48a-45ac9e7781b5.webp` | `web/database/` | Fibery hierarchical entity tree | https://mobbin.com/screens/e1cde025-323c-4e9a-a48a-45ac9e7781b5 |
| `fibery-web-database-e3791780-91a3-42ef-9e70-30f57bddaf69.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/e3791780-91a3-42ef-9e70-30f57bddaf69 |
| `fibery-web-database-e4f871c1-122b-45b0-9622-e80deb0c1a49.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/e4f871c1-122b-45b0-9622-e80deb0c1a49 |
| `fibery-web-database-e5eeaa68-1238-48a3-bdb1-2b4316fd8745.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/e5eeaa68-1238-48a3-bdb1-2b4316fd8745 |
| `fibery-web-database-e802825f-919e-4e95-bc61-8da5ebc5259a.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/e802825f-919e-4e95-bc61-8da5ebc5259a |
| `fibery-web-database-e8c02f4c-3991-4a96-aaaf-38ed64b1a891.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/e8c02f4c-3991-4a96-aaaf-38ed64b1a891 |
| `fibery-web-database-e9aa9085-9cf1-416e-8db1-ecd9d2bb5fbc.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/e9aa9085-9cf1-416e-8db1-ecd9d2bb5fbc |
| `fibery-web-database-eb9a076a-f398-461d-90d6-d0f879da44c7.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/eb9a076a-f398-461d-90d6-d0f879da44c7 |
| `fibery-web-database-efc9d7c9-ea3a-4745-8e55-744422df8f78.webp` | `web/database/` | Fibery form view | https://mobbin.com/screens/efc9d7c9-ea3a-4745-8e55-744422df8f78 |
| `fibery-web-database-f240dbe2-52e2-4d60-9049-4c017bbbd21f.webp` | `web/database/` | Fibery assignee picker | https://mobbin.com/screens/f240dbe2-52e2-4d60-9049-4c017bbbd21f |
| `fibery-web-database-f507b85d-2a6f-4599-83d4-4324af428b41.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/f507b85d-2a6f-4599-83d4-4324af428b41 |
| `fibery-web-database-f56aaecf-da87-4afb-b879-94ad1137a5e7.webp` | `web/database/` | Fibery report chart | https://mobbin.com/screens/f56aaecf-da87-4afb-b879-94ad1137a5e7 |
| `fibery-web-database-f58e4c68-7fda-4abd-b0f4-31694fd20347.webp` | `web/database/` | Fibery formula field | https://mobbin.com/screens/f58e4c68-7fda-4abd-b0f4-31694fd20347 |
| `fibery-web-database-f72751b2-2d65-481f-9f3b-ad9edc737f09.webp` | `web/database/` | Fibery import CSV mapping | https://mobbin.com/screens/f72751b2-2d65-481f-9f3b-ad9edc737f09 |
| `fibery-web-database-f90065f2-ed2f-48c8-be8f-3c399c04633d.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/f90065f2-ed2f-48c8-be8f-3c399c04633d |
| `fibery-web-database-f908d58e-b057-4b39-9011-b4a3bbd0ebb6.webp` | `web/database/` | left sidebar navigation | https://mobbin.com/screens/f908d58e-b057-4b39-9011-b4a3bbd0ebb6 |
| `fibery-web-database-fc7b490f-98c3-4b2e-afac-106d83df0913.webp` | `web/database/` | Fibery list view | https://mobbin.com/screens/fc7b490f-98c3-4b2e-afac-106d83df0913 |
| `fibery-web-database-fdbcfecb-f949-4d36-b89a-fb4516609a9e.webp` | `web/database/` | Fibery automation rule editor | https://mobbin.com/screens/fdbcfecb-f949-4d36-b89a-fb4516609a9e |
| `fibery-web-database-ff0b7c0d-9a34-41d9-aed5-000b85cc322b.webp` | `web/database/` | Fibery table view with columns | https://mobbin.com/screens/ff0b7c0d-9a34-41d9-aed5-000b85cc322b |
| `fibery-web-database-ffa6368d-4264-4a74-a875-558a1d5bdae8.webp` | `web/database/` | Fibery form view | https://mobbin.com/screens/ffa6368d-4264-4a74-a875-558a1d5bdae8 |
| `fibery-web-dialogs-049ff5fa-2992-4a16-bcc6-cc8d4fc6c49b.webp` | `web/dialogs/` | Fibery delete confirmation | https://mobbin.com/screens/049ff5fa-2992-4a16-bcc6-cc8d4fc6c49b |
| `fibery-web-dialogs-41126de4-5341-436d-83a8-551cc857836d.webp` | `web/dialogs/` | Fibery delete confirmation | https://mobbin.com/screens/41126de4-5341-436d-83a8-551cc857836d |
| `fibery-web-dialogs-59b68706-022a-4537-892a-e73b87951b1d.webp` | `web/dialogs/` | Fibery delete confirmation | https://mobbin.com/screens/59b68706-022a-4537-892a-e73b87951b1d |
| `fibery-web-editors-03318b9b-5560-4bd8-81ff-2e1372fc3541.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/03318b9b-5560-4bd8-81ff-2e1372fc3541 |
| `fibery-web-editors-03aa0ecb-94e0-4852-ae7e-a48ad29985c0.webp` | `web/editors/` | Fibery rich text formatting toolbar | https://mobbin.com/screens/03aa0ecb-94e0-4852-ae7e-a48ad29985c0 |
| `fibery-web-editors-13c9e639-46d9-4652-ac42-fd6856581f9d.webp` | `web/editors/` | Fibery entity type list | https://mobbin.com/screens/13c9e639-46d9-4652-ac42-fd6856581f9d |
| `fibery-web-editors-13e4470d-9b69-4d9b-8631-bde987a80e7b.webp` | `web/editors/` | Fibery grouped board columns | https://mobbin.com/screens/13e4470d-9b69-4d9b-8631-bde987a80e7b |
| `fibery-web-editors-14dc6056-7c13-479c-bbaf-93a80de0270a.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/14dc6056-7c13-479c-bbaf-93a80de0270a |
| `fibery-web-editors-167ff319-732a-4f7f-811b-5aeadb5cb884.webp` | `web/editors/` | Fibery gallery cards view | https://mobbin.com/screens/167ff319-732a-4f7f-811b-5aeadb5cb884 |
| `fibery-web-editors-1a1a38dc-dec1-4eac-a807-950385369df7.webp` | `web/editors/` | Fibery view switcher | https://mobbin.com/screens/1a1a38dc-dec1-4eac-a807-950385369df7 |
| `fibery-web-editors-1ffb38c9-fd2d-4f62-a719-ea1aa8aa6927.webp` | `web/editors/` | Fibery view switcher | https://mobbin.com/screens/1ffb38c9-fd2d-4f62-a719-ea1aa8aa6927 |
| `fibery-web-editors-2c370ce3-3e40-42cf-9717-397930f338b3.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/2c370ce3-3e40-42cf-9717-397930f338b3 |
| `fibery-web-editors-2d82b8bb-0be5-4cb1-8ab2-98a70bec26d2.webp` | `web/editors/` | Fibery dropdown menu | https://mobbin.com/screens/2d82b8bb-0be5-4cb1-8ab2-98a70bec26d2 |
| `fibery-web-editors-30b66e72-1f4d-46ba-ba15-0ac59f497b6f.webp` | `web/editors/` | Fibery rich text formatting toolbar | https://mobbin.com/screens/30b66e72-1f4d-46ba-ba15-0ac59f497b6f |
| `fibery-web-editors-32681070-75b3-4c85-a2f6-3dfc7cff4a97.webp` | `web/editors/` | Fibery kanban board view | https://mobbin.com/screens/32681070-75b3-4c85-a2f6-3dfc7cff4a97 |
| `fibery-web-editors-3406c64b-1a5b-4744-8a37-949cbcf7c8e9.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/3406c64b-1a5b-4744-8a37-949cbcf7c8e9 |
| `fibery-web-editors-3411921f-2811-4334-af3b-f926d859fc33.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/3411921f-2811-4334-af3b-f926d859fc33 |
| `fibery-web-editors-349b2a81-48a8-4955-8118-76062dca5bff.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/349b2a81-48a8-4955-8118-76062dca5bff |
| `fibery-web-editors-35819f59-0eef-401a-86ab-5eea1f34485c.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/35819f59-0eef-401a-86ab-5eea1f34485c |
| `fibery-web-editors-3a89588e-b717-46d0-9385-c9df9d0a47b0.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/3a89588e-b717-46d0-9385-c9df9d0a47b0 |
| `fibery-web-editors-3c84c831-3a0a-4d0a-bd73-983d038f2558.webp` | `web/editors/` | Fibery entity type list | https://mobbin.com/screens/3c84c831-3a0a-4d0a-bd73-983d038f2558 |
| `fibery-web-editors-3dae7779-730a-4a35-bc7a-a3fc0a794850.webp` | `web/editors/` | Fibery kanban board view | https://mobbin.com/screens/3dae7779-730a-4a35-bc7a-a3fc0a794850 |
| `fibery-web-editors-3e809c06-128a-4b1a-af72-0e00024e2b1d.webp` | `web/editors/` | Fibery gallery cards view | https://mobbin.com/screens/3e809c06-128a-4b1a-af72-0e00024e2b1d |
| `fibery-web-editors-40021061-83fe-449c-85f7-bd55dc1947c8.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/40021061-83fe-449c-85f7-bd55dc1947c8 |
| `fibery-web-editors-40ad6297-5ada-4003-b980-5aa0063dd328.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/40ad6297-5ada-4003-b980-5aa0063dd328 |
| `fibery-web-editors-45a010d5-ee70-43ff-82bc-4ccce42917f2.webp` | `web/editors/` | Fibery kanban board view | https://mobbin.com/screens/45a010d5-ee70-43ff-82bc-4ccce42917f2 |
| `fibery-web-editors-49b104f6-6031-46c5-8023-483b2e878423.webp` | `web/editors/` | Fibery entity type list | https://mobbin.com/screens/49b104f6-6031-46c5-8023-483b2e878423 |
| `fibery-web-editors-4db2ebfa-c3bd-42ac-86be-ff7f6c3b94c1.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/4db2ebfa-c3bd-42ac-86be-ff7f6c3b94c1 |
| `fibery-web-editors-5415a9ff-2309-4491-9cd3-7bf897c9989a.webp` | `web/editors/` | Fibery comments thread | https://mobbin.com/screens/5415a9ff-2309-4491-9cd3-7bf897c9989a |
| `fibery-web-editors-56c6a3a0-6209-432a-a414-e1ee2705aa06.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/56c6a3a0-6209-432a-a414-e1ee2705aa06 |
| `fibery-web-editors-620cb491-c5fd-48a5-86fd-1f2ef3372da2.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/620cb491-c5fd-48a5-86fd-1f2ef3372da2 |
| `fibery-web-editors-6528a4b9-44fa-4475-98ad-d887867678e7.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/6528a4b9-44fa-4475-98ad-d887867678e7 |
| `fibery-web-editors-6b5f3106-091e-4e6e-a927-572d184c1c46.webp` | `web/editors/` | Fibery comments thread | https://mobbin.com/screens/6b5f3106-091e-4e6e-a927-572d184c1c46 |
| `fibery-web-editors-6f42b0ea-a5b7-4f0c-8334-7d4db375e950.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/6f42b0ea-a5b7-4f0c-8334-7d4db375e950 |
| `fibery-web-editors-714aa790-1b39-4ef7-ab48-9402ebeb7aea.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/714aa790-1b39-4ef7-ab48-9402ebeb7aea |
| `fibery-web-editors-720880db-3704-4172-bd24-f829144c8247.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/720880db-3704-4172-bd24-f829144c8247 |
| `fibery-web-editors-7a760b37-07f2-4e0f-b50b-375b00acdebb.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/7a760b37-07f2-4e0f-b50b-375b00acdebb |
| `fibery-web-editors-7eca9340-8e5b-4f28-84f0-0f7453b8249e.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/7eca9340-8e5b-4f28-84f0-0f7453b8249e |
| `fibery-web-editors-83898220-9599-42f4-9a60-4ef374ef228c.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/83898220-9599-42f4-9a60-4ef374ef228c |
| `fibery-web-editors-8574fa59-7cc3-48f8-93e6-314cc3567f4e.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/8574fa59-7cc3-48f8-93e6-314cc3567f4e |
| `fibery-web-editors-8b2f5545-39ca-4687-99e9-32c56bc15869.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/8b2f5545-39ca-4687-99e9-32c56bc15869 |
| `fibery-web-editors-8e7cc0fb-3ef6-4211-bf5c-43b513f2602f.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/8e7cc0fb-3ef6-4211-bf5c-43b513f2602f |
| `fibery-web-editors-8ffc14ac-1d7a-434b-a2ce-4ed8052a6338.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/8ffc14ac-1d7a-434b-a2ce-4ed8052a6338 |
| `fibery-web-editors-9a242a5d-f060-40fe-addf-47b962f5b818.webp` | `web/editors/` | Fibery map view | https://mobbin.com/screens/9a242a5d-f060-40fe-addf-47b962f5b818 |
| `fibery-web-editors-9eac90b6-d7e5-45a6-8887-f5fe0a2118d7.webp` | `web/editors/` | Fibery gallery cards view | https://mobbin.com/screens/9eac90b6-d7e5-45a6-8887-f5fe0a2118d7 |
| `fibery-web-editors-a0f4b2f8-30ec-48e4-ac84-ddf21f4d52c2.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a0f4b2f8-30ec-48e4-ac84-ddf21f4d52c2 |
| `fibery-web-editors-a4934de3-ded7-453c-8050-486f64c42ca8.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a4934de3-ded7-453c-8050-486f64c42ca8 |
| `fibery-web-editors-a59259a4-0c72-45a4-b37a-286c93906e07.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a59259a4-0c72-45a4-b37a-286c93906e07 |
| `fibery-web-editors-a5aa4693-1d48-4c9b-a9ba-ddccca88a0cd.webp` | `web/editors/` | Fibery list view | https://mobbin.com/screens/a5aa4693-1d48-4c9b-a9ba-ddccca88a0cd |
| `fibery-web-editors-a6a73809-0383-4ebf-8964-363282fb5efc.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a6a73809-0383-4ebf-8964-363282fb5efc |
| `fibery-web-editors-a82263dc-55c2-4c9f-83ef-b4f41dd17c67.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/a82263dc-55c2-4c9f-83ef-b4f41dd17c67 |
| `fibery-web-editors-a878a4ad-ff7d-4571-a704-c9d3b882f12a.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a878a4ad-ff7d-4571-a704-c9d3b882f12a |
| `fibery-web-editors-a990bed9-126f-4ff8-8419-fdff7afe497c.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/a990bed9-126f-4ff8-8419-fdff7afe497c |
| `fibery-web-editors-aacc9efa-7f77-47b7-94a3-98e98c300296.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/aacc9efa-7f77-47b7-94a3-98e98c300296 |
| `fibery-web-editors-abbe76ad-9e8c-49b7-a2a6-d3bc5a6580a0.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/abbe76ad-9e8c-49b7-a2a6-d3bc5a6580a0 |
| `fibery-web-editors-aec022d4-9b58-4a3d-8bc2-1475467913ca.webp` | `web/editors/` | Fibery gallery cards view | https://mobbin.com/screens/aec022d4-9b58-4a3d-8bc2-1475467913ca |
| `fibery-web-editors-affa8cc4-8e7d-4bc9-928d-28e3990df26f.webp` | `web/editors/` | Fibery timeline gantt view | https://mobbin.com/screens/affa8cc4-8e7d-4bc9-928d-28e3990df26f |
| `fibery-web-editors-b7effa46-f37d-4c1a-b10a-3337f01cbbdd.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/b7effa46-f37d-4c1a-b10a-3337f01cbbdd |
| `fibery-web-editors-bb22e7dd-c8fd-418e-ba5f-1f7502fc3481.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/bb22e7dd-c8fd-418e-ba5f-1f7502fc3481 |
| `fibery-web-editors-c13aec90-6b83-44b6-bae9-f87648c962db.webp` | `web/editors/` | Fibery code block | https://mobbin.com/screens/c13aec90-6b83-44b6-bae9-f87648c962db |
| `fibery-web-editors-cbe36c71-b63b-4fb8-88dd-b918858b0170.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/cbe36c71-b63b-4fb8-88dd-b918858b0170 |
| `fibery-web-editors-cffbe9a3-3e32-41cf-aaf3-16fb3391079e.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/cffbe9a3-3e32-41cf-aaf3-16fb3391079e |
| `fibery-web-editors-d05eee07-3292-464f-bb61-87633f877771.webp` | `web/editors/` | Fibery code block | https://mobbin.com/screens/d05eee07-3292-464f-bb61-87633f877771 |
| `fibery-web-editors-d3b873bd-209e-458a-ad5b-7fe54a90b9c1.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/d3b873bd-209e-458a-ad5b-7fe54a90b9c1 |
| `fibery-web-editors-d4810381-b56a-432c-a338-7e1ca52bbadc.webp` | `web/editors/` | Fibery list view | https://mobbin.com/screens/d4810381-b56a-432c-a338-7e1ca52bbadc |
| `fibery-web-editors-d4c22f98-16ea-4ecd-8152-4cb6475cdcea.webp` | `web/editors/` | Fibery list view | https://mobbin.com/screens/d4c22f98-16ea-4ecd-8152-4cb6475cdcea |
| `fibery-web-editors-d575d663-afc3-4bc8-a24b-f0ca6815100a.webp` | `web/editors/` | Fibery map view | https://mobbin.com/screens/d575d663-afc3-4bc8-a24b-f0ca6815100a |
| `fibery-web-editors-d8b32b04-5783-4ae9-8241-e67e522a12d6.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/d8b32b04-5783-4ae9-8241-e67e522a12d6 |
| `fibery-web-editors-d98e4a5a-c330-42dc-9132-712b2346448e.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/d98e4a5a-c330-42dc-9132-712b2346448e |
| `fibery-web-editors-e0df536e-c3be-4864-92b3-ecae82372639.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/e0df536e-c3be-4864-92b3-ecae82372639 |
| `fibery-web-editors-e1f475cd-9340-4b6d-98c3-9ad852993175.webp` | `web/editors/` | Fibery table view with columns | https://mobbin.com/screens/e1f475cd-9340-4b6d-98c3-9ad852993175 |
| `fibery-web-editors-e899c4c6-a9f6-4a2f-8563-caef84bcddbf.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/e899c4c6-a9f6-4a2f-8563-caef84bcddbf |
| `fibery-web-editors-ea13b251-aac6-4966-a557-04c2efc37aa3.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/ea13b251-aac6-4966-a557-04c2efc37aa3 |
| `fibery-web-editors-ea4f9d3b-5f32-4abf-8cce-9ba113d63db9.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/ea4f9d3b-5f32-4abf-8cce-9ba113d63db9 |
| `fibery-web-editors-eb05e8be-4a16-47f0-94fe-08ad3da74171.webp` | `web/editors/` | Fibery timeline gantt view | https://mobbin.com/screens/eb05e8be-4a16-47f0-94fe-08ad3da74171 |
| `fibery-web-editors-ec013dd5-e616-4c74-a314-3050a64c6194.webp` | `web/editors/` | Fibery slash command menu | https://mobbin.com/screens/ec013dd5-e616-4c74-a314-3050a64c6194 |
| `fibery-web-editors-ede191c3-8032-4aa0-80c9-c15b1d78d4da.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/ede191c3-8032-4aa0-80c9-c15b1d78d4da |
| `fibery-web-editors-ef416a9a-eca4-46b8-af50-3a45291eb0ce.webp` | `web/editors/` | left sidebar navigation | https://mobbin.com/screens/ef416a9a-eca4-46b8-af50-3a45291eb0ce |
| `fibery-web-editors-f6247652-9745-4915-846f-2757de5a1e16.webp` | `web/editors/` | Fibery code block | https://mobbin.com/screens/f6247652-9745-4915-846f-2757de5a1e16 |
| `fibery-web-forms-087083fc-9a2b-463d-8df3-b69ee56995e1.webp` | `web/forms/` | Fibery code block | https://mobbin.com/screens/087083fc-9a2b-463d-8df3-b69ee56995e1 |
| `fibery-web-forms-3c89a6c3-0538-4a7a-81a8-88423ac6995c.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/3c89a6c3-0538-4a7a-81a8-88423ac6995c |
| `fibery-web-forms-3e5fb285-0c38-4a9e-883e-9585d79fecba.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/3e5fb285-0c38-4a9e-883e-9585d79fecba |
| `fibery-web-forms-5018d854-4f24-4f36-955e-9a3bc04b84d0.webp` | `web/forms/` | Fibery form view | https://mobbin.com/screens/5018d854-4f24-4f36-955e-9a3bc04b84d0 |
| `fibery-web-forms-515d5b4d-74da-4d6e-b02b-e7bf3669930a.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/515d5b4d-74da-4d6e-b02b-e7bf3669930a |
| `fibery-web-forms-56a3f4ea-5f41-44bd-8de7-449cafa9b139.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/56a3f4ea-5f41-44bd-8de7-449cafa9b139 |
| `fibery-web-forms-6ab74325-229e-43f5-917a-cde8ab5b3c44.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/6ab74325-229e-43f5-917a-cde8ab5b3c44 |
| `fibery-web-forms-801d3968-e5ea-4fcd-a96c-f7ccd3c55afa.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/801d3968-e5ea-4fcd-a96c-f7ccd3c55afa |
| `fibery-web-forms-828bd24d-b93d-419c-b96c-3c4887fdc6c8.webp` | `web/forms/` | Fibery formula field | https://mobbin.com/screens/828bd24d-b93d-419c-b96c-3c4887fdc6c8 |
| `fibery-web-forms-87fd265a-6059-44a5-8e5a-0f1bf0e520f7.webp` | `web/forms/` | Fibery feed view | https://mobbin.com/screens/87fd265a-6059-44a5-8e5a-0f1bf0e520f7 |
| `fibery-web-forms-91c07c2f-bf1a-4454-a659-414e4e6f11e6.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/91c07c2f-bf1a-4454-a659-414e4e6f11e6 |
| `fibery-web-forms-a265060d-82a6-4d1e-81f9-4f982c687f2b.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/a265060d-82a6-4d1e-81f9-4f982c687f2b |
| `fibery-web-forms-a9b6676c-b98c-4528-9a40-e4c809c93885.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/a9b6676c-b98c-4528-9a40-e4c809c93885 |
| `fibery-web-forms-af254e4b-4c55-40bd-a229-292003cb21be.webp` | `web/forms/` | Fibery kanban board view | https://mobbin.com/screens/af254e4b-4c55-40bd-a229-292003cb21be |
| `fibery-web-forms-b2034515-b146-4de7-b914-f6dc6839e5b5.webp` | `web/forms/` | Fibery field type picker | https://mobbin.com/screens/b2034515-b146-4de7-b914-f6dc6839e5b5 |
| `fibery-web-forms-c3c7004f-a43b-4e79-9a13-395bf13749a5.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/c3c7004f-a43b-4e79-9a13-395bf13749a5 |
| `fibery-web-forms-e0212d68-df73-4664-a0ab-9f35688c6032.webp` | `web/forms/` | Fibery gallery cards view | https://mobbin.com/screens/e0212d68-df73-4664-a0ab-9f35688c6032 |
| `fibery-web-forms-e1a34add-6360-4785-bd90-93a22a9569f7.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/e1a34add-6360-4785-bd90-93a22a9569f7 |
| `fibery-web-forms-e7a08398-d347-4002-b98a-ba5f46148ec6.webp` | `web/forms/` | Fibery table view with columns | https://mobbin.com/screens/e7a08398-d347-4002-b98a-ba5f46148ec6 |
| `fibery-web-forms-eaeca967-4d49-4199-ad13-afe15659dc33.webp` | `web/forms/` | Fibery automation rule editor | https://mobbin.com/screens/eaeca967-4d49-4199-ad13-afe15659dc33 |
| `fibery-web-forms-f6be0661-6661-4515-b67d-c29bf2bc81e5.webp` | `web/forms/` | Fibery action button | https://mobbin.com/screens/f6be0661-6661-4515-b67d-c29bf2bc81e5 |
| `fibery-web-marketing-15025304-ac6a-4537-86f0-e14aadb8c813.webp` | `web/marketing/` | Fibery delete confirmation | https://mobbin.com/screens/15025304-ac6a-4537-86f0-e14aadb8c813 |
| `fibery-web-marketing-1b0c2671-516a-412f-afcf-8757fe169a3e.webp` | `web/marketing/` | Fibery delete confirmation | https://mobbin.com/screens/1b0c2671-516a-412f-afcf-8757fe169a3e |
| `fibery-web-marketing-3981eba3-8c0d-4d61-b76c-8a690547bce3.webp` | `web/marketing/` | Fibery gallery cards view | https://mobbin.com/screens/3981eba3-8c0d-4d61-b76c-8a690547bce3 |
| `fibery-web-marketing-85009a0e-9537-4a88-b732-903f182ce341.webp` | `web/marketing/` | left sidebar navigation | https://mobbin.com/screens/85009a0e-9537-4a88-b732-903f182ce341 |
| `fibery-web-marketing-9ddc568b-cb4e-43ee-941e-a0987799282e.webp` | `web/marketing/` | Fibery map view | https://mobbin.com/screens/9ddc568b-cb4e-43ee-941e-a0987799282e |
| `fibery-web-marketing-a8eb45e6-ca91-450d-a459-5fcfc3a0325f.webp` | `web/marketing/` | Fibery gallery cards view | https://mobbin.com/screens/a8eb45e6-ca91-450d-a459-5fcfc3a0325f |
| `fibery-web-marketing-cbd8a5a4-5ace-4f44-ab72-f34d3fd8105c.webp` | `web/marketing/` | left sidebar navigation | https://mobbin.com/screens/cbd8a5a4-5ace-4f44-ab72-f34d3fd8105c |
| `fibery-web-marketing-d5e084bd-3f31-430d-b106-56ae796e3013.webp` | `web/marketing/` | Fibery form view | https://mobbin.com/screens/d5e084bd-3f31-430d-b106-56ae796e3013 |
| `fibery-web-marketing-de058348-5759-4124-9cef-761fe610fb07.webp` | `web/marketing/` | Fibery gallery cards view | https://mobbin.com/screens/de058348-5759-4124-9cef-761fe610fb07 |
| `fibery-web-marketing-f96f89cc-952d-4369-acb1-fb1f1b4b487f.webp` | `web/marketing/` | Fibery action button | https://mobbin.com/screens/f96f89cc-952d-4369-acb1-fb1f1b4b487f |
| `fibery-web-marketing-f9a85b2a-26a8-4b53-81f3-3de33fad7ace.webp` | `web/marketing/` | Fibery action button | https://mobbin.com/screens/f9a85b2a-26a8-4b53-81f3-3de33fad7ace |
| `fibery-web-navigation-0138b814-db3d-4b91-982d-7ffbbc11262c.webp` | `web/navigation/` | Fibery delete confirmation | https://mobbin.com/screens/0138b814-db3d-4b91-982d-7ffbbc11262c |
| `fibery-web-navigation-138da10f-de4f-4115-98ac-c860f5996cd5.webp` | `web/navigation/` | Fibery metric KPI widget | https://mobbin.com/screens/138da10f-de4f-4115-98ac-c860f5996cd5 |
| `fibery-web-navigation-20f8c308-5b05-440f-b60b-ea8d2961e4b8.webp` | `web/navigation/` | Fibery gallery cards view | https://mobbin.com/screens/20f8c308-5b05-440f-b60b-ea8d2961e4b8 |
| `fibery-web-navigation-2524edb8-35a4-4561-8202-58bb6e443459.webp` | `web/navigation/` | Fibery slash command menu | https://mobbin.com/screens/2524edb8-35a4-4561-8202-58bb6e443459 |
| `fibery-web-navigation-25c267eb-0e32-4035-aec5-c7dc3e24a76b.webp` | `web/navigation/` | Fibery grouped board columns | https://mobbin.com/screens/25c267eb-0e32-4035-aec5-c7dc3e24a76b |
| `fibery-web-navigation-31311c7e-27d5-454a-abc7-35fe43a2e9ae.webp` | `web/navigation/` | Fibery slash command menu | https://mobbin.com/screens/31311c7e-27d5-454a-abc7-35fe43a2e9ae |
| `fibery-web-navigation-sidebar-4fde2890-5e91-4b9e-acd5-13bac27731f1.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/4fde2890-5e91-4b9e-acd5-13bac27731f1 |
| `fibery-web-navigation-57f5d21c-5fae-4113-bcb4-7b28fb9e2d82.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/57f5d21c-5fae-4113-bcb4-7b28fb9e2d82 |
| `fibery-web-navigation-sidebar-634af13f-e5db-4911-b579-7ebcdc144480.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/634af13f-e5db-4911-b579-7ebcdc144480 |
| `fibery-web-navigation-6538d535-45de-498d-b8e4-2416209871d7.webp` | `web/navigation/` | Fibery table view with columns | https://mobbin.com/screens/6538d535-45de-498d-b8e4-2416209871d7 |
| `fibery-web-navigation-6a3f8982-d007-41b7-a32c-135bd8c0baa8.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/6a3f8982-d007-41b7-a32c-135bd8c0baa8 |
| `fibery-web-navigation-762eacbd-2fb7-452d-a5c5-f631a55cc564.webp` | `web/navigation/` | Fibery hierarchical entity tree | https://mobbin.com/screens/762eacbd-2fb7-452d-a5c5-f631a55cc564 |
| `fibery-web-navigation-7b35b327-8c05-4345-92da-96354632cc7b.webp` | `web/navigation/` | Fibery timeline gantt view | https://mobbin.com/screens/7b35b327-8c05-4345-92da-96354632cc7b |
| `fibery-web-navigation-7f9247fd-7537-48fe-bfc4-206c1360129f.webp` | `web/navigation/` | Fibery slash command menu | https://mobbin.com/screens/7f9247fd-7537-48fe-bfc4-206c1360129f |
| `fibery-web-navigation-83a93411-48bf-42bb-9fda-62314c18e7aa.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/83a93411-48bf-42bb-9fda-62314c18e7aa |
| `fibery-web-navigation-92e6e8f4-0b60-4230-b886-22bab8a3bc05.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/92e6e8f4-0b60-4230-b886-22bab8a3bc05 |
| `fibery-web-navigation-aa1d4c8e-5a15-42fe-bb80-e7f47449ca58.webp` | `web/navigation/` | Fibery timeline gantt view | https://mobbin.com/screens/aa1d4c8e-5a15-42fe-bb80-e7f47449ca58 |
| `fibery-web-navigation-ab45b4a4-7b34-407d-b64b-3057a8caae9f.webp` | `web/navigation/` | Fibery field type picker | https://mobbin.com/screens/ab45b4a4-7b34-407d-b64b-3057a8caae9f |
| `fibery-web-navigation-b7909680-e6cd-401c-8aad-314d84dfb5f9.webp` | `web/navigation/` | Fibery table view with columns | https://mobbin.com/screens/b7909680-e6cd-401c-8aad-314d84dfb5f9 |
| `fibery-web-navigation-sidebar-bee682a0-6daf-40f9-b462-73112c98bd5a.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/bee682a0-6daf-40f9-b462-73112c98bd5a |
| `fibery-web-navigation-c0d7344b-6bcf-4e4c-9bf2-0b221c1215fb.webp` | `web/navigation/` | Fibery feed view | https://mobbin.com/screens/c0d7344b-6bcf-4e4c-9bf2-0b221c1215fb |
| `fibery-web-navigation-sidebar-c44104a5-ebfd-4527-853a-7afc06c34962.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/c44104a5-ebfd-4527-853a-7afc06c34962 |
| `fibery-web-navigation-sidebar-d0c3a3d7-84dc-476d-8cf7-c1c347347b6d.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/d0c3a3d7-84dc-476d-8cf7-c1c347347b6d |
| `fibery-web-navigation-d150fdc6-f179-4ff5-987f-c38ff22d9615.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/d150fdc6-f179-4ff5-987f-c38ff22d9615 |
| `fibery-web-navigation-d314839d-394e-40ac-b332-acbecece1f2c.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/d314839d-394e-40ac-b332-acbecece1f2c |
| `fibery-web-navigation-da9d9ff3-30ac-468a-87c4-4be946237755.webp` | `web/navigation/` | Fibery timeline gantt view | https://mobbin.com/screens/da9d9ff3-30ac-468a-87c4-4be946237755 |
| `fibery-web-navigation-db0d583b-43ec-4f98-b093-3c11a8f8c452.webp` | `web/navigation/` | Fibery field type picker | https://mobbin.com/screens/db0d583b-43ec-4f98-b093-3c11a8f8c452 |
| `fibery-web-navigation-df81f33e-4345-44ed-8aa3-ae1de89f059a.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/df81f33e-4345-44ed-8aa3-ae1de89f059a |
| `fibery-web-navigation-sidebar-e470f040-82a2-44ec-8954-c70e56ce695b.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/e470f040-82a2-44ec-8954-c70e56ce695b |
| `fibery-web-navigation-e67a313e-4271-471d-9632-30be4b43f827.webp` | `web/navigation/` | Fibery list view | https://mobbin.com/screens/e67a313e-4271-471d-9632-30be4b43f827 |
| `fibery-web-navigation-e6b139bd-ee66-4581-9193-bf546c9835f8.webp` | `web/navigation/` | Fibery map view | https://mobbin.com/screens/e6b139bd-ee66-4581-9193-bf546c9835f8 |
| `fibery-web-navigation-e7cc3d88-0597-4822-8b5e-9e228f2afa0c.webp` | `web/navigation/` | Fibery timeline gantt view | https://mobbin.com/screens/e7cc3d88-0597-4822-8b5e-9e228f2afa0c |
| `fibery-web-navigation-sidebar-eafb5c74-8741-4c89-8139-e2a6a50de754.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/eafb5c74-8741-4c89-8139-e2a6a50de754 |
| `fibery-web-navigation-sidebar-ee8fe01a-efea-4f2e-bacc-297a566c8ea7.webp` | `web/navigation/` | left sidebar navigation | https://mobbin.com/screens/ee8fe01a-efea-4f2e-bacc-297a566c8ea7 |
| `fibery-web-navigation-f44149e7-70a8-41a0-ada8-17284b37b646.webp` | `web/navigation/` | Fibery timeline gantt view | https://mobbin.com/screens/f44149e7-70a8-41a0-ada8-17284b37b646 |
| `fibery-web-onboarding-0319b0ac-c743-49ae-b32c-4c9cd4d8571d.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/0319b0ac-c743-49ae-b32c-4c9cd4d8571d |
| `fibery-web-onboarding-21c9e1f2-3ee1-476b-90e9-b67cdd25672c.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/21c9e1f2-3ee1-476b-90e9-b67cdd25672c |
| `fibery-web-onboarding-244ec40b-14f4-4904-909e-684d30e2c901.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/244ec40b-14f4-4904-909e-684d30e2c901 |
| `fibery-web-onboarding-24f47777-8501-422c-b250-c1ce63a1282b.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/24f47777-8501-422c-b250-c1ce63a1282b |
| `fibery-web-onboarding-2806ea27-8b2f-4a98-8688-235262d93c24.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/2806ea27-8b2f-4a98-8688-235262d93c24 |
| `fibery-web-onboarding-37395a20-8be7-42b6-a424-fba61b9f3a73.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/37395a20-8be7-42b6-a424-fba61b9f3a73 |
| `fibery-web-onboarding-44242486-a17b-4a76-8af5-cd8b427567d8.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/44242486-a17b-4a76-8af5-cd8b427567d8 |
| `fibery-web-onboarding-49a9e1ca-5c81-4d9e-9c8a-93a922d642e5.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/49a9e1ca-5c81-4d9e-9c8a-93a922d642e5 |
| `fibery-web-onboarding-50c7362e-1691-496d-958b-a33a949a9671.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/50c7362e-1691-496d-958b-a33a949a9671 |
| `fibery-web-onboarding-521a4758-b38f-4140-83d5-6136122c460c.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/521a4758-b38f-4140-83d5-6136122c460c |
| `fibery-web-onboarding-5b68009c-1ccb-486a-96f5-db0840baff33.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/5b68009c-1ccb-486a-96f5-db0840baff33 |
| `fibery-web-onboarding-5f5a0b79-2537-4bb4-8bd4-1809dd3ab71b.webp` | `web/onboarding/` | Fibery delete confirmation | https://mobbin.com/screens/5f5a0b79-2537-4bb4-8bd4-1809dd3ab71b |
| `fibery-web-onboarding-6349cfbd-4753-4759-91cb-9d0a462a4fd0.webp` | `web/onboarding/` | Fibery form view | https://mobbin.com/screens/6349cfbd-4753-4759-91cb-9d0a462a4fd0 |
| `fibery-web-onboarding-68249419-f400-402c-bf1e-fdd1150c7a6b.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/68249419-f400-402c-bf1e-fdd1150c7a6b |
| `fibery-web-onboarding-71739693-7da1-4a2c-94e3-f5e12d166881.webp` | `web/onboarding/` | Fibery delete confirmation | https://mobbin.com/screens/71739693-7da1-4a2c-94e3-f5e12d166881 |
| `fibery-web-onboarding-71841999-df14-4c49-8aeb-b6829b3d532f.webp` | `web/onboarding/` | Fibery whiteboard canvas | https://mobbin.com/screens/71841999-df14-4c49-8aeb-b6829b3d532f |
| `fibery-web-onboarding-721f5e69-d7d2-44e2-a071-f7b89667bc62.webp` | `web/onboarding/` | Fibery whiteboard canvas | https://mobbin.com/screens/721f5e69-d7d2-44e2-a071-f7b89667bc62 |
| `fibery-web-onboarding-7a89971b-f558-4a16-979b-aa66aa67a9ab.webp` | `web/onboarding/` | Fibery kanban board view | https://mobbin.com/screens/7a89971b-f558-4a16-979b-aa66aa67a9ab |
| `fibery-web-onboarding-820bb07d-1302-41b9-9d7a-46052326c943.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/820bb07d-1302-41b9-9d7a-46052326c943 |
| `fibery-web-onboarding-85f98468-26f4-4411-8c6e-ec175c3a1b2a.webp` | `web/onboarding/` | Fibery whiteboard canvas | https://mobbin.com/screens/85f98468-26f4-4411-8c6e-ec175c3a1b2a |
| `fibery-web-onboarding-8620f369-4974-425e-9028-96d5bf8b4768.webp` | `web/onboarding/` | Fibery field type picker | https://mobbin.com/screens/8620f369-4974-425e-9028-96d5bf8b4768 |
| `fibery-web-onboarding-8902c31f-08a2-4fb0-a3bc-84a545eff0d9.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/8902c31f-08a2-4fb0-a3bc-84a545eff0d9 |
| `fibery-web-onboarding-89d22ddd-c22f-4714-98aa-f368ff3cda60.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/89d22ddd-c22f-4714-98aa-f368ff3cda60 |
| `fibery-web-onboarding-8f845c7b-1f68-497d-a588-805bf1f8aa50.webp` | `web/onboarding/` | Fibery timeline gantt view | https://mobbin.com/screens/8f845c7b-1f68-497d-a588-805bf1f8aa50 |
| `fibery-web-onboarding-8fc02f84-8cb3-4e1c-b16d-3d2af42d43e9.webp` | `web/onboarding/` | Fibery grouped board columns | https://mobbin.com/screens/8fc02f84-8cb3-4e1c-b16d-3d2af42d43e9 |
| `fibery-web-onboarding-92faad84-9922-4869-b802-cfed0649ed82.webp` | `web/onboarding/` | Fibery assignee picker | https://mobbin.com/screens/92faad84-9922-4869-b802-cfed0649ed82 |
| `fibery-web-onboarding-9365c813-8e28-4c34-b970-25f827efae69.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/9365c813-8e28-4c34-b970-25f827efae69 |
| `fibery-web-onboarding-9893d761-be04-44b5-8393-6fd5049aa943.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/9893d761-be04-44b5-8393-6fd5049aa943 |
| `fibery-web-onboarding-98eddcb5-b11d-4dc2-8916-4deac0a30172.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/98eddcb5-b11d-4dc2-8916-4deac0a30172 |
| `fibery-web-onboarding-a0357d42-3cb0-4f06-aa30-524352dfcf03.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/a0357d42-3cb0-4f06-aa30-524352dfcf03 |
| `fibery-web-onboarding-a0f7dc5b-3b70-48f1-b194-4806ce5e31be.webp` | `web/onboarding/` | Fibery map view | https://mobbin.com/screens/a0f7dc5b-3b70-48f1-b194-4806ce5e31be |
| `fibery-web-onboarding-a300aca1-5b8f-4f02-8178-681bcb44bb43.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/a300aca1-5b8f-4f02-8178-681bcb44bb43 |
| `fibery-web-onboarding-a3f9bb38-a1c8-4c8d-a8cb-9a06c56dc229.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/a3f9bb38-a1c8-4c8d-a8cb-9a06c56dc229 |
| `fibery-web-onboarding-a4b87a3b-5090-4776-989e-3479b3da56ba.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/a4b87a3b-5090-4776-989e-3479b3da56ba |
| `fibery-web-onboarding-a74ddc05-8605-4f1b-8b91-2c8367f854b6.webp` | `web/onboarding/` | Fibery assignee picker | https://mobbin.com/screens/a74ddc05-8605-4f1b-8b91-2c8367f854b6 |
| `fibery-web-onboarding-a7cc0e52-3219-4605-90dc-4e9a5df09b08.webp` | `web/onboarding/` | Fibery list view | https://mobbin.com/screens/a7cc0e52-3219-4605-90dc-4e9a5df09b08 |
| `fibery-web-onboarding-a82e9b37-1b3a-4ac4-8b41-64d4b3ad0214.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/a82e9b37-1b3a-4ac4-8b41-64d4b3ad0214 |
| `fibery-web-onboarding-ab5503a2-3e74-4c38-9bd5-25f2fffcb281.webp` | `web/onboarding/` | Fibery whiteboard canvas | https://mobbin.com/screens/ab5503a2-3e74-4c38-9bd5-25f2fffcb281 |
| `fibery-web-onboarding-af2d3fe6-3097-4b71-b798-df90e7005dc4.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/af2d3fe6-3097-4b71-b798-df90e7005dc4 |
| `fibery-web-onboarding-b4d297a1-6555-426e-a3f2-94c7924d2c34.webp` | `web/onboarding/` | Fibery form view | https://mobbin.com/screens/b4d297a1-6555-426e-a3f2-94c7924d2c34 |
| `fibery-web-onboarding-b9538fdf-afa5-4dae-b6e0-42e782b60bb4.webp` | `web/onboarding/` | Fibery list view | https://mobbin.com/screens/b9538fdf-afa5-4dae-b6e0-42e782b60bb4 |
| `fibery-web-onboarding-c0192191-9d22-4079-8c89-6a97f62c9943.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/c0192191-9d22-4079-8c89-6a97f62c9943 |
| `fibery-web-onboarding-c37a1c94-8960-42b8-8349-3108521452b6.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/c37a1c94-8960-42b8-8349-3108521452b6 |
| `fibery-web-onboarding-c9d39f99-beeb-40ae-8a96-1d0c6e808e1a.webp` | `web/onboarding/` | Fibery form view | https://mobbin.com/screens/c9d39f99-beeb-40ae-8a96-1d0c6e808e1a |
| `fibery-web-onboarding-ccf5a5b9-c0e3-48cc-be8a-68580deb46be.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/ccf5a5b9-c0e3-48cc-be8a-68580deb46be |
| `fibery-web-onboarding-cf11411e-c2b2-429f-abe5-056ca36e8fc2.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/cf11411e-c2b2-429f-abe5-056ca36e8fc2 |
| `fibery-web-onboarding-cf29abf8-c4c5-4337-b964-30dc61a23cfd.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/cf29abf8-c4c5-4337-b964-30dc61a23cfd |
| `fibery-web-onboarding-d2973978-0368-4460-90f9-1c4f69955e96.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/d2973978-0368-4460-90f9-1c4f69955e96 |
| `fibery-web-onboarding-d522b1a7-37c8-473d-88c7-71f4cb83342b.webp` | `web/onboarding/` | Fibery code block | https://mobbin.com/screens/d522b1a7-37c8-473d-88c7-71f4cb83342b |
| `fibery-web-onboarding-d609260c-de4a-44a7-9308-065b3f037139.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/d609260c-de4a-44a7-9308-065b3f037139 |
| `fibery-web-onboarding-d68293ff-2be5-44d6-b9d2-cf4cdee6eb22.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/d68293ff-2be5-44d6-b9d2-cf4cdee6eb22 |
| `fibery-web-onboarding-d737e505-4808-4429-ad6e-f29cb06dee93.webp` | `web/onboarding/` | Fibery form view | https://mobbin.com/screens/d737e505-4808-4429-ad6e-f29cb06dee93 |
| `fibery-web-onboarding-d7492806-b077-4a5e-9e57-d14e50c7e003.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/d7492806-b077-4a5e-9e57-d14e50c7e003 |
| `fibery-web-onboarding-d8dbe581-0333-449b-9721-79c5a0f66012.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/d8dbe581-0333-449b-9721-79c5a0f66012 |
| `fibery-web-onboarding-db2c7a2b-ba20-4051-8561-0d08e0ba00d3.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/db2c7a2b-ba20-4051-8561-0d08e0ba00d3 |
| `fibery-web-onboarding-de252a6d-4fcf-4d6d-b056-48a3a21d698a.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/de252a6d-4fcf-4d6d-b056-48a3a21d698a |
| `fibery-web-onboarding-de9757b0-6e9e-4522-8334-427b8e3a7683.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/de9757b0-6e9e-4522-8334-427b8e3a7683 |
| `fibery-web-onboarding-e26c782b-9fcd-4587-97f9-c9db9b18ac16.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/e26c782b-9fcd-4587-97f9-c9db9b18ac16 |
| `fibery-web-onboarding-e54fe6ae-a190-4d7b-b1d9-655fd584b3da.webp` | `web/onboarding/` | Fibery action button | https://mobbin.com/screens/e54fe6ae-a190-4d7b-b1d9-655fd584b3da |
| `fibery-web-onboarding-e6a3193c-564d-4c10-9375-ac6a2e3c4eb2.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/e6a3193c-564d-4c10-9375-ac6a2e3c4eb2 |
| `fibery-web-onboarding-e7649ba0-e27d-4b9c-8f4b-b7a7176e343c.webp` | `web/onboarding/` | Fibery assignee picker | https://mobbin.com/screens/e7649ba0-e27d-4b9c-8f4b-b7a7176e343c |
| `fibery-web-onboarding-e999d5de-38c4-4b67-955e-e5e20710b888.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/e999d5de-38c4-4b67-955e-e5e20710b888 |
| `fibery-web-onboarding-ea376c63-7413-4ebc-b2e5-9ad31a62b9bb.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/ea376c63-7413-4ebc-b2e5-9ad31a62b9bb |
| `fibery-web-onboarding-ed561f95-77a4-46d4-b139-9da885a3ed8b.webp` | `web/onboarding/` | Fibery slash command menu | https://mobbin.com/screens/ed561f95-77a4-46d4-b139-9da885a3ed8b |
| `fibery-web-onboarding-f1572734-9bc6-4082-bc4e-c0783303db6c.webp` | `web/onboarding/` | Fibery checklist | https://mobbin.com/screens/f1572734-9bc6-4082-bc4e-c0783303db6c |
| `fibery-web-onboarding-f8a0f26b-cead-43ea-9e51-e2c24a22b9be.webp` | `web/onboarding/` | left sidebar navigation | https://mobbin.com/screens/f8a0f26b-cead-43ea-9e51-e2c24a22b9be |
| `fibery-web-onboarding-f967102f-daee-40f0-ad8b-29bfd04e29a3.webp` | `web/onboarding/` | Fibery form view | https://mobbin.com/screens/f967102f-daee-40f0-ad8b-29bfd04e29a3 |
| `fibery-web-onboarding-fff3401b-971e-4c03-ad34-a467604071e6.webp` | `web/onboarding/` | Fibery report chart | https://mobbin.com/screens/fff3401b-971e-4c03-ad34-a467604071e6 |
| `fibery-web-reports-01a18e46-eab5-4476-839d-e57d955bb406.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/01a18e46-eab5-4476-839d-e57d955bb406 |
| `fibery-web-reports-020c70cc-1081-482c-a47e-8df7e610b70c.webp` | `web/reports/` | Fibery list view | https://mobbin.com/screens/020c70cc-1081-482c-a47e-8df7e610b70c |
| `fibery-web-reports-0a4080bf-c8da-461e-95e9-8be89cc813f5.webp` | `web/reports/` | Fibery automation rule editor | https://mobbin.com/screens/0a4080bf-c8da-461e-95e9-8be89cc813f5 |
| `fibery-web-reports-0c9bca46-fc33-4350-8584-e419953c40d4.webp` | `web/reports/` | Fibery group by menu | https://mobbin.com/screens/0c9bca46-fc33-4350-8584-e419953c40d4 |
| `fibery-web-reports-11df74dd-5122-49c5-a601-14a1574a026e.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/11df74dd-5122-49c5-a601-14a1574a026e |
| `fibery-web-reports-15ca209d-4476-4a23-807b-f07ce1e63f43.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/15ca209d-4476-4a23-807b-f07ce1e63f43 |
| `fibery-web-reports-16c41932-42ae-4701-85a6-3055e7f873aa.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/16c41932-42ae-4701-85a6-3055e7f873aa |
| `fibery-web-reports-17ed2a53-b4ff-42d8-a700-3ce94ab65f16.webp` | `web/reports/` | Fibery automation rule editor | https://mobbin.com/screens/17ed2a53-b4ff-42d8-a700-3ce94ab65f16 |
| `fibery-web-reports-17fd552d-d44c-4f5e-8a3d-c9deb6d4ac14.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/17fd552d-d44c-4f5e-8a3d-c9deb6d4ac14 |
| `fibery-web-reports-30169a83-8a78-4f12-a4c9-e3ca568a2056.webp` | `web/reports/` | Fibery field type picker | https://mobbin.com/screens/30169a83-8a78-4f12-a4c9-e3ca568a2056 |
| `fibery-web-reports-33193a0e-b108-4fc0-9cc9-0af80002a836.webp` | `web/reports/` | Fibery automation rule editor | https://mobbin.com/screens/33193a0e-b108-4fc0-9cc9-0af80002a836 |
| `fibery-web-reports-3c2b2892-e291-49f2-addc-d0cebe0a8968.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/3c2b2892-e291-49f2-addc-d0cebe0a8968 |
| `fibery-web-reports-3c66e741-fe96-47d9-9813-106389f7bcbe.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/3c66e741-fe96-47d9-9813-106389f7bcbe |
| `fibery-web-reports-3cf2d578-d96f-4704-8c12-bce3b550da9a.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/3cf2d578-d96f-4704-8c12-bce3b550da9a |
| `fibery-web-reports-4396dbcf-ff11-40d8-8bed-728019ce2128.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/4396dbcf-ff11-40d8-8bed-728019ce2128 |
| `fibery-web-reports-4e3e9ad9-8c44-4de4-a35f-ae865c41e657.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/4e3e9ad9-8c44-4de4-a35f-ae865c41e657 |
| `fibery-web-reports-53b097b5-9e72-45c4-9358-52bf03392997.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/53b097b5-9e72-45c4-9358-52bf03392997 |
| `fibery-web-reports-55558d38-a4c6-4f06-912e-5f86247f8ab2.webp` | `web/reports/` | Fibery list view | https://mobbin.com/screens/55558d38-a4c6-4f06-912e-5f86247f8ab2 |
| `fibery-web-reports-57619f39-3862-4f1a-9dfc-5ccbba2b7b19.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/57619f39-3862-4f1a-9dfc-5ccbba2b7b19 |
| `fibery-web-reports-5bb82c9c-9404-495d-a27e-44e2cdc18e68.webp` | `web/reports/` | Fibery whiteboard canvas | https://mobbin.com/screens/5bb82c9c-9404-495d-a27e-44e2cdc18e68 |
| `fibery-web-reports-608215e0-b22f-41ea-be2d-6db59bd004ba.webp` | `web/reports/` | Fibery group by menu | https://mobbin.com/screens/608215e0-b22f-41ea-be2d-6db59bd004ba |
| `fibery-web-reports-62a97688-a482-4d0b-b56a-5d36e7ee21eb.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/62a97688-a482-4d0b-b56a-5d36e7ee21eb |
| `fibery-web-reports-6303bd09-04da-4809-80f0-f92020616cfd.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/6303bd09-04da-4809-80f0-f92020616cfd |
| `fibery-web-reports-680307fc-3b63-4cd2-bbf0-e8846ea9e2f4.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/680307fc-3b63-4cd2-bbf0-e8846ea9e2f4 |
| `fibery-web-reports-6b509625-b287-4e5b-a36b-bb36b8296a05.webp` | `web/reports/` | Fibery group by menu | https://mobbin.com/screens/6b509625-b287-4e5b-a36b-bb36b8296a05 |
| `fibery-web-reports-6e0b22b0-ec0e-4153-8cb3-93624f0812e9.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/6e0b22b0-ec0e-4153-8cb3-93624f0812e9 |
| `fibery-web-reports-6fb1edd5-5e67-4bac-9571-abdeff438768.webp` | `web/reports/` | Fibery automation rule editor | https://mobbin.com/screens/6fb1edd5-5e67-4bac-9571-abdeff438768 |
| `fibery-web-reports-777d1f1a-050b-4cca-b467-4bc9bb80fa9b.webp` | `web/reports/` | Fibery group by menu | https://mobbin.com/screens/777d1f1a-050b-4cca-b467-4bc9bb80fa9b |
| `fibery-web-reports-79c7dbbc-ece8-4f72-8a09-07906ba746f3.webp` | `web/reports/` | Fibery group by menu | https://mobbin.com/screens/79c7dbbc-ece8-4f72-8a09-07906ba746f3 |
| `fibery-web-reports-7b1b113f-74d5-4820-916d-7ddcf264bd2a.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/7b1b113f-74d5-4820-916d-7ddcf264bd2a |
| `fibery-web-reports-7de05362-85fa-4111-8110-43b69e3c1215.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/7de05362-85fa-4111-8110-43b69e3c1215 |
| `fibery-web-reports-8583fd27-468f-49ac-b347-e917c18b0296.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/8583fd27-468f-49ac-b347-e917c18b0296 |
| `fibery-web-reports-8587d3a1-f55b-4a00-a34f-8bb9f06a08fa.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/8587d3a1-f55b-4a00-a34f-8bb9f06a08fa |
| `fibery-web-reports-869412d8-65a4-4e33-8b82-fff41856ac6e.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/869412d8-65a4-4e33-8b82-fff41856ac6e |
| `fibery-web-reports-8b5bf881-d879-4451-bd75-a5bfda5a1a2a.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/8b5bf881-d879-4451-bd75-a5bfda5a1a2a |
| `fibery-web-reports-8d743d36-4809-4128-9a4f-7887f1f843ef.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/8d743d36-4809-4128-9a4f-7887f1f843ef |
| `fibery-web-reports-8e0eefbb-dcc6-470f-957b-14710e07df5b.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/8e0eefbb-dcc6-470f-957b-14710e07df5b |
| `fibery-web-reports-902001d9-7b1a-4ecc-93ca-55b4a8dd8884.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/902001d9-7b1a-4ecc-93ca-55b4a8dd8884 |
| `fibery-web-reports-903c7de6-3b7d-4f47-9f42-faea600bb3b1.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/903c7de6-3b7d-4f47-9f42-faea600bb3b1 |
| `fibery-web-reports-96353a1d-cf61-4a8a-8dc5-b965923573ef.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/96353a1d-cf61-4a8a-8dc5-b965923573ef |
| `fibery-web-reports-9c826c0d-8a63-42ca-a85f-573fe10104aa.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/9c826c0d-8a63-42ca-a85f-573fe10104aa |
| `fibery-web-reports-9fd3c3b8-622d-42a7-9e0b-59e0a9d1f9b5.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/9fd3c3b8-622d-42a7-9e0b-59e0a9d1f9b5 |
| `fibery-web-reports-a3adf8b1-b5fd-4982-ba22-c92c3c9a3913.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/a3adf8b1-b5fd-4982-ba22-c92c3c9a3913 |
| `fibery-web-reports-a46cc262-eef8-4b00-8362-ce0fb827fd88.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/a46cc262-eef8-4b00-8362-ce0fb827fd88 |
| `fibery-web-reports-a59cfab1-1925-4a34-b478-f90becad540c.webp` | `web/reports/` | Fibery kanban board view | https://mobbin.com/screens/a59cfab1-1925-4a34-b478-f90becad540c |
| `fibery-web-reports-a6c7efbc-4aeb-452a-9957-45d9bac9296b.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/a6c7efbc-4aeb-452a-9957-45d9bac9296b |
| `fibery-web-reports-aa6a7e17-1af5-4621-9c82-00d6c3e208dc.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/aa6a7e17-1af5-4621-9c82-00d6c3e208dc |
| `fibery-web-reports-aad59315-a7a3-40c9-91fb-d99ce933343c.webp` | `web/reports/` | Fibery feed view | https://mobbin.com/screens/aad59315-a7a3-40c9-91fb-d99ce933343c |
| `fibery-web-reports-b35c38a6-436a-4269-84a0-25fef770a5d1.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/b35c38a6-436a-4269-84a0-25fef770a5d1 |
| `fibery-web-reports-b545398c-0580-4b58-abfc-1ad0eff683ae.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/b545398c-0580-4b58-abfc-1ad0eff683ae |
| `fibery-web-reports-b685338f-0684-4625-9096-1f93d555b329.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/b685338f-0684-4625-9096-1f93d555b329 |
| `fibery-web-reports-babc67e8-4ecd-4955-8ca7-d1d94486bfa3.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/babc67e8-4ecd-4955-8ca7-d1d94486bfa3 |
| `fibery-web-reports-bf9fbb68-525a-4efa-b772-57c67be9f226.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/bf9fbb68-525a-4efa-b772-57c67be9f226 |
| `fibery-web-reports-c0ff8700-0378-43a2-9879-e64197cde8da.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/c0ff8700-0378-43a2-9879-e64197cde8da |
| `fibery-web-reports-c1bc1b2d-495f-4ff3-8174-9437110bbe46.webp` | `web/reports/` | Fibery gallery cards view | https://mobbin.com/screens/c1bc1b2d-495f-4ff3-8174-9437110bbe46 |
| `fibery-web-reports-c64ab346-0e3b-4a58-a9fd-1b7905bfadb5.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/c64ab346-0e3b-4a58-a9fd-1b7905bfadb5 |
| `fibery-web-reports-c6c99e44-475c-4cf6-9774-c5e87781f606.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/c6c99e44-475c-4cf6-9774-c5e87781f606 |
| `fibery-web-reports-c9673f21-a332-4071-9689-9e66b84b14e7.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/c9673f21-a332-4071-9689-9e66b84b14e7 |
| `fibery-web-reports-c98ac48c-eec9-4d52-b033-f7980ed2cead.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/c98ac48c-eec9-4d52-b033-f7980ed2cead |
| `fibery-web-reports-d04f579a-2473-48b8-9aa6-c040b99ab499.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/d04f579a-2473-48b8-9aa6-c040b99ab499 |
| `fibery-web-reports-d088c33d-399b-4153-883f-df40a5d3aede.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/d088c33d-399b-4153-883f-df40a5d3aede |
| `fibery-web-reports-d092d645-8550-431c-a0cb-161afec6a90c.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/d092d645-8550-431c-a0cb-161afec6a90c |
| `fibery-web-reports-d0a38af4-06e2-4dbb-bdae-562adef1ffbe.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/d0a38af4-06e2-4dbb-bdae-562adef1ffbe |
| `fibery-web-reports-d1325dff-1535-489a-81c3-3c798dd9377e.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/d1325dff-1535-489a-81c3-3c798dd9377e |
| `fibery-web-reports-d6b2b6b0-c15c-452b-b2c7-ca6eb0811f38.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/d6b2b6b0-c15c-452b-b2c7-ca6eb0811f38 |
| `fibery-web-reports-d9c4e8e3-358c-4ca5-b173-bbe4845965e1.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/d9c4e8e3-358c-4ca5-b173-bbe4845965e1 |
| `fibery-web-reports-dd43acaf-0487-4c01-84b1-933a29c8ed40.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/dd43acaf-0487-4c01-84b1-933a29c8ed40 |
| `fibery-web-reports-deb67981-f66e-4a22-ba1a-fe75b313da21.webp` | `web/reports/` | Fibery table view with columns | https://mobbin.com/screens/deb67981-f66e-4a22-ba1a-fe75b313da21 |
| `fibery-web-reports-e0a9a1f6-483f-4fdc-9e9a-4430d95fb325.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/e0a9a1f6-483f-4fdc-9e9a-4430d95fb325 |
| `fibery-web-reports-e373e1da-d49d-45f7-93dd-413004ca4aa7.webp` | `web/reports/` | Fibery whiteboard canvas | https://mobbin.com/screens/e373e1da-d49d-45f7-93dd-413004ca4aa7 |
| `fibery-web-reports-e46f1274-a6d1-4b53-955f-e151f7aac2d1.webp` | `web/reports/` | Fibery database description | https://mobbin.com/screens/e46f1274-a6d1-4b53-955f-e151f7aac2d1 |
| `fibery-web-reports-e4b13b53-639c-4a0e-8d8c-fb6c9a964c27.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/e4b13b53-639c-4a0e-8d8c-fb6c9a964c27 |
| `fibery-web-reports-e89244fc-0c63-4719-98ef-85dfb39f46a7.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/e89244fc-0c63-4719-98ef-85dfb39f46a7 |
| `fibery-web-reports-ea2cb980-ee56-4330-ad72-5e5185767711.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/ea2cb980-ee56-4330-ad72-5e5185767711 |
| `fibery-web-reports-ea83acbf-857c-4dfa-a946-541d3cca315b.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/ea83acbf-857c-4dfa-a946-541d3cca315b |
| `fibery-web-reports-ee5a8135-9f7d-4193-8bfd-5fcfee766c45.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/ee5a8135-9f7d-4193-8bfd-5fcfee766c45 |
| `fibery-web-reports-f031c01e-8c50-4ff1-b6cc-398f91b9512b.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/f031c01e-8c50-4ff1-b6cc-398f91b9512b |
| `fibery-web-reports-f1dd49f3-81cf-44d6-88fc-66638df9623e.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/f1dd49f3-81cf-44d6-88fc-66638df9623e |
| `fibery-web-reports-f1ddfe29-a8fe-4392-ad9b-332e97207cef.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/f1ddfe29-a8fe-4392-ad9b-332e97207cef |
| `fibery-web-reports-f1ec31e1-45c4-49db-932a-05767b30b27d.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/f1ec31e1-45c4-49db-932a-05767b30b27d |
| `fibery-web-reports-f2ab5ca9-8437-4bb7-935a-6dc2da2f4dc9.webp` | `web/reports/` | left sidebar navigation | https://mobbin.com/screens/f2ab5ca9-8437-4bb7-935a-6dc2da2f4dc9 |
| `fibery-web-reports-f5bfd72f-e907-4bd6-a38b-60349722a0c3.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/f5bfd72f-e907-4bd6-a38b-60349722a0c3 |
| `fibery-web-reports-f78f4673-4d2e-48dd-ae02-e484ad3f7f41.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/f78f4673-4d2e-48dd-ae02-e484ad3f7f41 |
| `fibery-web-reports-fad513a4-5086-4437-bdea-a0e4e5472086.webp` | `web/reports/` | Fibery timeline gantt view | https://mobbin.com/screens/fad513a4-5086-4437-bdea-a0e4e5472086 |
| `fibery-web-reports-fe025429-8a04-4a5c-871d-c6c139056541.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/fe025429-8a04-4a5c-871d-c6c139056541 |
| `fibery-web-reports-fe33eb7c-d267-4929-849f-9b7d9016ffa7.webp` | `web/reports/` | Fibery map view | https://mobbin.com/screens/fe33eb7c-d267-4929-849f-9b7d9016ffa7 |
| `fibery-web-reports-fff9e7c1-3872-4760-8cff-7eac9b7e43b7.webp` | `web/reports/` | Fibery report chart | https://mobbin.com/screens/fff9e7c1-3872-4760-8cff-7eac9b7e43b7 |
| `fibery-web-settings-0a579613-dabd-434b-8c04-2d3ebee8e6d2.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/0a579613-dabd-434b-8c04-2d3ebee8e6d2 |
| `fibery-web-settings-0c551f3d-d703-4499-b17a-42aacff9248f.webp` | `web/settings/` | Fibery assignee picker | https://mobbin.com/screens/0c551f3d-d703-4499-b17a-42aacff9248f |
| `fibery-web-settings-18a4532c-e57a-4dd5-a37b-0270f2a2b22d.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/18a4532c-e57a-4dd5-a37b-0270f2a2b22d |
| `fibery-web-settings-1a67bb2d-5f38-4877-8ca6-f9d3fce12557.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/1a67bb2d-5f38-4877-8ca6-f9d3fce12557 |
| `fibery-web-settings-24729fac-a1f9-4024-b3ca-c39acf6db2bb.webp` | `web/settings/` | Fibery color coding menu | https://mobbin.com/screens/24729fac-a1f9-4024-b3ca-c39acf6db2bb |
| `fibery-web-settings-278f6636-9f4b-4be0-be80-e2f468aba2df.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/278f6636-9f4b-4be0-be80-e2f468aba2df |
| `fibery-web-settings-29ee053d-4eb0-417c-852e-25026db97791.webp` | `web/settings/` | Fibery color coding menu | https://mobbin.com/screens/29ee053d-4eb0-417c-852e-25026db97791 |
| `fibery-web-settings-2c1aeda4-4657-4ea2-9bb7-fbbf0de47009.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/2c1aeda4-4657-4ea2-9bb7-fbbf0de47009 |
| `fibery-web-settings-30c90edf-b1a8-4c89-a1f1-cb79a9ae2e13.webp` | `web/settings/` | Fibery view switcher | https://mobbin.com/screens/30c90edf-b1a8-4c89-a1f1-cb79a9ae2e13 |
| `fibery-web-settings-3d6b6c57-e466-42b1-84a7-f73d9ee1358a.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/3d6b6c57-e466-42b1-84a7-f73d9ee1358a |
| `fibery-web-settings-4a887b38-9aa4-4a9d-a9b4-0bf30a641977.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/4a887b38-9aa4-4a9d-a9b4-0bf30a641977 |
| `fibery-web-settings-50a76661-68e6-43cd-ab5e-b747793e3424.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/50a76661-68e6-43cd-ab5e-b747793e3424 |
| `fibery-web-settings-526ccc0d-ba9a-4437-bb0d-d1271e3ecbd9.webp` | `web/settings/` | Fibery form view | https://mobbin.com/screens/526ccc0d-ba9a-4437-bb0d-d1271e3ecbd9 |
| `fibery-web-settings-5a4c62da-be7b-4ebd-bf5a-75208db841b5.webp` | `web/settings/` | Fibery color coding menu | https://mobbin.com/screens/5a4c62da-be7b-4ebd-bf5a-75208db841b5 |
| `fibery-web-settings-5abe3bc2-27fd-4a30-a78c-102fb76ce865.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/5abe3bc2-27fd-4a30-a78c-102fb76ce865 |
| `fibery-web-settings-5e5a248b-4a8a-41ce-ae5e-2079c7683e7b.webp` | `web/settings/` | Fibery checklist | https://mobbin.com/screens/5e5a248b-4a8a-41ce-ae5e-2079c7683e7b |
| `fibery-web-settings-6062a64e-b176-403a-8dd1-9a2649b62c98.webp` | `web/settings/` | Fibery database fields configuration | https://mobbin.com/screens/6062a64e-b176-403a-8dd1-9a2649b62c98 |
| `fibery-web-settings-6257816c-cb3a-4bd3-8810-ba5c44f2b0ee.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/6257816c-cb3a-4bd3-8810-ba5c44f2b0ee |
| `fibery-web-settings-6c19c34f-a1d2-41b3-8e7f-58cffd8aab20.webp` | `web/settings/` | Fibery form view | https://mobbin.com/screens/6c19c34f-a1d2-41b3-8e7f-58cffd8aab20 |
| `fibery-web-settings-7270b4b2-c4f3-4ef2-9a82-c687881e1de0.webp` | `web/settings/` | Fibery color coding menu | https://mobbin.com/screens/7270b4b2-c4f3-4ef2-9a82-c687881e1de0 |
| `fibery-web-settings-772d6ad2-4ffa-434e-8af1-7276ffc44bdb.webp` | `web/settings/` | Fibery form view | https://mobbin.com/screens/772d6ad2-4ffa-434e-8af1-7276ffc44bdb |
| `fibery-web-settings-7aed7366-d9e7-4a1a-88ea-7198c227a7c9.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/7aed7366-d9e7-4a1a-88ea-7198c227a7c9 |
| `fibery-web-settings-842bb18e-4560-48d8-ba40-64dbe0c0b794.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/842bb18e-4560-48d8-ba40-64dbe0c0b794 |
| `fibery-web-settings-8765e408-f6ad-44fd-944a-2d547c603a52.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/8765e408-f6ad-44fd-944a-2d547c603a52 |
| `fibery-web-settings-87904a7a-e216-408a-9e6b-a2c6200a4052.webp` | `web/settings/` | Fibery map view | https://mobbin.com/screens/87904a7a-e216-408a-9e6b-a2c6200a4052 |
| `fibery-web-settings-8bf1c5a1-c644-45ea-8dcc-11cb497dea5d.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/8bf1c5a1-c644-45ea-8dcc-11cb497dea5d |
| `fibery-web-settings-8e8a7b5e-612b-4b25-8141-dd45b558bbbd.webp` | `web/settings/` | Fibery assignee picker | https://mobbin.com/screens/8e8a7b5e-612b-4b25-8141-dd45b558bbbd |
| `fibery-web-settings-8f6cceb1-c8bb-4b1b-9213-3b4503bba1e5.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/8f6cceb1-c8bb-4b1b-9213-3b4503bba1e5 |
| `fibery-web-settings-919aab02-6e1f-4794-87ac-eee3614d6fb1.webp` | `web/settings/` | Fibery form view | https://mobbin.com/screens/919aab02-6e1f-4794-87ac-eee3614d6fb1 |
| `fibery-web-settings-9203101d-3cd0-46b9-9739-dc23796adba1.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/9203101d-3cd0-46b9-9739-dc23796adba1 |
| `fibery-web-settings-9fe20eca-b589-4df3-a3dd-05057997cfde.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/9fe20eca-b589-4df3-a3dd-05057997cfde |
| `fibery-web-settings-a4f10ecb-fd0b-4235-b7e6-f9098eb169b4.webp` | `web/settings/` | left sidebar navigation | https://mobbin.com/screens/a4f10ecb-fd0b-4235-b7e6-f9098eb169b4 |
| `fibery-web-settings-ad4b754f-77e8-44f3-b05a-1bd0ed5c7ee7.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/ad4b754f-77e8-44f3-b05a-1bd0ed5c7ee7 |
| `fibery-web-settings-b91a7c4d-d7f2-4a02-b85a-24b971929025.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/b91a7c4d-d7f2-4a02-b85a-24b971929025 |
| `fibery-web-settings-b9581196-369d-4868-9358-461381138a5d.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/b9581196-369d-4868-9358-461381138a5d |
| `fibery-web-settings-b95f4a01-136b-4cb9-ae93-0f0bb7eee150.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/b95f4a01-136b-4cb9-ae93-0f0bb7eee150 |
| `fibery-web-settings-bbcdf1ad-507d-4bfa-99ea-29ffde7df1bb.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/bbcdf1ad-507d-4bfa-99ea-29ffde7df1bb |
| `fibery-web-settings-bbf4c773-1c21-465a-a185-a7d3bb9351de.webp` | `web/settings/` | Fibery map view | https://mobbin.com/screens/bbf4c773-1c21-465a-a185-a7d3bb9351de |
| `fibery-web-settings-c3c9d643-8ebb-4997-b250-6a23e6dee7b0.webp` | `web/settings/` | Fibery action button | https://mobbin.com/screens/c3c9d643-8ebb-4997-b250-6a23e6dee7b0 |
| `fibery-web-settings-c6b25f8a-349b-432d-9244-b0b288a8be14.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/c6b25f8a-349b-432d-9244-b0b288a8be14 |
| `fibery-web-settings-cdd21558-d6d6-4dec-aa5e-8907723c259f.webp` | `web/settings/` | left sidebar navigation | https://mobbin.com/screens/cdd21558-d6d6-4dec-aa5e-8907723c259f |
| `fibery-web-settings-db491fe7-4703-4c76-9cee-8d1357e02850.webp` | `web/settings/` | left sidebar navigation | https://mobbin.com/screens/db491fe7-4703-4c76-9cee-8d1357e02850 |
| `fibery-web-settings-ddb73936-897b-4eff-a347-118adfe32b60.webp` | `web/settings/` | left sidebar navigation | https://mobbin.com/screens/ddb73936-897b-4eff-a347-118adfe32b60 |
| `fibery-web-settings-de8075c4-600e-4429-a392-e357049d408b.webp` | `web/settings/` | Fibery assignee picker | https://mobbin.com/screens/de8075c4-600e-4429-a392-e357049d408b |
| `fibery-web-settings-df05817e-0cfd-4871-be10-92de5c78a577.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/df05817e-0cfd-4871-be10-92de5c78a577 |
| `fibery-web-settings-df09329c-5143-4565-a92a-ce2beef8cdc1.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/df09329c-5143-4565-a92a-ce2beef8cdc1 |
| `fibery-web-settings-e1307065-6455-4e17-abb0-ce9ce89370d8.webp` | `web/settings/` | Fibery gallery cards view | https://mobbin.com/screens/e1307065-6455-4e17-abb0-ce9ce89370d8 |
| `fibery-web-settings-e5ff1298-563b-4a21-a22e-72ac19a7fc4e.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/e5ff1298-563b-4a21-a22e-72ac19a7fc4e |
| `fibery-web-settings-e736f07a-43a2-4734-92df-f398a6003df2.webp` | `web/settings/` | Fibery slash command menu | https://mobbin.com/screens/e736f07a-43a2-4734-92df-f398a6003df2 |
| `fibery-web-settings-e7504ee5-9597-4f42-b2e9-145e499f4fe8.webp` | `web/settings/` | Fibery delete confirmation | https://mobbin.com/screens/e7504ee5-9597-4f42-b2e9-145e499f4fe8 |
| `fibery-web-settings-ea98a81d-e03c-415c-99b1-d3450f548e39.webp` | `web/settings/` | Fibery assignee picker | https://mobbin.com/screens/ea98a81d-e03c-415c-99b1-d3450f548e39 |
| `fibery-web-settings-ef47a409-ff9b-4654-ad87-8a9ff1e598df.webp` | `web/settings/` | Fibery form view | https://mobbin.com/screens/ef47a409-ff9b-4654-ad87-8a9ff1e598df |
| `fibery-web-settings-f41f3068-0202-4983-baab-a69c56c89249.webp` | `web/settings/` | Fibery table view with columns | https://mobbin.com/screens/f41f3068-0202-4983-baab-a69c56c89249 |
| `fibery-web-settings-fc28b3df-f800-41b8-a56f-0e7ea5489634.webp` | `web/settings/` | Fibery table view with columns | https://mobbin.com/screens/fc28b3df-f800-41b8-a56f-0e7ea5489634 |
| `fibery-web-states-59e6b9fe-673a-4672-9563-f455d6f34183.webp` | `web/states/` | Fibery kanban board view | https://mobbin.com/screens/59e6b9fe-673a-4672-9563-f455d6f34183 |
| `fibery-web-states-f46e6813-1dbf-49aa-815f-c5fea78b6454.webp` | `web/states/` | Fibery form view | https://mobbin.com/screens/f46e6813-1dbf-49aa-815f-c5fea78b6454 |
| `fibery-web-views-005c8b47-cd9c-4a32-9872-63cc69c2d3d2.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/005c8b47-cd9c-4a32-9872-63cc69c2d3d2 |
| `fibery-web-views-026ee5e9-9f37-414f-af6a-9268a685809c.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/026ee5e9-9f37-414f-af6a-9268a685809c |
| `fibery-web-views-03cce245-76b5-495c-bd3d-8ac19ece4217.webp` | `web/views/` | Fibery dropdown menu | https://mobbin.com/screens/03cce245-76b5-495c-bd3d-8ac19ece4217 |
| `fibery-web-views-04750d65-b11b-4dd2-8541-963992807b02.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/04750d65-b11b-4dd2-8541-963992807b02 |
| `fibery-web-views-066e7ada-e14f-4a95-a869-c431b449bd52.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/066e7ada-e14f-4a95-a869-c431b449bd52 |
| `fibery-web-views-0744d81a-6035-498a-b181-190ada8a16f2.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/0744d81a-6035-498a-b181-190ada8a16f2 |
| `fibery-web-views-08c26ab4-67f9-4179-921e-a3585c73521d.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/08c26ab4-67f9-4179-921e-a3585c73521d |
| `fibery-web-views-0a207252-0899-4e33-8a10-a9c22005dbaa.webp` | `web/views/` | Fibery slash command menu | https://mobbin.com/screens/0a207252-0899-4e33-8a10-a9c22005dbaa |
| `fibery-web-views-0a49e756-1e9f-45b4-ae85-1cac3f1e579a.webp` | `web/views/` | Fibery feed view | https://mobbin.com/screens/0a49e756-1e9f-45b4-ae85-1cac3f1e579a |
| `fibery-web-views-0cb87164-db8e-40f8-8076-c33137efe977.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/0cb87164-db8e-40f8-8076-c33137efe977 |
| `fibery-web-views-0da82235-b24d-4755-b782-a64c8c2af607.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/0da82235-b24d-4755-b782-a64c8c2af607 |
| `fibery-web-views-0f4f3c30-5d27-4b72-a9a8-f806d1f57cdf.webp` | `web/views/` | Fibery dropdown menu | https://mobbin.com/screens/0f4f3c30-5d27-4b72-a9a8-f806d1f57cdf |
| `fibery-web-views-1039d5ed-5d41-4f9d-8d12-237350cea973.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/1039d5ed-5d41-4f9d-8d12-237350cea973 |
| `fibery-web-views-11fce818-33b5-4b1d-8dcf-154853b475e1.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/11fce818-33b5-4b1d-8dcf-154853b475e1 |
| `fibery-web-views-1479551b-4c52-452a-ba5c-9c4ef002cda0.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/1479551b-4c52-452a-ba5c-9c4ef002cda0 |
| `fibery-web-views-18342389-b731-46f9-8f78-bab9473ca8ae.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/18342389-b731-46f9-8f78-bab9473ca8ae |
| `fibery-web-views-1bcef99c-3903-4879-8321-0edd047ebff9.webp` | `web/views/` | Fibery feed view | https://mobbin.com/screens/1bcef99c-3903-4879-8321-0edd047ebff9 |
| `fibery-web-views-1c89018d-a92e-42de-ab96-1383e8c73594.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/1c89018d-a92e-42de-ab96-1383e8c73594 |
| `fibery-web-views-1cd41121-b49f-4f15-aedc-bc9329ae60cf.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/1cd41121-b49f-4f15-aedc-bc9329ae60cf |
| `fibery-web-views-1faaf41b-0536-4ac9-9b05-fa014601c064.webp` | `web/views/` | Fibery color coding menu | https://mobbin.com/screens/1faaf41b-0536-4ac9-9b05-fa014601c064 |
| `fibery-web-views-205ea35e-cfc4-48cf-9c00-53762ef38310.webp` | `web/views/` | Fibery slash command menu | https://mobbin.com/screens/205ea35e-cfc4-48cf-9c00-53762ef38310 |
| `fibery-web-views-213c7ed2-daa6-4b53-964d-006f71fd2752.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/213c7ed2-daa6-4b53-964d-006f71fd2752 |
| `fibery-web-views-214bcb32-3f6a-4518-84ad-76214bef6e02.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/214bcb32-3f6a-4518-84ad-76214bef6e02 |
| `fibery-web-views-22d83d97-e491-474d-97b6-2cae1a315043.webp` | `web/views/` | Fibery feed view | https://mobbin.com/screens/22d83d97-e491-474d-97b6-2cae1a315043 |
| `fibery-web-views-235a741f-d359-4c38-8285-50cb645be434.webp` | `web/views/` | Fibery sort menu | https://mobbin.com/screens/235a741f-d359-4c38-8285-50cb645be434 |
| `fibery-web-views-2a32f1c2-97d4-4ec7-8f7a-b804ecc91613.webp` | `web/views/` | Fibery color coding menu | https://mobbin.com/screens/2a32f1c2-97d4-4ec7-8f7a-b804ecc91613 |
| `fibery-web-views-2e65fc54-766b-4d74-a453-0a8d5d48c3ca.webp` | `web/views/` | Fibery dropdown menu | https://mobbin.com/screens/2e65fc54-766b-4d74-a453-0a8d5d48c3ca |
| `fibery-web-views-34f2840a-af95-4f62-9717-db812c444c21.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/34f2840a-af95-4f62-9717-db812c444c21 |
| `fibery-web-views-3e047a76-c0d1-48ae-8c3b-36347dc6720e.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/3e047a76-c0d1-48ae-8c3b-36347dc6720e |
| `fibery-web-views-4108e4c0-c2f1-44d0-8940-8440b139e776.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/4108e4c0-c2f1-44d0-8940-8440b139e776 |
| `fibery-web-views-43b2893e-1fa4-4b20-9e80-9f4165b79789.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/43b2893e-1fa4-4b20-9e80-9f4165b79789 |
| `fibery-web-views-441ad4c2-e7bd-4ece-9092-22006f4abce9.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/441ad4c2-e7bd-4ece-9092-22006f4abce9 |
| `fibery-web-views-44b4f7c6-ced4-4154-8fa9-575fe22f48c8.webp` | `web/views/` | Fibery feed view | https://mobbin.com/screens/44b4f7c6-ced4-4154-8fa9-575fe22f48c8 |
| `fibery-web-views-4581c1a3-1df2-4542-a698-e4f130e07d63.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/4581c1a3-1df2-4542-a698-e4f130e07d63 |
| `fibery-web-views-45c348c7-8ab6-426f-84bb-f8b4af4dae18.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/45c348c7-8ab6-426f-84bb-f8b4af4dae18 |
| `fibery-web-views-461d760b-bd29-4dcf-9738-b5a467632503.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/461d760b-bd29-4dcf-9738-b5a467632503 |
| `fibery-web-views-47f25087-85b9-48b5-a2de-e04bdd9e1005.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/47f25087-85b9-48b5-a2de-e04bdd9e1005 |
| `fibery-web-views-4ad738bc-8f98-472a-af26-b820a7559274.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/4ad738bc-8f98-472a-af26-b820a7559274 |
| `fibery-web-views-4d038b64-0241-4ad3-9d15-5f436cc73ae1.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/4d038b64-0241-4ad3-9d15-5f436cc73ae1 |
| `fibery-web-views-4d6ab5a9-073d-4369-aaf1-88034791c682.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/4d6ab5a9-073d-4369-aaf1-88034791c682 |
| `fibery-web-views-4da33a94-00f6-4fff-994c-1cfb7236f24c.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/4da33a94-00f6-4fff-994c-1cfb7236f24c |
| `fibery-web-views-4df4b0fb-4b71-490f-8f60-b78a1a8b39cb.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/4df4b0fb-4b71-490f-8f60-b78a1a8b39cb |
| `fibery-web-views-4e3b7a3c-ccf3-43b2-9707-9db92257434f.webp` | `web/views/` | Fibery color coding menu | https://mobbin.com/screens/4e3b7a3c-ccf3-43b2-9707-9db92257434f |
| `fibery-web-views-51ec5622-4de7-426d-99d1-f2f9aba959de.webp` | `web/views/` | Fibery table view with columns | https://mobbin.com/screens/51ec5622-4de7-426d-99d1-f2f9aba959de |
| `fibery-web-views-59bac0c5-d2c9-4cca-82e5-3d59ffefab0c.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/59bac0c5-d2c9-4cca-82e5-3d59ffefab0c |
| `fibery-web-views-5a10d91e-980d-410f-9ba3-036b1def6a58.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/5a10d91e-980d-410f-9ba3-036b1def6a58 |
| `fibery-web-views-5a7902ab-5836-4521-bea3-5c181c959e51.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/5a7902ab-5836-4521-bea3-5c181c959e51 |
| `fibery-web-views-5c3389e2-9dc8-488b-988d-8b046f2e4be4.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/5c3389e2-9dc8-488b-988d-8b046f2e4be4 |
| `fibery-web-views-5da9c1e1-c0e7-4985-8450-51fc41617571.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/5da9c1e1-c0e7-4985-8450-51fc41617571 |
| `fibery-web-views-5f1c7409-72b0-4af2-97f5-58d540176e5c.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/5f1c7409-72b0-4af2-97f5-58d540176e5c |
| `fibery-web-views-600f7865-44e0-45f0-a20d-017499f9eb85.webp` | `web/views/` | Fibery color coding menu | https://mobbin.com/screens/600f7865-44e0-45f0-a20d-017499f9eb85 |
| `fibery-web-views-62811183-f474-4c2a-a813-85e6c5e13907.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/62811183-f474-4c2a-a813-85e6c5e13907 |
| `fibery-web-views-63ee7a8e-358a-4e7d-a282-210cead76876.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/63ee7a8e-358a-4e7d-a282-210cead76876 |
| `fibery-web-views-64d70073-9615-4110-8e7d-4f52ceac520e.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/64d70073-9615-4110-8e7d-4f52ceac520e |
| `fibery-web-views-66327cd4-0075-446b-a31f-768465f0535d.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/66327cd4-0075-446b-a31f-768465f0535d |
| `fibery-web-views-67e57251-5d66-4993-9fdf-17ba23b0c408.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/67e57251-5d66-4993-9fdf-17ba23b0c408 |
| `fibery-web-views-7118a2f9-49ad-40c1-b527-ff040a5cabb4.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/7118a2f9-49ad-40c1-b527-ff040a5cabb4 |
| `fibery-web-views-728e3ec8-4fab-4678-9b39-4bfaea003558.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/728e3ec8-4fab-4678-9b39-4bfaea003558 |
| `fibery-web-views-75544218-1415-440a-a7de-f294f7163d5e.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/75544218-1415-440a-a7de-f294f7163d5e |
| `fibery-web-views-76010187-bd6f-4856-964a-7cd2c12609ec.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/76010187-bd6f-4856-964a-7cd2c12609ec |
| `fibery-web-views-765cb6ab-d4e5-47ee-aab1-c1873e34233e.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/765cb6ab-d4e5-47ee-aab1-c1873e34233e |
| `fibery-web-views-7c4faced-3a3f-4ec3-a324-a89657499f88.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/7c4faced-3a3f-4ec3-a324-a89657499f88 |
| `fibery-web-views-7c88171e-5a39-4f61-86ed-4b4994e4c75e.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/7c88171e-5a39-4f61-86ed-4b4994e4c75e |
| `fibery-web-views-7d1c6c5c-eaa7-41c3-b705-68fa0058a6d7.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/7d1c6c5c-eaa7-41c3-b705-68fa0058a6d7 |
| `fibery-web-views-80175fab-86ec-4ba5-89ce-072cfa49c56d.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/80175fab-86ec-4ba5-89ce-072cfa49c56d |
| `fibery-web-views-8216447b-6270-4e00-9e96-4b255656df5a.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/8216447b-6270-4e00-9e96-4b255656df5a |
| `fibery-web-views-830fbbd6-79de-4e8c-b649-630e7eb35df8.webp` | `web/views/` | Fibery table view with columns | https://mobbin.com/screens/830fbbd6-79de-4e8c-b649-630e7eb35df8 |
| `fibery-web-views-85e4cc54-135d-41a2-b1de-153905807417.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/85e4cc54-135d-41a2-b1de-153905807417 |
| `fibery-web-views-8791570d-8e5b-4666-bbef-be19d5e829da.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/8791570d-8e5b-4666-bbef-be19d5e829da |
| `fibery-web-views-87d1fb28-8f01-4c8e-97ab-e9f00a149700.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/87d1fb28-8f01-4c8e-97ab-e9f00a149700 |
| `fibery-web-views-8ace1992-4080-46a9-87bb-26e53dd6420b.webp` | `web/views/` | Fibery import CSV mapping | https://mobbin.com/screens/8ace1992-4080-46a9-87bb-26e53dd6420b |
| `fibery-web-views-904506e0-6d8d-437c-ad53-1f51bb23a350.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/904506e0-6d8d-437c-ad53-1f51bb23a350 |
| `fibery-web-views-93692df0-338a-4fb3-ba48-bb08311dfa09.webp` | `web/views/` | Fibery database description | https://mobbin.com/screens/93692df0-338a-4fb3-ba48-bb08311dfa09 |
| `fibery-web-views-9454b4cf-8d8a-4d16-bebf-2a081b4bbebd.webp` | `web/views/` | Fibery kanban board view | https://mobbin.com/screens/9454b4cf-8d8a-4d16-bebf-2a081b4bbebd |
| `fibery-web-views-987af778-7014-4cb2-bddb-10f9e57a4f26.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/987af778-7014-4cb2-bddb-10f9e57a4f26 |
| `fibery-web-views-9969ec62-b754-47a7-8246-e21b6224bd5f.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/9969ec62-b754-47a7-8246-e21b6224bd5f |
| `fibery-web-views-9a654094-c5ea-4117-921f-7c04cab49f52.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/9a654094-c5ea-4117-921f-7c04cab49f52 |
| `fibery-web-views-9d2fd3bb-dac5-4c2d-b772-4f4842e388d0.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/9d2fd3bb-dac5-4c2d-b772-4f4842e388d0 |
| `fibery-web-views-a0fe139c-6bb2-4750-93c5-0c88c2e19061.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/a0fe139c-6bb2-4750-93c5-0c88c2e19061 |
| `fibery-web-views-a513cef1-51af-45b9-a0b7-55a473266888.webp` | `web/views/` | Fibery import CSV mapping | https://mobbin.com/screens/a513cef1-51af-45b9-a0b7-55a473266888 |
| `fibery-web-views-a65f7102-cfcc-477a-9f74-1825fd4a51c4.webp` | `web/views/` | Fibery map view | https://mobbin.com/screens/a65f7102-cfcc-477a-9f74-1825fd4a51c4 |
| `fibery-web-views-a6a5d4a7-37d9-4690-8268-4ba6a180bac5.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/a6a5d4a7-37d9-4690-8268-4ba6a180bac5 |
| `fibery-web-views-a6be63ba-6fdb-4cc4-9caf-95eb07f7b10e.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/a6be63ba-6fdb-4cc4-9caf-95eb07f7b10e |
| `fibery-web-views-a9c5c062-aa31-4bcc-a91c-493b7be27faa.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/a9c5c062-aa31-4bcc-a91c-493b7be27faa |
| `fibery-web-views-aa0c09a9-d8a7-45d4-aa4e-49d8f49c97dd.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/aa0c09a9-d8a7-45d4-aa4e-49d8f49c97dd |
| `fibery-web-views-af0d5fee-626f-4183-b6f1-e90e2b16bc45.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/af0d5fee-626f-4183-b6f1-e90e2b16bc45 |
| `fibery-web-views-af9ae313-0190-44ef-8f8d-a7ac76bd5212.webp` | `web/views/` | Fibery report chart | https://mobbin.com/screens/af9ae313-0190-44ef-8f8d-a7ac76bd5212 |
| `fibery-web-views-b31664fb-80b7-46bf-91c5-b91d8d8bdecb.webp` | `web/views/` | Fibery kanban board view | https://mobbin.com/screens/b31664fb-80b7-46bf-91c5-b91d8d8bdecb |
| `fibery-web-views-b9ed1645-abb1-4254-b7bd-fe572eb32626.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/b9ed1645-abb1-4254-b7bd-fe572eb32626 |
| `fibery-web-views-bf826964-ad6d-496c-8f65-05b5cc71f2cf.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/bf826964-ad6d-496c-8f65-05b5cc71f2cf |
| `fibery-web-views-c0b59b05-d7b2-4399-9a9a-11bd6b210231.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/c0b59b05-d7b2-4399-9a9a-11bd6b210231 |
| `fibery-web-views-c2377105-d1d0-45f3-b0f0-1a44438d61e8.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/c2377105-d1d0-45f3-b0f0-1a44438d61e8 |
| `fibery-web-views-c31c8f5f-463f-442b-b9c5-13e039214803.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/c31c8f5f-463f-442b-b9c5-13e039214803 |
| `fibery-web-views-c4107d5f-4c66-47be-9ff8-7050c2d0aee8.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/c4107d5f-4c66-47be-9ff8-7050c2d0aee8 |
| `fibery-web-views-c90b4c89-214a-4a44-a56e-3e6d6f958378.webp` | `web/views/` | Fibery grouped board columns | https://mobbin.com/screens/c90b4c89-214a-4a44-a56e-3e6d6f958378 |
| `fibery-web-views-ca43c363-5b44-41f5-80ad-1f44ec2e421d.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/ca43c363-5b44-41f5-80ad-1f44ec2e421d |
| `fibery-web-views-d3d0c0da-6fdd-4c43-b657-2e6f09b9d645.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/d3d0c0da-6fdd-4c43-b657-2e6f09b9d645 |
| `fibery-web-views-d3df2ddf-28ba-43f2-8985-97ff3290d106.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/d3df2ddf-28ba-43f2-8985-97ff3290d106 |
| `fibery-web-views-d4a41bd8-766f-4d05-bf23-88babfe927c5.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/d4a41bd8-766f-4d05-bf23-88babfe927c5 |
| `fibery-web-views-d4dc4134-b7d1-4dac-9219-96608db65db3.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/d4dc4134-b7d1-4dac-9219-96608db65db3 |
| `fibery-web-views-d8c818ca-98a2-40b8-99be-ef92015738ae.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/d8c818ca-98a2-40b8-99be-ef92015738ae |
| `fibery-web-views-dc7cc8e8-7d81-49fa-be14-35e64d8a0da0.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/dc7cc8e8-7d81-49fa-be14-35e64d8a0da0 |
| `fibery-web-views-df8d4eb5-b22d-4347-8012-075080223a3e.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/df8d4eb5-b22d-4347-8012-075080223a3e |
| `fibery-web-views-e00d8479-f9c7-442b-b159-814e0d622cd5.webp` | `web/views/` | Fibery feed view | https://mobbin.com/screens/e00d8479-f9c7-442b-b159-814e0d622cd5 |
| `fibery-web-views-e4142ce1-b470-4337-83f5-862583d124f9.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/e4142ce1-b470-4337-83f5-862583d124f9 |
| `fibery-web-views-eaa04fc1-c325-4479-b1de-4636a7f3b794.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/eaa04fc1-c325-4479-b1de-4636a7f3b794 |
| `fibery-web-views-eac029f2-a1db-49bd-9281-3d5ddf341288.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/eac029f2-a1db-49bd-9281-3d5ddf341288 |
| `fibery-web-views-ed6751f4-abfc-4b3d-824f-7f7a7f50796a.webp` | `web/views/` | Fibery timeline gantt view | https://mobbin.com/screens/ed6751f4-abfc-4b3d-824f-7f7a7f50796a |
| `fibery-web-views-f02195b6-ac9a-4b22-abd8-552b4fba2849.webp` | `web/views/` | left sidebar navigation | https://mobbin.com/screens/f02195b6-ac9a-4b22-abd8-552b4fba2849 |
| `fibery-web-views-f136b74c-6ec9-41cf-a24f-4e778f56b34b.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/f136b74c-6ec9-41cf-a24f-4e778f56b34b |
| `fibery-web-views-f891007b-f54f-4ba4-b30c-28fd36d20c5d.webp` | `web/views/` | Fibery calendar view | https://mobbin.com/screens/f891007b-f54f-4ba4-b30c-28fd36d20c5d |
| `fibery-web-views-f8ffc50c-fcca-46a0-8dee-d5f484d0b3c2.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/f8ffc50c-fcca-46a0-8dee-d5f484d0b3c2 |
| `fibery-web-views-f98d4446-7359-4727-81c5-be8ddc75f0d8.webp` | `web/views/` | Fibery list view | https://mobbin.com/screens/f98d4446-7359-4727-81c5-be8ddc75f0d8 |
| `fibery-web-views-fc6ef7fe-9a8e-4e4b-9cbd-c078290dbddd.webp` | `web/views/` | Fibery database description | https://mobbin.com/screens/fc6ef7fe-9a8e-4e4b-9cbd-c078290dbddd |
| `fibery-web-views-fcbfa233-7fc0-4236-9719-230581655db8.webp` | `web/views/` | Fibery kanban board view | https://mobbin.com/screens/fcbfa233-7fc0-4236-9719-230581655db8 |
| `fibery-web-whiteboard-00850ddb-7f39-42b2-874c-2946f4430e91.webp` | `web/whiteboard/` | Fibery rich text formatting toolbar | https://mobbin.com/screens/00850ddb-7f39-42b2-874c-2946f4430e91 |
| `fibery-web-whiteboard-0faf78da-f474-4e06-9f9f-c08ff615389d.webp` | `web/whiteboard/` | Fibery grouped board columns | https://mobbin.com/screens/0faf78da-f474-4e06-9f9f-c08ff615389d |
| `fibery-web-whiteboard-12705e4c-306c-4dbb-9c11-86a5debf129d.webp` | `web/whiteboard/` | Fibery color coding menu | https://mobbin.com/screens/12705e4c-306c-4dbb-9c11-86a5debf129d |
| `fibery-web-whiteboard-22059e28-921c-4632-a10a-28033ced36c7.webp` | `web/whiteboard/` | Fibery grouped board columns | https://mobbin.com/screens/22059e28-921c-4632-a10a-28033ced36c7 |
| `fibery-web-whiteboard-23014d15-193a-45ae-808e-e8ab2d584c32.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/23014d15-193a-45ae-808e-e8ab2d584c32 |
| `fibery-web-whiteboard-27612e4d-c803-4330-9fa3-a82ac28e99cc.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/27612e4d-c803-4330-9fa3-a82ac28e99cc |
| `fibery-web-whiteboard-30fcc021-6991-4d19-a4f4-2f78340913c2.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/30fcc021-6991-4d19-a4f4-2f78340913c2 |
| `fibery-web-whiteboard-5038a4e3-6922-41e7-8156-2487b025e229.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/5038a4e3-6922-41e7-8156-2487b025e229 |
| `fibery-web-whiteboard-5309f587-3651-4e93-9ff4-214ea39d9580.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/5309f587-3651-4e93-9ff4-214ea39d9580 |
| `fibery-web-whiteboard-7d096ccd-083b-490d-be97-dd3450ef3ae8.webp` | `web/whiteboard/` | Fibery field type picker | https://mobbin.com/screens/7d096ccd-083b-490d-be97-dd3450ef3ae8 |
| `fibery-web-whiteboard-80f77d53-0025-4e35-8a34-a9eb9c8dbc32.webp` | `web/whiteboard/` | Fibery grouped board columns | https://mobbin.com/screens/80f77d53-0025-4e35-8a34-a9eb9c8dbc32 |
| `fibery-web-whiteboard-8b68e39c-3288-471f-bef0-833efb8d9ef8.webp` | `web/whiteboard/` | Fibery color coding menu | https://mobbin.com/screens/8b68e39c-3288-471f-bef0-833efb8d9ef8 |
| `fibery-web-whiteboard-8e84e739-8f8c-4e00-8db1-e32a255c480e.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/8e84e739-8f8c-4e00-8db1-e32a255c480e |
| `fibery-web-whiteboard-98869498-692b-4c9a-97c6-d6d6ea2a97e9.webp` | `web/whiteboard/` | left sidebar navigation | https://mobbin.com/screens/98869498-692b-4c9a-97c6-d6d6ea2a97e9 |
| `fibery-web-whiteboard-9b708b5d-418a-4b41-b2a2-519ed42053ec.webp` | `web/whiteboard/` | Fibery grouped board columns | https://mobbin.com/screens/9b708b5d-418a-4b41-b2a2-519ed42053ec |
| `fibery-web-whiteboard-a5670341-2bbd-488c-b14b-d051688af3c0.webp` | `web/whiteboard/` | Fibery color coding menu | https://mobbin.com/screens/a5670341-2bbd-488c-b14b-d051688af3c0 |
| `fibery-web-whiteboard-a7b6d827-863d-4e2c-85ed-23f2d0dc2306.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/a7b6d827-863d-4e2c-85ed-23f2d0dc2306 |
| `fibery-web-whiteboard-aa198079-c02c-470f-9446-cef30fc7bf36.webp` | `web/whiteboard/` | Fibery code block | https://mobbin.com/screens/aa198079-c02c-470f-9446-cef30fc7bf36 |
| `fibery-web-whiteboard-ab6f7064-0358-46f5-8dce-9fa46e411009.webp` | `web/whiteboard/` | Fibery color coding menu | https://mobbin.com/screens/ab6f7064-0358-46f5-8dce-9fa46e411009 |
| `fibery-web-whiteboard-af871e63-3718-4893-8968-ec99e9c1ffd7.webp` | `web/whiteboard/` | left sidebar navigation | https://mobbin.com/screens/af871e63-3718-4893-8968-ec99e9c1ffd7 |
| `fibery-web-whiteboard-b18920c5-581d-4dfb-941c-44c2191e1ad5.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/b18920c5-581d-4dfb-941c-44c2191e1ad5 |
| `fibery-web-whiteboard-bbd2f5c3-573f-4c72-ad7d-554079303b02.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/bbd2f5c3-573f-4c72-ad7d-554079303b02 |
| `fibery-web-whiteboard-c18ecb2c-4cf9-4ff9-88e6-ae72e27fdd45.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/c18ecb2c-4cf9-4ff9-88e6-ae72e27fdd45 |
| `fibery-web-whiteboard-c51a3b50-26bd-450c-8752-f3d0058234a4.webp` | `web/whiteboard/` | Fibery dropdown menu | https://mobbin.com/screens/c51a3b50-26bd-450c-8752-f3d0058234a4 |
| `fibery-web-whiteboard-c8802ed3-80a8-4af0-986b-2a5fe00996c3.webp` | `web/whiteboard/` | left sidebar navigation | https://mobbin.com/screens/c8802ed3-80a8-4af0-986b-2a5fe00996c3 |
| `fibery-web-whiteboard-e645ba0b-a9f1-4d8d-86be-66ef521e0b47.webp` | `web/whiteboard/` | Fibery color coding menu | https://mobbin.com/screens/e645ba0b-a9f1-4d8d-86be-66ef521e0b47 |
| `fibery-web-whiteboard-f4e8d90d-b2d1-477b-86a9-2fe31a4bf9ac.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/f4e8d90d-b2d1-477b-86a9-2fe31a4bf9ac |
| `fibery-web-whiteboard-faad62c1-81bc-4813-93f1-b5de7fccd249.webp` | `web/whiteboard/` | Fibery kanban board view | https://mobbin.com/screens/faad62c1-81bc-4813-93f1-b5de7fccd249 |
| `fibery-web-whiteboard-fd06eec4-aad0-4072-811a-9c20811041e2.webp` | `web/whiteboard/` | Fibery table view with columns | https://mobbin.com/screens/fd06eec4-aad0-4072-811a-9c20811041e2 |
| `fibery-web-whiteboard-fd082957-c4ff-4fab-ba56-22fbd584c4da.webp` | `web/whiteboard/` | left sidebar navigation | https://mobbin.com/screens/fd082957-c4ff-4fab-ba56-22fbd584c4da |
## Index — flows

One row per flow; the flow's `mobbin_url` cites every file in its folder. Files are numbered in the order Mobbin returned them.

| Folder | Flow name (Mobbin) | Actions | Files | Found by | mobbin_url |
|--------|--------------------|---------|-------|----------|------------|
| `web/flows/accepting-an-invitation/` | Accepting an invitation | Joining & Accepting | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/49bf3863-b754-4a82-be03-bb19182051cb |
| `web/flows/activity-log/` | Activity log |  | 2 | Fibery creating a timeline view | https://mobbin.com/flows/9788c52a-c10d-48b5-bd02-51bbcb20382a |
| `web/flows/adding-a-button/` | Adding a button | Adding & Creating | 10 | Fibery onboarding after sign up | https://mobbin.com/flows/0857a31a-1619-4ec7-be07-c8a1978bd22c |
| `web/flows/adding-a-callout/` | Adding a callout | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/f99832a9-692a-4737-b058-b6b8f29190cf |
| `web/flows/adding-a-code-mermaid/` | Adding a code mermaid | Adding & Creating | 3 | Fibery creating a document | https://mobbin.com/flows/b603a790-4aa0-4fb1-bbc6-defd618cb06f |
| `web/flows/adding-a-color-coding/` | Adding a color coding | Adding & Creating | 8 | Fibery adding fields to a database | https://mobbin.com/flows/fbb851d3-72ba-45fe-b7fc-c3bcb642940a |
| `web/flows/adding-a-comment/` | Adding a comment | Commenting & Replying | 5 | Fibery creating a document | https://mobbin.com/flows/c509a51f-5ca9-47bf-aaa6-c4b9bd97def3 |
| `web/flows/adding-a-database/` | Adding a database | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/b3a0a3c3-7e68-4638-9fb8-72a86010e1ea |
| `web/flows/adding-a-description/` | Adding a description | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/793828e8-70ea-46d9-8efb-309b7df05599 |
| `web/flows/adding-a-description-2/` | Adding a description | Adding & Creating | 2 | Fibery adding a comment | https://mobbin.com/flows/e8c9225e-ff07-4edc-a1d5-b8ebdaab0374 |
| `web/flows/adding-a-document/` | Adding a document | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/05c3b8aa-959a-4132-b628-ef73a05b1b35 |
| `web/flows/adding-a-document-document/` | Adding a document (document) | Adding & Creating | 4 | Fibery creating a document | https://mobbin.com/flows/49eef56e-827a-45ac-b015-32a685c65f09 |
| `web/flows/adding-a-field/` | Adding a field | Adding & Creating, Selecting & Choosing | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/46853e27-99d9-4aa8-bfdb-dbe61f0de990 |
| `web/flows/adding-a-field-assignees/` | Adding a field (assignees) | Adding & Creating | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/85cc0d09-deaa-4602-9f6f-7a88bd083e84 |
| `web/flows/adding-a-field-date/` | Adding a field (date) | Adding & Creating | 10 | Fibery creating a database | https://mobbin.com/flows/3ba7e988-6786-4a25-a7b8-eeab2bfb0bd6 |
| `web/flows/adding-a-field-grid/` | Adding a field (grid) | Adding & Creating, Showing & Hiding | 6 | Fibery adding fields to a database | https://mobbin.com/flows/d60316f3-b284-4dcc-b677-f2b6f5f7ce19 |
| `web/flows/adding-a-field-location/` | Adding a field (location) | Adding & Creating | 6 | Fibery adding fields to a database | https://mobbin.com/flows/9eb3f162-4b5a-4167-ae7b-163eb748dd4c |
| `web/flows/adding-a-field-multi-select/` | Adding a field (multi select) | Adding & Creating | 9 | Fibery creating a database | https://mobbin.com/flows/61321f73-24e5-4ce8-ac42-bc9fe58dcbf5 |
| `web/flows/adding-a-flowchart/` | Adding a flowchart | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/74d34788-38ab-4a84-9e31-289856670b5b |
| `web/flows/adding-a-folder/` | Adding a folder | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/a13795ab-d36a-47b3-8f2a-75d72e6a6ae4 |
| `web/flows/adding-a-frame/` | Adding a frame | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/4d9e2397-f934-46b3-9957-a2e7b0c941dd |
| `web/flows/adding-a-heading/` | Adding a heading | Adding & Creating | 3 | Fibery creating a new workspace | https://mobbin.com/flows/d229ef45-d0be-482a-b2eb-2ad384d0b7ff |
| `web/flows/adding-a-highlight/` | Adding a highlight | Editing & Updating | 4 | Fibery creating a document | https://mobbin.com/flows/86065b32-a61d-4a1e-8033-a9976d41e918 |
| `web/flows/adding-a-level/` | Adding a level | Adding & Creating | 4 | Fibery creating a new workspace | https://mobbin.com/flows/533a9a02-23bc-4288-b8ad-55491512dc7a |
| `web/flows/adding-a-line/` | Adding a line | Adding & Creating | 3 | Fibery adding a comment | https://mobbin.com/flows/c346a70a-9696-4b7c-a668-09a457fedef1 |
| `web/flows/adding-a-link/` | Adding a link | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/e4c32832-6e5d-47de-b3f2-41c256f72f36 |
| `web/flows/adding-a-link-2/` | Adding a link | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/9b71085d-6e06-4955-aaa0-ce6a9e07a9c3 |
| `web/flows/adding-a-list/` | Adding a list | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/4211da89-23f0-44d0-b2d2-f0815e57aa11 |
| `web/flows/adding-a-metric-kpi/` | Adding a metric (KPI) | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/d5576838-becd-4196-aa28-4b4e812a61c8 |
| `web/flows/adding-a-metric-view/` | Adding a metric view | Adding & Creating | 4 | Fibery creating a new workspace | https://mobbin.com/flows/f4e7e246-18ae-4ecb-9606-b7d074046356 |
| `web/flows/adding-a-pie-chart/` | Adding a pie chart | Adding & Creating | 8 | Fibery picking a template | https://mobbin.com/flows/7fa9f355-1cbe-455f-adfc-0e2e8d8fe84a |
| `web/flows/adding-a-quote/` | Adding a quote | Adding & Creating | 3 | Fibery creating a new workspace | https://mobbin.com/flows/d7f48e76-4971-418d-ae5e-421e4e7948f8 |
| `web/flows/adding-a-row/` | Adding a row | Adding & Creating | 6 | Fibery creating a database | https://mobbin.com/flows/26e89909-eb0e-4383-b104-c58abd7c5031 |
| `web/flows/adding-a-rule/` | Adding a rule | Adding & Creating | 18 | Fibery setting up an automation rule | https://mobbin.com/flows/3a434286-acb0-434d-b912-68dbd7cc7a16 |
| `web/flows/adding-a-section/` | Adding a section | Adding & Creating | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/eda85707-289e-405a-b90c-4063f5d14402 |
| `web/flows/adding-a-shape/` | Adding a shape | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/96abe284-81b3-480c-9223-4f99811eb0c6 |
| `web/flows/adding-a-sticky-note/` | Adding a sticky note | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/4a10f6fb-27ab-4ff5-9fe2-703bc031c7a1 |
| `web/flows/adding-a-sticky-note-2/` | Adding a sticky note | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/63cc096a-30cb-4194-a391-c316c61b3b19 |
| `web/flows/adding-a-table-report/` | Adding a table (report) | Adding & Creating | 4 | Fibery creating a new workspace | https://mobbin.com/flows/8a081ecd-3780-41b8-b96a-1766ee0c5219 |
| `web/flows/adding-a-text-whiteboard/` | Adding a text (whiteboard) | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/4ee4d760-7c1e-4616-8cc4-532520689960 |
| `web/flows/adding-a-view-board/` | Adding a view (board) | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/2f0bc8ca-e1fb-4691-bd1f-c65945f9d7b4 |
| `web/flows/adding-a-view-calendar/` | Adding a view (calendar) | Adding & Creating | 5 | Fibery creating a database | https://mobbin.com/flows/e601788f-4c0f-4c5f-8dde-1d2e30b48f4b |
| `web/flows/adding-a-view-feed/` | Adding a view (feed) | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/62e71c90-764c-4e82-9921-b23034bcbb2c |
| `web/flows/adding-a-view-grid/` | Adding a view (grid) | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/1ba392e8-0372-4294-81d2-4bf97a3f92c4 |
| `web/flows/adding-a-view-list/` | Adding a view (list) | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/47808554-5cc4-40fb-9397-037c7eaafb22 |
| `web/flows/adding-a-view-map/` | Adding a view (map) | Adding & Creating | 7 | Fibery creating a new workspace | https://mobbin.com/flows/c20bef0e-57c4-449f-b30a-782dd4900de4 |
| `web/flows/adding-a-view-timeline/` | Adding a view (timeline) | Adding & Creating | 10 | Fibery creating a database | https://mobbin.com/flows/45410848-fa90-4ae0-b515-7e79ac0fe027 |
| `web/flows/adding-a-whiteboard/` | Adding a whiteboard | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/303145a9-88a2-4d88-baf5-839d8920b736 |
| `web/flows/adding-a-widget/` | Adding a widget | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/f6986230-5ff8-47c6-b110-fd46919ca548 |
| `web/flows/adding-a-youtube-embed/` | Adding a youtube embed | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/0ac2012b-2096-4450-9462-9d33c6bf81d8 |
| `web/flows/adding-an-api-key/` | Adding an API key | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/47473216-0a35-48a8-9107-9fb57f97c7c7 |
| `web/flows/adding-an-emoji/` | Adding an emoji | Adding & Creating | 3 | Fibery adding a comment | https://mobbin.com/flows/7ae4fb1b-f19e-4b31-88b0-460df15e14cc |
| `web/flows/adding-an-emoji-settings/` | Adding an emoji (settings) | Adding & Creating, Uploading & Downloading | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/5bfb36c8-19d1-40cf-aede-d0e1d61d64f4 |
| `web/flows/adding-an-entity/` | Adding an entity | Adding & Creating | 4 | Fibery creating a new workspace | https://mobbin.com/flows/a98013db-74cc-4ace-bfbf-f31ff386f563 |
| `web/flows/adding-an-entity-timeline/` | Adding an entity (timeline) | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/90915f50-710e-403d-9d62-08e44ab696e5 |
| `web/flows/adding-an-entity-tree/` | Adding an entity tree | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/86990ab9-db7f-425c-91e2-cc4d05ee8bf9 |
| `web/flows/adding-an-image/` | Adding an image | Uploading & Downloading | 2 | Fibery creating a document | https://mobbin.com/flows/0d591f72-ea3a-481b-925f-d54f7fb8fdab |
| `web/flows/adding-an-url/` | Adding an URL | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/8a79ca69-21ac-4928-b6c0-fbcfc424b700 |
| `web/flows/adding-color-coding-feed/` | Adding color coding (feed) | Adding & Creating | 6 | Fibery setting up an automation rule | https://mobbin.com/flows/7cedc65a-e153-4013-8d70-d18c65cfee17 |
| `web/flows/adding-color-coding-grid/` | Adding color coding (grid) | Adding & Creating | 7 | Fibery creating a kanban board view | https://mobbin.com/flows/c8534580-4b97-4f49-80d1-3b610982b0f1 |
| `web/flows/adding-columns/` | Adding columns | Adding & Creating | 4 | Fibery adding fields to a database | https://mobbin.com/flows/b78b3f36-2ea0-4637-93d5-9ee7e0b3b458 |
| `web/flows/adding-data-to-a-chart/` | Adding data to a chart | Adding & Creating | 3 | Fibery creating a database | https://mobbin.com/flows/0954051b-58f8-453a-8258-4087b555ba8e |
| `web/flows/adding-text/` | Adding text | Adding & Creating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/1245f154-72fb-4935-bd78-8b25782a795a |
| `web/flows/ai-search/` | AI search |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/d54b4d67-0f25-4006-92bf-7ba789bf4ed2 |
| `web/flows/arranging-cards-by-column/` | Arranging cards by column | Editing & Updating | 4 | Fibery creating a kanban board view | https://mobbin.com/flows/62393fa2-aecc-443f-a76a-320fc360f251 |
| `web/flows/arranging-cards-by-rows/` | Arranging cards by rows | Editing & Updating | 4 | Fibery creating a kanban board view | https://mobbin.com/flows/5f18ac11-8ea6-4d85-905f-f582955ec958 |
| `web/flows/audit-log/` | Audit log |  | 3 | Fibery creating a timeline view | https://mobbin.com/flows/dbc04118-5d58-4294-9393-f95b3c8b1eca |
| `web/flows/backlog/` | Backlog |  | 3 | Fibery creating a kanban board view | https://mobbin.com/flows/45352e63-eb26-4943-afa4-484b46421ca6 |
| `web/flows/browse-feed/` | Browse feed |  | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/0c95babd-fe0d-4a9e-85e9-e173e409120d |
| `web/flows/button-activity/` | Button activity |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/1ce38924-b678-4efa-a78f-09cc11bad054 |
| `web/flows/card-detail/` | Card detail |  | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/6ed850d0-b74e-4adf-aaf8-f3960d5092cb |
| `web/flows/changing-map-style/` | Changing map style | Editing & Updating | 3 | Fibery changing workspace settings | https://mobbin.com/flows/1a4b2d60-1b4e-4426-aae2-dbf8a10da0f8 |
| `web/flows/chart-data/` | Chart data |  | 3 | Fibery creating a table view | https://mobbin.com/flows/dff6c7b5-d23c-4731-9b5f-93c5a72d1975 |
| `web/flows/chart-data-2/` | Chart data |  | 3 | Fibery creating a table view | https://mobbin.com/flows/e63e18a8-b657-4735-a73d-867e085094ef |
| `web/flows/chatting-with-ai/` | Chatting with AI | Chatting & Sending Messages | 3 | Fibery creating a new workspace | https://mobbin.com/flows/a2b862f6-04f8-4cd4-b0bc-0f52440296aa |
| `web/flows/commenting-on-a-text/` | Commenting on a text | Commenting & Replying | 6 | Fibery creating a document | https://mobbin.com/flows/db661b9b-56af-448a-9d49-4fea2e0eaa8a |
| `web/flows/commenting-on-a-whiteboard/` | Commenting on a whiteboard | Commenting & Replying | 5 | Fibery adding a comment | https://mobbin.com/flows/6d3bd4b9-9885-4b12-90f8-4724cefac9c6 |
| `web/flows/connecting-to-github/` | Connecting to Github | Connecting & Linking | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/34fa0f19-a738-4b5f-a459-9459030f8031 |
| `web/flows/connecting-to-slack/` | Connecting to Slack | Connecting & Linking | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/8466300e-56f4-4e69-8050-669573f67aba |
| `web/flows/converting-text-to-entity/` | Converting text to entity | Misc | 6 | Fibery creating a database | https://mobbin.com/flows/fb654193-6023-4a16-ba18-a68abd309008 |
| `web/flows/copying-a-link/` | Copying a link | Copying & Duplicating | 2 | Fibery sharing a page | https://mobbin.com/flows/9fd7681e-e7c2-4cdc-82b2-7e10b7d6feaf |
| `web/flows/copying-a-view-to-my-space/` | Copying a view to My Space | Copying & Duplicating | 3 | Fibery creating a new workspace | https://mobbin.com/flows/50b140c4-ea6e-46ab-872c-eefd8ebd1340 |
| `web/flows/create-a-new-workspace/` | Create a new workspace |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/381b62cc-9b4d-48a2-9c62-42d996a81ce7 |
| `web/flows/creating-a-calendar/` | Creating a calendar | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/d944ead2-a12d-4b54-8ff8-e666ff985ef5 |
| `web/flows/creating-a-custom-emoji/` | Creating a custom emoji | Adding & Creating, Uploading & Downloading | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/0fb01664-6246-431a-8e53-a7977a2ad563 |
| `web/flows/creating-a-database/` | Creating a database | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/81012e0b-f9e6-421d-afb5-0a28a03fd83f |
| `web/flows/creating-a-document/` | Creating a document | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/2b08f5bb-8fdf-4ccc-8d88-1bb8aa0e42c9 |
| `web/flows/creating-a-document-with-ai/` | Creating a document with AI | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/36e03ba2-42f4-4d55-95c9-fb37f906d0db |
| `web/flows/creating-a-field/` | Creating a field | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/1fddf8bf-cf99-4115-a58a-ff0c3031ddd9 |
| `web/flows/creating-a-folder/` | Creating a folder | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/52b1a238-d478-4b1a-97ae-e8c1c47f2cc3 |
| `web/flows/creating-a-form/` | Creating a form | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/205d128d-cc67-4eb2-b013-1a41c84985bc |
| `web/flows/creating-a-form-2/` | Creating a form | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/44e3ce01-8b9d-4e83-b810-65d2d27eecf2 |
| `web/flows/creating-a-new-space/` | Creating a new space | Adding & Creating, Searching & Finding | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/47d4499e-e08d-4323-9990-ea944dd4da9e |
| `web/flows/creating-a-report/` | Creating a report | Adding & Creating | 9 | Fibery onboarding after sign up | https://mobbin.com/flows/1e0a24b2-08e2-42e8-861d-1d28527fc8b3 |
| `web/flows/creating-a-report-2/` | Creating a report | Adding & Creating, Selecting & Choosing | 9 | Fibery creating a new workspace | https://mobbin.com/flows/a00125f5-6bca-40ac-a0fd-74ada152edff |
| `web/flows/creating-a-smart-folder/` | Creating a smart folder | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/a5816518-3ad6-4e9f-86c5-a4dedd9a59a9 |
| `web/flows/creating-a-space/` | Creating a space | Adding & Creating, Searching & Finding, Selecting & Choosing | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/e9a77426-2eb1-491e-8bdf-d9b239be3d84 |
| `web/flows/creating-a-table/` | Creating a table | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/c825ff93-f5e8-4462-8baa-a50fd5ad7c76 |
| `web/flows/creating-a-view-with-ai/` | Creating a view with AI | Adding & Creating | 5 | Fibery creating a kanban board view | https://mobbin.com/flows/f77b1205-995a-4414-850b-2f95e66c3281 |
| `web/flows/creating-a-whiteboard/` | Creating a whiteboard | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/a04d403b-104f-47f7-91b8-018aadaf48e9 |
| `web/flows/creating-a-workspace/` | Creating a workspace | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/5de958ac-abff-443a-a26c-0d70a35aa0e8 |
| `web/flows/creating-an-entity-monthly-calendar/` | Creating an entity (monthly calendar) | Adding & Creating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/3f2ccc77-b080-42ba-9323-8319159fee48 |
| `web/flows/creating-an-entity-weekly-calendar/` | Creating an entity (weekly calendar) | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/0e14a1e2-233f-4045-9c7e-4863b30ab622 |
| `web/flows/creating-an-indented-list/` | Creating an indented list | Adding & Creating | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/0732e6b3-0c48-42e2-96dd-1db36f621364 |
| `web/flows/deactivating-a-user/` | Deactivating a user | Deleting & Removing | 4 | Fibery inviting team members | https://mobbin.com/flows/749dba50-6991-41c8-9c55-5c7761f24261 |
| `web/flows/deleting-a-chat-history/` | Deleting a chat history | Deleting & Removing | 5 | Fibery app | https://mobbin.com/flows/2991066b-21a9-4f68-a210-d317680a8b66 |
| `web/flows/deleting-a-document/` | Deleting a document | Deleting & Removing | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/05e5253d-d025-43cf-9122-5324e6ca2f7d |
| `web/flows/deleting-a-field/` | Deleting a field | Deleting & Removing | 5 | Fibery adding fields to a database | https://mobbin.com/flows/8a5f0633-a5e3-4bcb-860c-85ee53734b5d |
| `web/flows/deleting-a-space/` | Deleting a space | Deleting & Removing | 4 | Fibery creating a new workspace | https://mobbin.com/flows/2ff76a66-f557-45ca-9c2d-bc9c0d6be0aa |
| `web/flows/deleting-a-widget/` | Deleting a widget | Deleting & Removing | 3 | Fibery changing workspace settings | https://mobbin.com/flows/24d1cb6e-0d1d-4e66-87c2-1b8c2a952122 |
| `web/flows/deleting-a-workspace/` | Deleting a workspace | Deleting & Removing | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/3e0b8e20-bfd7-4f7b-8085-96627a8f1918 |
| `web/flows/deleting-a-workspace-2/` | Deleting a workspace | Deleting & Removing | 4 | Fibery creating a new workspace | https://mobbin.com/flows/1a7865fb-5211-4de7-8640-7a4f246c1b87 |
| `web/flows/deleting-entities/` | Deleting entities | Deleting & Removing | 5 | Fibery editing an entity | https://mobbin.com/flows/4cb8c8fc-f057-41f5-9dc5-4c5deb7e53a9 |
| `web/flows/deleting-space-data/` | Deleting space data | Deleting & Removing | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/9226b350-8b1e-4532-b158-1a384029a3d9 |
| `web/flows/drawing-on-a-whiteboard/` | Drawing on a whiteboard | Drawing | 3 | Fibery creating a document | https://mobbin.com/flows/c8467443-a42d-4b1a-bc12-115cef66c39e |
| `web/flows/drawing-on-whiteboard/` | Drawing on whiteboard | Drawing | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/87833516-6f5b-4e2e-b77e-336f872e229d |
| `web/flows/duplicating-a-color/` | Duplicating a color | Copying & Duplicating | 3 | Fibery app | https://mobbin.com/flows/271d89f1-4515-4393-894c-4dd5d535780a |
| `web/flows/edit-a-calculation/` | Edit a calculation | Showing & Hiding | 5 | Fibery creating a table view | https://mobbin.com/flows/8ca3565b-e1dc-424c-b1f6-f98e6d55da4c |
| `web/flows/edit-data-source/` | Edit data source |  | 2 | Fibery adding fields to a database | https://mobbin.com/flows/e5aec5a8-507b-419d-bfbb-f6370ba9d898 |
| `web/flows/editing-a-field/` | Editing a field | Editing & Updating | 6 | Fibery adding fields to a database | https://mobbin.com/flows/c2ee274e-93f0-45aa-9a6b-541e7672bcde |
| `web/flows/editing-a-form-field/` | Editing a form field | Editing & Updating | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/3efb6f78-a69f-4896-a610-5272128bb2e1 |
| `web/flows/editing-a-shape/` | Editing a shape | Editing & Updating | 8 | Fibery changing workspace settings | https://mobbin.com/flows/7d0f32e1-6288-419d-bac6-56abdb4812b4 |
| `web/flows/editing-ai-prompt/` | Editing AI prompt | Editing & Updating | 6 | Fibery changing workspace settings | https://mobbin.com/flows/e4ea2114-a6b8-43a6-a3fa-777b42b888e6 |
| `web/flows/editing-chart-axis/` | Editing chart axis | Editing & Updating | 7 | Fibery creating a timeline view | https://mobbin.com/flows/7e264fc9-182f-4c46-b0a7-9f1da581e4c7 |
| `web/flows/editing-chart-color/` | Editing chart color | Editing & Updating | 3 | Fibery changing workspace settings | https://mobbin.com/flows/fa8b371f-9f41-4144-a320-197dbd7f5de2 |
| `web/flows/editing-column-settings/` | Editing column settings | Editing & Updating | 4 | Fibery creating a table view | https://mobbin.com/flows/d8b430d2-0654-4582-9d4c-e7c81a10f75b |
| `web/flows/editing-cover-image/` | Editing cover image | Editing & Updating | 4 | Fibery picking a template | https://mobbin.com/flows/41def0b3-0665-4574-ab66-12f7ba1d2c66 |
| `web/flows/editing-database-relations/` | Editing database relations | Connecting & Linking, Editing & Updating | 9 | Fibery onboarding after sign up | https://mobbin.com/flows/9a50b51d-b802-494e-b54d-7064f9cbdf52 |
| `web/flows/editing-field-size/` | Editing field size | Editing & Updating | 3 | Fibery adding fields to a database | https://mobbin.com/flows/29f2fe2b-7ba8-476f-9750-ae24ecd56046 |
| `web/flows/editing-format-settings/` | Editing format settings | Editing & Updating | 5 | Fibery creating a table view | https://mobbin.com/flows/2799ac8d-acd3-407d-b287-4a799938b90f |
| `web/flows/editing-notifications/` | Editing notifications | Turning On/Off | 4 | Fibery changing workspace settings | https://mobbin.com/flows/d994de8a-1f1d-424d-9138-a9ae7f4f5620 |
| `web/flows/editing-space-details/` | Editing space details | Editing & Updating | 5 | Fibery creating a new workspace | https://mobbin.com/flows/99ae767c-4e31-43da-8d00-e7759cdf1dde |
| `web/flows/editing-user-card/` | Editing user card | Connecting & Linking, Editing & Updating | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/3c249ce1-d004-4483-898c-d8f4a4c49951 |
| `web/flows/embedding-a-view/` | Embedding a view | Adding & Creating | 10 | Fibery onboarding after sign up | https://mobbin.com/flows/bac01e02-7909-4d69-b25a-58d7f9c797c6 |
| `web/flows/enabling-invite-by-link/` | Enabling invite by link | Enabling & Disabling | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/eadfef0a-5aec-4e70-9416-620f524a4c63 |
| `web/flows/encoding-a-field-size/` | Encoding a field (size) | Editing & Updating | 3 | Fibery adding fields to a database | https://mobbin.com/flows/8aaf2a16-ed19-4a2e-a15f-3ba73f905e98 |
| `web/flows/executing-a-button/` | Executing a button | Misc, Selecting & Choosing | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/36817ad5-40df-4308-8cc4-8521f1760988 |
| `web/flows/exporting-workspace/` | Exporting workspace | Importing & Exporting | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/a0a5396d-6d2f-4954-8a6d-2420ffd8c86f |
| `web/flows/exporting-workspace-2/` | Exporting workspace | Importing & Exporting | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/76b0a422-bd12-448e-908b-182837221dad |
| `web/flows/favoriting-a-report/` | Favoriting a report | Favoriting & Pinning | 2 | Fibery creating a new workspace | https://mobbin.com/flows/625fe9cd-4800-4777-a1b7-d8b0f0fdfeda |
| `web/flows/favoriting-a-view/` | Favoriting a view | Saving to Collection | 2 | Fibery adding a comment | https://mobbin.com/flows/5e609291-f7a2-462c-8e35-7ffbc85af9fd |
| `web/flows/fibery-ai/` | Fibery AI |  | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/abfbc122-c490-451a-b68b-86dab551c634 |
| `web/flows/filtering-activity-log/` | Filtering activity log | Filtering & Sorting | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/e6fafa4e-42da-4874-a9f5-8f88b69ae875 |
| `web/flows/filtering-assignees/` | Filtering assignees | Filtering & Sorting | 5 | Fibery filtering and sorting a table | https://mobbin.com/flows/0f1b412b-ba06-4c42-af16-eb49137c6fa6 |
| `web/flows/filtering-source-data/` | Filtering source data | Editing & Updating, Filtering & Sorting, Showing & Hiding | 9 | Fibery filtering and sorting a table | https://mobbin.com/flows/9ab556e7-b67b-4adf-92cf-e8a52dd217c8 |
| `web/flows/filtering-table/` | Filtering table | Filtering & Sorting | 3 | Fibery creating a table view | https://mobbin.com/flows/8e6565ab-7c08-418f-abbc-858b1ef741d0 |
| `web/flows/formatting-text/` | Formatting text | Editing & Updating | 3 | Fibery creating a document | https://mobbin.com/flows/ab65c8c5-b84a-45c3-b9ff-2d46d98daae7 |
| `web/flows/formatting-text-2/` | Formatting text | Editing & Updating | 7 | Fibery creating a document | https://mobbin.com/flows/a0b7df3d-117a-40f1-9647-51e6a0a825f2 |
| `web/flows/formatting-text-whiteboard/` | Formatting text (whiteboard) | Editing & Updating | 5 | Fibery changing workspace settings | https://mobbin.com/flows/b21a43c7-ed30-4c11-bf92-cf0122b468ad |
| `web/flows/generating-a-name-with-formula/` | Generating a name with formula | Adding & Creating | 5 | Fibery creating a database | https://mobbin.com/flows/73f8b699-9b42-46d0-a432-e685e438464c |
| `web/flows/generating-an-api-key/` | Generating an API key | Adding & Creating | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/2fcc39c7-9ffc-4b2e-83d4-120d29f78e85 |
| `web/flows/getting-started/` | Getting started | Browsing Tutorial, Showing & Hiding | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/26793ddd-50cf-492c-a76a-5ebaf538b27f |
| `web/flows/grouping-by-type/` | Grouping by type | Editing & Updating | 4 | Fibery creating a kanban board view | https://mobbin.com/flows/34f2349a-03da-4cae-81ed-6d87a1723862 |
| `web/flows/hiding-a-chat/` | Hiding a chat | Showing & Hiding | 2 | Fibery creating a new workspace | https://mobbin.com/flows/16f6f9de-8248-4a26-a76e-588278b28920 |
| `web/flows/hiding-card-fields-all/` | Hiding card fields (all) | Showing & Hiding | 2 | Fibery creating a kanban board view | https://mobbin.com/flows/e31b19ce-c16f-46fa-adb0-5ae2b604111a |
| `web/flows/hiding-card-fields-individual/` | Hiding card fields (individual) | Showing & Hiding | 4 | Fibery editing an entity | https://mobbin.com/flows/f29cab9c-7725-4526-a11f-c446242e3c5d |
| `web/flows/hiding-databases/` | Hiding databases | Showing & Hiding | 2 | Fibery creating a new workspace | https://mobbin.com/flows/4f747271-0372-4f66-be7f-995f6bfecbc3 |
| `web/flows/home/` | Home |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/b4dc48a4-b1a8-4de2-ac4b-386dde3616b1 |
| `web/flows/importing-a-csv/` | Importing a CSV | Importing & Exporting, Uploading & Downloading | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/b74631cd-e3b7-4273-8803-0eebaff0d350 |
| `web/flows/importing-data-into-database/` | Importing data into database | Importing & Exporting | 7 | Fibery creating a database | https://mobbin.com/flows/9d7f8560-a1ab-4821-b123-7ff4db328f9d |
| `web/flows/inbox/` | Inbox |  | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/ad18111a-752e-42e3-92d3-5a1efa40d308 |
| `web/flows/inbox-2/` | Inbox |  | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/738b63b8-f9a6-4934-8c83-5373aa001d1e |
| `web/flows/indexing-a-database/` | Indexing a database | Misc | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/a85d829d-7461-4c60-9ee0-c1b065681c59 |
| `web/flows/inserting-a-card/` | Inserting a card | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/e2b86273-75c5-4ea6-897f-d0ca0553a469 |
| `web/flows/installing-a-template/` | Installing a template | Adding & Creating | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/b36ff176-d2b8-4c87-8731-c236b3b25aa4 |
| `web/flows/inviting-a-teammate/` | Inviting a teammate | Inviting Teammates & Friends | 10 | Fibery onboarding after sign up | https://mobbin.com/flows/8fafe082-2716-4c06-a7e1-937aba52bb4d |
| `web/flows/inviting-a-user/` | Inviting a user | Inviting Teammates & Friends | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/8b19b937-ed84-4075-bc2c-01dff5e6aa80 |
| `web/flows/keyboard-shortcuts/` | Keyboard shortcuts |  | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/01e2d7b9-4824-48ae-80d1-41e72a928056 |
| `web/flows/linking-to-an-entity/` | Linking to an entity | Connecting & Linking, Filtering & Sorting | 7 | Fibery creating a document | https://mobbin.com/flows/6a21c522-e00d-45f5-8916-f338f827d1f6 |
| `web/flows/logging-in/` | Logging in | Logging In | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/f99ad2fa-1530-4fea-9bec-9b1842b07214 |
| `web/flows/logging-in-2/` | Logging in | Logging In | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/6d84b7be-81e6-4577-bc58-95eeb9a8e822 |
| `web/flows/logging-out/` | Logging out | Logging Out | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/ebf8f7ca-c18a-4452-a716-f2ba39ee043e |
| `web/flows/logging-out-2/` | Logging out | Logging Out | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/d8c1aa24-8604-4df6-b2f3-a1839319f177 |
| `web/flows/map/` | Map |  | 2 | Fibery creating a table view | https://mobbin.com/flows/7f8f3748-7237-4688-8bd0-9ae69d0a0f83 |
| `web/flows/marking-notification-as-done/` | Marking notification as done | Marking | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/f2708eee-bd34-4832-9a1d-f7b4df7688dd |
| `web/flows/moving-a-data-to-a-folder/` | Moving a data to a folder | Moving | 3 | Fibery creating a new workspace | https://mobbin.com/flows/fb0a9948-e81e-4b84-bd17-96525b7ea125 |
| `web/flows/moving-a-view-into-folder/` | Moving a view into folder | Moving | 4 | Fibery creating a new workspace | https://mobbin.com/flows/84552f29-6ca7-4f06-bc3e-52b0f0208456 |
| `web/flows/onboarding/` | Onboarding | Creating Account, Onboarding, Verifying | 19 | Fibery onboarding after sign up | https://mobbin.com/flows/028cdf95-4b10-4eb0-a0be-44f333ab340a |
| `web/flows/onboarding-2/` | Onboarding | Chatting & Sending Messages, Creating Account, Onboarding | 13 | Fibery onboarding after sign up | https://mobbin.com/flows/29fb7c78-a121-4e97-8f6d-ea12fa4a340b |
| `web/flows/opening-search-in-a-panel/` | Opening search in a panel | Showing & Hiding | 2 | Fibery searching the workspace | https://mobbin.com/flows/3537fad8-dc07-4db2-85d7-7eb9c1dd32ce |
| `web/flows/pinning-a-column/` | Pinning a column | Favoriting & Pinning | 3 | Fibery adding fields to a database | https://mobbin.com/flows/6a0da3e5-cdb2-484e-9652-c0b15779b391 |
| `web/flows/pricing/` | Pricing |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/86ca54b7-6c39-458a-b889-ef685188e860 |
| `web/flows/profile/` | Profile |  | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/ce1f2486-db18-4a87-88a3-1debcad86001 |
| `web/flows/renaming-a-report/` | Renaming a report | Editing & Updating | 4 | Fibery creating a new workspace | https://mobbin.com/flows/7bd46497-9e2d-49d6-b42b-1f374a473a26 |
| `web/flows/reordering-card-fields/` | Reordering card fields | Reordering | 3 | Fibery adding fields to a database | https://mobbin.com/flows/2e214a1e-47d6-4440-8d0e-8017f36f8c06 |
| `web/flows/reordering-cards/` | Reordering cards | Reordering | 3 | Fibery creating a kanban board view | https://mobbin.com/flows/50af0d76-2423-4f53-a5a6-79c16cef926e |
| `web/flows/reordering-field-options/` | Reordering field options | Reordering | 5 | Fibery creating a kanban board view | https://mobbin.com/flows/a6729e0b-9c45-485a-8f79-6679e18f13e6 |
| `web/flows/reordering-widgets/` | Reordering widgets | Reordering | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/f50bfa12-687c-4bf3-ae6d-1eabaa5dec11 |
| `web/flows/resetting-invite-link/` | Resetting invite link | Editing & Updating | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/3f6c4d9c-e48f-46e5-aa11-dc1670237161 |
| `web/flows/resetting-password/` | Resetting password | Resetting Password | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/058e0048-4f06-444d-9b81-e706cc5dfa6f |
| `web/flows/resetting-password-2/` | Resetting password | Resetting Password | 7 | Fibery onboarding after sign up | https://mobbin.com/flows/e163787b-30e9-4bfd-a973-e469529bbda4 |
| `web/flows/responding-to-ai/` | Responding to AI | Chatting & Sending Messages | 4 | Fibery editing an entity | https://mobbin.com/flows/fc259aa3-8efd-497c-9c61-190d990ac5ee |
| `web/flows/restoring-a-file/` | Restoring a file | Misc | 2 | Fibery searching the workspace | https://mobbin.com/flows/d4a5e0e9-b018-4dd1-8b2f-6ce38d79f530 |
| `web/flows/restoring-a-version-history/` | Restoring a version history | Misc | 5 | Fibery creating a document | https://mobbin.com/flows/71127812-83d9-4494-b8a4-fb57a1162d7f |
| `web/flows/restoring-item-from-trash/` | Restoring item from trash | Deleting & Removing | 4 | Fibery searching the workspace | https://mobbin.com/flows/6314a073-c918-4569-b7f2-3227f7f680e9 |
| `web/flows/searching-fibery/` | Searching Fibery | Searching & Finding | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/c4447ff7-18fc-4884-88e0-48863fe0aaf1 |
| `web/flows/searching-fibery-2/` | Searching Fibery | Searching & Finding | 3 | Fibery searching the workspace | https://mobbin.com/flows/c4a70340-a2c6-4890-aa9b-fe3792b65718 |
| `web/flows/searching-table/` | Searching table | Searching & Finding | 3 | Fibery creating a table view | https://mobbin.com/flows/c059d3be-6796-4552-b0c7-d4de445d4eed |
| `web/flows/searching-workspace/` | Searching workspace | Searching & Finding | 3 | Fibery creating a new workspace | https://mobbin.com/flows/872a7de1-e2d5-4a68-8c9c-6f3a199ce586 |
| `web/flows/selecting-chart-type/` | Selecting chart type | Selecting & Choosing | 5 | Fibery changing workspace settings | https://mobbin.com/flows/822f7b09-a65f-4dcc-bd6d-458c299cbe2b |
| `web/flows/selecting-from-multi-select/` | Selecting from multi select | Selecting & Choosing | 5 | Fibery adding fields to a database | https://mobbin.com/flows/bf58943a-c1b2-444c-8de4-c9637e8a7802 |
| `web/flows/setting-up-table/` | Setting up table | Setting Up | 5 | Fibery creating a new workspace | https://mobbin.com/flows/d01d6107-2d47-4720-b53b-b0d1e1870590 |
| `web/flows/settings/` | Settings |  | 8 | Fibery onboarding after sign up | https://mobbin.com/flows/bdb725b6-0bb3-4f21-93a0-0d3a7d4a249f |
| `web/flows/settings-2/` | Settings |  | 13 | Fibery onboarding after sign up | https://mobbin.com/flows/b295ffc5-186a-49a8-9858-907c801e1590 |
| `web/flows/share-a-space/` | Share a space |  | 3 | Fibery creating a new workspace | https://mobbin.com/flows/4710b1b4-a224-4d23-b2e1-44d48447eb67 |
| `web/flows/sharing-a-form/` | Sharing a form | Copying & Duplicating, Sharing | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/5065f126-8320-460e-aa00-13489e252b06 |
| `web/flows/sharing-a-space-as-template/` | Sharing a space as template | Sharing | 5 | Fibery creating a new workspace | https://mobbin.com/flows/fb90a411-25bc-4d0b-8193-a07e4f101d75 |
| `web/flows/sharing-a-template/` | Sharing a template | Copying & Duplicating, Sharing, Switching View | 6 | Fibery creating a new workspace | https://mobbin.com/flows/ed402c3c-1b43-44e9-bbfb-d230f4f46da5 |
| `web/flows/sorting-table/` | Sorting table | Filtering & Sorting | 5 | Fibery creating a kanban board view | https://mobbin.com/flows/e9a76148-b3f4-404d-afd4-15c7309887af |
| `web/flows/sorting-view/` | Sorting view | Filtering & Sorting | 3 | Fibery creating a kanban board view | https://mobbin.com/flows/990c7517-706d-406e-87a1-1e9feaaa870b |
| `web/flows/submitting-a-form/` | Submitting a form | Misc | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/1c313a6b-81bb-4d0d-89b5-1eec073c9c53 |
| `web/flows/subscribe-to-a-plan/` | Subscribe to a plan |  | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/79105605-68cd-4d0d-8939-288fc7ea4b95 |
| `web/flows/switching-chart-view/` | Switching chart view | Switching View | 2 | Fibery changing workspace settings | https://mobbin.com/flows/f414308a-c754-4c02-9db2-3ab5b665eaa3 |
| `web/flows/switching-to-dark-mode/` | Switching to dark mode | Switching to Dark Mode | 6 | Fibery creating a new workspace | https://mobbin.com/flows/127fb2e6-a0f0-4cef-b4dc-b231053fb3a4 |
| `web/flows/switching-to-dark-mode-2/` | Switching to dark mode | Switching to Dark Mode | 4 | Fibery changing workspace settings | https://mobbin.com/flows/f8ebbbf3-45b7-4359-9d90-ef9e9e006313 |
| `web/flows/switching-to-weekly-view/` | Switching to weekly view | Switching View | 5 | Fibery creating a calendar view | https://mobbin.com/flows/e8366a93-3e1e-459f-aee3-5f654d4a3268 |
| `web/flows/switching-workspaces/` | Switching workspaces | Switching Account | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/6e2406ff-a720-4a8a-9d2a-11fdfd607179 |
| `web/flows/tagging-a-person/` | Tagging a person | Adding & Creating | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/87524905-040f-4024-8b64-bb66b2fa0db1 |
| `web/flows/timeline-detail/` | Timeline detail |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/3cc6077f-3ebd-451c-83d7-4e87b0c427c9 |
| `web/flows/trash/` | Trash |  | 2 | Fibery creating a kanban board view | https://mobbin.com/flows/68e04e39-5cf5-44a9-a51b-9f8571667027 |
| `web/flows/trash-bin/` | Trash bin |  | 2 | Fibery searching the workspace | https://mobbin.com/flows/bbc4f63c-3cfe-480e-8cfe-5b9eec72caf5 |
| `web/flows/turning-on-a-group/` | Turning on a group | Editing & Updating | 2 | Fibery creating a table view | https://mobbin.com/flows/ab38b0aa-2c21-490b-ae7b-9e1e15a156af |
| `web/flows/updating-a-cover/` | Updating a cover | Editing & Updating | 3 | Fibery changing workspace settings | https://mobbin.com/flows/afda915d-fd32-4ff1-bff8-482c4f1b5e23 |
| `web/flows/updating-a-preference/` | Updating a preference | Editing & Updating | 2 | Fibery changing workspace settings | https://mobbin.com/flows/e1f918b1-a3ed-495a-94b2-6a8df7915397 |
| `web/flows/updating-a-profile-picture/` | Updating a profile picture | Editing Profile, Uploading & Downloading | 2 | Fibery onboarding after sign up | https://mobbin.com/flows/9515d675-e531-4856-81e5-75df03b61749 |
| `web/flows/updating-an-email/` | Updating an email | Editing Profile | 6 | Fibery onboarding after sign up | https://mobbin.com/flows/12d32432-2a95-4ebe-90d5-f6b8a7ad5ca0 |
| `web/flows/updating-workspace-information/` | Updating workspace information | Editing & Updating, Uploading & Downloading | 3 | Fibery onboarding after sign up | https://mobbin.com/flows/fe1ab580-fb67-4b2e-aa0f-0d5085fdc9b8 |
| `web/flows/uploading-logo/` | Uploading logo | Editing Profile, Uploading & Downloading | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/046efe85-5b8b-459e-bd75-bfda19d84c88 |
| `web/flows/uploading-profile-picture/` | Uploading profile picture | Editing Profile, Uploading & Downloading | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/1cb23f98-035f-4c53-b1c7-0a0c5dbd5963 |
| `web/flows/users/` | Users |  | 5 | Fibery onboarding after sign up | https://mobbin.com/flows/022ecd08-d433-412d-9567-ebe02033a605 |
| `web/flows/using-ai/` | Using AI | Adding & Creating | 6 | Fibery creating a document | https://mobbin.com/flows/48354c59-591f-473c-98b5-3d9b78de3840 |
| `web/flows/workspace/` | Workspace |  | 4 | Fibery onboarding after sign up | https://mobbin.com/flows/67cee837-3beb-43cd-a034-061e980115ef |
| `web/flows/workspace-map/` | Workspace map |  | 2 | Fibery creating a new workspace | https://mobbin.com/flows/5ae8a83b-3bfa-47f6-ad36-8307fef6e5c4 |

## Manifest

Nothing in this folder has a `tools/screenshots/manifest.json` entry — `manifest-schema.mjs` accepts only
`group: "project-manager"` for `source: "reference"`, and these are third-party previews with no in-repo
source. `npm run screenshots:verify` walks `manifest.scenarios` and so does not see this folder, exactly as
it does not see `screenshots/anytype/`.
