# Deep Research: On-change Automations / Triggers

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.800.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork Architecture, DataSource Echo Defense, EuroFormat Pattern

## Focus
Map the fork's event/refresh architecture and the integration template (EuroFormat) that a future automation module would follow.

## Actions Taken
- Read packet `spec.md` + `plan.md`: 016 is a Wave-6 OUT-OF-SCOPE decision record (no `vault.on` hook, no trigger engine, no cron templates, no network buttons). Revisit trigger: non-iCloud backend or a safe first-class Obsidian change hook.
- Inventoried fork `src/` (78 TS files: `main.ts`, `settings.ts`, `i18n.ts`, `data/*` 50 modules, `views/*` 40 modules) — no existing automation/trigger module.
- Read `data/DataSource.ts` (2136 lines): the event hub. `startListening()` registers `metadataCache.on("changed")` + `vault.on` modify/create/delete/rename ([DataSource.ts:145-192](file:src/data/DataSource.ts)).
- Traced the owned-path window defense: `markOwnedPath` ([DataSource.ts:2009-2024](file:src/data/DataSource.ts)) mints a 5-second `OwnedWriteCredit` per signal channel (metadataEvents/vaultEvents); `consumeOwnedPath` ([DataSource.ts:2036-2055](file:src/data/DataSource.ts)) consumes credits on event arrival; `scheduleNotify` ([DataSource.ts:1938-1966](file:src/data/DataSource.ts)) derives `origin: "plugin" | "external"` from credit consumption; `queuePendingChange` (1968) collapses vault+metadata signals in an 80ms debounce and merges origins external-wins; `notify()` (2001) fans out `DataChangeBatch`.
- Found the subscriber API: `onDataChanged(cb)` ([DataSource.ts:124-129](file:src/data/DataSource.ts)); current consumers: `DatabaseView.ts:742` and `EmbeddedDatabaseRenderer.ts:422`.
- Read `data/EuroFormat.ts` (42 lines) — the isolated-module fork pattern: one new module, exported functions, exactly 2 call-site edits (`views/CellRenderer.ts:13`, `views/SummaryRenderer.ts:7`), header comment "Local fork override. Kept in one module so it stays a small, rebasable diff."
- Read `data/RefreshCoordinator.ts` (176 lines): coalescing refresh coordinator (idle 2s / max 10s timers, blocked/eligibility retries, path-set dirty tracking) used by views to batch external changes.
- Read `main.ts` plugin wiring (onload): `new DataSource(app)` + `startListening(registerEvent)` at [main.ts:212-213](file:src/main.ts); vault/meta events schedule property-cache refresh only — no field-level change event exists today.

## Findings
- F1 (confirmed): The fork ALREADY computes exactly the signal an automation engine needs — `DataChange { kind, path, oldPath, origin: "plugin" | "external", sourceInstanceId }` — and delivers it as a debounced batch through `onDataChanged`. The iCloud metadata-modify echo problem named in the spec is already solved at the source: plugin-originated writes are consumed as owned credits (5s window) before any listener sees them ([DataSource.ts:2009-2055](file:src/data/DataSource.ts)).
- F2 (confirmed): An automation engine subscribing to `onDataChanged` (one call site in `main.ts` onload, pattern of `DatabaseView.ts:742`) gets origin-tagged external changes for free — "external" origin is precisely the trigger condition "when field X changed (not by the plugin itself)".
- F3 (confirmed): The EuroFormat pattern is the fork's established isolated-module convention: new `data/<Name>.ts` module + 1-3 import-site edits + zero changes inside upstream files' bodies. EuroFormat itself = 1 module + 2 call sites.
- F4 (confirmed): No field-level (column-level) change granularity exists yet. `DataChange` is per-file; an automation engine needs a before/after frontmatter diff at the field level. `DataSource.getRecordSnapshot(path)` ([DataSource.ts:239-244](file:src/data/DataSource.ts)) + a cached prior snapshot enables field-level diffs without touching upstream.
- F5 (confirmed): Write-back machinery for automation actions already exists: `enqueueWrite` per-file serialization ([DataSource.ts:99-122](file:src/data/DataSource.ts)), `markPluginWrite` ([DataSource.ts:247-249](file:src/data/DataSource.ts)) for callers that bypass DataSource IO, `processFrontMatter` mutations, and `frontmatterOverrides` optimistic overlay (10s expiry, [DataSource.ts:1664-1688](file:src/data/DataSource.ts)).
- F6 (confirmed): `RefreshCoordinator` shows the fork's coalescing idiom (idle/max timers, retry loops, dirty-path sets) — the same idiom an automation engine should use for its own evaluation queue (debounce 2s idle / 10s max are proven values in this codebase).
- F7 (confirmed): `settings.ts` + `SettingsTab` exist; automation definitions have a natural config home (plugin data JSON or per-database view config), but no settings schema for automations exists.

## Questions Answered
- Q3 (fork architecture + where change events already exist): answered — `DataSource.onDataChanged` is the hook; no field-level granularity yet.
- Q4 (EuroFormat pattern shape): answered — module + 1-3 call-site edits, rebase-safe by construction.

## Questions Remaining
- Q1, Q2, Q5, Q6, Q7 (Notion surface, AppFlowy/Anytype internals, iCloud/vault.on interplay, trigger algorithms, UI/UX).

## Next Focus
Notion's actual automations surface (WebFetch help docs + API webhooks) to fix the parity target.

## Ruled Out / Noted
- Raw `vault.on("modify")` as the trigger source: ruled out — DataSource already wraps it with owned-path windows; a second raw listener would bypass origin attribution and reintroduce the echo (spec REQ-001).

---

# Iteration 002 — Notion Automations: Surface, Triggers, Actions, Constraints

## Focus
Fix the Notion parity target: what does Notion actually ship for on-change automations, and which parts are portable to a local-first Obsidian plugin.

## Actions Taken
- WebSearch "Notion automations help when trigger do action database property change" → Notion Help Center `database-automations`, automation category page, Thomas Frank guide.
- WebFetch developers.notion.com webhooks guide (404) → fell back to WebSearch "Notion API webhooks limitations up to 3 webhooks throttle" → `developers.notion.com/reference/webhooks`, `notion.com/help/create-integrations-with-the-notion-api`, `notion.com/help/webhook-actions`.

