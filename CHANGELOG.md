# Changelog

Notable changes to Note Database, most recent first.

## 0.0.28

### Removed

- **The gallery view is retired.** Any database already configured as a gallery opens as a board instead, automatically, the first time it opens after this update — in both a full database file and a database embedded in a note. You will see a one-time notice the first time this happens for each affected database, with an Undo action.

  This is permanent. Installing an older version of the plugin brings back the gallery view's code, but it does **not** turn a migrated database back into a gallery — once a view has become a board, it stays a board, even after a rollback. Immediately after a migration, the notice's own Undo action reverts that one view; it is the only reversal there is.

### What carries over, field for field

- **Cover image.** The property a gallery used for its cover (`galleryImageField`) becomes the board's own cover property.
- **Cover fit.** Whether the cover was cropped to fill its frame or shown in full carries over unchanged.
- **Cover aspect ratio.** The exact ratio a gallery used carries over unchanged, including a ratio typed in by hand.

### What a board cannot show that the gallery view could

- **A named aspect-ratio preset.** A gallery let you choose Square, Banner, Portrait, or Landscape by name. The board has no preset list, so the migration carries the *number* that preset resolved to — the cover keeps its shape — but the name itself is gone. Choosing a cover ratio on the migrated view now means typing a number rather than picking a preset.
- **Card size.** The gallery's own card-size setting has no board equivalent — the board's column width sizes a kanban lane, a structurally different control from a responsive card grid — and does not carry over.
- **A card-size preset.** The board has no preset system for this at all, for the same reason as above.

### Upgrade

No action needed. Nothing in your notes changes — a database is still an ordinary Markdown file with `db_view: true`. Any view using the gallery is converted the first time you open it.

## 0.0.23

### Removed

- **The list view is retired.** Any database already configured as a list opens as a table instead, automatically, the first time it opens after this update, keeping the same columns. You will see a one-time notice the first time this happens for each affected view.

  This is permanent. Installing an older version of the plugin brings back the list view's code, but it does **not** turn a migrated database back into a list — once a view has become a table, it stays a table, even after a rollback.

### What a table cannot show that the list view could

- **Compact field sizing.** The list let a secondary field take up only as much width as its content needed. A table gives every field its own full column instead, so this specific sizing behavior is gone.
- **Two-line stacked titles.** The list could show a record's name and its folder path stacked on two lines, with the path always visible. A table's title fits on one line, and shows the path only when two records share the same name.
- **The list's card-style keyboard model.** Arrow keys used to move from card to card. A table's keyboard model works by cell and range instead, and covers more actions than the list's did.
- **Free-width wrapping columns.** A column that grew to fit its widest value only ever worked in the list. Table columns have a fixed, resizable width.

### What you gain instead, since the migrated view is now a table

A header row, click-to-sort, column resize and reorder, adding columns directly from the view, cell range selection with a fill handle, copy/cut/paste, tab-to-create-a-row, grouping by more than one field, and select-all that stays in sync across groups.

### Upgrade

No action needed. Nothing in your notes changes — a database is still an ordinary Markdown file with `db_view: true`. Any view using the list is converted the first time you open it.
