---
title: "Changelog: 008-004 Archive Docs and Release"
description: "Release-notes copy for the version that ships the calendar, timeline and chart views' removal."
trigger_phrases:
  - "008 004 changelog"
  - "release notes 008"
  - "release notes calendar timeline chart"
importance_tier: "normal"
contextType: "general"
---

# 0.0.35 (drafted — publish this copy with the release cut)

## Removed

- The **chart**, **calendar** and **timeline** database views. A database saved with one of these
  types still opens: chart and calendar views become tables, timeline views become boards, with a
  one-time notice naming the change. (The redirect and the on-open migration shipped in 0.0.34;
  this release removes the renderers themselves, so the views can no longer be created or
  configured from any surface.)

## Where the code went

- The removed views' source — the renderers, their tests and their two dedicated render benches —
  is archived under `archive/deprecated-views/<view>/` (calendar, timeline, chart), each with a
  README naming the last-live SHA, `e75a979c9a21f6f93967a40e24b2a58f474fa9d5` (the commit 0.0.34
  was cut from), and the exact restore procedure:

  ```
  git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- <paths>
  ```

  See `archive/deprecated-views/README.md` for the per-view details and what deliberately stayed
  out of the removal. The timeline archive includes the earlier timeline/gantt port
  (`037-timeline-gantt-port`), whose landing this release supersedes; that packet's own history
  stays intact.

## Notes

- The root README's "Deprecated views" section says the same thing in shorter form and links
  here-adjacent: the archived code, not a deletion.
- No dependency, setting or stored-data format changed beyond the view types themselves; records,
  properties, relations and the surviving table and board views are untouched.