## Findings
- F8 (confirmed, [SOURCE: https://www.notion.com/help/database-automations]): Notion database automations = trigger(s) + action sequence. Triggers: "page added", "property edited" (per-property, with edit-kind predicates, e.g. "phone number starting with 732"), "any property edited". Multiple triggers combine as any/all ("When any of these occur" / "When all of these occur").
- F9 (confirmed, same source): Actions: `Edit property` (same page; add/remove individual values for multi-select/people/relation), `Add page to` (create in another database with property fills), `Edit pages in` (bulk property edit across pages), `Send Slack notification`, plus webhook actions. This is the canonical action taxonomy.
- F10 (confirmed, [SOURCE: https://www.notion.com/help/category/automations]): "Database automations work over a three second window" — Notion's dedupe/evaluation window: user can remove a trigger and delete changes within 3s, resulting in no property change. Also: automations cannot trigger other automations (no recursion); automations only run if the page still matches the view's filters when the trigger occurs (view-scoped evaluation); locked databases don't trigger.
- F11 (confirmed, [SOURCE: https://thomasjfrank.com/notion-database-automations-the-complete-guide/]): Recurring/template-created pages do NOT trigger automations — only manual user changes do. Automation triggers are origin-filtered (Notion: user action only; fork analog: `origin === "external"` vs `"plugin"`).
- F12 (confirmed, [SOURCE: https://www.notion.com/help/formulas]): Actions can define formula variables referencing `Trigger page` (e.g. `Trigger page.Parent item.first()`, `.every(current.Status == "Done")`), enabling cross-record logic — the parity ceiling for "do" actions.
- F13 (confirmed, [SOURCE: https://developers.notion.com/reference/webhooks]): Notion webhook events like `page.content_updated` are AGGREGATED — "delivered with a short delay to avoid sending redundant updates" — i.e. Notion itself debounces change events (same idiom as fork `queuePendingChange` 80ms and RefreshCoordinator idle/max timers).
- F14 (confirmed, [SOURCE: https://developers.notion.com/reference/webhooks] + novumos.app): Webhook payloads are signal-only: they name the page and property ids that changed, never the new values — every event forces a follow-up API GET, which shares the 3 req/s per-integration rate limit. Design lesson: an automation engine should carry the diff payload locally (fork can read vault files directly, no API tax).
- F15 (confirmed, [SOURCE: https://www.notion.com/help/webhook-actions]): Notion's own webhook actions are limited: max 5 per automation, POST-only, page properties only (not contents), no workspace level. Network actions in the fork remain out of scope (spec REQ-002) — Notion's own constraints corroborate the risk profile.
- F16 (confirmed, [SOURCE: https://www.notion.com/help/create-integrations-with-the-notion-api]): Webhook actions ≠ connection webhooks; connection webhooks don't support user/workspace-settings changes — granularity limits are structural in Notion, not just an API artifact.

## Questions Answered
- Q1 (Notion parity target): answered. Portable target for the fork = trigger set {page added, property edited w/ per-field predicate, any property edited}, any/all multi-trigger semantics, actions {edit property same row, add page to (same vault folder/db), edit pages in}, 3s evaluation/dedupe window, no trigger-chaining, origin filtering, view-scope consideration.

## Questions Remaining
- Q2 (AppFlowy/Anytype internals), Q5 (iCloud/vault.on), Q6 (engine algorithms), Q7 (UI/UX).

## Next Focus
AppFlowy: flowy-database2 Rust grid model — how field/record updates are produced and consumed (DatabaseEvent, FieldChangedNotifier, row revision), and whether a change-rule evaluation exists.

## Ruled Out / Noted
- Slack/webhook actions: remain out of scope per spec REQ-002; Notion limits them to 5/automation POST-only — noted as corroborating evidence.
- Cron/recurring templates as automation triggers: Notion explicitly does NOT fire automations from recurring templates; the fork should treat recurring creation as a separate, also-out-of-scope surface.

---

# Iteration 003 — AppFlowy Rust: Cell Change Pipeline and Debounced Notification

## Focus
How AppFlowy's flowy-database2 models field/record change events — the reference for a change-event pipeline an automation engine can attach to.

## Actions Taken
- Listed `frontend/rust-lib/flowy-database2/src/`: entities/, services/ (cell, database, field, filter, group, sort, calculation), notification.rs.
- Read `services/database/database_observe.rs` (368 lines): the observer layer.
- Read `services/database/database_editor.rs` `update_cell_with_changeset` / `update_cell` / `did_update_row` (lines 968-1084).
- Read `frontend/rust-lib/flowy-notification/src/debounce.rs` (62 lines): the debounced notification sender.
- Checked `notification.rs`: `DatabaseNotification` enum (DidUpdateCell=40, DidUpdateRow=20, DidUpdateFields=22, DidUpdateField=50...).

## Findings
- F17 (confirmed, [SOURCE: appflowy/frontend/rust-lib/flowy-database2/src/services/database/database_editor.rs:968-1020](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/services/database/database_editor.rs)): Cell edits flow `update_cell_with_changeset` → `apply_cell_changeset` (type-specific mutator) → `update_cell`, which captures `old_row = self.get_row(...)` BEFORE mutation — the code comment says "It would be better to get the old cell" — then calls `did_update_row(view_id, row_id, field_id, old_row)`. Old-value capture before write is the core change-diff primitive.
- F18 (confirmed, [SOURCE: database_editor.rs:1057-1084](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/services/database/database_editor.rs)): `did_update_row` passes `&old_row` AND `&row` (new) plus the changed `field_id` to every view controller via `view.v_did_update_row(&old_row, &row, Some(field_id))` — the UI gets before/after + field identity. No automation/rule engine consumes this stream; it is UI-bound (same gap as the fork).
- F19 (confirmed, [SOURCE: database_observe.rs:41-86](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/services/database/database_observe.rs)): A dedicated observer `observe_rows_change` subscribes to the `RowChange` channel (`subscribe_row_change()`); `RowChange::DidUpdateCell { field_id, row_id, value }` → per-view `notify_row` + cell notify. Change events are a first-class typed stream, not raw callbacks.
- F20 (confirmed, [SOURCE: database_observe.rs:88-111](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/services/database/database_observe.rs)): `observe_field_change` exists for `FieldChange::DidUpdateField/DidCreateField/DidDeleteField` but is `#[allow(dead_code)]` with no-op match arms — AppFlowy has not built a trigger engine either; its event layer is the model to imitate, not its (absent) automation product.
- F21 (confirmed, [SOURCE: appflowy/frontend/rust-lib/flowy-notification/src/debounce.rs:8-62](file:../context/appflowy/frontend/rust-lib/flowy-notification/src/debounce.rs)): `DebounceNotificationSender` implements trailing-edge debounce PER SUBJECT KEY (`source-id-type`): a new send cancels the pending CancellationToken and re-arms the timer; only the latest payload is delivered after `debounce_in_millis`. This is exactly the "dedupe rapid edits into one event" mechanism Notion's aggregated webhooks use — and it is implemented in-process, not server-side.
- F22 (confirmed, [SOURCE: notification.rs:13-40](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/notification.rs)): `DatabaseNotification::DidUpdateCell = 40` and `DidUpdateRow = 20` are distinct channels — cell-level and row-level consumers can subscribe independently.

## Questions Answered
- Q2 (AppFlowy part): answered for the Rust backend — typed change stream (`RowChange`/`FieldChange` channels), old/new row capture at write time, per-subject-key debounced delivery.

## Questions Remaining
- Q2 (Anytype part), Q5, Q6, Q7.

## Next Focus
AppFlowy Flutter UI: how the database plugin surfaces change events (view controllers, `v_did_update_row`) and whether any automation-like settings surface exists in `appflowy_flutter/lib/plugins/database`.

## Ruled Out / Noted
- No AppFlowy trigger/automation engine exists in flowy-database2 (dead-code field observer, UI-only changesets) — the fork would be building a capability neither reference has shipped; parity target stays Notion's product surface.

---

# Iteration 004 — AppFlowy Flutter: Change Consumption in the Database UI

## Focus
How AppFlowy's Flutter database plugin consumes backend change events — the UI-layer half of the event pipeline — and whether any automation surface exists there.

## Actions Taken
- Mapped `appflowy_flutter/lib/plugins/database/`: application/ (blocs, row, cell), grid/, board/, calendar/, tab_bar/.
- Read `application/row/row_cache.dart` (416 lines): `RowChangesetNotifier` + `ChangedReason` freezed union.
- Read `application/cell/cell_cache.dart` (`CellMemCache`).
- Read `entities/row_entities.rs` `UpdatedRowPB` (row_entities.rs:392-404).
- Searched the whole database plugin for "automation" — zero matches.

## Findings
- F23 (confirmed, [SOURCE: appflowy_flutter/lib/plugins/database/application/row/row_cache.dart:177-201](file:../context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/row/row_cache.dart)): `_updateRows(UpdatedRowPB[])` invalidates cached cells for each `fieldId` in `updatedRow.fieldIds` (`_cellMemCache.remove(key)`) and emits `ChangedReason.update(indexes)`. The changeset carries WHICH fields changed, not values — UI re-fetches values from the Rust side. Signals are keyed by (rowId, fieldId) — the same cell-address keying an automation rule needs.
- F24 (confirmed, [SOURCE: row_cache.dart:222-228](file:../context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/row/row_cache.dart)): `onRowsChanged(void Function(ChangedReason))` is the subscription API; `ChangedReason` is a freezed union (insert/delete/update/fieldDidChange/reorderRows/updateRowsVisibility/setInitialRows/didFetchRow, row_cache.dart:370) — typed change reasons, not strings.
- F25 (confirmed, [SOURCE: appflowy/frontend/rust-lib/flowy-database2/src/entities/row_entities.rs:392-404](file:../context/appflowy/frontend/rust-lib/flowy-database2/src/entities/row_entities.rs)): `UpdatedRowPB { row_id, field_ids, row_meta }` — the wire format for "what changed" is minimal by design; AppFlowy chose invalidation + refetch over diff payloads.
- F26 (confirmed, searched `database/` plugin tree): zero occurrences of "automation" in the Flutter database plugin — no automation/trigger UI exists in AppFlowy at any layer (Rust dead-code observer + no Flutter surface).
- F27 (confirmed, [SOURCE: row_cache.dart:42-49](file:../context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/row/row_cache.dart)): field-deletion is handled by a `fieldsDelegate.onFieldsChanged` listener that purges cells per field — a change-granularity lesson: automations must handle field deletion/rename by invalidating rules referencing the field (the fork's `RelationTargetChange.ts` and `ColumnPropertySync.ts` already do this for views).

## Questions Answered
- Q2 (AppFlowy UI half): answered — change consumption is typed-notifier + cache invalidation; the (rowId, fieldId) cell address is the canonical change key; no automation surface exists.

## Questions Remaining
- Q2 (Anytype), Q5, Q6, Q7.

## Next Focus
Anytype: `anytype-ts/src/ts` — the event bus and object change notifications (space subscriptions, records updates, sync events), plus mobile push-relevant surfaces.

## Ruled Out / Noted
- Copying AppFlowy's changeset wire format (field_ids-only, no values): fork has direct vault access so it can carry values in the change record; carrying values avoids the refetch cost and enables immediate rule evaluation (Notion F14 lesson).

---

# Iteration 005 — Anytype: gRPC Event Stream, Detail Store, Notifications

## Focus
How Anytype's TS frontend receives object/relation changes and notifies the user — the third reference architecture for the fork's automation engine.

## Actions Taken
- Mapped `anytype-ts/src/ts/`: store/ (13 MobX stores incl. detail.ts 638 lines, record.ts 884, block.ts 1221, notification.ts), lib/api/ (dispatcher.ts 1915 lines), model/notification.ts.
- Read `src/ts/store/detail.ts` (DetailStore — object properties/relations).
- Read `src/ts/lib/api/dispatcher.ts` (startStream/flushEvents/event/reconnect).
- Read `src/ts/model/notification.ts` + `src/ts/store/notification.ts` (Notification model/store).
- Confirmed via repo CLAUDE.md: Anytype = Electron + gRPC streaming middleware (anytype-heart, Go).

## Findings
- F28 (confirmed, [SOURCE: anytype-ts/src/ts/lib/api/dispatcher.ts:81-123](file:../context/anytype-ts/src/ts/lib/api/dispatcher.ts)): All real-time updates arrive over ONE persistent gRPC stream (`listenSessionEvents`); events are BUFFERED and flushed in a single MobX `runInAction` transaction — rAF-batched when visible (250ms backstop timeout), 100ms when hidden/occluded. Comment: "MobX reactions fire only once at the end of the batch." This is frame-coalesced event delivery — the strongest evidence that batching at the event boundary is the correct pattern for change-driven UIs.
- F29 (confirmed, [SOURCE: dispatcher.ts:149-169](file:../context/anytype-ts/src/ts/lib/api/dispatcher.ts)): stream reconnection uses exponential backoff 3s/5s/60s (20/40 attempt steps) — the fork's engine should treat the change source (vault events) as always-on and never block on it; failure handling is separate from the write path.
- F30 (confirmed, [SOURCE: dispatcher.ts:216-260 + 339-349](file:../context/anytype-ts/src/ts/lib/api/dispatcher.ts)): typed event switch (`Event.<Type>`) with `Mapper.Event` payload mapping; per-object relation changes arrive as `ObjectRelationsAmend` → `S.Record.relationsSet(rootId, id, relations)` and `ObjectRelationsRemove` → `relationListDelete`. Anytype's change unit is (objectId, relationKey set) — the same (record, field) keying as AppFlowy's cell address.
- F31 (confirmed, [SOURCE: src/ts/store/detail.ts:34-54, 108-149](file:../context/anytype-ts/src/ts/store/detail.ts)): DetailStore = `Map<rootId, Map<objectId, ObservableMap<relationKey, value>>>`; `update()` merges per-key into the observable map — per-key MobX reactivity means a UI subscribes to exactly the relations it uses. Pattern for the fork: the automation engine needs per-field observation, which the fork's data layer (frontmatter per file) can deliver by diffing, since Obsidian has no per-key reactivity.
- F32 (confirmed, [SOURCE: src/ts/model/notification.ts:6-46](file:../context/anytype-ts/src/ts/model/notification.ts)): Anytype's Notification model: `{ id, type (Import/Export/...), status (Created/Read), createTime, isLocal, payload }` — a typed notification envelope with status transitions. If the fork ever surfaces automation runs, this is the state shape: id, type, status, timestamps, payload, local flag (iCloud-safe: notifications are ephemeral, never written into the vault).
- F33 (confirmed, [SOURCE: src/ts/store/notification.ts:47-88](file:../context/anytype-ts/src/ts/store/notification.ts)): NotificationStore.add is a MobX action; notifications are in-memory UI state, not persisted object changes — a safe model for automation run logs (keep them in plugin memory/settings, never in vault frontmatter).

## Questions Answered
- Q2 (Anytype part): answered — one persistent typed event stream, frame-batched flush, (objectId, relationKey) change granularity, per-key reactive detail store, typed notification model.

## Questions Remaining
- Q5 (iCloud/vault.on), Q6 (engine algorithms), Q7 (UI/UX).

## Next Focus
Obsidian vault.on API surface + iCloud metadata-modify echo mechanics + mobile constraints: what the plugin API actually guarantees, and how the fork's DataSource windows map onto it.

## Ruled Out / Noted
- gRPC streaming obviously not applicable to the fork (vault events instead), but the buffering/reconnect discipline and typed-envelope notification shape are portable.

---

# Iteration 006 — Obsidian vault.on × iCloud Echo: Ecosystem Evidence for the Safe Hook

## Focus
What the plugin API actually guarantees about change events under iCloud/Obsidian Sync, and why the DataSource owned-path windows are the correct — and ecosystem-standard — defense.

## Actions Taken
- WebSearch "Obsidian vault.on modify event iCloud sync metadata modify echo loop plugin".
- Reviewed: obsidian-log-keeper issue #23 (sync echo + feedback loop), mnott/Obsidian-iCloud (fs.watch/FSEvents + three-way mtime log), syncline PR #102 (self-write suppression cookie), AngelCLA/obsidian-icloud-mirror (debounced sync), vault-change-feed (change feed with cursors + startup reconciliation).

## Findings
- F34 (confirmed, [SOURCE: https://github.com/jimjambimbam/obsidian-log-keeper/issues/23]): `vault.on("modify")` fires for ALL file writes including Obsidian Sync pulls from other devices. There is NO official API to distinguish sync-triggered writes from user edits — open feature request at forum.obsidian.md/t/76510. Real-world feedback loop: Device A syncs → Device B's hook writes → syncs back → repeats. This is the exact mechanism the spec's "metadata-modify echo" names, confirmed with a live third-party case.
- F35 (confirmed, same source): `workspace.on("editor-change")` fires only for user editor transactions and NOT for sync writes — the only API-level origin signal Obsidian exposes. Trade-off: only fires for open files. An automation engine could use editor-change as an additional origin hint, but DataSource's own credit system remains the general defense.
- F36 (confirmed, [SOURCE: https://github.com/mnott/Obsidian-iCloud]): iCloud sync is fs.watch/FSEvents + periodic comparison; a "three-way state log (vault mtime, iCloud mtime, last-known-synced mtime)" determines sync direction. Directional mtime comparison is the domain pattern — the fork's owned-path windows are the in-app equivalent, and an automation engine must not add mtime-based writes on top without the same three-way discipline.
- F37 (confirmed, [SOURCE: https://github.com/tomas789/syncline/pull/102]): An independent plugin (Syncline) implements self-write suppression as per-event-kind expiry cookies (`markSelfWrite(kind, path)` before write; `isSelfWriteEcho(kind, path)` at handler entry; 1000ms expiry; lazy sweep on read). This is structurally identical to the fork's `markOwnedPath`/`consumeOwnedPath` 5s dual-channel credits ([DataSource.ts:2009-2055](file:src/data/DataSource.ts)) — validating the fork's design as the ecosystem-standard solution. Syncline's per-kind separation ("a modify cookie on foo.md doesn't drop a later user-initiated rename") mirrors the fork's separate metadataEvents/vaultEvents channels.
- F38 (confirmed, [SOURCE: https://github.com/AngelCLA/obsidian-icloud-mirror]): iCloud Drive itself modifies files while uploading ("iCloud for Windows may be modifying files in the mirror folder as it uploads them"); ecosystem mitigations = debounce (5s) + conflict backup + safe mode. For the fork: automation actions must be written through DataSource's owned-path windows so their own echoes are consumed, and evaluation must be debounced well past the 80ms notify window (RefreshCoordinator's 2s idle is the proven value).
- F39 (confirmed, [SOURCE: https://community.obsidian.md/plugins/vault-change-feed]): Vault Change Feed keeps a local JSONL event stream + per-reader cursors + startup reconciliation; documented iCloud edge case: "binary files re-downloaded by iCloud get a fresh mtime and may degrade to delete+create" — i.e., sync can produce create+delete pairs and fresh mtimes, so an automation engine must (a) reconcile state on startup (files changed while Obsidian closed), and (b) treat delete+create-with-same-hash as rename (idempotency guard), exactly as Vault Change Feed and the fork's DataSource rename handling do.

## Questions Answered
- Q5 (iCloud/vault.on interplay + safe hook design): answered with ecosystem evidence. Safe design = consume DataSource's origin-tagged batches (never raw vault.on), debounce (80ms notify + 2s idle proven values), write through owned-path windows, editor-change as optional origin hint, startup reconciliation, delete+create-as-rename normalization, and mobile display-only (no local FS guarantees on mobile; vault events still fire but writes are churn-risky — spec REQ-001/002 stand).

## Questions Remaining
- Q6 (engine algorithms), Q7 (UI/UX).

## Next Focus
Core trigger-engine algorithm design: evaluation pipeline (batch → diff → match → act), debounce/dedupe, idempotency, atomic writes, failure handling, and rule state persistence.

## Ruled Out / Noted
- Raw `vault.on` for the engine (again, now with two independent ecosystem confirmations: log-keeper echo loop, syncline's need for cookies).
- mtime-based direction detection inside the plugin: it belongs to sync providers; the fork should rely on origin attribution + startup reconciliation instead.

---

# Iteration 007 — Core Trigger-Engine Algorithm Design

## Focus
Design the evaluation pipeline, debounce/dedupe, idempotency, atomic writes, and failure handling — grounded in the fork's existing primitives and the three reference architectures.

## Actions Taken
- Read `data/BaseExpression.ts` (1595 lines): `BaseExpressionContext` (12-21), `evaluateBaseFilterExpression` (59-62), `evaluateBaseExpression` (64-70) with DANGEROUS_TOKENS blocklist + RESERVED set, `safeEval` integration.
- Read `data/types.ts` `FilterRule { field, op, value }` (137-140) + `ConditionalFormatRule` (142-152).
- Read `settings.ts` DEFAULT_SETTINGS (21-33): plugin JSON settings (`data.json`) — the persistence home pattern (`databases` array).
- Synthesized with iteration 1-6 evidence (DataSource windows, RefreshCoordinator, Notion 3s window, AppFlowy debounce sender, Anytype batch flush, Syncline cookies, Vault Change Feed reconciliation).

## Findings
- F40 (confirmed, [SOURCE: src/data/BaseExpression.ts:59-70](file:src/data/BaseExpression.ts) + types.ts:137-140): The fork ALREADY has the trigger-condition engine: `FilterRule { field, op, value }` + `evaluateBaseFilterExpression` (sandboxed via SafeEval). An automation trigger ("when status changes to Done") = one FilterRule + a transition check. No new expression language needed — this is the single most important reuse finding.
- F41 (algorithm, transition detection): change unit = (path, field, oldValue, newValue). Old value from the engine's own snapshot cache (getRecordSnapshot before write), new value from the DataChange batch record read. This mirrors AppFlowy's `did_update_row(old_row, row, field_id)` (database_editor.rs:1057) — capture old before acting; diff at the field level with the fork's `valuesEqual` (DataSource.ts:1730-1736).
- F42 (algorithm, evaluation pipeline): 5-stage engine: (1) SUBSCRIBE `dataSource.onDataChanged` — external-origin batches only (plugin-origin filtered by the owned-path windows); (2) DIFF each changed file against the engine's snapshot (field-level); (3) MATCH rules: per-automation trigger FilterRule evaluated on new frontmatter + transition predicate (old→new); Notion's any/all multi-trigger semantics map to OR/AND over FilterRules; (4) ACT: run action list sequentially; (5) RECORD: append run log (in-memory + settings JSON, never vault frontmatter — Anytype F33 lesson).
- F43 (algorithm, debounce/dedupe): three proven tiers, all already in the codebase: DataSource `queuePendingChange` 80ms batch merge (external-wins origin merge, DataSource.ts:1968-1999) → RefreshCoordinator idle 2s / max 10s coalescing (RefreshCoordinator.ts:97-103) → engine-level per-(rule,path) trailing debounce like AppFlowy's DebounceNotificationSender (debounce.rs:22-62, cancel + re-arm). Notion's "3 second window" (F10) maps to the engine-level window; recommended default 3s trailing, matching Notion, with cancel-on-newer-event.
- F44 (algorithm, idempotency): (a) origin tagging already prevents self-trigger loops (plugin-origin consumed by owned-path credits); (b) rule-action fingerprint (ruleId + path + field + target value hash) stored in the run log prevents duplicate action when the same change arrives twice (vault+metadata dual signals); (c) delete+create with identical content hash = rename (Vault Change Feed lesson, F39) — treat as one event; (d) Notion's no-trigger-chaining rule (F10) hard-coded: actions never re-enter rule evaluation with plugin origin... except the fork's own-path windows already suppress that.
- F45 (algorithm, atomic writes): all actions write through DataSource `enqueueWrite` per-file queue (DataSource.ts:99-122) — serialized per path, never overlapping processFrontMatter; `markPluginWrite` (247-249) for non-DataSource callers; optimistic `frontmatterOverrides` (10s expiry, 1664-1688) keep UI consistent before metadata cache catches up.
- F46 (algorithm, failure handling): RefreshCoordinator's retry discipline (blocked/eligibility retry 300ms/1s, max 10s cap, onError re-queues dirty paths, RefreshCoordinator.ts:113-149) is the failure template: action failures re-queue the change once, log the error to the run log with status=error, surface in UI, never retry more than N times per change (prevent write-storms on iCloud — spec risk table).
- F47 (algorithm, startup reconciliation): engine must reconcile on plugin load (files changed while Obsidian closed — mobile/iCloud/CLI edits, F39): compare cached snapshot vs current frontmatter, run matching rules once. Vault Change Feed's baseline.gz + cursors is the pattern; the fork's `recordCache` snapshot serves as baseline.
- F48 (design, persistence): automation definitions = new `automations` array in plugin settings (settings.ts pattern, data.json) — survives restarts, no vault writes; run log = plugin memory + bounded `automationLog` in settings (ring buffer, e.g. last 200 runs) to avoid data.json bloat. Rule references to fields use column ids/keys — same referencing as FilterRules today.

## Questions Answered
- Q6 (core algorithms): answered — full pipeline designed above with code-grounded reuse (FilterRule/BaseExpression, enqueueWrite, RefreshCoordinator, owned-path windows) and evidence-cited parameters (80ms/2s/3s/10s tiers, ring-buffer log).

## Questions Remaining
- Q7 (UI/UX).

## Next Focus
Fork integration design: the isolated-module layout (new `src/data/Automations.ts` + engine + UI entry), the 1-3 call-site edits, rebase safety, and i18n/settings integration.

## Ruled Out / Noted
- A new expression language for trigger conditions: ruled out — BaseExpression + FilterRule already cover the Notion trigger predicate set (equals, contains, starts with, changed to, etc.).
- Persisting run history into vault frontmatter: ruled out (Anytype F33; spec REQ-001 safety).

---

# Iteration 008 — Fork Integration Design: Isolated-Module Layout and Call-Site Edits

## Focus
The exact EuroFormat-style integration: new modules, the 1-3 call-site edits, rebase safety, settings/i18n wiring.

## Actions Taken
- Read `i18n.ts` (4391 lines): locale dictionary pattern (`en`/`zh-CN`/`zh-TW`), existing `filter.field/operator/value` keys reusable by an automation UI.
- Read `settings.ts` SettingsTab (51-110+): `Setting` builder, `createSettingGroup`, `saveSettings()` — the settings-surface pattern.
- Read `views/modals/FormulaModal.ts` (head): Modal subclass + `evaluateBaseExpression` + `createDropdownField` + `confirmWithModal` — the modal-builder pattern for an automation editor.
- Reconfirmed integration anchors: `main.ts:212-213` (DataSource construction + startListening), `settings.ts:21-33` (DEFAULT_SETTINGS), `DatabaseView.ts:742` / `EmbeddedDatabaseRenderer.ts:422` (onDataChanged subscriber pattern), `views/` + `views/modals/` module locations.

## Findings
- F49 (design, module layout): three NEW files, all additive (zero upstream-body edits, git-clean on rebase):
  1. `src/data/AutomationEngine.ts` — the engine: subscribes to `dataSource.onDataChanged`, snapshot cache, field-level diff (valuesEqual), FilterRule+BaseExpression matching, debounce windows, run log. Imports only existing modules (`DataSource`, `BaseExpression`, `types`, `ColumnTypes`); no new dependencies.
  2. `src/data/AutomationTypes.ts` — `AutomationRule { id, name, enabled, databaseId?, trigger: { mode: "any"|"all", rules: FilterRule[] }, actions: AutomationAction[] }`; action union: `editProperty { field, op: "set"|"add"|"remove"|"clear", value }`, `addRecord { databaseId, values }`, `editRecordsIn { databaseId, filter: FilterRule[], values }` (Notion F8/F9 taxonomy). Persisted in settings.
  3. `src/views/modals/AutomationModal.ts` + `src/views/AutomationListRenderer.ts` — the UI (iteration 9 details).
- F50 (design, the 1-3 call-site edits — EuroFormat discipline, F3):
  - Edit 1 — `src/main.ts` onload (anchor: line 212-213): `this.automationEngine = new AutomationEngine(this.app, this.dataSource, this.settings); this.automationEngine.start();` — 2 added lines after `startListening`, plus `onunload` destroy (same anchor region).
  - Edit 2 — `src/settings.ts` (anchor: DEFAULT_SETTINGS line 21-33 + PluginSettings interface): add `automations: [] as AutomationRule[]` — 1 line each.
  - Edit 3 — `src/settings.ts` SettingsTab.display(): one new group `settings.groups.automations` with a rule list + "Add automation" button opening AutomationModal — one block inside the existing display() method, after the database group (self-contained, no signature changes).
  - i18n keys: additive dictionary entries `automation.*` in `i18n.ts` (en/zh-CN/zh-TW) — additive lines never conflict on rebase.
- F51 (design, rebase safety): all three edits touch stable anchor points that upstream rarely changes (onload wiring, DEFAULT_SETTINGS, display()); new files are additive; imports are one-directional (engine imports existing modules, nothing imports the engine except main.ts). This matches the EuroFormat precedent (1 module + 2 import sites, [EuroFormat.ts:1-42](file:src/data/EuroFormat.ts)) and keeps the fork diff "small, rebasable" per the pattern's own header comment.
- F52 (design, lifecycle): engine lifecycle mirrors DataSource: `start()` registers the onDataChanged subscription + startup reconciliation (F47); `destroy()` unsubscribes and clears timers (mirrors `DataSource.destroy()` at [DataSource.ts:195-210](file:src/data/DataSource.ts)); plugin `onunload` calls it. No vault events registered by the engine itself — it consumes DataSource's already-windowed stream (REQ-001 compliance by construction).
- F53 (design, mobile): engine runs display-only on mobile: rule list/editor accessible, evaluation + actions disabled (`isMobile` check in main.ts anchor; Obsidian mobile exposes `Platform.isMobile`). Matches the topic's display-only instruction and the spec's iCloud safety (no write amplification from mobile background hooks). Desktop evaluation remains the single writer — no multi-device write races beyond what DataSource already serializes per file.
- F54 (design, settings surface reuse): the automation editor reuses `createDropdownField` (property pickers), `COLUMN_TYPE_LABELS`/`getColumnOptions` (field types), `evaluateBaseFilterExpression` (live condition preview), `confirmWithModal` (delete rule confirm) — all existing, all in FormulaModal's import set (views/modals/FormulaModal.ts:1-14) — so the new UI adds no new UI machinery.

## Questions Answered
- Q4 (integration via EuroFormat pattern, concretely): answered — 3 new files + 3 call-site edits + additive i18n; rebase-safe by construction.
- Q7 partial: settings/modal surfaces identified; full UI design next iteration.

## Questions Remaining
- Q7 (full UI/UX design).

## Next Focus
UI/UX: the automation list + when/do builder modal, Notion-style affordances adapted to Obsidian settings/modal conventions, and mobile display-only constraints.

## Ruled Out / Noted
- Registering engine-owned vault events: ruled out (consume DataSource's windowed stream only — REQ-001 by construction).
- Per-database automation storage in view config JSON: deferred — settings-level rules with optional databaseId scoping keep Edit 2 to one line; view-level storage can come later without breaking the module shape.

---

# Iteration 009 — UI/UX Design: Automation List + When/Do Builder

## Focus
The automation editor UI: list surface, when/do builder modal, run-status visibility, and mobile display-only constraints — grounded in fork conventions and Notion's structure.

## Actions Taken
- Read `views/FilterPanelRenderer.ts` (operator taxonomy `getFilterOperatorsForColumn` per column type, `createDropdownField` property pickers, popover pattern).
- Read `data/QueryEngine.ts` `applyFilters(rows, filters, logic: "and"|"or", columns)` (lines 74-95) — the structured record matcher.
- Read `data/ConditionalFormatting.ts` (rule resolution + applyFilters usage — the rule-list UI precedent).
- Reused iteration 2 Notion UI evidence (when/do structure, trigger cards, actions menu) and iteration 8 integration anchors (SettingsTab, FormulaModal).

## Findings
- F55 (confirmed, [SOURCE: src/data/QueryEngine.ts:74-95](file:src/data/QueryEngine.ts)): `QueryEngine.applyFilters(rows, filters, logic, columns)` implements "and"/"or" over FilterRule arrays — this IS Notion's "When all of these occur"/"When any of these occur" (F8), already in the fork. The automation trigger matcher should call `applyFilters` with mode `"and"`|`"or"` — zero new matching code. Combined with F40 (BaseExpression) there are now TWO existing matching paths; applyFilters is the structured one, BaseExpression the formula one.
- F56 (design, list surface): SettingsTab group `settings.groups.automations`: each rule renders as a row — name, enabled toggle, summary line ("When [Status] is set to [Done] → Edit [Assignee]"), last-run status (ok/error/time) + time-ago, delete button (confirmWithModal). Mirrors Notion's automation list (name, trigger summary, toggle) and the fork's settings groups (settings.ts:66-110). Empty state: "No automations — Add automation" (mirrors conditionalFormat.empty pattern).
- F57 (design, when/do builder): `AutomationModal` (Modal subclass, FormulaModal pattern):
  - Header: rule name input (default "New automation") + enabled toggle.
  - WHEN section: trigger mode dropdown ("any"/"all") + rule rows, each a FilterRule row reusing `getFilterOperatorsForColumn` (FilterPanelRenderer.ts:26-52) + `createDropdownField` + a "changed to" transition chip (old→new predicate, Notion "property edited" semantics, F8). The transition chip is the one new control: "changed to X" / "changed from X" / "changed (any)".
  - DO section: action list, each row = action-type dropdown (Edit property / Add record / Edit records in — Notion F9 taxonomy) + per-type fields reusing `createDropdownField` for field/value pickers and value input; add-action button; remove-action per row.
  - Footer: Save (validates ≥1 trigger + ≥1 action, saves via saveSettings), Cancel; live condition preview using `evaluateBaseFilterExpression` against the current file (FormulaModal precedent).
- F58 (design, run-status visibility): the list's last-run column reads the engine's ring-buffer log (F48) — status chip (success/error/skipped) + timestamp + error message tooltip. Anytype's notification envelope shape {id,type,status,createTime,payload} (F32) maps onto this run-log row. No vault writes, no popups on every run (noise control; Notion shows a run history panel — the settings list is the local equivalent).
- F59 (design, mobile): on `Platform.isMobile`, the settings group renders but with a "Automations are display-only on mobile" notice; Add/Edit/Delete disabled (F53). Runs executed on desktop are visible (log is in settings JSON, synced via vault data.json... note: data.json syncs via Obsidian Sync/iCloud — acceptable: read-only on mobile).
- F60 (design, safety affordances): each action row has an explicit "affects N records" estimate (computed via applyFilters count over the database) before save — the destructive-edit warning Notion's "Edit pages in" carries ("WARNING: easy to make destructive changes by accident", F9/Thomas Frank); prevents accidental bulk writes in a personal-finance vault.
- F61 (design, i18n): new `automation.*` keys in `i18n.ts` en/zh-CN/zh-TW (additive, F50); reuse existing `filter.*` operator labels (filter.eq/neq/contains/gt/... from FilterPanelRenderer) — no duplicated terminology.

## Questions Answered
- Q7 (UI/UX): answered — settings-list + modal builder, reusing filter/query machinery; run status via ring buffer; mobile display-only with explicit notice; destructive-action estimates.

## Questions Remaining
- None structural; iteration 10 will consolidate edge cases and rank recommendations for synthesis.

## Next Focus
Iteration 10: sweep remaining edge cases (field deleted/renamed mid-rule, rule referencing missing database, action failure storms, iCloud offline, multiple devices, performance of snapshot diff on big vaults, permission-safe writes) and assemble the ranked recommendation list for synthesis.

## Ruled Out / Noted
- A separate "Automations" ribbon/command view: out — settings group keeps the diff to 3 call sites; the command palette can add one command later without new files.
- Toasts/notices on every automation run: out (noise; run log is the surface).

---

# Iteration 010 — Edge-Case Sweep and Ranked Recommendations

## Focus
Close remaining edge cases and assemble the ranked, evidence-cited recommendation list that synthesis will compile into research.md.

## Actions Taken
- Read `views/ColumnPropertySync.ts` (field lifecycle ops: rename/delete/convert property keys via PropertyService).
- Reviewed the full evidence base (iterations 1-9: 61 findings) and consolidated edge cases + recommendations.

## Findings (edge cases)
- F62 (edge, field lifecycle): rules reference fields by property key (FilterRule.field). Field rename/delete/type-convert (ColumnPropertySync.rename/delete/convert, [ColumnPropertySync.ts:22-53](file:src/views/ColumnPropertySync.ts)) can orphan a rule: engine must validate rules against the database schema at load/eval and surface "rule needs attention: field X no longer exists" in the list (F56 row warning), never fail silently. Type conversion changes operator validity (number→text loses gt/lt) — re-validate operators via `getFilterOperatorsForColumn` (FilterPanelRenderer.ts:26-52).
- F63 (edge, missing/renamed database): rule with `databaseId` pointing at a deleted/renamed database file → skip + mark rule disabled-with-reason (same UX as `template.missing`, i18n.ts:44). Rename handling follows DataSource's rename event (oldPath→newPath remap, [DataSource.ts:175-191](file:src/data/DataSource.ts)).
- F64 (edge, failure storms): bound retries per change (max 2, RefreshCoordinator retry pattern F46); if >5 consecutive failures across rules, pause engine and surface a settings warning — mirrors the spec's "write storms" risk mitigation and the loop's own 3-consecutive-failure recovery discipline.
- F65 (edge, offline/multi-device): actions only run on the active desktop instance (mobile display-only F53); iCloud/offline changes are captured by startup reconciliation (F47); the 3s window + origin filtering makes cross-device race windows small; per-file write queue (F45) prevents intra-process races. A rule firing on both devices simultaneously is prevented by design (only desktop runs engines) — document as an explicit invariant.
- F66 (edge, performance): snapshot cache must be lazy per changed path (never a full-vault re-diff); diff cost = O(fields in changed file); matching cost = O(rules × matched files) via applyFilters — for a personal-finance vault (hundreds of files, dozens of rules) this is trivially fast; batch debounce (F43) prevents burst amplification; ring-buffer log caps memory (F48).
- F67 (edge, permission-safe writes): actions never write outside the database's source scope; `addRecord`/`editRecordsIn` targets validated against existing database configs; value coercion reuses `getColumnOptions`/ColumnTypes (no raw YAML string injection — SafeString conventions).
- F68 (edge, rule interactions): no chaining (Notion F10) enforced in the engine: actions always write with plugin origin, and the engine only evaluates external-origin changes — a rule's own writes can never re-trigger (owned-path windows, F1). Two rules editing the same field: last-writer-wins by execution order (rules sorted by id), documented in the UI as "rules run in order".

## Ranked Recommendations (for synthesis)
- R1 (P0): Reuse the fork's existing condition machinery — FilterRule + QueryEngine.applyFilters(and/or) + evaluateBaseFilterExpression — as the trigger matcher. Zero new expression code; Notion any/all parity for free. Evidence: [QueryEngine.ts:74-95](file:src/data/QueryEngine.ts), [BaseExpression.ts:59-70](file:src/data/BaseExpression.ts), F8/F40/F55.
- R2 (P0): Consume `dataSource.onDataChanged` (external-origin batches) as the ONLY change source; no engine-owned vault events. REQ-001 compliance by construction; iCloud echo handled by the existing 5s owned-path windows. Evidence: DataSource.ts:124-129/1938-2055, F1/F34/F37.
- R3 (P0): 3-tier debounce — 80ms batch merge (DataSource), 2s idle/10s max coalescing (RefreshCoordinator), 3s trailing engine window per (rule,path) with cancel-on-newer (Notion parity; AppFlowy DebounceNotificationSender pattern). Evidence: F10/F21/F43.
- R4 (P0): Write actions ONLY through DataSource write paths (enqueueWrite per-file queue + markPluginWrite + frontmatterOverrides). Atomic, serialized, echo-free. Evidence: DataSource.ts:99-122/247-249, F45.
- R5 (P1): EuroFormat integration shape — 3 new files + 3 call-site edits (main.ts onload, DEFAULT_SETTINGS, SettingsTab.display) + additive i18n; rebase-safe. Evidence: F3/F49-F51.
- R6 (P1): Idempotency + reconciliation — action fingerprint log, delete+create-as-rename, startup reconciliation vs snapshot baseline, no chaining. Evidence: F39/F44/F47.
- R7 (P1): UI = settings list + when/do modal (filter-row reuse, transition chips, affects-N estimate, run-status from ring-buffer log, mobile display-only notice). Evidence: F56-F61.
- R8 (P2): Action taxonomy = Edit property / Add record / Edit records in (Notion F9), with affects-N warnings; Slack/webhook explicitly out (REQ-002, F15).
- R9 (P2): Rule lifecycle guards — field/database invalidation surfacing, bounded retries, failure-pause, documented desktop-single-writer invariant. Evidence: F62-F68.
- R10 (P3): Revisit-trigger alignment — this design stays OUT OF SCOPE until the spec's revisit trigger fires (non-iCloud backend or safe first-class Obsidian hook); the research proves the design is viable and low-risk WHEN the trigger fires, and documents what the out-of-scope decision protects against.

## Questions Answered
- All 7 key questions answered across iterations 1-9; edge-case sweep complete.

## Questions Remaining
- None. Proceeding to synthesis.

## Next Focus
Synthesis (research.md) — compile 68 findings into the 17-section report with convergence appendix.

---
