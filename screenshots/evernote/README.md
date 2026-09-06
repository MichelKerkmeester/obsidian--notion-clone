# Evernote — capture index

Everything in this folder is a reference capture of Evernote's iOS app and web app, harvested from
[Mobbin](https://mobbin.com) through its MCP search tools on 2026-09-06, for comparing our surfaces
against Evernote. Like `screenshots/anytype/`, it is not tracked by `tools/screenshots/manifest.json`:
nothing here is rendered from this repository's source, so the freshness verifier has nothing to hash
it against. Every image below is cited by its Mobbin URL; the images are Mobbin's thumbnails and are
kept here for internal, non-commercial product comparison only.

## Layout — how to find a capture

Grouped by platform, then by subject. Flow captures sit under `flows/<flow-name>/` in the order Mobbin
gives them. The filename carries the platform, the group, a slug describing what is visible, and the
full Mobbin screen id, so any capture can be traced back to its source without this table.

| Folder | Holds | How to find it |
|--------|-------|-----------------|
| `ios/calendar/` | 1 ios search-screen captures | Calendar and events |
| `ios/dialogs/` | 1 ios search-screen captures | Alerts, confirmations, modal dialogs |
| `ios/editor/` | 23 ios search-screen captures | Note editing, formatting toolbar, insert menus |
| `ios/empty-state/` | 2 ios search-screen captures | Screens whose main content is an empty state |
| `ios/home/` | 8 ios search-screen captures | Home screen and widgets |
| `ios/menus/` | 5 ios search-screen captures | Context menus, action sheets, popovers, dropdowns |
| `ios/misc/` | 1 ios search-screen captures | Anything else; see the description |
| `ios/notebooks/` | 3 ios search-screen captures | Notebook lists and management |
| `ios/notes/` | 15 ios search-screen captures | Note lists, notebook browsing, note cards |
| `ios/onboarding/` | 4 ios search-screen captures | Welcome, sign up, log in, first run |
| `ios/search/` | 10 ios search-screen captures | Search input, results, filters |
| `ios/settings/` | 8 ios search-screen captures | Settings, preferences, account, profile, team admin |
| `ios/sharing/` | 1 ios search-screen captures | Share sheet, invite, public link |
| `ios/sheets/` | 8 ios search-screen captures | Bottom sheets and pickers that are not menus |
| `ios/tags/` | 1 ios search-screen captures | Tag list and picker |
| `ios/tasks/` | 10 ios search-screen captures | Task lists, task detail, reminders |
| `ios/templates/` | 4 ios search-screen captures | Template gallery and picker |
| `ios/flows/<flow-name>/` | 450 files in 105 folders: 105 Mobbin flows, every screen in position order | Pick the folder named after the journey (e.g. `onboarding/`, `creating-a-note/`); a folder holds every flow of that name, told apart by the 8-character flow id in the filename |
| `web/calendar/` | 11 web search-screen captures | Calendar and events |
| `web/dialogs/` | 9 web search-screen captures | Alerts, confirmations, modal dialogs |
| `web/editor/` | 2 web search-screen captures | Note editing, formatting toolbar, insert menus |
| `web/empty-state/` | 2 web search-screen captures | Screens whose main content is an empty state |
| `web/home/` | 30 web search-screen captures | Home screen and widgets |
| `web/marketing/` | 1 web search-screen captures | Public website pages |
| `web/menus/` | 4 web search-screen captures | Context menus, action sheets, popovers, dropdowns |
| `web/misc/` | 1 web search-screen captures | Anything else; see the description |
| `web/notebooks/` | 8 web search-screen captures | Notebook lists and management |
| `web/notes/` | 6 web search-screen captures | Note lists, notebook browsing, note cards |
| `web/onboarding/` | 9 web search-screen captures | Welcome, sign up, log in, first run |
| `web/search/` | 3 web search-screen captures | Search input, results, filters |
| `web/settings/` | 10 web search-screen captures | Settings, preferences, account, profile, team admin |
| `web/sharing/` | 1 web search-screen captures | Share sheet, invite, public link |
| `web/tasks/` | 8 web search-screen captures | Task lists, task detail, reminders |
| `web/flows/<flow-name>/` | 897 files in 136 folders: 170 Mobbin flows, every screen in position order | Pick the folder named after the journey (e.g. `onboarding/`, `creating-a-note/`); a folder holds every flow of that name, told apart by the 8-character flow id in the filename |

## Counts

| Platform | Search-screen captures | Flows | Flow screen files | Unique screen ids on disk |
|---|---|---|---|---|
| ios | 105 | 105 | 450 | 345 |
| web | 105 | 170 | 897 | 724 |

A screen that opens several flows is copied into each flow folder so every folder reads as a complete
sequence, and a search-screen capture is also kept in its group folder. The unique-id column is the
true number of distinct Mobbin screens per platform; on iOS all 105 search screens also appear inside
flows, on web 102 of 105 do.

## Provenance

- **Source app pages**: iOS https://mobbin.com/apps/evernote-ios-fac8df3d-50aa-49fe-aafd-46ed38fb30bb/9df01a1b-fa7b-4deb-a74e-0a72d12f5660/screens and web https://mobbin.com/apps/evernote-web-a4b1205e-5a15-4eb4-bb2e-a83421dc4263/ac139a5c-f8b3-497a-bbf1-341495824fb2/screens.
- **Capture date**: 2026-09-06.
- **App version**: not reported. Neither `search_screens` nor `search_flows` returns a version field, and the app pages are not fetchable without a browser session, so the version is unknown. The flow captures visibly span more than one release of each app (the iOS flows contain 240 screens the current search index does not return).
- **Tools**: the Mobbin MCP through Code Mode, `mobbin.search_screens` (mode `standard`, `limit` 15, `image_format` webp, `exclude_screen_ids` carrying every id already seen so each call paged into new screens, results filtered to `app_name === "Evernote"`) and `mobbin.search_flows` (`limit` 10, its maximum, paging while `has_next_page`). Mode `deep` was tried on two probe queries and returned the same inventory more slowly.
- **Completeness check**: after the sweep, a bare `Evernote` query and a `deep` query with every known id excluded returned zero screens on both platforms, so the search index exposes exactly 105 screens per platform. Flow sweeps ran the whole query list to exhaustion; the last execution on each platform added one (iOS) and three (web) flows.
- **Images**: Mobbin serves thumbnails through short links; every iOS capture is 299×678 webp and every web capture 768×521 webp, with no exception (13 of the web files use the extended VP8X container instead of plain VP8 at the same pixel size). No image failed to download; every id returned by the tools has a file on disk.
- **Request budget**: 11 screen calls and 44 flow calls on iOS, 11 screen calls and 51 flow calls on web, plus 18 orchestrator probes, all under 40 requests per minute. No 401, OAuth prompt or 429 occurred. One input-validation error (`limit` above 10 on `search_flows`) was hit and corrected before the flow sweep.
- **Licence position**: terms unclear, the same position `screenshots/anytype/sources.md` records. Mobbin's terms of use were not reviewed for a redistribution grant during this harvest; the files are Mobbin-served thumbnails kept for internal, non-commercial comparison, attributed by URL, and removable without anything else depending on them.
- **Verification**: re-checked independently before landing on 2026-09-06. The index and the disk agree 1:1 on all 1,557 paths and every row carries a `mobbin.com/screens/` URL whose id matches the filename; every file is a valid RIFF/WebP (1,544 VP8, 13 VP8X), none is 0 bytes and none under 1 KB; no screen id repeats inside a folder; the counts table matches the folders on disk exactly (105 iOS flow folders holding 105 flows, 136 web flow folders holding 170 flows); the whole folder is 30 MB; and ten images spread across both platforms, six group folders and four flow folders were opened and read, all real Evernote screens of the platform their path claims.

### Query set

Screen queries were tried in order until three consecutive queries added no new id. Only the first query added screens on either platform, because the exclusion list already paged through the whole app:

- **ios**: `Evernote home screen with notes list` (105), `Evernote sidebar navigation menu` (0), `Evernote note editor with formatting toolbar` (0), `Evernote notebooks list` (0); 55 further queries were prepared and not needed.
- **web**: `Evernote home dashboard with widgets` (105), `Evernote sidebar navigation` (0), `Evernote note editor with formatting toolbar` (0), `Evernote notes list` (0); 56 further queries were prepared and not needed.

Flow queries (all 25 ran on both platforms): `Evernote onboarding`, `Evernote sign up`, `Evernote log in`, `Evernote creating a note`, `Evernote creating a notebook`, `Evernote sharing a note`, `Evernote searching notes`, `Evernote adding a task`, `Evernote upgrading subscription`, `Evernote setting a reminder`, `Evernote applying a template`, `Evernote tagging a note`, `Evernote scanning a document`, `Evernote customizing home`, `Evernote deleting a note`, `Evernote moving a note`, `Evernote changing settings`, `Evernote exporting a note`, `Evernote inviting a collaborator`, `Evernote connecting calendar`, `Evernote AI note cleanup`, `Evernote recording audio`, `Evernote adding attachment`, `Evernote creating a shortcut`, `Evernote restoring from trash`.


## Index — ios search screens (105)

| File | Group | Shows | Mobbin |
|------|-------|-------|--------|
| `ios/calendar/evernote-ios-calendar-calendar-day-view-hourly-d363ef62-06d9-4f58-a0e7-7399f5e9105b.webp` | calendar | Calendar day view for Wednesday, 6 November 2024 showing empty hourly slots from 2 AM to 4 AM with a changes-saved toast above. | https://mobbin.com/screens/d363ef62-06d9-4f58-a0e7-7399f5e9105b |
| `ios/dialogs/evernote-ios-dialogs-ai-note-cleanup-promo-dialog-d18bf0a6-8e16-4889-9273-ee75681fa31f.webp` | dialogs | Promotional dialog inviting the user to try AI Note Cleanup beta with a preview and a Try AI Note Cleanup call-to-action button. | https://mobbin.com/screens/d18bf0a6-8e16-4889-9273-ee75681fa31f |
| `ios/editor/evernote-ios-editor-ai-note-cleanup-banner-49a6a046-e3e5-4073-aa42-cb5ea5852af0.webp` | editor | The note editor showing a to-do list with an AI Note Cleanup Beta banner and the formatting toolbar open. | https://mobbin.com/screens/49a6a046-e3e5-4073-aa42-cb5ea5852af0 |
| `ios/editor/evernote-ios-editor-editor-formatting-toolbar-transcribe-9bcdc22e-1d35-443a-8ef8-aef561601e41.webp` | editor | Note editor showing an image, quoted text, an audio clip with a Transcribe button, and the formatting toolbar with keyboard open. | https://mobbin.com/screens/9bcdc22e-1d35-443a-8ef8-aef561601e41 |
| `ios/editor/evernote-ios-editor-editor-note-copied-toast-c306fb43-7f1a-4f3c-abe8-847e49df093c.webp` | editor | Note editor for 'To-Do - Copy' with a scanned document image and task list, showing a 'Note copied' confirmation toast. | https://mobbin.com/screens/c306fb43-7f1a-4f3c-abe8-847e49df093c |
| `ios/editor/evernote-ios-editor-editor-numbered-outline-keyboard-af029e75-97e5-47ed-a62b-c9f583ac9db1.webp` | editor | Note editor showing a nested numbered outline (Month, November, Week 4) with the keyboard open below. | https://mobbin.com/screens/af029e75-97e5-47ed-a62b-c9f583ac9db1 |
| `ios/editor/evernote-ios-editor-email-sent-confirmation-toast-65820bd3-dbbb-41e4-9d81-c5533007c44c.webp` | editor | A note with a photo and audio clip displaying an Email sent confirmation toast at the top. | https://mobbin.com/screens/65820bd3-dbbb-41e4-9d81-c5533007c44c |
| `ios/editor/evernote-ios-editor-find-replace-someday-task-group-8d9e29d4-e76e-456d-b29c-876a6da335a9.webp` | editor | Note editor with find-and-replace bar active over a task list showing Today, Tomorrow, This Week and Someday groups. | https://mobbin.com/screens/8d9e29d4-e76e-456d-b29c-876a6da335a9 |
| `ios/editor/evernote-ios-editor-insert-linked-note-picker-b67cbcdc-c1d6-48ff-bb08-415425effa66.webp` | editor | Select a note screen for inserting a linked note reference, with notebooks and notes listed to choose from. | https://mobbin.com/screens/b67cbcdc-c1d6-48ff-bb08-415425effa66 |
| `ios/editor/evernote-ios-editor-new-linked-note-draft-5141b86b-efd1-4981-8bb7-f307060a855a.webp` | editor | A blank new note in First Notebook with a placeholder Title and the text Linked note below it. | https://mobbin.com/screens/5141b86b-efd1-4981-8bb7-f307060a855a |
| `ios/editor/evernote-ios-editor-note-detail-audio-transcript-4cb35ea6-0f81-4555-bfba-6e38be84ca11.webp` | editor | A note viewed in the editor with an inline photo, an attached audio clip with a Transcribe button, and text content. | https://mobbin.com/screens/4cb35ea6-0f81-4555-bfba-6e38be84ca11 |
| `ios/editor/evernote-ios-editor-note-editor-audio-clip-toolbar-d28389f0-2cab-4c7b-9b11-e00b60138575.webp` | editor | Note editor with an image, audio transcription clip, and formatting toolbar with keyboard open, no toast visible. | https://mobbin.com/screens/d28389f0-2cab-4c7b-9b11-e00b60138575 |
| `ios/editor/evernote-ios-editor-note-editor-audio-transcribe-toast-cc29f2ff-8636-4725-aa7f-d1f4e5cc5069.webp` | editor | Note editor with an image, audio recording with a Transcribe button, and a toast confirming the note moved to "Work". | https://mobbin.com/screens/cc29f2ff-8636-4725-aa7f-d1f4e5cc5069 |
| `ios/editor/evernote-ios-editor-note-editor-loading-skeleton-ca48c93f-7215-4603-89f5-3d27ba900943.webp` | editor | Note editor screen in a loading state showing gray skeleton placeholder lines for the title and body text. | https://mobbin.com/screens/ca48c93f-7215-4603-89f5-3d27ba900943 |
| `ios/editor/evernote-ios-editor-note-editor-pinned-toast-ebc4ba11-d7ce-4c6f-acea-5aaae0536ba6.webp` | editor | Note editor with image and audio attachment showing a toast confirming the note was pinned to a notebook. | https://mobbin.com/screens/ebc4ba11-d7ce-4c6f-acea-5aaae0536ba6 |
| `ios/editor/evernote-ios-editor-note-editor-reminder-set-toast-f7e0794a-3012-4f85-9cd1-aee0ab0f1ff8.webp` | editor | Note editor with image and audio clip showing a toast confirming a new reminder was set for a specific date and time. | https://mobbin.com/screens/f7e0794a-3012-4f85-9cd1-aee0ab0f1ff8 |
| `ios/editor/evernote-ios-editor-note-editor-transcribing-image-cbe0cce2-4a71-41e9-9266-da4210010865.webp` | editor | Note editor showing an attached snapshot image being transcribed with the formatting toolbar and keyboard open. | https://mobbin.com/screens/cbe0cce2-4a71-41e9-9266-da4210010865 |
| `ios/editor/evernote-ios-editor-note-link-insert-keyboard-43ab21bb-902f-45a0-a221-2e0a8203da6c.webp` | editor | The note editor with an inserted link to another note and the on-screen keyboard open on a Link input tab. | https://mobbin.com/screens/43ab21bb-902f-45a0-a221-2e0a8203da6c |
| `ios/editor/evernote-ios-editor-note-table-outline-list-658c9d3e-f121-459b-a0f5-ad98d5cf632e.webp` | editor | A note showing a table, the word sometimes, a checklist item Page 106, a nested outline list, and a photo. | https://mobbin.com/screens/658c9d3e-f121-459b-a0f5-ad98d5cf632e |
| `ios/editor/evernote-ios-editor-task-editor-due-date-reminders-d2272ad9-4551-4a28-8624-2406e9bfb949.webp` | editor | Task editor showing a task with a due date and two reminders under Today, plus Tomorrow, This Week, and Someday sections and keyboard open. | https://mobbin.com/screens/d2272ad9-4551-4a28-8624-2406e9bfb949 |
| `ios/editor/evernote-ios-editor-template-created-toast-79303337-f0f2-4200-9cec-dd9e683b5032.webp` | editor | A note with a photo and audio clip displaying a Template created from note confirmation toast. | https://mobbin.com/screens/79303337-f0f2-4200-9cec-dd9e683b5032 |
| `ios/editor/evernote-ios-editor-todo-note-attachment-toolbar-67ed81a6-3001-4e6f-a571-4376c6d7eb6b.webp` | editor | A note titled To-Do with an attached snapshot image and an attachment toolbar with edit, download, and insert icons open. | https://mobbin.com/screens/67ed81a6-3001-4e6f-a571-4376c6d7eb6b |
| `ios/editor/evernote-ios-editor-todo-note-dark-mode-diagram-7d23a49c-4569-44bd-b124-73a2a7e2947a.webp` | editor | A dark mode note titled To-Do with a Case interview tag and an annotated profit diagram photo marked Important. | https://mobbin.com/screens/7d23a49c-4569-44bd-b124-73a2a7e2947a |
| `ios/editor/evernote-ios-editor-todo-note-diagram-transcribe-63247041-2f84-4aa3-a69e-4d812c925e46.webp` | editor | A note titled To-Do with an attached diagram snapshot and a Transcribe button above empty Today, Tomorrow, This Week, and Someday tasks. | https://mobbin.com/screens/63247041-2f84-4aa3-a69e-4d812c925e46 |
| `ios/editor/evernote-ios-editor-todo-note-with-photo-keyboard-631825af-b996-4750-9c82-52180642ec8b.webp` | editor | A note titled To-Do containing a portrait photo under a Today section, with the formatting toolbar and keyboard open. | https://mobbin.com/screens/631825af-b996-4750-9c82-52180642ec8b |
| `ios/empty-state/evernote-ios-empty-state-empty-notebook-notes-view-5105c92c-557a-4bbf-85f3-9414cef2f533.webp` | empty-state | The Work notebook's notes view showing an illustrated empty state with a Create a note button. | https://mobbin.com/screens/5105c92c-557a-4bbf-85f3-9414cef2f533 |
| `ios/empty-state/evernote-ios-empty-state-shared-with-me-empty-state-b896b7b3-ca3a-410b-b0b9-af8951378d54.webp` | empty-state | Shared with Me screen in its empty state with an illustration reading 'Nothing shared yet' and a Create a note button. | https://mobbin.com/screens/b896b7b3-ca3a-410b-b0b9-af8951378d54 |
| `ios/home/evernote-ios-home-home-create-actions-scratch-pad-994d7f92-f1a5-44f8-9126-4a032d4bf71a.webp` | home | Home Create tab with New note and New task actions, camera/scan/files/sketch shortcuts and a Scratch Pad. | https://mobbin.com/screens/994d7f92-f1a5-44f8-9126-4a032d4bf71a |
| `ios/home/evernote-ios-home-home-recently-captured-widgets-d1194e87-51fa-44e5-99f7-cd6b9b0c6f60.webp` | home | Home screen scrolled to the Recently Captured section with Web Clips tab active and a Customize your Widgets prompt. | https://mobbin.com/screens/d1194e87-51fa-44e5-99f7-cd6b9b0c6f60 |
| `ios/home/evernote-ios-home-home-scratch-pad-keyboard-78a5d020-afff-4dda-b4be-fbc30ace1adc.webp` | home | The home screen with quick actions and an empty scratch pad field focused with the keyboard open. | https://mobbin.com/screens/78a5d020-afff-4dda-b4be-fbc30ace1adc |
| `ios/home/evernote-ios-home-home-screen-dark-mode-d858f94b-37c5-4c4b-923a-7ec20004789a.webp` | home | Evernote home screen in dark mode with search bar, New note and New task cards, quick actions, and a scratch pad. | https://mobbin.com/screens/d858f94b-37c5-4c4b-923a-7ec20004789a |
| `ios/home/evernote-ios-home-home-screen-new-note-task-cafe4bcd-124d-4283-a4f2-21cb162b80bc.webp` | home | Evernote home screen with a search bar, a complete-your-setup prompt, New note and New task cards, quick action buttons, and a scratch pad. | https://mobbin.com/screens/cafe4bcd-124d-4283-a4f2-21cb162b80bc |
| `ios/home/evernote-ios-home-home-screen-standard-e1b81139-13cf-465a-8dee-cc29ce6a33c1.webp` | home | Standard Evernote home screen with search bar, New note and New task cards, quick action buttons, and a scratch pad. | https://mobbin.com/screens/e1b81139-13cf-465a-8dee-cc29ce6a33c1 |
| `ios/home/evernote-ios-home-home-screen-sticky-note-e9545f74-21fb-4956-bf87-516ff40e1194.webp` | home | Home screen with search bar, quick action buttons for Camera, Scan, Files, and Sketch, and a blue Sticky Note card. | https://mobbin.com/screens/e9545f74-21fb-4956-bf87-516ff40e1194 |
| `ios/home/evernote-ios-home-scratch-pad-recently-captured-8c0cc28d-5c37-40f6-adda-e1bbb49220a7.webp` | home | Home screen section showing the Scratch Pad note and a Recently Captured area with web clips empty state. | https://mobbin.com/screens/8c0cc28d-5c37-40f6-adda-e1bbb49220a7 |
| `ios/menus/evernote-ios-menus-note-actions-overflow-menu-e02408ee-1a3a-4218-9dcc-c26f09254741.webp` | menus | Overflow action menu opened from a note showing options like Share note, Find in note, Add tag, Add reminder, Note info, and Print note. | https://mobbin.com/screens/e02408ee-1a3a-4218-9dcc-c26f09254741 |
| `ios/menus/evernote-ios-menus-note-options-menu-scrolled-bottom-835959fe-d399-4cf8-b6df-423e900e6bb5.webp` | menus | The note action menu scrolled to show Add to shortcuts, Available offline, Add tag, Note info, and Move to Trash. | https://mobbin.com/screens/835959fe-d399-4cf8-b6df-423e900e6bb5 |
| `ios/menus/evernote-ios-menus-note-options-menu-top-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | menus | A note action menu open over a note, showing Share note, Find in note, Add tag, Add reminder, and other options from the top. | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| `ios/menus/evernote-ios-menus-notebook-list-sort-menu-7aef826b-ab79-4cbb-8885-4ed2cae1741f.webp` | menus | The notebook list with a small overflow menu open offering Sort by and Notebook settings. | https://mobbin.com/screens/7aef826b-ab79-4cbb-8885-4ed2cae1741f |
| `ios/menus/evernote-ios-menus-scratch-pad-menu-sheet-44a9ceb2-ca06-4457-a0e0-2de73288c96e.webp` | menus | An action menu over the home screen scratch pad offering Convert to note, Clear scratch pad, and Edit widget. | https://mobbin.com/screens/44a9ceb2-ca06-4457-a0e0-2de73288c96e |
| `ios/misc/evernote-ios-misc-note-info-metadata-panel-dd18560d-26f7-4578-875c-1e4b955a37c0.webp` | misc | Note info panel showing created/updated timestamps, author, file size, word count, and an Export note action. | https://mobbin.com/screens/dd18560d-26f7-4578-875c-1e4b955a37c0 |
| `ios/notebooks/evernote-ios-notebooks-notebook-list-three-notebooks-40dadd42-c502-4859-b4e1-a0b34e7d63cb.webp` | notebooks | A notebook list screen showing Daily Notes, First Notebook, and Work with a search field and a create button. | https://mobbin.com/screens/40dadd42-c502-4859-b4e1-a0b34e7d63cb |
| `ios/notebooks/evernote-ios-notebooks-notebooks-list-with-counts-a51d2a5c-6dec-4608-9af2-a7ffda5aae50.webp` | notebooks | Notebooks tab listing three notebooks with note counts and a search field at top. | https://mobbin.com/screens/a51d2a5c-6dec-4608-9af2-a7ffda5aae50 |
| `ios/notebooks/evernote-ios-notebooks-notebooks-list-with-counts-2-eac73d4d-64b1-455d-9132-58185c9652dc.webp` | notebooks | Notebooks list screen showing three notebooks with note counts and a search field with keyboard open. | https://mobbin.com/screens/eac73d4d-64b1-455d-9132-58185c9652dc |
| `ios/notes/evernote-ios-notes-daily-notes-list-five-entries-86227d35-d893-4726-a775-e6f1a1a5b1db.webp` | notes | The Daily Notes notebook's notes list with five entries including a Daily Journal and two to-do list notes. | https://mobbin.com/screens/86227d35-d893-4726-a775-e6f1a1a5b1db |
| `ios/notes/evernote-ios-notes-daily-notes-list-syncing-7e20bff0-eb26-4e2d-97f2-9ff3ad09f445.webp` | notes | The Daily Notes notebook's notes list with four entries each showing a small sync status icon. | https://mobbin.com/screens/7e20bff0-eb26-4e2d-97f2-9ff3ad09f445 |
| `ios/notes/evernote-ios-notes-daily-notes-list-with-toast-c86ee412-fdd3-41bd-ad61-180074e033d4.webp` | notes | Note list for the Daily Notes notebook showing four notes with a toast confirming a note was added to a new stack. | https://mobbin.com/screens/c86ee412-fdd3-41bd-ad61-180074e033d4 |
| `ios/notes/evernote-ios-notes-notebook-notes-downloading-toast-a1001720-eb1f-4cd3-8d46-f02904aafdf7.webp` | notes | Daily Notes notebook note list with a 'Downloading notebook' toast banner at the top. | https://mobbin.com/screens/a1001720-eb1f-4cd3-8d46-f02904aafdf7 |
| `ios/notes/evernote-ios-notes-notebook-notes-list-daily-notes-a3b00a9b-8a86-4417-97b1-cc38dae31288.webp` | notes | Daily Notes notebook note list showing three notes with the last one mid-swipe revealing a green action icon. | https://mobbin.com/screens/a3b00a9b-8a86-4417-97b1-cc38dae31288 |
| `ios/notes/evernote-ios-notes-notebook-renamed-toast-notes-list-6ce7f762-95ba-487f-b617-5d180e1f3af8.webp` | notes | A notes list for a notebook showing a Renamed notebook to Daily Notes! toast above to-do list entries. | https://mobbin.com/screens/6ce7f762-95ba-487f-b617-5d180e1f3af8 |
| `ios/notes/evernote-ios-notes-notes-browse-list-dark-mode-c5fa25d2-4859-4c6f-9d5b-115774c244e6.webp` | notes | Notes tab Browse view in dark mode showing a list of notes with previews, thumbnails and status badges. | https://mobbin.com/screens/c5fa25d2-4859-4c6f-9d5b-115774c244e6 |
| `ios/notes/evernote-ios-notes-notes-browse-shortcuts-tags-shared-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | notes | Notes tab Browse view with Shortcuts, Tags and Shared sections and a list of two recent notes. | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |
| `ios/notes/evernote-ios-notes-notes-list-mixed-types-64687644-8778-48bf-8c24-2ebe370c8b00.webp` | notes | A notes list showing untitled notes, a sticky note, and a scratch pad entry with timestamps. | https://mobbin.com/screens/64687644-8778-48bf-8c24-2ebe370c8b00 |
| `ios/notes/evernote-ios-notes-notes-recent-suggested-tabs-9c8369e6-ce3d-4a90-90ba-51bf723558bc.webp` | notes | Notes tab with Recent/Suggested toggle showing note card previews plus Scratch Pad and Recently Captured sections. | https://mobbin.com/screens/9c8369e6-ce3d-4a90-90ba-51bf723558bc |
| `ios/notes/evernote-ios-notes-notes-recent-suggested-tabs-2-d9c0cb9a-9f61-4019-b398-2d7243d68120.webp` | notes | Notes browse screen with Recent and Suggested tabs showing note cards, a scratch pad, and the start of Recently Captured. | https://mobbin.com/screens/d9c0cb9a-9f61-4019-b398-2d7243d68120 |
| `ios/notes/evernote-ios-notes-shared-with-me-added-toast-adbb6738-27ab-4516-8f45-d2d38d0287d6.webp` | notes | Shared with Me screen showing an 'Added "To-Do"' confirmation toast above the recents and 1970 sections. | https://mobbin.com/screens/adbb6738-27ab-4516-8f45-d2d38d0287d6 |
| `ios/notes/evernote-ios-notes-shared-with-me-adding-note-89b26e09-c66f-4fed-8f69-9687b7032b31.webp` | notes | Shared with Me screen showing recent shared items with an 'Adding' progress overlay in the center. | https://mobbin.com/screens/89b26e09-c66f-4fed-8f69-9687b7032b31 |
| `ios/notes/evernote-ios-notes-shortcuts-list-single-item-b428b7f5-2d7c-4740-938f-6d0ea110adbc.webp` | notes | Shortcuts screen listing a single shortcut note named To-Do. | https://mobbin.com/screens/b428b7f5-2d7c-4740-938f-6d0ea110adbc |
| `ios/notes/evernote-ios-notes-shortcuts-list-two-items-8c3af280-2c91-4653-9bd7-e6f589a640f5.webp` | notes | Shortcuts screen listing two shortcut notes, To-Do and Things to do. | https://mobbin.com/screens/8c3af280-2c91-4653-9bd7-e6f589a640f5 |
| `ios/onboarding/evernote-ios-onboarding-enable-daily-notes-template-choice-68eabcd1-6ff1-4943-86ce-e755a89d6a75.webp` | onboarding | An onboarding screen prompting to enable Daily Notes with a choice of Journal, To-do list, or Agenda template and a notebook created toast. | https://mobbin.com/screens/68eabcd1-6ff1-4943-86ce-e755a89d6a75 |
| `ios/onboarding/evernote-ios-onboarding-enable-daily-notes-template-choice-2-e6c8960b-d482-4a55-8436-9f56d089c6d4.webp` | onboarding | Onboarding screen to enable Daily Notes with a choice of Journal, To-do list, or Agenda template and a Continue button. | https://mobbin.com/screens/e6c8960b-d482-4a55-8436-9f56d089c6d4 |
| `ios/onboarding/evernote-ios-onboarding-home-welcome-trial-gift-sheet-c1eddbee-f5e6-4314-ae91-803612006d43.webp` | onboarding | Home screen with a dimmed background and a bottom sheet welcoming the user with a 7-day free trial offer and Explore Evernote button. | https://mobbin.com/screens/c1eddbee-f5e6-4314-ae91-803612006d43 |
| `ios/onboarding/evernote-ios-onboarding-onboarding-setup-complete-tips-fbe7c95c-dbcf-444f-9863-8e5516339e6e.webp` | onboarding | Final onboarding screen "You're all set!" showing setup tips for accessing notes, organizing content, and turning to-dos into done. | https://mobbin.com/screens/fbe7c95c-dbcf-444f-9863-8e5516339e6e |
| `ios/search/evernote-ios-search-ai-powered-search-answer-a0a19abf-d09a-49fa-b74b-5d715f42cf68.webp` | search | AI-Powered Search results showing a generated answer summary above two matching note results. | https://mobbin.com/screens/a0a19abf-d09a-49fa-b74b-5d715f42cf68 |
| `ios/search/evernote-ios-search-ai-search-no-results-4d1beb3e-8944-4ad5-9c62-bfdc2c3d3663.webp` | search | An AI-powered search for what's my usual breakfast returning a no notes found empty result state. | https://mobbin.com/screens/4d1beb3e-8944-4ad5-9c62-bfdc2c3d3663 |
| `ios/search/evernote-ios-search-find-in-note-search-bar-501c429e-ef62-46da-ae8a-1c9dd58a245e.webp` | search | The find-in-note search bar with the keyboard open over a dimmed note containing a photo and audio clip. | https://mobbin.com/screens/501c429e-ef62-46da-ae8a-1c9dd58a245e |
| `ios/search/evernote-ios-search-search-cost-goto-filter-list-c66ad0a5-1247-4137-80ea-61699cd688b4.webp` | search | Search results screen for the query "cost" showing a Go To list of notes/notebooks and an Apply Filter section for attachments, images, checkboxes, and a tag. | https://mobbin.com/screens/c66ad0a5-1247-4137-80ea-61699cd688b4 |
| `ios/search/evernote-ios-search-search-empty-goto-shortcuts-f7e0d944-36ca-419b-b0e8-8657d69bf54b.webp` | search | Search screen with an empty query showing a Go To list with First Notebook and a Favorite shortcut. | https://mobbin.com/screens/f7e0d944-36ca-419b-b0e8-8657d69bf54b |
| `ios/search/evernote-ios-search-search-recent-goto-apply-filter-bdc7e0b5-08fc-4b75-aec3-1fe81026de9d.webp` | search | Search screen with Standard/AI-Powered toggle showing recent searches, Go to shortcuts and Apply filter suggestions. | https://mobbin.com/screens/bdc7e0b5-08fc-4b75-aec3-1fe81026de9d |
| `ios/search/evernote-ios-search-search-results-active-filter-chip-ac298483-58b6-4b07-ad5b-1d70bab34b25.webp` | search | Search results for 'cost' with a Case interview filter chip applied and two matching results shown. | https://mobbin.com/screens/ac298483-58b6-4b07-ad5b-1d70bab34b25 |
| `ios/search/evernote-ios-search-search-results-sort-sheet-95f04d0b-fe56-4f84-a1f9-20b5bb97bd0d.webp` | search | Search results for 'cost' with a bottom sheet open offering save search, view options and sort-by choices. | https://mobbin.com/screens/95f04d0b-fe56-4f84-a1f9-20b5bb97bd0d |
| `ios/search/evernote-ios-search-search-results-three-notes-870126a2-d2c7-4ab6-b665-27675ca440f1.webp` | search | Search results for the term cost showing three matching to-do notes with highlighted keyword matches. | https://mobbin.com/screens/870126a2-d2c7-4ab6-b665-27675ca440f1 |
| `ios/search/evernote-ios-search-search-results-with-filter-chips-ea563c60-6b66-4d41-895b-63f25244b50a.webp` | search | Search results for "cost" showing three matching notes with highlighted terms and available filter chips at the top. | https://mobbin.com/screens/ea563c60-6b66-4d41-895b-63f25244b50a |
| `ios/settings/evernote-ios-settings-customize-home-widgets-a2fd7b7e-0e37-409a-a6eb-a62a6c076001.webp` | settings | Customize screen for the home screen listing active widgets and available widgets to add, with a change background option. | https://mobbin.com/screens/a2fd7b7e-0e37-409a-a6eb-a62a6c076001 |
| `ios/settings/evernote-ios-settings-daily-note-settings-toggle-c69b0e22-9ea3-4ba5-a004-dd5554092b50.webp` | settings | Settings screen for Daily Note with a toggle to enable it and a Journal daily template selector. | https://mobbin.com/screens/c69b0e22-9ea3-4ba5-a004-dd5554092b50 |
| `ios/settings/evernote-ios-settings-default-notebook-picker-64019ffd-c51e-4c3f-b18a-f44b932c0452.webp` | settings | A settings screen for choosing the default notebook among Daily Notes!, First Notebook, and Work. | https://mobbin.com/screens/64019ffd-c51e-4c3f-b18a-f44b932c0452 |
| `ios/settings/evernote-ios-settings-default-notebook-picker-2-8f0bd7ea-4ae7-466a-aa34-6720c2db124f.webp` | settings | Default notebook settings screen listing notebooks to choose as the default for new notes. | https://mobbin.com/screens/8f0bd7ea-4ae7-466a-aa34-6720c2db124f |
| `ios/settings/evernote-ios-settings-main-settings-list-f74264ac-0593-4010-a615-a072d51d445e.webp` | settings | Main Settings screen listing Camera, Dark mode, Navigation, Notes, Daily note, Notebooks, Tasks, Offline, Passcode, Calendar, Sync, and More Settings. | https://mobbin.com/screens/f74264ac-0593-4010-a615-a072d51d445e |
| `ios/settings/evernote-ios-settings-note-content-size-large-d3bdec1c-8ce4-4ca8-96a5-9fe97e3b3943.webp` | settings | Note content size settings screen with Match phone settings toggled off and Large size selected, showing a larger text preview. | https://mobbin.com/screens/d3bdec1c-8ce4-4ca8-96a5-9fe97e3b3943 |
| `ios/settings/evernote-ios-settings-note-content-size-normal-c8ccb710-4e06-445d-bbfa-8dbb84b023b3.webp` | settings | Note content size settings screen with a Match phone settings toggle and Normal size selected, showing a text size preview. | https://mobbin.com/screens/c8ccb710-4e06-445d-bbfa-8dbb84b023b3 |
| `ios/settings/evernote-ios-settings-notes-settings-toggles-8db95913-c9fa-4896-a29f-dd9f1217c419.webp` | settings | Notes Settings screen with options for advanced editing, links, note content size and toggles for edit protection, strikethrough checklist, anchor links and collapsible sections. | https://mobbin.com/screens/8db95913-c9fa-4896-a29f-dd9f1217c419 |
| `ios/sharing/evernote-ios-sharing-shared-with-me-notes-list-7b751db5-76a1-46f1-be40-c8817a1382ec.webp` | sharing | The Shared with Me screen listing shared notes Daily Notes and To-Do with Add buttons and a sharer's identity. | https://mobbin.com/screens/7b751db5-76a1-46f1-be40-c8817a1382ec |
| `ios/sheets/evernote-ios-sheets-edit-scratch-pad-color-picker-ebd2a789-d8e9-4d0d-bf08-b2efb20f1d0c.webp` | sheets | Edit Scratch Pad bottom sheet with a title field, color swatches, and a Convert to note button over a dimmed home screen. | https://mobbin.com/screens/ebd2a789-d8e9-4d0d-bf08-b2efb20f1d0c |
| `ios/sheets/evernote-ios-sheets-edit-scratch-pad-color-sheet-b3c510fb-0ad9-4fbd-8ba9-0b3c719e2c58.webp` | sheets | Edit Scratch Pad bottom sheet with a title field, color swatches and a Convert to note button, over a dimmed home screen. | https://mobbin.com/screens/b3c510fb-0ad9-4fbd-8ba9-0b3c719e2c58 |
| `ios/sheets/evernote-ios-sheets-filter-notes-options-sheet-7ae8d569-c710-4e6b-af7c-b27d3888e07b.webp` | sheets | A Filter notes sheet with a Reminders toggle and rows for Tags, Located in, Contains, Created date, and Updated date. | https://mobbin.com/screens/7ae8d569-c710-4e6b-af7c-b27d3888e07b |
| `ios/sheets/evernote-ios-sheets-filter-notes-sheet-c7b41921-1fc1-4991-b9d2-2f3e832d421f.webp` | sheets | Filter notes bottom sheet with an active tag filter chip and toggles for reminders, tags, location, contains, and date filters. | https://mobbin.com/screens/c7b41921-1fc1-4991-b9d2-2f3e832d421f |
| `ios/sheets/evernote-ios-sheets-move-note-notebook-picker-c5837dc4-a003-43ef-8b45-07a807ea65e8.webp` | sheets | Move Note sheet with a search field and a list of notebooks to move the current note into, Work currently checked. | https://mobbin.com/screens/c5837dc4-a003-43ef-8b45-07a807ea65e8 |
| `ios/sheets/evernote-ios-sheets-scratch-pad-edit-keyboard-sheet-bc6f25aa-11c7-41fd-b62e-4d3e1ee6da81.webp` | sheets | Scratch Pad text editing sheet with keyboard open over a dimmed home screen, showing an undo/forward control bar. | https://mobbin.com/screens/bc6f25aa-11c7-41fd-b62e-4d3e1ee6da81 |
| `ios/sheets/evernote-ios-sheets-search-results-options-sheet-48b4758a-940d-4a23-a81c-cf3d816c5210.webp` | sheets | Search results for the term cost with a bottom sheet offering Save search, View options, Sort by, and Filter notes. | https://mobbin.com/screens/48b4758a-940d-4a23-a81c-cf3d816c5210 |
| `ios/sheets/evernote-ios-sheets-select-note-picker-sheet-d8994b46-e021-465b-a58c-81bb8200a5b1.webp` | sheets | Select a note bottom sheet with a search field and a list of notebooks to insert a note link into another note. | https://mobbin.com/screens/d8994b46-e021-465b-a58c-81bb8200a5b1 |
| `ios/tags/evernote-ios-tags-tags-list-single-tag-53403fb8-216f-438a-8234-a52f637f6c72.webp` | tags | The Tags screen with a search field showing one tag, Case interview, with a count of three. | https://mobbin.com/screens/53403fb8-216f-438a-8234-a52f637f6c72 |
| `ios/tasks/evernote-ios-tasks-default-task-note-intro-keyboard-d3cd8b8b-34c1-4a60-8620-883f63b18589.webp` | tasks | Task note editor showing the default "Things to do" welcome card, an empty task, and Tomorrow/This Week sections with keyboard open. | https://mobbin.com/screens/d3cd8b8b-34c1-4a60-8620-883f63b18589 |
| `ios/tasks/evernote-ios-tasks-my-tasks-list-six-items-a54bf80a-47b8-43f9-85db-d41c87c3bd27.webp` | tasks | My Tasks list showing six tasks under 'Your Tasks' with due dates and flag/reminder icons. | https://mobbin.com/screens/a54bf80a-47b8-43f9-85db-d41c87c3bd27 |
| `ios/tasks/evernote-ios-tasks-task-detail-reminder-toolbar-5dcb1714-008f-4c3f-a65f-1a66fafc49d3.webp` | tasks | A task named Read page 105 with a due date and reminders, and a task property toolbar open below the keyboard. | https://mobbin.com/screens/5dcb1714-008f-4c3f-a65f-1a66fafc49d3 |
| `ios/tasks/evernote-ios-tasks-task-list-formatting-toolbar-4bb95f90-9fcb-441d-b279-4824a3f96fbc.webp` | tasks | The Tasks screen grouped by Today, Tomorrow, This Week, and Someday with selected header text and a formatting panel open. | https://mobbin.com/screens/4bb95f90-9fcb-441d-b279-4824a3f96fbc |
| `ios/tasks/evernote-ios-tasks-task-list-with-linked-note-5546af9f-3c7f-473a-a279-39f1c71693cb.webp` | tasks | The Tasks screen showing Tomorrow, This Week, and Someday sections, with a linked untitled note card in Someday. | https://mobbin.com/screens/5546af9f-3c7f-473a-a279-39f1c71693cb |
| `ios/tasks/evernote-ios-tasks-task-title-entry-keyboard-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | tasks | Task editor focused on an empty task title field within Daily Notes, with due today/tomorrow and repeat quick actions and keyboard open. | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| `ios/tasks/evernote-ios-tasks-tasks-by-notebook-grouped-8ea47cc0-6fb4-41ab-8112-10e25295eef4.webp` | tasks | Tasks tab with Notebooks sub-tab selected, showing tasks grouped under Daily Notes and First Notebook. | https://mobbin.com/screens/8ea47cc0-6fb4-41ab-8112-10e25295eef4 |
| `ios/tasks/evernote-ios-tasks-tasks-filtered-flagged-9e69806d-ade3-4c2c-a5f5-5b5d4b6abd3c.webp` | tasks | My Tasks list filtered by a Flagged chip showing three flagged 'Read page 105' tasks. | https://mobbin.com/screens/9e69806d-ade3-4c2c-a5f5-5b5d4b6abd3c |
| `ios/tasks/evernote-ios-tasks-tasks-list-dark-mode-db5284d8-7159-46c8-9d63-748d10dd84ce.webp` | tasks | Task list in dark mode showing seven tasks across My tasks, Notebooks, Notes, and Today tabs with due dates and flags. | https://mobbin.com/screens/db5284d8-7159-46c8-9d63-748d10dd84ce |
| `ios/tasks/evernote-ios-tasks-tasks-list-with-completed-e5da9609-b2d9-4a47-a401-672f628345b5.webp` | tasks | Task list showing My tasks with five open tasks and a Completed section containing one struck-through task. | https://mobbin.com/screens/e5da9609-b2d9-4a47-a401-672f628345b5 |
| `ios/templates/evernote-ios-templates-choose-daily-note-template-3e20709a-665e-49a9-bc0e-631b5ade7aa6.webp` | templates | A template picker for a daily note offering Journal, To-do list, or Agenda styles with a Confirm button. | https://mobbin.com/screens/3e20709a-665e-49a9-bc0e-631b5ade7aa6 |
| `ios/templates/evernote-ios-templates-templates-picker-sheet-blank-note-a4d9947d-1e46-4da4-8fa2-ddcc385a687b.webp` | templates | New blank note editor with the Templates picker sheet open showing a grid of template options. | https://mobbin.com/screens/a4d9947d-1e46-4da4-8fa2-ddcc385a687b |
| `ios/templates/evernote-ios-templates-templates-picker-sheet-scrolled-b6fb86e4-3d8d-425a-84a6-1263cb632a96.webp` | templates | New blank note editor with the Templates picker sheet open, scrolled to show Reading List, Habit Tracker and Weekly Planner selected. | https://mobbin.com/screens/b6fb86e4-3d8d-425a-84a6-1263cb632a96 |
| `ios/templates/evernote-ios-templates-templates-picker-sheet-selected-a5a53b4e-1c5e-4229-a676-e0b099ec0a9c.webp` | templates | New blank note editor with the Templates picker sheet open and multiple template tiles highlighted as selected. | https://mobbin.com/screens/a5a53b4e-1c5e-4229-a676-e0b099ec0a9c |

## Index — ios flows (105 flows, 450 files)

### Account — `account/` — https://mobbin.com/flows/aa9d95e0-0d49-41cc-ab9a-13ea80cc5d0b

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/account/evernote-ios-flow-account-aa9d95e0-01-af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb.webp` | https://mobbin.com/screens/af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb |
| 2 | `ios/flows/account/evernote-ios-flow-account-aa9d95e0-02-2c514b18-4086-456f-a015-1bb16a84b5a3.webp` | https://mobbin.com/screens/2c514b18-4086-456f-a015-1bb16a84b5a3 |

### Adding a code block — `adding-a-code-block/` — https://mobbin.com/flows/3994391f-8d4d-4049-b7b2-c2e7c769a22d

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-code-block/evernote-ios-flow-adding-a-code-block-3994391f-01-1865a798-8af7-4517-8d5f-a79c710236af.webp` | https://mobbin.com/screens/1865a798-8af7-4517-8d5f-a79c710236af |
| 2 | `ios/flows/adding-a-code-block/evernote-ios-flow-adding-a-code-block-3994391f-02-92db221c-69db-4103-a4e8-7df1fff6a02a.webp` | https://mobbin.com/screens/92db221c-69db-4103-a4e8-7df1fff6a02a |
| 3 | `ios/flows/adding-a-code-block/evernote-ios-flow-adding-a-code-block-3994391f-03-c5ca7850-e863-4999-9fdd-b962f6a08ded.webp` | https://mobbin.com/screens/c5ca7850-e863-4999-9fdd-b962f6a08ded |
| 4 | `ios/flows/adding-a-code-block/evernote-ios-flow-adding-a-code-block-3994391f-04-d28389f0-2cab-4c7b-9b11-e00b60138575.webp` | https://mobbin.com/screens/d28389f0-2cab-4c7b-9b11-e00b60138575 |
| 5 | `ios/flows/adding-a-code-block/evernote-ios-flow-adding-a-code-block-3994391f-05-9bcdc22e-1d35-443a-8ef8-aef561601e41.webp` | https://mobbin.com/screens/9bcdc22e-1d35-443a-8ef8-aef561601e41 |

### Adding a divider — `adding-a-divider/` — https://mobbin.com/flows/a002db71-229a-46a6-839e-0c6f6d299370

Actions: Adding & Creating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-divider/evernote-ios-flow-adding-a-divider-a002db71-01-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 2 | `ios/flows/adding-a-divider/evernote-ios-flow-adding-a-divider-a002db71-02-851ba3ea-0443-45a2-96ef-d450b169fb64.webp` | https://mobbin.com/screens/851ba3ea-0443-45a2-96ef-d450b169fb64 |

### Adding a due date — `adding-a-due-date/` — https://mobbin.com/flows/e1a1521e-1d25-4c79-a08f-3d1a6bedede0

Actions: Adding & Creating, Scheduling, Searching & Finding. Screens: 10.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-01-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| 2 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-02-da4b1aec-a9d4-47b1-9e83-cb83d8ecfc3c.webp` | https://mobbin.com/screens/da4b1aec-a9d4-47b1-9e83-cb83d8ecfc3c |
| 3 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-03-1a97bd18-be9c-439d-b45b-ab9d1ea75123.webp` | https://mobbin.com/screens/1a97bd18-be9c-439d-b45b-ab9d1ea75123 |
| 4 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-04-a67684b0-af43-450b-a4f4-f27b28b07c24.webp` | https://mobbin.com/screens/a67684b0-af43-450b-a4f4-f27b28b07c24 |
| 5 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-05-d8936f60-f6b7-4ad0-9898-cd5bbdbea7dd.webp` | https://mobbin.com/screens/d8936f60-f6b7-4ad0-9898-cd5bbdbea7dd |
| 6 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-06-4066a192-7a02-469b-aa0a-74c0f8a0f3ed.webp` | https://mobbin.com/screens/4066a192-7a02-469b-aa0a-74c0f8a0f3ed |
| 7 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-07-24039bff-62fd-4dcc-9aea-465b7885cb86.webp` | https://mobbin.com/screens/24039bff-62fd-4dcc-9aea-465b7885cb86 |
| 8 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-08-a67c7139-612f-4ab8-8556-6892cee809ae.webp` | https://mobbin.com/screens/a67c7139-612f-4ab8-8556-6892cee809ae |
| 9 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-09-da51a4fd-eae0-4fd9-9cfb-85f574a63654.webp` | https://mobbin.com/screens/da51a4fd-eae0-4fd9-9cfb-85f574a63654 |
| 10 | `ios/flows/adding-a-due-date/evernote-ios-flow-adding-a-due-date-e1a1521e-10-889eadf3-5e40-431a-9a10-7cf648b305b8.webp` | https://mobbin.com/screens/889eadf3-5e40-431a-9a10-7cf648b305b8 |

### Adding a reminder — `adding-a-reminder/` — https://mobbin.com/flows/9c9bdbb5-60f2-4fbc-9c1e-eeb7d018f544

Actions: Scheduling. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-reminder/evernote-ios-flow-adding-a-reminder-9c9bdbb5-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/adding-a-reminder/evernote-ios-flow-adding-a-reminder-9c9bdbb5-02-4b543479-9f11-4de3-842a-7d81ac31cf2e.webp` | https://mobbin.com/screens/4b543479-9f11-4de3-842a-7d81ac31cf2e |
| 3 | `ios/flows/adding-a-reminder/evernote-ios-flow-adding-a-reminder-9c9bdbb5-03-10440ecc-cee2-4a81-9b90-7f99515759c7.webp` | https://mobbin.com/screens/10440ecc-cee2-4a81-9b90-7f99515759c7 |
| 4 | `ios/flows/adding-a-reminder/evernote-ios-flow-adding-a-reminder-9c9bdbb5-04-f7e0794a-3012-4f85-9cd1-aee0ab0f1ff8.webp` | https://mobbin.com/screens/f7e0794a-3012-4f85-9cd1-aee0ab0f1ff8 |

### Adding a sketch — `adding-a-sketch/` — https://mobbin.com/flows/7814c1a2-2328-4daa-8109-41168348a96a

Actions: Adding & Creating, Drawing. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-01-cafe4bcd-124d-4283-a4f2-21cb162b80bc.webp` | https://mobbin.com/screens/cafe4bcd-124d-4283-a4f2-21cb162b80bc |
| 2 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-02-2219c579-3f3e-4c5d-ac91-0b6883a9722d.webp` | https://mobbin.com/screens/2219c579-3f3e-4c5d-ac91-0b6883a9722d |
| 3 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-03-85af5b6c-fb72-4818-b0c7-ce0fc298f334.webp` | https://mobbin.com/screens/85af5b6c-fb72-4818-b0c7-ce0fc298f334 |
| 4 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-04-00d4ac90-2115-4756-8948-2a79df9f5782.webp` | https://mobbin.com/screens/00d4ac90-2115-4756-8948-2a79df9f5782 |
| 5 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-05-bc64bb3d-80f2-449d-bd2e-64d02dc303d7.webp` | https://mobbin.com/screens/bc64bb3d-80f2-449d-bd2e-64d02dc303d7 |
| 6 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-06-bbd5d541-82fb-4004-b9f6-a16cb96bdf84.webp` | https://mobbin.com/screens/bbd5d541-82fb-4004-b9f6-a16cb96bdf84 |
| 7 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-07-c9c01d45-9151-4bfb-ad5a-ce4683256a9f.webp` | https://mobbin.com/screens/c9c01d45-9151-4bfb-ad5a-ce4683256a9f |
| 8 | `ios/flows/adding-a-sketch/evernote-ios-flow-adding-a-sketch-7814c1a2-08-1863e4b6-d155-4c09-bd82-9aede0dffe7c.webp` | https://mobbin.com/screens/1863e4b6-d155-4c09-bd82-9aede0dffe7c |

### Adding a table — `adding-a-table/` — https://mobbin.com/flows/87fa2082-4aa2-452e-b09a-991c3af86d7d

Actions: Adding & Creating. Screens: 10.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-01-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 2 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-02-94da3a84-52ab-4779-b019-b7973e468492.webp` | https://mobbin.com/screens/94da3a84-52ab-4779-b019-b7973e468492 |
| 3 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-03-f2801f7e-5914-433c-bcb8-bece060b9f11.webp` | https://mobbin.com/screens/f2801f7e-5914-433c-bcb8-bece060b9f11 |
| 4 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-04-3e941ce4-7bb9-4398-b3fd-152ee7701bbd.webp` | https://mobbin.com/screens/3e941ce4-7bb9-4398-b3fd-152ee7701bbd |
| 5 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-05-0487410c-2d35-470c-8dc8-39ae80077152.webp` | https://mobbin.com/screens/0487410c-2d35-470c-8dc8-39ae80077152 |
| 6 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-06-90b8e7fd-3e12-44c0-8460-3bb550f29720.webp` | https://mobbin.com/screens/90b8e7fd-3e12-44c0-8460-3bb550f29720 |
| 7 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-07-7b8bc311-753c-403a-89f1-c85b2ce3f348.webp` | https://mobbin.com/screens/7b8bc311-753c-403a-89f1-c85b2ce3f348 |
| 8 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-08-3650c593-5777-440d-9e06-137df163a5e2.webp` | https://mobbin.com/screens/3650c593-5777-440d-9e06-137df163a5e2 |
| 9 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-09-915ca0ef-e2df-4e72-a2b5-f372635c4ffb.webp` | https://mobbin.com/screens/915ca0ef-e2df-4e72-a2b5-f372635c4ffb |
| 10 | `ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-10-53a99577-f253-4503-9f6d-693867ebb7e2.webp` | https://mobbin.com/screens/53a99577-f253-4503-9f6d-693867ebb7e2 |

### Adding a tag — `adding-a-tag/` — https://mobbin.com/flows/753574c0-4124-4240-86d0-0758fbdeaac6

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-tag/evernote-ios-flow-adding-a-tag-753574c0-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/adding-a-tag/evernote-ios-flow-adding-a-tag-753574c0-02-1616438f-4ab8-4fd8-b741-d201a57688ba.webp` | https://mobbin.com/screens/1616438f-4ab8-4fd8-b741-d201a57688ba |
| 3 | `ios/flows/adding-a-tag/evernote-ios-flow-adding-a-tag-753574c0-03-0911c8bf-ab27-4a3e-aef1-be6b75cf3d89.webp` | https://mobbin.com/screens/0911c8bf-ab27-4a3e-aef1-be6b75cf3d89 |
| 4 | `ios/flows/adding-a-tag/evernote-ios-flow-adding-a-tag-753574c0-04-30390888-07ce-4beb-874a-814853351d6f.webp` | https://mobbin.com/screens/30390888-07ce-4beb-874a-814853351d6f |

### Adding a task — `adding-a-task/` — https://mobbin.com/flows/112dd7c4-be86-43bf-a79d-893c8bca69b7

Actions: Adding & Creating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-task/evernote-ios-flow-adding-a-task-112dd7c4-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/adding-a-task/evernote-ios-flow-adding-a-task-112dd7c4-02-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |

### Adding a task reminder — `adding-a-task-reminder/` — https://mobbin.com/flows/18dfed2b-897d-4c6a-923d-9b0e0dc1ae30

Actions: Scheduling. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-task-reminder/evernote-ios-flow-adding-a-task-reminder-18dfed2b-01-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| 2 | `ios/flows/adding-a-task-reminder/evernote-ios-flow-adding-a-task-reminder-18dfed2b-02-1e676c81-f0e5-49bb-a31b-767f6f0b9629.webp` | https://mobbin.com/screens/1e676c81-f0e5-49bb-a31b-767f6f0b9629 |
| 3 | `ios/flows/adding-a-task-reminder/evernote-ios-flow-adding-a-task-reminder-18dfed2b-03-2ca9f722-a10b-41e8-b63f-52cd65f72ea5.webp` | https://mobbin.com/screens/2ca9f722-a10b-41e8-b63f-52cd65f72ea5 |
| 4 | `ios/flows/adding-a-task-reminder/evernote-ios-flow-adding-a-task-reminder-18dfed2b-04-d2272ad9-4551-4a28-8624-2406e9bfb949.webp` | https://mobbin.com/screens/d2272ad9-4551-4a28-8624-2406e9bfb949 |

### Adding a widget — `adding-a-widget/` — https://mobbin.com/flows/753fcc8a-dbd9-4dc7-8c81-9bcef9d84696

Actions: Adding & Creating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-a-widget/evernote-ios-flow-adding-a-widget-753fcc8a-01-a2fd7b7e-0e37-409a-a6eb-a62a6c076001.webp` | https://mobbin.com/screens/a2fd7b7e-0e37-409a-a6eb-a62a6c076001 |
| 2 | `ios/flows/adding-a-widget/evernote-ios-flow-adding-a-widget-753fcc8a-02-ef90f2dc-c108-450d-8aea-e2cbba29ebc7.webp` | https://mobbin.com/screens/ef90f2dc-c108-450d-8aea-e2cbba29ebc7 |

### Adding an image (camera) — `adding-an-image-camera/` — https://mobbin.com/flows/e0ddfb22-4447-4f93-a7b0-2df508b94791

Actions: Editing & Updating, Scanning, Selecting & Choosing, Uploading & Downloading. Screens: 12.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-02-2ba6fa84-36d8-404f-9a44-b198bc56f6c3.webp` | https://mobbin.com/screens/2ba6fa84-36d8-404f-9a44-b198bc56f6c3 |
| 3 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-03-6040e4b7-9eae-4b5f-a661-f84816b463bb.webp` | https://mobbin.com/screens/6040e4b7-9eae-4b5f-a661-f84816b463bb |
| 4 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-04-4b6607c6-ad12-496c-840d-54b9c798a46f.webp` | https://mobbin.com/screens/4b6607c6-ad12-496c-840d-54b9c798a46f |
| 5 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-05-c6713268-c7cd-41e3-91b0-2e4471eafb79.webp` | https://mobbin.com/screens/c6713268-c7cd-41e3-91b0-2e4471eafb79 |
| 6 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-06-fb62fe3e-92a5-4265-978a-ef6cf7099e1e.webp` | https://mobbin.com/screens/fb62fe3e-92a5-4265-978a-ef6cf7099e1e |
| 7 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-07-7d0377ab-3e1f-4c29-8084-936f4f33dab1.webp` | https://mobbin.com/screens/7d0377ab-3e1f-4c29-8084-936f4f33dab1 |
| 8 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-08-72d6956d-aa3d-49fa-8552-c8944850016d.webp` | https://mobbin.com/screens/72d6956d-aa3d-49fa-8552-c8944850016d |
| 9 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-09-6e5737df-7d58-4e49-b011-5ecd6125ffd4.webp` | https://mobbin.com/screens/6e5737df-7d58-4e49-b011-5ecd6125ffd4 |
| 10 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-10-5a072d42-f5f7-404c-bfd2-5cb8ffc26e6b.webp` | https://mobbin.com/screens/5a072d42-f5f7-404c-bfd2-5cb8ffc26e6b |
| 11 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-11-f2265027-f438-406c-8eac-8eacd8a5d347.webp` | https://mobbin.com/screens/f2265027-f438-406c-8eac-8eacd8a5d347 |
| 12 | `ios/flows/adding-an-image-camera/evernote-ios-flow-adding-an-image-camera-e0ddfb22-12-63247041-2f84-4aa3-a69e-4d812c925e46.webp` | https://mobbin.com/screens/63247041-2f84-4aa3-a69e-4d812c925e46 |

### Adding an image (gallery) — `adding-an-image-gallery/` — https://mobbin.com/flows/a8df2408-c195-4d61-a348-895ecd3bbb38

Actions: Selecting & Choosing, Uploading & Downloading. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-an-image-gallery/evernote-ios-flow-adding-an-image-gallery-a8df2408-01-2ba6fa84-36d8-404f-9a44-b198bc56f6c3.webp` | https://mobbin.com/screens/2ba6fa84-36d8-404f-9a44-b198bc56f6c3 |
| 2 | `ios/flows/adding-an-image-gallery/evernote-ios-flow-adding-an-image-gallery-a8df2408-02-828f9a80-8b1b-40b5-b5d6-fbafb1fecfbd.webp` | https://mobbin.com/screens/828f9a80-8b1b-40b5-b5d6-fbafb1fecfbd |
| 3 | `ios/flows/adding-an-image-gallery/evernote-ios-flow-adding-an-image-gallery-a8df2408-03-23c02267-3b1c-4790-8cb6-018395b4514d.webp` | https://mobbin.com/screens/23c02267-3b1c-4790-8cb6-018395b4514d |
| 4 | `ios/flows/adding-an-image-gallery/evernote-ios-flow-adding-an-image-gallery-a8df2408-04-631825af-b996-4750-9c82-52180642ec8b.webp` | https://mobbin.com/screens/631825af-b996-4750-9c82-52180642ec8b |

### Adding background color — `adding-background-color/` — https://mobbin.com/flows/fc60e1bf-f8e0-4600-8d2d-cf429253f250

Actions: Selecting & Choosing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-background-color/evernote-ios-flow-adding-background-color-fc60e1bf-01-81d6fcf2-89d7-4bce-9b86-11789ee14611.webp` | https://mobbin.com/screens/81d6fcf2-89d7-4bce-9b86-11789ee14611 |
| 2 | `ios/flows/adding-background-color/evernote-ios-flow-adding-background-color-fc60e1bf-02-ed051375-066e-4a6e-ad7a-fc3435cf99d1.webp` | https://mobbin.com/screens/ed051375-066e-4a6e-ad7a-fc3435cf99d1 |
| 3 | `ios/flows/adding-background-color/evernote-ios-flow-adding-background-color-fc60e1bf-03-d0a59cb2-8cb1-456b-90a2-a4f4134194a8.webp` | https://mobbin.com/screens/d0a59cb2-8cb1-456b-90a2-a4f4134194a8 |

### Adding more templates — `adding-more-templates/` — https://mobbin.com/flows/512e5dee-3fe2-43e1-baf5-78e5f376c2f0

Actions: Selecting & Choosing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-more-templates/evernote-ios-flow-adding-more-templates-512e5dee-01-9056e48b-833b-4627-a072-aa6cf6420aab.webp` | https://mobbin.com/screens/9056e48b-833b-4627-a072-aa6cf6420aab |
| 2 | `ios/flows/adding-more-templates/evernote-ios-flow-adding-more-templates-512e5dee-02-a5a53b4e-1c5e-4229-a676-e0b099ec0a9c.webp` | https://mobbin.com/screens/a5a53b4e-1c5e-4229-a676-e0b099ec0a9c |
| 3 | `ios/flows/adding-more-templates/evernote-ios-flow-adding-more-templates-512e5dee-03-a4d9947d-1e46-4da4-8fa2-ddcc385a687b.webp` | https://mobbin.com/screens/a4d9947d-1e46-4da4-8fa2-ddcc385a687b |
| 4 | `ios/flows/adding-more-templates/evernote-ios-flow-adding-more-templates-512e5dee-04-b6fb86e4-3d8d-425a-84a6-1263cb632a96.webp` | https://mobbin.com/screens/b6fb86e4-3d8d-425a-84a6-1263cb632a96 |

### Adding scratch pad — `adding-scratch-pad/` — https://mobbin.com/flows/d121ba32-f0d3-4151-b40a-19180b308dc8

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-scratch-pad/evernote-ios-flow-adding-scratch-pad-d121ba32-01-994d7f92-f1a5-44f8-9126-4a032d4bf71a.webp` | https://mobbin.com/screens/994d7f92-f1a5-44f8-9126-4a032d4bf71a |
| 2 | `ios/flows/adding-scratch-pad/evernote-ios-flow-adding-scratch-pad-d121ba32-02-78a5d020-afff-4dda-b4be-fbc30ace1adc.webp` | https://mobbin.com/screens/78a5d020-afff-4dda-b4be-fbc30ace1adc |
| 3 | `ios/flows/adding-scratch-pad/evernote-ios-flow-adding-scratch-pad-d121ba32-03-1e53c2ee-91c0-499c-929e-e433b0ff6c38.webp` | https://mobbin.com/screens/1e53c2ee-91c0-499c-929e-e433b0ff6c38 |

### Adding shared note — `adding-shared-note/` — https://mobbin.com/flows/bb93d9a1-f4dc-498f-8f66-5d0587f7121a

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-shared-note/evernote-ios-flow-adding-shared-note-bb93d9a1-01-7b751db5-76a1-46f1-be40-c8817a1382ec.webp` | https://mobbin.com/screens/7b751db5-76a1-46f1-be40-c8817a1382ec |
| 2 | `ios/flows/adding-shared-note/evernote-ios-flow-adding-shared-note-bb93d9a1-02-89b26e09-c66f-4fed-8f69-9687b7032b31.webp` | https://mobbin.com/screens/89b26e09-c66f-4fed-8f69-9687b7032b31 |
| 3 | `ios/flows/adding-shared-note/evernote-ios-flow-adding-shared-note-bb93d9a1-03-adbb6738-27ab-4516-8f45-d2d38d0287d6.webp` | https://mobbin.com/screens/adbb6738-27ab-4516-8f45-d2d38d0287d6 |

### Adding table of contents — `adding-table-of-contents/` — https://mobbin.com/flows/aaaadd3c-262e-4771-9589-fdea4eebd307

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/adding-table-of-contents/evernote-ios-flow-adding-table-of-contents-aaaadd3c-01-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 2 | `ios/flows/adding-table-of-contents/evernote-ios-flow-adding-table-of-contents-aaaadd3c-02-da6b514a-09b8-40ed-8a0a-a7ab6706736a.webp` | https://mobbin.com/screens/da6b514a-09b8-40ed-8a0a-a7ab6706736a |
| 3 | `ios/flows/adding-table-of-contents/evernote-ios-flow-adding-table-of-contents-aaaadd3c-03-af029e75-97e5-47ed-a62b-c9f583ac9db1.webp` | https://mobbin.com/screens/af029e75-97e5-47ed-a62b-c9f583ac9db1 |

### Assigning a task — `assigning-a-task/` — https://mobbin.com/flows/e0b98e04-0dd3-49fa-b1b6-75fa4468d5dd

Actions: Inviting Teammates & Friends, Searching & Finding, Verifying. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-01-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| 2 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-02-84895131-ecc1-4db1-a239-f9310e67f8df.webp` | https://mobbin.com/screens/84895131-ecc1-4db1-a239-f9310e67f8df |
| 3 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-03-c5e91422-10b6-4a75-8e3d-dc4af3ef5f2d.webp` | https://mobbin.com/screens/c5e91422-10b6-4a75-8e3d-dc4af3ef5f2d |
| 4 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-04-9a5a32b8-8bfc-4096-ace9-26c5584a18a2.webp` | https://mobbin.com/screens/9a5a32b8-8bfc-4096-ace9-26c5584a18a2 |
| 5 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-05-01d21872-66ea-4d9f-896d-f7a842e2dfd0.webp` | https://mobbin.com/screens/01d21872-66ea-4d9f-896d-f7a842e2dfd0 |
| 6 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-06-230e6328-a0c1-4a71-a651-526da0a471cf.webp` | https://mobbin.com/screens/230e6328-a0c1-4a71-a651-526da0a471cf |
| 7 | `ios/flows/assigning-a-task/evernote-ios-flow-assigning-a-task-e0b98e04-07-296dbd41-579c-427f-88d7-0531b2cd4842.webp` | https://mobbin.com/screens/296dbd41-579c-427f-88d7-0531b2cd4842 |

### Calendar — `calendar/` — https://mobbin.com/flows/29ee4167-12e7-4c38-a1c8-0503cbb6f640

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/calendar/evernote-ios-flow-calendar-29ee4167-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/calendar/evernote-ios-flow-calendar-29ee4167-02-8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098.webp` | https://mobbin.com/screens/8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098 |
| 3 | `ios/flows/calendar/evernote-ios-flow-calendar-29ee4167-03-fe7aea76-8230-4ce6-85f8-51d0e57e8540.webp` | https://mobbin.com/screens/fe7aea76-8230-4ce6-85f8-51d0e57e8540 |
| 4 | `ios/flows/calendar/evernote-ios-flow-calendar-29ee4167-04-de0f9c4b-5177-4a08-80a3-d9a3b8e4d879.webp` | https://mobbin.com/screens/de0f9c4b-5177-4a08-80a3-d9a3b8e4d879 |

### Calendar options — `calendar-options/` — https://mobbin.com/flows/106791c7-08e3-4da6-9e69-bcba6407c7de

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/calendar-options/evernote-ios-flow-calendar-options-106791c7-01-8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098.webp` | https://mobbin.com/screens/8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098 |
| 2 | `ios/flows/calendar-options/evernote-ios-flow-calendar-options-106791c7-02-4d01a91a-f7c6-424d-be44-eaa36c8b277d.webp` | https://mobbin.com/screens/4d01a91a-f7c6-424d-be44-eaa36c8b277d |

### Changing a template — `changing-a-template/` — https://mobbin.com/flows/74686bdb-0595-4b23-bec5-938e6882ae68

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/changing-a-template/evernote-ios-flow-changing-a-template-74686bdb-01-2e5108ff-5782-44f7-b313-0b83c099e5d1.webp` | https://mobbin.com/screens/2e5108ff-5782-44f7-b313-0b83c099e5d1 |
| 2 | `ios/flows/changing-a-template/evernote-ios-flow-changing-a-template-74686bdb-02-1e474a87-13b2-42aa-aaad-0f727f04be23.webp` | https://mobbin.com/screens/1e474a87-13b2-42aa-aaad-0f727f04be23 |
| 3 | `ios/flows/changing-a-template/evernote-ios-flow-changing-a-template-74686bdb-03-3e20709a-665e-49a9-bc0e-631b5ade7aa6.webp` | https://mobbin.com/screens/3e20709a-665e-49a9-bc0e-631b5ade7aa6 |
| 4 | `ios/flows/changing-a-template/evernote-ios-flow-changing-a-template-74686bdb-04-c69b0e22-9ea3-4ba5-a004-dd5554092b50.webp` | https://mobbin.com/screens/c69b0e22-9ea3-4ba5-a004-dd5554092b50 |

### Changing background — `changing-background/` — https://mobbin.com/flows/f95e218b-d2bb-476b-a701-186734c24930

Actions: Turning On/Off, Uploading & Downloading. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-01-a2fd7b7e-0e37-409a-a6eb-a62a6c076001.webp` | https://mobbin.com/screens/a2fd7b7e-0e37-409a-a6eb-a62a6c076001 |
| 2 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-02-6cc20631-9446-4e14-881d-83b584104cfd.webp` | https://mobbin.com/screens/6cc20631-9446-4e14-881d-83b584104cfd |
| 3 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-03-2e32d17b-f18c-4abe-8390-f15d35d2633c.webp` | https://mobbin.com/screens/2e32d17b-f18c-4abe-8390-f15d35d2633c |
| 4 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-04-2c2e77cf-8b29-4947-b0cb-274fafd0f15f.webp` | https://mobbin.com/screens/2c2e77cf-8b29-4947-b0cb-274fafd0f15f |
| 5 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-05-0bd6f091-c289-45df-b18b-cde994d0d363.webp` | https://mobbin.com/screens/0bd6f091-c289-45df-b18b-cde994d0d363 |
| 6 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-06-941555b0-31c9-49fd-beae-c00f0c4bacb0.webp` | https://mobbin.com/screens/941555b0-31c9-49fd-beae-c00f0c4bacb0 |
| 7 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-07-baf1a319-768b-4d37-b4d2-49b5807ec6cb.webp` | https://mobbin.com/screens/baf1a319-768b-4d37-b4d2-49b5807ec6cb |
| 8 | `ios/flows/changing-background/evernote-ios-flow-changing-background-f95e218b-08-4888c9d1-5eed-4d28-ad1f-21cb7bb58077.webp` | https://mobbin.com/screens/4888c9d1-5eed-4d28-ad1f-21cb7bb58077 |

### Changing calendar view — `changing-calendar-view/` — https://mobbin.com/flows/0a0bf604-f9fc-49ba-961e-9fd86d378352

Actions: Switching View. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/changing-calendar-view/evernote-ios-flow-changing-calendar-view-0a0bf604-01-4d01a91a-f7c6-424d-be44-eaa36c8b277d.webp` | https://mobbin.com/screens/4d01a91a-f7c6-424d-be44-eaa36c8b277d |
| 2 | `ios/flows/changing-calendar-view/evernote-ios-flow-changing-calendar-view-0a0bf604-02-9f9ca4c9-4355-40e2-8e33-8f6a43c53427.webp` | https://mobbin.com/screens/9f9ca4c9-4355-40e2-8e33-8f6a43c53427 |
| 3 | `ios/flows/changing-calendar-view/evernote-ios-flow-changing-calendar-view-0a0bf604-03-bdf1d1f0-1c3b-4077-845c-71834af18d7c.webp` | https://mobbin.com/screens/bdf1d1f0-1c3b-4077-845c-71834af18d7c |
| 4 | `ios/flows/changing-calendar-view/evernote-ios-flow-changing-calendar-view-0a0bf604-04-f418c65e-cd17-4c4c-a175-e99374930838.webp` | https://mobbin.com/screens/f418c65e-cd17-4c4c-a175-e99374930838 |

### Changing content size — `changing-content-size/` — https://mobbin.com/flows/33ccdd22-eccd-48ae-92c1-8dd815916281

Actions: Editing & Updating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/changing-content-size/evernote-ios-flow-changing-content-size-33ccdd22-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/changing-content-size/evernote-ios-flow-changing-content-size-33ccdd22-02-c8ccb710-4e06-445d-bbfa-8dbb84b023b3.webp` | https://mobbin.com/screens/c8ccb710-4e06-445d-bbfa-8dbb84b023b3 |
| 3 | `ios/flows/changing-content-size/evernote-ios-flow-changing-content-size-33ccdd22-03-5cf22a4a-2106-4401-b4f6-b90ed6e67dc7.webp` | https://mobbin.com/screens/5cf22a4a-2106-4401-b4f6-b90ed6e67dc7 |
| 4 | `ios/flows/changing-content-size/evernote-ios-flow-changing-content-size-33ccdd22-04-d3bdec1c-8ce4-4ca8-96a5-9fe97e3b3943.webp` | https://mobbin.com/screens/d3bdec1c-8ce4-4ca8-96a5-9fe97e3b3943 |
| 5 | `ios/flows/changing-content-size/evernote-ios-flow-changing-content-size-33ccdd22-05-3041fe81-ceb7-428b-8fd8-a28204d191d3.webp` | https://mobbin.com/screens/3041fe81-ceb7-428b-8fd8-a28204d191d3 |

### Changing default notebook — `changing-default-notebook/` — https://mobbin.com/flows/185ef694-2168-4c4b-9e38-9430f12d8d10

Actions: Editing & Updating. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-01-40dadd42-c502-4859-b4e1-a0b34e7d63cb.webp` | https://mobbin.com/screens/40dadd42-c502-4859-b4e1-a0b34e7d63cb |
| 2 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-02-7aef826b-ab79-4cbb-8885-4ed2cae1741f.webp` | https://mobbin.com/screens/7aef826b-ab79-4cbb-8885-4ed2cae1741f |
| 3 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-03-02b03751-159c-4fb5-b857-39e403a01c45.webp` | https://mobbin.com/screens/02b03751-159c-4fb5-b857-39e403a01c45 |
| 4 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-04-8f0bd7ea-4ae7-466a-aa34-6720c2db124f.webp` | https://mobbin.com/screens/8f0bd7ea-4ae7-466a-aa34-6720c2db124f |
| 5 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-05-64019ffd-c51e-4c3f-b18a-f44b932c0452.webp` | https://mobbin.com/screens/64019ffd-c51e-4c3f-b18a-f44b932c0452 |
| 6 | `ios/flows/changing-default-notebook/evernote-ios-flow-changing-default-notebook-185ef694-06-a51d2a5c-6dec-4608-9af2-a7ffda5aae50.webp` | https://mobbin.com/screens/a51d2a5c-6dec-4608-9af2-a7ffda5aae50 |

### Choosing calendars — `choosing-calendars/` — https://mobbin.com/flows/7929a139-755b-4f9a-9d9f-c333b85d9c47

Actions: Selecting & Choosing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/choosing-calendars/evernote-ios-flow-choosing-calendars-7929a139-01-4d01a91a-f7c6-424d-be44-eaa36c8b277d.webp` | https://mobbin.com/screens/4d01a91a-f7c6-424d-be44-eaa36c8b277d |
| 2 | `ios/flows/choosing-calendars/evernote-ios-flow-choosing-calendars-7929a139-02-20142561-3643-4a4d-b191-cb1da4b3eebb.webp` | https://mobbin.com/screens/20142561-3643-4a4d-b191-cb1da4b3eebb |
| 3 | `ios/flows/choosing-calendars/evernote-ios-flow-choosing-calendars-7929a139-03-99d11df6-2c65-44ed-a298-3a7e3d45947f.webp` | https://mobbin.com/screens/99d11df6-2c65-44ed-a298-3a7e3d45947f |
| 4 | `ios/flows/choosing-calendars/evernote-ios-flow-choosing-calendars-7929a139-04-de0f9c4b-5177-4a08-80a3-d9a3b8e4d879.webp` | https://mobbin.com/screens/de0f9c4b-5177-4a08-80a3-d9a3b8e4d879 |

### Completing a task — `completing-a-task/` — https://mobbin.com/flows/882e0440-a9ee-40a7-b8f7-fddbb6eb4c6e

Actions: Marking. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/completing-a-task/evernote-ios-flow-completing-a-task-882e0440-01-a54bf80a-47b8-43f9-85db-d41c87c3bd27.webp` | https://mobbin.com/screens/a54bf80a-47b8-43f9-85db-d41c87c3bd27 |
| 2 | `ios/flows/completing-a-task/evernote-ios-flow-completing-a-task-882e0440-02-e5da9609-b2d9-4a47-a401-672f628345b5.webp` | https://mobbin.com/screens/e5da9609-b2d9-4a47-a401-672f628345b5 |

### Completing app setup — `completing-app-setup/` — https://mobbin.com/flows/02d5b9c1-dcca-44a8-97f0-1b3776714c1e

Actions: Adding & Creating, Selecting & Choosing, Starting & Completing. Screens: 12.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-02-3b3e7248-7d54-4d01-bb2f-a05998b28ef5.webp` | https://mobbin.com/screens/3b3e7248-7d54-4d01-bb2f-a05998b28ef5 |
| 3 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-03-0caae5cd-40e8-4ca8-b1d3-05611d4bcf43.webp` | https://mobbin.com/screens/0caae5cd-40e8-4ca8-b1d3-05611d4bcf43 |
| 4 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-04-c9b4500e-9725-44bc-b8bc-3c5b29b42097.webp` | https://mobbin.com/screens/c9b4500e-9725-44bc-b8bc-3c5b29b42097 |
| 5 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-05-68eabcd1-6ff1-4943-86ce-e755a89d6a75.webp` | https://mobbin.com/screens/68eabcd1-6ff1-4943-86ce-e755a89d6a75 |
| 6 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-06-e6c8960b-d482-4a55-8436-9f56d089c6d4.webp` | https://mobbin.com/screens/e6c8960b-d482-4a55-8436-9f56d089c6d4 |
| 7 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-07-dd1da79c-909f-4d3b-b7e2-3fba6f48461e.webp` | https://mobbin.com/screens/dd1da79c-909f-4d3b-b7e2-3fba6f48461e |
| 8 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-08-822590d0-c375-469d-a0a4-8311b2b347ba.webp` | https://mobbin.com/screens/822590d0-c375-469d-a0a4-8311b2b347ba |
| 9 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-09-be5e3d71-d192-4444-be67-0b5d4bddc6de.webp` | https://mobbin.com/screens/be5e3d71-d192-4444-be67-0b5d4bddc6de |
| 10 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-10-9107b404-36a7-4816-bc5a-ba88c2ae13c4.webp` | https://mobbin.com/screens/9107b404-36a7-4816-bc5a-ba88c2ae13c4 |
| 11 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-11-fbe7c95c-dbcf-444f-9863-8e5516339e6e.webp` | https://mobbin.com/screens/fbe7c95c-dbcf-444f-9863-8e5516339e6e |
| 12 | `ios/flows/completing-app-setup/evernote-ios-flow-completing-app-setup-02d5b9c1-12-0c56d56b-9ad9-4ca9-95c4-d6ded5eecea7.webp` | https://mobbin.com/screens/0c56d56b-9ad9-4ca9-95c4-d6ded5eecea7 |

### Converting to preview — `converting-to-preview/` — https://mobbin.com/flows/0712732c-7d87-4b8a-8150-238ea92136f8

Actions: Misc. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/converting-to-preview/evernote-ios-flow-converting-to-preview-0712732c-01-43ab21bb-902f-45a0-a221-2e0a8203da6c.webp` | https://mobbin.com/screens/43ab21bb-902f-45a0-a221-2e0a8203da6c |
| 2 | `ios/flows/converting-to-preview/evernote-ios-flow-converting-to-preview-0712732c-02-d3010e6c-8f11-4175-9fc3-2135b17522e0.webp` | https://mobbin.com/screens/d3010e6c-8f11-4175-9fc3-2135b17522e0 |
| 3 | `ios/flows/converting-to-preview/evernote-ios-flow-converting-to-preview-0712732c-03-d3cd8b8b-34c1-4a60-8620-883f63b18589.webp` | https://mobbin.com/screens/d3cd8b8b-34c1-4a60-8620-883f63b18589 |

### Copying a note link — `copying-a-note-link/` — https://mobbin.com/flows/5ca45124-0e81-40f3-a557-b2f444449594

Actions: Copying & Duplicating, Sharing. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/copying-a-note-link/evernote-ios-flow-copying-a-note-link-5ca45124-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/copying-a-note-link/evernote-ios-flow-copying-a-note-link-5ca45124-02-328c5473-0d7e-4d70-a08d-10b2d4fe7c9e.webp` | https://mobbin.com/screens/328c5473-0d7e-4d70-a08d-10b2d4fe7c9e |

### Create — `create/` — https://mobbin.com/flows/7b47a8a8-e847-46a0-941f-65947cb57df2

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/create/evernote-ios-flow-create-7b47a8a8-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/create/evernote-ios-flow-create-7b47a8a8-02-cafe4bcd-124d-4283-a4f2-21cb162b80bc.webp` | https://mobbin.com/screens/cafe4bcd-124d-4283-a4f2-21cb162b80bc |
| 3 | `ios/flows/create/evernote-ios-flow-create-7b47a8a8-03-994d7f92-f1a5-44f8-9126-4a032d4bf71a.webp` | https://mobbin.com/screens/994d7f92-f1a5-44f8-9126-4a032d4bf71a |

### Creating a new linked note — `creating-a-new-linked-note/` — https://mobbin.com/flows/672a584d-c1f5-48a1-807b-7586161424f1

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-a-new-linked-note/evernote-ios-flow-creating-a-new-linked-note-672a584d-01-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 2 | `ios/flows/creating-a-new-linked-note/evernote-ios-flow-creating-a-new-linked-note-672a584d-02-0ef6ae97-930e-486b-9c0a-26833964e014.webp` | https://mobbin.com/screens/0ef6ae97-930e-486b-9c0a-26833964e014 |
| 3 | `ios/flows/creating-a-new-linked-note/evernote-ios-flow-creating-a-new-linked-note-672a584d-03-5141b86b-efd1-4981-8bb7-f307060a855a.webp` | https://mobbin.com/screens/5141b86b-efd1-4981-8bb7-f307060a855a |
| 4 | `ios/flows/creating-a-new-linked-note/evernote-ios-flow-creating-a-new-linked-note-672a584d-04-5546af9f-3c7f-473a-a279-39f1c71693cb.webp` | https://mobbin.com/screens/5546af9f-3c7f-473a-a279-39f1c71693cb |

### Creating a new note — `creating-a-new-note/` — https://mobbin.com/flows/4cb2dbbe-da3c-42f6-bbff-5d584b06f470

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-a-new-note/evernote-ios-flow-creating-a-new-note-4cb2dbbe-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/creating-a-new-note/evernote-ios-flow-creating-a-new-note-4cb2dbbe-02-ca48c93f-7215-4603-89f5-3d27ba900943.webp` | https://mobbin.com/screens/ca48c93f-7215-4603-89f5-3d27ba900943 |
| 3 | `ios/flows/creating-a-new-note/evernote-ios-flow-creating-a-new-note-4cb2dbbe-03-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 4 | `ios/flows/creating-a-new-note/evernote-ios-flow-creating-a-new-note-4cb2dbbe-04-9056e48b-833b-4627-a072-aa6cf6420aab.webp` | https://mobbin.com/screens/9056e48b-833b-4627-a072-aa6cf6420aab |
| 5 | `ios/flows/creating-a-new-note/evernote-ios-flow-creating-a-new-note-4cb2dbbe-05-13ab4561-2b0e-46cc-bf53-98abfecda8f3.webp` | https://mobbin.com/screens/13ab4561-2b0e-46cc-bf53-98abfecda8f3 |

### Creating a new tag — `creating-a-new-tag/` — https://mobbin.com/flows/0d2f4ca1-9c6f-4d3d-a29a-2e17b3c2dd8d

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-a-new-tag/evernote-ios-flow-creating-a-new-tag-0d2f4ca1-01-1616438f-4ab8-4fd8-b741-d201a57688ba.webp` | https://mobbin.com/screens/1616438f-4ab8-4fd8-b741-d201a57688ba |
| 2 | `ios/flows/creating-a-new-tag/evernote-ios-flow-creating-a-new-tag-0d2f4ca1-02-ee70d570-8304-47b6-b135-8a49ff98be64.webp` | https://mobbin.com/screens/ee70d570-8304-47b6-b135-8a49ff98be64 |
| 3 | `ios/flows/creating-a-new-tag/evernote-ios-flow-creating-a-new-tag-0d2f4ca1-03-0d4cee4b-b711-46b5-9e64-5182c359551a.webp` | https://mobbin.com/screens/0d4cee4b-b711-46b5-9e64-5182c359551a |
| 4 | `ios/flows/creating-a-new-tag/evernote-ios-flow-creating-a-new-tag-0d2f4ca1-04-9d641a90-bda0-4377-8c45-d7362fa30e32.webp` | https://mobbin.com/screens/9d641a90-bda0-4377-8c45-d7362fa30e32 |

### Creating a new task — `creating-a-new-task/` — https://mobbin.com/flows/2954b6d8-6c44-40c7-ae25-648861602dbc

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-a-new-task/evernote-ios-flow-creating-a-new-task-2954b6d8-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/creating-a-new-task/evernote-ios-flow-creating-a-new-task-2954b6d8-02-ecec3dd6-7f30-4a30-87da-2ca3b2c848ae.webp` | https://mobbin.com/screens/ecec3dd6-7f30-4a30-87da-2ca3b2c848ae |
| 3 | `ios/flows/creating-a-new-task/evernote-ios-flow-creating-a-new-task-2954b6d8-03-ca35a681-ecf0-451e-8c15-806698697153.webp` | https://mobbin.com/screens/ca35a681-ecf0-451e-8c15-806698697153 |
| 4 | `ios/flows/creating-a-new-task/evernote-ios-flow-creating-a-new-task-2954b6d8-04-34824597-5f6e-4a19-8f38-3612e679622b.webp` | https://mobbin.com/screens/34824597-5f6e-4a19-8f38-3612e679622b |

### Creating a notebook — `creating-a-notebook/` — https://mobbin.com/flows/1f56ea7b-ab9c-4b81-bb35-e60e006088a8

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-a-notebook/evernote-ios-flow-creating-a-notebook-1f56ea7b-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/creating-a-notebook/evernote-ios-flow-creating-a-notebook-1f56ea7b-02-b1ab3e51-0ea0-42dc-bda6-afc49ee4ccf5.webp` | https://mobbin.com/screens/b1ab3e51-0ea0-42dc-bda6-afc49ee4ccf5 |
| 3 | `ios/flows/creating-a-notebook/evernote-ios-flow-creating-a-notebook-1f56ea7b-03-dfceb77d-a709-44cd-bf0a-51e0d112f1af.webp` | https://mobbin.com/screens/dfceb77d-a709-44cd-bf0a-51e0d112f1af |
| 4 | `ios/flows/creating-a-notebook/evernote-ios-flow-creating-a-notebook-1f56ea7b-04-0f9f3693-35f2-471a-8ce7-62a89eabb19d.webp` | https://mobbin.com/screens/0f9f3693-35f2-471a-8ce7-62a89eabb19d |

### Creating an event — `creating-an-event/` — https://mobbin.com/flows/78d6712a-6559-430b-873e-8bc0404e8173

Actions: Scheduling. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-01-8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098.webp` | https://mobbin.com/screens/8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098 |
| 2 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-02-5a174ae3-e550-49bf-955d-1c9ed2750cda.webp` | https://mobbin.com/screens/5a174ae3-e550-49bf-955d-1c9ed2750cda |
| 3 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-03-e54eba99-c770-4e36-aad1-8ab28ef6d636.webp` | https://mobbin.com/screens/e54eba99-c770-4e36-aad1-8ab28ef6d636 |
| 4 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-04-ac3007c1-4196-4f37-828a-b46c3d465677.webp` | https://mobbin.com/screens/ac3007c1-4196-4f37-828a-b46c3d465677 |
| 5 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-05-b22b5337-8cd4-4b39-863f-e6254fd2ae3e.webp` | https://mobbin.com/screens/b22b5337-8cd4-4b39-863f-e6254fd2ae3e |
| 6 | `ios/flows/creating-an-event/evernote-ios-flow-creating-an-event-78d6712a-06-62bfc52e-ff79-4074-bb90-dfe3a9e31244.webp` | https://mobbin.com/screens/62bfc52e-ff79-4074-bb90-dfe3a9e31244 |

### Customizing widgets — `customizing-widgets/` — https://mobbin.com/flows/cca4ef0d-7e6d-4c1b-9dd1-2f4bab997f26

Actions: Editing & Updating, Uploading & Downloading. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/customizing-widgets/evernote-ios-flow-customizing-widgets-cca4ef0d-01-d9c0cb9a-9f61-4019-b398-2d7243d68120.webp` | https://mobbin.com/screens/d9c0cb9a-9f61-4019-b398-2d7243d68120 |
| 2 | `ios/flows/customizing-widgets/evernote-ios-flow-customizing-widgets-cca4ef0d-02-a2fd7b7e-0e37-409a-a6eb-a62a6c076001.webp` | https://mobbin.com/screens/a2fd7b7e-0e37-409a-a6eb-a62a6c076001 |
| 3 | `ios/flows/customizing-widgets/evernote-ios-flow-customizing-widgets-cca4ef0d-03-3f0b688d-64ff-4787-aec2-c6f2b874799d.webp` | https://mobbin.com/screens/3f0b688d-64ff-4787-aec2-c6f2b874799d |
| 4 | `ios/flows/customizing-widgets/evernote-ios-flow-customizing-widgets-cca4ef0d-04-d363ef62-06d9-4f58-a0e7-7399f5e9105b.webp` | https://mobbin.com/screens/d363ef62-06d9-4f58-a0e7-7399f5e9105b |

### Daily note — `daily-note/` — https://mobbin.com/flows/d8537d58-ee48-44b7-a741-6037cd361cf5

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/daily-note/evernote-ios-flow-daily-note-d8537d58-01-f74264ac-0593-4010-a615-a072d51d445e.webp` | https://mobbin.com/screens/f74264ac-0593-4010-a615-a072d51d445e |
| 2 | `ios/flows/daily-note/evernote-ios-flow-daily-note-d8537d58-02-2e5108ff-5782-44f7-b313-0b83c099e5d1.webp` | https://mobbin.com/screens/2e5108ff-5782-44f7-b313-0b83c099e5d1 |

### Deleting a notebook — `deleting-a-notebook/` — https://mobbin.com/flows/f781a998-8ef0-447d-92c1-584432ca7e57

Actions: Deleting & Removing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/deleting-a-notebook/evernote-ios-flow-deleting-a-notebook-f781a998-01-85c1b0c0-2bb2-420a-ac53-3ce244aed5df.webp` | https://mobbin.com/screens/85c1b0c0-2bb2-420a-ac53-3ce244aed5df |
| 2 | `ios/flows/deleting-a-notebook/evernote-ios-flow-deleting-a-notebook-f781a998-02-b3cb8527-d6f9-4b54-8279-7e06d59a4fe1.webp` | https://mobbin.com/screens/b3cb8527-d6f9-4b54-8279-7e06d59a4fe1 |
| 3 | `ios/flows/deleting-a-notebook/evernote-ios-flow-deleting-a-notebook-f781a998-03-0299d5fc-d30c-452b-94dd-51e4cbd1c0d0.webp` | https://mobbin.com/screens/0299d5fc-d30c-452b-94dd-51e4cbd1c0d0 |

### Downloading a note — `downloading-a-note/` — https://mobbin.com/flows/70b32ad0-f214-4e28-b355-c356ea431903

Actions: Uploading & Downloading. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/downloading-a-note/evernote-ios-flow-downloading-a-note-70b32ad0-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/downloading-a-note/evernote-ios-flow-downloading-a-note-70b32ad0-02-e02408ee-1a3a-4218-9dcc-c26f09254741.webp` | https://mobbin.com/screens/e02408ee-1a3a-4218-9dcc-c26f09254741 |

### Downloading a notebook — `downloading-a-notebook/` — https://mobbin.com/flows/41627c76-d72c-4b3d-bf0a-500cdc2decfa

Actions: Uploading & Downloading. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/downloading-a-notebook/evernote-ios-flow-downloading-a-notebook-41627c76-01-a3b00a9b-8a86-4417-97b1-cc38dae31288.webp` | https://mobbin.com/screens/a3b00a9b-8a86-4417-97b1-cc38dae31288 |
| 2 | `ios/flows/downloading-a-notebook/evernote-ios-flow-downloading-a-notebook-41627c76-02-a1001720-eb1f-4cd3-8d46-f02904aafdf7.webp` | https://mobbin.com/screens/a1001720-eb1f-4cd3-8d46-f02904aafdf7 |
| 3 | `ios/flows/downloading-a-notebook/evernote-ios-flow-downloading-a-notebook-41627c76-03-7e20bff0-eb26-4e2d-97f2-9ff3ad09f445.webp` | https://mobbin.com/screens/7e20bff0-eb26-4e2d-97f2-9ff3ad09f445 |
| 4 | `ios/flows/downloading-a-notebook/evernote-ios-flow-downloading-a-notebook-41627c76-04-86227d35-d893-4726-a775-e6f1a1a5b1db.webp` | https://mobbin.com/screens/86227d35-d893-4726-a775-e6f1a1a5b1db |

### Duplicating a note — `duplicating-a-note/` — https://mobbin.com/flows/8cac47f9-d298-435d-a49a-4cd52f1ed5ab

Actions: Copying & Duplicating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/duplicating-a-note/evernote-ios-flow-duplicating-a-note-8cac47f9-01-835959fe-d399-4cf8-b6df-423e900e6bb5.webp` | https://mobbin.com/screens/835959fe-d399-4cf8-b6df-423e900e6bb5 |
| 2 | `ios/flows/duplicating-a-note/evernote-ios-flow-duplicating-a-note-8cac47f9-02-4cb35ea6-0f81-4555-bfba-6e38be84ca11.webp` | https://mobbin.com/screens/4cb35ea6-0f81-4555-bfba-6e38be84ca11 |
| 3 | `ios/flows/duplicating-a-note/evernote-ios-flow-duplicating-a-note-8cac47f9-03-c306fb43-7f1a-4f3c-abe8-847e49df093c.webp` | https://mobbin.com/screens/c306fb43-7f1a-4f3c-abe8-847e49df093c |

### Edit shortcuts — `edit-shortcuts/` — https://mobbin.com/flows/41878dad-2277-4cce-8931-9074649cd79b

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/edit-shortcuts/evernote-ios-flow-edit-shortcuts-41878dad-01-8c3af280-2c91-4653-9bd7-e6f589a640f5.webp` | https://mobbin.com/screens/8c3af280-2c91-4653-9bd7-e6f589a640f5 |
| 2 | `ios/flows/edit-shortcuts/evernote-ios-flow-edit-shortcuts-41878dad-02-f3a910f2-31c0-4fcb-ad3a-14f8fd1cbb63.webp` | https://mobbin.com/screens/f3a910f2-31c0-4fcb-ad3a-14f8fd1cbb63 |
| 3 | `ios/flows/edit-shortcuts/evernote-ios-flow-edit-shortcuts-41878dad-03-efe4453d-c71c-4547-a9a9-4a46b2dedc0b.webp` | https://mobbin.com/screens/efe4453d-c71c-4547-a9a9-4a46b2dedc0b |

### Editing a task — `editing-a-task/` — https://mobbin.com/flows/8568526e-83f6-49aa-a6b6-3a9ca831344a

Actions: Editing & Updating. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-01-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| 2 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-02-96dca75a-f565-4e5e-9847-390cc1007dc4.webp` | https://mobbin.com/screens/96dca75a-f565-4e5e-9847-390cc1007dc4 |
| 3 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-03-93fe731d-5dea-41d7-967b-dfa4fb0994a0.webp` | https://mobbin.com/screens/93fe731d-5dea-41d7-967b-dfa4fb0994a0 |
| 4 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-04-7ac768f2-343b-4ea4-9945-fa66e5f3b7a8.webp` | https://mobbin.com/screens/7ac768f2-343b-4ea4-9945-fa66e5f3b7a8 |
| 5 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-05-2bdd8471-9118-44a9-aba3-770a67448d60.webp` | https://mobbin.com/screens/2bdd8471-9118-44a9-aba3-770a67448d60 |
| 6 | `ios/flows/editing-a-task/evernote-ios-flow-editing-a-task-8568526e-06-2125fe27-a563-4fd4-9de9-c65bbd0ed2a5.webp` | https://mobbin.com/screens/2125fe27-a563-4fd4-9de9-c65bbd0ed2a5 |

### Editing an image — `editing-an-image/` — https://mobbin.com/flows/543c252e-927b-4aa1-82d9-4c9ee881d906

Actions: Drawing, Editing & Updating. Screens: 18.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-01-852e0bd2-2cde-415b-a463-c7dc72a58284.webp` | https://mobbin.com/screens/852e0bd2-2cde-415b-a463-c7dc72a58284 |
| 2 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-02-fcb9dca0-3b8e-4377-8c0f-52fb52430939.webp` | https://mobbin.com/screens/fcb9dca0-3b8e-4377-8c0f-52fb52430939 |
| 3 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-03-78b4af64-3308-4b50-a3d3-d797f4254395.webp` | https://mobbin.com/screens/78b4af64-3308-4b50-a3d3-d797f4254395 |
| 4 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-04-ab16f9b3-75ce-4c62-8b21-d7e5947c330a.webp` | https://mobbin.com/screens/ab16f9b3-75ce-4c62-8b21-d7e5947c330a |
| 5 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-05-60c0bad3-a969-464c-b824-b8a62a4cd9a8.webp` | https://mobbin.com/screens/60c0bad3-a969-464c-b824-b8a62a4cd9a8 |
| 6 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-06-a74ba635-342b-4566-b007-d661e53dd7e8.webp` | https://mobbin.com/screens/a74ba635-342b-4566-b007-d661e53dd7e8 |
| 7 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-07-11c16715-6f9a-4b63-b256-323f9d125dd8.webp` | https://mobbin.com/screens/11c16715-6f9a-4b63-b256-323f9d125dd8 |
| 8 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-08-409f2343-44d6-47eb-af0d-3e0332700692.webp` | https://mobbin.com/screens/409f2343-44d6-47eb-af0d-3e0332700692 |
| 9 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-09-76c86e3c-8762-4251-9c0d-f512e48b3177.webp` | https://mobbin.com/screens/76c86e3c-8762-4251-9c0d-f512e48b3177 |
| 10 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-10-4bebaa93-7ee4-4904-a2fd-b7dae76814a0.webp` | https://mobbin.com/screens/4bebaa93-7ee4-4904-a2fd-b7dae76814a0 |
| 11 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-11-af72170d-efe5-4e6c-ae10-803e243a7286.webp` | https://mobbin.com/screens/af72170d-efe5-4e6c-ae10-803e243a7286 |
| 12 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-12-286c7e64-e7ea-498e-a74d-13af8e65d9c3.webp` | https://mobbin.com/screens/286c7e64-e7ea-498e-a74d-13af8e65d9c3 |
| 13 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-13-fd752de1-7b80-43c2-998e-e5f86a5f7bc3.webp` | https://mobbin.com/screens/fd752de1-7b80-43c2-998e-e5f86a5f7bc3 |
| 14 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-14-2c75aa06-1162-4adc-a78f-bd02874fc553.webp` | https://mobbin.com/screens/2c75aa06-1162-4adc-a78f-bd02874fc553 |
| 15 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-15-1083e21c-97a5-4571-a578-a485281e8de3.webp` | https://mobbin.com/screens/1083e21c-97a5-4571-a578-a485281e8de3 |
| 16 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-16-f1ec2d4d-0306-492f-8353-4007fc572c33.webp` | https://mobbin.com/screens/f1ec2d4d-0306-492f-8353-4007fc572c33 |
| 17 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-17-513a9221-8457-468e-bc3a-4b50734426e8.webp` | https://mobbin.com/screens/513a9221-8457-468e-bc3a-4b50734426e8 |
| 18 | `ios/flows/editing-an-image/evernote-ios-flow-editing-an-image-543c252e-18-06ad1511-400a-4a0f-a2fb-c7a0118e0ea6.webp` | https://mobbin.com/screens/06ad1511-400a-4a0f-a2fb-c7a0118e0ea6 |

### Editing background pattern — `editing-background-pattern/` — https://mobbin.com/flows/fefda1cb-d276-415c-a3e6-ab8ad4cf8963

Actions: Editing & Updating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/editing-background-pattern/evernote-ios-flow-editing-background-pattern-fefda1cb-01-81d6fcf2-89d7-4bce-9b86-11789ee14611.webp` | https://mobbin.com/screens/81d6fcf2-89d7-4bce-9b86-11789ee14611 |
| 2 | `ios/flows/editing-background-pattern/evernote-ios-flow-editing-background-pattern-fefda1cb-02-60906c68-977f-4d6d-b098-9fe97926ed67.webp` | https://mobbin.com/screens/60906c68-977f-4d6d-b098-9fe97926ed67 |
| 3 | `ios/flows/editing-background-pattern/evernote-ios-flow-editing-background-pattern-fefda1cb-03-18d5836d-7fad-40bb-b6f2-d28dd6b8ba0f.webp` | https://mobbin.com/screens/18d5836d-7fad-40bb-b6f2-d28dd6b8ba0f |

### Editing widget — `editing-widget/` — https://mobbin.com/flows/37076633-56ec-4eb1-a3a8-b8c4f68e9de7

Actions: Editing & Updating. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-01-44a9ceb2-ca06-4457-a0e0-2de73288c96e.webp` | https://mobbin.com/screens/44a9ceb2-ca06-4457-a0e0-2de73288c96e |
| 2 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-02-714be3ff-ec96-495d-868f-f510415aa858.webp` | https://mobbin.com/screens/714be3ff-ec96-495d-868f-f510415aa858 |
| 3 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-03-bc6f25aa-11c7-41fd-b62e-4d3e1ee6da81.webp` | https://mobbin.com/screens/bc6f25aa-11c7-41fd-b62e-4d3e1ee6da81 |
| 4 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-04-1bf76072-07f4-4bfc-8802-0750bf89862f.webp` | https://mobbin.com/screens/1bf76072-07f4-4bfc-8802-0750bf89862f |
| 5 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-05-ebd2a789-d8e9-4d0d-bf08-b2efb20f1d0c.webp` | https://mobbin.com/screens/ebd2a789-d8e9-4d0d-bf08-b2efb20f1d0c |
| 6 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-06-b3c510fb-0ad9-4fbd-8ba9-0b3c719e2c58.webp` | https://mobbin.com/screens/b3c510fb-0ad9-4fbd-8ba9-0b3c719e2c58 |
| 7 | `ios/flows/editing-widget/evernote-ios-flow-editing-widget-37076633-07-e9545f74-21fb-4956-bf87-516ff40e1194.webp` | https://mobbin.com/screens/e9545f74-21fb-4956-bf87-516ff40e1194 |

### Editing with AI Note Cleanup — `editing-with-ai-note-cleanup/` — https://mobbin.com/flows/78e8a630-48c4-4477-99a9-afce3bcda1b4

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/editing-with-ai-note-cleanup/evernote-ios-flow-editing-with-ai-note-cleanup-78e8a630-01-13ab4561-2b0e-46cc-bf53-98abfecda8f3.webp` | https://mobbin.com/screens/13ab4561-2b0e-46cc-bf53-98abfecda8f3 |
| 2 | `ios/flows/editing-with-ai-note-cleanup/evernote-ios-flow-editing-with-ai-note-cleanup-78e8a630-02-d18bf0a6-8e16-4889-9273-ee75681fa31f.webp` | https://mobbin.com/screens/d18bf0a6-8e16-4889-9273-ee75681fa31f |
| 3 | `ios/flows/editing-with-ai-note-cleanup/evernote-ios-flow-editing-with-ai-note-cleanup-78e8a630-03-b19b5725-c32b-4de9-a07c-2b537b855cd9.webp` | https://mobbin.com/screens/b19b5725-c32b-4de9-a07c-2b537b855cd9 |
| 4 | `ios/flows/editing-with-ai-note-cleanup/evernote-ios-flow-editing-with-ai-note-cleanup-78e8a630-04-49a6a046-e3e5-4073-aa42-cb5ea5852af0.webp` | https://mobbin.com/screens/49a6a046-e3e5-4073-aa42-cb5ea5852af0 |

### Evernote email — `evernote-email/` — https://mobbin.com/flows/51953d51-f369-4540-a057-f07d51482f89

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/evernote-email/evernote-ios-flow-evernote-email-51953d51-01-2c514b18-4086-456f-a015-1bb16a84b5a3.webp` | https://mobbin.com/screens/2c514b18-4086-456f-a015-1bb16a84b5a3 |
| 2 | `ios/flows/evernote-email/evernote-ios-flow-evernote-email-51953d51-02-11175449-e310-41d3-9d6d-287efcd62f8f.webp` | https://mobbin.com/screens/11175449-e310-41d3-9d6d-287efcd62f8f |

### Filtering notes — `filtering-notes/` — https://mobbin.com/flows/7403bfe8-5722-41d9-afe7-c781f84c63f1

Actions: Filtering & Sorting. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-01-48b4758a-940d-4a23-a81c-cf3d816c5210.webp` | https://mobbin.com/screens/48b4758a-940d-4a23-a81c-cf3d816c5210 |
| 2 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-02-7ae8d569-c710-4e6b-af7c-b27d3888e07b.webp` | https://mobbin.com/screens/7ae8d569-c710-4e6b-af7c-b27d3888e07b |
| 3 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-03-330290fb-0a15-4e93-a3dc-4d3f956c6799.webp` | https://mobbin.com/screens/330290fb-0a15-4e93-a3dc-4d3f956c6799 |
| 4 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-04-fed9cd2e-ab53-4ebd-a885-b57f8e132f91.webp` | https://mobbin.com/screens/fed9cd2e-ab53-4ebd-a885-b57f8e132f91 |
| 5 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-05-c7b41921-1fc1-4991-b9d2-2f3e832d421f.webp` | https://mobbin.com/screens/c7b41921-1fc1-4991-b9d2-2f3e832d421f |
| 6 | `ios/flows/filtering-notes/evernote-ios-flow-filtering-notes-7403bfe8-06-ac298483-58b6-4b07-ad5b-1d70bab34b25.webp` | https://mobbin.com/screens/ac298483-58b6-4b07-ad5b-1d70bab34b25 |

### Filtering tasks — `filtering-tasks/` — https://mobbin.com/flows/5a3a01cb-a4c8-4e8a-9838-d1f71c5b4dee

Actions: Filtering & Sorting. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/filtering-tasks/evernote-ios-flow-filtering-tasks-5a3a01cb-01-a54bf80a-47b8-43f9-85db-d41c87c3bd27.webp` | https://mobbin.com/screens/a54bf80a-47b8-43f9-85db-d41c87c3bd27 |
| 2 | `ios/flows/filtering-tasks/evernote-ios-flow-filtering-tasks-5a3a01cb-02-2c5502d3-09c8-49ef-9f0e-8f6f0a03c4a1.webp` | https://mobbin.com/screens/2c5502d3-09c8-49ef-9f0e-8f6f0a03c4a1 |
| 3 | `ios/flows/filtering-tasks/evernote-ios-flow-filtering-tasks-5a3a01cb-03-f42ae667-5f22-4eae-a65f-503038300717.webp` | https://mobbin.com/screens/f42ae667-5f22-4eae-a65f-503038300717 |
| 4 | `ios/flows/filtering-tasks/evernote-ios-flow-filtering-tasks-5a3a01cb-04-9e69806d-ade3-4c2c-a5f5-5b5d4b6abd3c.webp` | https://mobbin.com/screens/9e69806d-ade3-4c2c-a5f5-5b5d4b6abd3c |

### Finding and replacing — `finding-and-replacing/` — https://mobbin.com/flows/eaadd1a4-69f5-4910-8fbd-e2b2c0431ba0

Actions: Editing & Updating, Searching & Finding. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-02-501c429e-ef62-46da-ae8a-1c9dd58a245e.webp` | https://mobbin.com/screens/501c429e-ef62-46da-ae8a-1c9dd58a245e |
| 3 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-03-8d9e29d4-e76e-456d-b29c-876a6da335a9.webp` | https://mobbin.com/screens/8d9e29d4-e76e-456d-b29c-876a6da335a9 |
| 4 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-04-4b4d26ce-0a91-4a64-b9a3-97eb70fe7c72.webp` | https://mobbin.com/screens/4b4d26ce-0a91-4a64-b9a3-97eb70fe7c72 |
| 5 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-05-8fe03e7d-011e-4258-a9e9-7a3c1dac7435.webp` | https://mobbin.com/screens/8fe03e7d-011e-4258-a9e9-7a3c1dac7435 |
| 6 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-06-dda9848d-add7-4d59-97a7-0e5f8fa3ec37.webp` | https://mobbin.com/screens/dda9848d-add7-4d59-97a7-0e5f8fa3ec37 |
| 7 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-07-b0d7f73a-7e63-4cea-811c-bd1198c6aeb0.webp` | https://mobbin.com/screens/b0d7f73a-7e63-4cea-811c-bd1198c6aeb0 |
| 8 | `ios/flows/finding-and-replacing/evernote-ios-flow-finding-and-replacing-eaadd1a4-08-658c9d3e-f121-459b-a0f5-ad98d5cf632e.webp` | https://mobbin.com/screens/658c9d3e-f121-459b-a0f5-ad98d5cf632e |

### Flagging a task — `flagging-a-task/` — https://mobbin.com/flows/93c3578a-9e62-4026-9202-23f37f389bf5

Actions: Marking. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/flagging-a-task/evernote-ios-flow-flagging-a-task-93c3578a-01-e5589e84-0f9b-40de-9974-f0e08903ff84.webp` | https://mobbin.com/screens/e5589e84-0f9b-40de-9974-f0e08903ff84 |
| 2 | `ios/flows/flagging-a-task/evernote-ios-flow-flagging-a-task-93c3578a-02-5dcb1714-008f-4c3f-a65f-1a66fafc49d3.webp` | https://mobbin.com/screens/5dcb1714-008f-4c3f-a65f-1a66fafc49d3 |

### Formatting text — `formatting-text/` — https://mobbin.com/flows/04db1e24-878c-4959-b09a-feb7511520f6

Actions: Editing & Updating, Selecting & Choosing. Screens: 12.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-02-4bb95f90-9fcb-441d-b279-4824a3f96fbc.webp` | https://mobbin.com/screens/4bb95f90-9fcb-441d-b279-4824a3f96fbc |
| 3 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-03-fd5152cb-acf9-42d0-803a-cc5843c780a9.webp` | https://mobbin.com/screens/fd5152cb-acf9-42d0-803a-cc5843c780a9 |
| 4 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-04-3e90c6f9-e04a-4b73-98fb-9c6fd1b6952e.webp` | https://mobbin.com/screens/3e90c6f9-e04a-4b73-98fb-9c6fd1b6952e |
| 5 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-05-e7f89f47-fb2b-448d-928a-b15f0c5b68e8.webp` | https://mobbin.com/screens/e7f89f47-fb2b-448d-928a-b15f0c5b68e8 |
| 6 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-06-3789ebbb-0d15-43a6-adc8-8099ac6f433b.webp` | https://mobbin.com/screens/3789ebbb-0d15-43a6-adc8-8099ac6f433b |
| 7 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-07-54dda554-3ad0-4b94-b9ff-a43882e1735a.webp` | https://mobbin.com/screens/54dda554-3ad0-4b94-b9ff-a43882e1735a |
| 8 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-08-f9223dc0-c3c3-4a77-bd2f-32e441d6f451.webp` | https://mobbin.com/screens/f9223dc0-c3c3-4a77-bd2f-32e441d6f451 |
| 9 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-09-8d87d52b-a8e4-4648-bc8b-2a739da85c4e.webp` | https://mobbin.com/screens/8d87d52b-a8e4-4648-bc8b-2a739da85c4e |
| 10 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-10-26d94976-7bec-4c7e-9a0e-e71f6a208262.webp` | https://mobbin.com/screens/26d94976-7bec-4c7e-9a0e-e71f6a208262 |
| 11 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-11-c3d81eb0-831f-43c6-83f6-02851aba34f5.webp` | https://mobbin.com/screens/c3d81eb0-831f-43c6-83f6-02851aba34f5 |
| 12 | `ios/flows/formatting-text/evernote-ios-flow-formatting-text-04db1e24-12-3986c865-c53c-435e-879c-23d69809a473.webp` | https://mobbin.com/screens/3986c865-c53c-435e-879c-23d69809a473 |

### Image settings — `image-settings/` — https://mobbin.com/flows/66cebda8-ffd8-417e-b27e-90a30abf58d5

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/image-settings/evernote-ios-flow-image-settings-66cebda8-01-63247041-2f84-4aa3-a69e-4d812c925e46.webp` | https://mobbin.com/screens/63247041-2f84-4aa3-a69e-4d812c925e46 |
| 2 | `ios/flows/image-settings/evernote-ios-flow-image-settings-66cebda8-02-362f5843-3f21-4001-b143-cd0ae3132e4b.webp` | https://mobbin.com/screens/362f5843-3f21-4001-b143-cd0ae3132e4b |
| 3 | `ios/flows/image-settings/evernote-ios-flow-image-settings-66cebda8-03-852e0bd2-2cde-415b-a463-c7dc72a58284.webp` | https://mobbin.com/screens/852e0bd2-2cde-415b-a463-c7dc72a58284 |

### Insert — `insert/` — https://mobbin.com/flows/81edbf66-d854-44fe-bfb8-ae624fe0574e

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/insert/evernote-ios-flow-insert-81edbf66-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/insert/evernote-ios-flow-insert-81edbf66-02-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 3 | `ios/flows/insert/evernote-ios-flow-insert-81edbf66-03-1865a798-8af7-4517-8d5f-a79c710236af.webp` | https://mobbin.com/screens/1865a798-8af7-4517-8d5f-a79c710236af |

### Linking a note — `linking-a-note/` — https://mobbin.com/flows/7b003c56-58c0-4090-a8e7-fdf5f35b6458

Actions: Adding & Creating, Selecting & Choosing. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-01-278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa.webp` | https://mobbin.com/screens/278e6c70-9f1d-4a66-ad9f-b0d5556ad6fa |
| 2 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-02-c0761472-8e35-4893-8719-e130297c629f.webp` | https://mobbin.com/screens/c0761472-8e35-4893-8719-e130297c629f |
| 3 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-03-10687fb2-6704-4c9f-a648-710a26a72e6a.webp` | https://mobbin.com/screens/10687fb2-6704-4c9f-a648-710a26a72e6a |
| 4 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-04-d8994b46-e021-465b-a58c-81bb8200a5b1.webp` | https://mobbin.com/screens/d8994b46-e021-465b-a58c-81bb8200a5b1 |
| 5 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-05-b67cbcdc-c1d6-48ff-bb08-415425effa66.webp` | https://mobbin.com/screens/b67cbcdc-c1d6-48ff-bb08-415425effa66 |
| 6 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-06-3a3cfec7-c356-4242-b91f-b6c5a91de4da.webp` | https://mobbin.com/screens/3a3cfec7-c356-4242-b91f-b6c5a91de4da |
| 7 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-07-93e55db3-9a86-4bb4-811d-b3c5e9e16622.webp` | https://mobbin.com/screens/93e55db3-9a86-4bb4-811d-b3c5e9e16622 |
| 8 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-08-1a6858dc-e54b-493c-b981-988885fc5579.webp` | https://mobbin.com/screens/1a6858dc-e54b-493c-b981-988885fc5579 |
| 9 | `ios/flows/linking-a-note/evernote-ios-flow-linking-a-note-7b003c56-09-43ab21bb-902f-45a0-a221-2e0a8203da6c.webp` | https://mobbin.com/screens/43ab21bb-902f-45a0-a221-2e0a8203da6c |

### Logging in — `logging-in/` — https://mobbin.com/flows/5dd7c87c-1bf0-4e2a-8a5b-8a23c0587c29

Actions: Logging In. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/logging-in/evernote-ios-flow-logging-in-5dd7c87c-01-b6d49953-8917-417d-8b36-102327502292.webp` | https://mobbin.com/screens/b6d49953-8917-417d-8b36-102327502292 |
| 2 | `ios/flows/logging-in/evernote-ios-flow-logging-in-5dd7c87c-02-c73a9d86-a0b3-46dd-8f9e-df72580cafa0.webp` | https://mobbin.com/screens/c73a9d86-a0b3-46dd-8f9e-df72580cafa0 |
| 3 | `ios/flows/logging-in/evernote-ios-flow-logging-in-5dd7c87c-03-12860335-61b3-46b6-9dca-be06c332597f.webp` | https://mobbin.com/screens/12860335-61b3-46b6-9dca-be06c332597f |
| 4 | `ios/flows/logging-in/evernote-ios-flow-logging-in-5dd7c87c-04-1fed7c7d-bccf-425d-8634-74ec41df334a.webp` | https://mobbin.com/screens/1fed7c7d-bccf-425d-8634-74ec41df334a |
| 5 | `ios/flows/logging-in/evernote-ios-flow-logging-in-5dd7c87c-05-e1b81139-13cf-465a-8dee-cc29ce6a33c1.webp` | https://mobbin.com/screens/e1b81139-13cf-465a-8dee-cc29ce6a33c1 |

### Logging out — `logging-out/` — https://mobbin.com/flows/8e2089b7-d0ed-4945-b7ef-5477b0e521a9

Actions: Logging Out. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/logging-out/evernote-ios-flow-logging-out-8e2089b7-01-2c514b18-4086-456f-a015-1bb16a84b5a3.webp` | https://mobbin.com/screens/2c514b18-4086-456f-a015-1bb16a84b5a3 |
| 2 | `ios/flows/logging-out/evernote-ios-flow-logging-out-8e2089b7-02-58521d42-3987-42b8-a9fc-3d019875dc07.webp` | https://mobbin.com/screens/58521d42-3987-42b8-a9fc-3d019875dc07 |
| 3 | `ios/flows/logging-out/evernote-ios-flow-logging-out-8e2089b7-03-b6d49953-8917-417d-8b36-102327502292.webp` | https://mobbin.com/screens/b6d49953-8917-417d-8b36-102327502292 |

### Moving a note — `moving-a-note/` — https://mobbin.com/flows/c4414fcf-4d47-49de-a195-79419467715b

Actions: Moving. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/moving-a-note/evernote-ios-flow-moving-a-note-c4414fcf-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/moving-a-note/evernote-ios-flow-moving-a-note-c4414fcf-02-1c4ce082-3787-4103-8595-cd075b96dada.webp` | https://mobbin.com/screens/1c4ce082-3787-4103-8595-cd075b96dada |
| 3 | `ios/flows/moving-a-note/evernote-ios-flow-moving-a-note-c4414fcf-03-c5837dc4-a003-43ef-8b45-07a807ea65e8.webp` | https://mobbin.com/screens/c5837dc4-a003-43ef-8b45-07a807ea65e8 |
| 4 | `ios/flows/moving-a-note/evernote-ios-flow-moving-a-note-c4414fcf-04-cc29f2ff-8636-4725-aa7f-d1f4e5cc5069.webp` | https://mobbin.com/screens/cc29f2ff-8636-4725-aa7f-d1f4e5cc5069 |

### Moving to a stack — `moving-to-a-stack/` — https://mobbin.com/flows/e4f55596-97b8-4250-ba73-4a094cfcaa1a

Actions: Adding & Creating, Moving. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/moving-to-a-stack/evernote-ios-flow-moving-to-a-stack-e4f55596-01-85c1b0c0-2bb2-420a-ac53-3ce244aed5df.webp` | https://mobbin.com/screens/85c1b0c0-2bb2-420a-ac53-3ce244aed5df |
| 2 | `ios/flows/moving-to-a-stack/evernote-ios-flow-moving-to-a-stack-e4f55596-02-64240064-ff5b-4790-9e54-1a7cc47649c9.webp` | https://mobbin.com/screens/64240064-ff5b-4790-9e54-1a7cc47649c9 |
| 3 | `ios/flows/moving-to-a-stack/evernote-ios-flow-moving-to-a-stack-e4f55596-03-b297214d-94aa-4aee-8c9d-37126014e53f.webp` | https://mobbin.com/screens/b297214d-94aa-4aee-8c9d-37126014e53f |
| 4 | `ios/flows/moving-to-a-stack/evernote-ios-flow-moving-to-a-stack-e4f55596-04-93f55fd1-bc95-477b-ad0f-5e9225dda772.webp` | https://mobbin.com/screens/93f55fd1-bc95-477b-ad0f-5e9225dda772 |
| 5 | `ios/flows/moving-to-a-stack/evernote-ios-flow-moving-to-a-stack-e4f55596-05-c86ee412-fdd3-41bd-ad61-180074e033d4.webp` | https://mobbin.com/screens/c86ee412-fdd3-41bd-ad61-180074e033d4 |

### My widgets — `my-widgets/` — https://mobbin.com/flows/303f6a92-a2dc-47b8-9186-dccb92ed2ae5

Actions: none listed. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-01-af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb.webp` | https://mobbin.com/screens/af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb |
| 2 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-02-d9c0cb9a-9f61-4019-b398-2d7243d68120.webp` | https://mobbin.com/screens/d9c0cb9a-9f61-4019-b398-2d7243d68120 |
| 3 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-03-9c8369e6-ce3d-4a90-90ba-51bf723558bc.webp` | https://mobbin.com/screens/9c8369e6-ce3d-4a90-90ba-51bf723558bc |
| 4 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-04-3bd7637d-e7b1-46c1-822a-87012d777455.webp` | https://mobbin.com/screens/3bd7637d-e7b1-46c1-822a-87012d777455 |
| 5 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-05-8c0cc28d-5c37-40f6-adda-e1bbb49220a7.webp` | https://mobbin.com/screens/8c0cc28d-5c37-40f6-adda-e1bbb49220a7 |
| 6 | `ios/flows/my-widgets/evernote-ios-flow-my-widgets-303f6a92-06-d1194e87-51fa-44e5-99f7-cd6b9b0c6f60.webp` | https://mobbin.com/screens/d1194e87-51fa-44e5-99f7-cd6b9b0c6f60 |

### Note info — `note-info/` — https://mobbin.com/flows/c6c6269d-00a5-46f9-ad9b-6762341c5ec8

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/note-info/evernote-ios-flow-note-info-c6c6269d-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/note-info/evernote-ios-flow-note-info-c6c6269d-02-dd18560d-26f7-4578-875c-1e4b955a37c0.webp` | https://mobbin.com/screens/dd18560d-26f7-4578-875c-1e4b955a37c0 |

### Note options — `note-options/` — https://mobbin.com/flows/0055a31b-c0f8-4bf9-9982-282e3dd53c16

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/note-options/evernote-ios-flow-note-options-0055a31b-01-63247041-2f84-4aa3-a69e-4d812c925e46.webp` | https://mobbin.com/screens/63247041-2f84-4aa3-a69e-4d812c925e46 |
| 2 | `ios/flows/note-options/evernote-ios-flow-note-options-0055a31b-02-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 3 | `ios/flows/note-options/evernote-ios-flow-note-options-0055a31b-03-835959fe-d399-4cf8-b6df-423e900e6bb5.webp` | https://mobbin.com/screens/835959fe-d399-4cf8-b6df-423e900e6bb5 |

### Notebook options — `notebook-options/` — https://mobbin.com/flows/2f1492af-9a4d-429c-a334-8847f5b158ab

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/notebook-options/evernote-ios-flow-notebook-options-2f1492af-01-a3b00a9b-8a86-4417-97b1-cc38dae31288.webp` | https://mobbin.com/screens/a3b00a9b-8a86-4417-97b1-cc38dae31288 |
| 2 | `ios/flows/notebook-options/evernote-ios-flow-notebook-options-2f1492af-02-85c1b0c0-2bb2-420a-ac53-3ce244aed5df.webp` | https://mobbin.com/screens/85c1b0c0-2bb2-420a-ac53-3ce244aed5df |

### Notebooks — `notebooks/` — https://mobbin.com/flows/8c7c8dca-e943-498d-80fb-c4c1fc358360

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/notebooks/evernote-ios-flow-notebooks-8c7c8dca-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/notebooks/evernote-ios-flow-notebooks-8c7c8dca-02-40dadd42-c502-4859-b4e1-a0b34e7d63cb.webp` | https://mobbin.com/screens/40dadd42-c502-4859-b4e1-a0b34e7d63cb |

### Notes — `notes/` — https://mobbin.com/flows/6eec5855-8c35-4ad0-a535-33e9827eb4c1

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/notes/evernote-ios-flow-notes-6eec5855-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/notes/evernote-ios-flow-notes-6eec5855-02-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |

### Notes settings — `notes-settings/` — https://mobbin.com/flows/6e25dfda-4dc0-4551-a2e7-582f7b76a74b

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/notes-settings/evernote-ios-flow-notes-settings-6e25dfda-01-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |
| 2 | `ios/flows/notes-settings/evernote-ios-flow-notes-settings-6e25dfda-02-8db95913-c9fa-4896-a29f-dd9f1217c419.webp` | https://mobbin.com/screens/8db95913-c9fa-4896-a29f-dd9f1217c419 |

### Notifications — `notifications/` — https://mobbin.com/flows/1aafd921-fb12-422c-b184-a178a3df81ec

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/notifications/evernote-ios-flow-notifications-1aafd921-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/notifications/evernote-ios-flow-notifications-1aafd921-02-a4fbc5e4-89dd-45cf-b4bc-0c744e39112a.webp` | https://mobbin.com/screens/a4fbc5e4-89dd-45cf-b4bc-0c744e39112a |

### Onboarding — `onboarding/` — https://mobbin.com/flows/4f4d734f-364e-4506-917e-6a5a17fbadff

Actions: Selecting & Choosing, Subscribing & Upgrading. Screens: 13.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-01-3eea73dc-bccf-4867-a2c3-992748b66c2b.webp` | https://mobbin.com/screens/3eea73dc-bccf-4867-a2c3-992748b66c2b |
| 2 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-02-4bc387d8-3826-45d6-b40e-78dcb9c479c6.webp` | https://mobbin.com/screens/4bc387d8-3826-45d6-b40e-78dcb9c479c6 |
| 3 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-03-35ea4e60-9621-4fda-b4b3-f61edad856cb.webp` | https://mobbin.com/screens/35ea4e60-9621-4fda-b4b3-f61edad856cb |
| 4 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-04-b8ff1e98-3914-4571-9653-277f435b629c.webp` | https://mobbin.com/screens/b8ff1e98-3914-4571-9653-277f435b629c |
| 5 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-05-41275ae2-0516-42c9-b957-90e6cafc67fa.webp` | https://mobbin.com/screens/41275ae2-0516-42c9-b957-90e6cafc67fa |
| 6 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-06-8550a4bc-dd1b-4491-b55a-ee5b94620469.webp` | https://mobbin.com/screens/8550a4bc-dd1b-4491-b55a-ee5b94620469 |
| 7 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-07-19a20326-23a4-4ec5-b56c-e75d95358a64.webp` | https://mobbin.com/screens/19a20326-23a4-4ec5-b56c-e75d95358a64 |
| 8 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-08-1a5fee34-ece2-41f5-a525-ead7ef4bb944.webp` | https://mobbin.com/screens/1a5fee34-ece2-41f5-a525-ead7ef4bb944 |
| 9 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-09-d56cdfa0-4f81-41a9-a119-0b8574937906.webp` | https://mobbin.com/screens/d56cdfa0-4f81-41a9-a119-0b8574937906 |
| 10 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-10-72e1f29e-cb61-4901-9004-b07bb241f48f.webp` | https://mobbin.com/screens/72e1f29e-cb61-4901-9004-b07bb241f48f |
| 11 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-11-c1eddbee-f5e6-4314-ae91-803612006d43.webp` | https://mobbin.com/screens/c1eddbee-f5e6-4314-ae91-803612006d43 |
| 12 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-12-db780c35-cbf6-4860-b539-2c65ae233fa5.webp` | https://mobbin.com/screens/db780c35-cbf6-4860-b539-2c65ae233fa5 |
| 13 | `ios/flows/onboarding/evernote-ios-flow-onboarding-4f4d734f-13-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |

### People with access — `people-with-access/` — https://mobbin.com/flows/eb26e3e5-a710-4a1f-a8f0-b99160fd951c

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/people-with-access/evernote-ios-flow-people-with-access-eb26e3e5-01-ada7c9bb-6730-4dc8-b060-d78711dacd4b.webp` | https://mobbin.com/screens/ada7c9bb-6730-4dc8-b060-d78711dacd4b |
| 2 | `ios/flows/people-with-access/evernote-ios-flow-people-with-access-eb26e3e5-02-f7b98483-b17f-4a70-8b7f-d24e18a5dc96.webp` | https://mobbin.com/screens/f7b98483-b17f-4a70-8b7f-d24e18a5dc96 |

### Pinning to Notebook — `pinning-to-notebook/` — https://mobbin.com/flows/9aba5eb2-74e1-410b-ab93-6023ea2347f8

Actions: Favoriting & Pinning. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/pinning-to-notebook/evernote-ios-flow-pinning-to-notebook-9aba5eb2-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/pinning-to-notebook/evernote-ios-flow-pinning-to-notebook-9aba5eb2-02-ebc4ba11-d7ce-4c6f-acea-5aaae0536ba6.webp` | https://mobbin.com/screens/ebc4ba11-d7ce-4c6f-acea-5aaae0536ba6 |

### Profile — `profile/` — https://mobbin.com/flows/a32fda53-2846-430a-a986-f4e883871a4d

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/profile/evernote-ios-flow-profile-a32fda53-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/profile/evernote-ios-flow-profile-a32fda53-02-af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb.webp` | https://mobbin.com/screens/af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb |

### Recording an audio — `recording-an-audio/` — https://mobbin.com/flows/c2178386-7230-43e2-8f63-eb95f459355b

Actions: Recording Audio & Video. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/recording-an-audio/evernote-ios-flow-recording-an-audio-c2178386-01-1865a798-8af7-4517-8d5f-a79c710236af.webp` | https://mobbin.com/screens/1865a798-8af7-4517-8d5f-a79c710236af |
| 2 | `ios/flows/recording-an-audio/evernote-ios-flow-recording-an-audio-c2178386-02-3ea49725-0f9a-4005-81bd-523ad8e47f21.webp` | https://mobbin.com/screens/3ea49725-0f9a-4005-81bd-523ad8e47f21 |
| 3 | `ios/flows/recording-an-audio/evernote-ios-flow-recording-an-audio-c2178386-03-0eddd04a-e96d-4c4e-89ac-b311dd621919.webp` | https://mobbin.com/screens/0eddd04a-e96d-4c4e-89ac-b311dd621919 |

### Removing a shortcut — `removing-a-shortcut/` — https://mobbin.com/flows/e7654846-5e75-4503-8e3b-e84ecb6cbca2

Actions: Deleting & Removing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/removing-a-shortcut/evernote-ios-flow-removing-a-shortcut-e7654846-01-efe4453d-c71c-4547-a9a9-4a46b2dedc0b.webp` | https://mobbin.com/screens/efe4453d-c71c-4547-a9a9-4a46b2dedc0b |
| 2 | `ios/flows/removing-a-shortcut/evernote-ios-flow-removing-a-shortcut-e7654846-02-f33ed2cf-fe6b-43d0-abff-db0796ab4858.webp` | https://mobbin.com/screens/f33ed2cf-fe6b-43d0-abff-db0796ab4858 |
| 3 | `ios/flows/removing-a-shortcut/evernote-ios-flow-removing-a-shortcut-e7654846-03-b428b7f5-2d7c-4740-938f-6d0ea110adbc.webp` | https://mobbin.com/screens/b428b7f5-2d7c-4740-938f-6d0ea110adbc |

### Renaming a notebook — `renaming-a-notebook/` — https://mobbin.com/flows/5472e941-b212-4d62-abb9-2c2a0a66963a

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/renaming-a-notebook/evernote-ios-flow-renaming-a-notebook-5472e941-01-85c1b0c0-2bb2-420a-ac53-3ce244aed5df.webp` | https://mobbin.com/screens/85c1b0c0-2bb2-420a-ac53-3ce244aed5df |
| 2 | `ios/flows/renaming-a-notebook/evernote-ios-flow-renaming-a-notebook-5472e941-02-34520a5f-7705-44b6-9897-73de57085f59.webp` | https://mobbin.com/screens/34520a5f-7705-44b6-9897-73de57085f59 |
| 3 | `ios/flows/renaming-a-notebook/evernote-ios-flow-renaming-a-notebook-5472e941-03-515967c7-1344-46f3-b56b-dac0bf5d247a.webp` | https://mobbin.com/screens/515967c7-1344-46f3-b56b-dac0bf5d247a |
| 4 | `ios/flows/renaming-a-notebook/evernote-ios-flow-renaming-a-notebook-5472e941-04-6ce7f762-95ba-487f-b617-5d180e1f3af8.webp` | https://mobbin.com/screens/6ce7f762-95ba-487f-b617-5d180e1f3af8 |

### Reordering shortcuts — `reordering-shortcuts/` — https://mobbin.com/flows/561ff63b-5811-4f9f-8d82-748962c03c84

Actions: Reordering. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/reordering-shortcuts/evernote-ios-flow-reordering-shortcuts-561ff63b-01-efe4453d-c71c-4547-a9a9-4a46b2dedc0b.webp` | https://mobbin.com/screens/efe4453d-c71c-4547-a9a9-4a46b2dedc0b |
| 2 | `ios/flows/reordering-shortcuts/evernote-ios-flow-reordering-shortcuts-561ff63b-02-7bc22020-217c-4ef1-8205-6147767cbb63.webp` | https://mobbin.com/screens/7bc22020-217c-4ef1-8205-6147767cbb63 |
| 3 | `ios/flows/reordering-shortcuts/evernote-ios-flow-reordering-shortcuts-561ff63b-03-af2601a0-b1b3-4e3e-b45f-aa18e0713a05.webp` | https://mobbin.com/screens/af2601a0-b1b3-4e3e-b45f-aa18e0713a05 |

### Saving a search — `saving-a-search/` — https://mobbin.com/flows/beec2def-2e60-434b-ba2c-423f27f91545

Actions: Saving to Collection, Turning On/Off. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/saving-a-search/evernote-ios-flow-saving-a-search-beec2def-01-48b4758a-940d-4a23-a81c-cf3d816c5210.webp` | https://mobbin.com/screens/48b4758a-940d-4a23-a81c-cf3d816c5210 |
| 2 | `ios/flows/saving-a-search/evernote-ios-flow-saving-a-search-beec2def-02-453aa9eb-7f94-465f-9b52-439d90b50697.webp` | https://mobbin.com/screens/453aa9eb-7f94-465f-9b52-439d90b50697 |
| 3 | `ios/flows/saving-a-search/evernote-ios-flow-saving-a-search-beec2def-03-2a69e3b7-5509-4cb3-9618-86ecedbc9052.webp` | https://mobbin.com/screens/2a69e3b7-5509-4cb3-9618-86ecedbc9052 |
| 4 | `ios/flows/saving-a-search/evernote-ios-flow-saving-a-search-beec2def-04-03c2a6a4-2d8c-4b96-8970-8e2a4db283bf.webp` | https://mobbin.com/screens/03c2a6a4-2d8c-4b96-8970-8e2a4db283bf |
| 5 | `ios/flows/saving-a-search/evernote-ios-flow-saving-a-search-beec2def-05-2952cb28-ffd2-4c40-abcf-9342b1d7e7d0.webp` | https://mobbin.com/screens/2952cb28-ffd2-4c40-abcf-9342b1d7e7d0 |

### Saving as template — `saving-as-template/` — https://mobbin.com/flows/e01d6fd7-dd78-4a88-8a8b-85e5a11f9034

Actions: Saving to Collection. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/saving-as-template/evernote-ios-flow-saving-as-template-e01d6fd7-01-835959fe-d399-4cf8-b6df-423e900e6bb5.webp` | https://mobbin.com/screens/835959fe-d399-4cf8-b6df-423e900e6bb5 |
| 2 | `ios/flows/saving-as-template/evernote-ios-flow-saving-as-template-e01d6fd7-02-5ccbb3ca-9cf8-400a-b659-c6b642121463.webp` | https://mobbin.com/screens/5ccbb3ca-9cf8-400a-b659-c6b642121463 |
| 3 | `ios/flows/saving-as-template/evernote-ios-flow-saving-as-template-e01d6fd7-03-18146af0-6457-42d2-8c70-3028895839ab.webp` | https://mobbin.com/screens/18146af0-6457-42d2-8c70-3028895839ab |
| 4 | `ios/flows/saving-as-template/evernote-ios-flow-saving-as-template-e01d6fd7-04-79303337-f0f2-4200-9cec-dd9e683b5032.webp` | https://mobbin.com/screens/79303337-f0f2-4200-9cec-dd9e683b5032 |

### Scratch pad settings — `scratch-pad-settings/` — https://mobbin.com/flows/f973d957-19fb-4def-81c7-8623019b9692

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/scratch-pad-settings/evernote-ios-flow-scratch-pad-settings-f973d957-01-1e53c2ee-91c0-499c-929e-e433b0ff6c38.webp` | https://mobbin.com/screens/1e53c2ee-91c0-499c-929e-e433b0ff6c38 |
| 2 | `ios/flows/scratch-pad-settings/evernote-ios-flow-scratch-pad-settings-f973d957-02-44a9ceb2-ca06-4457-a0e0-2de73288c96e.webp` | https://mobbin.com/screens/44a9ceb2-ca06-4457-a0e0-2de73288c96e |

### Search — `search/` — https://mobbin.com/flows/4991d804-d90f-45cc-8a9c-3f8ed8a6d8b2

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/search/evernote-ios-flow-search-4991d804-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/search/evernote-ios-flow-search-4991d804-02-f7e0d944-36ca-419b-b0e8-8657d69bf54b.webp` | https://mobbin.com/screens/f7e0d944-36ca-419b-b0e8-8657d69bf54b |
| 3 | `ios/flows/search/evernote-ios-flow-search-4991d804-03-bdc7e0b5-08fc-4b75-aec3-1fe81026de9d.webp` | https://mobbin.com/screens/bdc7e0b5-08fc-4b75-aec3-1fe81026de9d |

### Search options — `search-options/` — https://mobbin.com/flows/baf32c4e-2dc0-4d79-9256-5b34ac497085

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/search-options/evernote-ios-flow-search-options-baf32c4e-01-870126a2-d2c7-4ab6-b665-27675ca440f1.webp` | https://mobbin.com/screens/870126a2-d2c7-4ab6-b665-27675ca440f1 |
| 2 | `ios/flows/search-options/evernote-ios-flow-search-options-baf32c4e-02-48b4758a-940d-4a23-a81c-cf3d816c5210.webp` | https://mobbin.com/screens/48b4758a-940d-4a23-a81c-cf3d816c5210 |

### Searching a notebook — `searching-a-notebook/` — https://mobbin.com/flows/6a1eeec5-3a29-4635-bc00-3e9a48522cc6

Actions: Searching & Finding. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/searching-a-notebook/evernote-ios-flow-searching-a-notebook-6a1eeec5-01-40dadd42-c502-4859-b4e1-a0b34e7d63cb.webp` | https://mobbin.com/screens/40dadd42-c502-4859-b4e1-a0b34e7d63cb |
| 2 | `ios/flows/searching-a-notebook/evernote-ios-flow-searching-a-notebook-6a1eeec5-02-eac73d4d-64b1-455d-9132-58185c9652dc.webp` | https://mobbin.com/screens/eac73d4d-64b1-455d-9132-58185c9652dc |
| 3 | `ios/flows/searching-a-notebook/evernote-ios-flow-searching-a-notebook-6a1eeec5-03-14eb1386-8e40-4748-90a1-aa9eee377296.webp` | https://mobbin.com/screens/14eb1386-8e40-4748-90a1-aa9eee377296 |
| 4 | `ios/flows/searching-a-notebook/evernote-ios-flow-searching-a-notebook-6a1eeec5-04-5105c92c-557a-4bbf-85f3-9414cef2f533.webp` | https://mobbin.com/screens/5105c92c-557a-4bbf-85f3-9414cef2f533 |

### Searching Evernote (AI-Powered) — `searching-evernote-ai-powered/` — https://mobbin.com/flows/5fbf958e-fa5a-4342-b136-0a4e23140491

Actions: Searching & Finding. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-01-bdc7e0b5-08fc-4b75-aec3-1fe81026de9d.webp` | https://mobbin.com/screens/bdc7e0b5-08fc-4b75-aec3-1fe81026de9d |
| 2 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-02-811bc51b-9da7-4e9f-8546-a3683f5bc592.webp` | https://mobbin.com/screens/811bc51b-9da7-4e9f-8546-a3683f5bc592 |
| 3 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-03-7c0b9b97-ea29-4cfe-92f6-594880f64075.webp` | https://mobbin.com/screens/7c0b9b97-ea29-4cfe-92f6-594880f64075 |
| 4 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-04-985323ca-d9af-4593-83ad-ef1cd24fc5a8.webp` | https://mobbin.com/screens/985323ca-d9af-4593-83ad-ef1cd24fc5a8 |
| 5 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-05-2ebcd1ec-4ba7-480a-8933-7ac90ca983ff.webp` | https://mobbin.com/screens/2ebcd1ec-4ba7-480a-8933-7ac90ca983ff |
| 6 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-06-346a01c5-9b3e-4c7f-8e24-329290140dc9.webp` | https://mobbin.com/screens/346a01c5-9b3e-4c7f-8e24-329290140dc9 |
| 7 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-07-a0a19abf-d09a-49fa-b74b-5d715f42cf68.webp` | https://mobbin.com/screens/a0a19abf-d09a-49fa-b74b-5d715f42cf68 |
| 8 | `ios/flows/searching-evernote-ai-powered/evernote-ios-flow-searching-evernote-ai-powered-5fbf958e-08-4d1beb3e-8944-4ad5-9c62-bfdc2c3d3663.webp` | https://mobbin.com/screens/4d1beb3e-8944-4ad5-9c62-bfdc2c3d3663 |

### Searching Evernote (standard) — `searching-evernote-standard/` — https://mobbin.com/flows/383030fe-716e-418c-a2da-03976be2c783

Actions: Searching & Finding. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/searching-evernote-standard/evernote-ios-flow-searching-evernote-standard-383030fe-01-bdc7e0b5-08fc-4b75-aec3-1fe81026de9d.webp` | https://mobbin.com/screens/bdc7e0b5-08fc-4b75-aec3-1fe81026de9d |
| 2 | `ios/flows/searching-evernote-standard/evernote-ios-flow-searching-evernote-standard-383030fe-02-c66ad0a5-1247-4137-80ea-61699cd688b4.webp` | https://mobbin.com/screens/c66ad0a5-1247-4137-80ea-61699cd688b4 |
| 3 | `ios/flows/searching-evernote-standard/evernote-ios-flow-searching-evernote-standard-383030fe-03-870126a2-d2c7-4ab6-b665-27675ca440f1.webp` | https://mobbin.com/screens/870126a2-d2c7-4ab6-b665-27675ca440f1 |

### Settings — `settings/` — https://mobbin.com/flows/7284c74b-9661-46f9-9872-eb75a3137fc5

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/settings/evernote-ios-flow-settings-7284c74b-01-af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb.webp` | https://mobbin.com/screens/af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb |
| 2 | `ios/flows/settings/evernote-ios-flow-settings-7284c74b-02-f74264ac-0593-4010-a615-a072d51d445e.webp` | https://mobbin.com/screens/f74264ac-0593-4010-a615-a072d51d445e |

### Shared with me — `shared-with-me/` — https://mobbin.com/flows/31b393c7-d301-4efb-bbfc-0ebe3fea5668

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/shared-with-me/evernote-ios-flow-shared-with-me-31b393c7-01-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |
| 2 | `ios/flows/shared-with-me/evernote-ios-flow-shared-with-me-31b393c7-02-b896b7b3-ca3a-410b-b0b9-af8951378d54.webp` | https://mobbin.com/screens/b896b7b3-ca3a-410b-b0b9-af8951378d54 |
| 3 | `ios/flows/shared-with-me/evernote-ios-flow-shared-with-me-31b393c7-03-7b751db5-76a1-46f1-be40-c8817a1382ec.webp` | https://mobbin.com/screens/7b751db5-76a1-46f1-be40-c8817a1382ec |

### Sharing a note — `sharing-a-note/` — https://mobbin.com/flows/28096ea2-1305-4319-bdfa-085bf2a85b8b

Actions: Inviting Teammates & Friends, Sharing. Screens: 10.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-01-436d56d6-717c-41a4-bb29-44d8e4aa0ff0.webp` | https://mobbin.com/screens/436d56d6-717c-41a4-bb29-44d8e4aa0ff0 |
| 2 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-02-1b0507bf-5523-4dd3-adf2-e99f5f28f79b.webp` | https://mobbin.com/screens/1b0507bf-5523-4dd3-adf2-e99f5f28f79b |
| 3 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-03-95243378-3435-4ca6-9533-578285dc5ee8.webp` | https://mobbin.com/screens/95243378-3435-4ca6-9533-578285dc5ee8 |
| 4 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-04-8839c221-fc48-4b50-8004-d53b8a34fe08.webp` | https://mobbin.com/screens/8839c221-fc48-4b50-8004-d53b8a34fe08 |
| 5 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-05-ada7c9bb-6730-4dc8-b060-d78711dacd4b.webp` | https://mobbin.com/screens/ada7c9bb-6730-4dc8-b060-d78711dacd4b |
| 6 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-06-98b5383f-520a-4a68-b08a-9ae4a39a0ed6.webp` | https://mobbin.com/screens/98b5383f-520a-4a68-b08a-9ae4a39a0ed6 |
| 7 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-07-aa46761c-baff-4721-a4f7-ea29aa5b4869.webp` | https://mobbin.com/screens/aa46761c-baff-4721-a4f7-ea29aa5b4869 |
| 8 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-08-1b36081a-bcc7-42cb-a06b-7ed96cde57e8.webp` | https://mobbin.com/screens/1b36081a-bcc7-42cb-a06b-7ed96cde57e8 |
| 9 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-09-3c16a9f1-8018-4a0d-83c9-5656aec57a2d.webp` | https://mobbin.com/screens/3c16a9f1-8018-4a0d-83c9-5656aec57a2d |
| 10 | `ios/flows/sharing-a-note/evernote-ios-flow-sharing-a-note-28096ea2-10-39453158-747d-4137-a0df-8e60fe5565f8.webp` | https://mobbin.com/screens/39453158-747d-4137-a0df-8e60fe5565f8 |

### Sharing a note (email copy) — `sharing-a-note-email-copy/` — https://mobbin.com/flows/dbcfb9a2-173f-4b93-b633-ae15e9e234ae

Actions: Chatting & Sending Messages, Inviting Teammates & Friends, Sharing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/sharing-a-note-email-copy/evernote-ios-flow-sharing-a-note-email-copy-dbcfb9a2-01-ada7c9bb-6730-4dc8-b060-d78711dacd4b.webp` | https://mobbin.com/screens/ada7c9bb-6730-4dc8-b060-d78711dacd4b |
| 2 | `ios/flows/sharing-a-note-email-copy/evernote-ios-flow-sharing-a-note-email-copy-dbcfb9a2-02-02519fab-c9ed-476d-807c-040a862adaf2.webp` | https://mobbin.com/screens/02519fab-c9ed-476d-807c-040a862adaf2 |
| 3 | `ios/flows/sharing-a-note-email-copy/evernote-ios-flow-sharing-a-note-email-copy-dbcfb9a2-03-537cc20b-b762-47c2-b9fd-440741a4b154.webp` | https://mobbin.com/screens/537cc20b-b762-47c2-b9fd-440741a4b154 |
| 4 | `ios/flows/sharing-a-note-email-copy/evernote-ios-flow-sharing-a-note-email-copy-dbcfb9a2-04-65820bd3-dbbb-41e4-9d81-c5533007c44c.webp` | https://mobbin.com/screens/65820bd3-dbbb-41e4-9d81-c5533007c44c |

### Shortcuts — `shortcuts/` — https://mobbin.com/flows/f351f98d-dd8f-4599-8581-28940b33f1b0

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/shortcuts/evernote-ios-flow-shortcuts-f351f98d-01-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |
| 2 | `ios/flows/shortcuts/evernote-ios-flow-shortcuts-f351f98d-02-000cc170-a32c-4323-8f04-1887026a29ed.webp` | https://mobbin.com/screens/000cc170-a32c-4323-8f04-1887026a29ed |
| 3 | `ios/flows/shortcuts/evernote-ios-flow-shortcuts-f351f98d-03-8c3af280-2c91-4653-9bd7-e6f589a640f5.webp` | https://mobbin.com/screens/8c3af280-2c91-4653-9bd7-e6f589a640f5 |

### Sketch options — `sketch-options/` — https://mobbin.com/flows/75d4e884-a7d3-4f92-8ae6-3311c98c7a76

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/sketch-options/evernote-ios-flow-sketch-options-75d4e884-01-2219c579-3f3e-4c5d-ac91-0b6883a9722d.webp` | https://mobbin.com/screens/2219c579-3f3e-4c5d-ac91-0b6883a9722d |
| 2 | `ios/flows/sketch-options/evernote-ios-flow-sketch-options-75d4e884-02-81d6fcf2-89d7-4bce-9b86-11789ee14611.webp` | https://mobbin.com/screens/81d6fcf2-89d7-4bce-9b86-11789ee14611 |

### Sorting notes — `sorting-notes/` — https://mobbin.com/flows/ff59d95e-72c4-4890-a955-271157dde7d1

Actions: Filtering & Sorting. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/sorting-notes/evernote-ios-flow-sorting-notes-ff59d95e-01-48b4758a-940d-4a23-a81c-cf3d816c5210.webp` | https://mobbin.com/screens/48b4758a-940d-4a23-a81c-cf3d816c5210 |
| 2 | `ios/flows/sorting-notes/evernote-ios-flow-sorting-notes-ff59d95e-02-2573f4e4-0f76-48e6-9a63-caa9af37e977.webp` | https://mobbin.com/screens/2573f4e4-0f76-48e6-9a63-caa9af37e977 |
| 3 | `ios/flows/sorting-notes/evernote-ios-flow-sorting-notes-ff59d95e-03-95f04d0b-fe56-4f84-a1f9-20b5bb97bd0d.webp` | https://mobbin.com/screens/95f04d0b-fe56-4f84-a1f9-20b5bb97bd0d |
| 4 | `ios/flows/sorting-notes/evernote-ios-flow-sorting-notes-ff59d95e-04-ea563c60-6b66-4d41-895b-63f25244b50a.webp` | https://mobbin.com/screens/ea563c60-6b66-4d41-895b-63f25244b50a |

### Start week on — `start-week-on/` — https://mobbin.com/flows/ff293ffc-37d8-46a6-812c-996c3089b932

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/start-week-on/evernote-ios-flow-start-week-on-ff293ffc-01-4d01a91a-f7c6-424d-be44-eaa36c8b277d.webp` | https://mobbin.com/screens/4d01a91a-f7c6-424d-be44-eaa36c8b277d |
| 2 | `ios/flows/start-week-on/evernote-ios-flow-start-week-on-ff293ffc-02-161552f7-97e7-4ae2-925b-2f3e66426012.webp` | https://mobbin.com/screens/161552f7-97e7-4ae2-925b-2f3e66426012 |

### Switching image view — `switching-image-view/` — https://mobbin.com/flows/0d894eb3-c2fa-462c-b980-dcb5cdd829d2

Actions: Switching View. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/switching-image-view/evernote-ios-flow-switching-image-view-0d894eb3-01-852e0bd2-2cde-415b-a463-c7dc72a58284.webp` | https://mobbin.com/screens/852e0bd2-2cde-415b-a463-c7dc72a58284 |
| 2 | `ios/flows/switching-image-view/evernote-ios-flow-switching-image-view-0d894eb3-02-7368bfba-c031-4817-8b51-df5d9a438389.webp` | https://mobbin.com/screens/7368bfba-c031-4817-8b51-df5d9a438389 |
| 3 | `ios/flows/switching-image-view/evernote-ios-flow-switching-image-view-0d894eb3-03-943cb93a-9039-410a-a264-ff983ad6cfd2.webp` | https://mobbin.com/screens/943cb93a-9039-410a-a264-ff983ad6cfd2 |
| 4 | `ios/flows/switching-image-view/evernote-ios-flow-switching-image-view-0d894eb3-04-67ed81a6-3001-4e6f-a571-4376c6d7eb6b.webp` | https://mobbin.com/screens/67ed81a6-3001-4e6f-a571-4376c6d7eb6b |

### Switching to dark mode — `switching-to-dark-mode/` — https://mobbin.com/flows/1c4fabb2-eb57-45a3-86cd-ec3ae711e1f3

Actions: Switching to Dark Mode. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-01-f74264ac-0593-4010-a615-a072d51d445e.webp` | https://mobbin.com/screens/f74264ac-0593-4010-a615-a072d51d445e |
| 2 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-02-cc912960-8941-4ba5-ae29-6fdb1f4a7829.webp` | https://mobbin.com/screens/cc912960-8941-4ba5-ae29-6fdb1f4a7829 |
| 3 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-03-6bb4a0ec-ff50-480c-b53f-db8b890f3c9f.webp` | https://mobbin.com/screens/6bb4a0ec-ff50-480c-b53f-db8b890f3c9f |
| 4 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-04-d858f94b-37c5-4c4b-923a-7ec20004789a.webp` | https://mobbin.com/screens/d858f94b-37c5-4c4b-923a-7ec20004789a |
| 5 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-05-c5fa25d2-4859-4c6f-9d5b-115774c244e6.webp` | https://mobbin.com/screens/c5fa25d2-4859-4c6f-9d5b-115774c244e6 |
| 6 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-06-7d23a49c-4569-44bd-b124-73a2a7e2947a.webp` | https://mobbin.com/screens/7d23a49c-4569-44bd-b124-73a2a7e2947a |
| 7 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-07-db5284d8-7159-46c8-9d63-748d10dd84ce.webp` | https://mobbin.com/screens/db5284d8-7159-46c8-9d63-748d10dd84ce |
| 8 | `ios/flows/switching-to-dark-mode/evernote-ios-flow-switching-to-dark-mode-1c4fabb2-08-1218a776-7fea-46ce-9ab4-1bed93f47aa3.webp` | https://mobbin.com/screens/1218a776-7fea-46ce-9ab4-1bed93f47aa3 |

### Tags — `tags/` — https://mobbin.com/flows/5fa61f4e-e5f8-4a74-bf48-721f240cf2de

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/tags/evernote-ios-flow-tags-5fa61f4e-01-97f49860-9e6c-4d12-8c29-13e10d1320cd.webp` | https://mobbin.com/screens/97f49860-9e6c-4d12-8c29-13e10d1320cd |
| 2 | `ios/flows/tags/evernote-ios-flow-tags-5fa61f4e-02-53403fb8-216f-438a-8234-a52f637f6c72.webp` | https://mobbin.com/screens/53403fb8-216f-438a-8234-a52f637f6c72 |

### Tasks — `tasks/` — https://mobbin.com/flows/ebb16d29-eed2-48ef-a613-d25949e2f93d

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/tasks/evernote-ios-flow-tasks-ebb16d29-01-2e3f4be4-470e-4c5f-a9f1-2e086ddc574e.webp` | https://mobbin.com/screens/2e3f4be4-470e-4c5f-a9f1-2e086ddc574e |
| 2 | `ios/flows/tasks/evernote-ios-flow-tasks-ebb16d29-02-9e3fbaf7-2ec1-4505-9627-fa76cef34e92.webp` | https://mobbin.com/screens/9e3fbaf7-2ec1-4505-9627-fa76cef34e92 |
| 3 | `ios/flows/tasks/evernote-ios-flow-tasks-ebb16d29-03-a54bf80a-47b8-43f9-85db-d41c87c3bd27.webp` | https://mobbin.com/screens/a54bf80a-47b8-43f9-85db-d41c87c3bd27 |
| 4 | `ios/flows/tasks/evernote-ios-flow-tasks-ebb16d29-04-8ea47cc0-6fb4-41ab-8112-10e25295eef4.webp` | https://mobbin.com/screens/8ea47cc0-6fb4-41ab-8112-10e25295eef4 |

### Transcribing an image — `transcribing-an-image/` — https://mobbin.com/flows/e65ae3ea-8cef-4431-88eb-81e0c2b4cd17

Actions: Misc. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/transcribing-an-image/evernote-ios-flow-transcribing-an-image-e65ae3ea-01-63247041-2f84-4aa3-a69e-4d812c925e46.webp` | https://mobbin.com/screens/63247041-2f84-4aa3-a69e-4d812c925e46 |
| 2 | `ios/flows/transcribing-an-image/evernote-ios-flow-transcribing-an-image-e65ae3ea-02-cbe0cce2-4a71-41e9-9266-da4210010865.webp` | https://mobbin.com/screens/cbe0cce2-4a71-41e9-9266-da4210010865 |
| 3 | `ios/flows/transcribing-an-image/evernote-ios-flow-transcribing-an-image-e65ae3ea-03-bf64bb68-4c33-4650-a67c-35927be3ef53.webp` | https://mobbin.com/screens/bf64bb68-4c33-4650-a67c-35927be3ef53 |
| 4 | `ios/flows/transcribing-an-image/evernote-ios-flow-transcribing-an-image-e65ae3ea-04-74f81ed8-13f2-4734-9f62-e6ae0384a2a2.webp` | https://mobbin.com/screens/74f81ed8-13f2-4734-9f62-e6ae0384a2a2 |

### Trash — `trash/` — https://mobbin.com/flows/b6e2e3be-c88f-4fc0-8101-b4ab79fc9a64

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/trash/evernote-ios-flow-trash-b6e2e3be-01-af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb.webp` | https://mobbin.com/screens/af4530b9-6aa5-4cb0-8ff7-601f5e3e80eb |
| 2 | `ios/flows/trash/evernote-ios-flow-trash-b6e2e3be-02-64687644-8778-48bf-8c24-2ebe370c8b00.webp` | https://mobbin.com/screens/64687644-8778-48bf-8c24-2ebe370c8b00 |

### Using a template — `using-a-template/` — https://mobbin.com/flows/e4aa2dfa-fd6f-4e2f-8486-6469d30ce18f

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/using-a-template/evernote-ios-flow-using-a-template-e4aa2dfa-01-168c3f9a-1190-4e69-b8d3-c8e24622f99a.webp` | https://mobbin.com/screens/168c3f9a-1190-4e69-b8d3-c8e24622f99a |
| 2 | `ios/flows/using-a-template/evernote-ios-flow-using-a-template-e4aa2dfa-02-834cab97-9fd1-4267-b464-e03dcbbe94a2.webp` | https://mobbin.com/screens/834cab97-9fd1-4267-b464-e03dcbbe94a2 |
| 3 | `ios/flows/using-a-template/evernote-ios-flow-using-a-template-e4aa2dfa-03-4b923ec4-e88f-4e40-848f-8060f708053e.webp` | https://mobbin.com/screens/4b923ec4-e88f-4e40-848f-8060f708053e |

### View a notebook — `view-a-notebook/` — https://mobbin.com/flows/e3ceb863-3b74-452b-8c58-f77f3669427d

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/view-a-notebook/evernote-ios-flow-view-a-notebook-e3ceb863-01-40dadd42-c502-4859-b4e1-a0b34e7d63cb.webp` | https://mobbin.com/screens/40dadd42-c502-4859-b4e1-a0b34e7d63cb |
| 2 | `ios/flows/view-a-notebook/evernote-ios-flow-view-a-notebook-e3ceb863-02-a3b00a9b-8a86-4417-97b1-cc38dae31288.webp` | https://mobbin.com/screens/a3b00a9b-8a86-4417-97b1-cc38dae31288 |

### View calendar table — `view-calendar-table/` — https://mobbin.com/flows/719effa8-b077-401a-8711-34146551ecbe

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/view-calendar-table/evernote-ios-flow-view-calendar-table-719effa8-01-8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098.webp` | https://mobbin.com/screens/8e6f0f3b-6f51-4c7e-ab4c-211f14d0a098 |
| 2 | `ios/flows/view-calendar-table/evernote-ios-flow-view-calendar-table-719effa8-02-d97b53bc-a3d3-43b8-accc-f04e8971f7db.webp` | https://mobbin.com/screens/d97b53bc-a3d3-43b8-accc-f04e8971f7db |

### View current plan — `view-current-plan/` — https://mobbin.com/flows/c333fd59-6130-40c2-9159-f703da37b947

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `ios/flows/view-current-plan/evernote-ios-flow-view-current-plan-c333fd59-01-2c514b18-4086-456f-a015-1bb16a84b5a3.webp` | https://mobbin.com/screens/2c514b18-4086-456f-a015-1bb16a84b5a3 |
| 2 | `ios/flows/view-current-plan/evernote-ios-flow-view-current-plan-c333fd59-02-e897962a-4e39-442f-abc6-298bdc026226.webp` | https://mobbin.com/screens/e897962a-4e39-442f-abc6-298bdc026226 |


## Index — web search screens (105)

| File | Group | Shows | Mobbin |
|------|-------|-------|--------|
| `web/calendar/evernote-web-calendar-calendar-day-view-dropdown-ced782fc-88ad-4bb3-88c9-1899f66794de.webp` | calendar | Calendar day view with scheduled events and the Day/Week/Month/Schedule view dropdown open, with a trial banner above. | https://mobbin.com/screens/ced782fc-88ad-4bb3-88c9-1899f66794de |
| `web/calendar/evernote-web-calendar-calendar-day-view-events-list-d7192627-e674-4f73-ae71-1e1bc5fd75bf.webp` | calendar | Calendar day view for Monday June 10 showing two scheduled events and a sidebar with connected calendars and connect-calendar buttons. | https://mobbin.com/screens/d7192627-e674-4f73-ae71-1e1bc5fd75bf |
| `web/calendar/evernote-web-calendar-calendar-day-view-schedule-5a3270a6-8d37-486e-a6b8-87c9e3afc191.webp` | calendar | Calendar day view for a specific Monday showing tasks and timed meeting blocks. | https://mobbin.com/screens/5a3270a6-8d37-486e-a6b8-87c9e3afc191 |
| `web/calendar/evernote-web-calendar-calendar-day-view-schedule-2-ad6b83b8-577d-44dd-9402-d26f432e3f65.webp` | calendar | Calendar day view for a Monday showing a mini month picker and a timeline of scheduled meetings. | https://mobbin.com/screens/ad6b83b8-577d-44dd-9402-d26f432e3f65 |
| `web/calendar/evernote-web-calendar-calendar-day-view-single-event-68143775-c815-4aa9-a884-2040a40c3164.webp` | calendar | Calendar day view for a Saturday showing a single all-day product vision review event. | https://mobbin.com/screens/68143775-c815-4aa9-a884-2040a40c3164 |
| `web/calendar/evernote-web-calendar-calendar-week-view-collapsed-sidebar-67527212-b6e4-4627-add4-372d3b9231c9.webp` | calendar | Calendar week view with a collapsed left sidebar showing events and tasks across the week. | https://mobbin.com/screens/67527212-b6e4-4627-add4-372d3b9231c9 |
| `web/calendar/evernote-web-calendar-calendar-week-view-events-2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7.webp` | calendar | Calendar week view showing scheduled meetings and events across multiple days. | https://mobbin.com/screens/2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7 |
| `web/calendar/evernote-web-calendar-create-event-dialog-date-picker-open-ef8052f5-8bc1-4eea-8063-d9da415d3f96.webp` | calendar | Create event dialog for Design Review with the start date calendar date-picker expanded to choose a day. | https://mobbin.com/screens/ef8052f5-8bc1-4eea-8063-d9da415d3f96 |
| `web/calendar/evernote-web-calendar-create-event-dialog-design-review-cc4b510a-7a7a-4176-9e13-189b7e146f1d.webp` | calendar | Create event dialog titled Design Review with start and end date/time fields and a calendar selector. | https://mobbin.com/screens/cc4b510a-7a7a-4176-9e13-189b7e146f1d |
| `web/calendar/evernote-web-calendar-create-event-dialog-design-review-2-d47f2b23-fe26-4a74-8a5d-d00b560c4791.webp` | calendar | Create event dialog titled Design Review with a different start/end date (07/06/2024) over the home dashboard. | https://mobbin.com/screens/d47f2b23-fe26-4a74-8a5d-d00b560c4791 |
| `web/calendar/evernote-web-calendar-create-event-dialog-time-picker-open-f579c3de-a6e1-4a1b-bcf0-5442cdacc537.webp` | calendar | Create event dialog for Design Review with the start time dropdown list of time slots expanded. | https://mobbin.com/screens/f579c3de-a6e1-4a1b-bcf0-5442cdacc537 |
| `web/dialogs/evernote-web-dialogs-change-background-brand-empty-upload-4fba22c7-7f57-4a18-a862-a84c03a15fba.webp` | dialogs | Change background modal showing brand preset images and an empty drag-and-drop upload area for a custom image. | https://mobbin.com/screens/4fba22c7-7f57-4a18-a862-a84c03a15fba |
| `web/dialogs/evernote-web-dialogs-change-background-brand-gallery-dialog-9c5ec7ef-9412-4ba1-a3ff-aa3a4987ba1c.webp` | dialogs | Change background dialog showing a gallery of brand pattern thumbnails and an upload-your-own-image option. | https://mobbin.com/screens/9c5ec7ef-9412-4ba1-a3ff-aa3a4987ba1c |
| `web/dialogs/evernote-web-dialogs-change-background-floral-gallery-dialog-a32a0593-9b20-4f4b-95d0-5cb798884b54.webp` | dialogs | Change background dialog showing floral and patterned thumbnail options over a partially visible customized home. | https://mobbin.com/screens/a32a0593-9b20-4f4b-95d0-5cb798884b54 |
| `web/dialogs/evernote-web-dialogs-change-background-image-picker-1310f505-8590-4e4d-baa2-393d844d0472.webp` | dialogs | Modal dialog for changing the home background with preset images, colors, and an uploaded custom image selected. | https://mobbin.com/screens/1310f505-8590-4e4d-baa2-393d844d0472 |
| `web/dialogs/evernote-web-dialogs-choose-calendars-dialog-9f2f06ed-667f-44c3-8f0e-92a316c84b65.webp` | dialogs | Modal dialog for selecting which external calendars to display in Evernote, with a home dashboard dimmed behind it. | https://mobbin.com/screens/9f2f06ed-667f-44c3-8f0e-92a316c84b65 |
| `web/dialogs/evernote-web-dialogs-connect-calendar-sign-in-dialog-2a202a6f-316b-4941-8aa8-cc1115316255.webp` | dialogs | Modal dialog prompting the user to connect their calendar via Google or Outlook sign-in. | https://mobbin.com/screens/2a202a6f-316b-4941-8aa8-cc1115316255 |
| `web/dialogs/evernote-web-dialogs-connect-your-calendar-dialog-d6d7db78-5922-4201-bc11-4dedc2f75dfa.webp` | dialogs | Connect your calendar dialog offering to sign in with Google or Microsoft 365 to link notes to calendar events. | https://mobbin.com/screens/d6d7db78-5922-4201-bc11-4dedc2f75dfa |
| `web/dialogs/evernote-web-dialogs-create-event-date-picker-dialog-b108e8ea-d301-471b-9d1f-6a55e149a92c.webp` | dialogs | Modal dialog for creating a Design Review calendar event with start date, time, and an open date picker. | https://mobbin.com/screens/b108e8ea-d301-471b-9d1f-6a55e149a92c |
| `web/dialogs/evernote-web-dialogs-pinned-notes-selection-picker-6c853004-6bef-4b80-a67f-c68a8e313d3b.webp` | dialogs | Space hub page with a pinned notes selection picker open allowing checkbox selection of notes to highlight. | https://mobbin.com/screens/6c853004-6bef-4b80-a67f-c68a8e313d3b |
| `web/editor/evernote-web-editor-note-editor-pdf-attachment-5b28b220-efd1-43cf-94eb-dddef009a59a.webp` | editor | Note editor showing a meeting notes list on the left and an open note with an embedded annotated PDF attachment. | https://mobbin.com/screens/5b28b220-efd1-43cf-94eb-dddef009a59a |
| `web/editor/evernote-web-editor-shared-note-editor-link-copied-645c5e57-d3e1-4cbd-b627-486338f37983.webp` | editor | Shared space note editor with a meeting notes document open and a link-copied confirmation toast. | https://mobbin.com/screens/645c5e57-d3e1-4cbd-b627-486338f37983 |
| `web/empty-state/evernote-web-empty-state-shared-with-me-empty-state-6b1a61bd-0219-4dd9-a0d5-d02dfb15fa87.webp` | empty-state | Shared with me section showing an empty state illustration and message that nothing has been shared yet. | https://mobbin.com/screens/6b1a61bd-0219-4dd9-a0d5-d02dfb15fa87 |
| `web/empty-state/evernote-web-empty-state-tags-empty-state-trial-banner-be5f8571-5656-4b46-b236-6f7ef69920fe.webp` | empty-state | Tags page showing an empty state prompting to create the first tag, with a free trial upsell banner above the note panel. | https://mobbin.com/screens/be5f8571-5656-4b46-b236-6f7ef69920fe |
| `web/home/evernote-web-home-customize-home-background-picker-c75dbd76-b644-4b55-9a6b-6329c5b38dee.webp` | home | Customize Home mode with the colorful gradient background enabled and a Change button plus available widgets panel. | https://mobbin.com/screens/c75dbd76-b644-4b55-9a6b-6329c5b38dee |
| `web/home/evernote-web-home-customize-home-drag-widgets-9519e19e-dcb4-4998-8b19-8198e6794d2f.webp` | home | Home customization mode with a drag-widgets banner, notes row, scratch pad, and available widgets sidebar. | https://mobbin.com/screens/9519e19e-dcb4-4998-8b19-8198e6794d2f |
| `web/home/evernote-web-home-customize-home-drag-widgets-empty-98183260-c6df-414c-830d-19948f6a4979.webp` | home | Home customization mode showing an empty drop zone for widgets alongside scratch pad and recently captured sections. | https://mobbin.com/screens/98183260-c6df-414c-830d-19948f6a4979 |
| `web/home/evernote-web-home-customize-home-drag-widgets-here-cb4a78d9-9824-4c42-b690-c5c60e2e6a01.webp` | home | Customize Home mode showing Scratch pad, Notes and My tasks widgets with an empty drop target labeled Drag widgets here. | https://mobbin.com/screens/cb4a78d9-9824-4c42-b690-c5c60e2e6a01 |
| `web/home/evernote-web-home-customize-home-image-background-9b78ae5a-9dc9-48af-8d3f-cef371883196.webp` | home | Home customization mode with a photographic background image applied above the notes and scratch pad widgets. | https://mobbin.com/screens/9b78ae5a-9dc9-48af-8d3f-cef371883196 |
| `web/home/evernote-web-home-customize-home-notes-scratch-pad-6c777016-fd5b-4df4-94f8-b4920a7177f8.webp` | home | Home dashboard in customize mode showing notes and scratch pad widgets with size and color controls, background disabled. | https://mobbin.com/screens/6c777016-fd5b-4df4-94f8-b4920a7177f8 |
| `web/home/evernote-web-home-customize-home-widget-panel-08cd25c6-738f-43b1-b578-1b38375d489c.webp` | home | Home dashboard in customize mode with a right-side panel of available widgets to drag onto the page. | https://mobbin.com/screens/08cd25c6-738f-43b1-b578-1b38375d489c |
| `web/home/evernote-web-home-customize-home-widget-panel-2-bb4fe7ba-bfef-4ea1-9704-ed1deb223347.webp` | home | Customize Home mode showing draggable Notes, Scratch pad and empty widget slot with an available-widgets panel on the right. | https://mobbin.com/screens/bb4fe7ba-bfef-4ea1-9704-ed1deb223347 |
| `web/home/evernote-web-home-customize-home-widget-panel-scratch-pad-c3ebaee2-159b-4cb8-96ff-856640b7a041.webp` | home | Customize Home mode with Scratch pad, Notes, Recently captured web clips and available-widgets sidebar showing Calendar and Shortcuts. | https://mobbin.com/screens/c3ebaee2-159b-4cb8-96ff-856640b7a041 |
| `web/home/evernote-web-home-customize-home-widget-size-tooltip-deb0163e-108f-476c-9862-f78886e0d968.webp` | home | Customize Home mode showing a Widget Size tooltip open under the Notes widget alongside My Tasks, Scratch Pad, Calendar and Pinned Note widgets. | https://mobbin.com/screens/deb0163e-108f-476c-9862-f78886e0d968 |
| `web/home/evernote-web-home-customize-home-widget-size-tooltip-2-e677275f-cd37-4fbc-a6f2-dc6278172afd.webp` | home | Customize Home mode with the Widget Size Small tooltip open, matching layout of Notes, My Tasks, Scratch Pad, Calendar and Pinned Note widgets. | https://mobbin.com/screens/e677275f-cd37-4fbc-a6f2-dc6278172afd |
| `web/home/evernote-web-home-customize-home-widget-sizing-34eac6fa-2f24-40c8-a504-4b779fd8d7b2.webp` | home | Home dashboard in customize mode showing scratch pad and notes widgets with widget size controls, no background enabled. | https://mobbin.com/screens/34eac6fa-2f24-40c8-a504-4b779fd8d7b2 |
| `web/home/evernote-web-home-home-dashboard-calendar-pinned-note-ac1f47c6-356f-4f33-bf75-750a43b5a560.webp` | home | Personal home dashboard with gradient banner showing notes, tasks, scratch pad, calendar, and a pinned note widget. | https://mobbin.com/screens/ac1f47c6-356f-4f33-bf75-750a43b5a560 |
| `web/home/evernote-web-home-home-dashboard-colorful-banner-42b656eb-b147-4bc7-970e-fa27ec05ceda.webp` | home | Home dashboard with a bright gradient banner, scratch pad, notes, recently captured and tasks widgets. | https://mobbin.com/screens/42b656eb-b147-4bc7-970e-fa27ec05ceda |
| `web/home/evernote-web-home-home-dashboard-dark-mode-519dddb4-ce43-4db9-8d36-63b93107b6f5.webp` | home | Home dashboard rendered in dark mode with scratch pad, notes, recently captured, tasks and tags widgets. | https://mobbin.com/screens/519dddb4-ce43-4db9-8d36-63b93107b6f5 |
| `web/home/evernote-web-home-home-dashboard-follow-up-actions-pinned-b342a29f-86ca-427b-ac8b-b08026ac7c0e.webp` | home | Home dashboard with gradient banner showing notes, tasks, scratch pad, calendar, and a pinned note listing follow-up actions. | https://mobbin.com/screens/b342a29f-86ca-427b-ac8b-b08026ac7c0e |
| `web/home/evernote-web-home-home-dashboard-full-notes-tags-9e3cfef0-b1b3-45b9-a0a9-f67441275c17.webp` | home | Home dashboard with gradient banner showing scratch pad, notes grid, recently captured documents, tasks, and tags widgets. | https://mobbin.com/screens/9e3cfef0-b1b3-45b9-a0a9-f67441275c17 |
| `web/home/evernote-web-home-home-dashboard-get-started-menu-b3616b17-584e-4c5c-a6b3-047e16ed31ea.webp` | home | Evernote web home dashboard with sidebar Get Started checklist menu open over the widgets. | https://mobbin.com/screens/b3616b17-584e-4c5c-a6b3-047e16ed31ea |
| `web/home/evernote-web-home-home-dashboard-get-started-menu-2-fa24293f-2f7f-43ce-925f-43856f65ba1a.webp` | home | Evernote web home dashboard for a different user with the sidebar Get Started checklist menu open over Notes and Scratch Pad widgets. | https://mobbin.com/screens/fa24293f-2f7f-43ce-925f-43856f65ba1a |
| `web/home/evernote-web-home-home-dashboard-gradient-banner-widgets-874db017-4fdc-4d73-ad40-badd8b5ea858.webp` | home | Home dashboard with a colorful gradient banner and widgets for scratch pad, notes, recently captured, tasks, and tags. | https://mobbin.com/screens/874db017-4fdc-4d73-ad40-badd8b5ea858 |
| `web/home/evernote-web-home-home-dashboard-inspiration-widgets-7196b9ff-3d4c-454a-9039-cbb885d842b3.webp` | home | Evernote home dashboard showing inspiration note prompts, an empty notes area, and a scratch pad widget. | https://mobbin.com/screens/7196b9ff-3d4c-454a-9039-cbb885d842b3 |
| `web/home/evernote-web-home-home-dashboard-notes-grid-recent-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | home | Home dashboard showing a grid of recent notes and an empty recently captured web clips section. | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| `web/home/evernote-web-home-home-dashboard-notes-tasks-calendar-b999b449-7bd9-4000-afe2-1480e9db59ab.webp` | home | Evernote web home dashboard showing Notes, My Tasks, Scratch Pad, Calendar, Filtered Notes and Tags widgets with a gradient banner. | https://mobbin.com/screens/b999b449-7bd9-4000-afe2-1480e9db59ab |
| `web/home/evernote-web-home-home-dashboard-notifications-popover-8b650ed0-5c2e-46c9-bb63-1e215238d84c.webp` | home | Home dashboard with a notifications popover open confirming notification setup is complete. | https://mobbin.com/screens/8b650ed0-5c2e-46c9-bb63-1e215238d84c |
| `web/home/evernote-web-home-home-dashboard-recently-captured-documents-e205db34-faf1-4466-90e2-be5859225291.webp` | home | Evernote web home dashboard with Scratch pad checklist, Notes, Recently captured documents, My tasks and Tags widgets. | https://mobbin.com/screens/e205db34-faf1-4466-90e2-be5859225291 |
| `web/home/evernote-web-home-home-dashboard-scratch-pad-followup-be998689-2c69-4a19-9cd6-15b71f69ace2.webp` | home | Evernote web home dashboard with a filled-in Notes list, My Tasks list, Scratch Pad text and a Pinned Note follow-up actions list. | https://mobbin.com/screens/be998689-2c69-4a19-9cd6-15b71f69ace2 |
| `web/home/evernote-web-home-home-dashboard-scratch-pad-note-cd18cfad-a4c4-4726-979b-264ce6e4dca3.webp` | home | Evernote web home dashboard with Notes cards, My Tasks list including overdue items, and a filled Scratch Pad note. | https://mobbin.com/screens/cd18cfad-a4c4-4726-979b-264ce6e4dca3 |
| `web/home/evernote-web-home-home-dashboard-spaces-notebooks-a64e314a-658c-4b1b-8ea3-8e99be80feda.webp` | home | Home dashboard for a user with spaces in the sidebar, showing notes, scratch pad, recently captured, tasks, and tags. | https://mobbin.com/screens/a64e314a-658c-4b1b-8ea3-8e99be80feda |
| `web/home/evernote-web-home-home-dashboard-task-created-toast-ad3c11f7-b7b1-499c-96ab-17924d9eef6c.webp` | home | Home dashboard with a toast banner confirming a task was just created, above notes, tasks, and scratch pad widgets. | https://mobbin.com/screens/ad3c11f7-b7b1-499c-96ab-17924d9eef6c |
| `web/home/evernote-web-home-home-dashboard-with-spaces-12c377e3-f368-4461-8e4e-48a2a943b823.webp` | home | Home dashboard with colorful banner, scratch pad, notes, tasks and tags widgets, sidebar showing Spaces. | https://mobbin.com/screens/12c377e3-f368-4461-8e4e-48a2a943b823 |
| `web/marketing/evernote-web-marketing-landing-page-your-second-brain-b1f73b5d-4f66-4c61-8831-1c7c52eb1025.webp` | marketing | Public Evernote marketing landing page with hero headline, get-started buttons, and a product preview mockup. | https://mobbin.com/screens/b1f73b5d-4f66-4c61-8831-1c7c52eb1025 |
| `web/menus/evernote-web-menus-account-dropdown-menu-open-3338d4e6-4a4f-4d02-8dd0-bc8f59549a89.webp` | menus | Home dashboard with the account dropdown menu open showing admin console, account info, settings and sign out. | https://mobbin.com/screens/3338d4e6-4a4f-4d02-8dd0-bc8f59549a89 |
| `web/menus/evernote-web-menus-account-dropdown-menu-open-2-c4364308-5c77-46bc-a8de-66379bf25eeb.webp` | menus | Account name dropdown menu open in the sidebar showing Admin Console, Account info, Settings, Notifications and Sign out options. | https://mobbin.com/screens/c4364308-5c77-46bc-a8de-66379bf25eeb |
| `web/menus/evernote-web-menus-directory-sidebar-overflow-menu-a52f1d26-91bd-4a4c-a3ba-59bf1e2fc30d.webp` | menus | Directory spaces list with a sidebar overflow menu open showing Trash, Invite Users, and Customize sidebar options. | https://mobbin.com/screens/a52f1d26-91bd-4a4c-a3ba-59bf1e2fc30d |
| `web/menus/evernote-web-menus-task-filter-dropdown-recurring-3d6dbc32-6b24-4403-a6a3-679c34603215.webp` | menus | Tasks view with a filter dropdown open showing recurring, flagged, completed, due date and priority filter options. | https://mobbin.com/screens/3d6dbc32-6b24-4403-a6a3-679c34603215 |
| `web/misc/evernote-web-misc-files-preview-unsupported-file-cd400126-4b54-407f-8238-0989944c3cd8.webp` | misc | Files section showing a file list sidebar and a main panel stating the selected file preview is not supported, with a Download file button. | https://mobbin.com/screens/cd400126-4b54-407f-8238-0989944c3cd8 |
| `web/notebooks/evernote-web-notebooks-directory-spaces-list-dd127c4f-55f0-4603-9896-2ec3926de1d0.webp` | notebooks | Directory page listing team Spaces with created/updated dates, access level and join-space buttons. | https://mobbin.com/screens/dd127c4f-55f0-4603-9896-2ec3926de1d0 |
| `web/notebooks/evernote-web-notebooks-directory-spaces-list-join-9f013f31-bef8-404f-bca4-1714077a7393.webp` | notebooks | Directory screen listing spaces with created/updated dates, access level, and join-space buttons. | https://mobbin.com/screens/9f013f31-bef8-404f-bca4-1714077a7393 |
| `web/notebooks/evernote-web-notebooks-notebooks-list-table-25f3557c-8050-4cd0-a912-52fce65877b9.webp` | notebooks | Notebooks list view showing three notebooks in a table with title, created by, updated and shared columns. | https://mobbin.com/screens/25f3557c-8050-4cd0-a912-52fce65877b9 |
| `web/notebooks/evernote-web-notebooks-notebooks-list-table-view-a718fe36-22aa-4251-8f39-a70aed1fea64.webp` | notebooks | Notebooks screen listing ten notebooks in a table with space, creator, and last updated columns. | https://mobbin.com/screens/a718fe36-22aa-4251-8f39-a70aed1fea64 |
| `web/notebooks/evernote-web-notebooks-notebooks-list-twelve-table-ac6391d7-21e6-486f-b612-68165dfe9c40.webp` | notebooks | Notebooks screen listing twelve notebooks in a table with space, creator, and updated columns. | https://mobbin.com/screens/ac6391d7-21e6-486f-b612-68165dfe9c40 |
| `web/notebooks/evernote-web-notebooks-space-getting-started-pinned-notes-panel-f863792c-9cf1-4336-9672-40587c6a6da3.webp` | notebooks | Getting Started with Evernote space with a Pinned notes selection panel open over the What's new cards and items table. | https://mobbin.com/screens/f863792c-9cf1-4336-9672-40587c6a6da3 |
| `web/notebooks/evernote-web-notebooks-space-pinned-notes-selection-panel-f1123da3-9e37-4472-a835-7f279ae232cc.webp` | notebooks | Product & Design Hub space with a Pinned notes selection panel open listing notes to highlight with checkboxes. | https://mobbin.com/screens/f1123da3-9e37-4472-a835-7f279ae232cc |
| `web/notebooks/evernote-web-notebooks-space-product-design-hub-overview-cf396b2c-7323-470d-afb4-0d09daf7675c.webp` | notebooks | Product & Design Hub space page showing What's new cards, pinned notes panel and an all-items table of notes and a notebook. | https://mobbin.com/screens/cf396b2c-7323-470d-afb4-0d09daf7675c |
| `web/notes/evernote-web-notes-files-panel-with-pdf-preview-1ca25170-0748-4db7-b06a-dd3e1fef65aa.webp` | notes | Files section listing meeting and note attachments with a PDF document preview open on the right. | https://mobbin.com/screens/1ca25170-0748-4db7-b06a-dd3e1fef65aa |
| `web/notes/evernote-web-notes-note-list-task-detail-view-f6328cfa-7160-4f91-8279-283b52ceae7d.webp` | notes | Notes list with a task-containing note titled Things to do selected, showing the task item with due date and controls in the editor pane. | https://mobbin.com/screens/f6328cfa-7160-4f91-8279-283b52ceae7d |
| `web/notes/evernote-web-notes-shared-with-me-list-b31c3d7e-da78-43ca-960c-b755dc1a7318.webp` | notes | Shared with me screen listing three items shared by a colleague with share dates. | https://mobbin.com/screens/b31c3d7e-da78-43ca-960c-b755dc1a7318 |
| `web/notes/evernote-web-notes-space-getting-started-note-list-bfe9afea-de8a-482d-9457-4d025fc81b69.webp` | notes | Getting Started with Evernote space showing What's new cards and an all-items table of notes and notebooks. | https://mobbin.com/screens/bfe9afea-de8a-482d-9457-4d025fc81b69 |
| `web/notes/evernote-web-notes-space-hub-edited-toast-4ee3d91b-a41e-4818-94dd-f191cc53eb38.webp` | notes | Product & Design Hub space page with a Space edited confirmation toast at the bottom. | https://mobbin.com/screens/4ee3d91b-a41e-4818-94dd-f191cc53eb38 |
| `web/notes/evernote-web-notes-space-hub-whats-new-pinned-notes-1f32d551-790d-4d4d-bce2-8a89858d31bc.webp` | notes | Product & Design Hub space page showing What's new cards, pinned notes, and an all-items note list. | https://mobbin.com/screens/1f32d551-790d-4d4d-bce2-8a89858d31bc |
| `web/onboarding/evernote-web-onboarding-complete-your-setup-step-328c18a7-b565-41fe-b2a3-288dd7317b72.webp` | onboarding | Onboarding step titled Complete your setup listing productivity, organization and task tips with a Get started button. | https://mobbin.com/screens/328c18a7-b565-41fe-b2a3-288dd7317b72 |
| `web/onboarding/evernote-web-onboarding-create-first-notebook-step-1331979d-27bc-4af3-839e-3825ac13a79b.webp` | onboarding | Onboarding flow step prompting the user to create their first notebook with a name field. | https://mobbin.com/screens/1331979d-27bc-4af3-839e-3825ac13a79b |
| `web/onboarding/evernote-web-onboarding-create-first-task-onboarding-87981a59-4f9d-40a7-8b2c-0c4724640f3f.webp` | onboarding | Onboarding step prompting the user to create their first task with three empty to-do fields. | https://mobbin.com/screens/87981a59-4f9d-40a7-8b2c-0c4724640f3f |
| `web/onboarding/evernote-web-onboarding-enable-daily-notes-template-picker-8489bd64-8690-4a07-8e95-2fc8e1e8f857.webp` | onboarding | Onboarding step to enable daily notes with a choice of Journal, To-do list, or Agenda template. | https://mobbin.com/screens/8489bd64-8690-4a07-8e95-2fc8e1e8f857 |
| `web/onboarding/evernote-web-onboarding-enable-daily-notes-template-picker-2-a8f7b17d-e559-4a45-b643-3fde3209695b.webp` | onboarding | Onboarding step to enable daily notes with Journal, To-do list, and Agenda template options, Agenda selected. | https://mobbin.com/screens/a8f7b17d-e559-4a45-b643-3fde3209695b |
| `web/onboarding/evernote-web-onboarding-setup-complete-confetti-screen-50f4408a-b8f8-4074-b9d2-65218699f335.webp` | onboarding | Onboarding final step with confetti graphic confirming setup is complete and a Create a note button. | https://mobbin.com/screens/50f4408a-b8f8-4074-b9d2-65218699f335 |
| `web/onboarding/evernote-web-onboarding-setup-complete-confetti-screen-2-7de7b224-cd9e-4a81-a07e-6123f3f9dfaf.webp` | onboarding | Onboarding confirmation screen with confetti graphic stating setup is complete and a create-a-note button. | https://mobbin.com/screens/7de7b224-cd9e-4a81-a07e-6123f3f9dfaf |
| `web/onboarding/evernote-web-onboarding-welcome-to-evernote-teams-modal-cd61a078-295c-4dab-b1b4-17cb639e3f95.webp` | onboarding | Welcome to Evernote Teams onboarding modal with elephant logo and a loading progress bar over the home dashboard. | https://mobbin.com/screens/cd61a078-295c-4dab-b1b4-17cb639e3f95 |
| `web/onboarding/evernote-web-onboarding-what-are-you-here-to-accomplish-modal-9b600bb7-a32c-4d37-92de-3e15ddf20368.webp` | onboarding | Onboarding modal asking what the user wants to accomplish with options like document repository or productivity. | https://mobbin.com/screens/9b600bb7-a32c-4d37-92de-3e15ddf20368 |
| `web/search/evernote-web-search-ai-powered-search-mode-suggestions-e8cbbd7c-6efe-4478-8393-55a52b392a05.webp` | search | Search select-mode dialog showing Standard vs AI-Powered toggle with a typed question and suggested follow-up search prompts. | https://mobbin.com/screens/e8cbbd7c-6efe-4478-8393-55a52b392a05 |
| `web/search/evernote-web-search-ai-search-results-notes-with-attachments-ed05961a-1b4c-431a-8d7c-ba198d415807.webp` | search | AI-powered search results panel listing notes found for a query, with a selected note (Report Chart) shown in the editor. | https://mobbin.com/screens/ed05961a-1b4c-431a-8d7c-ba198d415807 |
| `web/search/evernote-web-search-search-panel-shortcuts-filters-8c2859dc-f28c-4159-b900-9923e2bc297f.webp` | search | Search panel open with standard/AI-powered mode toggle, shortcut links, and applied filters. | https://mobbin.com/screens/8c2859dc-f28c-4159-b900-9923e2bc297f |
| `web/settings/evernote-web-settings-account-access-history-log-35e39466-f2f2-485e-a0dd-bec17c610ef3.webp` | settings | Account settings Access History page listing recent app logins with IP address and location. | https://mobbin.com/screens/35e39466-f2f2-485e-a0dd-bec17c610ef3 |
| `web/settings/evernote-web-settings-account-devices-list-078bd0d6-6686-4167-97df-936b0c948eef.webp` | settings | Account settings Devices page showing the Evernote Web device and its last-accessed date. | https://mobbin.com/screens/078bd0d6-6686-4167-97df-936b0c948eef |
| `web/settings/evernote-web-settings-account-summary-settings-c2b74f06-36be-4a7b-81f5-8e4882d148d2.webp` | settings | Account summary settings page showing plan, name, email, language and email-notes-to options. | https://mobbin.com/screens/c2b74f06-36be-4a7b-81f5-8e4882d148d2 |
| `web/settings/evernote-web-settings-admin-console-activity-history-bf922e5e-d65f-4814-9212-5cbe97621b32.webp` | settings | Admin console Activity History settings page with a date range selector for auditing user activity. | https://mobbin.com/screens/bf922e5e-d65f-4814-9212-5cbe97621b32 |
| `web/settings/evernote-web-settings-admin-console-team-spaces-list-deb43a09-010b-47a2-b8e3-ecb69af1ef27.webp` | settings | Admin console Team Spaces page listing spaces with checkboxes, member counts and an actions/sort dropdown. | https://mobbin.com/screens/deb43a09-010b-47a2-b8e3-ecb69af1ef27 |
| `web/settings/evernote-web-settings-admin-console-team-summary-538d790a-0a24-4286-8247-5dc124d259aa.webp` | settings | Admin console Summary page showing user counts, seats remaining, monthly usage and recently joined members. | https://mobbin.com/screens/538d790a-0a24-4286-8247-5dc124d259aa |
| `web/settings/evernote-web-settings-admin-team-spaces-actions-menu-32fe5349-8ad8-4ec1-8375-f4f30f63ba16.webp` | settings | Admin console Team Spaces page with an open Actions dropdown menu showing join, add members and delete space options. | https://mobbin.com/screens/32fe5349-8ad8-4ec1-8375-f4f30f63ba16 |
| `web/settings/evernote-web-settings-admin-team-spaces-adding-user-toast-8519037e-ee97-47bb-8627-1b5935c31a41.webp` | settings | Admin console team spaces list with a toast overlay indicating a user is being added to three spaces. | https://mobbin.com/screens/8519037e-ee97-47bb-8627-1b5935c31a41 |
| `web/settings/evernote-web-settings-admin-team-spaces-list-a4a91a83-d254-4f19-b3b2-b6bd14142a6e.webp` | settings | Admin console team spaces list showing five spaces with member counts and access settings, none selected. | https://mobbin.com/screens/a4a91a83-d254-4f19-b3b2-b6bd14142a6e |
| `web/settings/evernote-web-settings-admin-team-spaces-three-selected-a6c30a9e-5239-4c1e-b693-ce2d2ebf7a22.webp` | settings | Admin console team spaces list with three spaces checked and their rows highlighted green. | https://mobbin.com/screens/a6c30a9e-5239-4c1e-b693-ce2d2ebf7a22 |
| `web/sharing/evernote-web-sharing-share-space-publish-directory-dialog-68b30b3b-0ad1-4a2a-9913-939a8d95fb08.webp` | sharing | Share dialog for the Product & Design Hub space showing publish-to-directory toggle, invite field and member list. | https://mobbin.com/screens/68b30b3b-0ad1-4a2a-9913-939a8d95fb08 |
| `web/tasks/evernote-web-tasks-create-task-dialog-bafa96f4-6f74-4ab7-a328-704729737b51.webp` | tasks | Create task dialog with description, due date, reminder, assignee, priority and flag fields open over the home dashboard. | https://mobbin.com/screens/bafa96f4-6f74-4ab7-a328-704729737b51 |
| `web/tasks/evernote-web-tasks-tasks-assigned-tab-list-0cd3fe6c-b54a-4ffc-99aa-874adc86ed2c.webp` | tasks | Tasks view on the Assigned tab listing unassigned tasks with due dates and a trial-ending banner. | https://mobbin.com/screens/0cd3fe6c-b54a-4ffc-99aa-874adc86ed2c |
| `web/tasks/evernote-web-tasks-tasks-assigned-unassigned-list-6696fff6-6fef-48cf-a229-3654e96a2c20.webp` | tasks | Tasks view on Assigned tab listing unassigned tasks with due dates and priority flags. | https://mobbin.com/screens/6696fff6-6fef-48cf-a229-3654e96a2c20 |
| `web/tasks/evernote-web-tasks-tasks-list-assigned-tab-dark-a9588993-79d9-4e0d-ac94-7732d340a3d8.webp` | tasks | Tasks screen on the Assigned tab in dark mode showing a list of unassigned tasks with due dates. | https://mobbin.com/screens/a9588993-79d9-4e0d-ac94-7732d340a3d8 |
| `web/tasks/evernote-web-tasks-tasks-list-my-tasks-tab-8a848c69-c7c2-417c-84b2-f70a980b41c8.webp` | tasks | Tasks screen on the My tasks tab showing a flat list of tasks with due dates. | https://mobbin.com/screens/8a848c69-c7c2-417c-84b2-f70a980b41c8 |
| `web/tasks/evernote-web-tasks-tasks-list-today-grouped-7490b881-151e-4aed-abb8-718c04986d1c.webp` | tasks | Tasks screen listing tasks grouped by Today, Tomorrow, and Next 7 days with due dates and assignments. | https://mobbin.com/screens/7490b881-151e-4aed-abb8-718c04986d1c |
| `web/tasks/evernote-web-tasks-tasks-my-tasks-empty-dates-326c6ae4-2ab9-4bb0-99ad-86a28c6fae8c.webp` | tasks | Tasks view on My tasks tab with a first-shortcut tooltip and tasks lacking due dates. | https://mobbin.com/screens/326c6ae4-2ab9-4bb0-99ad-86a28c6fae8c |
| `web/tasks/evernote-web-tasks-tasks-my-tasks-list-completed-0cf81f55-0d68-445f-96f8-ae5905039491.webp` | tasks | Tasks view on My tasks tab showing a list of tasks with one struck-through completed item. | https://mobbin.com/screens/0cf81f55-0d68-445f-96f8-ae5905039491 |

## Index — web flows (170 flows, 897 files)

### Account info — `account-info/` — https://mobbin.com/flows/c32ec8a8-40fd-4289-8615-17af0cf72780

Actions: none listed. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/account-info/evernote-web-flow-account-info-c32ec8a8-01-c4364308-5c77-46bc-a8de-66379bf25eeb.webp` | https://mobbin.com/screens/c4364308-5c77-46bc-a8de-66379bf25eeb |
| 2 | `web/flows/account-info/evernote-web-flow-account-info-c32ec8a8-02-bba1dc8f-6e7f-49fc-bb20-93f49b441c35.webp` | https://mobbin.com/screens/bba1dc8f-6e7f-49fc-bb20-93f49b441c35 |
| 3 | `web/flows/account-info/evernote-web-flow-account-info-c32ec8a8-03-81a9d82d-db16-4ce7-9566-ff47e48c3427.webp` | https://mobbin.com/screens/81a9d82d-db16-4ce7-9566-ff47e48c3427 |
| 4 | `web/flows/account-info/evernote-web-flow-account-info-c32ec8a8-04-36ac38fe-f89b-4f7f-b4e0-fa61565bba39.webp` | https://mobbin.com/screens/36ac38fe-f89b-4f7f-b4e0-fa61565bba39 |
| 5 | `web/flows/account-info/evernote-web-flow-account-info-c32ec8a8-05-9984d564-80cb-4af0-a45d-6957b6da59d3.webp` | https://mobbin.com/screens/9984d564-80cb-4af0-a45d-6957b6da59d3 |

### Account info — `account-info/` — https://mobbin.com/flows/d0f21301-fd3b-4bc3-85b8-b6d4f408d0fb

Actions: none listed. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-01-3338d4e6-4a4f-4d02-8dd0-bc8f59549a89.webp` | https://mobbin.com/screens/3338d4e6-4a4f-4d02-8dd0-bc8f59549a89 |
| 2 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-02-c2b74f06-36be-4a7b-81f5-8e4882d148d2.webp` | https://mobbin.com/screens/c2b74f06-36be-4a7b-81f5-8e4882d148d2 |
| 3 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-03-47f86b7a-4a2b-48f6-b2f9-d3fe3dbdc292.webp` | https://mobbin.com/screens/47f86b7a-4a2b-48f6-b2f9-d3fe3dbdc292 |
| 4 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-04-7ad94ba8-9da8-4da6-8b53-214c83de1a67.webp` | https://mobbin.com/screens/7ad94ba8-9da8-4da6-8b53-214c83de1a67 |
| 5 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-05-078bd0d6-6686-4167-97df-936b0c948eef.webp` | https://mobbin.com/screens/078bd0d6-6686-4167-97df-936b0c948eef |
| 6 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-06-f6f3480c-d642-492e-ad09-a670553d9c3d.webp` | https://mobbin.com/screens/f6f3480c-d642-492e-ad09-a670553d9c3d |
| 7 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-07-711273cf-7cce-4b02-8887-c8f4cd071b40.webp` | https://mobbin.com/screens/711273cf-7cce-4b02-8887-c8f4cd071b40 |
| 8 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-08-319043dd-ee32-4cd3-818b-04f38b7ab74b.webp` | https://mobbin.com/screens/319043dd-ee32-4cd3-818b-04f38b7ab74b |
| 9 | `web/flows/account-info/evernote-web-flow-account-info-d0f21301-09-35e39466-f2f2-485e-a0dd-bec17c610ef3.webp` | https://mobbin.com/screens/35e39466-f2f2-485e-a0dd-bec17c610ef3 |

### Adding a background color — `adding-a-background-color/` — https://mobbin.com/flows/fbb5de1f-897d-4363-8819-a38589c428a4

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-background-color/evernote-web-flow-adding-a-background-color-fbb5de1f-01-218649fa-e13e-4d3c-ae86-a8b95c00aec8.webp` | https://mobbin.com/screens/218649fa-e13e-4d3c-ae86-a8b95c00aec8 |
| 2 | `web/flows/adding-a-background-color/evernote-web-flow-adding-a-background-color-fbb5de1f-02-c01675ef-2bdc-4923-9168-3870670b3188.webp` | https://mobbin.com/screens/c01675ef-2bdc-4923-9168-3870670b3188 |
| 3 | `web/flows/adding-a-background-color/evernote-web-flow-adding-a-background-color-fbb5de1f-03-0778672a-c783-459d-a2d5-8217df1aee94.webp` | https://mobbin.com/screens/0778672a-c783-459d-a2d5-8217df1aee94 |

### Adding a background image — `adding-a-background-image/` — https://mobbin.com/flows/4dfb043a-092f-4fe0-805b-68897a95d3da

Actions: Uploading & Downloading. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-background-image/evernote-web-flow-adding-a-background-image-4dfb043a-01-9b78ae5a-9dc9-48af-8d3f-cef371883196.webp` | https://mobbin.com/screens/9b78ae5a-9dc9-48af-8d3f-cef371883196 |
| 2 | `web/flows/adding-a-background-image/evernote-web-flow-adding-a-background-image-4dfb043a-02-4fba22c7-7f57-4a18-a862-a84c03a15fba.webp` | https://mobbin.com/screens/4fba22c7-7f57-4a18-a862-a84c03a15fba |
| 3 | `web/flows/adding-a-background-image/evernote-web-flow-adding-a-background-image-4dfb043a-03-a32a0593-9b20-4f4b-95d0-5cb798884b54.webp` | https://mobbin.com/screens/a32a0593-9b20-4f4b-95d0-5cb798884b54 |
| 4 | `web/flows/adding-a-background-image/evernote-web-flow-adding-a-background-image-4dfb043a-04-1310f505-8590-4e4d-baa2-393d844d0472.webp` | https://mobbin.com/screens/1310f505-8590-4e4d-baa2-393d844d0472 |
| 5 | `web/flows/adding-a-background-image/evernote-web-flow-adding-a-background-image-4dfb043a-05-c75dbd76-b644-4b55-9a6b-6329c5b38dee.webp` | https://mobbin.com/screens/c75dbd76-b644-4b55-9a6b-6329c5b38dee |

### Adding a description — `adding-a-description/` — https://mobbin.com/flows/f6dde696-db0f-4e36-8097-6beb476e3504

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-description/evernote-web-flow-adding-a-description-f6dde696-01-edaaf22d-6e5b-428e-bd22-1a53bae1fbdb.webp` | https://mobbin.com/screens/edaaf22d-6e5b-428e-bd22-1a53bae1fbdb |
| 2 | `web/flows/adding-a-description/evernote-web-flow-adding-a-description-f6dde696-02-61837014-9ea2-47b6-ad24-7ab850ff2858.webp` | https://mobbin.com/screens/61837014-9ea2-47b6-ad24-7ab850ff2858 |
| 3 | `web/flows/adding-a-description/evernote-web-flow-adding-a-description-f6dde696-03-ed80008b-974d-48a6-943c-959a60c09205.webp` | https://mobbin.com/screens/ed80008b-974d-48a6-943c-959a60c09205 |
| 4 | `web/flows/adding-a-description/evernote-web-flow-adding-a-description-f6dde696-04-68b30b3b-0ad1-4a2a-9913-939a8d95fb08.webp` | https://mobbin.com/screens/68b30b3b-0ad1-4a2a-9913-939a8d95fb08 |
| 5 | `web/flows/adding-a-description/evernote-web-flow-adding-a-description-f6dde696-05-4ee3d91b-a41e-4818-94dd-f191cc53eb38.webp` | https://mobbin.com/screens/4ee3d91b-a41e-4818-94dd-f191cc53eb38 |

### Adding a link — `adding-a-link/` — https://mobbin.com/flows/ad6b77e2-7812-4202-8e04-1ed2030b7b5b

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-ad6b77e2-01-52cf035f-7e0b-4f19-a3cf-935858c37ddb.webp` | https://mobbin.com/screens/52cf035f-7e0b-4f19-a3cf-935858c37ddb |
| 2 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-ad6b77e2-02-da2f8ae4-6650-44c7-b838-2c66cdf49135.webp` | https://mobbin.com/screens/da2f8ae4-6650-44c7-b838-2c66cdf49135 |
| 3 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-ad6b77e2-03-52758c00-7fff-4ac1-972c-fe54a7cc582d.webp` | https://mobbin.com/screens/52758c00-7fff-4ac1-972c-fe54a7cc582d |
| 4 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-ad6b77e2-04-6bbb0105-4b94-4189-abba-dbdf785415dd.webp` | https://mobbin.com/screens/6bbb0105-4b94-4189-abba-dbdf785415dd |

### Adding a link — `adding-a-link/` — https://mobbin.com/flows/b3395340-d02e-4504-a375-43a2fa55c9ad

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-b3395340-01-004d4395-0e47-4ddb-95e4-00d98691be86.webp` | https://mobbin.com/screens/004d4395-0e47-4ddb-95e4-00d98691be86 |
| 2 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-b3395340-02-0c48b19e-9e39-42b8-b0f1-2758fcb95a3f.webp` | https://mobbin.com/screens/0c48b19e-9e39-42b8-b0f1-2758fcb95a3f |
| 3 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-b3395340-03-ae4d754c-b3c0-40f4-a12f-0674bd8b912a.webp` | https://mobbin.com/screens/ae4d754c-b3c0-40f4-a12f-0674bd8b912a |
| 4 | `web/flows/adding-a-link/evernote-web-flow-adding-a-link-b3395340-04-c5331ae9-8ed4-458c-84a3-a00c464e6379.webp` | https://mobbin.com/screens/c5331ae9-8ed4-458c-84a3-a00c464e6379 |

### Adding a linked note — `adding-a-linked-note/` — https://mobbin.com/flows/9559505c-631b-4e8b-9782-15f42223ab89

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-linked-note/evernote-web-flow-adding-a-linked-note-9559505c-01-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |
| 2 | `web/flows/adding-a-linked-note/evernote-web-flow-adding-a-linked-note-9559505c-02-05ee63d9-2687-4c0e-bbc6-eb63c6a564f6.webp` | https://mobbin.com/screens/05ee63d9-2687-4c0e-bbc6-eb63c6a564f6 |
| 3 | `web/flows/adding-a-linked-note/evernote-web-flow-adding-a-linked-note-9559505c-03-2d9c315b-236d-4cfa-87da-5cfca4027d03.webp` | https://mobbin.com/screens/2d9c315b-236d-4cfa-87da-5cfca4027d03 |
| 4 | `web/flows/adding-a-linked-note/evernote-web-flow-adding-a-linked-note-9559505c-04-ff3fc798-d894-4db5-8613-9015523b6bb3.webp` | https://mobbin.com/screens/ff3fc798-d894-4db5-8613-9015523b6bb3 |
| 5 | `web/flows/adding-a-linked-note/evernote-web-flow-adding-a-linked-note-9559505c-05-0fd2e929-7f58-4258-9509-157ccd0182d8.webp` | https://mobbin.com/screens/0fd2e929-7f58-4258-9509-157ccd0182d8 |

### Adding a member — `adding-a-member/` — https://mobbin.com/flows/94f6ee00-b464-4336-afdf-58b939ca05fe

Actions: Inviting Teammates & Friends. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-01-6384a5c8-07ad-4df3-a68d-f9d315f9a108.webp` | https://mobbin.com/screens/6384a5c8-07ad-4df3-a68d-f9d315f9a108 |
| 2 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-02-c59a0096-9e33-4995-856a-9a663d40ae5a.webp` | https://mobbin.com/screens/c59a0096-9e33-4995-856a-9a663d40ae5a |
| 3 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-03-ddf32cd8-4517-4fb0-ae1f-a01b3fbfdf2a.webp` | https://mobbin.com/screens/ddf32cd8-4517-4fb0-ae1f-a01b3fbfdf2a |
| 4 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-04-cc17c68f-af2c-415c-895d-2aa03e064798.webp` | https://mobbin.com/screens/cc17c68f-af2c-415c-895d-2aa03e064798 |
| 5 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-05-bf6ae1c6-15e5-4bf9-aa30-099b3be83e5d.webp` | https://mobbin.com/screens/bf6ae1c6-15e5-4bf9-aa30-099b3be83e5d |
| 6 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-06-8209a79a-10cf-4601-933a-26046283f9d4.webp` | https://mobbin.com/screens/8209a79a-10cf-4601-933a-26046283f9d4 |
| 7 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-07-60ec1daf-6925-4575-a03d-4905b00434a7.webp` | https://mobbin.com/screens/60ec1daf-6925-4575-a03d-4905b00434a7 |
| 8 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-08-e29f67db-1210-4278-837e-0b4c57573423.webp` | https://mobbin.com/screens/e29f67db-1210-4278-837e-0b4c57573423 |
| 9 | `web/flows/adding-a-member/evernote-web-flow-adding-a-member-94f6ee00-09-5384a099-47fb-4cd9-af6b-c8246a586c38.webp` | https://mobbin.com/screens/5384a099-47fb-4cd9-af6b-c8246a586c38 |

### Adding a new linked note — `adding-a-new-linked-note/` — https://mobbin.com/flows/1a7741a0-8160-4fa8-810c-9c5417ccec79

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-new-linked-note/evernote-web-flow-adding-a-new-linked-note-1a7741a0-01-e4edd516-70cd-436c-86e2-22d3c88aeec1.webp` | https://mobbin.com/screens/e4edd516-70cd-436c-86e2-22d3c88aeec1 |
| 2 | `web/flows/adding-a-new-linked-note/evernote-web-flow-adding-a-new-linked-note-1a7741a0-02-004d4395-0e47-4ddb-95e4-00d98691be86.webp` | https://mobbin.com/screens/004d4395-0e47-4ddb-95e4-00d98691be86 |
| 3 | `web/flows/adding-a-new-linked-note/evernote-web-flow-adding-a-new-linked-note-1a7741a0-03-f853f490-d66b-466b-8994-17ef7e2450aa.webp` | https://mobbin.com/screens/f853f490-d66b-466b-8994-17ef7e2450aa |
| 4 | `web/flows/adding-a-new-linked-note/evernote-web-flow-adding-a-new-linked-note-1a7741a0-04-fa772c90-a1a9-4c33-9e35-1da2ce912965.webp` | https://mobbin.com/screens/fa772c90-a1a9-4c33-9e35-1da2ce912965 |
| 5 | `web/flows/adding-a-new-linked-note/evernote-web-flow-adding-a-new-linked-note-1a7741a0-05-870afae2-399f-4be6-a842-ce938177f857.webp` | https://mobbin.com/screens/870afae2-399f-4be6-a842-ce938177f857 |

### Adding a new tag — `adding-a-new-tag/` — https://mobbin.com/flows/da1c276f-c303-4881-8086-497c8070302b

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-new-tag/evernote-web-flow-adding-a-new-tag-da1c276f-01-26000e69-82cd-4335-9b46-dc35e3b5bcc3.webp` | https://mobbin.com/screens/26000e69-82cd-4335-9b46-dc35e3b5bcc3 |
| 2 | `web/flows/adding-a-new-tag/evernote-web-flow-adding-a-new-tag-da1c276f-02-d2bec203-176c-4371-b5d4-4600a815469e.webp` | https://mobbin.com/screens/d2bec203-176c-4371-b5d4-4600a815469e |
| 3 | `web/flows/adding-a-new-tag/evernote-web-flow-adding-a-new-tag-da1c276f-03-a2fbe9bc-c68b-49e3-b2ec-d4378b66d0a2.webp` | https://mobbin.com/screens/a2fbe9bc-c68b-49e3-b2ec-d4378b66d0a2 |
| 4 | `web/flows/adding-a-new-tag/evernote-web-flow-adding-a-new-tag-da1c276f-04-43b80731-9a93-4c4b-92d4-042d8e3ad5a9.webp` | https://mobbin.com/screens/43b80731-9a93-4c4b-92d4-042d8e3ad5a9 |

### Adding a reminder — `adding-a-reminder/` — https://mobbin.com/flows/58531e4e-f710-471e-9d38-6495080d0428

Actions: Scheduling. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-02-90ea22f2-2eb0-4bd1-abe8-ee57ddc834c0.webp` | https://mobbin.com/screens/90ea22f2-2eb0-4bd1-abe8-ee57ddc834c0 |
| 3 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-03-d8e16bf4-1c5f-4117-9d06-65f36c6cf02d.webp` | https://mobbin.com/screens/d8e16bf4-1c5f-4117-9d06-65f36c6cf02d |
| 4 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-04-de9ee875-be4c-46bb-9b22-cef7d9acaf1e.webp` | https://mobbin.com/screens/de9ee875-be4c-46bb-9b22-cef7d9acaf1e |
| 5 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-05-8a143741-24f2-4f6b-89c1-f7967cbca810.webp` | https://mobbin.com/screens/8a143741-24f2-4f6b-89c1-f7967cbca810 |
| 6 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-58531e4e-06-03fc1a74-7518-47c2-9f2f-5e502a2ca87b.webp` | https://mobbin.com/screens/03fc1a74-7518-47c2-9f2f-5e502a2ca87b |

### Adding a reminder — `adding-a-reminder/` — https://mobbin.com/flows/b5af58d3-6d91-45d3-9428-79664d93e617

Actions: Adding & Creating, Scheduling. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-01-e4edd516-70cd-436c-86e2-22d3c88aeec1.webp` | https://mobbin.com/screens/e4edd516-70cd-436c-86e2-22d3c88aeec1 |
| 2 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-02-7410608d-02cf-4a76-b3a5-825d5aa34981.webp` | https://mobbin.com/screens/7410608d-02cf-4a76-b3a5-825d5aa34981 |
| 3 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-03-5dfea5ad-169a-446a-9622-2e6b60cbf679.webp` | https://mobbin.com/screens/5dfea5ad-169a-446a-9622-2e6b60cbf679 |
| 4 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-04-9f9ebc92-83ce-4ed8-8a48-fea45209abf3.webp` | https://mobbin.com/screens/9f9ebc92-83ce-4ed8-8a48-fea45209abf3 |
| 5 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-05-dd8084cb-73e3-419f-84e0-e038bbe9c1d0.webp` | https://mobbin.com/screens/dd8084cb-73e3-419f-84e0-e038bbe9c1d0 |
| 6 | `web/flows/adding-a-reminder/evernote-web-flow-adding-a-reminder-b5af58d3-06-26000e69-82cd-4335-9b46-dc35e3b5bcc3.webp` | https://mobbin.com/screens/26000e69-82cd-4335-9b46-dc35e3b5bcc3 |

### Adding a table — `adding-a-table/` — https://mobbin.com/flows/daf9cb67-7643-40e7-b314-5afdc2f43857

Actions: Adding & Creating, Editing & Updating. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-01-c5331ae9-8ed4-458c-84a3-a00c464e6379.webp` | https://mobbin.com/screens/c5331ae9-8ed4-458c-84a3-a00c464e6379 |
| 2 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-02-d74873aa-aaa2-419c-9d84-32f771e2c07e.webp` | https://mobbin.com/screens/d74873aa-aaa2-419c-9d84-32f771e2c07e |
| 3 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-03-f8e2997b-c104-4a26-b0ef-46a915795463.webp` | https://mobbin.com/screens/f8e2997b-c104-4a26-b0ef-46a915795463 |
| 4 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-04-6b9ada54-4cca-4ec9-9e3f-ee08966f63d0.webp` | https://mobbin.com/screens/6b9ada54-4cca-4ec9-9e3f-ee08966f63d0 |
| 5 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-05-1b4ffc06-cfde-40c2-8920-f482f53f2576.webp` | https://mobbin.com/screens/1b4ffc06-cfde-40c2-8920-f482f53f2576 |
| 6 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-06-52ee2b74-8ca1-4012-9463-7fcf6b38fbf9.webp` | https://mobbin.com/screens/52ee2b74-8ca1-4012-9463-7fcf6b38fbf9 |
| 7 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-07-0cc08b17-d100-44b1-9285-43b1dac4efab.webp` | https://mobbin.com/screens/0cc08b17-d100-44b1-9285-43b1dac4efab |
| 8 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-08-eeeac302-99d0-41ec-93af-eb2011b4c4e8.webp` | https://mobbin.com/screens/eeeac302-99d0-41ec-93af-eb2011b4c4e8 |
| 9 | `web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-09-ccc28baf-8888-42ce-bdb7-51220006fb54.webp` | https://mobbin.com/screens/ccc28baf-8888-42ce-bdb7-51220006fb54 |

### Adding a table of contents — `adding-a-table-of-contents/` — https://mobbin.com/flows/2520054c-acd6-4f35-bca9-80f2380b34df

Actions: Adding & Creating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-table-of-contents/evernote-web-flow-adding-a-table-of-contents-2520054c-01-52cf035f-7e0b-4f19-a3cf-935858c37ddb.webp` | https://mobbin.com/screens/52cf035f-7e0b-4f19-a3cf-935858c37ddb |
| 2 | `web/flows/adding-a-table-of-contents/evernote-web-flow-adding-a-table-of-contents-2520054c-02-b8a8a6ef-a6c6-4fbd-a0f7-c97aede509c0.webp` | https://mobbin.com/screens/b8a8a6ef-a6c6-4fbd-a0f7-c97aede509c0 |

### Adding a widget — `adding-a-widget/` — https://mobbin.com/flows/9bdcecae-c81d-4db2-aa29-835d6d8ffd47

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-a-widget/evernote-web-flow-adding-a-widget-9bdcecae-01-c75dbd76-b644-4b55-9a6b-6329c5b38dee.webp` | https://mobbin.com/screens/c75dbd76-b644-4b55-9a6b-6329c5b38dee |
| 2 | `web/flows/adding-a-widget/evernote-web-flow-adding-a-widget-9bdcecae-02-08cd25c6-738f-43b1-b578-1b38375d489c.webp` | https://mobbin.com/screens/08cd25c6-738f-43b1-b578-1b38375d489c |
| 3 | `web/flows/adding-a-widget/evernote-web-flow-adding-a-widget-9bdcecae-03-cb4a78d9-9824-4c42-b690-c5c60e2e6a01.webp` | https://mobbin.com/screens/cb4a78d9-9824-4c42-b690-c5c60e2e6a01 |
| 4 | `web/flows/adding-a-widget/evernote-web-flow-adding-a-widget-9bdcecae-04-c3ebaee2-159b-4cb8-96ff-856640b7a041.webp` | https://mobbin.com/screens/c3ebaee2-159b-4cb8-96ff-856640b7a041 |

### Adding an assignee — `adding-an-assignee/` — https://mobbin.com/flows/8838d3e1-b1a1-49cb-9476-db9776a01fb5

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-an-assignee/evernote-web-flow-adding-an-assignee-8838d3e1-01-bd4286fc-7056-4c42-b8f0-e80c9c4f7404.webp` | https://mobbin.com/screens/bd4286fc-7056-4c42-b8f0-e80c9c4f7404 |
| 2 | `web/flows/adding-an-assignee/evernote-web-flow-adding-an-assignee-8838d3e1-02-3f8029ef-feab-41e6-88ed-3e88e406d4c2.webp` | https://mobbin.com/screens/3f8029ef-feab-41e6-88ed-3e88e406d4c2 |
| 3 | `web/flows/adding-an-assignee/evernote-web-flow-adding-an-assignee-8838d3e1-03-42ef9a05-a860-4ddc-9e8c-a0a46c7b1d16.webp` | https://mobbin.com/screens/42ef9a05-a860-4ddc-9e8c-a0a46c7b1d16 |
| 4 | `web/flows/adding-an-assignee/evernote-web-flow-adding-an-assignee-8838d3e1-04-483677c8-86dc-4ac7-b5b7-647a6bf55c45.webp` | https://mobbin.com/screens/483677c8-86dc-4ac7-b5b7-647a6bf55c45 |
| 5 | `web/flows/adding-an-assignee/evernote-web-flow-adding-an-assignee-8838d3e1-05-8dad0afa-e959-4ded-8603-af97bae37c38.webp` | https://mobbin.com/screens/8dad0afa-e959-4ded-8603-af97bae37c38 |

### Adding an audio recording — `adding-an-audio-recording/` — https://mobbin.com/flows/1a42ca66-7916-4efd-a7ec-249410e0a608

Actions: Adding & Creating, Recording Audio & Video. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-01-6166c945-fbc3-420e-ba6a-9ff62d684726.webp` | https://mobbin.com/screens/6166c945-fbc3-420e-ba6a-9ff62d684726 |
| 2 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-02-75b91f65-f8a2-4b53-977f-5e6a02561997.webp` | https://mobbin.com/screens/75b91f65-f8a2-4b53-977f-5e6a02561997 |
| 3 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-03-6117a22f-7e58-4662-9200-28a9ec59f2ad.webp` | https://mobbin.com/screens/6117a22f-7e58-4662-9200-28a9ec59f2ad |
| 4 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-04-03f57b75-cb7b-41d3-8663-a578a9bd9215.webp` | https://mobbin.com/screens/03f57b75-cb7b-41d3-8663-a578a9bd9215 |
| 5 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-05-548ceade-dd4c-4414-a116-1f1a5ed97d00.webp` | https://mobbin.com/screens/548ceade-dd4c-4414-a116-1f1a5ed97d00 |
| 6 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-06-c54024f4-78d6-4147-a88b-aaede3cddf9e.webp` | https://mobbin.com/screens/c54024f4-78d6-4147-a88b-aaede3cddf9e |
| 7 | `web/flows/adding-an-audio-recording/evernote-web-flow-adding-an-audio-recording-1a42ca66-07-dce3fcd4-35bc-49c9-ae94-bc0e977a9da4.webp` | https://mobbin.com/screens/dce3fcd4-35bc-49c9-ae94-bc0e977a9da4 |

### Adding an image — `adding-an-image/` — https://mobbin.com/flows/f492555a-185f-4f07-8b1b-27a7b401f913

Actions: Adding & Creating, Uploading & Downloading. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f492555a-01-7a4bae9a-7442-4206-9d02-299201855bed.webp` | https://mobbin.com/screens/7a4bae9a-7442-4206-9d02-299201855bed |
| 2 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f492555a-02-1e588626-3448-4540-988f-c0aa5e22d32f.webp` | https://mobbin.com/screens/1e588626-3448-4540-988f-c0aa5e22d32f |
| 3 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f492555a-03-e7022bad-2418-42a1-b92c-917d2bad5ba2.webp` | https://mobbin.com/screens/e7022bad-2418-42a1-b92c-917d2bad5ba2 |

### Adding an image — `adding-an-image/` — https://mobbin.com/flows/f5c206e5-0745-4286-996e-281c9e624f45

Actions: Uploading & Downloading. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f5c206e5-01-9c19cc73-b67c-47b5-9a32-e7f2fcc17f23.webp` | https://mobbin.com/screens/9c19cc73-b67c-47b5-9a32-e7f2fcc17f23 |
| 2 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f5c206e5-02-70d4e685-8d70-4183-a182-175248bc76cf.webp` | https://mobbin.com/screens/70d4e685-8d70-4183-a182-175248bc76cf |
| 3 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f5c206e5-03-6166c945-fbc3-420e-ba6a-9ff62d684726.webp` | https://mobbin.com/screens/6166c945-fbc3-420e-ba6a-9ff62d684726 |
| 4 | `web/flows/adding-an-image/evernote-web-flow-adding-an-image-f5c206e5-04-2efbae8d-5003-4814-97a5-040c390e2cd0.webp` | https://mobbin.com/screens/2efbae8d-5003-4814-97a5-040c390e2cd0 |

### Adding checkboxes — `adding-checkboxes/` — https://mobbin.com/flows/a2064b69-97a8-496e-96a0-6a79fdbc4531

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-checkboxes/evernote-web-flow-adding-checkboxes-a2064b69-01-e7022bad-2418-42a1-b92c-917d2bad5ba2.webp` | https://mobbin.com/screens/e7022bad-2418-42a1-b92c-917d2bad5ba2 |
| 2 | `web/flows/adding-checkboxes/evernote-web-flow-adding-checkboxes-a2064b69-02-9f350615-7144-4e5d-a6de-afd370cdad29.webp` | https://mobbin.com/screens/9f350615-7144-4e5d-a6de-afd370cdad29 |
| 3 | `web/flows/adding-checkboxes/evernote-web-flow-adding-checkboxes-a2064b69-03-67c176b8-efab-414f-b72d-8b0fc858cb8f.webp` | https://mobbin.com/screens/67c176b8-efab-414f-b72d-8b0fc858cb8f |
| 4 | `web/flows/adding-checkboxes/evernote-web-flow-adding-checkboxes-a2064b69-04-f4ec7cab-b196-4274-93da-bc61b7aca341.webp` | https://mobbin.com/screens/f4ec7cab-b196-4274-93da-bc61b7aca341 |

### Adding checklists — `adding-checklists/` — https://mobbin.com/flows/e338da63-536f-4d99-b9f5-682ff47f7384

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-checklists/evernote-web-flow-adding-checklists-e338da63-01-ca42dd45-da3e-4a09-b2ba-36977e8d430b.webp` | https://mobbin.com/screens/ca42dd45-da3e-4a09-b2ba-36977e8d430b |
| 2 | `web/flows/adding-checklists/evernote-web-flow-adding-checklists-e338da63-02-d257b9b9-01d6-48aa-806e-d8074f03e013.webp` | https://mobbin.com/screens/d257b9b9-01d6-48aa-806e-d8074f03e013 |
| 3 | `web/flows/adding-checklists/evernote-web-flow-adding-checklists-e338da63-03-539f9350-8fe9-4436-af14-6261b34dc4a7.webp` | https://mobbin.com/screens/539f9350-8fe9-4436-af14-6261b34dc4a7 |

### Adding members — `adding-members/` — https://mobbin.com/flows/41fe38ed-8c84-4cb2-a8b8-3767c0aef16e

Actions: Inviting Teammates & Friends, Selecting & Choosing. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-01-a4a91a83-d254-4f19-b3b2-b6bd14142a6e.webp` | https://mobbin.com/screens/a4a91a83-d254-4f19-b3b2-b6bd14142a6e |
| 2 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-02-a6c30a9e-5239-4c1e-b693-ce2d2ebf7a22.webp` | https://mobbin.com/screens/a6c30a9e-5239-4c1e-b693-ce2d2ebf7a22 |
| 3 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-03-32fe5349-8ad8-4ec1-8375-f4f30f63ba16.webp` | https://mobbin.com/screens/32fe5349-8ad8-4ec1-8375-f4f30f63ba16 |
| 4 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-04-0279f78b-efa8-4d7c-a5d0-c436b0924527.webp` | https://mobbin.com/screens/0279f78b-efa8-4d7c-a5d0-c436b0924527 |
| 5 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-05-70d60462-2c7b-495d-b3f8-6b156c1f03d4.webp` | https://mobbin.com/screens/70d60462-2c7b-495d-b3f8-6b156c1f03d4 |
| 6 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-06-fcc31155-7e30-4894-832c-42bfbd0111ee.webp` | https://mobbin.com/screens/fcc31155-7e30-4894-832c-42bfbd0111ee |
| 7 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-07-8519037e-ee97-47bb-8627-1b5935c31a41.webp` | https://mobbin.com/screens/8519037e-ee97-47bb-8627-1b5935c31a41 |
| 8 | `web/flows/adding-members/evernote-web-flow-adding-members-41fe38ed-08-deb43a09-010b-47a2-b8e3-ecb69af1ef27.webp` | https://mobbin.com/screens/deb43a09-010b-47a2-b8e3-ecb69af1ef27 |

### Adding rows — `adding-rows/` — https://mobbin.com/flows/675ac7d9-8b01-44a2-9bb0-ffda772c7594

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-rows/evernote-web-flow-adding-rows-675ac7d9-01-ccc28baf-8888-42ce-bdb7-51220006fb54.webp` | https://mobbin.com/screens/ccc28baf-8888-42ce-bdb7-51220006fb54 |
| 2 | `web/flows/adding-rows/evernote-web-flow-adding-rows-675ac7d9-02-b5008980-92f0-4b27-932c-d799048bb2d7.webp` | https://mobbin.com/screens/b5008980-92f0-4b27-932c-d799048bb2d7 |
| 3 | `web/flows/adding-rows/evernote-web-flow-adding-rows-675ac7d9-03-5fa34fc6-167e-4c13-a9ad-d331c9a52e48.webp` | https://mobbin.com/screens/5fa34fc6-167e-4c13-a9ad-d331c9a52e48 |
| 4 | `web/flows/adding-rows/evernote-web-flow-adding-rows-675ac7d9-04-7a4bae9a-7442-4206-9d02-299201855bed.webp` | https://mobbin.com/screens/7a4bae9a-7442-4206-9d02-299201855bed |

### Adding tags — `adding-tags/` — https://mobbin.com/flows/47d235a6-cbec-4bcc-bed2-fbbcb32a9efb

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-tags/evernote-web-flow-adding-tags-47d235a6-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/adding-tags/evernote-web-flow-adding-tags-47d235a6-02-d054195a-1b90-475d-8897-d150995bf828.webp` | https://mobbin.com/screens/d054195a-1b90-475d-8897-d150995bf828 |
| 3 | `web/flows/adding-tags/evernote-web-flow-adding-tags-47d235a6-03-5c0c81e7-f20e-473b-b2a3-0c37283e5b74.webp` | https://mobbin.com/screens/5c0c81e7-f20e-473b-b2a3-0c37283e5b74 |
| 4 | `web/flows/adding-tags/evernote-web-flow-adding-tags-47d235a6-04-72a2a456-9ba1-4587-9b27-8d49f8d3c4cd.webp` | https://mobbin.com/screens/72a2a456-9ba1-4587-9b27-8d49f8d3c4cd |
| 5 | `web/flows/adding-tags/evernote-web-flow-adding-tags-47d235a6-05-1d12f869-91ba-49d8-80dc-bcc6d4f2a394.webp` | https://mobbin.com/screens/1d12f869-91ba-49d8-80dc-bcc6d4f2a394 |

### Adding to a shortcut — `adding-to-a-shortcut/` — https://mobbin.com/flows/50adfb21-9a99-40e4-ba6b-cd7251cfee20

Actions: Favoriting & Pinning. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-to-a-shortcut/evernote-web-flow-adding-to-a-shortcut-50adfb21-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/adding-to-a-shortcut/evernote-web-flow-adding-to-a-shortcut-50adfb21-02-bbacc3f5-731d-4591-8dd2-2ba6d92e4f5d.webp` | https://mobbin.com/screens/bbacc3f5-731d-4591-8dd2-2ba6d92e4f5d |

### Adding to shortcuts — `adding-to-shortcuts/` — https://mobbin.com/flows/66ddf3b8-d119-41d8-97f6-608f3443de5f

Actions: Adding & Creating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adding-to-shortcuts/evernote-web-flow-adding-to-shortcuts-66ddf3b8-01-ae4cc8ce-0c62-445d-8f00-b0102b643270.webp` | https://mobbin.com/screens/ae4cc8ce-0c62-445d-8f00-b0102b643270 |
| 2 | `web/flows/adding-to-shortcuts/evernote-web-flow-adding-to-shortcuts-66ddf3b8-02-a35a659d-5ac6-4f0d-9c57-fbb0e4a377b9.webp` | https://mobbin.com/screens/a35a659d-5ac6-4f0d-9c57-fbb0e4a377b9 |

### Adjusting widget size — `adjusting-widget-size/` — https://mobbin.com/flows/f5bc6876-ce26-43e0-9486-fa6b0d75d25f

Actions: Editing & Updating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/adjusting-widget-size/evernote-web-flow-adjusting-widget-size-f5bc6876-01-6c777016-fd5b-4df4-94f8-b4920a7177f8.webp` | https://mobbin.com/screens/6c777016-fd5b-4df4-94f8-b4920a7177f8 |
| 2 | `web/flows/adjusting-widget-size/evernote-web-flow-adjusting-widget-size-f5bc6876-02-bb4fe7ba-bfef-4ea1-9704-ed1deb223347.webp` | https://mobbin.com/screens/bb4fe7ba-bfef-4ea1-9704-ed1deb223347 |
| 3 | `web/flows/adjusting-widget-size/evernote-web-flow-adjusting-widget-size-f5bc6876-03-9519e19e-dcb4-4998-8b19-8198e6794d2f.webp` | https://mobbin.com/screens/9519e19e-dcb4-4998-8b19-8198e6794d2f |

### Admin console — `admin-console/` — https://mobbin.com/flows/8a8777ad-d138-43c7-b55d-4ae0c6ea650b

Actions: none listed. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-01-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |
| 2 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-02-c4364308-5c77-46bc-a8de-66379bf25eeb.webp` | https://mobbin.com/screens/c4364308-5c77-46bc-a8de-66379bf25eeb |
| 3 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-03-35775b74-f044-4649-8dd1-9f29c0670ea7.webp` | https://mobbin.com/screens/35775b74-f044-4649-8dd1-9f29c0670ea7 |
| 4 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-04-16983437-cec1-410f-abd1-bec4b495f0ec.webp` | https://mobbin.com/screens/16983437-cec1-410f-abd1-bec4b495f0ec |
| 5 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-05-6384a5c8-07ad-4df3-a68d-f9d315f9a108.webp` | https://mobbin.com/screens/6384a5c8-07ad-4df3-a68d-f9d315f9a108 |
| 6 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-06-72b16a91-d10d-46ca-8e45-504d2cf98510.webp` | https://mobbin.com/screens/72b16a91-d10d-46ca-8e45-504d2cf98510 |
| 7 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-07-d5d4d0f0-0242-4629-bf3c-71662adafdc5.webp` | https://mobbin.com/screens/d5d4d0f0-0242-4629-bf3c-71662adafdc5 |
| 8 | `web/flows/admin-console/evernote-web-flow-admin-console-8a8777ad-08-045b808f-7ea3-447a-ade0-2578fb28a0ee.webp` | https://mobbin.com/screens/045b808f-7ea3-447a-ade0-2578fb28a0ee |

### Admin Console — `admin-console/` — https://mobbin.com/flows/85a3303a-be55-479e-9297-6e72b14242e5

Actions: none listed. Screens: 12.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-02-3338d4e6-4a4f-4d02-8dd0-bc8f59549a89.webp` | https://mobbin.com/screens/3338d4e6-4a4f-4d02-8dd0-bc8f59549a89 |
| 3 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-03-60702d29-d42b-43c7-8b45-5141f872bf7f.webp` | https://mobbin.com/screens/60702d29-d42b-43c7-8b45-5141f872bf7f |
| 4 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-04-538d790a-0a24-4286-8247-5dc124d259aa.webp` | https://mobbin.com/screens/538d790a-0a24-4286-8247-5dc124d259aa |
| 5 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-05-8c42a1c7-73aa-4476-95aa-9961b1ae01d5.webp` | https://mobbin.com/screens/8c42a1c7-73aa-4476-95aa-9961b1ae01d5 |
| 6 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-06-02b4f0ad-6d7a-40aa-bb56-732403ad6514.webp` | https://mobbin.com/screens/02b4f0ad-6d7a-40aa-bb56-732403ad6514 |
| 7 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-07-a4a91a83-d254-4f19-b3b2-b6bd14142a6e.webp` | https://mobbin.com/screens/a4a91a83-d254-4f19-b3b2-b6bd14142a6e |
| 8 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-08-3391c319-2acf-4ca6-a77e-d8b96ddc3aa0.webp` | https://mobbin.com/screens/3391c319-2acf-4ca6-a77e-d8b96ddc3aa0 |
| 9 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-09-1e6da435-acec-4cb6-bc49-2fb982d6252f.webp` | https://mobbin.com/screens/1e6da435-acec-4cb6-bc49-2fb982d6252f |
| 10 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-10-22d848ea-d8ad-41fc-8201-ff151068862e.webp` | https://mobbin.com/screens/22d848ea-d8ad-41fc-8201-ff151068862e |
| 11 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-11-87d819df-ed76-4691-992d-ec33eb73b8fe.webp` | https://mobbin.com/screens/87d819df-ed76-4691-992d-ec33eb73b8fe |
| 12 | `web/flows/admin-console/evernote-web-flow-admin-console-85a3303a-12-bf922e5e-d65f-4814-9212-5cbe97621b32.webp` | https://mobbin.com/screens/bf922e5e-d65f-4814-9212-5cbe97621b32 |

### Calendar — `calendar/` — https://mobbin.com/flows/62d27540-75e2-4c92-a521-c0985d5b7051

Actions: none listed. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/calendar/evernote-web-flow-calendar-62d27540-01-a27b6418-2ca3-47fb-be65-4219ed5ee338.webp` | https://mobbin.com/screens/a27b6418-2ca3-47fb-be65-4219ed5ee338 |
| 2 | `web/flows/calendar/evernote-web-flow-calendar-62d27540-02-1573c383-18c9-4b7e-bac3-a2da94515410.webp` | https://mobbin.com/screens/1573c383-18c9-4b7e-bac3-a2da94515410 |
| 3 | `web/flows/calendar/evernote-web-flow-calendar-62d27540-03-ad6b83b8-577d-44dd-9402-d26f432e3f65.webp` | https://mobbin.com/screens/ad6b83b8-577d-44dd-9402-d26f432e3f65 |
| 4 | `web/flows/calendar/evernote-web-flow-calendar-62d27540-04-ced782fc-88ad-4bb3-88c9-1899f66794de.webp` | https://mobbin.com/screens/ced782fc-88ad-4bb3-88c9-1899f66794de |
| 5 | `web/flows/calendar/evernote-web-flow-calendar-62d27540-05-2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7.webp` | https://mobbin.com/screens/2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7 |

### Calendar — `calendar/` — https://mobbin.com/flows/8da6e7b4-7298-4b46-afb8-28ec118aae60

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/calendar/evernote-web-flow-calendar-8da6e7b4-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/calendar/evernote-web-flow-calendar-8da6e7b4-02-0cec75bf-1f35-4f90-a949-69103e579a7d.webp` | https://mobbin.com/screens/0cec75bf-1f35-4f90-a949-69103e579a7d |
| 3 | `web/flows/calendar/evernote-web-flow-calendar-8da6e7b4-03-d7192627-e674-4f73-ae71-1e1bc5fd75bf.webp` | https://mobbin.com/screens/d7192627-e674-4f73-ae71-1e1bc5fd75bf |
| 4 | `web/flows/calendar/evernote-web-flow-calendar-8da6e7b4-04-9a3a796a-93b4-4f59-9983-82cb43731f8a.webp` | https://mobbin.com/screens/9a3a796a-93b4-4f59-9983-82cb43731f8a |

### Changing billing period — `changing-billing-period/` — https://mobbin.com/flows/0a657418-3ce0-4533-b249-bd3925a7139b

Actions: Editing & Updating, Selecting & Choosing. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/changing-billing-period/evernote-web-flow-changing-billing-period-0a657418-01-d5d4d0f0-0242-4629-bf3c-71662adafdc5.webp` | https://mobbin.com/screens/d5d4d0f0-0242-4629-bf3c-71662adafdc5 |
| 2 | `web/flows/changing-billing-period/evernote-web-flow-changing-billing-period-0a657418-02-a326d25e-3f4d-4013-b45d-adaecff6e50b.webp` | https://mobbin.com/screens/a326d25e-3f4d-4013-b45d-adaecff6e50b |
| 3 | `web/flows/changing-billing-period/evernote-web-flow-changing-billing-period-0a657418-03-58e21de9-e2ee-4aa6-a3c9-df3a7652d05d.webp` | https://mobbin.com/screens/58e21de9-e2ee-4aa6-a3c9-df3a7652d05d |
| 4 | `web/flows/changing-billing-period/evernote-web-flow-changing-billing-period-0a657418-04-7e2fd493-8c6d-4183-8f49-812f6a0ff6c3.webp` | https://mobbin.com/screens/7e2fd493-8c6d-4183-8f49-812f6a0ff6c3 |
| 5 | `web/flows/changing-billing-period/evernote-web-flow-changing-billing-period-0a657418-05-9fa0de57-1fac-467f-80a8-a103127175d0.webp` | https://mobbin.com/screens/9fa0de57-1fac-467f-80a8-a103127175d0 |

### Changing language — `changing-language/` — https://mobbin.com/flows/d9656eec-71aa-425d-99cb-9274c550e493

Actions: Changing Language. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/changing-language/evernote-web-flow-changing-language-d9656eec-01-81a9d82d-db16-4ce7-9566-ff47e48c3427.webp` | https://mobbin.com/screens/81a9d82d-db16-4ce7-9566-ff47e48c3427 |
| 2 | `web/flows/changing-language/evernote-web-flow-changing-language-d9656eec-02-ff35a687-b6dd-4a31-b047-edfb7cec7d38.webp` | https://mobbin.com/screens/ff35a687-b6dd-4a31-b047-edfb7cec7d38 |
| 3 | `web/flows/changing-language/evernote-web-flow-changing-language-d9656eec-03-edc56608-8088-4ef1-b10b-a6dd1df111a8.webp` | https://mobbin.com/screens/edc56608-8088-4ef1-b10b-a6dd1df111a8 |

### Changing password — `changing-password/` — https://mobbin.com/flows/f0ceace9-99ad-4e8f-8635-fcec13203f7b

Actions: Editing Profile. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-01-9984d564-80cb-4af0-a45d-6957b6da59d3.webp` | https://mobbin.com/screens/9984d564-80cb-4af0-a45d-6957b6da59d3 |
| 2 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-02-d460accb-6d8d-46bc-94f9-0cc8a1e30217.webp` | https://mobbin.com/screens/d460accb-6d8d-46bc-94f9-0cc8a1e30217 |
| 3 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-03-56d187f3-ca21-499f-a819-090ad0353c90.webp` | https://mobbin.com/screens/56d187f3-ca21-499f-a819-090ad0353c90 |
| 4 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-04-614c1390-6958-4403-a9e7-cfbda7b408b9.webp` | https://mobbin.com/screens/614c1390-6958-4403-a9e7-cfbda7b408b9 |
| 5 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-05-ad28f3b3-e4e6-4c5c-aad3-c564bab446d9.webp` | https://mobbin.com/screens/ad28f3b3-e4e6-4c5c-aad3-c564bab446d9 |
| 6 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-06-f4afb60a-03f6-4cba-9515-30f8c83330dd.webp` | https://mobbin.com/screens/f4afb60a-03f6-4cba-9515-30f8c83330dd |
| 7 | `web/flows/changing-password/evernote-web-flow-changing-password-f0ceace9-07-8aff8891-8f9a-4f7b-970f-51d995094fe8.webp` | https://mobbin.com/screens/8aff8891-8f9a-4f7b-970f-51d995094fe8 |

### Collapsing sections — `collapsing-sections/` — https://mobbin.com/flows/38f7a568-336c-4c1b-a5cd-062c6a04ff3d

Actions: Editing & Updating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/collapsing-sections/evernote-web-flow-collapsing-sections-38f7a568-01-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |
| 2 | `web/flows/collapsing-sections/evernote-web-flow-collapsing-sections-38f7a568-02-71325103-7bd5-4d1d-ab79-2ac8a30ba328.webp` | https://mobbin.com/screens/71325103-7bd5-4d1d-ab79-2ac8a30ba328 |
| 3 | `web/flows/collapsing-sections/evernote-web-flow-collapsing-sections-38f7a568-03-fcdfe7dc-8f29-4492-a8ae-34c2975d48a0.webp` | https://mobbin.com/screens/fcdfe7dc-8f29-4492-a8ae-34c2975d48a0 |
| 4 | `web/flows/collapsing-sections/evernote-web-flow-collapsing-sections-38f7a568-04-303381c3-f607-4b36-a645-d205eb447e3a.webp` | https://mobbin.com/screens/303381c3-f607-4b36-a645-d205eb447e3a |
| 5 | `web/flows/collapsing-sections/evernote-web-flow-collapsing-sections-38f7a568-05-483834bf-8711-4bd6-97be-d3dc8463fa07.webp` | https://mobbin.com/screens/483834bf-8711-4bd6-97be-d3dc8463fa07 |

### Collapsing sidebar — `collapsing-sidebar/` — https://mobbin.com/flows/05cf8756-f184-409e-ac63-51fc9cc07c18

Actions: Showing & Hiding. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/collapsing-sidebar/evernote-web-flow-collapsing-sidebar-05cf8756-01-2ba55508-e5ad-449e-b51d-abb7826e08ab.webp` | https://mobbin.com/screens/2ba55508-e5ad-449e-b51d-abb7826e08ab |
| 2 | `web/flows/collapsing-sidebar/evernote-web-flow-collapsing-sidebar-05cf8756-02-cd18cfad-a4c4-4726-979b-264ce6e4dca3.webp` | https://mobbin.com/screens/cd18cfad-a4c4-4726-979b-264ce6e4dca3 |
| 3 | `web/flows/collapsing-sidebar/evernote-web-flow-collapsing-sidebar-05cf8756-03-ac1f47c6-356f-4f33-bf75-750a43b5a560.webp` | https://mobbin.com/screens/ac1f47c6-356f-4f33-bf75-750a43b5a560 |

### Completing onboarding setup — `completing-onboarding-setup/` — https://mobbin.com/flows/f770979f-3f4e-4d5b-9136-b604c40b7962

Actions: Adding & Creating, Connecting & Linking, Starting & Completing. Screens: 13.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-01-328c18a7-b565-41fe-b2a3-288dd7317b72.webp` | https://mobbin.com/screens/328c18a7-b565-41fe-b2a3-288dd7317b72 |
| 2 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-02-8a724040-c201-44f8-971e-c5cc6989cf88.webp` | https://mobbin.com/screens/8a724040-c201-44f8-971e-c5cc6989cf88 |
| 3 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-03-1331979d-27bc-4af3-839e-3825ac13a79b.webp` | https://mobbin.com/screens/1331979d-27bc-4af3-839e-3825ac13a79b |
| 4 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-04-8489bd64-8690-4a07-8e95-2fc8e1e8f857.webp` | https://mobbin.com/screens/8489bd64-8690-4a07-8e95-2fc8e1e8f857 |
| 5 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-05-a8f7b17d-e559-4a45-b643-3fde3209695b.webp` | https://mobbin.com/screens/a8f7b17d-e559-4a45-b643-3fde3209695b |
| 6 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-06-acde1181-0ee8-4ec3-a074-2bf3f24c310d.webp` | https://mobbin.com/screens/acde1181-0ee8-4ec3-a074-2bf3f24c310d |
| 7 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-07-f554cafc-821f-4d94-812e-79b45d712786.webp` | https://mobbin.com/screens/f554cafc-821f-4d94-812e-79b45d712786 |
| 8 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-08-87bb81a8-73e4-4c6e-9d79-2208e6307b01.webp` | https://mobbin.com/screens/87bb81a8-73e4-4c6e-9d79-2208e6307b01 |
| 9 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-09-87981a59-4f9d-40a7-8b2c-0c4724640f3f.webp` | https://mobbin.com/screens/87981a59-4f9d-40a7-8b2c-0c4724640f3f |
| 10 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-10-9d70fbed-d53f-4653-8421-f636d5a2d614.webp` | https://mobbin.com/screens/9d70fbed-d53f-4653-8421-f636d5a2d614 |
| 11 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-11-50f4408a-b8f8-4074-b9d2-65218699f335.webp` | https://mobbin.com/screens/50f4408a-b8f8-4074-b9d2-65218699f335 |
| 12 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-12-7de7b224-cd9e-4a81-a07e-6123f3f9dfaf.webp` | https://mobbin.com/screens/7de7b224-cd9e-4a81-a07e-6123f3f9dfaf |
| 13 | `web/flows/completing-onboarding-setup/evernote-web-flow-completing-onboarding-setup-f770979f-13-7196b9ff-3d4c-454a-9039-cbb885d842b3.webp` | https://mobbin.com/screens/7196b9ff-3d4c-454a-9039-cbb885d842b3 |

### Completing tutorials — `completing-tutorials/` — https://mobbin.com/flows/0c96fb02-15ba-4418-8497-ba9030367687

Actions: Browsing Tutorial, Starting & Completing. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-01-b3616b17-584e-4c5c-a6b3-047e16ed31ea.webp` | https://mobbin.com/screens/b3616b17-584e-4c5c-a6b3-047e16ed31ea |
| 2 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-02-e7846f13-a73b-4fb9-8df7-2548859aacc5.webp` | https://mobbin.com/screens/e7846f13-a73b-4fb9-8df7-2548859aacc5 |
| 3 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-03-18b46379-0ab2-4d75-8aac-760147e939f8.webp` | https://mobbin.com/screens/18b46379-0ab2-4d75-8aac-760147e939f8 |
| 4 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-04-a94405c2-6f62-4ce5-9d28-fe8fee1e79cc.webp` | https://mobbin.com/screens/a94405c2-6f62-4ce5-9d28-fe8fee1e79cc |
| 5 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-05-687efd94-348a-49ca-81d2-d3b032e6d285.webp` | https://mobbin.com/screens/687efd94-348a-49ca-81d2-d3b032e6d285 |
| 6 | `web/flows/completing-tutorials/evernote-web-flow-completing-tutorials-0c96fb02-06-59e1c7cf-8b0f-4253-ac8b-75374038d10e.webp` | https://mobbin.com/screens/59e1c7cf-8b0f-4253-ac8b-75374038d10e |

### Connecting a calendar — `connecting-a-calendar/` — https://mobbin.com/flows/366cec1f-f983-4901-8a01-59c179328655

Actions: Connecting & Linking, Selecting & Choosing. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-01-18a811f1-a55c-4e1a-890a-f4a698ee0d6e.webp` | https://mobbin.com/screens/18a811f1-a55c-4e1a-890a-f4a698ee0d6e |
| 2 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-02-d6d7db78-5922-4201-bc11-4dedc2f75dfa.webp` | https://mobbin.com/screens/d6d7db78-5922-4201-bc11-4dedc2f75dfa |
| 3 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-03-0d0eda3e-5462-4880-ab1e-5ab6eb508504.webp` | https://mobbin.com/screens/0d0eda3e-5462-4880-ab1e-5ab6eb508504 |
| 4 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-04-6acdb8c5-3f7d-421e-853a-d38286e7b8dd.webp` | https://mobbin.com/screens/6acdb8c5-3f7d-421e-853a-d38286e7b8dd |
| 5 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-05-66c096e8-93a4-40da-a08a-2673df81d4c6.webp` | https://mobbin.com/screens/66c096e8-93a4-40da-a08a-2673df81d4c6 |
| 6 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-366cec1f-06-e6c74c3f-f138-4b37-ab67-e3b344faf727.webp` | https://mobbin.com/screens/e6c74c3f-f138-4b37-ab67-e3b344faf727 |

### Connecting a calendar — `connecting-a-calendar/` — https://mobbin.com/flows/8d3c70b6-3275-4e15-8ab0-cc0a99f67a35

Actions: Connecting & Linking. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-8d3c70b6-01-d70e0cd7-28d7-49d2-9b1c-78cb4117f133.webp` | https://mobbin.com/screens/d70e0cd7-28d7-49d2-9b1c-78cb4117f133 |
| 2 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-8d3c70b6-02-2a202a6f-316b-4941-8aa8-cc1115316255.webp` | https://mobbin.com/screens/2a202a6f-316b-4941-8aa8-cc1115316255 |
| 3 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-8d3c70b6-03-9f2f06ed-667f-44c3-8f0e-92a316c84b65.webp` | https://mobbin.com/screens/9f2f06ed-667f-44c3-8f0e-92a316c84b65 |
| 4 | `web/flows/connecting-a-calendar/evernote-web-flow-connecting-a-calendar-8d3c70b6-04-54e5db27-6ba5-47c6-832d-89ebb95759b0.webp` | https://mobbin.com/screens/54e5db27-6ba5-47c6-832d-89ebb95759b0 |

### Copying a link — `copying-a-link/` — https://mobbin.com/flows/3286461a-a8ff-4a0b-b663-ce8783e229b6

Actions: Copying & Duplicating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/copying-a-link/evernote-web-flow-copying-a-link-3286461a-01-77fa5a50-18f0-47d9-8f33-4872207e9f99.webp` | https://mobbin.com/screens/77fa5a50-18f0-47d9-8f33-4872207e9f99 |
| 2 | `web/flows/copying-a-link/evernote-web-flow-copying-a-link-3286461a-02-645c5e57-d3e1-4cbd-b627-486338f37983.webp` | https://mobbin.com/screens/645c5e57-d3e1-4cbd-b627-486338f37983 |

### Copying a link — `copying-a-link/` — https://mobbin.com/flows/ee69cdc6-eca4-4e3b-a972-f19dcf81555b

Actions: Copying & Duplicating. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/copying-a-link/evernote-web-flow-copying-a-link-ee69cdc6-01-87fb79cd-d5dd-4017-a47b-653e73af33f9.webp` | https://mobbin.com/screens/87fb79cd-d5dd-4017-a47b-653e73af33f9 |
| 2 | `web/flows/copying-a-link/evernote-web-flow-copying-a-link-ee69cdc6-02-4a594a51-6d8e-4189-87e1-f444e2fe934f.webp` | https://mobbin.com/screens/4a594a51-6d8e-4189-87e1-f444e2fe934f |

### Creating a code block — `creating-a-code-block/` — https://mobbin.com/flows/62248325-a866-483d-b55f-0a608a9776b7

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-code-block/evernote-web-flow-creating-a-code-block-62248325-01-6166c945-fbc3-420e-ba6a-9ff62d684726.webp` | https://mobbin.com/screens/6166c945-fbc3-420e-ba6a-9ff62d684726 |
| 2 | `web/flows/creating-a-code-block/evernote-web-flow-creating-a-code-block-62248325-02-c7b6572c-6f44-4716-8d3f-602055f4d28b.webp` | https://mobbin.com/screens/c7b6572c-6f44-4716-8d3f-602055f4d28b |
| 3 | `web/flows/creating-a-code-block/evernote-web-flow-creating-a-code-block-62248325-03-a3863a29-e4f9-4ae7-9503-5af504f7cef9.webp` | https://mobbin.com/screens/a3863a29-e4f9-4ae7-9503-5af504f7cef9 |
| 4 | `web/flows/creating-a-code-block/evernote-web-flow-creating-a-code-block-62248325-04-3bb9a249-c3ac-4849-bfc3-2317dcb790c7.webp` | https://mobbin.com/screens/3bb9a249-c3ac-4849-bfc3-2317dcb790c7 |

### Creating a new notebook — `creating-a-new-notebook/` — https://mobbin.com/flows/ea4337a6-67d0-4714-846e-594a9510c1ce

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-new-notebook/evernote-web-flow-creating-a-new-notebook-ea4337a6-01-ac6391d7-21e6-486f-b612-68165dfe9c40.webp` | https://mobbin.com/screens/ac6391d7-21e6-486f-b612-68165dfe9c40 |
| 2 | `web/flows/creating-a-new-notebook/evernote-web-flow-creating-a-new-notebook-ea4337a6-02-87f4c927-3914-43c7-9ba8-731330751163.webp` | https://mobbin.com/screens/87f4c927-3914-43c7-9ba8-731330751163 |
| 3 | `web/flows/creating-a-new-notebook/evernote-web-flow-creating-a-new-notebook-ea4337a6-03-4acc8791-1b98-451d-953c-dc98ad773e12.webp` | https://mobbin.com/screens/4acc8791-1b98-451d-953c-dc98ad773e12 |
| 4 | `web/flows/creating-a-new-notebook/evernote-web-flow-creating-a-new-notebook-ea4337a6-04-9d0c44d4-8cdd-40a0-950d-d599a514f198.webp` | https://mobbin.com/screens/9d0c44d4-8cdd-40a0-950d-d599a514f198 |

### Creating a new task — `creating-a-new-task/` — https://mobbin.com/flows/44785bd2-47e3-4786-8ca3-26631e33e06d

Actions: Adding & Creating, Scheduling, Selecting & Choosing. Screens: 11.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-02-f21cfe35-3431-480c-baa2-421c5858df47.webp` | https://mobbin.com/screens/f21cfe35-3431-480c-baa2-421c5858df47 |
| 3 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-03-5b0ee9a6-f98a-4642-938b-06f30182eb20.webp` | https://mobbin.com/screens/5b0ee9a6-f98a-4642-938b-06f30182eb20 |
| 4 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-04-bafa96f4-6f74-4ab7-a328-704729737b51.webp` | https://mobbin.com/screens/bafa96f4-6f74-4ab7-a328-704729737b51 |
| 5 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-05-f63b80d8-55cc-44db-a32c-b6481a361120.webp` | https://mobbin.com/screens/f63b80d8-55cc-44db-a32c-b6481a361120 |
| 6 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-06-bd4286fc-7056-4c42-b8f0-e80c9c4f7404.webp` | https://mobbin.com/screens/bd4286fc-7056-4c42-b8f0-e80c9c4f7404 |
| 7 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-07-8dad0afa-e959-4ded-8603-af97bae37c38.webp` | https://mobbin.com/screens/8dad0afa-e959-4ded-8603-af97bae37c38 |
| 8 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-08-ef86a260-b8e3-4ec5-845d-26f60b17d7db.webp` | https://mobbin.com/screens/ef86a260-b8e3-4ec5-845d-26f60b17d7db |
| 9 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-09-430772eb-2eca-41ed-8d24-b7eba2dbe5ff.webp` | https://mobbin.com/screens/430772eb-2eca-41ed-8d24-b7eba2dbe5ff |
| 10 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-10-ad3c11f7-b7b1-499c-96ab-17924d9eef6c.webp` | https://mobbin.com/screens/ad3c11f7-b7b1-499c-96ab-17924d9eef6c |
| 11 | `web/flows/creating-a-new-task/evernote-web-flow-creating-a-new-task-44785bd2-11-affdf76d-3837-4e2a-ad68-d35a6462dde8.webp` | https://mobbin.com/screens/affdf76d-3837-4e2a-ad68-d35a6462dde8 |

### Creating a note — `creating-a-note/` — https://mobbin.com/flows/d5002d2b-a54a-4363-b9ab-7ff806b77cf3

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-d5002d2b-01-7196b9ff-3d4c-454a-9039-cbb885d842b3.webp` | https://mobbin.com/screens/7196b9ff-3d4c-454a-9039-cbb885d842b3 |
| 2 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-d5002d2b-02-8bb60f10-a672-4432-a967-19271f8f5323.webp` | https://mobbin.com/screens/8bb60f10-a672-4432-a967-19271f8f5323 |
| 3 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-d5002d2b-03-8c2f2501-bc53-40a7-af5c-1d7dc3ef682b.webp` | https://mobbin.com/screens/8c2f2501-bc53-40a7-af5c-1d7dc3ef682b |
| 4 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-d5002d2b-04-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |

### Creating a note — `creating-a-note/` — https://mobbin.com/flows/f6c8e2cc-0632-4593-86ee-76aeede6949c

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-f6c8e2cc-01-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |
| 2 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-f6c8e2cc-02-5f14b3d8-b79e-450e-b43c-5c92946fb9d3.webp` | https://mobbin.com/screens/5f14b3d8-b79e-450e-b43c-5c92946fb9d3 |
| 3 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-f6c8e2cc-03-34175bab-dcdf-4006-9ba5-50cbd2373713.webp` | https://mobbin.com/screens/34175bab-dcdf-4006-9ba5-50cbd2373713 |
| 4 | `web/flows/creating-a-note/evernote-web-flow-creating-a-note-f6c8e2cc-04-e4edd516-70cd-436c-86e2-22d3c88aeec1.webp` | https://mobbin.com/screens/e4edd516-70cd-436c-86e2-22d3c88aeec1 |

### Creating a note (from calendar) — `creating-a-note-from-calendar/` — https://mobbin.com/flows/512e6dae-ea26-4d2d-9179-8ad29ae04a9d

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-note-from-calendar/evernote-web-flow-creating-a-note-from-calendar-512e6dae-01-2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7.webp` | https://mobbin.com/screens/2bd710ff-3fe9-4ba5-a346-5f07ae08e3d7 |
| 2 | `web/flows/creating-a-note-from-calendar/evernote-web-flow-creating-a-note-from-calendar-512e6dae-02-4980ad2d-e776-4a4a-ab13-8efd2e1049dc.webp` | https://mobbin.com/screens/4980ad2d-e776-4a4a-ab13-8efd2e1049dc |
| 3 | `web/flows/creating-a-note-from-calendar/evernote-web-flow-creating-a-note-from-calendar-512e6dae-03-dc966fc4-3166-49c2-a0dc-4f050baf2d53.webp` | https://mobbin.com/screens/dc966fc4-3166-49c2-a0dc-4f050baf2d53 |
| 4 | `web/flows/creating-a-note-from-calendar/evernote-web-flow-creating-a-note-from-calendar-512e6dae-04-f5df5f1b-94a3-43c9-a33b-ab9dd69cfe02.webp` | https://mobbin.com/screens/f5df5f1b-94a3-43c9-a33b-ab9dd69cfe02 |

### Creating a note with a template — `creating-a-note-with-a-template/` — https://mobbin.com/flows/0476c16e-1fc4-46f1-8a39-d8792d3f1bb1

Actions: Adding & Creating, Selecting & Choosing. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-note-with-a-template/evernote-web-flow-creating-a-note-with-a-template-0476c16e-01-4daed96d-34a0-4bd5-9f04-4b9b735d9152.webp` | https://mobbin.com/screens/4daed96d-34a0-4bd5-9f04-4b9b735d9152 |
| 2 | `web/flows/creating-a-note-with-a-template/evernote-web-flow-creating-a-note-with-a-template-0476c16e-02-78342f98-a7a1-4d22-9bf5-a9d30aa3f742.webp` | https://mobbin.com/screens/78342f98-a7a1-4d22-9bf5-a9d30aa3f742 |
| 3 | `web/flows/creating-a-note-with-a-template/evernote-web-flow-creating-a-note-with-a-template-0476c16e-03-a845efcd-6f99-4cd2-855b-ef2d750b8493.webp` | https://mobbin.com/screens/a845efcd-6f99-4cd2-855b-ef2d750b8493 |
| 4 | `web/flows/creating-a-note-with-a-template/evernote-web-flow-creating-a-note-with-a-template-0476c16e-04-838a9cb3-ce07-4e15-a25d-9e6cdf0dc790.webp` | https://mobbin.com/screens/838a9cb3-ce07-4e15-a25d-9e6cdf0dc790 |
| 5 | `web/flows/creating-a-note-with-a-template/evernote-web-flow-creating-a-note-with-a-template-0476c16e-05-ddac6d88-fa48-41f4-bd1f-4611629e3879.webp` | https://mobbin.com/screens/ddac6d88-fa48-41f4-bd1f-4611629e3879 |

### Creating a notebook — `creating-a-notebook/` — https://mobbin.com/flows/c430456f-72a0-4fda-9406-26455875b40b

Actions: Adding & Creating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-notebook/evernote-web-flow-creating-a-notebook-c430456f-01-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |
| 2 | `web/flows/creating-a-notebook/evernote-web-flow-creating-a-notebook-c430456f-02-d400917a-a8cf-4caa-a1ca-958248324b3e.webp` | https://mobbin.com/screens/d400917a-a8cf-4caa-a1ca-958248324b3e |
| 3 | `web/flows/creating-a-notebook/evernote-web-flow-creating-a-notebook-c430456f-03-789c0e08-d99f-4458-816c-12252fadf1e5.webp` | https://mobbin.com/screens/789c0e08-d99f-4458-816c-12252fadf1e5 |
| 4 | `web/flows/creating-a-notebook/evernote-web-flow-creating-a-notebook-c430456f-04-24b13fa5-268c-4a37-9ea4-cd9c143f3746.webp` | https://mobbin.com/screens/24b13fa5-268c-4a37-9ea4-cd9c143f3746 |
| 5 | `web/flows/creating-a-notebook/evernote-web-flow-creating-a-notebook-c430456f-05-c33b4142-9913-4f2d-99f7-247d2530c4c1.webp` | https://mobbin.com/screens/c33b4142-9913-4f2d-99f7-247d2530c4c1 |

### Creating a sketch — `creating-a-sketch/` — https://mobbin.com/flows/1721402d-fd9e-498e-9644-38e5d6becde1

Actions: Adding & Creating, Drawing. Screens: 11.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-01-6166c945-fbc3-420e-ba6a-9ff62d684726.webp` | https://mobbin.com/screens/6166c945-fbc3-420e-ba6a-9ff62d684726 |
| 2 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-02-4640a646-8c8c-41cd-aeb0-8febd53b945d.webp` | https://mobbin.com/screens/4640a646-8c8c-41cd-aeb0-8febd53b945d |
| 3 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-03-161599a7-8a61-42fb-a356-6d20908cea8e.webp` | https://mobbin.com/screens/161599a7-8a61-42fb-a356-6d20908cea8e |
| 4 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-04-74a506f0-6682-4081-b36f-05b5c0592719.webp` | https://mobbin.com/screens/74a506f0-6682-4081-b36f-05b5c0592719 |
| 5 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-05-897fd7d4-2842-4bc2-a30f-fa4f1c1ab4d6.webp` | https://mobbin.com/screens/897fd7d4-2842-4bc2-a30f-fa4f1c1ab4d6 |
| 6 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-06-9f85583c-5e98-4249-9ce5-c99e292fa208.webp` | https://mobbin.com/screens/9f85583c-5e98-4249-9ce5-c99e292fa208 |
| 7 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-07-a754fcdb-287e-46ef-9fa2-ae4994585ac6.webp` | https://mobbin.com/screens/a754fcdb-287e-46ef-9fa2-ae4994585ac6 |
| 8 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-08-6dd14160-6986-49b9-a151-3f9584905c36.webp` | https://mobbin.com/screens/6dd14160-6986-49b9-a151-3f9584905c36 |
| 9 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-09-d8b52b8b-0306-4fe8-a991-867cf3b54488.webp` | https://mobbin.com/screens/d8b52b8b-0306-4fe8-a991-867cf3b54488 |
| 10 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-10-2fa7bfb4-cd72-441d-9057-dbd7fe82fb6a.webp` | https://mobbin.com/screens/2fa7bfb4-cd72-441d-9057-dbd7fe82fb6a |
| 11 | `web/flows/creating-a-sketch/evernote-web-flow-creating-a-sketch-1721402d-11-c0584b54-fc71-4a8e-ba7e-642603ffe45b.webp` | https://mobbin.com/screens/c0584b54-fc71-4a8e-ba7e-642603ffe45b |

### Creating a sketch note — `creating-a-sketch-note/` — https://mobbin.com/flows/ec08729d-04a4-4e2b-ab0c-eca7e28295d3

Actions: Adding & Creating, Drawing. Screens: 11.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-01-87f32f00-6481-4768-9399-70e352d573c3.webp` | https://mobbin.com/screens/87f32f00-6481-4768-9399-70e352d573c3 |
| 2 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-02-8a4ec681-c6df-48fc-846c-503098550512.webp` | https://mobbin.com/screens/8a4ec681-c6df-48fc-846c-503098550512 |
| 3 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-03-d4b045d0-a73f-4deb-9469-5511f91c8705.webp` | https://mobbin.com/screens/d4b045d0-a73f-4deb-9469-5511f91c8705 |
| 4 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-04-2c010e60-eb42-4414-a79b-bbd8ef9e3958.webp` | https://mobbin.com/screens/2c010e60-eb42-4414-a79b-bbd8ef9e3958 |
| 5 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-05-df450302-5926-4e44-b90c-1a3031482d6f.webp` | https://mobbin.com/screens/df450302-5926-4e44-b90c-1a3031482d6f |
| 6 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-06-a01547f3-d0d0-40a5-9d95-44b7d89b3445.webp` | https://mobbin.com/screens/a01547f3-d0d0-40a5-9d95-44b7d89b3445 |
| 7 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-07-919884ac-e641-458b-ac19-3c649a69b046.webp` | https://mobbin.com/screens/919884ac-e641-458b-ac19-3c649a69b046 |
| 8 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-08-218649fa-e13e-4d3c-ae86-a8b95c00aec8.webp` | https://mobbin.com/screens/218649fa-e13e-4d3c-ae86-a8b95c00aec8 |
| 9 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-09-e0a36aa9-6e01-46c7-a865-6691bef8c354.webp` | https://mobbin.com/screens/e0a36aa9-6e01-46c7-a865-6691bef8c354 |
| 10 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-10-07a8b469-971e-4cc3-9bd3-51b94255be56.webp` | https://mobbin.com/screens/07a8b469-971e-4cc3-9bd3-51b94255be56 |
| 11 | `web/flows/creating-a-sketch-note/evernote-web-flow-creating-a-sketch-note-ec08729d-11-864d8656-9d1f-4812-9961-c3bfbe35fc32.webp` | https://mobbin.com/screens/864d8656-9d1f-4812-9961-c3bfbe35fc32 |

### Creating a space — `creating-a-space/` — https://mobbin.com/flows/00ad6f36-8c09-49b6-aa6e-c14a9223a3a5

Actions: Adding & Creating. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-01-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |
| 2 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-02-a718fe36-22aa-4251-8f39-a70aed1fea64.webp` | https://mobbin.com/screens/a718fe36-22aa-4251-8f39-a70aed1fea64 |
| 3 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-03-e612afb7-dc1c-4598-a8e0-de06203258fd.webp` | https://mobbin.com/screens/e612afb7-dc1c-4598-a8e0-de06203258fd |
| 4 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-04-4a4edb58-3b31-43f2-8ef8-3f43c7e3f8de.webp` | https://mobbin.com/screens/4a4edb58-3b31-43f2-8ef8-3f43c7e3f8de |
| 5 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-05-be0e3e26-5a6b-4abd-99f1-1b87bfa45b60.webp` | https://mobbin.com/screens/be0e3e26-5a6b-4abd-99f1-1b87bfa45b60 |
| 6 | `web/flows/creating-a-space/evernote-web-flow-creating-a-space-00ad6f36-06-c723a6bd-6b0b-4b25-a938-76bb2d2b61c6.webp` | https://mobbin.com/screens/c723a6bd-6b0b-4b25-a938-76bb2d2b61c6 |

### Creating a table — `creating-a-table/` — https://mobbin.com/flows/66ef6ee6-eee5-4a39-9a7e-d5c1253bcc19

Actions: Adding & Creating. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-01-52cf035f-7e0b-4f19-a3cf-935858c37ddb.webp` | https://mobbin.com/screens/52cf035f-7e0b-4f19-a3cf-935858c37ddb |
| 2 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-02-c4caf941-823b-47ca-8f0c-b410015b6629.webp` | https://mobbin.com/screens/c4caf941-823b-47ca-8f0c-b410015b6629 |
| 3 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-03-d9b96113-1f32-486d-9235-23ed5551de6b.webp` | https://mobbin.com/screens/d9b96113-1f32-486d-9235-23ed5551de6b |
| 4 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-04-42cea32b-67f0-4203-828d-b692f6107af2.webp` | https://mobbin.com/screens/42cea32b-67f0-4203-828d-b692f6107af2 |
| 5 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-05-b3987124-39eb-4dec-b39d-53c58679c820.webp` | https://mobbin.com/screens/b3987124-39eb-4dec-b39d-53c58679c820 |
| 6 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-06-2aab3f65-690e-4fe7-9e42-a00a98d0eabc.webp` | https://mobbin.com/screens/2aab3f65-690e-4fe7-9e42-a00a98d0eabc |
| 7 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-07-a9dea261-9199-4fa7-b68b-2f965db3c12d.webp` | https://mobbin.com/screens/a9dea261-9199-4fa7-b68b-2f965db3c12d |
| 8 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-08-3589964f-5222-4721-a65e-88a8508a0077.webp` | https://mobbin.com/screens/3589964f-5222-4721-a65e-88a8508a0077 |
| 9 | `web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-09-9c19cc73-b67c-47b5-9a32-e7f2fcc17f23.webp` | https://mobbin.com/screens/9c19cc73-b67c-47b5-9a32-e7f2fcc17f23 |

### Creating a task — `creating-a-task/` — https://mobbin.com/flows/635887f9-c210-4e3d-9e4f-e3c13eb78c5d

Actions: Adding & Creating, Scheduling. Screens: 13.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-01-c0772487-21c1-459e-b767-4fef25431f28.webp` | https://mobbin.com/screens/c0772487-21c1-459e-b767-4fef25431f28 |
| 2 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-02-1ba09170-6a2f-4f09-895f-aae2d85fd6bd.webp` | https://mobbin.com/screens/1ba09170-6a2f-4f09-895f-aae2d85fd6bd |
| 3 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-03-cf344639-a443-407c-8b47-178332c10d4d.webp` | https://mobbin.com/screens/cf344639-a443-407c-8b47-178332c10d4d |
| 4 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-04-1e1829db-2576-4ead-8c8f-49bb4d479b0c.webp` | https://mobbin.com/screens/1e1829db-2576-4ead-8c8f-49bb4d479b0c |
| 5 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-05-1b58fd4b-872a-44c2-a863-0e1ebcb9b6e5.webp` | https://mobbin.com/screens/1b58fd4b-872a-44c2-a863-0e1ebcb9b6e5 |
| 6 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-06-0dc17caa-0c61-466d-85fa-d91f6be0d857.webp` | https://mobbin.com/screens/0dc17caa-0c61-466d-85fa-d91f6be0d857 |
| 7 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-07-04b7cff5-cb2c-4be9-b8c8-bcab0a66e84d.webp` | https://mobbin.com/screens/04b7cff5-cb2c-4be9-b8c8-bcab0a66e84d |
| 8 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-08-b99caf91-7dd7-4626-aa3e-5e5c5b175768.webp` | https://mobbin.com/screens/b99caf91-7dd7-4626-aa3e-5e5c5b175768 |
| 9 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-09-28229565-83b7-4b85-a639-841fbb4ace17.webp` | https://mobbin.com/screens/28229565-83b7-4b85-a639-841fbb4ace17 |
| 10 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-10-78c71a8d-1499-4286-a499-07f0d02d7e2b.webp` | https://mobbin.com/screens/78c71a8d-1499-4286-a499-07f0d02d7e2b |
| 11 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-11-ecab15a6-5c3e-4be7-af9e-a3e2aa2938d6.webp` | https://mobbin.com/screens/ecab15a6-5c3e-4be7-af9e-a3e2aa2938d6 |
| 12 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-12-247536a9-a77c-4d0a-b19f-502d8821cb7b.webp` | https://mobbin.com/screens/247536a9-a77c-4d0a-b19f-502d8821cb7b |
| 13 | `web/flows/creating-a-task/evernote-web-flow-creating-a-task-635887f9-13-326c6ae4-2ab9-4bb0-99ad-86a28c6fae8c.webp` | https://mobbin.com/screens/326c6ae4-2ab9-4bb0-99ad-86a28c6fae8c |

### Creating an audio note — `creating-an-audio-note/` — https://mobbin.com/flows/faea5da2-a365-4537-af32-3c54d42ec108

Actions: Adding & Creating, Recording Audio & Video. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-an-audio-note/evernote-web-flow-creating-an-audio-note-faea5da2-01-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |
| 2 | `web/flows/creating-an-audio-note/evernote-web-flow-creating-an-audio-note-faea5da2-02-87f32f00-6481-4768-9399-70e352d573c3.webp` | https://mobbin.com/screens/87f32f00-6481-4768-9399-70e352d573c3 |
| 3 | `web/flows/creating-an-audio-note/evernote-web-flow-creating-an-audio-note-faea5da2-03-06053647-4160-401b-b1b3-5c7725196235.webp` | https://mobbin.com/screens/06053647-4160-401b-b1b3-5c7725196235 |
| 4 | `web/flows/creating-an-audio-note/evernote-web-flow-creating-an-audio-note-faea5da2-04-6845fbff-61a4-4c53-8c1b-b14867a9332d.webp` | https://mobbin.com/screens/6845fbff-61a4-4c53-8c1b-b14867a9332d |
| 5 | `web/flows/creating-an-audio-note/evernote-web-flow-creating-an-audio-note-faea5da2-05-913be96c-f62b-4baf-bb75-d28b27a580d9.webp` | https://mobbin.com/screens/913be96c-f62b-4baf-bb75-d28b27a580d9 |

### Creating an automatic daily note — `creating-an-automatic-daily-note/` — https://mobbin.com/flows/8de3eb9a-42b7-4faf-a71a-c5f088a98af3

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-an-automatic-daily-note/evernote-web-flow-creating-an-automatic-daily-note-8de3eb9a-01-0f834439-6ead-40e8-8311-49e45a4076e1.webp` | https://mobbin.com/screens/0f834439-6ead-40e8-8311-49e45a4076e1 |
| 2 | `web/flows/creating-an-automatic-daily-note/evernote-web-flow-creating-an-automatic-daily-note-8de3eb9a-02-9e1620b3-5571-43fc-a984-b9b3adef6b8e.webp` | https://mobbin.com/screens/9e1620b3-5571-43fc-a984-b9b3adef6b8e |
| 3 | `web/flows/creating-an-automatic-daily-note/evernote-web-flow-creating-an-automatic-daily-note-8de3eb9a-03-f7fef1aa-c4d9-4eb1-a952-41055cfbac2f.webp` | https://mobbin.com/screens/f7fef1aa-c4d9-4eb1-a952-41055cfbac2f |
| 4 | `web/flows/creating-an-automatic-daily-note/evernote-web-flow-creating-an-automatic-daily-note-8de3eb9a-04-e487bb51-e012-40c8-a59f-cea914ef04c9.webp` | https://mobbin.com/screens/e487bb51-e012-40c8-a59f-cea914ef04c9 |

### Creating an event — `creating-an-event/` — https://mobbin.com/flows/58147c7a-431b-47e2-8827-df2a7b7a9f8b

Actions: Adding & Creating, Scheduling. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-02-03bc6d5b-f8af-4072-a609-be44842983ae.webp` | https://mobbin.com/screens/03bc6d5b-f8af-4072-a609-be44842983ae |
| 3 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-03-d47f2b23-fe26-4a74-8a5d-d00b560c4791.webp` | https://mobbin.com/screens/d47f2b23-fe26-4a74-8a5d-d00b560c4791 |
| 4 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-04-ef8052f5-8bc1-4eea-8063-d9da415d3f96.webp` | https://mobbin.com/screens/ef8052f5-8bc1-4eea-8063-d9da415d3f96 |
| 5 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-05-b108e8ea-d301-471b-9d1f-6a55e149a92c.webp` | https://mobbin.com/screens/b108e8ea-d301-471b-9d1f-6a55e149a92c |
| 6 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-06-f579c3de-a6e1-4a1b-bcf0-5442cdacc537.webp` | https://mobbin.com/screens/f579c3de-a6e1-4a1b-bcf0-5442cdacc537 |
| 7 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-07-463f2ff2-f59c-4897-a4ef-562120b8ed37.webp` | https://mobbin.com/screens/463f2ff2-f59c-4897-a4ef-562120b8ed37 |
| 8 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-08-cc4b510a-7a7a-4176-9e13-189b7e146f1d.webp` | https://mobbin.com/screens/cc4b510a-7a7a-4176-9e13-189b7e146f1d |
| 9 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-58147c7a-09-3f7fd924-9180-480b-8cf7-539a35531134.webp` | https://mobbin.com/screens/3f7fd924-9180-480b-8cf7-539a35531134 |

### Creating an event — `creating-an-event/` — https://mobbin.com/flows/fdd114bc-e7a7-4318-89c4-d40684961e77

Actions: Scheduling. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-fdd114bc-01-c0772487-21c1-459e-b767-4fef25431f28.webp` | https://mobbin.com/screens/c0772487-21c1-459e-b767-4fef25431f28 |
| 2 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-fdd114bc-02-0e52d2c4-e234-4d63-8bb9-cb9e811ff2bc.webp` | https://mobbin.com/screens/0e52d2c4-e234-4d63-8bb9-cb9e811ff2bc |
| 3 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-fdd114bc-03-5a684010-f122-40e8-8e0a-443dbaca295a.webp` | https://mobbin.com/screens/5a684010-f122-40e8-8e0a-443dbaca295a |
| 4 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-fdd114bc-04-29573de3-732d-4744-84ad-b4846b8f1909.webp` | https://mobbin.com/screens/29573de3-732d-4744-84ad-b4846b8f1909 |
| 5 | `web/flows/creating-an-event/evernote-web-flow-creating-an-event-fdd114bc-05-68143775-c815-4aa9-a884-2040a40c3164.webp` | https://mobbin.com/screens/68143775-c815-4aa9-a884-2040a40c3164 |

### Customizing a homepage — `customizing-a-homepage/` — https://mobbin.com/flows/71d691df-8ea0-4ecb-94d8-56545362e369

Actions: Editing & Updating. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-02-6c777016-fd5b-4df4-94f8-b4920a7177f8.webp` | https://mobbin.com/screens/6c777016-fd5b-4df4-94f8-b4920a7177f8 |
| 3 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-03-34eac6fa-2f24-40c8-a504-4b779fd8d7b2.webp` | https://mobbin.com/screens/34eac6fa-2f24-40c8-a504-4b779fd8d7b2 |
| 4 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-04-98183260-c6df-414c-830d-19948f6a4979.webp` | https://mobbin.com/screens/98183260-c6df-414c-830d-19948f6a4979 |
| 5 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-05-9b78ae5a-9dc9-48af-8d3f-cef371883196.webp` | https://mobbin.com/screens/9b78ae5a-9dc9-48af-8d3f-cef371883196 |
| 6 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-06-c75dbd76-b644-4b55-9a6b-6329c5b38dee.webp` | https://mobbin.com/screens/c75dbd76-b644-4b55-9a6b-6329c5b38dee |
| 7 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-07-12c377e3-f368-4461-8e4e-48a2a943b823.webp` | https://mobbin.com/screens/12c377e3-f368-4461-8e4e-48a2a943b823 |
| 8 | `web/flows/customizing-a-homepage/evernote-web-flow-customizing-a-homepage-71d691df-08-a64e314a-658c-4b1b-8ea3-8e99be80feda.webp` | https://mobbin.com/screens/a64e314a-658c-4b1b-8ea3-8e99be80feda |

### Customizing home — `customizing-home/` — https://mobbin.com/flows/416cd56e-92e5-46b6-bba7-e10aa67fc125

Actions: Editing & Updating, Uploading & Downloading. Screens: 11.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-01-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |
| 2 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-02-2a3fb526-eb25-4ab3-a68b-80a05a9d6e4e.webp` | https://mobbin.com/screens/2a3fb526-eb25-4ab3-a68b-80a05a9d6e4e |
| 3 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-03-e677275f-cd37-4fbc-a6f2-dc6278172afd.webp` | https://mobbin.com/screens/e677275f-cd37-4fbc-a6f2-dc6278172afd |
| 4 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-04-deb0163e-108f-476c-9862-f78886e0d968.webp` | https://mobbin.com/screens/deb0163e-108f-476c-9862-f78886e0d968 |
| 5 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-05-8236eb21-8de5-4cce-bee1-7466d84889cc.webp` | https://mobbin.com/screens/8236eb21-8de5-4cce-bee1-7466d84889cc |
| 6 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-06-3ea83046-1b68-4885-966c-5fc92c382f53.webp` | https://mobbin.com/screens/3ea83046-1b68-4885-966c-5fc92c382f53 |
| 7 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-07-9c5ec7ef-9412-4ba1-a3ff-aa3a4987ba1c.webp` | https://mobbin.com/screens/9c5ec7ef-9412-4ba1-a3ff-aa3a4987ba1c |
| 8 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-08-7b021290-b781-4253-b950-596a2fb53dbb.webp` | https://mobbin.com/screens/7b021290-b781-4253-b950-596a2fb53dbb |
| 9 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-09-12902c98-8505-444f-a11f-a9028586d61a.webp` | https://mobbin.com/screens/12902c98-8505-444f-a11f-a9028586d61a |
| 10 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-10-81b51f09-5bac-4518-a5be-8af9461d4f21.webp` | https://mobbin.com/screens/81b51f09-5bac-4518-a5be-8af9461d4f21 |
| 11 | `web/flows/customizing-home/evernote-web-flow-customizing-home-416cd56e-11-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |

### Customizing sidebar menus — `customizing-sidebar-menus/` — https://mobbin.com/flows/f6f851b2-f360-4e13-90e2-4d0c6af605f6

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/customizing-sidebar-menus/evernote-web-flow-customizing-sidebar-menus-f6f851b2-01-31243cad-2c81-4034-987b-eb2c4068ee43.webp` | https://mobbin.com/screens/31243cad-2c81-4034-987b-eb2c4068ee43 |
| 2 | `web/flows/customizing-sidebar-menus/evernote-web-flow-customizing-sidebar-menus-f6f851b2-02-f5a851fd-181d-4e28-a48c-58679af6bca0.webp` | https://mobbin.com/screens/f5a851fd-181d-4e28-a48c-58679af6bca0 |
| 3 | `web/flows/customizing-sidebar-menus/evernote-web-flow-customizing-sidebar-menus-f6f851b2-03-b3fd051e-7aaa-4fac-ab81-067e848aa20f.webp` | https://mobbin.com/screens/b3fd051e-7aaa-4fac-ab81-067e848aa20f |
| 4 | `web/flows/customizing-sidebar-menus/evernote-web-flow-customizing-sidebar-menus-f6f851b2-04-9e3cfef0-b1b3-45b9-a0a9-f67441275c17.webp` | https://mobbin.com/screens/9e3cfef0-b1b3-45b9-a0a9-f67441275c17 |

### Deactivating a user — `deactivating-a-user/` — https://mobbin.com/flows/f0dadb38-c41b-4b85-b301-fb8e14d432f5

Actions: Deleting & Removing. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/deactivating-a-user/evernote-web-flow-deactivating-a-user-f0dadb38-01-16983437-cec1-410f-abd1-bec4b495f0ec.webp` | https://mobbin.com/screens/16983437-cec1-410f-abd1-bec4b495f0ec |
| 2 | `web/flows/deactivating-a-user/evernote-web-flow-deactivating-a-user-f0dadb38-02-3fb7c17c-3e1c-45f6-ac4a-db93ae268755.webp` | https://mobbin.com/screens/3fb7c17c-3e1c-45f6-ac4a-db93ae268755 |
| 3 | `web/flows/deactivating-a-user/evernote-web-flow-deactivating-a-user-f0dadb38-03-ceecb3c7-aa5e-4502-a77f-235d2b3c30ff.webp` | https://mobbin.com/screens/ceecb3c7-aa5e-4502-a77f-235d2b3c30ff |
| 4 | `web/flows/deactivating-a-user/evernote-web-flow-deactivating-a-user-f0dadb38-04-982fa92a-5a8e-45a9-bbf0-1551fb7c8120.webp` | https://mobbin.com/screens/982fa92a-5a8e-45a9-bbf0-1551fb7c8120 |
| 5 | `web/flows/deactivating-a-user/evernote-web-flow-deactivating-a-user-f0dadb38-05-39cff8e9-21cb-42dd-a7fe-101884d63c78.webp` | https://mobbin.com/screens/39cff8e9-21cb-42dd-a7fe-101884d63c78 |

### Deleting a note — `deleting-a-note/` — https://mobbin.com/flows/5f67097f-9a70-48e1-b5ac-d7cfe840387a

Actions: Deleting & Removing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/deleting-a-note/evernote-web-flow-deleting-a-note-5f67097f-01-ae4cc8ce-0c62-445d-8f00-b0102b643270.webp` | https://mobbin.com/screens/ae4cc8ce-0c62-445d-8f00-b0102b643270 |
| 2 | `web/flows/deleting-a-note/evernote-web-flow-deleting-a-note-5f67097f-02-6eec0d9e-505d-42bc-98d2-da621a754378.webp` | https://mobbin.com/screens/6eec0d9e-505d-42bc-98d2-da621a754378 |
| 3 | `web/flows/deleting-a-note/evernote-web-flow-deleting-a-note-5f67097f-03-1d3f5403-f448-4369-9969-385500b91e40.webp` | https://mobbin.com/screens/1d3f5403-f448-4369-9969-385500b91e40 |

### Deleting tags — `deleting-tags/` — https://mobbin.com/flows/41c6d98a-2955-4b06-818c-aef05eecc3b3

Actions: Deleting & Removing, Selecting & Choosing. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/deleting-tags/evernote-web-flow-deleting-tags-41c6d98a-01-22d848ea-d8ad-41fc-8201-ff151068862e.webp` | https://mobbin.com/screens/22d848ea-d8ad-41fc-8201-ff151068862e |
| 2 | `web/flows/deleting-tags/evernote-web-flow-deleting-tags-41c6d98a-02-6aeeabe8-34ce-4e95-ab81-f6c0fd7d33f3.webp` | https://mobbin.com/screens/6aeeabe8-34ce-4e95-ab81-f6c0fd7d33f3 |
| 3 | `web/flows/deleting-tags/evernote-web-flow-deleting-tags-41c6d98a-03-410ebeb2-f34b-4ff1-a4ae-cd07774b2d42.webp` | https://mobbin.com/screens/410ebeb2-f34b-4ff1-a4ae-cd07774b2d42 |
| 4 | `web/flows/deleting-tags/evernote-web-flow-deleting-tags-41c6d98a-04-e62fb80b-2153-40df-b21b-5a7bc1383c24.webp` | https://mobbin.com/screens/e62fb80b-2153-40df-b21b-5a7bc1383c24 |
| 5 | `web/flows/deleting-tags/evernote-web-flow-deleting-tags-41c6d98a-05-7084eef6-440d-4cf7-aef3-2f17d3e659fa.webp` | https://mobbin.com/screens/7084eef6-440d-4cf7-aef3-2f17d3e659fa |

### Directory — `directory/` — https://mobbin.com/flows/79d56cee-0548-4346-81c4-b197902334df

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/directory/evernote-web-flow-directory-79d56cee-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/directory/evernote-web-flow-directory-79d56cee-02-63c91406-331f-4f7b-86b6-8621963e3c94.webp` | https://mobbin.com/screens/63c91406-331f-4f7b-86b6-8621963e3c94 |
| 3 | `web/flows/directory/evernote-web-flow-directory-79d56cee-03-2de6cc59-e9ab-4657-a382-caf5c07b9016.webp` | https://mobbin.com/screens/2de6cc59-e9ab-4657-a382-caf5c07b9016 |
| 4 | `web/flows/directory/evernote-web-flow-directory-79d56cee-04-4466db94-d9ba-4c1f-a667-b8635446bab4.webp` | https://mobbin.com/screens/4466db94-d9ba-4c1f-a667-b8635446bab4 |

### Directory — `directory/` — https://mobbin.com/flows/d45a5b3f-2b09-4264-a103-7925dbeceef5

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/directory/evernote-web-flow-directory-d45a5b3f-01-1f32d551-790d-4d4d-bce2-8a89858d31bc.webp` | https://mobbin.com/screens/1f32d551-790d-4d4d-bce2-8a89858d31bc |
| 2 | `web/flows/directory/evernote-web-flow-directory-d45a5b3f-02-9f013f31-bef8-404f-bca4-1714077a7393.webp` | https://mobbin.com/screens/9f013f31-bef8-404f-bca4-1714077a7393 |
| 3 | `web/flows/directory/evernote-web-flow-directory-d45a5b3f-03-2799867e-87a5-42cc-98f9-4b1f92e53987.webp` | https://mobbin.com/screens/2799867e-87a5-42cc-98f9-4b1f92e53987 |

### Editing a file — `editing-a-file/` — https://mobbin.com/flows/82774d3f-9770-4e34-8cea-b2cbac9a9a09

Actions: Drawing, Editing & Updating. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-01-80717efe-7483-4c8b-84c8-cc5cfe3b61ab.webp` | https://mobbin.com/screens/80717efe-7483-4c8b-84c8-cc5cfe3b61ab |
| 2 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-02-ed5626f7-d7c5-467d-9c25-54c2fc77a90c.webp` | https://mobbin.com/screens/ed5626f7-d7c5-467d-9c25-54c2fc77a90c |
| 3 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-03-6b2b956d-201e-44d1-a0df-5d72e832a1e0.webp` | https://mobbin.com/screens/6b2b956d-201e-44d1-a0df-5d72e832a1e0 |
| 4 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-04-73aa592f-e72b-4bd4-946c-407a6e9a497b.webp` | https://mobbin.com/screens/73aa592f-e72b-4bd4-946c-407a6e9a497b |
| 5 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-05-a0122c80-f094-4ca9-b902-0e28d6e172c7.webp` | https://mobbin.com/screens/a0122c80-f094-4ca9-b902-0e28d6e172c7 |
| 6 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-06-04be4cb1-657c-4b2a-93a4-b3064e145308.webp` | https://mobbin.com/screens/04be4cb1-657c-4b2a-93a4-b3064e145308 |
| 7 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-07-6b738832-02bc-4614-96df-7b11d0f2e827.webp` | https://mobbin.com/screens/6b738832-02bc-4614-96df-7b11d0f2e827 |
| 8 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-08-407d2bd0-0bc3-4d34-802f-bab8fe3be902.webp` | https://mobbin.com/screens/407d2bd0-0bc3-4d34-802f-bab8fe3be902 |
| 9 | `web/flows/editing-a-file/evernote-web-flow-editing-a-file-82774d3f-09-5b28b220-efd1-43cf-94eb-dddef009a59a.webp` | https://mobbin.com/screens/5b28b220-efd1-43cf-94eb-dddef009a59a |

### Editing default notes — `editing-default-notes/` — https://mobbin.com/flows/53fe457d-6b60-4a9c-be8d-d0cdf8e32719

Actions: Editing & Updating, Turning On/Off. Screens: 8.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-01-7d3eee4d-0b65-42ff-8021-ceaeed2c09ec.webp` | https://mobbin.com/screens/7d3eee4d-0b65-42ff-8021-ceaeed2c09ec |
| 2 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-02-9aa72717-0e37-438b-8c44-05ece03cf3af.webp` | https://mobbin.com/screens/9aa72717-0e37-438b-8c44-05ece03cf3af |
| 3 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-03-7ed55b39-bb47-478b-bd54-700e46871dfc.webp` | https://mobbin.com/screens/7ed55b39-bb47-478b-bd54-700e46871dfc |
| 4 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-04-75e7329d-b56f-45fc-99c5-373ae1b5d0da.webp` | https://mobbin.com/screens/75e7329d-b56f-45fc-99c5-373ae1b5d0da |
| 5 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-05-e3a0b74e-2981-4a35-86a7-49df9dc50992.webp` | https://mobbin.com/screens/e3a0b74e-2981-4a35-86a7-49df9dc50992 |
| 6 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-06-19514f86-c8d6-4c35-9bfc-837c91caff99.webp` | https://mobbin.com/screens/19514f86-c8d6-4c35-9bfc-837c91caff99 |
| 7 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-07-f1f04077-f8e0-4655-a716-c5605b43438d.webp` | https://mobbin.com/screens/f1f04077-f8e0-4655-a716-c5605b43438d |
| 8 | `web/flows/editing-default-notes/evernote-web-flow-editing-default-notes-53fe457d-08-d2d45cc6-d681-4f9c-bac3-76222718cd4c.webp` | https://mobbin.com/screens/d2d45cc6-d681-4f9c-bac3-76222718cd4c |

### Editing text with AI — `editing-text-with-ai/` — https://mobbin.com/flows/340c37bd-c931-41d2-a6cd-77afaad52593

Actions: Copying & Duplicating, Editing & Updating. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-01-b8a8a6ef-a6c6-4fbd-a0f7-c97aede509c0.webp` | https://mobbin.com/screens/b8a8a6ef-a6c6-4fbd-a0f7-c97aede509c0 |
| 2 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-02-920915ad-92ca-43cc-b0f3-f7a4496ae6f7.webp` | https://mobbin.com/screens/920915ad-92ca-43cc-b0f3-f7a4496ae6f7 |
| 3 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-03-65c8341c-65bf-4d42-a48e-57ee2e0bf2ca.webp` | https://mobbin.com/screens/65c8341c-65bf-4d42-a48e-57ee2e0bf2ca |
| 4 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-04-1554fa7d-6f46-4d56-9fbf-816a3d025c28.webp` | https://mobbin.com/screens/1554fa7d-6f46-4d56-9fbf-816a3d025c28 |
| 5 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-05-3809d51c-a4cf-440d-83d7-f464366fbadf.webp` | https://mobbin.com/screens/3809d51c-a4cf-440d-83d7-f464366fbadf |
| 6 | `web/flows/editing-text-with-ai/evernote-web-flow-editing-text-with-ai-340c37bd-06-db8c60b5-9905-46aa-82af-49c483131d1c.webp` | https://mobbin.com/screens/db8c60b5-9905-46aa-82af-49c483131d1c |

### Editing with AI — `editing-with-ai/` — https://mobbin.com/flows/23884039-98c8-47a3-96e7-60beb3667254

Actions: Editing & Updating. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-01-f4ec7cab-b196-4274-93da-bc61b7aca341.webp` | https://mobbin.com/screens/f4ec7cab-b196-4274-93da-bc61b7aca341 |
| 2 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-02-cbacb9d1-bb9d-4c89-bc33-dd71088fc758.webp` | https://mobbin.com/screens/cbacb9d1-bb9d-4c89-bc33-dd71088fc758 |
| 3 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-03-24bf5374-9256-4cec-9759-2a2cda2707a2.webp` | https://mobbin.com/screens/24bf5374-9256-4cec-9759-2a2cda2707a2 |
| 4 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-04-d7ec8ab8-2815-4875-b912-5408c2d79a5f.webp` | https://mobbin.com/screens/d7ec8ab8-2815-4875-b912-5408c2d79a5f |
| 5 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-05-a67fef75-319e-45d5-a5cc-bfe4c9b3f519.webp` | https://mobbin.com/screens/a67fef75-319e-45d5-a5cc-bfe4c9b3f519 |
| 6 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-06-e48d0d07-6c40-43c7-839b-392fa82e7859.webp` | https://mobbin.com/screens/e48d0d07-6c40-43c7-839b-392fa82e7859 |
| 7 | `web/flows/editing-with-ai/evernote-web-flow-editing-with-ai-23884039-07-14a194ef-3e22-43d9-8598-a5202d51525c.webp` | https://mobbin.com/screens/14a194ef-3e22-43d9-8598-a5202d51525c |

### Emptying trash — `emptying-trash/` — https://mobbin.com/flows/947054b2-171b-40d8-9894-213f3ad08a75

Actions: Deleting & Removing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/emptying-trash/evernote-web-flow-emptying-trash-947054b2-01-72b16a91-d10d-46ca-8e45-504d2cf98510.webp` | https://mobbin.com/screens/72b16a91-d10d-46ca-8e45-504d2cf98510 |
| 2 | `web/flows/emptying-trash/evernote-web-flow-emptying-trash-947054b2-02-4f14852e-0b8d-4e9f-8ac3-64d48904efad.webp` | https://mobbin.com/screens/4f14852e-0b8d-4e9f-8ac3-64d48904efad |
| 3 | `web/flows/emptying-trash/evernote-web-flow-emptying-trash-947054b2-03-49e1b4bb-f855-4825-85ef-5d2c85528f55.webp` | https://mobbin.com/screens/49e1b4bb-f855-4825-85ef-5d2c85528f55 |

### Enabling task reminder — `enabling-task-reminder/` — https://mobbin.com/flows/c2aa107d-761d-4fde-bfce-3a92aa5f5744

Actions: Enabling & Disabling, Scheduling. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/enabling-task-reminder/evernote-web-flow-enabling-task-reminder-c2aa107d-01-1de97fb0-4a90-4cfa-ad53-963c5b159f27.webp` | https://mobbin.com/screens/1de97fb0-4a90-4cfa-ad53-963c5b159f27 |
| 2 | `web/flows/enabling-task-reminder/evernote-web-flow-enabling-task-reminder-c2aa107d-02-6ac2377e-0ca2-4fac-a7f0-95d23b8a25c7.webp` | https://mobbin.com/screens/6ac2377e-0ca2-4fac-a7f0-95d23b8a25c7 |
| 3 | `web/flows/enabling-task-reminder/evernote-web-flow-enabling-task-reminder-c2aa107d-03-d0639ce3-e633-4f5a-b012-c55f78d37b43.webp` | https://mobbin.com/screens/d0639ce3-e633-4f5a-b012-c55f78d37b43 |

### Enabling two-factor authentication — `enabling-two-factor-authentication/` — https://mobbin.com/flows/a08621d6-0d05-49c6-a232-e93f4d5e0d0f

Actions: Setting Up, Verifying. Screens: 15.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-01-319043dd-ee32-4cd3-818b-04f38b7ab74b.webp` | https://mobbin.com/screens/319043dd-ee32-4cd3-818b-04f38b7ab74b |
| 2 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-02-284f0457-9c76-4191-a0e6-a2658812996b.webp` | https://mobbin.com/screens/284f0457-9c76-4191-a0e6-a2658812996b |
| 3 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-03-bafcf03b-6983-4e06-9b48-1c55159b9014.webp` | https://mobbin.com/screens/bafcf03b-6983-4e06-9b48-1c55159b9014 |
| 4 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-04-0d2c37f8-9e96-4802-9062-dd6454583515.webp` | https://mobbin.com/screens/0d2c37f8-9e96-4802-9062-dd6454583515 |
| 5 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-05-fde5a05f-d86f-43c9-a0ec-b5dbe7f33704.webp` | https://mobbin.com/screens/fde5a05f-d86f-43c9-a0ec-b5dbe7f33704 |
| 6 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-06-0b3722f0-d62b-422f-9e3c-6a4d0a56edc6.webp` | https://mobbin.com/screens/0b3722f0-d62b-422f-9e3c-6a4d0a56edc6 |
| 7 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-07-808ccce0-a25b-4e00-a248-55b724fc0a37.webp` | https://mobbin.com/screens/808ccce0-a25b-4e00-a248-55b724fc0a37 |
| 8 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-08-03fdf2b6-2f6e-4a80-93b8-41d0745fb9dd.webp` | https://mobbin.com/screens/03fdf2b6-2f6e-4a80-93b8-41d0745fb9dd |
| 9 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-09-bc72116a-6fa0-41a7-b22f-1cc6c138b92c.webp` | https://mobbin.com/screens/bc72116a-6fa0-41a7-b22f-1cc6c138b92c |
| 10 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-10-a49380a0-9c19-49f6-b98d-00bae0dd3809.webp` | https://mobbin.com/screens/a49380a0-9c19-49f6-b98d-00bae0dd3809 |
| 11 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-11-30b4c46b-0b6b-4843-a0f0-ac01956bd3ba.webp` | https://mobbin.com/screens/30b4c46b-0b6b-4843-a0f0-ac01956bd3ba |
| 12 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-12-aaf8e9d1-9841-4385-a6fb-f608e38390d0.webp` | https://mobbin.com/screens/aaf8e9d1-9841-4385-a6fb-f608e38390d0 |
| 13 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-13-64773be7-e83c-4b25-87e8-2f6bb48d0c8e.webp` | https://mobbin.com/screens/64773be7-e83c-4b25-87e8-2f6bb48d0c8e |
| 14 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-14-61b11107-bf82-4994-82f0-ce9c547e7c99.webp` | https://mobbin.com/screens/61b11107-bf82-4994-82f0-ce9c547e7c99 |
| 15 | `web/flows/enabling-two-factor-authentication/evernote-web-flow-enabling-two-factor-authentication-a08621d6-15-74dd69c6-438e-4946-b603-16b4b0ade923.webp` | https://mobbin.com/screens/74dd69c6-438e-4946-b603-16b4b0ade923 |

### Expanding a note — `expanding-a-note/` — https://mobbin.com/flows/3cf4af14-5f09-4349-b306-e6c8610ae249

Actions: Showing & Hiding. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/expanding-a-note/evernote-web-flow-expanding-a-note-3cf4af14-01-e4edd516-70cd-436c-86e2-22d3c88aeec1.webp` | https://mobbin.com/screens/e4edd516-70cd-436c-86e2-22d3c88aeec1 |
| 2 | `web/flows/expanding-a-note/evernote-web-flow-expanding-a-note-3cf4af14-02-9ffd8149-fffb-43af-8fc1-c77c06e67cfe.webp` | https://mobbin.com/screens/9ffd8149-fffb-43af-8fc1-c77c06e67cfe |

### Expanding a note — `expanding-a-note/` — https://mobbin.com/flows/a2b67699-aec7-49af-95d8-266da928b58e

Actions: Switching View. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/expanding-a-note/evernote-web-flow-expanding-a-note-a2b67699-01-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |
| 2 | `web/flows/expanding-a-note/evernote-web-flow-expanding-a-note-a2b67699-02-cb30bd33-a88c-4959-8af7-b10d034906d8.webp` | https://mobbin.com/screens/cb30bd33-a88c-4959-8af7-b10d034906d8 |
| 3 | `web/flows/expanding-a-note/evernote-web-flow-expanding-a-note-a2b67699-03-4e834bda-1722-4d13-b772-84732cb5a868.webp` | https://mobbin.com/screens/4e834bda-1722-4d13-b772-84732cb5a868 |

### Files — `files/` — https://mobbin.com/flows/4904e6f4-523a-4631-bea2-3ac3e97aa70c

Actions: none listed. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/files/evernote-web-flow-files-4904e6f4-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/files/evernote-web-flow-files-4904e6f4-02-63cbbea6-a1b3-4fba-89c2-4aaf3a7c91e7.webp` | https://mobbin.com/screens/63cbbea6-a1b3-4fba-89c2-4aaf3a7c91e7 |
| 3 | `web/flows/files/evernote-web-flow-files-4904e6f4-03-cd400126-4b54-407f-8238-0989944c3cd8.webp` | https://mobbin.com/screens/cd400126-4b54-407f-8238-0989944c3cd8 |
| 4 | `web/flows/files/evernote-web-flow-files-4904e6f4-04-a27b6418-2ca3-47fb-be65-4219ed5ee338.webp` | https://mobbin.com/screens/a27b6418-2ca3-47fb-be65-4219ed5ee338 |
| 5 | `web/flows/files/evernote-web-flow-files-4904e6f4-05-b4a2ecf2-571c-440d-adc8-465557022455.webp` | https://mobbin.com/screens/b4a2ecf2-571c-440d-adc8-465557022455 |
| 6 | `web/flows/files/evernote-web-flow-files-4904e6f4-06-a941cce1-3ec9-479d-ad47-6e87eefcc52d.webp` | https://mobbin.com/screens/a941cce1-3ec9-479d-ad47-6e87eefcc52d |

### Files — `files/` — https://mobbin.com/flows/8c2a1785-3668-4ed4-8315-3fcca59ac025

Actions: none listed. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/files/evernote-web-flow-files-8c2a1785-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/files/evernote-web-flow-files-8c2a1785-02-cd307d08-07af-4074-8394-75e0d78ad281.webp` | https://mobbin.com/screens/cd307d08-07af-4074-8394-75e0d78ad281 |
| 3 | `web/flows/files/evernote-web-flow-files-8c2a1785-03-5a0cb0ef-4014-4a76-bbd9-a47b53391a42.webp` | https://mobbin.com/screens/5a0cb0ef-4014-4a76-bbd9-a47b53391a42 |
| 4 | `web/flows/files/evernote-web-flow-files-8c2a1785-04-ed53346f-56b6-45a2-9b00-e656f6f84de4.webp` | https://mobbin.com/screens/ed53346f-56b6-45a2-9b00-e656f6f84de4 |
| 5 | `web/flows/files/evernote-web-flow-files-8c2a1785-05-c323a036-50a7-4c5f-8ef6-55e55e4e3a45.webp` | https://mobbin.com/screens/c323a036-50a7-4c5f-8ef6-55e55e4e3a45 |

### Filtering and sorting notes — `filtering-and-sorting-notes/` — https://mobbin.com/flows/0ecc3643-62eb-4a68-8d85-0cbe2b220930

Actions: Filtering & Sorting. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-01-c0772487-21c1-459e-b767-4fef25431f28.webp` | https://mobbin.com/screens/c0772487-21c1-459e-b767-4fef25431f28 |
| 2 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-02-57f41073-a1a5-45ca-9da1-836b51e4b9c9.webp` | https://mobbin.com/screens/57f41073-a1a5-45ca-9da1-836b51e4b9c9 |
| 3 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-03-2400dda3-acda-4fc5-9ae8-5be3fe31eb44.webp` | https://mobbin.com/screens/2400dda3-acda-4fc5-9ae8-5be3fe31eb44 |
| 4 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-04-ae567708-7b1b-487c-922d-2561f1de7488.webp` | https://mobbin.com/screens/ae567708-7b1b-487c-922d-2561f1de7488 |
| 5 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-05-3a8d5a0b-48ee-4718-8191-bd9c82384f98.webp` | https://mobbin.com/screens/3a8d5a0b-48ee-4718-8191-bd9c82384f98 |
| 6 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-06-c9434309-77ac-4e71-921f-e9c6aff56684.webp` | https://mobbin.com/screens/c9434309-77ac-4e71-921f-e9c6aff56684 |
| 7 | `web/flows/filtering-and-sorting-notes/evernote-web-flow-filtering-and-sorting-notes-0ecc3643-07-4d1f6590-df80-4cfe-86f4-0cbcf85c6d0e.webp` | https://mobbin.com/screens/4d1f6590-df80-4cfe-86f4-0cbcf85c6d0e |

### Filtering notes — `filtering-notes/` — https://mobbin.com/flows/7cb1f244-0d83-4dcd-8045-ab4b79b75fe2

Actions: Filtering & Sorting. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-01-7ae9adee-069d-4c40-9d45-515419058252.webp` | https://mobbin.com/screens/7ae9adee-069d-4c40-9d45-515419058252 |
| 2 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-02-c759ef8b-27ee-4177-af86-5a4b48c941bf.webp` | https://mobbin.com/screens/c759ef8b-27ee-4177-af86-5a4b48c941bf |
| 3 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-03-127126c2-a95d-413f-ba8e-326290788f9d.webp` | https://mobbin.com/screens/127126c2-a95d-413f-ba8e-326290788f9d |
| 4 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-04-cab36e3a-329c-46f5-90a2-84e45ea0b850.webp` | https://mobbin.com/screens/cab36e3a-329c-46f5-90a2-84e45ea0b850 |
| 5 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-05-aa24ecdd-d20a-4a2a-b723-6080c33e055c.webp` | https://mobbin.com/screens/aa24ecdd-d20a-4a2a-b723-6080c33e055c |
| 6 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-06-d27cfc5f-6bce-43bb-bcb0-7f2170d7a650.webp` | https://mobbin.com/screens/d27cfc5f-6bce-43bb-bcb0-7f2170d7a650 |
| 7 | `web/flows/filtering-notes/evernote-web-flow-filtering-notes-7cb1f244-07-00c87978-e524-4d75-9a9d-5f9714513b42.webp` | https://mobbin.com/screens/00c87978-e524-4d75-9a9d-5f9714513b42 |

### Filtering tasks — `filtering-tasks/` — https://mobbin.com/flows/2ccce251-2807-4a3a-9947-f8a45e85751a

Actions: Filtering & Sorting. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/filtering-tasks/evernote-web-flow-filtering-tasks-2ccce251-01-cb731010-8c51-457d-ac65-9c77cd34b016.webp` | https://mobbin.com/screens/cb731010-8c51-457d-ac65-9c77cd34b016 |
| 2 | `web/flows/filtering-tasks/evernote-web-flow-filtering-tasks-2ccce251-02-e5b13428-945e-458b-b959-29d5c1b596a2.webp` | https://mobbin.com/screens/e5b13428-945e-458b-b959-29d5c1b596a2 |
| 3 | `web/flows/filtering-tasks/evernote-web-flow-filtering-tasks-2ccce251-03-6bcad600-4a61-459d-aacb-d305489eda43.webp` | https://mobbin.com/screens/6bcad600-4a61-459d-aacb-d305489eda43 |
| 4 | `web/flows/filtering-tasks/evernote-web-flow-filtering-tasks-2ccce251-04-752c5be6-f6a9-4314-921e-f6371d714337.webp` | https://mobbin.com/screens/752c5be6-f6a9-4314-921e-f6371d714337 |

### Formatting text — `formatting-text/` — https://mobbin.com/flows/4b09e42c-d558-4817-9b67-eb0bf21e9485

Actions: Editing & Updating. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-01-f4ec7cab-b196-4274-93da-bc61b7aca341.webp` | https://mobbin.com/screens/f4ec7cab-b196-4274-93da-bc61b7aca341 |
| 2 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-02-506900c7-8935-47a1-8025-58b58c6da613.webp` | https://mobbin.com/screens/506900c7-8935-47a1-8025-58b58c6da613 |
| 3 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-03-23ca115c-e5bb-42e4-9662-07209f205458.webp` | https://mobbin.com/screens/23ca115c-e5bb-42e4-9662-07209f205458 |
| 4 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-04-231f6490-8962-4596-b47e-98c41abcd623.webp` | https://mobbin.com/screens/231f6490-8962-4596-b47e-98c41abcd623 |
| 5 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-05-0947eec1-34ee-4278-9451-e66816eadbef.webp` | https://mobbin.com/screens/0947eec1-34ee-4278-9451-e66816eadbef |
| 6 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-06-b531028a-b32c-4c06-ad06-c15bd09eb343.webp` | https://mobbin.com/screens/b531028a-b32c-4c06-ad06-c15bd09eb343 |
| 7 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-07-a23c77fe-04ca-417a-a592-89137a6189fc.webp` | https://mobbin.com/screens/a23c77fe-04ca-417a-a592-89137a6189fc |
| 8 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-08-73e3ff95-2a30-4218-b1d1-bb1571ab79cb.webp` | https://mobbin.com/screens/73e3ff95-2a30-4218-b1d1-bb1571ab79cb |
| 9 | `web/flows/formatting-text/evernote-web-flow-formatting-text-4b09e42c-09-5fc45093-bed6-4fe1-90f7-73bc86d7de15.webp` | https://mobbin.com/screens/5fc45093-bed6-4fe1-90f7-73bc86d7de15 |

### Formatting text — `formatting-text/` — https://mobbin.com/flows/c543f306-fe04-44b2-857a-28bb271f5f07

Actions: Editing & Updating. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-01-920915ad-92ca-43cc-b0f3-f7a4496ae6f7.webp` | https://mobbin.com/screens/920915ad-92ca-43cc-b0f3-f7a4496ae6f7 |
| 2 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-02-d2ab21e2-8266-414e-b054-d54af0ecc2d5.webp` | https://mobbin.com/screens/d2ab21e2-8266-414e-b054-d54af0ecc2d5 |
| 3 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-03-77b58346-67f9-4f5d-bd8c-4e2c837841ce.webp` | https://mobbin.com/screens/77b58346-67f9-4f5d-bd8c-4e2c837841ce |
| 4 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-04-9a11590a-1981-4eb3-bfd6-dc84252336ab.webp` | https://mobbin.com/screens/9a11590a-1981-4eb3-bfd6-dc84252336ab |
| 5 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-05-53fe8f1c-e6d5-495f-a1c4-0c92b0246143.webp` | https://mobbin.com/screens/53fe8f1c-e6d5-495f-a1c4-0c92b0246143 |
| 6 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-06-41ec5314-72ce-4297-9093-c523061b45bc.webp` | https://mobbin.com/screens/41ec5314-72ce-4297-9093-c523061b45bc |
| 7 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-07-a232d099-0e3c-49ad-9858-cb2717c94f16.webp` | https://mobbin.com/screens/a232d099-0e3c-49ad-9858-cb2717c94f16 |
| 8 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-08-40c55cf7-2095-4911-a8bd-88ca1ca4aece.webp` | https://mobbin.com/screens/40c55cf7-2095-4911-a8bd-88ca1ca4aece |
| 9 | `web/flows/formatting-text/evernote-web-flow-formatting-text-c543f306-09-ca42dd45-da3e-4a09-b2ba-36977e8d430b.webp` | https://mobbin.com/screens/ca42dd45-da3e-4a09-b2ba-36977e8d430b |

### Giving feedback — `giving-feedback/` — https://mobbin.com/flows/d5d6e40d-ee7a-449c-a18c-120f0bfb1849

Actions: Giving Feedback. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/giving-feedback/evernote-web-flow-giving-feedback-d5d6e40d-01-3809d51c-a4cf-440d-83d7-f464366fbadf.webp` | https://mobbin.com/screens/3809d51c-a4cf-440d-83d7-f464366fbadf |
| 2 | `web/flows/giving-feedback/evernote-web-flow-giving-feedback-d5d6e40d-02-70824f33-5191-4aa3-be41-4fc029b77c88.webp` | https://mobbin.com/screens/70824f33-5191-4aa3-be41-4fc029b77c88 |

### Home — `home/` — https://mobbin.com/flows/9663c2ee-4a5d-4083-84e0-bfeff7a518a6

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/home/evernote-web-flow-home-9663c2ee-01-7196b9ff-3d4c-454a-9039-cbb885d842b3.webp` | https://mobbin.com/screens/7196b9ff-3d4c-454a-9039-cbb885d842b3 |
| 2 | `web/flows/home/evernote-web-flow-home-9663c2ee-02-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 3 | `web/flows/home/evernote-web-flow-home-9663c2ee-03-e205db34-faf1-4466-90e2-be5859225291.webp` | https://mobbin.com/screens/e205db34-faf1-4466-90e2-be5859225291 |

### Home — `home/` — https://mobbin.com/flows/b93a5587-4fe8-4abc-af54-8e2139531b3d

Actions: none listed. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/home/evernote-web-flow-home-b93a5587-01-b3616b17-584e-4c5c-a6b3-047e16ed31ea.webp` | https://mobbin.com/screens/b3616b17-584e-4c5c-a6b3-047e16ed31ea |
| 2 | `web/flows/home/evernote-web-flow-home-b93a5587-02-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |
| 3 | `web/flows/home/evernote-web-flow-home-b93a5587-03-83f0e409-72b8-4165-9b7f-1e3e7ecbc30a.webp` | https://mobbin.com/screens/83f0e409-72b8-4165-9b7f-1e3e7ecbc30a |
| 4 | `web/flows/home/evernote-web-flow-home-b93a5587-04-6d18896e-6c35-4434-8062-93cb303460a7.webp` | https://mobbin.com/screens/6d18896e-6c35-4434-8062-93cb303460a7 |
| 5 | `web/flows/home/evernote-web-flow-home-b93a5587-05-2ba55508-e5ad-449e-b51d-abb7826e08ab.webp` | https://mobbin.com/screens/2ba55508-e5ad-449e-b51d-abb7826e08ab |
| 6 | `web/flows/home/evernote-web-flow-home-b93a5587-06-5264c96a-883a-4e36-93e7-72974d4cbd77.webp` | https://mobbin.com/screens/5264c96a-883a-4e36-93e7-72974d4cbd77 |
| 7 | `web/flows/home/evernote-web-flow-home-b93a5587-07-585a3acd-3971-4ec2-8b37-0f49736bcff9.webp` | https://mobbin.com/screens/585a3acd-3971-4ec2-8b37-0f49736bcff9 |

### Importing a file — `importing-a-file/` — https://mobbin.com/flows/8a176bec-7dbc-4553-ac08-d323fac01155

Actions: Importing & Exporting. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/importing-a-file/evernote-web-flow-importing-a-file-8a176bec-01-77b43e79-89b3-4577-80e1-4e1c2974c215.webp` | https://mobbin.com/screens/77b43e79-89b3-4577-80e1-4e1c2974c215 |
| 2 | `web/flows/importing-a-file/evernote-web-flow-importing-a-file-8a176bec-02-93496e4b-e99a-4dc2-b778-ed2863fb7843.webp` | https://mobbin.com/screens/93496e4b-e99a-4dc2-b778-ed2863fb7843 |
| 3 | `web/flows/importing-a-file/evernote-web-flow-importing-a-file-8a176bec-03-4384512a-fd04-4bee-9edc-f7fc3310e4fa.webp` | https://mobbin.com/screens/4384512a-fd04-4bee-9edc-f7fc3310e4fa |
| 4 | `web/flows/importing-a-file/evernote-web-flow-importing-a-file-8a176bec-04-d4ce5642-3184-4a5b-afd8-3ffac062c784.webp` | https://mobbin.com/screens/d4ce5642-3184-4a5b-afd8-3ffac062c784 |

### Importing a note — `importing-a-note/` — https://mobbin.com/flows/ad61c238-30fc-4a0a-9a4d-7e0279ca7306

Actions: Importing & Exporting, Uploading & Downloading. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/importing-a-note/evernote-web-flow-importing-a-note-ad61c238-01-8c79fcff-5135-4dbc-af4a-282970dac0f3.webp` | https://mobbin.com/screens/8c79fcff-5135-4dbc-af4a-282970dac0f3 |
| 2 | `web/flows/importing-a-note/evernote-web-flow-importing-a-note-ad61c238-02-50562304-d8c2-4fb2-ae5b-4d356b0c3a97.webp` | https://mobbin.com/screens/50562304-d8c2-4fb2-ae5b-4d356b0c3a97 |

### Inviting a team member — `inviting-a-team-member/` — https://mobbin.com/flows/b52c8e93-d7f4-4fd9-8d63-2a83812b39e0

Actions: Inviting Teammates & Friends. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/inviting-a-team-member/evernote-web-flow-inviting-a-team-member-b52c8e93-01-154a3871-054e-40a5-acd3-acd7306403a9.webp` | https://mobbin.com/screens/154a3871-054e-40a5-acd3-acd7306403a9 |
| 2 | `web/flows/inviting-a-team-member/evernote-web-flow-inviting-a-team-member-b52c8e93-02-fd53c059-231c-4259-8adc-52a72ab52f88.webp` | https://mobbin.com/screens/fd53c059-231c-4259-8adc-52a72ab52f88 |
| 3 | `web/flows/inviting-a-team-member/evernote-web-flow-inviting-a-team-member-b52c8e93-03-cea6cae9-9dec-47d3-8b55-8dca82f15ff7.webp` | https://mobbin.com/screens/cea6cae9-9dec-47d3-8b55-8dca82f15ff7 |

### Joining a space — `joining-a-space/` — https://mobbin.com/flows/6bbcb6f1-51f5-4e8c-a07e-07726b8c4326

Actions: Joining & Accepting. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/joining-a-space/evernote-web-flow-joining-a-space-6bbcb6f1-01-2de6cc59-e9ab-4657-a382-caf5c07b9016.webp` | https://mobbin.com/screens/2de6cc59-e9ab-4657-a382-caf5c07b9016 |
| 2 | `web/flows/joining-a-space/evernote-web-flow-joining-a-space-6bbcb6f1-02-3427d0e3-70f1-4cea-b0bd-709ea68265b2.webp` | https://mobbin.com/screens/3427d0e3-70f1-4cea-b0bd-709ea68265b2 |

### Joining a space — `joining-a-space/` — https://mobbin.com/flows/a9336277-2314-4574-a0fb-94ad52e7fc46

Actions: Joining & Accepting. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/joining-a-space/evernote-web-flow-joining-a-space-a9336277-01-9f013f31-bef8-404f-bca4-1714077a7393.webp` | https://mobbin.com/screens/9f013f31-bef8-404f-bca4-1714077a7393 |
| 2 | `web/flows/joining-a-space/evernote-web-flow-joining-a-space-a9336277-02-dd127c4f-55f0-4603-9896-2ec3926de1d0.webp` | https://mobbin.com/screens/dd127c4f-55f0-4603-9896-2ec3926de1d0 |

### Linking to a note — `linking-to-a-note/` — https://mobbin.com/flows/65f4ed3c-ed02-4cb2-8e92-18718ad199c1

Actions: Adding & Creating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/linking-to-a-note/evernote-web-flow-linking-to-a-note-65f4ed3c-01-c0772487-21c1-459e-b767-4fef25431f28.webp` | https://mobbin.com/screens/c0772487-21c1-459e-b767-4fef25431f28 |
| 2 | `web/flows/linking-to-a-note/evernote-web-flow-linking-to-a-note-65f4ed3c-02-52cf035f-7e0b-4f19-a3cf-935858c37ddb.webp` | https://mobbin.com/screens/52cf035f-7e0b-4f19-a3cf-935858c37ddb |
| 3 | `web/flows/linking-to-a-note/evernote-web-flow-linking-to-a-note-65f4ed3c-03-837ec98a-7c15-4b0b-be16-2b22b36b5922.webp` | https://mobbin.com/screens/837ec98a-7c15-4b0b-be16-2b22b36b5922 |
| 4 | `web/flows/linking-to-a-note/evernote-web-flow-linking-to-a-note-65f4ed3c-04-dd3a735b-14b1-464d-9606-a6416e88dbd9.webp` | https://mobbin.com/screens/dd3a735b-14b1-464d-9606-a6416e88dbd9 |

### Logging in — `logging-in/` — https://mobbin.com/flows/2400e3b6-517f-43cd-a05b-8aff14608192

Actions: Logging In, Verifying. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-01-b6090f85-1595-4fdd-9a52-217c1043d666.webp` | https://mobbin.com/screens/b6090f85-1595-4fdd-9a52-217c1043d666 |
| 2 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-02-c6d09d56-75a8-4502-adf4-4e1c92a4059e.webp` | https://mobbin.com/screens/c6d09d56-75a8-4502-adf4-4e1c92a4059e |
| 3 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-03-a966db1b-e1d4-4bce-b5c5-19581766845a.webp` | https://mobbin.com/screens/a966db1b-e1d4-4bce-b5c5-19581766845a |
| 4 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-04-59b9ac17-676e-4df2-b362-7d1e345e67d3.webp` | https://mobbin.com/screens/59b9ac17-676e-4df2-b362-7d1e345e67d3 |
| 5 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-05-b99cc7fc-2cc0-4a1e-a780-21617df6cf31.webp` | https://mobbin.com/screens/b99cc7fc-2cc0-4a1e-a780-21617df6cf31 |
| 6 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-06-1ab3d9c2-f6d0-4157-a1a3-040ff9487ea1.webp` | https://mobbin.com/screens/1ab3d9c2-f6d0-4157-a1a3-040ff9487ea1 |
| 7 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-07-7f50bd8a-def5-471a-9ae9-3530b337ca47.webp` | https://mobbin.com/screens/7f50bd8a-def5-471a-9ae9-3530b337ca47 |
| 8 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-08-c56629b9-1888-49f5-a191-9519d787b078.webp` | https://mobbin.com/screens/c56629b9-1888-49f5-a191-9519d787b078 |
| 9 | `web/flows/logging-in/evernote-web-flow-logging-in-2400e3b6-09-e205db34-faf1-4466-90e2-be5859225291.webp` | https://mobbin.com/screens/e205db34-faf1-4466-90e2-be5859225291 |

### Logging in — `logging-in/` — https://mobbin.com/flows/7982b167-050c-4f6f-9690-a39560433733

Actions: Logging In, Verifying. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-01-86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb.webp` | https://mobbin.com/screens/86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb |
| 2 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-02-affda314-f79c-4260-a138-c75a13b1e4b0.webp` | https://mobbin.com/screens/affda314-f79c-4260-a138-c75a13b1e4b0 |
| 3 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-03-b3189bcf-cff3-4b98-afcb-e97764b899e6.webp` | https://mobbin.com/screens/b3189bcf-cff3-4b98-afcb-e97764b899e6 |
| 4 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-04-4a0d0718-c642-4a9c-835e-cf2b4d630599.webp` | https://mobbin.com/screens/4a0d0718-c642-4a9c-835e-cf2b4d630599 |
| 5 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-05-21bb73ff-bc35-480f-988d-b5c1f8b413e8.webp` | https://mobbin.com/screens/21bb73ff-bc35-480f-988d-b5c1f8b413e8 |
| 6 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-06-e60e9f3e-addd-4dfe-98c3-aad3868951b3.webp` | https://mobbin.com/screens/e60e9f3e-addd-4dfe-98c3-aad3868951b3 |
| 7 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-07-83eee5e3-ea98-4daa-9b8d-baf27db2f00e.webp` | https://mobbin.com/screens/83eee5e3-ea98-4daa-9b8d-baf27db2f00e |
| 8 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-08-4552732b-22b2-4e76-9eb8-30c0f5d538b6.webp` | https://mobbin.com/screens/4552732b-22b2-4e76-9eb8-30c0f5d538b6 |
| 9 | `web/flows/logging-in/evernote-web-flow-logging-in-7982b167-09-1848f7d4-3ded-416b-b985-33d95d141653.webp` | https://mobbin.com/screens/1848f7d4-3ded-416b-b985-33d95d141653 |

### Logging out — `logging-out/` — https://mobbin.com/flows/e7c3ee7c-05b5-4597-8c29-2a3593d85800

Actions: Logging Out. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/logging-out/evernote-web-flow-logging-out-e7c3ee7c-01-c4364308-5c77-46bc-a8de-66379bf25eeb.webp` | https://mobbin.com/screens/c4364308-5c77-46bc-a8de-66379bf25eeb |
| 2 | `web/flows/logging-out/evernote-web-flow-logging-out-e7c3ee7c-02-86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb.webp` | https://mobbin.com/screens/86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb |

### Marking a task as completed — `marking-a-task-as-completed/` — https://mobbin.com/flows/01d93194-66a8-47c5-91f7-e5dc6a2c5eb3

Actions: Marking. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/marking-a-task-as-completed/evernote-web-flow-marking-a-task-as-completed-01d93194-01-8a848c69-c7c2-417c-84b2-f70a980b41c8.webp` | https://mobbin.com/screens/8a848c69-c7c2-417c-84b2-f70a980b41c8 |
| 2 | `web/flows/marking-a-task-as-completed/evernote-web-flow-marking-a-task-as-completed-01d93194-02-0cf81f55-0d68-445f-96f8-ae5905039491.webp` | https://mobbin.com/screens/0cf81f55-0d68-445f-96f8-ae5905039491 |

### Marking a task as completed — `marking-a-task-as-completed/` — https://mobbin.com/flows/cf390f3e-3e17-4715-a23b-5f30caadb062

Actions: Marking. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/marking-a-task-as-completed/evernote-web-flow-marking-a-task-as-completed-cf390f3e-01-2ba55508-e5ad-449e-b51d-abb7826e08ab.webp` | https://mobbin.com/screens/2ba55508-e5ad-449e-b51d-abb7826e08ab |
| 2 | `web/flows/marking-a-task-as-completed/evernote-web-flow-marking-a-task-as-completed-cf390f3e-02-be998689-2c69-4a19-9cd6-15b71f69ace2.webp` | https://mobbin.com/screens/be998689-2c69-4a19-9cd6-15b71f69ace2 |
| 3 | `web/flows/marking-a-task-as-completed/evernote-web-flow-marking-a-task-as-completed-cf390f3e-03-b342a29f-86ca-427b-ac8b-b08026ac7c0e.webp` | https://mobbin.com/screens/b342a29f-86ca-427b-ac8b-b08026ac7c0e |

### Marking as done — `marking-as-done/` — https://mobbin.com/flows/0b6aac5b-c78d-4be6-8e27-b9b2645563e7

Actions: Marking. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/marking-as-done/evernote-web-flow-marking-as-done-0b6aac5b-01-03fc1a74-7518-47c2-9f2f-5e502a2ca87b.webp` | https://mobbin.com/screens/03fc1a74-7518-47c2-9f2f-5e502a2ca87b |
| 2 | `web/flows/marking-as-done/evernote-web-flow-marking-as-done-0b6aac5b-02-eee10831-adc7-4f6d-b1ad-6a281994d0ee.webp` | https://mobbin.com/screens/eee10831-adc7-4f6d-b1ad-6a281994d0ee |
| 3 | `web/flows/marking-as-done/evernote-web-flow-marking-as-done-0b6aac5b-03-e072bcce-8792-4a0d-a73c-1f99c5646a85.webp` | https://mobbin.com/screens/e072bcce-8792-4a0d-a73c-1f99c5646a85 |
| 4 | `web/flows/marking-as-done/evernote-web-flow-marking-as-done-0b6aac5b-04-1293206d-b30c-44c6-b751-a469af41c639.webp` | https://mobbin.com/screens/1293206d-b30c-44c6-b751-a469af41c639 |

### Moving a note — `moving-a-note/` — https://mobbin.com/flows/21406de0-6215-43a9-902f-9759ed4449cd

Actions: Moving. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-01-7ae9adee-069d-4c40-9d45-515419058252.webp` | https://mobbin.com/screens/7ae9adee-069d-4c40-9d45-515419058252 |
| 2 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-02-ea2bdd31-3944-429d-9fc3-384c3edf6ee8.webp` | https://mobbin.com/screens/ea2bdd31-3944-429d-9fc3-384c3edf6ee8 |
| 3 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-03-ae4cc8ce-0c62-445d-8f00-b0102b643270.webp` | https://mobbin.com/screens/ae4cc8ce-0c62-445d-8f00-b0102b643270 |
| 4 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-04-0f7e31f2-bf13-47f4-b914-70b2aaf79034.webp` | https://mobbin.com/screens/0f7e31f2-bf13-47f4-b914-70b2aaf79034 |
| 5 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-05-f15c6740-445f-4b14-bb78-9a307ac496e7.webp` | https://mobbin.com/screens/f15c6740-445f-4b14-bb78-9a307ac496e7 |
| 6 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-21406de0-06-e7b03c18-9f32-4ed3-b77a-67967b0b14aa.webp` | https://mobbin.com/screens/e7b03c18-9f32-4ed3-b77a-67967b0b14aa |

### Moving a note — `moving-a-note/` — https://mobbin.com/flows/c5ef346c-8315-41db-b870-1298bb2c87ae

Actions: Moving. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-c5ef346c-01-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |
| 2 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-c5ef346c-02-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 3 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-c5ef346c-03-4e64e1a9-e984-4f7a-b47f-b8934123d8ff.webp` | https://mobbin.com/screens/4e64e1a9-e984-4f7a-b47f-b8934123d8ff |
| 4 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-c5ef346c-04-5a78455e-7009-4989-a457-64b19e907da5.webp` | https://mobbin.com/screens/5a78455e-7009-4989-a457-64b19e907da5 |
| 5 | `web/flows/moving-a-note/evernote-web-flow-moving-a-note-c5ef346c-05-1e3d62ae-f0e3-4623-927e-d37c00429cdd.webp` | https://mobbin.com/screens/1e3d62ae-f0e3-4623-927e-d37c00429cdd |

### Notebook — `notebook/` — https://mobbin.com/flows/99ba4fbf-e4bb-4eee-9050-36568f53deb7

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/notebook/evernote-web-flow-notebook-99ba4fbf-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/notebook/evernote-web-flow-notebook-99ba4fbf-02-25f3557c-8050-4cd0-a912-52fce65877b9.webp` | https://mobbin.com/screens/25f3557c-8050-4cd0-a912-52fce65877b9 |
| 3 | `web/flows/notebook/evernote-web-flow-notebook-99ba4fbf-03-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |

### Notebooks — `notebooks/` — https://mobbin.com/flows/f4f81f81-2421-4413-95f7-367f8cbc6d87

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/notebooks/evernote-web-flow-notebooks-f4f81f81-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/notebooks/evernote-web-flow-notebooks-f4f81f81-02-ac6391d7-21e6-486f-b612-68165dfe9c40.webp` | https://mobbin.com/screens/ac6391d7-21e6-486f-b612-68165dfe9c40 |

### Notes — `notes/` — https://mobbin.com/flows/656edee4-500d-4156-8314-b21f8dc9fa87

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/notes/evernote-web-flow-notes-656edee4-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/notes/evernote-web-flow-notes-656edee4-02-7ae9adee-069d-4c40-9d45-515419058252.webp` | https://mobbin.com/screens/7ae9adee-069d-4c40-9d45-515419058252 |
| 3 | `web/flows/notes/evernote-web-flow-notes-656edee4-03-91d00266-38dc-4db3-9760-abb3c19256e3.webp` | https://mobbin.com/screens/91d00266-38dc-4db3-9760-abb3c19256e3 |

### Notes — `notes/` — https://mobbin.com/flows/7392ba1d-cf0f-4310-ad0c-5837d11f1c71

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/notes/evernote-web-flow-notes-7392ba1d-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/notes/evernote-web-flow-notes-7392ba1d-02-032c4032-d4dd-4471-89a4-e1c39c6e68e2.webp` | https://mobbin.com/screens/032c4032-d4dd-4471-89a4-e1c39c6e68e2 |
| 3 | `web/flows/notes/evernote-web-flow-notes-7392ba1d-03-c164e165-6f73-4628-b6bc-33ae2b654ec5.webp` | https://mobbin.com/screens/c164e165-6f73-4628-b6bc-33ae2b654ec5 |

### Notifications — `notifications/` — https://mobbin.com/flows/7b135875-953e-4166-b236-40a361d135a9

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/notifications/evernote-web-flow-notifications-7b135875-01-3338d4e6-4a4f-4d02-8dd0-bc8f59549a89.webp` | https://mobbin.com/screens/3338d4e6-4a4f-4d02-8dd0-bc8f59549a89 |
| 2 | `web/flows/notifications/evernote-web-flow-notifications-7b135875-02-8b650ed0-5c2e-46c9-bb63-1e215238d84c.webp` | https://mobbin.com/screens/8b650ed0-5c2e-46c9-bb63-1e215238d84c |

### Onboarding — `onboarding/` — https://mobbin.com/flows/24dc21f5-ddd4-4b3f-89e2-412b2d5a247e

Actions: Creating Account, Inviting Teammates & Friends, Logging In, Onboarding. Screens: 28.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-01-b1f73b5d-4f66-4c61-8831-1c7c52eb1025.webp` | https://mobbin.com/screens/b1f73b5d-4f66-4c61-8831-1c7c52eb1025 |
| 2 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-02-8ed369df-5696-4a3a-bba4-888453f4ac87.webp` | https://mobbin.com/screens/8ed369df-5696-4a3a-bba4-888453f4ac87 |
| 3 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-03-cb1086cc-2b9b-4e1e-9e32-87564bf77d3a.webp` | https://mobbin.com/screens/cb1086cc-2b9b-4e1e-9e32-87564bf77d3a |
| 4 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-04-09158ed7-3011-4f6f-8e89-d88b7c6c3112.webp` | https://mobbin.com/screens/09158ed7-3011-4f6f-8e89-d88b7c6c3112 |
| 5 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-05-5805e22b-b581-43d7-b62a-a802ed5645c6.webp` | https://mobbin.com/screens/5805e22b-b581-43d7-b62a-a802ed5645c6 |
| 6 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-06-09c734cc-514c-4251-818e-23bc98eda9f4.webp` | https://mobbin.com/screens/09c734cc-514c-4251-818e-23bc98eda9f4 |
| 7 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-07-5a30e3bd-c2d4-4ac3-9d34-216a866eb466.webp` | https://mobbin.com/screens/5a30e3bd-c2d4-4ac3-9d34-216a866eb466 |
| 8 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-08-99a25253-eddb-45f7-921f-1f7b40039657.webp` | https://mobbin.com/screens/99a25253-eddb-45f7-921f-1f7b40039657 |
| 9 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-09-8b66af96-9944-4ae2-b0f8-3bfabf4b853f.webp` | https://mobbin.com/screens/8b66af96-9944-4ae2-b0f8-3bfabf4b853f |
| 10 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-10-11ca9c45-d92d-4a2d-ae18-f968c89c8095.webp` | https://mobbin.com/screens/11ca9c45-d92d-4a2d-ae18-f968c89c8095 |
| 11 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-11-df76ee6a-7041-4308-9aed-15ba258a2bb4.webp` | https://mobbin.com/screens/df76ee6a-7041-4308-9aed-15ba258a2bb4 |
| 12 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-12-9a6dc736-0d56-4449-86c1-ba18414765fd.webp` | https://mobbin.com/screens/9a6dc736-0d56-4449-86c1-ba18414765fd |
| 13 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-13-e5351f5a-72eb-41ea-8073-cc00888dd8d3.webp` | https://mobbin.com/screens/e5351f5a-72eb-41ea-8073-cc00888dd8d3 |
| 14 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-14-802bab9c-ef40-426e-b013-e27b2865024e.webp` | https://mobbin.com/screens/802bab9c-ef40-426e-b013-e27b2865024e |
| 15 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-15-d05282e4-c01a-4ed9-8412-56a4c710d9e8.webp` | https://mobbin.com/screens/d05282e4-c01a-4ed9-8412-56a4c710d9e8 |
| 16 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-16-b9cb5ccb-b56c-4681-b90b-a8c7a66e0d1e.webp` | https://mobbin.com/screens/b9cb5ccb-b56c-4681-b90b-a8c7a66e0d1e |
| 17 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-17-8064c463-31a4-4c38-9e66-3dde47400ffc.webp` | https://mobbin.com/screens/8064c463-31a4-4c38-9e66-3dde47400ffc |
| 18 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-18-c1edabb4-d08f-4eb0-9a91-c71d21c121bb.webp` | https://mobbin.com/screens/c1edabb4-d08f-4eb0-9a91-c71d21c121bb |
| 19 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-19-c5ff5418-bd94-4ee0-b00a-0fb80b4f26bb.webp` | https://mobbin.com/screens/c5ff5418-bd94-4ee0-b00a-0fb80b4f26bb |
| 20 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-20-4f0ac422-c7f2-4b1c-b9c1-4a6fe455cc96.webp` | https://mobbin.com/screens/4f0ac422-c7f2-4b1c-b9c1-4a6fe455cc96 |
| 21 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-21-e978dbce-4668-4af8-a44e-bad51ca9b02e.webp` | https://mobbin.com/screens/e978dbce-4668-4af8-a44e-bad51ca9b02e |
| 22 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-22-df2d33c3-db43-4f26-b7c2-fe7047553a0b.webp` | https://mobbin.com/screens/df2d33c3-db43-4f26-b7c2-fe7047553a0b |
| 23 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-23-a3dc7243-001e-45b0-b630-4c2286dbe99c.webp` | https://mobbin.com/screens/a3dc7243-001e-45b0-b630-4c2286dbe99c |
| 24 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-24-c6d09d56-75a8-4502-adf4-4e1c92a4059e.webp` | https://mobbin.com/screens/c6d09d56-75a8-4502-adf4-4e1c92a4059e |
| 25 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-25-b99cc7fc-2cc0-4a1e-a780-21617df6cf31.webp` | https://mobbin.com/screens/b99cc7fc-2cc0-4a1e-a780-21617df6cf31 |
| 26 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-26-392b54df-c819-4241-aa77-e72d6720cc38.webp` | https://mobbin.com/screens/392b54df-c819-4241-aa77-e72d6720cc38 |
| 27 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-27-58e152ec-b4f3-433c-945d-66f783fa8a54.webp` | https://mobbin.com/screens/58e152ec-b4f3-433c-945d-66f783fa8a54 |
| 28 | `web/flows/onboarding/evernote-web-flow-onboarding-24dc21f5-28-328c18a7-b565-41fe-b2a3-288dd7317b72.webp` | https://mobbin.com/screens/328c18a7-b565-41fe-b2a3-288dd7317b72 |

### Onboarding — `onboarding/` — https://mobbin.com/flows/a2fb9b44-330f-47d7-a13b-7efc64f4504b

Actions: Creating Account, Onboarding, Selecting & Choosing. Screens: 17.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-01-86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb.webp` | https://mobbin.com/screens/86c3f401-a1d4-4f2d-bb75-a40c7a3cc7bb |
| 2 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-02-12d56aa5-ea32-4c08-a4c3-b4894852d36c.webp` | https://mobbin.com/screens/12d56aa5-ea32-4c08-a4c3-b4894852d36c |
| 3 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-03-7ba6a272-c3f9-40a0-8e74-a484f0344db5.webp` | https://mobbin.com/screens/7ba6a272-c3f9-40a0-8e74-a484f0344db5 |
| 4 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-04-8a01ec48-3a3b-4d9a-9b74-48afad5e26aa.webp` | https://mobbin.com/screens/8a01ec48-3a3b-4d9a-9b74-48afad5e26aa |
| 5 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-05-2689dea3-0fb0-44f0-ac12-77f729ce8604.webp` | https://mobbin.com/screens/2689dea3-0fb0-44f0-ac12-77f729ce8604 |
| 6 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-06-bcd9f0c6-1468-40c9-bcdd-8b7aa65121b3.webp` | https://mobbin.com/screens/bcd9f0c6-1468-40c9-bcdd-8b7aa65121b3 |
| 7 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-07-5c273b73-5297-4033-af6f-3b71c8ab1788.webp` | https://mobbin.com/screens/5c273b73-5297-4033-af6f-3b71c8ab1788 |
| 8 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-08-107f3a26-510c-4d32-8852-d84d799a8559.webp` | https://mobbin.com/screens/107f3a26-510c-4d32-8852-d84d799a8559 |
| 9 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-09-60f18de7-4b7f-4c0e-9519-3c9996143f97.webp` | https://mobbin.com/screens/60f18de7-4b7f-4c0e-9519-3c9996143f97 |
| 10 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-10-784ccebb-4fd6-4823-8b63-af4e73996af8.webp` | https://mobbin.com/screens/784ccebb-4fd6-4823-8b63-af4e73996af8 |
| 11 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-11-6f520ec7-2cc2-4812-8d2c-dd53d66cc9c6.webp` | https://mobbin.com/screens/6f520ec7-2cc2-4812-8d2c-dd53d66cc9c6 |
| 12 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-12-f60a1d10-52a1-4207-a4e4-d3fbd34f35f8.webp` | https://mobbin.com/screens/f60a1d10-52a1-4207-a4e4-d3fbd34f35f8 |
| 13 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-13-d8e346e7-b663-47be-b442-5b8a343a09c7.webp` | https://mobbin.com/screens/d8e346e7-b663-47be-b442-5b8a343a09c7 |
| 14 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-14-40ee0dd0-881c-48fd-8dbb-0fe2a45cfd68.webp` | https://mobbin.com/screens/40ee0dd0-881c-48fd-8dbb-0fe2a45cfd68 |
| 15 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-15-271c9abf-292a-45d6-8a3a-5f0c355a6c0f.webp` | https://mobbin.com/screens/271c9abf-292a-45d6-8a3a-5f0c355a6c0f |
| 16 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-16-fa24293f-2f7f-43ce-925f-43856f65ba1a.webp` | https://mobbin.com/screens/fa24293f-2f7f-43ce-925f-43856f65ba1a |
| 17 | `web/flows/onboarding/evernote-web-flow-onboarding-a2fb9b44-17-54668973-b6ae-4230-a5a8-38426bc624df.webp` | https://mobbin.com/screens/54668973-b6ae-4230-a5a8-38426bc624df |

### Opening tasks in a note — `opening-tasks-in-a-note/` — https://mobbin.com/flows/aed47fe0-34cc-4216-9186-2140153c74c3

Actions: Misc. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/opening-tasks-in-a-note/evernote-web-flow-opening-tasks-in-a-note-aed47fe0-01-0cf81f55-0d68-445f-96f8-ae5905039491.webp` | https://mobbin.com/screens/0cf81f55-0d68-445f-96f8-ae5905039491 |
| 2 | `web/flows/opening-tasks-in-a-note/evernote-web-flow-opening-tasks-in-a-note-aed47fe0-02-bf2742a0-0f30-4ae2-b610-efce908a82d5.webp` | https://mobbin.com/screens/bf2742a0-0f30-4ae2-b610-efce908a82d5 |

### Pinning a note — `pinning-a-note/` — https://mobbin.com/flows/bafee9be-9b8f-470c-ae77-76a6b6d17c62

Actions: Favoriting & Pinning. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-bafee9be-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-bafee9be-02-2d3e6671-26e0-46c4-bd0d-7ae0fd719a20.webp` | https://mobbin.com/screens/2d3e6671-26e0-46c4-bd0d-7ae0fd719a20 |

### Pinning a note — `pinning-a-note/` — https://mobbin.com/flows/e0284e37-31b8-4954-b737-1a0eeb88cf79

Actions: Favoriting & Pinning, Selecting & Choosing. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-e0284e37-01-bfe9afea-de8a-482d-9457-4d025fc81b69.webp` | https://mobbin.com/screens/bfe9afea-de8a-482d-9457-4d025fc81b69 |
| 2 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-e0284e37-02-f863792c-9cf1-4336-9672-40587c6a6da3.webp` | https://mobbin.com/screens/f863792c-9cf1-4336-9672-40587c6a6da3 |
| 3 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-e0284e37-03-3418b46c-95b2-41b9-89fd-c21b294fc9bf.webp` | https://mobbin.com/screens/3418b46c-95b2-41b9-89fd-c21b294fc9bf |
| 4 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-e0284e37-04-577d557d-f448-4493-8b82-b201eda8c151.webp` | https://mobbin.com/screens/577d557d-f448-4493-8b82-b201eda8c151 |
| 5 | `web/flows/pinning-a-note/evernote-web-flow-pinning-a-note-e0284e37-05-6636a1c4-4750-41eb-91c7-517842855df7.webp` | https://mobbin.com/screens/6636a1c4-4750-41eb-91c7-517842855df7 |

### Pinning notes — `pinning-notes/` — https://mobbin.com/flows/3afb1db0-bb04-4e95-b7f9-7953d09d5474

Actions: Favoriting & Pinning. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/pinning-notes/evernote-web-flow-pinning-notes-3afb1db0-01-cf396b2c-7323-470d-afb4-0d09daf7675c.webp` | https://mobbin.com/screens/cf396b2c-7323-470d-afb4-0d09daf7675c |
| 2 | `web/flows/pinning-notes/evernote-web-flow-pinning-notes-3afb1db0-02-f1123da3-9e37-4472-a835-7f279ae232cc.webp` | https://mobbin.com/screens/f1123da3-9e37-4472-a835-7f279ae232cc |
| 3 | `web/flows/pinning-notes/evernote-web-flow-pinning-notes-3afb1db0-03-6c853004-6bef-4b80-a67f-c68a8e313d3b.webp` | https://mobbin.com/screens/6c853004-6bef-4b80-a67f-c68a8e313d3b |
| 4 | `web/flows/pinning-notes/evernote-web-flow-pinning-notes-3afb1db0-04-1f32d551-790d-4d4d-bce2-8a89858d31bc.webp` | https://mobbin.com/screens/1f32d551-790d-4d4d-bce2-8a89858d31bc |

### Publishing a note — `publishing-a-note/` — https://mobbin.com/flows/ffcfccee-918f-49de-83a9-b77ce076e7cc

Actions: Publishing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/publishing-a-note/evernote-web-flow-publishing-a-note-ffcfccee-01-87fb79cd-d5dd-4017-a47b-653e73af33f9.webp` | https://mobbin.com/screens/87fb79cd-d5dd-4017-a47b-653e73af33f9 |
| 2 | `web/flows/publishing-a-note/evernote-web-flow-publishing-a-note-ffcfccee-02-c20f98e3-f6db-4803-ace4-d95dd4f53f1e.webp` | https://mobbin.com/screens/c20f98e3-f6db-4803-ace4-d95dd4f53f1e |
| 3 | `web/flows/publishing-a-note/evernote-web-flow-publishing-a-note-ffcfccee-03-1f1d29e9-f005-4e21-8d3d-1a20be008cd0.webp` | https://mobbin.com/screens/1f1d29e9-f005-4e21-8d3d-1a20be008cd0 |
| 4 | `web/flows/publishing-a-note/evernote-web-flow-publishing-a-note-ffcfccee-04-2019a2b4-4406-43f9-8070-486f0aa14b3a.webp` | https://mobbin.com/screens/2019a2b4-4406-43f9-8070-486f0aa14b3a |

### Publishing a space — `publishing-a-space/` — https://mobbin.com/flows/df664b59-3ae6-4cc6-b0cf-dd89b0aee284

Actions: Publishing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/publishing-a-space/evernote-web-flow-publishing-a-space-df664b59-01-1f32d551-790d-4d4d-bce2-8a89858d31bc.webp` | https://mobbin.com/screens/1f32d551-790d-4d4d-bce2-8a89858d31bc |
| 2 | `web/flows/publishing-a-space/evernote-web-flow-publishing-a-space-df664b59-02-a1b18fc6-2651-41f6-972b-9c7ebdf05605.webp` | https://mobbin.com/screens/a1b18fc6-2651-41f6-972b-9c7ebdf05605 |
| 3 | `web/flows/publishing-a-space/evernote-web-flow-publishing-a-space-df664b59-03-59650ed8-b3ad-4077-9849-50fd5ae2b017.webp` | https://mobbin.com/screens/59650ed8-b3ad-4077-9849-50fd5ae2b017 |
| 4 | `web/flows/publishing-a-space/evernote-web-flow-publishing-a-space-df664b59-04-edaaf22d-6e5b-428e-bd22-1a53bae1fbdb.webp` | https://mobbin.com/screens/edaaf22d-6e5b-428e-bd22-1a53bae1fbdb |

### Removing sketches — `removing-sketches/` — https://mobbin.com/flows/10249253-eb82-4fe5-9aa2-bcb5ac3bed52

Actions: Deleting & Removing. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/removing-sketches/evernote-web-flow-removing-sketches-10249253-01-e0a36aa9-6e01-46c7-a865-6691bef8c354.webp` | https://mobbin.com/screens/e0a36aa9-6e01-46c7-a865-6691bef8c354 |
| 2 | `web/flows/removing-sketches/evernote-web-flow-removing-sketches-10249253-02-c46e56bb-8523-4ddc-853a-75d38bd12b7d.webp` | https://mobbin.com/screens/c46e56bb-8523-4ddc-853a-75d38bd12b7d |
| 3 | `web/flows/removing-sketches/evernote-web-flow-removing-sketches-10249253-03-86242ef1-d52a-44cb-9329-55cd8fb820ae.webp` | https://mobbin.com/screens/86242ef1-d52a-44cb-9329-55cd8fb820ae |

### Renaming a note — `renaming-a-note/` — https://mobbin.com/flows/3ffa8ae3-54a4-496d-a347-db229b6afafa

Actions: Editing & Updating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/renaming-a-note/evernote-web-flow-renaming-a-note-3ffa8ae3-01-0fd2e929-7f58-4258-9509-157ccd0182d8.webp` | https://mobbin.com/screens/0fd2e929-7f58-4258-9509-157ccd0182d8 |
| 2 | `web/flows/renaming-a-note/evernote-web-flow-renaming-a-note-3ffa8ae3-02-8aa4ccf9-7a04-4451-9bac-a07a8e209442.webp` | https://mobbin.com/screens/8aa4ccf9-7a04-4451-9bac-a07a8e209442 |
| 3 | `web/flows/renaming-a-note/evernote-web-flow-renaming-a-note-3ffa8ae3-03-3cb92c7a-178d-4d01-968f-a08be64fcc45.webp` | https://mobbin.com/screens/3cb92c7a-178d-4d01-968f-a08be64fcc45 |
| 4 | `web/flows/renaming-a-note/evernote-web-flow-renaming-a-note-3ffa8ae3-04-3a2c934b-3779-416e-819e-34c41308463b.webp` | https://mobbin.com/screens/3a2c934b-3779-416e-819e-34c41308463b |
| 5 | `web/flows/renaming-a-note/evernote-web-flow-renaming-a-note-3ffa8ae3-05-c0772487-21c1-459e-b767-4fef25431f28.webp` | https://mobbin.com/screens/c0772487-21c1-459e-b767-4fef25431f28 |

### Renaming a notebook — `renaming-a-notebook/` — https://mobbin.com/flows/1d81ad3a-1c2d-48e6-b9bd-db1116e7da6a

Actions: Editing & Updating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/renaming-a-notebook/evernote-web-flow-renaming-a-notebook-1d81ad3a-01-9d0c44d4-8cdd-40a0-950d-d599a514f198.webp` | https://mobbin.com/screens/9d0c44d4-8cdd-40a0-950d-d599a514f198 |
| 2 | `web/flows/renaming-a-notebook/evernote-web-flow-renaming-a-notebook-1d81ad3a-02-fa0640db-48f9-41c7-8e08-a038cfc6fe75.webp` | https://mobbin.com/screens/fa0640db-48f9-41c7-8e08-a038cfc6fe75 |
| 3 | `web/flows/renaming-a-notebook/evernote-web-flow-renaming-a-notebook-1d81ad3a-03-09138f0f-8518-41ca-a2a8-ef070cf23956.webp` | https://mobbin.com/screens/09138f0f-8518-41ca-a2a8-ef070cf23956 |
| 4 | `web/flows/renaming-a-notebook/evernote-web-flow-renaming-a-notebook-1d81ad3a-04-e4640d2b-8b52-4fab-b970-43330642a136.webp` | https://mobbin.com/screens/e4640d2b-8b52-4fab-b970-43330642a136 |
| 5 | `web/flows/renaming-a-notebook/evernote-web-flow-renaming-a-notebook-1d81ad3a-05-e998768e-95e3-4d79-82b9-91c197336d7c.webp` | https://mobbin.com/screens/e998768e-95e3-4d79-82b9-91c197336d7c |

### Replacing a note — `replacing-a-note/` — https://mobbin.com/flows/1050157e-6c02-4fce-94f8-b7ea726ebc8f

Actions: Editing & Updating. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-02-4f826a6e-f431-4f12-86eb-64741d9194a8.webp` | https://mobbin.com/screens/4f826a6e-f431-4f12-86eb-64741d9194a8 |
| 3 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-03-ddb480a9-7759-422e-ab77-09a85ab9b3a8.webp` | https://mobbin.com/screens/ddb480a9-7759-422e-ab77-09a85ab9b3a8 |
| 4 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-04-5daa0a1a-b42f-4abd-8d3c-2cbd13dd3aa2.webp` | https://mobbin.com/screens/5daa0a1a-b42f-4abd-8d3c-2cbd13dd3aa2 |
| 5 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-05-9dc91396-174f-4741-905c-a17a136db92f.webp` | https://mobbin.com/screens/9dc91396-174f-4741-905c-a17a136db92f |
| 6 | `web/flows/replacing-a-note/evernote-web-flow-replacing-a-note-1050157e-06-2a51b661-c84f-4743-bae6-61e10ae23357.webp` | https://mobbin.com/screens/2a51b661-c84f-4743-bae6-61e10ae23357 |

### Replacing text — `replacing-text/` — https://mobbin.com/flows/d23566e7-5c3f-4ef0-a76c-260d48e2a361

Actions: Editing & Updating. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-01-ae4cc8ce-0c62-445d-8f00-b0102b643270.webp` | https://mobbin.com/screens/ae4cc8ce-0c62-445d-8f00-b0102b643270 |
| 2 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-02-618b83f6-ec63-41fb-bf7d-8602fc860e7a.webp` | https://mobbin.com/screens/618b83f6-ec63-41fb-bf7d-8602fc860e7a |
| 3 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-03-7e389c05-513f-4f45-b871-3be3914f7c8b.webp` | https://mobbin.com/screens/7e389c05-513f-4f45-b871-3be3914f7c8b |
| 4 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-04-c424b5c0-4012-4c76-9808-7a9f2a6d4f67.webp` | https://mobbin.com/screens/c424b5c0-4012-4c76-9808-7a9f2a6d4f67 |
| 5 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-05-22bd6d12-9536-4041-ab07-046d8dd7f794.webp` | https://mobbin.com/screens/22bd6d12-9536-4041-ab07-046d8dd7f794 |
| 6 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-06-da24643a-9813-4014-9f3f-28ce64cfc8cd.webp` | https://mobbin.com/screens/da24643a-9813-4014-9f3f-28ce64cfc8cd |
| 7 | `web/flows/replacing-text/evernote-web-flow-replacing-text-d23566e7-07-d68b5725-ceeb-4e56-adca-5a014035d6b8.webp` | https://mobbin.com/screens/d68b5725-ceeb-4e56-adca-5a014035d6b8 |

### Resetting password — `resetting-password/` — https://mobbin.com/flows/0aa9ff2d-3bfa-4ae6-914a-758110a69a12

Actions: Resetting Password. Screens: 9.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-01-59b9ac17-676e-4df2-b362-7d1e345e67d3.webp` | https://mobbin.com/screens/59b9ac17-676e-4df2-b362-7d1e345e67d3 |
| 2 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-02-b5c5d965-6acf-4df6-85fc-15b209aa8d73.webp` | https://mobbin.com/screens/b5c5d965-6acf-4df6-85fc-15b209aa8d73 |
| 3 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-03-c46adbf2-e1d9-43ca-ae80-8bdaa1f4da3e.webp` | https://mobbin.com/screens/c46adbf2-e1d9-43ca-ae80-8bdaa1f4da3e |
| 4 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-04-785d5596-6aec-4ebc-9500-db629f291db4.webp` | https://mobbin.com/screens/785d5596-6aec-4ebc-9500-db629f291db4 |
| 5 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-05-e9691699-60c1-452b-b746-3a91b7c2be6b.webp` | https://mobbin.com/screens/e9691699-60c1-452b-b746-3a91b7c2be6b |
| 6 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-06-b57a1de1-3291-4dcd-8c11-aed9b8602979.webp` | https://mobbin.com/screens/b57a1de1-3291-4dcd-8c11-aed9b8602979 |
| 7 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-07-7e9cb66f-34be-4830-8e3e-5a4057ce4b23.webp` | https://mobbin.com/screens/7e9cb66f-34be-4830-8e3e-5a4057ce4b23 |
| 8 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-08-cc8d1711-dcac-4316-8e23-94bcacce9ac6.webp` | https://mobbin.com/screens/cc8d1711-dcac-4316-8e23-94bcacce9ac6 |
| 9 | `web/flows/resetting-password/evernote-web-flow-resetting-password-0aa9ff2d-09-10cc7581-2ee3-42b0-b49b-024f57328d5e.webp` | https://mobbin.com/screens/10cc7581-2ee3-42b0-b49b-024f57328d5e |

### Restoring a note — `restoring-a-note/` — https://mobbin.com/flows/6d089e0c-7597-41b4-b3b9-238439e3abc1

Actions: Misc. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-6d089e0c-01-87d819df-ed76-4691-992d-ec33eb73b8fe.webp` | https://mobbin.com/screens/87d819df-ed76-4691-992d-ec33eb73b8fe |
| 2 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-6d089e0c-02-e08dec82-3b10-4339-aaf2-07386961c0cf.webp` | https://mobbin.com/screens/e08dec82-3b10-4339-aaf2-07386961c0cf |
| 3 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-6d089e0c-03-fd141f98-1942-4daf-85d8-a1f9463da31c.webp` | https://mobbin.com/screens/fd141f98-1942-4daf-85d8-a1f9463da31c |
| 4 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-6d089e0c-04-cb4ab148-0840-4b7a-8b38-c43273b87bcd.webp` | https://mobbin.com/screens/cb4ab148-0840-4b7a-8b38-c43273b87bcd |
| 5 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-6d089e0c-05-303eb9f2-6849-4d4e-be7d-dac39d15c587.webp` | https://mobbin.com/screens/303eb9f2-6849-4d4e-be7d-dac39d15c587 |

### Restoring a note — `restoring-a-note/` — https://mobbin.com/flows/d4998bf5-9401-42e0-a4c0-8b2cbf43f2a3

Actions: Misc. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-d4998bf5-01-51fb87db-8461-43b7-871d-af57004c72cf.webp` | https://mobbin.com/screens/51fb87db-8461-43b7-871d-af57004c72cf |
| 2 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-d4998bf5-02-453fd43e-8d7f-4548-9542-a7dbb6bd30bb.webp` | https://mobbin.com/screens/453fd43e-8d7f-4548-9542-a7dbb6bd30bb |
| 3 | `web/flows/restoring-a-note/evernote-web-flow-restoring-a-note-d4998bf5-03-ba36c98a-663c-43ab-a614-a3ada51ed34a.webp` | https://mobbin.com/screens/ba36c98a-663c-43ab-a614-a3ada51ed34a |

### Restoring a version — `restoring-a-version/` — https://mobbin.com/flows/633e3ef2-e394-44e5-afa3-55fb6808efdd

Actions: Misc. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-633e3ef2-01-ae4cc8ce-0c62-445d-8f00-b0102b643270.webp` | https://mobbin.com/screens/ae4cc8ce-0c62-445d-8f00-b0102b643270 |
| 2 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-633e3ef2-02-a8ca41e1-5826-44d7-8fc3-f2f242a4fd5b.webp` | https://mobbin.com/screens/a8ca41e1-5826-44d7-8fc3-f2f242a4fd5b |
| 3 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-633e3ef2-03-f3c3d944-1711-4fa0-b4e3-06655e581a71.webp` | https://mobbin.com/screens/f3c3d944-1711-4fa0-b4e3-06655e581a71 |

### Restoring a version — `restoring-a-version/` — https://mobbin.com/flows/ba9122f1-0b49-4436-88cf-eb1bb7a6c88a

Actions: Misc. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-ba9122f1-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-ba9122f1-02-eadc3d46-593d-4448-b7d0-432113f215b5.webp` | https://mobbin.com/screens/eadc3d46-593d-4448-b7d0-432113f215b5 |
| 3 | `web/flows/restoring-a-version/evernote-web-flow-restoring-a-version-ba9122f1-03-619f85ef-d314-4717-b134-3ceabcef676f.webp` | https://mobbin.com/screens/619f85ef-d314-4717-b134-3ceabcef676f |

### Saving a note as a template — `saving-a-note-as-a-template/` — https://mobbin.com/flows/a6917a1a-9457-4b77-8aaa-35c1429df036

Actions: Saving to Collection. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/saving-a-note-as-a-template/evernote-web-flow-saving-a-note-as-a-template-a6917a1a-01-7de54ec9-2d9a-47bb-931c-8757a33f8ef8.webp` | https://mobbin.com/screens/7de54ec9-2d9a-47bb-931c-8757a33f8ef8 |
| 2 | `web/flows/saving-a-note-as-a-template/evernote-web-flow-saving-a-note-as-a-template-a6917a1a-02-e91d3c8f-257d-4b9f-b604-238ddde44ad2.webp` | https://mobbin.com/screens/e91d3c8f-257d-4b9f-b604-238ddde44ad2 |
| 3 | `web/flows/saving-a-note-as-a-template/evernote-web-flow-saving-a-note-as-a-template-a6917a1a-03-20c01fa4-2c98-4589-bcef-f57ab8a58449.webp` | https://mobbin.com/screens/20c01fa4-2c98-4589-bcef-f57ab8a58449 |

### Searching Evernote — `searching-evernote/` — https://mobbin.com/flows/2b3f78e5-75de-4a94-963e-9a10b87f4fa8

Actions: Searching & Finding. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-2b3f78e5-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-2b3f78e5-02-8c2859dc-f28c-4159-b900-9923e2bc297f.webp` | https://mobbin.com/screens/8c2859dc-f28c-4159-b900-9923e2bc297f |
| 3 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-2b3f78e5-03-78471a44-0232-4ffa-8acd-f18bbbb2f532.webp` | https://mobbin.com/screens/78471a44-0232-4ffa-8acd-f18bbbb2f532 |
| 4 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-2b3f78e5-04-c562d6c9-b374-40ef-bf3a-08a65cb50b1f.webp` | https://mobbin.com/screens/c562d6c9-b374-40ef-bf3a-08a65cb50b1f |

### Searching Evernote — `searching-evernote/` — https://mobbin.com/flows/b95758b9-b958-4a71-8925-fbcf30affd84

Actions: Searching & Finding. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-b95758b9-01-7196b9ff-3d4c-454a-9039-cbb885d842b3.webp` | https://mobbin.com/screens/7196b9ff-3d4c-454a-9039-cbb885d842b3 |
| 2 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-b95758b9-02-3120a6eb-313c-492d-96f2-63b5656c80be.webp` | https://mobbin.com/screens/3120a6eb-313c-492d-96f2-63b5656c80be |
| 3 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-b95758b9-03-57114dfb-bc40-44f7-85a1-c6ff8867eddb.webp` | https://mobbin.com/screens/57114dfb-bc40-44f7-85a1-c6ff8867eddb |
| 4 | `web/flows/searching-evernote/evernote-web-flow-searching-evernote-b95758b9-04-46926538-2111-4bed-8396-4db69c067660.webp` | https://mobbin.com/screens/46926538-2111-4bed-8396-4db69c067660 |

### Searching Evernote with AI — `searching-evernote-with-ai/` — https://mobbin.com/flows/7d22c2d2-a94f-43a9-9a73-fc5b17b5be45

Actions: Searching & Finding. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-01-3120a6eb-313c-492d-96f2-63b5656c80be.webp` | https://mobbin.com/screens/3120a6eb-313c-492d-96f2-63b5656c80be |
| 2 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-02-6de321ed-17a7-4e32-ac7e-d80709bdbf7b.webp` | https://mobbin.com/screens/6de321ed-17a7-4e32-ac7e-d80709bdbf7b |
| 3 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-03-184ad205-a4eb-4a99-9969-793caeacb460.webp` | https://mobbin.com/screens/184ad205-a4eb-4a99-9969-793caeacb460 |
| 4 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-04-e8cbbd7c-6efe-4478-8393-55a52b392a05.webp` | https://mobbin.com/screens/e8cbbd7c-6efe-4478-8393-55a52b392a05 |
| 5 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-05-dd21ef3a-fd15-4f5b-aedd-82e36bd8f304.webp` | https://mobbin.com/screens/dd21ef3a-fd15-4f5b-aedd-82e36bd8f304 |
| 6 | `web/flows/searching-evernote-with-ai/evernote-web-flow-searching-evernote-with-ai-7d22c2d2-06-6b79f5c3-4931-4f7f-b035-43c4aed271ef.webp` | https://mobbin.com/screens/6b79f5c3-4931-4f7f-b035-43c4aed271ef |

### Searching files — `searching-files/` — https://mobbin.com/flows/e8078d52-c6d7-4110-96ea-a07ae4c1eaf3

Actions: Searching & Finding. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-files/evernote-web-flow-searching-files-e8078d52-01-5a0cb0ef-4014-4a76-bbd9-a47b53391a42.webp` | https://mobbin.com/screens/5a0cb0ef-4014-4a76-bbd9-a47b53391a42 |
| 2 | `web/flows/searching-files/evernote-web-flow-searching-files-e8078d52-02-62439269-f8d8-4420-8cda-886ad8168624.webp` | https://mobbin.com/screens/62439269-f8d8-4420-8cda-886ad8168624 |
| 3 | `web/flows/searching-files/evernote-web-flow-searching-files-e8078d52-03-15e34cca-e438-440f-bee3-e8090edbd436.webp` | https://mobbin.com/screens/15e34cca-e438-440f-bee3-e8090edbd436 |

### Searching tasks — `searching-tasks/` — https://mobbin.com/flows/c4f64771-a571-4a5a-828c-a359f726512c

Actions: Searching & Finding. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-tasks/evernote-web-flow-searching-tasks-c4f64771-01-0cf81f55-0d68-445f-96f8-ae5905039491.webp` | https://mobbin.com/screens/0cf81f55-0d68-445f-96f8-ae5905039491 |
| 2 | `web/flows/searching-tasks/evernote-web-flow-searching-tasks-c4f64771-02-d3d00808-e69c-4b87-88dd-3c1e5484fb81.webp` | https://mobbin.com/screens/d3d00808-e69c-4b87-88dd-3c1e5484fb81 |
| 3 | `web/flows/searching-tasks/evernote-web-flow-searching-tasks-c4f64771-03-647e369f-573c-4d21-849b-f1f743c0fbce.webp` | https://mobbin.com/screens/647e369f-573c-4d21-849b-f1f743c0fbce |

### Searching with AI — `searching-with-ai/` — https://mobbin.com/flows/c5ebda84-62e6-4c0d-8fb1-3449a940c2a5

Actions: Searching & Finding. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/searching-with-ai/evernote-web-flow-searching-with-ai-c5ebda84-01-8c2859dc-f28c-4159-b900-9923e2bc297f.webp` | https://mobbin.com/screens/8c2859dc-f28c-4159-b900-9923e2bc297f |
| 2 | `web/flows/searching-with-ai/evernote-web-flow-searching-with-ai-c5ebda84-02-22c2dfbc-d0ae-4c6b-b35b-f4292fa13e73.webp` | https://mobbin.com/screens/22c2dfbc-d0ae-4c6b-b35b-f4292fa13e73 |
| 3 | `web/flows/searching-with-ai/evernote-web-flow-searching-with-ai-c5ebda84-03-ed05961a-1b4c-431a-8d7c-ba198d415807.webp` | https://mobbin.com/screens/ed05961a-1b4c-431a-8d7c-ba198d415807 |

### Setting up an account — `setting-up-an-account/` — https://mobbin.com/flows/306cd07a-00ca-489c-9d7b-61c5eab480ac

Actions: Selecting & Choosing, Setting Up. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-01-cea6cae9-9dec-47d3-8b55-8dca82f15ff7.webp` | https://mobbin.com/screens/cea6cae9-9dec-47d3-8b55-8dca82f15ff7 |
| 2 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-02-cd61a078-295c-4dab-b1b4-17cb639e3f95.webp` | https://mobbin.com/screens/cd61a078-295c-4dab-b1b4-17cb639e3f95 |
| 3 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-03-a04336c3-2385-4008-b519-9bb435596783.webp` | https://mobbin.com/screens/a04336c3-2385-4008-b519-9bb435596783 |
| 4 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-04-9b600bb7-a32c-4d37-92de-3e15ddf20368.webp` | https://mobbin.com/screens/9b600bb7-a32c-4d37-92de-3e15ddf20368 |
| 5 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-05-91efee66-a727-4c11-9953-f561ee6c7ba3.webp` | https://mobbin.com/screens/91efee66-a727-4c11-9953-f561ee6c7ba3 |
| 6 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-06-b7cdba27-7451-429f-8ec7-b133e6a39c01.webp` | https://mobbin.com/screens/b7cdba27-7451-429f-8ec7-b133e6a39c01 |
| 7 | `web/flows/setting-up-an-account/evernote-web-flow-setting-up-an-account-306cd07a-07-b3616b17-584e-4c5c-a6b3-047e16ed31ea.webp` | https://mobbin.com/screens/b3616b17-584e-4c5c-a6b3-047e16ed31ea |

### Setting up two-factor authentication — `setting-up-two-factor-authentication/` — https://mobbin.com/flows/69aeb8fa-28f3-4f20-99ac-535cfbb7b596

Actions: Setting Up, Verifying. Screens: 14.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-01-8aff8891-8f9a-4f7b-970f-51d995094fe8.webp` | https://mobbin.com/screens/8aff8891-8f9a-4f7b-970f-51d995094fe8 |
| 2 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-02-11c50217-9001-4e1d-a276-049755f4ab18.webp` | https://mobbin.com/screens/11c50217-9001-4e1d-a276-049755f4ab18 |
| 3 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-03-beaeefc0-572b-4316-8d43-ca3245f7381e.webp` | https://mobbin.com/screens/beaeefc0-572b-4316-8d43-ca3245f7381e |
| 4 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-04-b74c5796-2051-40d2-8bef-e2fadf096746.webp` | https://mobbin.com/screens/b74c5796-2051-40d2-8bef-e2fadf096746 |
| 5 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-05-ceb0d970-ec1d-4ce1-83ff-3f810593dbb6.webp` | https://mobbin.com/screens/ceb0d970-ec1d-4ce1-83ff-3f810593dbb6 |
| 6 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-06-27719bd0-8b04-4407-9558-84d9317796df.webp` | https://mobbin.com/screens/27719bd0-8b04-4407-9558-84d9317796df |
| 7 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-07-15d2ee24-a632-4bb6-b4b5-a7851ef82e02.webp` | https://mobbin.com/screens/15d2ee24-a632-4bb6-b4b5-a7851ef82e02 |
| 8 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-08-57e2c611-2e97-44a0-9fbf-deedff1b603b.webp` | https://mobbin.com/screens/57e2c611-2e97-44a0-9fbf-deedff1b603b |
| 9 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-09-534fd646-e3ff-4e60-b6d2-2bec8e18d878.webp` | https://mobbin.com/screens/534fd646-e3ff-4e60-b6d2-2bec8e18d878 |
| 10 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-10-45ce1f1d-85f7-4cd6-aba5-a4164774aab9.webp` | https://mobbin.com/screens/45ce1f1d-85f7-4cd6-aba5-a4164774aab9 |
| 11 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-11-26141007-3f67-4271-b57d-f256df61c093.webp` | https://mobbin.com/screens/26141007-3f67-4271-b57d-f256df61c093 |
| 12 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-12-3377780c-0a92-44e4-8d65-dc67bca5993e.webp` | https://mobbin.com/screens/3377780c-0a92-44e4-8d65-dc67bca5993e |
| 13 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-13-86a81e5a-4c0a-4e86-b745-c9b2fbd3b8f1.webp` | https://mobbin.com/screens/86a81e5a-4c0a-4e86-b745-c9b2fbd3b8f1 |
| 14 | `web/flows/setting-up-two-factor-authentication/evernote-web-flow-setting-up-two-factor-authentication-69aeb8fa-14-c4c1955a-ec15-4d79-83a1-931935497317.webp` | https://mobbin.com/screens/c4c1955a-ec15-4d79-83a1-931935497317 |

### Settings — `settings/` — https://mobbin.com/flows/b01fef23-e164-4508-a38c-32447998b508

Actions: none listed. Screens: 12.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/settings/evernote-web-flow-settings-b01fef23-01-3338d4e6-4a4f-4d02-8dd0-bc8f59549a89.webp` | https://mobbin.com/screens/3338d4e6-4a4f-4d02-8dd0-bc8f59549a89 |
| 2 | `web/flows/settings/evernote-web-flow-settings-b01fef23-02-4d12dee7-ebfb-4e7d-acfe-829050383a96.webp` | https://mobbin.com/screens/4d12dee7-ebfb-4e7d-acfe-829050383a96 |
| 3 | `web/flows/settings/evernote-web-flow-settings-b01fef23-03-0f834439-6ead-40e8-8311-49e45a4076e1.webp` | https://mobbin.com/screens/0f834439-6ead-40e8-8311-49e45a4076e1 |
| 4 | `web/flows/settings/evernote-web-flow-settings-b01fef23-04-d70e0cd7-28d7-49d2-9b1c-78cb4117f133.webp` | https://mobbin.com/screens/d70e0cd7-28d7-49d2-9b1c-78cb4117f133 |
| 5 | `web/flows/settings/evernote-web-flow-settings-b01fef23-05-31243cad-2c81-4034-987b-eb2c4068ee43.webp` | https://mobbin.com/screens/31243cad-2c81-4034-987b-eb2c4068ee43 |
| 6 | `web/flows/settings/evernote-web-flow-settings-b01fef23-06-7d3eee4d-0b65-42ff-8021-ceaeed2c09ec.webp` | https://mobbin.com/screens/7d3eee4d-0b65-42ff-8021-ceaeed2c09ec |
| 7 | `web/flows/settings/evernote-web-flow-settings-b01fef23-07-77734ee2-d44f-4eb0-88a2-c4a663dbcc16.webp` | https://mobbin.com/screens/77734ee2-d44f-4eb0-88a2-c4a663dbcc16 |
| 8 | `web/flows/settings/evernote-web-flow-settings-b01fef23-08-1de97fb0-4a90-4cfa-ad53-963c5b159f27.webp` | https://mobbin.com/screens/1de97fb0-4a90-4cfa-ad53-963c5b159f27 |
| 9 | `web/flows/settings/evernote-web-flow-settings-b01fef23-09-b9be2c30-c190-4fde-b500-369c0448268e.webp` | https://mobbin.com/screens/b9be2c30-c190-4fde-b500-369c0448268e |
| 10 | `web/flows/settings/evernote-web-flow-settings-b01fef23-10-8c79fcff-5135-4dbc-af4a-282970dac0f3.webp` | https://mobbin.com/screens/8c79fcff-5135-4dbc-af4a-282970dac0f3 |
| 11 | `web/flows/settings/evernote-web-flow-settings-b01fef23-11-a12c0d35-80ec-4129-a5e8-556cb1865d44.webp` | https://mobbin.com/screens/a12c0d35-80ec-4129-a5e8-556cb1865d44 |
| 12 | `web/flows/settings/evernote-web-flow-settings-b01fef23-12-59c8dd23-9a4c-426c-b7ef-429272433cee.webp` | https://mobbin.com/screens/59c8dd23-9a4c-426c-b7ef-429272433cee |

### Settings — `settings/` — https://mobbin.com/flows/b3002d70-da78-4e68-b4a3-3e890e512eb4

Actions: none listed. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/settings/evernote-web-flow-settings-b3002d70-01-c4364308-5c77-46bc-a8de-66379bf25eeb.webp` | https://mobbin.com/screens/c4364308-5c77-46bc-a8de-66379bf25eeb |
| 2 | `web/flows/settings/evernote-web-flow-settings-b3002d70-02-1f44da94-c9f9-4e80-8a6b-fbbd23bbfeeb.webp` | https://mobbin.com/screens/1f44da94-c9f9-4e80-8a6b-fbbd23bbfeeb |
| 3 | `web/flows/settings/evernote-web-flow-settings-b3002d70-03-d9190a5c-6100-4157-8a47-1b8f4cb3dd56.webp` | https://mobbin.com/screens/d9190a5c-6100-4157-8a47-1b8f4cb3dd56 |
| 4 | `web/flows/settings/evernote-web-flow-settings-b3002d70-04-d60594bf-4529-4999-8d94-134289e10f10.webp` | https://mobbin.com/screens/d60594bf-4529-4999-8d94-134289e10f10 |
| 5 | `web/flows/settings/evernote-web-flow-settings-b3002d70-05-77b43e79-89b3-4577-80e1-4e1c2974c215.webp` | https://mobbin.com/screens/77b43e79-89b3-4577-80e1-4e1c2974c215 |
| 6 | `web/flows/settings/evernote-web-flow-settings-b3002d70-06-ad166994-b9ce-4246-9418-e1bd04c3af46.webp` | https://mobbin.com/screens/ad166994-b9ce-4246-9418-e1bd04c3af46 |

### Shared with me — `shared-with-me/` — https://mobbin.com/flows/2d323126-5ee1-43f2-a246-27c0fe90045d

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-2d323126-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-2d323126-02-19ac0976-4bd0-4bbd-a63a-7c8ee512ca18.webp` | https://mobbin.com/screens/19ac0976-4bd0-4bbd-a63a-7c8ee512ca18 |
| 3 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-2d323126-03-2608ab5c-ccab-48a7-81e8-fe1311afaa41.webp` | https://mobbin.com/screens/2608ab5c-ccab-48a7-81e8-fe1311afaa41 |
| 4 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-2d323126-04-279e5241-7625-4392-841d-cf07d4b0edcc.webp` | https://mobbin.com/screens/279e5241-7625-4392-841d-cf07d4b0edcc |

### Shared with me — `shared-with-me/` — https://mobbin.com/flows/3377b26b-a256-4ed5-a668-2f9737c90850

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-3377b26b-01-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |
| 2 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-3377b26b-02-6b1a61bd-0219-4dd9-a0d5-d02dfb15fa87.webp` | https://mobbin.com/screens/6b1a61bd-0219-4dd9-a0d5-d02dfb15fa87 |
| 3 | `web/flows/shared-with-me/evernote-web-flow-shared-with-me-3377b26b-03-b31c3d7e-da78-43ca-960c-b755dc1a7318.webp` | https://mobbin.com/screens/b31c3d7e-da78-43ca-960c-b755dc1a7318 |

### Sharing a note — `sharing-a-note/` — https://mobbin.com/flows/703a3b30-f66e-460f-82dc-4fcaf4a46ba8

Actions: Inviting Teammates & Friends, Sharing. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-01-e4edd516-70cd-436c-86e2-22d3c88aeec1.webp` | https://mobbin.com/screens/e4edd516-70cd-436c-86e2-22d3c88aeec1 |
| 2 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-02-87fb79cd-d5dd-4017-a47b-653e73af33f9.webp` | https://mobbin.com/screens/87fb79cd-d5dd-4017-a47b-653e73af33f9 |
| 3 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-03-d90f1a00-588c-44d0-a61e-e775caf41b5c.webp` | https://mobbin.com/screens/d90f1a00-588c-44d0-a61e-e775caf41b5c |
| 4 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-04-d2014c8a-2f83-475d-9281-08e468fe1c77.webp` | https://mobbin.com/screens/d2014c8a-2f83-475d-9281-08e468fe1c77 |
| 5 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-05-8644a1d7-4ade-4720-9ac3-4c1729038ee9.webp` | https://mobbin.com/screens/8644a1d7-4ade-4720-9ac3-4c1729038ee9 |
| 6 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-06-a665a9b9-32b0-426b-ada1-4d3823ad1e70.webp` | https://mobbin.com/screens/a665a9b9-32b0-426b-ada1-4d3823ad1e70 |
| 7 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-703a3b30-07-b6f68201-2e64-459f-b09b-a75f32f93419.webp` | https://mobbin.com/screens/b6f68201-2e64-459f-b09b-a75f32f93419 |

### Sharing a note — `sharing-a-note/` — https://mobbin.com/flows/7068a03e-2e8a-4351-9580-5dc84803c2a5

Actions: Sharing. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-7068a03e-01-ca7676e0-5d7a-4a5d-a3c6-2430e2f11865.webp` | https://mobbin.com/screens/ca7676e0-5d7a-4a5d-a3c6-2430e2f11865 |
| 2 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-7068a03e-02-77fa5a50-18f0-47d9-8f33-4872207e9f99.webp` | https://mobbin.com/screens/77fa5a50-18f0-47d9-8f33-4872207e9f99 |
| 3 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-7068a03e-03-a2c3af5b-9451-48f3-969a-e4c4fd761593.webp` | https://mobbin.com/screens/a2c3af5b-9451-48f3-969a-e4c4fd761593 |
| 4 | `web/flows/sharing-a-note/evernote-web-flow-sharing-a-note-7068a03e-04-4cbf6e4d-fd93-4006-901b-792ab496d35e.webp` | https://mobbin.com/screens/4cbf6e4d-fd93-4006-901b-792ab496d35e |

### Shortcuts — `shortcuts/` — https://mobbin.com/flows/4606963a-f0e7-436f-b5f0-8a8962884046

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/shortcuts/evernote-web-flow-shortcuts-4606963a-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/shortcuts/evernote-web-flow-shortcuts-4606963a-02-b999b449-7bd9-4000-afe2-1480e9db59ab.webp` | https://mobbin.com/screens/b999b449-7bd9-4000-afe2-1480e9db59ab |
| 3 | `web/flows/shortcuts/evernote-web-flow-shortcuts-4606963a-03-dbc21c95-c846-41a1-93ae-ea9b63e6df0e.webp` | https://mobbin.com/screens/dbc21c95-c846-41a1-93ae-ea9b63e6df0e |

### Sorting tasks — `sorting-tasks/` — https://mobbin.com/flows/cd4c00f8-b9f9-4470-80e2-58ef69c623a9

Actions: Filtering & Sorting. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/sorting-tasks/evernote-web-flow-sorting-tasks-cd4c00f8-01-e955b1c3-017b-48cb-b3a0-85762232ad8d.webp` | https://mobbin.com/screens/e955b1c3-017b-48cb-b3a0-85762232ad8d |
| 2 | `web/flows/sorting-tasks/evernote-web-flow-sorting-tasks-cd4c00f8-02-e0853e03-35be-4b73-a121-c76bdf19ee4e.webp` | https://mobbin.com/screens/e0853e03-35be-4b73-a121-c76bdf19ee4e |
| 3 | `web/flows/sorting-tasks/evernote-web-flow-sorting-tasks-cd4c00f8-03-cb731010-8c51-457d-ac65-9c77cd34b016.webp` | https://mobbin.com/screens/cb731010-8c51-457d-ac65-9c77cd34b016 |

### Spaces — `spaces/` — https://mobbin.com/flows/e6ab5d13-d281-41cd-97ba-8877e066c722

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/spaces/evernote-web-flow-spaces-e6ab5d13-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/spaces/evernote-web-flow-spaces-e6ab5d13-02-7eb40500-9691-4bb9-97dd-e0e381917101.webp` | https://mobbin.com/screens/7eb40500-9691-4bb9-97dd-e0e381917101 |
| 3 | `web/flows/spaces/evernote-web-flow-spaces-e6ab5d13-03-5cc2b952-6692-4705-80c1-f74b3aa7e9f5.webp` | https://mobbin.com/screens/5cc2b952-6692-4705-80c1-f74b3aa7e9f5 |
| 4 | `web/flows/spaces/evernote-web-flow-spaces-e6ab5d13-04-bfe9afea-de8a-482d-9457-4d025fc81b69.webp` | https://mobbin.com/screens/bfe9afea-de8a-482d-9457-4d025fc81b69 |

### Spaces — `spaces/` — https://mobbin.com/flows/f9b94cf8-5433-4e31-9949-4545a99700c4

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/spaces/evernote-web-flow-spaces-f9b94cf8-01-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |
| 2 | `web/flows/spaces/evernote-web-flow-spaces-f9b94cf8-02-c723a6bd-6b0b-4b25-a938-76bb2d2b61c6.webp` | https://mobbin.com/screens/c723a6bd-6b0b-4b25-a938-76bb2d2b61c6 |
| 3 | `web/flows/spaces/evernote-web-flow-spaces-f9b94cf8-03-cf396b2c-7323-470d-afb4-0d09daf7675c.webp` | https://mobbin.com/screens/cf396b2c-7323-470d-afb4-0d09daf7675c |

### Subscribing to a plan — `subscribing-to-a-plan/` — https://mobbin.com/flows/8be6375d-6615-4720-85b7-e3e5e255cdf3

Actions: Subscribing & Upgrading. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-01-392b54df-c819-4241-aa77-e72d6720cc38.webp` | https://mobbin.com/screens/392b54df-c819-4241-aa77-e72d6720cc38 |
| 2 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-02-93f3cd48-e146-419f-968e-60d0dc97fdcb.webp` | https://mobbin.com/screens/93f3cd48-e146-419f-968e-60d0dc97fdcb |
| 3 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-03-c5d781bf-15f5-450b-965e-6378428675d8.webp` | https://mobbin.com/screens/c5d781bf-15f5-450b-965e-6378428675d8 |
| 4 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-04-88db363f-1deb-4f58-8578-5c29cd835c32.webp` | https://mobbin.com/screens/88db363f-1deb-4f58-8578-5c29cd835c32 |
| 5 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-05-180d75fa-9cfd-4b34-9604-68fa404ad708.webp` | https://mobbin.com/screens/180d75fa-9cfd-4b34-9604-68fa404ad708 |
| 6 | `web/flows/subscribing-to-a-plan/evernote-web-flow-subscribing-to-a-plan-8be6375d-06-58e152ec-b4f3-433c-945d-66f783fa8a54.webp` | https://mobbin.com/screens/58e152ec-b4f3-433c-945d-66f783fa8a54 |

### Subscribing to Evernote Teams — `subscribing-to-evernote-teams/` — https://mobbin.com/flows/c03db741-98a4-4865-9ae9-36d94eb2c183

Actions: Subscribing & Upgrading. Screens: 11.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-01-54668973-b6ae-4230-a5a8-38426bc624df.webp` | https://mobbin.com/screens/54668973-b6ae-4230-a5a8-38426bc624df |
| 2 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-02-955829ff-0a19-4407-851d-590f54e3e748.webp` | https://mobbin.com/screens/955829ff-0a19-4407-851d-590f54e3e748 |
| 3 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-03-d7c05668-9171-4ef6-8f08-d7ab81437897.webp` | https://mobbin.com/screens/d7c05668-9171-4ef6-8f08-d7ab81437897 |
| 4 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-04-6600c177-6069-45a5-80c1-d28118df9545.webp` | https://mobbin.com/screens/6600c177-6069-45a5-80c1-d28118df9545 |
| 5 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-05-8fe59103-d316-43d2-a46f-b3e138cf38a8.webp` | https://mobbin.com/screens/8fe59103-d316-43d2-a46f-b3e138cf38a8 |
| 6 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-06-a8571fca-e09c-49c1-8983-a36b4ee9b0fc.webp` | https://mobbin.com/screens/a8571fca-e09c-49c1-8983-a36b4ee9b0fc |
| 7 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-07-c91c7a2b-2f84-4265-877b-d21a775a13e7.webp` | https://mobbin.com/screens/c91c7a2b-2f84-4265-877b-d21a775a13e7 |
| 8 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-08-3067e3a3-ea2d-4632-b71f-1c4df44a74b6.webp` | https://mobbin.com/screens/3067e3a3-ea2d-4632-b71f-1c4df44a74b6 |
| 9 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-09-167417e1-b9ee-431b-9c15-8e6743207316.webp` | https://mobbin.com/screens/167417e1-b9ee-431b-9c15-8e6743207316 |
| 10 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-10-70abf82c-a32a-4374-ac19-2ed92be31e21.webp` | https://mobbin.com/screens/70abf82c-a32a-4374-ac19-2ed92be31e21 |
| 11 | `web/flows/subscribing-to-evernote-teams/evernote-web-flow-subscribing-to-evernote-teams-c03db741-11-154a3871-054e-40a5-acd3-acd7306403a9.webp` | https://mobbin.com/screens/154a3871-054e-40a5-acd3-acd7306403a9 |

### Switching notes views — `switching-notes-views/` — https://mobbin.com/flows/e80b220e-f302-4d2e-aed9-e77333c6c49c

Actions: Switching View. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/switching-notes-views/evernote-web-flow-switching-notes-views-e80b220e-01-032c4032-d4dd-4471-89a4-e1c39c6e68e2.webp` | https://mobbin.com/screens/032c4032-d4dd-4471-89a4-e1c39c6e68e2 |
| 2 | `web/flows/switching-notes-views/evernote-web-flow-switching-notes-views-e80b220e-02-98d68e8c-e100-4c18-a760-78fe88af4bb2.webp` | https://mobbin.com/screens/98d68e8c-e100-4c18-a760-78fe88af4bb2 |
| 3 | `web/flows/switching-notes-views/evernote-web-flow-switching-notes-views-e80b220e-03-d6b86f8b-cd2e-4e55-b0ae-30f45a6cd893.webp` | https://mobbin.com/screens/d6b86f8b-cd2e-4e55-b0ae-30f45a6cd893 |
| 4 | `web/flows/switching-notes-views/evernote-web-flow-switching-notes-views-e80b220e-04-04624a41-6ddb-4c59-8203-2db8bd3cef6c.webp` | https://mobbin.com/screens/04624a41-6ddb-4c59-8203-2db8bd3cef6c |

### Switching to dark mode — `switching-to-dark-mode/` — https://mobbin.com/flows/07e93d26-41db-4757-9143-969be9d8d826

Actions: Switching to Dark Mode. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-01-4d12dee7-ebfb-4e7d-acfe-829050383a96.webp` | https://mobbin.com/screens/4d12dee7-ebfb-4e7d-acfe-829050383a96 |
| 2 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-02-16b98ddd-7951-4145-9499-5340a51da9cf.webp` | https://mobbin.com/screens/16b98ddd-7951-4145-9499-5340a51da9cf |
| 3 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-03-519dddb4-ce43-4db9-8d36-63b93107b6f5.webp` | https://mobbin.com/screens/519dddb4-ce43-4db9-8d36-63b93107b6f5 |
| 4 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-04-4ce67bd9-eb69-4b7c-b084-932b00058f28.webp` | https://mobbin.com/screens/4ce67bd9-eb69-4b7c-b084-932b00058f28 |
| 5 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-05-a9588993-79d9-4e0d-ac94-7732d340a3d8.webp` | https://mobbin.com/screens/a9588993-79d9-4e0d-ac94-7732d340a3d8 |
| 6 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-06-1ca25170-0748-4db7-b06a-dd3e1fef65aa.webp` | https://mobbin.com/screens/1ca25170-0748-4db7-b06a-dd3e1fef65aa |
| 7 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-07e93d26-07-67527212-b6e4-4627-add4-372d3b9231c9.webp` | https://mobbin.com/screens/67527212-b6e4-4627-add4-372d3b9231c9 |

### Switching to dark mode — `switching-to-dark-mode/` — https://mobbin.com/flows/1dc34ce9-a8f5-4714-aff2-40fc29ef165e

Actions: Switching to Dark Mode. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-01-1f44da94-c9f9-4e80-8a6b-fbbd23bbfeeb.webp` | https://mobbin.com/screens/1f44da94-c9f9-4e80-8a6b-fbbd23bbfeeb |
| 2 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-02-9dac4473-96e8-4d53-9a45-c5f96dcecc10.webp` | https://mobbin.com/screens/9dac4473-96e8-4d53-9a45-c5f96dcecc10 |
| 3 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-03-11c0f8bc-64a1-44ca-be29-dfdc3e34570d.webp` | https://mobbin.com/screens/11c0f8bc-64a1-44ca-be29-dfdc3e34570d |
| 4 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-04-150eaa91-ef91-4016-b085-beab280e8269.webp` | https://mobbin.com/screens/150eaa91-ef91-4016-b085-beab280e8269 |
| 5 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-05-77f4f048-5eda-4eca-b503-cf9ab0cb2c97.webp` | https://mobbin.com/screens/77f4f048-5eda-4eca-b503-cf9ab0cb2c97 |
| 6 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-06-0be7c945-ab38-40ba-a7fc-25f989981262.webp` | https://mobbin.com/screens/0be7c945-ab38-40ba-a7fc-25f989981262 |
| 7 | `web/flows/switching-to-dark-mode/evernote-web-flow-switching-to-dark-mode-1dc34ce9-07-b8bfa044-a512-4963-b05c-02c51819c7b1.webp` | https://mobbin.com/screens/b8bfa044-a512-4963-b05c-02c51819c7b1 |

### Switching view — `switching-view/` — https://mobbin.com/flows/569c4b43-a4ea-49a7-b2c8-2de1ece66bc8

Actions: Switching View. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/switching-view/evernote-web-flow-switching-view-569c4b43-01-7ae9adee-069d-4c40-9d45-515419058252.webp` | https://mobbin.com/screens/7ae9adee-069d-4c40-9d45-515419058252 |
| 2 | `web/flows/switching-view/evernote-web-flow-switching-view-569c4b43-02-6a711eb2-ebcd-403a-8da2-759d8be8d424.webp` | https://mobbin.com/screens/6a711eb2-ebcd-403a-8da2-759d8be8d424 |
| 3 | `web/flows/switching-view/evernote-web-flow-switching-view-569c4b43-03-f6328cfa-7160-4f91-8279-283b52ceae7d.webp` | https://mobbin.com/screens/f6328cfa-7160-4f91-8279-283b52ceae7d |
| 4 | `web/flows/switching-view/evernote-web-flow-switching-view-569c4b43-04-030f3097-6401-49ca-a38b-f4021e20b986.webp` | https://mobbin.com/screens/030f3097-6401-49ca-a38b-f4021e20b986 |
| 5 | `web/flows/switching-view/evernote-web-flow-switching-view-569c4b43-05-e840786a-8057-4892-b0cb-7d8d1bd2c5ad.webp` | https://mobbin.com/screens/e840786a-8057-4892-b0cb-7d8d1bd2c5ad |

### Switching views — `switching-views/` — https://mobbin.com/flows/f0b2787f-22b7-430f-9014-f8d182fc74df

Actions: Switching View. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/switching-views/evernote-web-flow-switching-views-f0b2787f-01-ed5626f7-d7c5-467d-9c25-54c2fc77a90c.webp` | https://mobbin.com/screens/ed5626f7-d7c5-467d-9c25-54c2fc77a90c |
| 2 | `web/flows/switching-views/evernote-web-flow-switching-views-f0b2787f-02-28a007d9-b438-437e-87cd-4101e7afb4e0.webp` | https://mobbin.com/screens/28a007d9-b438-437e-87cd-4101e7afb4e0 |
| 3 | `web/flows/switching-views/evernote-web-flow-switching-views-f0b2787f-03-b903348d-717f-4922-90aa-e90811c4b1fa.webp` | https://mobbin.com/screens/b903348d-717f-4922-90aa-e90811c4b1fa |

### Tags — `tags/` — https://mobbin.com/flows/7d20212b-874d-440c-9a5e-8d662744693a

Actions: none listed. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/tags/evernote-web-flow-tags-7d20212b-01-56017ffd-23a7-4f2c-86db-2b2820b53d75.webp` | https://mobbin.com/screens/56017ffd-23a7-4f2c-86db-2b2820b53d75 |
| 2 | `web/flows/tags/evernote-web-flow-tags-7d20212b-02-be5f8571-5656-4b46-b236-6f7ef69920fe.webp` | https://mobbin.com/screens/be5f8571-5656-4b46-b236-6f7ef69920fe |
| 3 | `web/flows/tags/evernote-web-flow-tags-7d20212b-03-ee8bf4e8-69e7-4d02-9bdb-51f1f501c9ab.webp` | https://mobbin.com/screens/ee8bf4e8-69e7-4d02-9bdb-51f1f501c9ab |
| 4 | `web/flows/tags/evernote-web-flow-tags-7d20212b-04-cf201506-f457-42ff-ae0d-fbb4df2e10c0.webp` | https://mobbin.com/screens/cf201506-f457-42ff-ae0d-fbb4df2e10c0 |

### Tags — `tags/` — https://mobbin.com/flows/d8da1b8a-44b0-4734-886b-37662ce1e7d6

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/tags/evernote-web-flow-tags-d8da1b8a-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/tags/evernote-web-flow-tags-d8da1b8a-02-03d483e4-87c3-4dbe-bc48-36c3092cab00.webp` | https://mobbin.com/screens/03d483e4-87c3-4dbe-bc48-36c3092cab00 |

### Tasks — `tasks/` — https://mobbin.com/flows/2227d002-8015-44b3-9ade-19086838930f

Actions: none listed. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/tasks/evernote-web-flow-tasks-2227d002-01-8a1cf5b7-c30b-419c-b601-280c9cf6b1d9.webp` | https://mobbin.com/screens/8a1cf5b7-c30b-419c-b601-280c9cf6b1d9 |
| 2 | `web/flows/tasks/evernote-web-flow-tasks-2227d002-02-0cb78d0c-03bf-494b-a414-6ee01de02b50.webp` | https://mobbin.com/screens/0cb78d0c-03bf-494b-a414-6ee01de02b50 |
| 3 | `web/flows/tasks/evernote-web-flow-tasks-2227d002-03-8a848c69-c7c2-417c-84b2-f70a980b41c8.webp` | https://mobbin.com/screens/8a848c69-c7c2-417c-84b2-f70a980b41c8 |
| 4 | `web/flows/tasks/evernote-web-flow-tasks-2227d002-04-7490b881-151e-4aed-abb8-718c04986d1c.webp` | https://mobbin.com/screens/7490b881-151e-4aed-abb8-718c04986d1c |
| 5 | `web/flows/tasks/evernote-web-flow-tasks-2227d002-05-6696fff6-6fef-48cf-a229-3654e96a2c20.webp` | https://mobbin.com/screens/6696fff6-6fef-48cf-a229-3654e96a2c20 |

### Tasks — `tasks/` — https://mobbin.com/flows/d9ebd9dd-782a-4bf5-a20c-4d1ee975fc6b

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/tasks/evernote-web-flow-tasks-d9ebd9dd-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/tasks/evernote-web-flow-tasks-d9ebd9dd-02-3f3d3b26-c352-4562-b9b0-3e61f337690f.webp` | https://mobbin.com/screens/3f3d3b26-c352-4562-b9b0-3e61f337690f |
| 3 | `web/flows/tasks/evernote-web-flow-tasks-d9ebd9dd-03-e955b1c3-017b-48cb-b3a0-85762232ad8d.webp` | https://mobbin.com/screens/e955b1c3-017b-48cb-b3a0-85762232ad8d |

### Templates — `templates/` — https://mobbin.com/flows/a60ec146-4038-4bdf-95fc-8fb839f6bc88

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/templates/evernote-web-flow-templates-a60ec146-01-ad6b83b8-577d-44dd-9402-d26f432e3f65.webp` | https://mobbin.com/screens/ad6b83b8-577d-44dd-9402-d26f432e3f65 |
| 2 | `web/flows/templates/evernote-web-flow-templates-a60ec146-02-6d2595a4-a8b5-473f-9a74-6ab5bc91072a.webp` | https://mobbin.com/screens/6d2595a4-a8b5-473f-9a74-6ab5bc91072a |
| 3 | `web/flows/templates/evernote-web-flow-templates-a60ec146-03-4daed96d-34a0-4bd5-9f04-4b9b735d9152.webp` | https://mobbin.com/screens/4daed96d-34a0-4bd5-9f04-4b9b735d9152 |

### Transcribing a recording — `transcribing-a-recording/` — https://mobbin.com/flows/be3111c4-b1dd-4b95-8d7c-307ec7ede6af

Actions: Adding & Creating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/transcribing-a-recording/evernote-web-flow-transcribing-a-recording-be3111c4-01-dce3fcd4-35bc-49c9-ae94-bc0e977a9da4.webp` | https://mobbin.com/screens/dce3fcd4-35bc-49c9-ae94-bc0e977a9da4 |
| 2 | `web/flows/transcribing-a-recording/evernote-web-flow-transcribing-a-recording-be3111c4-02-7ea26b14-78f8-40a9-92bc-de73186c3821.webp` | https://mobbin.com/screens/7ea26b14-78f8-40a9-92bc-de73186c3821 |
| 3 | `web/flows/transcribing-a-recording/evernote-web-flow-transcribing-a-recording-be3111c4-03-e6cfffe5-5497-441b-a5dc-4d077d976adf.webp` | https://mobbin.com/screens/e6cfffe5-5497-441b-a5dc-4d077d976adf |

### Trash — `trash/` — https://mobbin.com/flows/23954228-166f-4c85-a3f9-1b8f0805479c

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/trash/evernote-web-flow-trash-23954228-01-3a29f920-f053-4256-952c-8dec95b99543.webp` | https://mobbin.com/screens/3a29f920-f053-4256-952c-8dec95b99543 |
| 2 | `web/flows/trash/evernote-web-flow-trash-23954228-02-7d901546-3549-407e-b1c0-818f5722398c.webp` | https://mobbin.com/screens/7d901546-3549-407e-b1c0-818f5722398c |
| 3 | `web/flows/trash/evernote-web-flow-trash-23954228-03-51fb87db-8461-43b7-871d-af57004c72cf.webp` | https://mobbin.com/screens/51fb87db-8461-43b7-871d-af57004c72cf |

### Trash — `trash/` — https://mobbin.com/flows/8e93f687-9a3e-4697-9803-b8d7a1ef3db7

Actions: none listed. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/trash/evernote-web-flow-trash-8e93f687-01-9f013f31-bef8-404f-bca4-1714077a7393.webp` | https://mobbin.com/screens/9f013f31-bef8-404f-bca4-1714077a7393 |
| 2 | `web/flows/trash/evernote-web-flow-trash-8e93f687-02-a52f1d26-91bd-4a4c-a3ba-59bf1e2fc30d.webp` | https://mobbin.com/screens/a52f1d26-91bd-4a4c-a3ba-59bf1e2fc30d |
| 3 | `web/flows/trash/evernote-web-flow-trash-8e93f687-03-61191050-81e9-477e-9101-0b8324ba43c0.webp` | https://mobbin.com/screens/61191050-81e9-477e-9101-0b8324ba43c0 |

### Turning off default reminders — `turning-off-default-reminders/` — https://mobbin.com/flows/04e31916-0c4f-417a-be20-40c3be4486cb

Actions: Turning On/Off. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/turning-off-default-reminders/evernote-web-flow-turning-off-default-reminders-04e31916-01-0cf81f55-0d68-445f-96f8-ae5905039491.webp` | https://mobbin.com/screens/0cf81f55-0d68-445f-96f8-ae5905039491 |
| 2 | `web/flows/turning-off-default-reminders/evernote-web-flow-turning-off-default-reminders-04e31916-02-ebe3b398-6051-423c-b60f-209cddf62948.webp` | https://mobbin.com/screens/ebe3b398-6051-423c-b60f-209cddf62948 |
| 3 | `web/flows/turning-off-default-reminders/evernote-web-flow-turning-off-default-reminders-04e31916-03-d5ca33e9-a95c-4a01-a8c7-a8c0399a00e0.webp` | https://mobbin.com/screens/d5ca33e9-a95c-4a01-a8c7-a8c0399a00e0 |
| 4 | `web/flows/turning-off-default-reminders/evernote-web-flow-turning-off-default-reminders-04e31916-04-5d27df5f-bf35-4b3f-b1a9-1a54168ac2fd.webp` | https://mobbin.com/screens/5d27df5f-bf35-4b3f-b1a9-1a54168ac2fd |
| 5 | `web/flows/turning-off-default-reminders/evernote-web-flow-turning-off-default-reminders-04e31916-05-0cd3fe6c-b54a-4ffc-99aa-874adc86ed2c.webp` | https://mobbin.com/screens/0cd3fe6c-b54a-4ffc-99aa-874adc86ed2c |

### Updating calendar settings — `updating-calendar-settings/` — https://mobbin.com/flows/32e7ae84-09ed-435d-9628-0601ca4e79ee

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-32e7ae84-01-d9190a5c-6100-4157-8a47-1b8f4cb3dd56.webp` | https://mobbin.com/screens/d9190a5c-6100-4157-8a47-1b8f4cb3dd56 |
| 2 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-32e7ae84-02-5ec28eb5-7311-4d63-8602-720b43c2fdbc.webp` | https://mobbin.com/screens/5ec28eb5-7311-4d63-8602-720b43c2fdbc |
| 3 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-32e7ae84-03-6f0171ec-72e5-49ca-9351-2184ccdff284.webp` | https://mobbin.com/screens/6f0171ec-72e5-49ca-9351-2184ccdff284 |
| 4 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-32e7ae84-04-18a811f1-a55c-4e1a-890a-f4a698ee0d6e.webp` | https://mobbin.com/screens/18a811f1-a55c-4e1a-890a-f4a698ee0d6e |

### Updating calendar settings — `updating-calendar-settings/` — https://mobbin.com/flows/df8ab372-67cc-409f-81cf-c04f35da77ae

Actions: Editing & Updating, Scheduling, Turning On/Off. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-01-ad6b83b8-577d-44dd-9402-d26f432e3f65.webp` | https://mobbin.com/screens/ad6b83b8-577d-44dd-9402-d26f432e3f65 |
| 2 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-02-b17de193-43b8-4443-9c65-d97788a56d3e.webp` | https://mobbin.com/screens/b17de193-43b8-4443-9c65-d97788a56d3e |
| 3 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-03-d14cc60c-6872-49f1-ae3e-d2fdf5b51c2b.webp` | https://mobbin.com/screens/d14cc60c-6872-49f1-ae3e-d2fdf5b51c2b |
| 4 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-04-326b9eaf-7182-4d24-b785-d63d423b977a.webp` | https://mobbin.com/screens/326b9eaf-7182-4d24-b785-d63d423b977a |
| 5 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-05-43e3c093-277a-4764-8045-ff32641e89b0.webp` | https://mobbin.com/screens/43e3c093-277a-4764-8045-ff32641e89b0 |
| 6 | `web/flows/updating-calendar-settings/evernote-web-flow-updating-calendar-settings-df8ab372-06-5a3270a6-8d37-486e-a6b8-87c9e3afc191.webp` | https://mobbin.com/screens/5a3270a6-8d37-486e-a6b8-87c9e3afc191 |

### Updating cell background — `updating-cell-background/` — https://mobbin.com/flows/e13d4456-fcf9-4f39-b8b0-80473a556714

Actions: Editing & Updating. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-01-b3987124-39eb-4dec-b39d-53c58679c820.webp` | https://mobbin.com/screens/b3987124-39eb-4dec-b39d-53c58679c820 |
| 2 | `web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-02-a93a2aa9-6147-45fb-aace-9bbd32320f75.webp` | https://mobbin.com/screens/a93a2aa9-6147-45fb-aace-9bbd32320f75 |
| 3 | `web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-03-e209caa0-17c7-4fe6-ae8d-ebceead4dc2d.webp` | https://mobbin.com/screens/e209caa0-17c7-4fe6-ae8d-ebceead4dc2d |
| 4 | `web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-04-61ee424c-09e7-4643-8c60-6e8328a94d3f.webp` | https://mobbin.com/screens/61ee424c-09e7-4643-8c60-6e8328a94d3f |

### Updating default task note — `updating-default-task-note/` — https://mobbin.com/flows/36d84cec-3e2b-40e2-84e6-f0b6a25c9925

Actions: Editing & Updating. Screens: 5.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-default-task-note/evernote-web-flow-updating-default-task-note-36d84cec-01-ebe3b398-6051-423c-b60f-209cddf62948.webp` | https://mobbin.com/screens/ebe3b398-6051-423c-b60f-209cddf62948 |
| 2 | `web/flows/updating-default-task-note/evernote-web-flow-updating-default-task-note-36d84cec-02-582acc47-9ca7-47a8-b42e-f64719e73916.webp` | https://mobbin.com/screens/582acc47-9ca7-47a8-b42e-f64719e73916 |
| 3 | `web/flows/updating-default-task-note/evernote-web-flow-updating-default-task-note-36d84cec-03-4b8bd3e0-22e6-4f31-a269-561d8a991c78.webp` | https://mobbin.com/screens/4b8bd3e0-22e6-4f31-a269-561d8a991c78 |
| 4 | `web/flows/updating-default-task-note/evernote-web-flow-updating-default-task-note-36d84cec-04-e4e88d6d-aecc-4af4-a771-f6abd74d7f5d.webp` | https://mobbin.com/screens/e4e88d6d-aecc-4af4-a771-f6abd74d7f5d |
| 5 | `web/flows/updating-default-task-note/evernote-web-flow-updating-default-task-note-36d84cec-05-67db558b-cee2-45f0-992a-bcd827d6a262.webp` | https://mobbin.com/screens/67db558b-cee2-45f0-992a-bcd827d6a262 |

### Updating notes settings — `updating-notes-settings/` — https://mobbin.com/flows/be9011c0-00b4-46c0-be69-108604670919

Actions: Editing & Updating, Selecting & Choosing. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-01-d60594bf-4529-4999-8d94-134289e10f10.webp` | https://mobbin.com/screens/d60594bf-4529-4999-8d94-134289e10f10 |
| 2 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-02-b51e6cc6-20e2-4085-b83f-299f6b8d56eb.webp` | https://mobbin.com/screens/b51e6cc6-20e2-4085-b83f-299f6b8d56eb |
| 3 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-03-04c2cc5e-9649-442f-8f23-13bf2722355b.webp` | https://mobbin.com/screens/04c2cc5e-9649-442f-8f23-13bf2722355b |
| 4 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-04-19e26069-fe45-4a8f-89a8-e8712d167127.webp` | https://mobbin.com/screens/19e26069-fe45-4a8f-89a8-e8712d167127 |
| 5 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-05-86cdeab4-f4fa-4e25-bb78-edfad6edd5ff.webp` | https://mobbin.com/screens/86cdeab4-f4fa-4e25-bb78-edfad6edd5ff |
| 6 | `web/flows/updating-notes-settings/evernote-web-flow-updating-notes-settings-be9011c0-06-9248e47d-7bdb-42f4-a0fb-dfb8ee61a259.webp` | https://mobbin.com/screens/9248e47d-7bdb-42f4-a0fb-dfb8ee61a259 |

### Updating personal settings — `updating-personal-settings/` — https://mobbin.com/flows/4fb14a62-a022-44b1-be03-89bb02de02b5

Actions: Editing & Updating. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-personal-settings/evernote-web-flow-updating-personal-settings-4fb14a62-01-7ad94ba8-9da8-4da6-8b53-214c83de1a67.webp` | https://mobbin.com/screens/7ad94ba8-9da8-4da6-8b53-214c83de1a67 |
| 2 | `web/flows/updating-personal-settings/evernote-web-flow-updating-personal-settings-4fb14a62-02-bfe38400-fed6-4aa8-b867-f1bd3e98c395.webp` | https://mobbin.com/screens/bfe38400-fed6-4aa8-b867-f1bd3e98c395 |
| 3 | `web/flows/updating-personal-settings/evernote-web-flow-updating-personal-settings-4fb14a62-03-4bc28067-a164-4e0b-86c6-f714fd793c9c.webp` | https://mobbin.com/screens/4bc28067-a164-4e0b-86c6-f714fd793c9c |

### Updating profile — `updating-profile/` — https://mobbin.com/flows/bd66a8e9-e54d-44fd-8f9f-35a949a6eb78

Actions: Editing Profile, Uploading & Downloading. Screens: 7.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-01-f6f3480c-d642-492e-ad09-a670553d9c3d.webp` | https://mobbin.com/screens/f6f3480c-d642-492e-ad09-a670553d9c3d |
| 2 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-02-6136a6e6-2b61-4192-8076-4f2aa39f8f02.webp` | https://mobbin.com/screens/6136a6e6-2b61-4192-8076-4f2aa39f8f02 |
| 3 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-03-11c82d74-75da-4bcd-8fd4-7a7265825185.webp` | https://mobbin.com/screens/11c82d74-75da-4bcd-8fd4-7a7265825185 |
| 4 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-04-66f8ab96-5505-4764-9c03-13356b016963.webp` | https://mobbin.com/screens/66f8ab96-5505-4764-9c03-13356b016963 |
| 5 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-05-6f31bffc-e664-4fa9-a938-583dc3d28155.webp` | https://mobbin.com/screens/6f31bffc-e664-4fa9-a938-583dc3d28155 |
| 6 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-06-bfce6e7b-2e6f-446a-b2ad-36b9efbe5c42.webp` | https://mobbin.com/screens/bfce6e7b-2e6f-446a-b2ad-36b9efbe5c42 |
| 7 | `web/flows/updating-profile/evernote-web-flow-updating-profile-bd66a8e9-07-728f2771-551c-4110-a500-af2576c74aed.webp` | https://mobbin.com/screens/728f2771-551c-4110-a500-af2576c74aed |

### Updating profile info — `updating-profile-info/` — https://mobbin.com/flows/882b7b01-7c39-4adf-ba59-fb3ab5c17ca5

Actions: Editing Profile. Screens: 4.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/updating-profile-info/evernote-web-flow-updating-profile-info-882b7b01-01-1ebc1851-52d6-4eff-9f35-08d3b761ac1a.webp` | https://mobbin.com/screens/1ebc1851-52d6-4eff-9f35-08d3b761ac1a |
| 2 | `web/flows/updating-profile-info/evernote-web-flow-updating-profile-info-882b7b01-02-1d3ac7cb-cb2d-416a-95ed-81bfbe07f8ae.webp` | https://mobbin.com/screens/1d3ac7cb-cb2d-416a-95ed-81bfbe07f8ae |
| 3 | `web/flows/updating-profile-info/evernote-web-flow-updating-profile-info-882b7b01-03-796b5a69-6041-4b3e-8406-a540c32b7d48.webp` | https://mobbin.com/screens/796b5a69-6041-4b3e-8406-a540c32b7d48 |
| 4 | `web/flows/updating-profile-info/evernote-web-flow-updating-profile-info-882b7b01-04-99607460-19c2-492c-9603-9e2bb84d6a91.webp` | https://mobbin.com/screens/99607460-19c2-492c-9603-9e2bb84d6a91 |

### Uploading a PDF file — `uploading-a-pdf-file/` — https://mobbin.com/flows/ce83f9f8-6e33-45ae-b1e7-3beb7a49a3b7

Actions: Uploading & Downloading. Screens: 3.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/uploading-a-pdf-file/evernote-web-flow-uploading-a-pdf-file-ce83f9f8-01-6166c945-fbc3-420e-ba6a-9ff62d684726.webp` | https://mobbin.com/screens/6166c945-fbc3-420e-ba6a-9ff62d684726 |
| 2 | `web/flows/uploading-a-pdf-file/evernote-web-flow-uploading-a-pdf-file-ce83f9f8-02-be13da25-846c-4df5-95e4-96aef8d59d0b.webp` | https://mobbin.com/screens/be13da25-846c-4df5-95e4-96aef8d59d0b |
| 3 | `web/flows/uploading-a-pdf-file/evernote-web-flow-uploading-a-pdf-file-ce83f9f8-03-80717efe-7483-4c8b-84c8-cc5cfe3b61ab.webp` | https://mobbin.com/screens/80717efe-7483-4c8b-84c8-cc5cfe3b61ab |

### Uploading a profile picture — `uploading-a-profile-picture/` — https://mobbin.com/flows/25e6a6ae-30a3-4596-801d-e48fb24ac1bf

Actions: Editing Profile, Uploading & Downloading. Screens: 6.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-01-36ac38fe-f89b-4f7f-b4e0-fa61565bba39.webp` | https://mobbin.com/screens/36ac38fe-f89b-4f7f-b4e0-fa61565bba39 |
| 2 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-02-c8d109d3-6b40-4411-b7f6-b7db80ed3ac4.webp` | https://mobbin.com/screens/c8d109d3-6b40-4411-b7f6-b7db80ed3ac4 |
| 3 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-03-181e23b6-e608-4d1c-8c37-b6d3609ca4e9.webp` | https://mobbin.com/screens/181e23b6-e608-4d1c-8c37-b6d3609ca4e9 |
| 4 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-04-b2597e2d-64ca-4679-bf6a-45f97e629323.webp` | https://mobbin.com/screens/b2597e2d-64ca-4679-bf6a-45f97e629323 |
| 5 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-05-a6a90deb-e01d-48ed-97ab-ec196ef5d086.webp` | https://mobbin.com/screens/a6a90deb-e01d-48ed-97ab-ec196ef5d086 |
| 6 | `web/flows/uploading-a-profile-picture/evernote-web-flow-uploading-a-profile-picture-25e6a6ae-06-1ebc1851-52d6-4eff-9f35-08d3b761ac1a.webp` | https://mobbin.com/screens/1ebc1851-52d6-4eff-9f35-08d3b761ac1a |

### View published note — `view-published-note/` — https://mobbin.com/flows/f02b9258-2397-4b2f-9c4c-206c527a1e2d

Actions: none listed. Screens: 2.

| # | File | Mobbin screen |
|---|------|---------------|
| 1 | `web/flows/view-published-note/evernote-web-flow-view-published-note-f02b9258-01-2019a2b4-4406-43f9-8070-486f0aa14b3a.webp` | https://mobbin.com/screens/2019a2b4-4406-43f9-8070-486f0aa14b3a |
| 2 | `web/flows/view-published-note/evernote-web-flow-view-published-note-f02b9258-02-9fcff153-df7d-4f8f-bb61-41f15a1c98d6.webp` | https://mobbin.com/screens/9fcff153-df7d-4f8f-bb61-41f15a1c98d6 |

