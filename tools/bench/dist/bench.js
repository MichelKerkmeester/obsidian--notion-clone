"use strict";
(() => {
  // tools/storybook/obsidian-dom-shim.mjs
  function applyInfo(el, info) {
    if (typeof info === "string") {
      if (info) el.className = info;
      return;
    }
    if (!info) return;
    if (info.cls) {
      const classes = Array.isArray(info.cls) ? info.cls : info.cls.split(/\s+/);
      for (const cls of classes) if (cls) el.classList.add(cls);
    }
    if (info.text !== void 0) {
      if (typeof info.text === "string") el.textContent = info.text;
      else el.appendChild(info.text);
    }
    if (info.attr) {
      for (const [name, value] of Object.entries(info.attr)) {
        if (value === null || value === false) continue;
        el.setAttribute(name, String(value));
      }
    }
    if (info.title !== void 0) el.title = info.title;
    if (info.value !== void 0) el.value = info.value;
    if (info.type !== void 0) el.type = info.type;
    if (info.placeholder !== void 0) el.placeholder = info.placeholder;
    if (info.href !== void 0) el.href = info.href;
  }
  function attach(parent, el, info) {
    const target = info && typeof info !== "string" && info.parent || parent;
    if (!target) return;
    if (info && typeof info !== "string" && info.prepend) target.insertBefore(el, target.firstChild);
    else target.appendChild(el);
  }
  function createEl(tag, info, callback) {
    const el = this.ownerDocument.createElement(tag);
    applyInfo(el, info);
    attach(this, el, info);
    if (callback) callback(el);
    return el;
  }
  var extensions = {
    createEl,
    createDiv(info, callback) {
      return createEl.call(this, "div", info, callback);
    },
    createSpan(info, callback) {
      return createEl.call(this, "span", info, callback);
    },
    setText(val) {
      if (typeof val === "string") this.textContent = val;
      else {
        this.textContent = "";
        this.appendChild(val);
      }
    },
    addClass(...classes) {
      for (const cls of classes) if (cls) this.classList.add(cls);
    },
    removeClass(...classes) {
      for (const cls of classes) if (cls) this.classList.remove(cls);
    },
    // `value` is required here, unlike classList.toggle. Treating it as optional would silently
    // flip classes the caller meant to set, which is a hard bug to see in a rendered catalogue.
    toggleClass(classes, value) {
      const list = Array.isArray(classes) ? classes : [classes];
      for (const cls of list) if (cls) this.classList.toggle(cls, value);
    },
    hasClass(cls) {
      return this.classList.contains(cls);
    },
    setAttr(name, value) {
      if (value === null || value === false) this.removeAttribute(name);
      else this.setAttribute(name, String(value));
    },
    setCssProps(props) {
      for (const [name, value] of Object.entries(props)) {
        if (name.startsWith("--")) this.style.setProperty(name, value);
        else this.style[name] = value;
      }
    },
    empty() {
      while (this.firstChild) this.removeChild(this.firstChild);
    },
    detach() {
      this.remove();
    }
  };
  function installObsidianDomShim(target = globalThis) {
    const prototypes = [target.HTMLElement?.prototype, target.DocumentFragment?.prototype];
    let installed = 0;
    for (const proto of prototypes) {
      if (!proto) continue;
      for (const [name, fn] of Object.entries(extensions)) {
        if (name in proto) continue;
        Object.defineProperty(proto, name, { value: fn, writable: true, configurable: true });
        installed += 1;
      }
    }
    return installed;
  }

  // tools/storybook/obsidian-stub.mjs
  function setIcon(parent, iconId) {
    const el = parent.ownerDocument.createElement("span");
    el.className = "db-story-icon";
    el.setAttribute("data-icon", iconId);
    el.setAttribute("aria-hidden", "true");
    el.textContent = "\u25C6";
    parent.appendChild(el);
    return el;
  }
  var Platform = {
    isMobile: false,
    isPhone: false,
    isTablet: false,
    isDesktop: true
  };
  var outOfScope = (name) => {
    const fail = function() {
      throw new Error(
        `obsidian-stub: ${name} is not available outside Obsidian. This surface reaches the vault or the metadata cache, so it cannot be rendered in the catalogue.`
      );
    };
    return fail;
  };
  var App = outOfScope("App");
  var TFile = outOfScope("TFile");
  var TFolder = outOfScope("TFolder");
  var Modal = outOfScope("Modal");
  var Notice = outOfScope("Notice");
  var Menu = outOfScope("Menu");
  var MenuItem = outOfScope("MenuItem");
  var Setting = outOfScope("Setting");
  var WorkspaceLeaf = outOfScope("WorkspaceLeaf");
  var FuzzySuggestModal = outOfScope("FuzzySuggestModal");
  var parseYaml = outOfScope("parseYaml");
  var stringifyYaml = outOfScope("stringifyYaml");
  var getAllTags = outOfScope("getAllTags");

  // src/data/manual-order.ts
  var CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var BASE = CHARSET.length;
  function isExplicitlySorted(config) {
    if (config.sortColumn) return true;
    return (config.sortRules || []).some((rule) => Boolean(rule.field && rule.direction));
  }

  // src/i18n.ts
  var en = {
    "app.name": "Note Database",
    "common.add": "Add",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.clear": "Clear",
    "common.close": "Close",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.more": "More",
    "common.restore": "Restore",
    "link.open": "Open link",
    "link.copy": "Copy link",
    "link.copied": "Link copied",
    "editor.saveFailed": "Could not save draft",
    "editor.retry": "Retry",
    "editor.discard": "Discard",
    "tag.remove": "Remove {tag}",
    "common.permanentlyDelete": "Delete permanently",
    "common.untitled": "Untitled",
    "common.enumerationJoin": ", ",
    "common.notSet": "Not set",
    "common.moveUp": "Move up",
    "common.moveDown": "Move down",
    "databaseCover.label": "Database cover",
    "databaseCover.choose": "Choose cover image",
    "databaseCover.remove": "Remove cover",
    "conditionalFormat.title": "Conditional formatting",
    "conditionalFormat.add": "Add rule",
    "conditionalFormat.empty": "No formatting rules",
    "conditionalFormat.target": "Formatting target",
    "conditionalFormat.targetField": "Target property",
    "filter.field": "Property",
    "filter.operator": "Operator",
    "conditionalFormat.dynamicToday": "Dynamic today",
    "conditionalFormat.record": "Record",
    "conditionalFormat.field": "This property",
    "conditionalFormat.color": "Color",
    "conditionalFormat.icon": "Icon",
    "conditionalFormat.bold": "Bold",
    "conditionalFormat.group": "Condition group",
    "template.label": "New record template",
    "template.choose": "Choose template note",
    "template.remove": "Remove template",
    "template.help": "Template properties are merged before view defaults and source rules.",
    "template.engine.markdown": "Markdown",
    "template.engine.label": "Template engine",
    "template.engine.core": "Core Templates",
    "template.engine.templater": "Templater",
    "template.missing": "The configured template file no longer exists.",
    "template.loadFailed": "Could not load the record template: {error}",
    "template.templaterUnavailable": "Templater is not installed or its compatible API is unavailable.",
    "template.templaterFailed": "The note was created, but Templater processing failed: {error}",
    "filter.value": "Value",
    "common.untitledDatabase": "Untitled database",
    "common.empty": "Empty",
    "common.database": "Database",
    "common.tableView": "Table view",
    "common.boardView": "Board view",
    "common.galleryView": "Gallery view",
    "common.listView": "List view",
    "common.chartView": "Chart view",
    "common.calendarView": "Calendar view",
    "common.timelineView": "Timeline view",
    "accessibility.queryStatus": "{visible} records shown{qualifiers}.",
    "accessibility.searchApplied": "search applied",
    "accessibility.filtersApplied": "filters applied",
    "accessibility.limitApplied": "limit applied",
    "timeline.accessibilityLabel": "Timeline {start} to {end}. {visible} events in the visible range; {off} outside the range ({before} before and {after} after).",
    "table.ariaLabel": "Database table",
    "table.addColumn": "Add column",
    "table.calculate": "+ Calculate",
    "table.calculateFor": "Calculate {name}",
    "table.insertRow": "Insert row here",
    "table.calculation.label": "Calculate {name}",
    "table.calculation.none": "No calculation",
    "table.calculation.sum": "Sum",
    "table.calculation.average": "Average",
    "table.calculation.median": "Median",
    "table.calculation.min": "Minimum",
    "table.calculation.max": "Maximum",
    "table.calculation.range": "Range",
    "table.calculation.stddev": "Standard deviation",
    "table.calculation.count": "Count",
    "table.calculation.unique": "Unique",
    "table.calculation.empty": "Empty",
    "table.calculation.filled": "Filled",
    "table.calculation.checked": "Checked",
    "table.calculation.unchecked": "Unchecked",
    "table.calculation.earliest": "Earliest",
    "table.calculation.latest": "Latest",
    "calendar.prevMonth": "Previous",
    "calendar.prevYear": "Previous year",
    "calendar.prevYearRange": "Previous years",
    "calendar.today": "Today",
    "calendar.unscheduled": "Unscheduled",
    "board.collapseGroup": "Collapse group",
    "board.columnOptions": "Column options",
    "board.deleteGroup": "Delete group",
    "board.hideColumn": "Hide column",
    "board.sortAscending": "Sort ascending",
    "board.sortDescending": "Sort descending",
    "calendar.previewEvent": "Preview event",
    "calendar.setupPreview": "Set up preview",
    "calendar.week": "Week",
    "dropdown.noResults": "No results",
    "datePicker.presets": "Quick dates",
    "datePicker.today": "Today",
    "datePicker.tomorrow": "Tomorrow",
    "datePicker.nextWeek": "Next week",
    "datePicker.clear": "Clear",
    "calendar.minutePlaceholder": "mm",
    "calendar.datePicker": "Jump to date",
    "calendar.nextMonth": "Next",
    "calendar.nextYear": "Next year",
    "calendar.nextYearRange": "Next years",
    "calendar.prevWeek": "Previous week",
    "calendar.nextWeek": "Next week",
    "calendar.prevDay": "Previous day",
    "calendar.nextDay": "Next day",
    "calendar.switchToDayTitle": "Switch to day view?",
    "calendar.switchToDayMessage": "Open {date} in the day view?",
    "calendar.switchToDayConfirm": "Switch",
    "calendar.openDayView": "Open day view",
    "calendar.options": "Calendar options",
    "calendar.scaleMonth": "Month",
    "calendar.scaleWeek": "Week",
    "calendar.scaleDay": "Day",
    "calendar.layout": "Layout",
    "calendar.time": "Time",
    "calendar.appearance": "Appearance",
    "calendar.sizing": "Sizing",
    "calendar.weekViewComingSoon": "Week view coming soon",
    "timeline.options": "Timeline options",
    "common.noGroup": "No group",
    "common.uncategorized": "Uncategorized",
    "group.computedCreateDisabled": "This group is formula-driven.",
    "changelog.releaseNotes": "## What's new in 1.2.8\n\n- **Quick filter and sort chips:** see active rules in the toolbar, edit one in place, or remove it directly.\n- **Board record covers:** choose the image property, crop mode, and aspect ratio independently for each board view.\n- **Clearer formulas:** distinguish display names from frontmatter keys, preview substituted values, use `file.name` and `file.tags`, and recover with `IFERROR`.\n- **Relations and Rollups:** change the target database as one undoable operation and double-click a Rollup cell to configure it.\n- **Consistent editing:** use one new-property dialog, colored option group labels, native Page Preview, and improved date pickers.\n\nYour notes and relationships remain ordinary local Markdown and Obsidian wikilinks.",
    "changelog.viewPluginPage": "View the full feature overview in Community plugins \u2192",
    "common.groupBy": "Group by {name}",
    "common.asc": "Ascending",
    "common.desc": "Descending",
    "common.search": "Search",
    "recordIcon.emoji": "Emoji",
    "recordIcon.icons": "Icons",
    "recordIcon.remove": "Remove",
    "recordIcon.random": "Random",
    "recordIcon.recent": "Recent",
    "recordIcon.show": "Show icon",
    "recordIcon.field": "Record icon field",
    "recordIcon.override": "Override database icon field",
    "recordIcon.selectField": "Choose an icon property",
    "recordIcon.noTextField": "Create a writable text property before enabling record icons.",
    "recordIcon.createField": "Create icon property\u2026",
    "recordIcon.configureField": "Configure record icon property\u2026",
    "recordIcon.changeRecord": "Change this record icon",
    "recordIcon.hideInView": "Hide icons in this view",
    "recordIcon.followDatabaseField": "Follow database setting (currently: {field})",
    "recordIcon.currentViewField": "Record icon property for this view",
    "recordIcon.databaseDefaultField": "Database-wide default icon property",
    "recordIcon.createViewField": "Create and use for this view\u2026",
    "recordIcon.createDatabaseField": "Create as database-wide default\u2026",
    "recordIcon.iconKeyConflict": "A property named icon already exists with an incompatible type. Choose another name or use record_icon.",
    "recordIcon.fileKeyInvalid": "Record icon properties cannot use the reserved file.* namespace.",
    "recordIcon.category.people": "People",
    "recordIcon.category.nature": "Nature",
    "recordIcon.category.food": "Food",
    "recordIcon.category.activities": "Activities",
    "recordIcon.category.travel": "Travel",
    "recordIcon.category.objects": "Objects",
    "recordIcon.category.symbols": "Symbols",
    "recordIcon.category.flags": "Flags",
    "recordIcon.category.common": "Common",
    "recordIcon.category.interface": "Interface",
    "recordIcon.category.files": "Files",
    "recordIcon.category.communication": "Communication",
    "recordIcon.category.media": "Media",
    "recordIcon.category.time": "Time",
    "recordIcon.category.places": "Places",
    "recordIcon.category.business": "Business",
    "recordIcon.category.other": "Other",
    "iconPicker.search": "Search icons and emoji",
    "iconPicker.searchResults": "Search results",
    "common.noResults": "No results",
    "common.create": "Create",
    "common.total": "Total",
    "common.databaseTotal": "Database total",
    "common.true": "Yes",
    "common.false": "No",
    "common.noMatchingData": "No matching data.",
    "search.calendarTimelineSummary": "Found {total}, {visible} in current range",
    "search.noMatches": "No matches.",
    "search.inCurrentRange": "Current range",
    "search.outsideCurrentRange": "Outside current range",
    "search.moreResults": "{count} more not shown",
    "mobile.moveCard": "Move card",
    "mobile.moveToGroup": "Move to group",
    "mobile.moveTo": "Move to",
    "mobile.moveTop": "Move to top",
    "mobile.moveBottom": "Move to bottom",
    "mobile.moveBefore": "Move before",
    "mobile.moveAfter": "Move after",
    "toolbar.defaultWidth": "Default width",
    "toolbar.wide": "Wide",
    "toolbar.queryCluster": "Query controls",
    "toolbar.propertiesCluster": "Property controls",
    "toolbar.utilities": "More tools",
    "toolbar.viewSwitcher": "View switcher",
    "toolbar.openDatabaseSwitcher": "Switch database",
    "toolbar.viewSettings": "View settings",
    "toolbar.displayWidth": "Display width",
    "toolbar.searchShortcut": "Search (\u2318F / Ctrl+F)",
    "toolbar.clearSearch": "Clear search",
    "toolbar.allViews": "All views",
    "toolbar.searchViews": "Search views",
    "toolbar.moreViewsCount": "More views ({count})",
    "toolbar.maxViews": "15 views maximum",
    "toolbar.newViewName": "View name (optional)",
    "toolbar.viewKeyField": "Title property",
    "toolbar.viewIcon": "Icon (optional)",
    "toolbar.duplicateCurrentView": "Duplicate current view",
    "toolbar.setViewIcon": "Set view icon",
    "toolbar.chooseTemplate": "Choose a template",
    "toolbar.insertPlacement": "New note placement",
    "toolbar.insertAtTop": "Insert at top",
    "toolbar.insertAtBottom": "Insert at bottom",
    "toolbar.createBlankNote": "Create blank note",
    "toolbar.setDefaultTemplate": "Set default template",
    "toolbar.configureTemplates": "Configure templates\u2026",
    "toolbar.propertiesHidden": "Properties, {count} hidden",
    "toolbar.clearAll": "Clear all",
    "toolbar.filter": "Filter",
    "toolbar.sort": "Sort",
    "toolbar.view": "View",
    "toolbar.settings": "Settings",
    "toolbar.group": "Group",
    "toolbar.groupBy": "Group by",
    "toolbar.groupOptions": "Group options",
    "toolbar.groupOrder": "Group order",
    "toolbar.showEmptyGroup": "Show empty groups",
    "toolbar.enableBoardSubgroups": "Enable subgroups",
    "toolbar.subgroupBy": "Subgroup by",
    "toolbar.selectBoardSubgroupField": "Select a subgroup property",
    "toolbar.noAvailableBoardSubgroupFields": "No available subgroup properties",
    "toolbar.properties": "Properties",
    "toolbar.hiddenCount": "{count} hidden",
    "toolbar.export": "Export",
    "toolbar.refreshDatabase": "Refresh database",
    "toolbar.refreshingDatabase": "Refreshing database\u2026",
    "toolbar.pendingRefreshFiles": "{count} changed files pending",
    "toolbar.pendingRefreshUnknown": "Changes pending",
    "errors.refreshFailed": "Database refresh failed. Your pending changes were kept.",
    "toolbar.share": "Share / export",
    "toolbar.copyFormats": "Export to clipboard",
    "toolbar.new": "New",
    "toolbar.newFromTemplate": "New from template",
    "toolbar.newFromTemplateTooltip": "New from template: {path}",
    "board.newGroup": "New group",
    "board.groupNamePlaceholder": "Group name",
    "board.groupColor": "Group color",
    "board.groupExists": "The group \u201C{name}\u201D already exists.",
    "toolbar.selectedCount": "{count} selected",
    "toolbar.selectedCells": "{count} cells selected",
    "toolbar.undo": "Undo",
    "toolbar.openFullView": "Open in full database",
    "toolbar.hideEmbedHeader": "Hide embedded header",
    "toolbar.showEmbedHeader": "Show embedded header",
    "toolbar.addDatabase": "New database",
    "toolbar.toggleDatabaseIcon": "Toggle database icon",
    "toolbar.deleteDatabase": "Delete database",
    "toolbar.renameDatabase": "Rename database",
    "toolbar.copyCurrentDatabase": "Duplicate current database",
    "toolbar.copyCurrentView": "Duplicate current view",
    "toolbar.copyViewCode": "Copy embed code for this view",
    "toolbar.changeViewType": "Change view type",
    "toolbar.changeLayout": "Change layout",
    "toolbar.moveViewFirst": "Move to first",
    "toolbar.moveViewLast": "Move to last",
    "toolbar.openDatabaseFile": "Open database file",
    "toolbar.exportCsvMarkdownZip": "Export CSV + Markdown ZIP",
    "toolbar.moreViews": "More views",
    "toolbar.addView": "Add view",
    "toolbar.rename": "Rename",
    "toolbar.deleteView": "Delete view",
    "toolbar.copyCsv": "Copy as CSV",
    "toolbar.copyMarkdown": "Copy as Markdown table",
    "toolbar.openAsMarkdown": "Open as Markdown",
    "command.openDashboard": "Note database: Open dashboard",
    "command.createDatabaseFile": "Note database: Create database file from configuration database",
    "command.convertBase": "Note database: Convert .base file to database",
    "command.showDatabaseFiles": "Note database: Show database files",
    "command.importDatabaseFile": "Note database: Import current database file as configuration database",
    "command.importCsvMarkdown": "Note database: Import CSV + Markdown files",
    "command.exportCsvMarkdown": "Note database: Export current database view as CSV + Markdown ZIP",
    "command.undoDatabaseEdit": "Note database: Undo last database edit",
    "command.configureReportsComputedFields": "Note database: Configure Reports computed fields",
    "selection.copyCells": "Copy",
    "selection.copyTsv": "Copy TSV",
    "selection.copyMarkdown": "Copy Markdown",
    "selection.copyCsv": "Copy CSV",
    "selection.pasteCells": "Paste",
    "selection.fillCells": "Fill",
    "selection.fillValue": "Fill value",
    "selection.fillPlaceholder": "Value",
    "selection.clearCells": "Clear",
    "selection.fillPrompt": "Fill selected cells with:",
    "selection.clearEsc": "\u2715 Esc",
    "selection.clearSelection": "Clear selection",
    "operation.moved": "Moved {count} record(s)",
    "operation.pasted": "Pasted {count} cell(s)",
    "operation.failed": "Could not complete the move",
    "drag.movingItems": "Moving {count} items",
    "bulkEdit.editField": "Edit field",
    "bulkEdit.field": "Field",
    "bulkEdit.searchField": "Search field",
    "bulkEdit.checked": "Checked",
    "bulkEdit.unchecked": "Unchecked",
    "bulkEdit.leavesView": "{count} records will leave the current view",
    "bulkEdit.leavesDatabase": "{count} records will leave this database",
    "bulkEdit.movesGroup": "{count} records will move to another group",
    "bulkEdit.missing": "{count} missing records will be skipped",
    "bulkEdit.apply": "Apply",
    "bulkEdit.noEditableFields": "No editable fields are available.",
    "bulkEdit.noChanges": "No records need to be changed.",
    "bulkEdit.allMissing": "All selected records are missing.",
    "bulkEdit.confirmTitle": "Confirm bulk edit",
    "bulkEdit.confirmChanged": "{count} records will be changed",
    "bulkEdit.completed": "Updated {count} records.",
    "bulkEdit.completedSkipped": "Updated {count} records and skipped {skipped} missing records.",
    "bulkEdit.previewChanged": "Records changed while confirming. Review the latest preview and apply again.",
    "undo.bulkEdit": "bulk edit records",
    "undo.fillCells": "fill cells",
    "undo.pasteCells": "paste cells",
    "undo.moveCells": "move cells",
    "undo.clearCells": "clear cells",
    "undo.editCell": "edit cell",
    "undo.renameFile": "rename file",
    "undo.viewConfig": "view configuration",
    "undo.filterConfig": "filter conditions",
    "undo.sortConfig": "sort rules",
    "undo.groupConfig": "group settings",
    "undo.summaryConfig": "summary settings",
    "undo.hideColumnsConfig": "column visibility",
    "undo.columnWidthConfig": "column width",
    "undo.columnOrderConfig": "column order",
    "undo.columnRenameConfig": "column rename",
    "undo.columnTypeConfig": "column type",
    "undo.columnWrapConfig": "column wrap",
    "undo.insertColumnConfig": "insert column",
    "undo.addColumnConfig": "add column",
    "undo.duplicateColumnConfig": "duplicate column",
    "undo.deleteColumnConfig": "delete column",
    "undo.fieldOptionsConfig": "field options",
    "undo.formulaConfig": "formula",
    "undo.viewTypeConfig": "view type",
    "undo.chartConfig": "chart settings",
    "undo.chartTypeConfig": "chart type",
    "undo.chartGroupConfig": "chart grouping",
    "undo.chartMeasureConfig": "chart value settings",
    "undo.chartStyleConfig": "chart style",
    "undo.chartReferenceLinesConfig": "chart reference lines",
    "undo.chartVisibleGroupsConfig": "chart visible groups",
    "undo.chartDrilldownFilterConfig": "chart drilldown filter",
    "undo.chartDateBucketConfig": "chart date bucket",
    "undo.chartNumberBucketConfig": "chart number bucket",
    "undo.chartNumberBucketSizeConfig": "chart bucket size",
    "undo.chartSubgroupConfig": "chart subgroup",
    "undo.chartSortConfig": "chart sorting",
    "undo.chartOmitZeroValuesConfig": "hide zero values",
    "undo.chartCumulativeConfig": "cumulative chart values",
    "undo.chartValueFieldConfig": "chart value field",
    "undo.chartAggregationConfig": "chart aggregation",
    "undo.chartColorPaletteConfig": "chart color palette",
    "undo.chartColorByValueConfig": "chart color by value",
    "undo.chartTitleConfig": "chart title",
    "undo.chartHeightConfig": "chart height",
    "undo.chartGridLinesConfig": "chart grid lines",
    "undo.chartAxisNamesConfig": "chart axis names",
    "undo.chartAxisRangeConfig": "chart axis range",
    "undo.chartAxisMinConfig": "chart axis minimum",
    "undo.chartAxisMaxConfig": "chart axis maximum",
    "undo.chartShowTitleConfig": "chart title visibility",
    "undo.chartDataLabelsConfig": "chart data labels",
    "undo.chartDataLabelModeConfig": "chart data label mode",
    "undo.chartDataLabelColorConfig": "chart data label color",
    "undo.chartLegendConfig": "chart legend",
    "undo.chartSmoothLineConfig": "line smoothing",
    "undo.chartGradientAreaConfig": "area gradient",
    "undo.chartDonutCenterConfig": "donut center",
    "undo.chartReferenceLineAddConfig": "add chart reference line",
    "undo.chartReferenceLineTypeConfig": "reference line type",
    "undo.chartReferenceLineTitleConfig": "reference line label",
    "undo.chartReferenceLineValueConfig": "reference line value",
    "undo.chartReferenceLineStyleConfig": "reference line style",
    "undo.chartReferenceLineColorConfig": "reference line color",
    "undo.chartReferenceLineRemoveConfig": "remove chart reference line",
    "undo.calendarStartFieldConfig": "calendar start date field",
    "undo.calendarEndFieldConfig": "calendar end date field",
    "undo.calendarTitleFieldConfig": "calendar title field",
    "undo.calendarColorFieldConfig": "calendar color field",
    "undo.calendarMonthConfig": "calendar month",
    "undo.calendarCellSizeConfig": "calendar cell size",
    "undo.calendarScaleConfig": "Calendar scale",
    "undo.calendarColumnSizeConfig": "Calendar column width",
    "undo.calendarRowSizeConfig": "Calendar row height",
    "undo.calendarFirstDayOfWeekConfig": "Calendar first day of week",
    "undo.calendarMonthLanesConfig": "Calendar events per day",
    "undo.calendarAllDayLanesConfig": "Calendar all-day rows",
    "undo.calendarSlotDurationConfig": "Calendar time slot",
    "undo.calendarTimeWindowConfig": "Calendar visible hours",
    "undo.calendarHourHeightConfig": "Calendar hour height",
    "undo.timelineStartFieldConfig": "timeline start date field",
    "undo.timelineEndFieldConfig": "timeline end date field",
    "undo.timelineTitleFieldConfig": "timeline title field",
    "undo.timelineColorFieldConfig": "timeline color field",
    "undo.timelineScaleConfig": "timeline scale",
    "undo.timelineAnchorConfig": "timeline window",
    "undo.timelineColumnWidthConfig": "timeline column width",
    "undo.showEmptyFieldsConfig": "empty field visibility",
    "undo.listCompactFieldsConfig": "list compact field layout",
    "undo.databaseNameConfig": "database name",
    "undo.databaseDescriptionConfig": "database description",
    "undo.databaseCoverConfig": "database cover",
    "undo.conditionalFormatConfig": "conditional formatting",
    "undo.newRecordTemplateConfig": "new record template",
    "undo.sourceFolderConfig": "source folder",
    "undo.sourceRulesConfig": "source rules",
    "undo.newRecordFolderConfig": "new record folder",
    "undo.computedSyncModeConfig": "computed result save mode",
    "undo.galleryCoverFieldConfig": "gallery cover field",
    "undo.galleryImageFitConfig": "gallery image fit",
    "undo.galleryCoverRatioConfig": "gallery cover ratio",
    "undo.boardCoverFieldConfig": "board cover field",
    "undo.boardImageFitConfig": "board image fit",
    "undo.boardCoverRatioConfig": "board cover ratio",
    "undo.titleFieldConfig": "title field",
    "undo.boardSubgroupConfig": "board subgroup",
    "undo.boardColumnWidthConfig": "board column width",
    "undo.displayWidthConfig": "display width",
    "undo.cardOrderConfig": "card order",
    "undo.timelineDates": "timeline dates",
    "undo.timelineInvalidEvents": "invalid timeline event fixes",
    "undo.createRow": "create entry",
    "undo.cardSizeConfig": "card size",
    "undo.groupCollapseConfig": "group collapse",
    "undo.statusPresetConfig": "status presets",
    "undo.defaultColumnWidthConfig": "default column width",
    "undo.rowDensityConfig": "row density",
    "confirm.clearCells": "Clear {count} selected cells?",
    "groupOrder.textAsc": "A \u2192 Z",
    "groupOrder.textDesc": "Z \u2192 A",
    "groupOrder.numberAsc": "Small \u2192 large",
    "groupOrder.numberDesc": "Large \u2192 small",
    "groupOrder.currencyAsc": "Low \u2192 high",
    "groupOrder.currencyDesc": "High \u2192 low",
    "groupOrder.dateAsc": "Early \u2192 late",
    "groupOrder.dateDesc": "Late \u2192 early",
    "groupOrder.checkboxFalseFirst": "Unchecked first",
    "groupOrder.checkboxTrueFirst": "Checked first",
    "groupOrder.optionAsc": "Option order",
    "groupOrder.optionDesc": "Reverse option order",
    "groupOrder.multiSelectPriority": "Highest-priority option",
    "groupOrder.custom": "Custom group order...",
    "group.expand": "Expand group",
    "group.collapse": "Collapse group",
    "group.expandMore": "Show {count} more",
    "group.expandAll": "Show all",
    "group.collapseToLimit": "Collapse",
    "group.selectRows": "Select rows in group",
    "panel.addCondition": "Add condition",
    "panel.addSort": "Add sort",
    "panel.emptyFilters": 'Click "Add condition" below to start filtering.',
    "panel.emptySorts": 'Click "Add sort" below to add multi-sort rules.',
    "sortPanel.calendarHint": "Calendar views place spanning, all-day, and overlapping timed events first; sort rules apply within the available event order.",
    "panel.and": "AND (all)",
    "panel.or": "OR (any)",
    "panel.field": "Field",
    "panel.operator": "Operator",
    "panel.sortDirection": "Direction",
    "panel.value": "Value",
    "panel.all": "All",
    "panel.addColumn": "Add property",
    "panel.createProperty": "Create property\u2026",
    "panel.dragToSort": "Drag to reorder",
    "panel.doubleClickEdit": "Double-click to edit",
    "panel.wrap": "Wrap content",
    "panel.groupedPropertyHidden": "This property is for grouping and won't appear in item content.",
    "panel.titleFieldHint": "This property is used as the title.",
    "panel.groupFieldHint": "This property is used for grouping and won't appear in item content.",
    "panel.subgroupFieldHint": "This property is used for sub-grouping and won't appear in item content.",
    "panel.open": "Open",
    "panel.noProperties": "No properties",
    "panel.hiddenProperties": "Hidden properties",
    "viewConfig.title": "View settings",
    "viewConfig.databaseSection": "Current database",
    "viewConfig.viewSection": "Current view",
    "viewConfig.viewSourceRules": "Enable this view's source rules",
    "viewConfig.viewSourceRulesHint": "When enabled, these rules (from embeds or .base conversion) are combined with the database source rules. When disabled, they are not applied.",
    "undo.viewSourceRulesConfig": "view source rules",
    "viewConfig.viewType": "View type",
    "viewConfig.rowDensity": "Row density",
    "viewConfig.rowDensity.compact": "Compact",
    "viewConfig.rowDensity.default": "Default",
    "viewConfig.rowDensity.comfortable": "Comfortable",
    "viewConfig.summarySumField": "SUM field",
    "viewConfig.summarySumFieldNone": "Not shown",
    "viewConfig.summaryField": "Summary",
    "viewConfig.summaryFieldNone": "Remove summary",
    "viewConfig.summaryAdd": "+ Summary",
    "viewConfig.summaryCount": "Count",
    "viewConfig.summaryUnique": "Unique",
    "viewConfig.summaryEmpty": "Empty",
    "viewConfig.summaryFilled": "Filled",
    "viewConfig.summaryChecked": "Checked",
    "viewConfig.summaryUnchecked": "Unchecked",
    "viewConfig.summaryEarliest": "Earliest",
    "viewConfig.summaryLatest": "Latest",
    "viewConfig.summaryStddev": "Std dev",
    "viewConfig.databaseReadonly": "Database settings are read-only here. Open the full database view to modify them.",
    "viewConfig.noTableSettings": "Table view has no extra layout settings.",
    "viewConfig.noExtraSettings": "This view has no extra layout settings.",
    "chart.other": "Other",
    "chart.countLabel": "Count",
    "chart.noFields": "No categorizable fields. Create a select, status, multi-select, or checkbox property first.",
    "chart.noFieldSelected": "Select a grouping field in view settings.",
    "chart.noValueFieldSelected": "Select a numeric value field in view settings.",
    "chart.noRecords": "No records match the current filters.",
    "chart.allGroupsHidden": "All chart groups are hidden. Show at least one group in Chart options.",
    "chart.showAllGroups": "Show all groups",
    "chart.invalidAxisRange": "Enter a value-axis maximum greater than the minimum.",
    "chart.resetAxisRange": "Reset axis range",
    "chart.chooseDefaultGroup": "Choose default group",
    "chart.chooseDefaultValue": "Choose default value",
    "chart.barChart": "Bar chart",
    "chart.stackedBarChart": "Stacked bar",
    "chart.groupedBarChart": "Grouped bar",
    "chart.percentStackedBarChart": "100% stacked bar",
    "chart.horizontalBarChart": "Horizontal bar",
    "chart.lineChart": "Line chart",
    "chart.areaChart": "Area chart",
    "chart.pieChart": "Pie chart",
    "chart.donutChart": "Donut chart",
    "chart.numberChart": "Single number",
    "chart.mixedChart": "Mixed chart",
    "chart.total": "Total",
    "chart.countAggregation": "Count",
    "chart.sumAggregation": "Sum",
    "chart.avgAggregation": "Average",
    "chart.medianAggregation": "Median",
    "chart.minAggregation": "Minimum",
    "chart.maxAggregation": "Maximum",
    "chart.rangeAggregation": "Range",
    "chart.uniqueAggregation": "Unique values",
    "chart.emptyAggregation": "Empty",
    "chart.notEmptyAggregation": "Not empty",
    "chart.percentEmptyAggregation": "Percent empty",
    "chart.percentNotEmptyAggregation": "Percent not empty",
    "chart.checkedAggregation": "Checked",
    "chart.uncheckedAggregation": "Unchecked",
    "chart.percentCheckedAggregation": "Percent checked",
    "chart.toolbarType": "Type",
    "chart.toolbarGroup": "Group",
    "chart.toolbarBucket": "Bucket",
    "chart.toolbarStack": "Stack",
    "chart.toolbarSeries": "Subgroup",
    "chart.toolbarSubgroup": "Subgroup",
    "chart.toolbarAggregation": "Agg.",
    "chart.toolbarValue": "Value",
    "chart.toolbarLineAggregation": "Line agg.",
    "chart.toolbarLineValue": "Line value",
    "chart.recordsValue": "Records",
    "chart.exportImage": "Export PNG",
    "chart.copyPng": "Copy PNG",
    "chart.exportedImage": "Chart image exported",
    "chart.copiedPng": "PNG copied",
    "chart.exportUnavailable": "No chart image is available to export.",
    "chart.dateBucketDay": "Day",
    "chart.dateBucketWeek": "Week",
    "chart.dateBucketMonth": "Month",
    "chart.dateBucketQuarter": "Quarter",
    "chart.dateBucketYear": "Year",
    "chart.numberBucketAuto": "Auto",
    "chart.numberBucketFixed": "Fixed",
    "chart.numberBucketSize": "Bucket size",
    "chart.options": "Chart options",
    "chart.optionsData": "Data",
    "chart.optionsStyle": "Style",
    "chart.optionsExport": "Export",
    "chart.autoTitleCount": "Count",
    "chart.autoTitleValue": "{aggregation} of {value}",
    "chart.autoTitleCountBy": "Count by {group}",
    "chart.autoTitleValueBy": "{aggregation} of {value} by {group}",
    "chart.autoTitleMixed": "{primary} and {secondary} by {group}",
    "chart.autoTitleDateGroup": "{bucket} of {field}",
    "chart.autoTitleNumberBucketGroup": "{field} buckets",
    "chart.sortBy": "Sort",
    "chart.sortOptionOrder": "Option order",
    "chart.sortValueDesc": "Value descending",
    "chart.sortValueAsc": "Value ascending",
    "chart.sortLabelAsc": "Label A-Z",
    "chart.sortLabelDesc": "Label Z-A",
    "chart.visibleGroups": "Visible groups",
    "chart.visibleGroupsEntry": "Groups",
    "chart.omitZeroValues": "Omit zero values",
    "chart.cumulative": "Cumulative",
    "chart.title": "Title",
    "chart.titleHelp": "Leave empty to use the generated chart title.",
    "chart.height": "Height",
    "chart.heightSmall": "Small",
    "chart.heightMedium": "Medium",
    "chart.heightLarge": "Large",
    "chart.heightXLarge": "Extra large",
    "chart.gridLines": "Grid lines",
    "chart.gridNone": "None",
    "chart.gridValue": "Value axis",
    "chart.gridBoth": "Both axes",
    "chart.axisNames": "Axis names",
    "chart.axisNone": "None",
    "chart.axisX": "X axis",
    "chart.axisY": "Y axis",
    "chart.axisBoth": "Both axes",
    "chart.valueAxisRange": "Value axis",
    "chart.axisAuto": "Auto",
    "chart.axisZeroBased": "Zero-based",
    "chart.axisCustom": "Custom",
    "chart.axisMin": "Min",
    "chart.axisMax": "Max",
    "chart.referenceLines": "Reference lines",
    "chart.referenceLinesEntry": "Reference lines",
    "chart.referenceLineConstant": "Constant",
    "chart.referenceLineAverage": "Average",
    "chart.referenceLineMedian": "Median",
    "chart.referenceLineMin": "Minimum",
    "chart.referenceLineMax": "Maximum",
    "chart.referenceLineStyle": "Line style",
    "chart.referenceLineSolid": "Solid",
    "chart.referenceLineDashed": "Dashed",
    "chart.referenceLineDotted": "Dotted",
    "chart.referenceLineColor": "Color",
    "chart.addReferenceLine": "Add reference line +",
    "chart.referenceLineColorDefault": "Default",
    "chart.referenceLineColorGray": "Gray",
    "chart.referenceLineColorBlue": "Blue",
    "chart.referenceLineColorGreen": "Green",
    "chart.referenceLineColorAmber": "Amber",
    "chart.referenceLineColorRed": "Red",
    "chart.referenceLineColorPurple": "Purple",
    "chart.referenceLineColorPink": "Pink",
    "chart.colorPalette": "Colors",
    "chart.colorPaletteAuto": "Auto",
    "chart.colorPaletteAccent": "Accent",
    "chart.colorPaletteColorful": "Sunset",
    "chart.colorPalettePastel": "Lavender",
    "chart.colorPaletteVivid": "Berry",
    "chart.colorPaletteWarm": "Blush",
    "chart.colorPaletteCool": "Ocean",
    "chart.colorPaletteMono": "Graphite",
    "chart.colorPaletteOption": "Option colors",
    "chart.colorByValue": "Color by value",
    "chart.dataLabelMode": "Label mode",
    "chart.dataLabelColor": "Label color",
    "chart.dataLabelColorAuto": "Auto contrast",
    "chart.dataLabelColorDark": "Dark",
    "chart.dataLabelColorLight": "Light",
    "chart.dataLabelColorAccent": "Accent",
    "chart.dataLabelValue": "Value",
    "chart.dataLabelPercent": "Percent",
    "chart.dataLabelLabelValue": "Label + value",
    "chart.optionsStyleEntry": "Customize",
    "chart.showTitle": "Show title",
    "chart.showDataLabels": "Data labels",
    "chart.showLegend": "Legend",
    "chart.smoothLine": "Smooth line",
    "chart.gradientArea": "Gradient area",
    "chart.donutCenter": "Center value",
    "chart.donutCenterHidden": "Hidden",
    "chart.donutCenterTotal": "Total",
    "chart.donutCenterAggregation": "Aggregation",
    "chart.applyFilter": "Apply as filter",
    "chart.drilldownSummary": "{count} matching records",
    "chart.drilldownFile": "File",
    "chart.drilldownPath": "Path",
    "chart.drilldownOpenAll": "Open all",
    "chart.drilldownCopyLinks": "Copy links",
    "chart.drilldownCopiedLinks": "Copied {count} links",
    "chart.drilldownMore": "+{count} more",
    "chart.fieldGroup.properties": "Properties",
    "chart.fieldGroup.formulas": "Formulas",
    "chart.fieldGroup.fileMetadata": "File metadata",
    "chart.disabledBarOnly": "Available for bar charts only.",
    "chart.disabledLineAreaMixed": "Available for line, area, or mixed charts only.",
    "chart.disabledDonutOnly": "Available for donut charts only.",
    "chart.disabledNeedsGroups": "Available after choosing a group field with known groups.",
    "chart.disabledCumulative": "Available for Count or Sum on bar, line, or area charts.",
    "chart.disabledAggregationForValue": "Available for fields that support this aggregation.",
    "chart.disabledAggregationNeedsValue": "Available after choosing a value field.",
    "chart.disabledAggregationNumericOnly": "Available for number or currency fields.",
    "chart.disabledAggregationCheckboxOnly": "Available for checkbox fields.",
    "calendar.noDateField": "Choose a date property for this calendar view.",
    "calendar.noWritableDateField": "Choose a writable date property before editing calendar or timeline dates.",
    "calendar.noDateChange": "Date unchanged",
    "calendar.sameDateFieldWarning": "Start and end use the same property. Use separate date properties to store a duration and resize both edges reliably.",
    "calendar.sameDateFieldNotice": "Start and end both use \u201C{field}\u201D. Only one edge can be stored in a single property; use separate start and end properties for reliable resizing.",
    "calendar.convertDateTimeTitle": "Convert to Date & Time?",
    "calendar.convertDateTimeMessage": "This edit adds a time. Convert {fields} to Date & Time so Obsidian keeps the time value?",
    "calendar.convertDateTimeConfirm": "Convert",
    "calendar.noEvents": "No records with dates to show in this calendar.",
    "calendar.moreEvents": "+{count} more",
    "calendar.moreEventsTitle": "{count} more events on {date}",
    "calendar.resizeStart": "Adjust start date",
    "calendar.resizeEnd": "Adjust end date",
    "calendar.moveToday": "Move to today",
    "calendar.movePrevDay": "Move one day earlier",
    "calendar.moveNextDay": "Move one day later",
    "calendar.moveToDate": "Move to date",
    "calendar.moveToDatePrompt": "Enter a date as YYYY-MM-DD",
    "calendar.extendOneDay": "Extend one day",
    "calendar.shortenOneDay": "Shorten one day",
    "calendar.noAllDayEvents": "No all-day or multi-day events",
    "timeline.noDateField": "Choose a date property for this timeline view.",
    "timeline.dayRequiresDateTime": "Timeline day view requires Date & Time start/end properties. Open the full database view and convert the date properties first.",
    "timeline.invalidEventsNotice": "Found {count} invalid time event(s) (end is not after start); hidden from timeline.",
    "timeline.invalidEventsCalculating": "Checking for invalid time events...",
    "timeline.viewInvalidEvents": "Review & fix",
    "timeline.invalidEventsConflictNotice": "{count} event(s) with time conflict (end \u2264 start)",
    "timeline.fixInvalidEvents": "Fix",
    "timeline.invalidEventsNone": "No invalid time events found.",
    "timeline.invalidEventsTitle": "Invalid time events",
    "timeline.invalidEventsTitleWithCount": "Invalid time events ({count})",
    "timeline.invalidEventsDesc": "These events end at or before they start and are hidden from the timeline. Adjust start/end so end is after start.",
    "timeline.invalidEventsNote": "Note",
    "timeline.invalidEventsStart": "Start",
    "timeline.invalidEventsEnd": "End",
    "timeline.invalidEventsSpan": "Span",
    "timeline.invalidEventsSelectAll": "Select all invalid events",
    "timeline.invalidEventsSelectRow": "Select {name}",
    "timeline.invalidEventsSelected": "{count} selected",
    "timeline.invalidEventsQuickFix": "Quick fix selected",
    "timeline.invalidEventsQuickFixShort": "Fix",
    "timeline.invalidEventsStillInvalid": "Still invalid",
    "timeline.invalidEventsSpanDays": "{count} day(s)",
    "timeline.invalidEventsSpanHours": "{count} hour(s)",
    "timeline.invalidEventsSpanHoursMinutes": "{hours}h {minutes}m",
    "timeline.invalidEventsSpanMinutes": "{count} min",
    "timeline.invalidEventsConfirm": "Save changes",
    "propertyConflict.title": "Property type conflict",
    "propertyConflict.desc": "{count} property conflict(s) found. Unify the listed database definitions before continuing, or apply anyway and keep the conflict.",
    "propertyConflict.typeMismatch": "Type mismatch",
    "propertyConflict.datePrecision": "Date precision",
    "propertyConflict.datePrecisionHint": "Date and Date & Time share a property key. Prefer Date & Time if any database needs time values; converting to Date can drop times.",
    "propertyConflict.computedHint": "A saved formula field participates because this database can write formula results back to frontmatter.",
    "propertyConflict.ignore": "Ignore",
    "propertyConflict.dismissSession": "Don't remind this session",
    "propertyConflict.openProperties": "Open properties",
    "propertyConflict.ignoreAndApply": "Continue this change only",
    "propertyConflict.applyResolvedTypes": "Apply resolved types",
    "propertyConflict.resolved": "All conflicts are resolved and will be applied.",
    "propertyConflict.unresolved": "Resolve at least one property conflict before applying changes.",
    "propertyConflict.partialResolved": "Will apply {resolved} resolved conflict(s); {unresolved} unresolved conflict(s) will remain unchanged.",
    "propertyConflict.statusResolved": "Resolved",
    "propertyConflict.statusUnresolved": "Unresolved",
    "propertyConflict.observableTypesLabel": "Conflicting frontmatter shapes",
    "propertyConflict.detectedTypesLabel": "Detected shapes",
    "propertyConflict.detectedTypesSummary": "Detected {count} storage shapes:",
    "propertyConflict.fileCount": "({count} file(s))",
    "propertyConflict.resolveInstruction": "Choose compatible target types before continuing.",
    "propertyConflict.affectedFiles": "Affected database files ({count})",
    "propertyConflict.currentStorage": "Storage shape",
    "propertyConflict.changeTo": "Change to",
    "propertyConflict.pluginType": "Plugin type",
    "propertyConflict.targetStorage": "Will store as",
    "propertyConflict.targetStorageSame": "Still stores as",
    "propertyConflict.targetStorageChanged": "Will store as",
    "propertyConflict.conflictItem": "Conflicting target shape: {type}",
    "propertyConflict.columnDatabaseName": "Database",
    "propertyConflict.columnDatabasePath": "Database file path",
    "propertyConflict.columnObsidianType": "Current storage shape",
    "propertyConflict.columnPluginType": "Property type",
    "propertyConflict.columnTargetStorageType": "Target storage shape",
    "propertyConflict.changeTypeFor": "Change {key} type in {database}",
    "propertyConflict.updatedDefinitions": "Updated {count} database definition(s) for {key}.",
    "propertyConflict.sourceColumn": "Property",
    "propertyConflict.sourceComputed": "Saved formula",
    "propertyConflict.observable.text": "Text",
    "propertyConflict.observable.multitext": "Multi-text",
    "propertyConflict.observable.number": "Number",
    "propertyConflict.observable.date": "Date",
    "propertyConflict.observable.datetime": "Date & Time",
    "propertyConflict.observable.checkbox": "Checkbox",
    "timeline.noEvents": "No records with dates to show in this timeline.",
    "timeline.noEventsInRange": "No date records in this time range.",
    "timeline.uncategorized": "Uncategorized",
    "timeline.today": "Today",
    "timeline.prevShort": "Move back one column",
    "timeline.nextShort": "Move forward one column",
    "timeline.prevLong": "Move back one window",
    "timeline.nextLong": "Move forward one window",
    "timeline.prevDay": "Previous day",
    "timeline.nextDay": "Next day",
    "timeline.prevWeek": "Previous week",
    "timeline.nextWeek": "Next week",
    "timeline.prevMonth": "Previous month",
    "timeline.nextMonth": "Next month",
    "timeline.prevQuarter": "Previous quarter",
    "timeline.nextQuarter": "Next quarter",
    "timeline.scaleDay": "Day",
    "timeline.scaleWeek": "Week",
    "timeline.scaleMonth": "Month",
    "timeline.scaleQuarter": "Quarter",
    "timeline.scaleYear": "Year",
    "timeline.columnWidth": "Column width",
    "timeline.layoutSection": "Layout",
    "timeline.jumpToEvent": "Jump to {title} on {date}",
    "viewConfig.customColumnWidth": "Custom column width",
    "viewConfig.eventStartDateField": "Start date",
    "viewConfig.eventEndDateField": "End date",
    "viewConfig.eventTitleField": "Event title",
    "viewConfig.eventColorField": "Event color",
    "viewConfig.noColorField": "No color",
    "viewConfig.calendarKeepCellAspectRatio": "Keep day cells square",
    "viewConfig.calendarCellHeight": "Calendar cell height",
    "viewConfig.calendarCustomColumnWidth": "Custom column width",
    "viewConfig.calendarColumnWidthValue": "Column width",
    "viewConfig.calendarCustomRowHeight": "Custom row height",
    "viewConfig.calendarWeekSlotDuration": "Time slot duration",
    "viewConfig.calendarWeekSlotDuration.15": "15 minutes",
    "viewConfig.calendarWeekSlotDuration.30": "30 minutes",
    "viewConfig.calendarWeekSlotDuration.60": "60 minutes",
    "viewConfig.calendarStartHour": "Start hour",
    "viewConfig.calendarEndHour": "End hour",
    "viewConfig.calendarHourHeight": "Hour height",
    "viewConfig.timelineGroupField": "Timeline group",
    "viewConfig.timelineScale": "Timeline scale",
    "viewConfig.timelineScale.day": "Day",
    "viewConfig.timelineScale.week": "Week",
    "viewConfig.timelineScale.month": "Month",
    "viewConfig.timelineScale.quarter": "Quarter",
    "viewConfig.timelineScale.year": "Year",
    "viewConfig.galleryAspectPresets": "Cover proportions",
    "viewConfig.aspectSquare": "1:1",
    "viewConfig.aspectBanner": "16:9",
    "viewConfig.aspectPortrait": "3:4",
    "viewConfig.aspectLandscape": "4:3",
    "viewConfig.gallerySizePresets": "Card size",
    "viewConfig.gallerySizeSmall": "Small",
    "viewConfig.gallerySizeMedium": "Medium",
    "viewConfig.gallerySizeLarge": "Large",
    "viewConfig.chartGroupField": "Group",
    "viewConfig.chartGroupFieldNone": "Not selected",
    "viewConfig.chartStackFieldNone": "Not selected",
    "viewConfig.chartValueField": "Value field",
    "viewConfig.chartValueFieldNone": "Not selected",
    "viewConfig.chartType": "Chart type",
    "viewConfig.chartAggregation": "Aggregation",
    "viewConfig.databaseName": "Name",
    "viewConfig.databaseDescription": "Description",
    "viewConfig.descriptionPlaceholder": "Add a short description...",
    "viewConfig.sourceFolder": "Source folder",
    "viewConfig.sourceRules": "Source rules",
    "viewConfig.sourceRules.help": "Advanced database-level rules decide which notes belong to this database. Nested AND, OR, and NOT groups are preserved when converting .base files.",
    "viewConfig.sourceRules.empty": "No advanced source rules.",
    "viewConfig.sourceRules.emptyGroup": "This group has no rules.",
    "viewConfig.sourceRules.addRule": "Add source rule",
    "viewConfig.sourceRules.addGroup": "Add rule group",
    "viewConfig.sourceRules.addExpression": "Add Bases expression",
    "viewConfig.sourceRules.addNot": "Negate rule",
    "viewConfig.sourceRules.removeNot": "Remove NOT",
    "viewConfig.sourceRules.remove": "Remove rule",
    "viewConfig.sourceRules.logic": "Logic",
    "viewConfig.sourceRules.and": "AND",
    "viewConfig.sourceRules.or": "OR",
    "viewConfig.sourceRules.not": "NOT",
    "viewConfig.sourceRules.fieldPlaceholder": "Property",
    "viewConfig.sourceRules.customField": "Custom property...",
    "viewConfig.sourceRules.pickProperty": "Select property...",
    "viewConfig.sourceRules.noProperties": "No properties found",
    "viewConfig.sourceRules.searchProperties": "Search properties...",
    "viewConfig.sourceRules.fieldGroup.noteProperties": "Note properties",
    "viewConfig.sourceRules.fieldGroup.formulaProperties": "Formula properties",
    "viewConfig.sourceRules.fieldGroup.fileProperties": "File properties",
    "viewConfig.sourceRules.fieldGroup.custom": "Custom",
    "viewConfig.sourceRules.valuePlaceholder": "Value",
    "viewConfig.sourceRules.expressionPlaceholder": "Bases expression, for example: formula.ppu > 5",
    "viewConfig.sourceRules.op.inFolder": "in folder",
    "viewConfig.sourceRules.op.hasTag": "has tag",
    "viewConfig.sourceRules.op.hasProperty": "has property",
    "viewConfig.sourceRules.op.hasLink": "has link",
    "viewConfig.sourceRules.op.eq": "equals",
    "viewConfig.sourceRules.op.neq": "does not equal",
    "viewConfig.sourceRules.op.strictEq": "strictly equals",
    "viewConfig.sourceRules.op.strictNeq": "does not strictly equal",
    "viewConfig.sourceRules.op.contains": "contains",
    "viewConfig.sourceRules.op.startsWith": "starts with",
    "viewConfig.sourceRules.op.endsWith": "ends with",
    "viewConfig.sourceRules.op.matches": "matches regex",
    "viewConfig.sourceRules.op.isType": "is type",
    "viewConfig.sourceRules.op.gt": "greater than",
    "viewConfig.sourceRules.op.gte": "greater than or equal",
    "viewConfig.sourceRules.op.lt": "less than",
    "viewConfig.sourceRules.op.lte": "less than or equal",
    "viewConfig.sourceRules.op.empty": "is empty",
    "viewConfig.sourceRules.op.notempty": "is not empty",
    "viewConfig.sourceRules.op.truthy": "is truthy",
    "viewConfig.sourceRules.opGroup.file": "File",
    "viewConfig.sourceRules.opGroup.value": "Value",
    "viewConfig.sourceRules.opGroup.text": "Text",
    "viewConfig.sourceRules.opGroup.compare": "Compare",
    "viewConfig.sourceRules.opGroup.presence": "Presence",
    "viewConfig.sourceRules.opGroup.type": "Type",
    "viewConfig.sourceRules.opGroup.current": "Current",
    "viewConfig.newRecordFolder": "New note folder",
    "viewConfig.newRecordFolderLocked": "Only controls where new notes are created. Leave empty to use the source folder when set, otherwise the default database folder.",
    "viewConfig.syncComputed": "Save formula results",
    "viewConfig.saveComputedResults": "Save formula results to note properties",
    "viewConfig.computedSyncMode": "Formula result storage",
    "viewConfig.computedSync.displayOnly": "Show only in this database (recommended)",
    "viewConfig.computedSync.displayOnlyDesc": "Formula values are visible in the database, but do not create or update note properties.",
    "viewConfig.computedSync.automatic": "Automatically save to note properties",
    "viewConfig.computedSync.automaticDesc": "When this database opens or data changes, formula results can update many notes in this database scope.",
    "viewConfig.computedSync.manual": "Save to note properties manually",
    "viewConfig.computedSync.manualDesc": "Use the toolbar button when you need other plugins, exports, or Dataview to read the saved results.",
    "viewConfig.computedSync.help": "Formula values are always calculated for display. This setting only controls whether results are also saved into note properties.",
    "viewConfig.computedSync.confirmAutomatic": "Automatically saving formula results can modify many notes in this database scope.\n\nContinue?",
    "viewConfig.computedSync.manualHint": "Formula values will stay display-only until you click \u201CSave formula results\u201D.",
    "viewConfig.computedSync.displayOnlyHint": "Saved formula properties will be kept, but Note Database will stop updating them.",
    "viewConfig.computedCleanup.button": "Clear saved formula properties...",
    "viewConfig.computedCleanup.help": "Remove old saved formula values from note properties in this database scope.",
    "viewConfig.computedCleanup.title": "Clear saved formula properties",
    "viewConfig.computedCleanup.desc": "Choose saved formula properties that currently exist in note frontmatter in this database scope. This does not delete formula columns. If automatic saving is enabled, it will switch to display-only first so the properties are not recreated.",
    "viewConfig.computedCleanup.confirm": "Clear properties",
    "viewConfig.computedCleanup.noFields": "No saved formula properties were found in this database scope.",
    "viewConfig.computedCleanup.optionField": "Formula field: {label}",
    "viewConfig.computedCleanup.optionKey": "Saved frontmatter property: {key} \xB7 {count} note(s)",
    "viewConfig.coverField": "Cover field",
    "viewConfig.noCover": "No cover",
    "viewConfig.imageFit": "Image fit",
    "viewConfig.cover": "Cover",
    "viewConfig.contain": "Contain",
    "viewConfig.cardSize": "Card size",
    "viewConfig.coverRatio": "Cover ratio",
    "viewConfig.ratioPortrait": "Portrait 0.6",
    "viewConfig.ratioClassic": "Classic 0.75",
    "viewConfig.ratioSquare": "Square 1:1",
    "viewConfig.ratioLandscape": "Landscape 4:3",
    "viewConfig.ratioWide": "Wide 16:9",
    "viewConfig.ratioCurrent": "Current {ratio}",
    "viewConfig.boardColumnWidth": "Board column width",
    "viewConfig.defaultColumnWidth": "Default property width",
    "viewConfig.titleField": "Title field",
    "viewConfig.titleAuto": "Use file name",
    "viewConfig.noTitle": "No title",
    "viewConfig.showEmptyFields": "Show empty visible properties",
    "viewConfig.listCompactFields": "Compact field layout",
    "viewConfig.statusPreset": "Default status preset",
    "viewConfig.statusPreset.help": "Used when creating new status properties at this level. Manage presets edits only this database/view level.",
    "viewConfig.boardSubgroupField": "Board subgroup",
    "viewConfig.noSubgroup": "No subgroup",
    "statusPresets.title": "Status presets",
    "statusPresets.desc": "Configure reusable status option sets and choose which set new status properties use by default.",
    "statusPresets.manage": "Manage presets",
    "statusPresets.none": "No preset",
    "statusPresets.add": "Add preset",
    "statusPresets.default": "Default preset",
    "statusPresets.defaultShort": "Default",
    "statusPresets.useAsDefault": "Use as default",
    "statusPresets.editOptions": "Edit options",
    "statusPresets.newPreset": "New preset",
    "statusPresets.namePlaceholder": "Preset name",
    "statusPresets.keepOne": "Keep at least one preset.",
    "filter.eq": "equals",
    "filter.neq": "does not equal",
    "filter.contains": "contains",
    "filter.hasTag": "has tag",
    "filter.gt": "greater than",
    "filter.gte": "greater than or equal",
    "filter.lt": "less than",
    "filter.lte": "less than or equal",
    "filter.empty": "is empty",
    "filter.notempty": "is not empty",
    "filter.checkboxChecked": "is checked",
    "filter.checkboxUnchecked": "is unchecked",
    "menu.editProperty": 'Edit property "{name}"...',
    "menu.back": "\u2190 Back",
    "menu.editOptions": "Edit options, colors, and order...",
    "menu.openFormula": "Open formula editor...",
    "menu.changeType": "Change type...",
    "menu.insertLeft": "Insert property left",
    "menu.insertRight": "Insert property right",
    "menu.duplicateColumn": "Duplicate property",
    "menu.moveUp": "Move up",
    "menu.moveDown": "Move down",
    "menu.hideProperty": 'Hide "{name}"',
    "menu.enableWrap": "Enable wrap",
    "menu.disableWrap": "Disable wrap",
    "menu.textRenderLink": "Link",
    "menu.textRenderPlain": "Plain text",
    "menu.textRenderMarkdown": "Markdown",
    "menu.textLinkSchemeTitle": "Link scheme",
    "menu.textLinkSchemeHttps": "HTTPS",
    "menu.textLinkSchemeEmail": "Email",
    "menu.textLinkSchemePhone": "Phone",
    "menu.textLinkSchemeNone": "None",
    "mdToolbar.bold": "Bold",
    "mdToolbar.italic": "Italic",
    "mdToolbar.strike": "Strikethrough",
    "mdToolbar.highlight": "Highlight",
    "mdToolbar.code": "Code",
    "mdToolbar.math": "Formula",
    "mdToolbar.link": "Link",
    "mdToolbar.wikilink": "Note link",
    "mdToolbar.linkText": "text",
    "mdToolbar.wikilinkText": "note",
    "menu.numberStylePlain": "Number",
    "menu.numberStyleRating": "Rating",
    "menu.numberStyleProgress": "Horizontal progress",
    "menu.numberStyleRing": "Circular progress",
    "menu.numberDisplayStyle": "Display style",
    "menu.numberDisplayOptions": "Display options",
    "menu.numberDisplayIcon": "Icon",
    "menu.numberDisplayIconEmoji": "Custom emoji",
    "menu.numberDisplayEmoji": "Custom emoji",
    "menu.numberDisplayIconStyle": "Icon style",
    "menu.numberDisplayIconFilled": "Filled",
    "menu.numberDisplayIconOutline": "Outline",
    "menu.numberDisplayMax": "Max",
    "menu.numberDisplayDivisor": "Divisor",
    "menu.numberDisplayShowValue": "Show value",
    "menu.numberDisplayColor": "Color",
    "menu.numberDisplayColorDefault": "Default",
    "menu.numberDisplayColorTheme": "Theme color",
    "menu.numberDisplayColorCustom": "Custom",
    "menu.numberStyleCustom": "Custom",
    "panel.numberDisplayStyle": "Display style",
    "modal.numberDisplayStyle": "Number display style",
    "undo.numberDisplayStyleConfig": "number display style",
    "menu.adjustColumnWidth": "Adjust column width",
    "columnWidth.adjustTitle": 'Adjust "{name}"',
    "columnWidth.auto": "Auto",
    "columnWidth.narrow": "Narrow",
    "columnWidth.medium": "Medium",
    "columnWidth.wide": "Wide",
    "menu.autoFitColumn": "Auto fit column width",
    "menu.autoFitAllColumns": "Auto fit all visible columns",
    "menu.sortBy": 'Sort by "{name}"',
    "menu.sortAscending": "Sort ascending",
    "menu.sortDescending": "Sort descending",
    "menu.filterByValue": "Filter by {name}",
    "menu.clearSort": "Clear sort",
    "menu.deleteColumn": "Delete property",
    "menu.openNote": "Open note",
    "menu.insertAbove": "Insert above",
    "menu.insertBelow": "Insert below",
    "menu.newFromTemplate": "New from template",
    "menu.deleteRow": 'Delete "{name}"',
    "menu.confirmDeleteRow": 'Delete "{name}"?\n\nThe Markdown file will be moved to trash.',
    "menu.duplicateRecord": "Duplicate record",
    "menu.copySuffix": "copy",
    "settings.title": "Note Database settings",
    "settings.language.name": "Language",
    "settings.language.desc": "Choose the interface language. System follows Obsidian/browser language.",
    "viewConfig.yearDisplayMode": "Date year display",
    "viewConfig.yearDisplayMode.always": "Always show year",
    "viewConfig.yearDisplayMode.smart": "Auto (hide current year)",
    "viewConfig.yearDisplayMode.never": "Always hide year",
    "undo.yearDisplayModeConfig": "changed date year display",
    "settings.language.system": "System",
    "settings.language.en": "English",
    "settings.language.zhCN": "Simplified Chinese",
    "settings.language.zhTW": "Traditional Chinese",
    "settings.databaseFolder.name": "Default output folder",
    "settings.databaseFolder.desc": "Vault path used for generated database files and for new notes when a database has no source or new note folder.",
    "settings.databaseFiles.name": "Database files",
    "settings.databaseFiles.modalTitle": "Database files",
    "settings.databaseFiles.emptyHint": "No database files found with db_view: true.",
    "settings.databaseFilesAlwaysOpenInNewTab.name": "Always open database files in new tab",
    "settings.databaseFilesAlwaysOpenInNewTab.desc": "Open db_view Markdown files in a new tab by default.",
    "settings.databaseFilesPreventDuplicateTabs.name": "Prevent duplicate database file tabs",
    "settings.databaseFilesPreventDuplicateTabs.desc": "If a database file tab is already open, switch to it instead of opening another one.",
    "settings.showDatabaseIcon.name": "Show database icon",
    "settings.showDatabaseIcon.desc": "Display the icon slot in the database header.",
    "settings.dashboardInitialSource.name": "Dashboard start page",
    "settings.dashboardInitialSource.desc": "Choose whether the dashboard opens on the first configuration database or the first database file.",
    "settings.dashboardInitialSource.settings": "Configuration database",
    "settings.dashboardInitialSource.file": "Database file",
    "settings.csvMarkdownTransfer.name": "CSV + Markdown import/export",
    "settings.csvMarkdownTransfer.desc": "Import CSV with Markdown files, or export the current dashboard view as a ZIP containing CSV, Markdown files, and database metadata.",
    "settings.csvMarkdownTransfer.import": "Import CSV + Markdown",
    "settings.csvMarkdownTransfer.export": "Export current view",
    "settings.statusPresets.name": "Global status presets",
    "settings.statusPresets.desc": "Manage reusable option lists for status properties and choose the global default.",
    "settings.groups.general": "General",
    "settings.groups.dataManagement": "Data management",
    "settings.groups.statusPresets": "Status presets",
    "settings.groups.databases": "Configuration databases",
    "settings.groups.databaseFiles": "File-type databases",
    "settings.groups.databaseFiles.desc": "Standalone .md files with db_view: true.",
    "settings.groups.trash": "Trash",
    "settings.addDatabaseFile": "New database file",
    "settings.databaseList.columns": "columns",
    "settings.databaseList.views": "views",
    "settings.databaseList.title": "Databases",
    "settings.databaseList.desc": "Manage configuration-type databases. These databases are not stored as files, but saved in plugin settings.",
    "settings.databaseList.manageInDashboard": "Edit this database from the dashboard settings button.",
    "settings.empty.title": "No configured databases",
    "settings.empty.desc": "Create a blank configuration database here, import an Obsidian .base file, or create a database file from the command palette.",
    "settings.addDatabase": "Add blank database",
    "settings.databaseName": "Database name",
    "settings.sourceFolder": "Source folder",
    "settings.sourceFolder.desc": "Vault path to scan for notes. Leave empty to scan the vault root.",
    "settings.sourceFolder.placeholder": "Example: Projects",
    "settings.defaultSort": "Default sort",
    "settings.sortField": "Sort field",
    "settings.deleteDatabase": "Delete this database",
    "settings.trash": "Trash",
    "settings.confirmPermanentDelete": 'Permanently delete database "{name}"? This cannot be undone.',
    "deleteDatabase.title": 'Delete database "{name}"',
    "deleteDatabase.info": "This database currently matches {count} note files.",
    "deleteDatabase.deleteFiles": "Also move matching note files to system trash",
    "deleteDatabase.deleteFilesDesc": "{count} files will be moved to the system trash.",
    "deleteDatabase.moveToPluginTrash": "Move to plugin trash",
    "deleteDatabase.moveToSystemTrash": "Move to system trash",
    "addDatabase.title": "New database",
    "addDatabase.sourceDesc": "Vault path to scan for notes. Leave empty to scan the vault root.",
    "addDatabase.createAs": "Create as",
    "addDatabase.createInSettings": "Configuration database",
    "addDatabase.createAsFile": "Database file",
    "addDatabase.create": "Create",
    "addDatabase.scanTitle": "Discovered Properties",
    "addDatabase.scanDesc": "The following properties were found in the source folder files. Select which ones to include as database columns.",
    "baseImport.title": "Confirm imported properties",
    "baseImport.desc": "These properties were inferred from your files. Review the types before importing. file.name is added automatically as the file name column, so it is not listed below.",
    "baseImport.chooseBaseFile": "Choose .base file",
    "baseImport.chooseBaseFilePlaceholder": "Search .base files...",
    "baseImport.property": "Property key",
    "baseImport.displayName": "Column title",
    "baseImport.inferredType": "Inferred type",
    "baseImport.fileCount": "Files",
    "baseImport.confirm": "Import",
    "baseImport.include": "Include",
    "csvMarkdownImport.title": "Import CSV + Markdown files",
    "csvMarkdownImport.desc": "Select the summary CSV file (named *_all.csv) exported by this plugin for best results. You may also select individual view CSV files. Optionally add Markdown files and note-database.json metadata.",
    "csvMarkdownImport.csv": "CSV file",
    "csvMarkdownImport.markdown": "Markdown files",
    "csvMarkdownImport.metadata": "Database metadata",
    "csvMarkdownImport.databaseName": "Database name",
    "csvMarkdownImport.targetFolder": "Imported note folder",
    "csvMarkdownImport.import": "Import",
    "csvMarkdownImport.chooseCsv": "Choose CSV",
    "csvMarkdownImport.chooseMarkdown": "Choose Markdown files",
    "csvMarkdownImport.chooseMetadata": "Choose metadata",
    "csvMarkdownImport.noFile": "No file selected",
    "csvMarkdownImport.filesSelected": "{count} files selected",
    "csvMarkdownExport.title": "Export CSV + Markdown ZIP",
    "csvMarkdownExport.desc": "The ZIP contains a CSV file, one Markdown file per row, and note-database.json metadata for re-importing the database structure.",
    "csvMarkdownExport.includeFrontmatter": "Include frontmatter in exported Markdown files",
    "csvMarkdownExport.includeAllTableViews": "Include CSV files for all table views",
    "csvMarkdownExport.chooseLocation": "Choose export location",
    "csvMarkdownExport.export": "Export",
    "defaults.newDatabase": "New database",
    "defaults.nameColumn": "Name",
    "formula.title": "Edit formula: {name}",
    "formula.subtitle": "Computed field \xB7 Property key: {key}",
    "formula.storage.displayOnly": "Virtual property key: {key}",
    "formula.storage.savedProperty": "Saved note property key: {key}",
    "formula.storage.displayOnlyNote": "This formula is shown in the database only and will not appear in note properties.",
    "formula.storage.manualNote": "Click \u201CSave formula results\u201D when you want to write this value into note properties.",
    "formula.storage.automaticNote": "This value can be saved automatically into note properties for notes in this database scope.",
    "formula.resultType": "Result type",
    "formula.typeNumber": "Number",
    "formula.typeText": "Text",
    "formula.typeDate": "Date",
    "formula.typeDatetime": "Date & Time",
    "formula.resultTypeDatetime": "Result type is Date & Time, but current result is not a date-time string",
    "formula.fn.HOUR.desc": "Return the hour (0-23) of a datetime.",
    "formula.fn.MINUTE.desc": "Return the minute (0-59) of a datetime.",
    "formula.fn.SECOND.desc": "Return the second (0-59) of a datetime.",
    "formula.fn.TIME.desc": "Build a time string HH:mm:ss from hour, minute, second.",
    "formula.ex.dateTime.name": "Shift datetime by hours",
    "formula.ex.dateTime.desc": "Add hours to a datetime, keeping the time part.",
    "formula.typeCheckbox": "Checkbox",
    "formula.sectionTitle": "Formula",
    "formula.referenceNote": "Reference fields: type [ and search by column title. The editor inserts the formula reference for you.",
    "formula.referenceNoteAdvanced": "Example: column title \u201CUnit price\u201D \u2192 formula reference [price]. A bare price is only a compatible shorthand for the property key; a column title cannot be used bare.",
    "formula.referenceNoteBase": "Reference fields: type [ and search by column title. The editor inserts the matching Bases formula reference.",
    "formula.referenceNoteBaseAdvanced": "Example: column title \u201CUnit price\u201D \u2192 note.price; computed fields use formula.total. A column title cannot be used bare.",
    "formula.previewItem": "Preview item",
    "formula.noPreviewItems": "No items to preview",
    "formula.calcResult": "Result",
    "formula.notCalculated": "Not calculated",
    "formula.waitingForFormula": "Waiting for formula",
    "formula.enterFormula": "Please enter a formula",
    "formula.noPreviewSaveFirst": "No preview items. Will calculate after saving.",
    "formula.valid": "Formula is valid",
    "formula.noPreview": "No preview",
    "formula.fieldNotExist": "Field does not exist: {name}",
    "formula.undefinedVariable": "Undefined variable or field: {name}. Type [ and search by column title to insert a formula reference.",
    "formula.columnTitleAsVariable": "\u201C{label}\u201D is a column title and cannot be used as a bare variable. Use the formula reference [{key}].",
    "formula.divisionByZero": "Division by zero: result is infinity. Use IFERROR to handle.",
    "formula.resultNaN": "Result is not a valid number (NaN). A referenced field may be empty or non-numeric \u2014 use IFERROR([a] / [b], 0) to provide a fallback.",
    "formula.resultTypeMismatch": "Result type is Number, but current result is not a number",
    "formula.resultTypeDate": "Result type is Date, but current result is not a date string",
    "formula.resultTypeCheckbox": "Result type is Checkbox, but current result is not true or false",
    "formula.save": "Save formula",
    "formula.notModified": "Not modified",
    "formula.invalid": "Formula invalid",
    "formula.errorBadge": "Formula error",
    "formula.errorHint": "Formula error \u2014 double-click to edit the formula",
    "validation.invalidNumber": "Enter a valid number",
    "validation.invalidDate": "Enter a complete valid date",
    "relation.notFoundInVault": "Note not found in vault",
    "refresh.loading": "Loading database",
    "formula.fieldsAndFunctions": "Fields & Functions",
    "formula.searchPlaceholder": "Search functions or fields...",
    "formula.noMatch": "No matching fields or functions",
    "formula.noMatchHint": "Try a different keyword, or add fields to the database first.",
    "formula.insertField": "Insert formula reference {reference}",
    "formula.fieldHint": "Formula references use the property key. When a property key changes, the plugin will try to update bracket references.",
    "formula.columnTitle": "Column title",
    "formula.formulaReference": "Formula ref",
    "formula.referenceShort": "Ref",
    "formula.availableOptions": "Available options",
    "formula.noOptions": "No options found in this database.",
    "formula.fileTagsHint": "file.tags is a tag list from Obsidian tags and frontmatter tags. Reference it as a list in formulas; it does not use database option colors.",
    "formula.syntaxHint": "Formula syntax is based on JavaScript expressions: use === for equality, quotes for text. Formulas can optionally start with =.",
    "formula.typeCoercionHint": "Result type controls validation and display; it does not restrict how this field can be used in later calculations.",
    "formula.ifErrorFallbackHint": 'If a result may be ERROR or NaN, use IFERROR(expression, "") to leave it empty when no valid result is available.',
    "formula.fieldValues": "Field values",
    "formula.noReferencedFields": "No field values need to be substituted.",
    "formula.substitutedFormula": "Substituted formula",
    "formula.emptyValue": "(empty)",
    "formula.enterToSeeSteps": "Enter a formula to see its substituted formula and field values.",
    "formula.noPreviewForSteps": "No preview item is available for formula substitution.",
    "formula.catFields": "Fields",
    "formula.catExamples": "Examples",
    "formula.catLogic": "Logic",
    "formula.catMath": "Math",
    "formula.catText": "Text",
    "formula.catDate": "Date",
    "formula.catStats": "Statistics",
    "formula.fn.IF.desc": "Return one of two values based on a condition. Use JavaScript comparison operators (===, !==, >, <).",
    "formula.fn.IFERROR.desc": "Return a fallback value when the result is empty, NaN, or Infinity.",
    "formula.fn.DAYS.desc": "Calculate the number of days between two dates. Returns end_date - start_date.",
    "formula.fn.ADDDAYS.desc": "Add a specified number of days to a date. Returns YYYY-MM-DD.",
    "formula.fn.TEXT.desc": "Format a number or date as text (supports 0.00, #,##0.00, 0%).",
    "formula.fn.ROUND.desc": "Round a number to the specified number of decimal places.",
    "formula.fn.AND.desc": "Return true when all conditions are true.",
    "formula.fn.OR.desc": "Return true when any condition is true.",
    "formula.fn.SUM.desc": "Sum multiple numbers.",
    "formula.fn.AVERAGE.desc": "Calculate the average of multiple numbers.",
    "formula.fn.MIN.desc": "Return the smallest value.",
    "formula.fn.MAX.desc": "Return the largest value.",
    "formula.fn.ABS.desc": "Return the absolute value.",
    "formula.fn.MOD.desc": "Return the remainder, properly handling negative numbers.",
    "formula.fn.POWER.desc": "Raise a number to a power.",
    "formula.fn.ROUNDUP.desc": "Round a number up to the specified decimal places.",
    "formula.fn.ROUNDDOWN.desc": "Round a number down to the specified decimal places.",
    "formula.fn.CONCAT.desc": "Concatenate text strings.",
    "formula.fn.TEXTJOIN.desc": "Join multiple text strings with a delimiter.",
    "formula.fn.LEN.desc": "Return the length of a text string.",
    "formula.fn.LEFT.desc": "Extract text from the left side.",
    "formula.fn.RIGHT.desc": "Extract text from the right side.",
    "formula.fn.MID.desc": "Extract text from a specified position.",
    "formula.fn.TRIM.desc": "Remove leading and trailing whitespace.",
    "formula.fn.UPPER.desc": "Convert text to uppercase.",
    "formula.fn.LOWER.desc": "Convert text to lowercase.",
    "formula.fn.CONTAINS.desc": "Check if a text contains a keyword.",
    "formula.fn.TODAY.desc": "Return today's date.",
    "formula.fn.NOW.desc": "Return the current date and time.",
    "formula.fn.YEAR.desc": "Extract the year from a date.",
    "formula.fn.MONTH.desc": "Extract the month from a date.",
    "formula.fn.DATE.desc": "Construct a date from year, month, and day. Returns YYYY-MM-DD.",
    "formula.fn.EOMONTH.desc": "Return the end-of-month date after a specified number of months.",
    "formula.fn.DATEADD.desc": "Add to a date by days/weeks/months/years.",
    "formula.fn.WEEKDAY.desc": "Day of week. Default 0=Sun..6=Sat; pass return_type (1/2/3) for Excel-style numbering.",
    "formula.fn.WEEKNUM.desc": "Return the ISO week number.",
    "formula.fn.NETWORKDAYS.desc": "Number of working days (Mon\u2013Fri) between two dates, inclusive; optional holidays to exclude.",
    "formula.fn.COUNT.desc": "Count the number of numeric values.",
    "formula.fn.COUNTA.desc": "Count the number of non-empty values.",
    "formula.fn.COUNTIF.desc": "Count values that match a criterion. Supports single values or arrays.",
    "formula.fn.IFS.desc": 'Return the value for the first truthy condition, or the final fallback value. Use field("x"), IFERROR, or ?: when a branch may fail because arguments are evaluated eagerly.',
    "formula.fn.SWITCH.desc": "Return the value for the first expression match, or the final fallback value.",
    "formula.fn.SQRT.desc": "Return the square root of a number.",
    "formula.fn.LN.desc": "Return the natural logarithm of a number.",
    "formula.fn.LOG.desc": "Return the base-10 logarithm, or use an optional base.",
    "formula.fn.LOG10.desc": "Return the base-10 logarithm of a number.",
    "formula.fn.EXP.desc": "Return e raised to a number.",
    "formula.fn.CBRT.desc": "Return the cube root of a number.",
    "formula.fn.LET.desc": "Bind one quoted name to a value and evaluate the result expression with that variable.",
    "formula.fn.LETS.desc": "Bind multiple quoted names and values in order, then evaluate the result expression.",
    "formula.ex.conditional.name": "Conditional",
    "formula.ex.conditional.desc": "Return different results based on field values.",
    "formula.ex.dateDiff.name": "Date difference",
    "formula.ex.dateDiff.desc": "Calculate the number of days between two dates.",
    "formula.ex.errorFallback.name": "Error fallback",
    "formula.ex.errorFallback.desc": "Return 0 when calculation fails or result is empty.",
    "formula.ex.rounding.name": "Round number",
    "formula.ex.rounding.desc": "Round the numeric result to 2 decimal places.",
    "formula.ex.nestedIf.name": "Nested IF (grade)",
    "formula.ex.nestedIf.desc": "Classify scores into grade tiers using nested IF conditions.",
    "formula.ex.daysFromNow.name": "Days from now",
    "formula.ex.daysFromNow.desc": "Count days until a date (negative if past).",
    "formula.ex.concat.name": "Join text",
    "formula.ex.concat.desc": "Combine multiple fields and static text into one string.",
    "formula.ex.dateAdd.name": "Add to date",
    "formula.ex.dateAdd.desc": "Add months/days to a date to get a new date.",
    "formula.ex.textFormat.name": "Format number",
    "formula.ex.textFormat.desc": "Format a number with comma separators and decimal places.",
    "formula.ex.yearMonth.name": "Year-Month extract",
    "formula.ex.yearMonth.desc": "Extract year and month from a date as YYYY-MM text.",
    "formula.error.empty": "Formula cannot be empty",
    "formula.error.undefinedVar": "Undefined field or variable: {name}",
    "formula.error.incomplete": "Formula is incomplete or not a valid JavaScript expression",
    "formula.error.unexpectedEnd": "Formula is incomplete. Check for unmatched brackets or operators.",
    "formula.error.unexpectedToken": "Formula syntax error: {message}",
    "formula.error.letArgCount": "let/lets requires name/value pairs followed by a result.",
    "formula.error.letName": "let/lets variable names must be quoted identifiers.",
    "formula.error.notFunction": '"{name}" is not a function. Check spelling or if a field name was used by mistake.',
    "formula.error.nullProperty": "Cannot read property of null/undefined. Use IFERROR to handle empty values.",
    "formula.error.notIterable": "Type error: expected array or iterable.",
    "formula.error.typeError": "Type error: {message}",
    "formula.error.invalidDate": "Invalid date format. Check date field values.",
    "formula.error.rangeError": "Value range error: {message}",
    "formula.error.generic": "Calculation failed: {message}",
    "formula.error.genericShort": "Calculation failed",
    "formula.error.dangerousToken": "Formula contains forbidden keyword: {token}",
    "formula.error.noFunction": "Function declarations are not allowed in formulas",
    "formula.error.noArrowFunction": "Arrow functions are not allowed in formulas",
    "formula.copyAiPrompt": "Copy AI prompt",
    "formula.confirmDiscard": "You have unsaved changes. Discard?",
    "formula.discard": "Discard",
    "cell.doubleClickRename": "Double-click to rename",
    "cell.doubleClickEdit": "Double-click to edit",
    "cell.clickToEdit": "Click to edit",
    "cell.doubleClickEditFormula": "Double-click to edit formula",
    "cell.doubleClickConfigureRollup": "Double-click to configure rollup",
    "cell.noOptions": "No options available",
    "cell.addOption": "Add option",
    "cell.optionExists": 'Option "{name}" already exists',
    "cell.clear": "Clear",
    "cell.dragFill": "Drag to fill",
    "cell.invalidDate": "Invalid date, auto-corrected",
    "errors.updateFailed": "Update failed: {error}",
    "errors.renameFailed": "Rename failed: {error}",
    "errors.fileExists": 'File "{name}.md" already exists, cannot rename',
    "errors.renderError": "Render error: {message}",
    "errors.noStack": "No stack trace",
    "errors.viewConfigEmpty": "View config is empty",
    "errors.currentDb": 'Current database: "{name}"',
    "errors.databaseViewNotFound": "Database view not found. Use dbPath/databasePath or dbId/databaseId to specify a database, and optionally viewId for a view.",
    "errors.noColumns": "No columns configured. Please add at least one property in settings.",
    "errors.dataReadFailed": "Failed to read data: {error}",
    "errors.noDataExport": "No data to export",
    "errors.noVisibleColumns": "No visible columns to export",
    "errors.clipboardFailed": "Failed to copy to clipboard",
    "errors.copyFailed": "Copy failed: {error}",
    "errors.readFolderFailed": "Failed to read folder: {error}",
    "errors.deleteFailed": "Delete failed: {error}",
    "errors.saveViewConfigFailed": "Failed to save view config: {error}",
    "errors.batchFillFailed": "Batch fill failed: {error}",
    "errors.createFailed": "Create failed: {error}",
    "errors.unsupportedBaseFilters": "This .base file uses a global filter expression that Note Database cannot convert without changing its meaning.",
    "notice.reportsNoActiveFile": "Open a database view first.",
    "notice.reportsNotADatabaseView": "The active file is not a database view.",
    "notice.reportsMissingRollups": 'Reports needs SUM rollup columns labeled "Income" and "Expenses".',
    "notice.reportsComputedFieldsApplied": 'Added "Remaining" as a display-only computed column. Configure "Saved" with the formula editor if you need it.',
    "notice.createdDbFile": "Created database file: {path}",
    "notice.copiedDbFile": "Copied database file: {path}",
    "notice.copiedDatabase": "Copied database: {name}",
    "notice.databasesMigrated": "Migrated {count} database(s) to files",
    "notice.copiedView": "Copied view: {name}",
    "notice.copiedEmbedCode": "Copied embed code for this view",
    "notice.copiedExport": "Copied {format} to clipboard ({count} rows)",
    "notice.syncedFormulas": "Saved formula results to {count} note(s)",
    "notice.clearedComputedFrontmatter": "Removed \u201C{key}\u201D from {count} note(s)",
    "notice.filledCells": "Filled {count} cells",
    "notice.filledCellsSkipped": "Filled {count} cells; skipped {skipped} read-only cells.",
    "notice.copiedCells": "Copied {count} cells",
    "notice.cutCells": "Cut {count} cells; paste to move them",
    "notice.cutSourceChanged": "The cut source changed, so the source cells were not cleared.",
    "notice.pastedCells": "Pasted {count} cells",
    "notice.pastedCellsSkipped": "Pasted {count} cells; skipped {skipped} read-only cells.",
    "notice.pastedCellsCreatedRows": "Pasted {count} cells and created {rows} records",
    "notice.pastedCellsCreatedRowsSkipped": "Pasted {count} cells and created {rows} records; skipped {skipped} read-only cells.",
    "notice.createdRowsRuleRisk": "{count} created records may not match the current source rules.",
    "notice.clearedCells": "Cleared {count} cells",
    "notice.clearedCellsSkipped": "Cleared {count} cells; skipped {skipped} read-only cells.",
    "notice.noEditableCells": "No editable cells in the selection.",
    "notice.noEditableCellsSkipped": "No editable cells in the selection. Skipped {skipped} read-only cells.",
    "notice.nothingToUndo": "Nothing to undo",
    "notice.nothingToRedo": "Nothing to redo",
    "notice.undone": "Undid {action}",
    "notice.redone": "Redid {action}",
    "notice.createdRow": "Created new row: {name}",
    "notice.createdNote": "Created note: {path}",
    "notice.createdNoteRuleRisk": "Created {path} \u2014 it may not match the current source rules ({reasons}).",
    "createRuleRisk.unappliedRule": "some rules cannot be auto-filled",
    "createRuleRisk.conflictOverride": "source rules overrode view defaults",
    "createRuleRisk.conflictSameField": "conflicting rules on the same property",
    "createRuleRisk.folderConflict": "new-record folder conflicts with a required folder",
    "createRuleRisk.filenameSuffix": "a duplicate name changed the filename",
    "createRuleRisk.filenameInvalid": "filename has invalid characters",
    "createRuleRisk.filenameNormalized": "filename was changed by normalization",
    "createRuleRisk.filenameEmpty": "filename rule was empty",
    "createRuleRisk.unconstructable": "some rules could not be constructed",
    "createRuleRisk.readonlyFileField": "read-only file fields cannot be set",
    "notice.deletedRow": "Deleted: {name}",
    "notice.duplicatedRecord": "Duplicated to {path}",
    "notice.selectGroupField": "Please select a group field first",
    "notice.viewLimit": "Maximum 15 views supported",
    "notice.editInFullView": "Please edit in the full database view",
    "notice.embedReadonly": "Embedded database is read-only. Please edit in the full database view.",
    "notice.noDbCopyInfo": "No database location info found to copy",
    "confirm.deleteSelected": "Delete {count} selected entries?\n\nThe corresponding Markdown files will be moved to trash.",
    "defaults.untitledNote": "Untitled",
    "defaults.viewCopy": "{name} copy",
    "defaults.dbCopy": "{name} copy",
    "empty.noDatabases": "No database files yet.",
    "empty.createFirstDatabase": "Create your first Note Database",
    "empty.noColumnsDb": 'Database "{name}" has no columns. Please add at least one property in settings.',
    "emptyState.noDatabaseTitle": "Start with a database",
    "emptyState.noDatabaseMessage": "Create a local database or begin with a lightweight starter layout.",
    "emptyState.missingViewMessage": "The embedded database definition could not be found. Check its reference and try again.",
    "emptyState.noColumnsTitle": "Add your first property",
    "emptyState.noColumnsMessage": "Properties turn note frontmatter into useful database columns.",
    "emptyState.noMatchingTitle": "No records to show",
    "emptyState.noMatchingMessage": "There are no records in this view yet.",
    "emptyState.searchEmptyTitle": "No search results",
    "emptyState.searchEmptyMessage": "Try a different search term or clear the search.",
    "emptyState.searchResultsFor": 'No results for "{query}"',
    "emptyState.filterEmptyTitle": "No records match these filters",
    "emptyState.filterEmptyMessage": "Adjust the filters to see more records.",
    "emptyState.filterAndSearchTitle": "No records match search and filters",
    "emptyState.filterAndSearchMessage": "Clear one of the active conditions to restore records.",
    "emptyState.limitEmptyTitle": "No records are visible",
    "emptyState.limitEmptyMessage": "The current result limit hides every record.",
    "emptyState.noDateFieldTitle": "Choose a date property",
    "emptyState.noDateFieldMessage": "Select the property that supplies dates for this view.",
    "emptyState.noEventsTitle": "No dated records",
    "emptyState.noEventsMessage": "Records need a value in the selected date property to appear here.",
    "emptyState.noEventsInRangeTitle": "No dated records in this range",
    "emptyState.noEventsInRangeMessage": "Try another range or choose a different date property.",
    "emptyState.readFailedTitle": "This view could not be loaded",
    "emptyState.readFailedMessage": "Check the database source and try again.",
    "emptyState.emptyGroupTitle": "No records in this group",
    "emptyState.emptyGroupMessage": "This is a valid destination for new or moved records.",
    "emptyState.clearSearch": "Clear search",
    "emptyState.resetFilters": "Reset filters",
    "emptyState.clearAll": "Clear all",
    "emptyState.addProperty": "+ Add Property",
    "emptyState.selectDateProperty": "Select date property",
    "emptyState.retry": "Retry",
    "emptyState.showAll": "Show all",
    "emptyState.technicalDetails": "Technical details",
    "emptyState.createDatabase": "Create Database",
    "emptyState.starterPresets": "Start with a template",
    "emptyState.presetTasksTitle": "Tasks",
    "emptyState.presetTasksDesc": "Track work with status, priority, and due dates.",
    "emptyState.presetProjectsTitle": "Projects",
    "emptyState.presetProjectsDesc": "Keep projects, owners, statuses, and target dates together.",
    "emptyState.presetReadingListTitle": "Reading List",
    "emptyState.presetReadingListDesc": "Organize books by author, progress, rating, and category.",
    "emptyState.presetNotesTitle": "Notes",
    "emptyState.presetNotesDesc": "Create a simple vault index with tags and timestamps.",
    "emptyState.searchDiagnostics": "{visible} of {total} records match search",
    "emptyState.filterDiagnostics": "{visible} of {total} records match filters",
    "emptyState.limitDiagnostics": "{visible} of {total} records shown by the result limit",
    "emptyState.sourceDiagnostics": "{total} records available",
    "modal.editProperty": "Edit property \u2014 {label}",
    "modal.propertyKey": "Property key",
    "modal.propertyKeyHint": "For normal properties, this is the key stored in note YAML/frontmatter and used by formula references.",
    "modal.displayName": "Column title",
    "modal.propertyType": "Property type",
    "modal.createProperty": "Create property",
    "modal.frontmatterKey": "Property key",
    "modal.rollupNeedsRelation": "Create a relation property first",
    "modal.wrapContent": "Wrap content",
    "modal.migrateValues": "Migrate existing frontmatter property values in notes",
    "modal.migrateValuesDesc": "When checked: in each note, the old property's value will be moved to the new property key, overwriting an existing value if needed. When unchecked: the new property keeps its existing value. In both cases, the old property key will be deleted and the Obsidian property type will be updated to match the current column type.",
    "modal.migrateComputedDisabled": "Computed fields are generated by formulas and do not need migration from frontmatter.",
    "modal.propertyKeyRequired": "Property key cannot be empty",
    "modal.propertyKeyExists": 'Property "{key}" already exists',
    "modal.groupOrderTitle": "Group order \u2014 {field}",
    "modal.groupOrderHint": "Drag or use buttons to reorder. New options and groups are added automatically.",
    "modal.resetToOptionOrder": "Reset to option order",
    "modal.saveOrder": "Save order",
    "modal.statusOptions": "{type} options \u2014 {label}",
    "modal.addOption": "+ Add option",
    "modal.newOption": "New option",
    "modal.optionNameDuplicate": "Option name must be unique",
    "modal.confirmDeleteOption": 'Delete option "{name}"?',
    "modal.preset": "Preset",
    "modal.untitled": "Untitled",
    "modal.moveUp": "Move up",
    "modal.moveDown": "Move down",
    "common.colorGray": "Gray",
    "common.colorBrown": "Brown",
    "common.colorOrange": "Orange",
    "common.colorYellow": "Yellow",
    "common.colorGreen": "Green",
    "common.colorBlue": "Blue",
    "common.colorPurple": "Purple",
    "common.colorPink": "Pink",
    "common.colorRed": "Red",
    "common.colorSlate": "Slate",
    "common.colorCyan": "Cyan",
    "common.colorTeal": "Teal",
    "common.colorLime": "Lime",
    "common.colorIndigo": "Indigo",
    "common.colorViolet": "Violet",
    "common.colorRose": "Rose",
    "columnType.text": "Text",
    "columnType.number": "Number",
    "columnType.date": "Date",
    "columnType.datetime": "Date & Time",
    "columnType.currency": "Currency",
    "columnType.select": "Select",
    "columnType.multiSelect": "Multi-select",
    "columnType.status": "Status",
    "columnType.checkbox": "Checkbox",
    "columnType.computed": "Formula",
    "columnType.relation": "Relation",
    "columnType.rollup": "Rollup",
    "columnType.files": "Files",
    "relation.configure": "Configure relation",
    "relation.targetDatabase": "Target database",
    "relation.targetDatabaseRequired": "Choose a target database.",
    "rollup.configure": "Configure rollup",
    "rollup.relationField": "Relation property",
    "rollup.targetField": "Target property",
    "rollup.aggregation": "Calculation",
    "rollup.list": "Show unique values",
    "rollup.relationRequired": "Create and configure a relation property before adding a rollup.",
    "rollup.configurationRequired": "Choose a relation and target property.",
    "undo.relationConfig": "Configure relation",
    "undo.rollupConfig": "Configure rollup",
    "relation.search": "Search target records",
    "relation.noResults": "No matching records",
    "relation.selectedCount": "{count} selected",
    "relation.targetChangeImpact": "Switching databases will clear existing relations in {records} records and recheck {rollups} dependent rollups. This can be undone.",
    "relation.targetChangeInvalidRollups": "Choose a new numeric property for: {names}",
    "relation.saveAndClear": "Save & clear",
    "undo.relationTargetChange": "Switch relation database",
    "notice.relationTargetChanged": "Cleared relations in {records} records; {rollups} rollups need reconfiguration.",
    "cell.rollupReadonly": "Rollup properties are calculated automatically and cannot be edited.",
    "column.confirmDeleteRollup": "Delete the rollup property \u201C{label}\u201D? Source note properties will not be changed.",
    "columnType.group.basic": "Basic",
    "columnType.group.options": "Options",
    "columnType.group.advanced": "Advanced",
    "column.keyRequired": "Property key cannot be empty",
    "column.keyExists": 'Property "{key}" already exists',
    "column.migratedFiles": ", migrated {count} files",
    "column.cleanedOldProps": ", cleaned {count} old properties",
    "column.skippedConflicts": ", {count} files skipped (target property already has a value)",
    "column.updatedProperty": 'Updated property "{label}" (frontmatter "{key}"){migration}',
    "column.renameFailed": "Rename failed: {error}",
    "column.confirmDeleteVirtual": 'Delete column "{label}"?\n\nThis column is virtual file metadata and has no corresponding note frontmatter property.',
    "column.confirmDelete": 'Delete column "{label}"?\n\nChoose whether to also remove the note property "{key}" from all entries.',
    "column.deleteWithData": "Delete column + note data",
    "column.deleteColumnOnly": "Column only (keep note data)",
    "column.confirmDeleteComputed": 'Delete formula field "{label}"?\n\nThis removes the formula column from the database. Saved note properties are kept unless you choose to clean them up next.',
    "column.confirmDeleteComputedSavedProperty": 'Also delete the saved note property "{key}" from notes in this database scope?\n\nCancel keeps the saved properties and only deletes the formula column.',
    "column.confirmRenameComputedSavedProperty": 'Also rename the saved note property from "{oldKey}" to "{newKey}" in notes in this database scope?\n\nCancel keeps saved note properties as they are and only renames the formula field.',
    "column.confirmConvertComputedCleanup": 'Change "{key}" into a formula field?\n\nFormula values will be shown only in the database. Choose OK to also remove the existing note property "{key}" from notes in this database scope. Choose Cancel to keep existing note properties.',
    "column.confirmConvertComputedSavedProperty": 'Change "{key}" into a formula field?\n\nFormula results can be saved into the note property "{key}" and may overwrite existing values when saved. Continue?',
    "column.deletedComputed": "Deleted computed column",
    "column.deletedColumn": 'Deleted column, removed note property "{key}" from {count} files',
    "column.deleteFailed": "Delete column failed: {error}",
    "column.insertColumn": "Insert column",
    "column.insertedColumn": "Inserted column",
    "column.addColumn": "Add column",
    "column.addedColumn": "Added column",
    "column.copiedLabel": "{label} (copy)",
    "column.copiedComputed": "Copied computed column",
    "column.copiedColumn": 'Copied frontmatter "{source}" to "{target}" in {count} files',
    "column.copyColumnFailed": "Copy column failed: {error}",
    "column.changedToComputed": "Changed to computed field",
    "column.changedType": 'Changed type for frontmatter "{key}", synced {count} files',
    "column.changeTypeFailed": "Change type failed: {error}",
    "column.newColumn": "New column",
    "column.addedProperty": '{prefix}, added frontmatter "{key}" to {count} files',
    "column.actionFailed": "{action} failed: {error}",
    "column.openMenu": "Open {label} menu",
    "fileField.readonly": '"{label}" is a read-only file metadata field.',
    "fileField.tagsFrontmatterOnly": "file.tags updates only the frontmatter tags array. Inline #tags in the note body are not changed.",
    "fileField.fixedType": "file.* fields use fixed file metadata behavior. Their key, type, and options cannot be changed like normal frontmatter properties.",
    "fileField.skippedReadonlyBatch": "Skipped {count} read-only file metadata fields.",
    "fileField.unsupportedKey": '"{key}" is reserved for file metadata. Choose a different property key.',
    "fileField.addFileProperty": "File property",
    "fileField.selectFileProperty": "Select a property to add",
    "fileField.invalidTag": '"{tag}" was not saved. Obsidian tags cannot be only numbers, contain spaces, or use unsupported characters.',
    "fileField.migrationIgnored": '"{key}" is a file metadata field. Frontmatter value migration is ignored; only the column configuration is updated.',
    "notice.editProperty": "edit property",
    "notice.editEntry": "edit entry",
    "notice.deleteEntry": "delete entry",
    "notice.createEntry": "create entry",
    "notice.cannotCreateTab": "Cannot create a new tab",
    "notice.alreadyDbFile": "Current file is already a database file, no conversion needed.",
    "notice.alreadyFileDb": "Current database is already a file database, no conversion needed.",
    "notice.noExportableDb": "No configuration databases to export",
    "notice.importCancelled": "Import cancelled",
    "notice.generatedFromBase": "Generated from .base: {path}",
    "notice.noBaseFilesFound": "No .base files found in this vault.",
    "notice.baseMapViewDowngraded": "Map views from this .base file were imported as table views.",
    "notice.noImportableProperties": "No importable properties detected.",
    "notice.notValidDbFile": "Current file is not a valid database file",
    "notice.dbAlreadyExists": 'Database "{name}" already exists in configuration databases.',
    "notice.addedToSettings": "Imported as configuration database: {name}",
    "notice.noDbFilesFound": "No database files with db_view: true found.",
    "notice.noActiveDbFileToImport": "Open a database file or select a file-based database first.",
    "notice.openDashboardToExportCsvMarkdown": "Open the database dashboard before exporting a CSV + Markdown ZIP.",
    "notice.exportedCsvMarkdownZip": "Exported CSV + Markdown ZIP: {path}",
    "notice.exportedCsvMarkdownZipExternal": "Exported CSV + Markdown ZIP to: {path}",
    "notice.csvMarkdownImportInvalidCsv": "The selected CSV file is empty or invalid.",
    "notice.csvMarkdownImportInvalidMetadata": "The selected metadata file is invalid and will be ignored.",
    "notice.csvMarkdownImportComplete": "Imported {count} rows and created database file: {path}",
    "confirm.deleteDbFile": 'Delete database file "{path}"?\n\nThe file will be moved to trash.',
    "settings.trash.restoreAsConfig": "Restore as configuration database",
    "settings.trash.restoreAsFile": "Restore as database file",
    "settings.trash.restoreTitle": 'Restore "{name}"',
    "settings.trash.restoreDesc": "Choose how to restore this database.",
    "settings.trash.confirmPermanentDelete": 'Permanently delete "{name}"?',
    "settings.trash.manageTitle": "Plugin trash",
    "settings.trash.manageDesc": "Databases moved to the plugin trash can be restored or permanently deleted.",
    "settings.trash.name": "Plugin trash",
    "settings.trash.empty": "Trash is empty.",
    "common.open": "Open",
    "viewConfig.calendarColumnSizeMode": "Column width mode",
    "viewConfig.calendarColumnSizeMode.adaptive": "Adaptive",
    "viewConfig.calendarColumnSizeMode.custom": "Custom",
    "viewConfig.calendarRowSizeMode": "Row height mode",
    "viewConfig.calendarRowSizeMode.adaptive": "Adaptive",
    "viewConfig.calendarRowSizeMode.custom": "Custom",
    "viewConfig.calendarRowHeightValue": "Row height",
    "viewConfig.calendarFirstDayOfWeek": "First day of week",
    "viewConfig.dateGroupIgnoreTime": "Ignore time when grouping",
    "viewConfig.groupRowLimit": "Show at most per group",
    "viewConfig.groupRowLimitUnlimited": "Unlimited",
    "viewConfig.groupRowLimitCustom": "Custom",
    "viewConfig.groupRowLimitRecommended": "Recommended",
    "viewConfig.calendarFirstDayOfWeek.auto": "Auto (system)",
    "viewConfig.calendarFirstDayOfWeek.0": "Sunday",
    "viewConfig.calendarFirstDayOfWeek.1": "Monday",
    "viewConfig.calendarFirstDayOfWeek.6": "Saturday",
    "viewConfig.calendarMonthVisibleLanes": "Events per day",
    "viewConfig.calendarAllDayMaxLanes": "All-day rows",
    "viewConfig.calendarScale": "Calendar scale"
  };
  var zhCN = {
    "app.name": "Note Database",
    "common.add": "\u6DFB\u52A0",
    "common.save": "\u4FDD\u5B58",
    "common.cancel": "\u53D6\u6D88",
    "common.clear": "\u6E05\u9664",
    "common.close": "\u5173\u95ED",
    "common.delete": "\u5220\u9664",
    "common.edit": "\u7F16\u8F91",
    "common.more": "\u66F4\u591A",
    "common.restore": "\u6062\u590D",
    "common.permanentlyDelete": "\u6C38\u4E45\u5220\u9664",
    "common.untitled": "\u672A\u547D\u540D",
    "common.enumerationJoin": "\u3001",
    "common.notSet": "\u672A\u8BBE\u7F6E",
    "common.moveUp": "\u4E0A\u79FB",
    "common.moveDown": "\u4E0B\u79FB",
    "databaseCover.label": "\u6570\u636E\u5E93\u5C01\u9762",
    "databaseCover.choose": "\u9009\u62E9\u5C01\u9762\u56FE\u7247",
    "databaseCover.remove": "\u79FB\u9664\u5C01\u9762",
    "conditionalFormat.title": "\u6761\u4EF6\u683C\u5F0F",
    "conditionalFormat.add": "\u6DFB\u52A0\u89C4\u5219",
    "conditionalFormat.empty": "\u6682\u65E0\u683C\u5F0F\u89C4\u5219",
    "conditionalFormat.target": "\u683C\u5F0F\u76EE\u6807",
    "conditionalFormat.targetField": "\u76EE\u6807\u5C5E\u6027",
    "filter.field": "\u5C5E\u6027",
    "filter.operator": "\u8FD0\u7B97\u7B26",
    "conditionalFormat.dynamicToday": "\u52A8\u6001\u4ECA\u5929",
    "conditionalFormat.record": "\u6574\u6761\u8BB0\u5F55",
    "conditionalFormat.field": "\u6B64\u5C5E\u6027",
    "conditionalFormat.color": "\u989C\u8272",
    "conditionalFormat.icon": "\u56FE\u6807",
    "conditionalFormat.bold": "\u52A0\u7C97",
    "conditionalFormat.group": "\u6761\u4EF6\u7EC4",
    "template.label": "\u65B0\u8BB0\u5F55\u6A21\u677F",
    "template.choose": "\u9009\u62E9\u6A21\u677F\u7B14\u8BB0",
    "template.remove": "\u79FB\u9664\u6A21\u677F",
    "template.help": "\u6A21\u677F\u5C5E\u6027\u4F1A\u5148\u4E8E\u89C6\u56FE\u9ED8\u8BA4\u503C\u548C\u6765\u6E90\u89C4\u5219\u5408\u5E76\u3002",
    "template.engine.markdown": "Markdown",
    "template.engine.label": "\u6A21\u677F\u5F15\u64CE",
    "template.engine.core": "\u6838\u5FC3 Templates",
    "template.engine.templater": "Templater",
    "template.missing": "\u914D\u7F6E\u7684\u6A21\u677F\u6587\u4EF6\u5DF2\u4E0D\u5B58\u5728\u3002",
    "template.loadFailed": "\u65E0\u6CD5\u8F7D\u5165\u8BB0\u5F55\u6A21\u677F\uFF1A{error}",
    "template.templaterUnavailable": "\u672A\u5B89\u88C5 Templater\uFF0C\u6216\u5F53\u524D\u7248\u672C\u6CA1\u6709\u53EF\u517C\u5BB9\u7684\u63A5\u53E3\u3002",
    "template.templaterFailed": "\u7B14\u8BB0\u5DF2\u521B\u5EFA\uFF0C\u4F46 Templater \u5904\u7406\u5931\u8D25\uFF1A{error}",
    "filter.value": "\u6BD4\u8F83\u503C",
    "common.untitledDatabase": "\u672A\u547D\u540D\u6570\u636E\u5E93",
    "common.empty": "\u7A7A",
    "common.database": "\u6570\u636E\u5E93",
    "common.tableView": "\u8868\u683C\u89C6\u56FE",
    "common.boardView": "\u770B\u677F\u89C6\u56FE",
    "common.galleryView": "\u753B\u5ECA\u89C6\u56FE",
    "common.listView": "\u5217\u8868\u89C6\u56FE",
    "common.chartView": "\u56FE\u8868\u89C6\u56FE",
    "common.calendarView": "\u65E5\u5386\u89C6\u56FE",
    "common.timelineView": "\u65F6\u95F4\u7EBF\u89C6\u56FE",
    "accessibility.queryStatus": "\u663E\u793A {visible} \u6761\u8BB0\u5F55{qualifiers}\u3002",
    "accessibility.searchApplied": "\u5DF2\u5E94\u7528\u641C\u7D22",
    "accessibility.filtersApplied": "\u5DF2\u5E94\u7528\u7B5B\u9009",
    "accessibility.limitApplied": "\u5DF2\u5E94\u7528\u6570\u91CF\u9650\u5236",
    "timeline.accessibilityLabel": "\u65F6\u95F4\u7EBF {start} \u81F3 {end}\u3002\u53EF\u89C1\u8303\u56F4\u5185\u6709 {visible} \u4E2A\u4E8B\u4EF6\uFF1B\u8303\u56F4\u5916\u6709 {off} \u4E2A\uFF08\u4E4B\u524D {before} \u4E2A\uFF0C\u4E4B\u540E {after} \u4E2A\uFF09\u3002",
    "table.ariaLabel": "\u6570\u636E\u5E93\u8868\u683C",
    "table.addColumn": "\u6DFB\u52A0\u5217",
    "table.calculate": "+ \u8BA1\u7B97",
    "table.calculateFor": "\u8BA1\u7B97 {name}",
    "table.insertRow": "\u5728\u6B64\u63D2\u5165\u884C",
    "table.calculation.label": "\u8BA1\u7B97 {name}",
    "table.calculation.none": "\u4E0D\u8BA1\u7B97",
    "table.calculation.sum": "\u6C42\u548C",
    "table.calculation.average": "\u5E73\u5747\u503C",
    "table.calculation.median": "\u4E2D\u4F4D\u6570",
    "table.calculation.min": "\u6700\u5C0F\u503C",
    "table.calculation.max": "\u6700\u5927\u503C",
    "table.calculation.range": "\u8303\u56F4",
    "table.calculation.stddev": "\u6807\u51C6\u5DEE",
    "table.calculation.count": "\u8BA1\u6570",
    "table.calculation.unique": "\u552F\u4E00\u503C",
    "table.calculation.empty": "\u7A7A\u503C",
    "table.calculation.filled": "\u975E\u7A7A",
    "table.calculation.checked": "\u5DF2\u52FE\u9009",
    "table.calculation.unchecked": "\u672A\u52FE\u9009",
    "table.calculation.earliest": "\u6700\u65E9",
    "table.calculation.latest": "\u6700\u665A",
    "calendar.prevMonth": "\u4E0A\u4E2A\u6708",
    "calendar.prevYear": "\u4E0A\u4E00\u5E74",
    "calendar.prevYearRange": "\u4E0A\u4E00\u7EC4\u5E74\u4EFD",
    "calendar.today": "\u4ECA\u5929",
    "calendar.unscheduled": "\u672A\u5B89\u6392",
    "board.collapseGroup": "\u6298\u53E0\u5206\u7EC4",
    "board.columnOptions": "\u5217\u9009\u9879",
    "board.deleteGroup": "\u5220\u9664\u5206\u7EC4",
    "board.hideColumn": "\u9690\u85CF\u5217",
    "board.sortAscending": "\u5347\u5E8F\u6392\u5E8F",
    "board.sortDescending": "\u964D\u5E8F\u6392\u5E8F",
    "calendar.previewEvent": "\u9884\u89C8\u4E8B\u4EF6",
    "calendar.setupPreview": "\u8BBE\u7F6E\u9884\u89C8",
    "calendar.week": "\u5468",
    "dropdown.noResults": "\u65E0\u7ED3\u679C",
    "datePicker.presets": "\u5FEB\u901F\u65E5\u671F",
    "datePicker.today": "\u4ECA\u5929",
    "datePicker.tomorrow": "\u660E\u5929",
    "datePicker.nextWeek": "\u4E0B\u5468",
    "datePicker.clear": "\u6E05\u9664",
    "calendar.minutePlaceholder": "mm",
    "calendar.datePicker": "\u8DF3\u8F6C\u5230\u65E5\u671F",
    "calendar.nextMonth": "\u4E0B\u4E2A\u6708",
    "calendar.nextYear": "\u4E0B\u4E00\u5E74",
    "calendar.nextYearRange": "\u4E0B\u4E00\u7EC4\u5E74\u4EFD",
    "calendar.prevWeek": "\u4E0A\u4E00\u5468",
    "calendar.nextWeek": "\u4E0B\u4E00\u5468",
    "calendar.prevDay": "\u4E0A\u4E00\u5929",
    "calendar.nextDay": "\u4E0B\u4E00\u5929",
    "calendar.switchToDayTitle": "\u5207\u6362\u5230\u65E5\u89C6\u56FE\uFF1F",
    "calendar.switchToDayMessage": "\u5C06\u5728\u65E5\u89C6\u56FE\u4E2D\u6253\u5F00 {date}\uFF0C\u662F\u5426\u5207\u6362\uFF1F",
    "calendar.switchToDayConfirm": "\u5207\u6362",
    "calendar.openDayView": "\u6253\u5F00\u65E5\u89C6\u56FE",
    "calendar.options": "\u65E5\u5386\u9009\u9879",
    "calendar.scaleMonth": "\u6708",
    "calendar.scaleWeek": "\u5468",
    "calendar.scaleDay": "\u65E5",
    "calendar.layout": "\u5E03\u5C40",
    "calendar.time": "\u65F6\u95F4",
    "calendar.appearance": "\u5916\u89C2",
    "calendar.sizing": "\u5C3A\u5BF8",
    "calendar.weekViewComingSoon": "\u5468\u89C6\u56FE\u5373\u5C06\u4E0A\u7EBF",
    "timeline.options": "\u65F6\u95F4\u7EBF\u9009\u9879",
    "common.noGroup": "\u4E0D\u5206\u7EC4",
    "common.uncategorized": "\u672A\u5206\u7C7B",
    "group.computedCreateDisabled": "\u8BE5\u5206\u7EC4\u7531\u516C\u5F0F\u9A71\u52A8\u65E0\u6CD5\u76F4\u63A5\u65B0\u5EFA",
    "changelog.releaseNotes": "## 1.2.8 \u66F4\u65B0\u5185\u5BB9\n\n- **\u5FEB\u6377\u7B5B\u9009\u4E0E\u6392\u5E8F\uFF1A** \u9876\u680F\u76F4\u63A5\u663E\u793A\u5F53\u524D\u89C4\u5219\uFF0C\u53EF\u539F\u5730\u7F16\u8F91\u4E00\u6761\u6216\u76F4\u63A5\u79FB\u9664\u3002\n- **\u770B\u677F\u8BB0\u5F55\u5C01\u9762\uFF1A** \u6BCF\u4E2A\u770B\u677F\u89C6\u56FE\u72EC\u7ACB\u9009\u62E9\u56FE\u7247\u5C5E\u6027\u3001\u88C1\u5207\u65B9\u5F0F\u548C\u5BBD\u9AD8\u6BD4\u3002\n- **\u66F4\u6E05\u695A\u7684\u516C\u5F0F\uFF1A** \u533A\u5206\u663E\u793A\u540D\u79F0\u4E0E frontmatter \u5C5E\u6027\u540D\uFF0C\u9884\u89C8\u5B9E\u9645\u4EE3\u5165\u503C\uFF0C\u652F\u6301 `file.name`\u3001`file.tags` \u548C `IFERROR`\u3002\n- **\u5173\u8054\u4E0E\u6C47\u603B\uFF1A** \u5207\u6362\u76EE\u6807\u6570\u636E\u5E93\u4F5C\u4E3A\u4E00\u6B21\u53EF\u64A4\u9500\u64CD\u4F5C\uFF0C\u53CC\u51FB Rollup \u5355\u5143\u683C\u5373\u53EF\u914D\u7F6E\u3002\n- **\u7EDF\u4E00\u7F16\u8F91\u4F53\u9A8C\uFF1A** \u65B0\u5EFA\u5C5E\u6027\u7A97\u53E3\u3001\u9009\u9879\u5206\u7EC4\u5F69\u8272\u6807\u7B7E\u3001\u539F\u751F Page Preview \u548C\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u6301\u4E00\u81F4\u3002\n\n\u7B14\u8BB0\u4E0E\u5173\u8054\u4ECD\u7136\u53EA\u662F\u4FDD\u5B58\u5728\u672C\u5730\u7684 Markdown \u548C Obsidian \u53CC\u94FE\u3002",
    "changelog.viewPluginPage": "\u524D\u5F80\u793E\u533A\u63D2\u4EF6\u9875\u67E5\u770B\u5B8C\u6574\u529F\u80FD\u4ECB\u7ECD \u2192",
    "common.groupBy": "\u6309 {name} \u5206\u7EC4",
    "common.asc": "\u5347\u5E8F",
    "common.desc": "\u964D\u5E8F",
    "common.search": "\u641C\u7D22",
    "recordIcon.emoji": "\u8868\u60C5\u7B26\u53F7",
    "recordIcon.icons": "\u56FE\u6807",
    "recordIcon.remove": "\u79FB\u9664",
    "recordIcon.random": "\u968F\u673A",
    "recordIcon.recent": "\u6700\u8FD1",
    "recordIcon.show": "\u663E\u793A\u56FE\u6807",
    "recordIcon.field": "\u8BB0\u5F55\u56FE\u6807\u5B57\u6BB5",
    "recordIcon.override": "\u8986\u76D6\u6570\u636E\u5E93\u56FE\u6807\u5B57\u6BB5",
    "recordIcon.selectField": "\u9009\u62E9\u56FE\u6807\u5C5E\u6027",
    "recordIcon.noTextField": "\u8BF7\u5148\u521B\u5EFA\u4E00\u4E2A\u53EF\u5199\u6587\u672C\u5C5E\u6027\uFF0C\u518D\u542F\u7528\u8BB0\u5F55\u56FE\u6807\u3002",
    "recordIcon.createField": "\u521B\u5EFA\u56FE\u6807\u5C5E\u6027\u2026",
    "recordIcon.configureField": "\u8BBE\u7F6E\u8BB0\u5F55\u56FE\u6807\u5C5E\u6027\u2026",
    "recordIcon.changeRecord": "\u66F4\u6539\u6B64\u8BB0\u5F55\u7684\u56FE\u6807",
    "recordIcon.hideInView": "\u9690\u85CF\u5F53\u524D\u89C6\u56FE\u7684\u8BB0\u5F55\u56FE\u6807",
    "recordIcon.followDatabaseField": "\u8DDF\u968F\u6570\u636E\u5E93\u8BBE\u7F6E\uFF08\u5F53\u524D\uFF1A{field}\uFF09",
    "recordIcon.currentViewField": "\u5F53\u524D\u89C6\u56FE\u7684\u8BB0\u5F55\u56FE\u6807\u5C5E\u6027",
    "recordIcon.databaseDefaultField": "\u6570\u636E\u5E93\u5168\u5C40\u56FE\u6807\u9ED8\u8BA4\u5C5E\u6027",
    "recordIcon.createViewField": "\u65B0\u5EFA\u5E76\u7528\u4E8E\u5F53\u524D\u89C6\u56FE\u2026",
    "recordIcon.createDatabaseField": "\u65B0\u5EFA\u4E3A\u6570\u636E\u5E93\u5168\u5C40\u9ED8\u8BA4\u2026",
    "recordIcon.iconKeyConflict": "\u5DF2\u5B58\u5728\u540D\u4E3A icon \u7684\u4E0D\u517C\u5BB9\u5C5E\u6027\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u540D\u79F0\u6216 record_icon\u3002",
    "recordIcon.fileKeyInvalid": "\u8BB0\u5F55\u56FE\u6807\u5C5E\u6027\u4E0D\u80FD\u4F7F\u7528\u4FDD\u7559\u7684 file.* \u547D\u540D\u7A7A\u95F4\u3002",
    "recordIcon.category.people": "\u4EBA\u7269",
    "recordIcon.category.nature": "\u81EA\u7136",
    "recordIcon.category.food": "\u98DF\u7269",
    "recordIcon.category.activities": "\u6D3B\u52A8",
    "recordIcon.category.travel": "\u65C5\u884C",
    "recordIcon.category.objects": "\u7269\u54C1",
    "recordIcon.category.symbols": "\u7B26\u53F7",
    "recordIcon.category.flags": "\u65D7\u5E1C",
    "recordIcon.category.common": "\u5E38\u7528",
    "recordIcon.category.interface": "\u754C\u9762",
    "recordIcon.category.files": "\u6587\u4EF6",
    "recordIcon.category.communication": "\u6C9F\u901A",
    "recordIcon.category.media": "\u5A92\u4F53",
    "recordIcon.category.time": "\u65F6\u95F4",
    "recordIcon.category.places": "\u5730\u70B9",
    "recordIcon.category.business": "\u5546\u4E1A",
    "recordIcon.category.other": "\u5176\u4ED6",
    "iconPicker.search": "\u641C\u7D22\u56FE\u6807\u548C\u8868\u60C5\u7B26\u53F7",
    "iconPicker.searchResults": "\u641C\u7D22\u7ED3\u679C",
    "common.noResults": "\u6CA1\u6709\u7ED3\u679C",
    "common.create": "\u521B\u5EFA",
    "common.total": "\u603B\u6570",
    "common.databaseTotal": "\u6570\u636E\u5E93\u603B\u6570",
    "common.true": "\u662F",
    "common.false": "\u5426",
    "common.noMatchingData": "\u6CA1\u6709\u5339\u914D\u7684\u6570\u636E\u3002",
    "search.calendarTimelineSummary": "\u627E\u5230 {total} \u6761\uFF0C\u5F53\u524D\u8303\u56F4\u5185 {visible} \u6761",
    "search.noMatches": "\u6CA1\u6709\u5339\u914D\u9879\u3002",
    "search.inCurrentRange": "\u5F53\u524D\u8303\u56F4\u5185",
    "search.outsideCurrentRange": "\u5F53\u524D\u8303\u56F4\u5916",
    "search.moreResults": "\u8FD8\u6709 {count} \u6761\u672A\u663E\u793A",
    "mobile.moveCard": "\u79FB\u52A8\u5361\u7247",
    "mobile.moveToGroup": "\u79FB\u52A8\u5230\u5206\u7EC4",
    "mobile.moveTo": "\u79FB\u52A8\u5230",
    "mobile.moveTop": "\u79FB\u5230\u9876\u90E8",
    "mobile.moveBottom": "\u79FB\u5230\u5E95\u90E8",
    "mobile.moveBefore": "\u79FB\u5230\u524D\u9762",
    "mobile.moveAfter": "\u79FB\u5230\u540E\u9762",
    "toolbar.defaultWidth": "\u9ED8\u8BA4\u5BBD\u5EA6",
    "toolbar.wide": "\u5BBD\u5C4F",
    "toolbar.queryCluster": "\u67E5\u8BE2\u63A7\u4EF6",
    "toolbar.propertiesCluster": "\u5C5E\u6027\u63A7\u4EF6",
    "toolbar.utilities": "\u66F4\u591A\u5DE5\u5177",
    "toolbar.viewSwitcher": "\u89C6\u56FE\u5207\u6362\u5668",
    "toolbar.openDatabaseSwitcher": "\u5207\u6362\u6570\u636E\u5E93",
    "toolbar.viewSettings": "\u89C6\u56FE\u8BBE\u7F6E",
    "toolbar.displayWidth": "\u663E\u793A\u5BBD\u5EA6",
    "toolbar.searchShortcut": "\u641C\u7D22\uFF08\u2318F / Ctrl+F\uFF09",
    "toolbar.clearSearch": "\u6E05\u9664\u641C\u7D22",
    "toolbar.allViews": "\u6240\u6709\u89C6\u56FE",
    "toolbar.searchViews": "\u641C\u7D22\u89C6\u56FE",
    "toolbar.moreViewsCount": "\u66F4\u591A\u89C6\u56FE\uFF08{count}\uFF09",
    "toolbar.maxViews": "\u6700\u591A 15 \u4E2A\u89C6\u56FE",
    "toolbar.newViewName": "\u89C6\u56FE\u540D\u79F0\uFF08\u53EF\u9009\uFF09",
    "toolbar.viewKeyField": "\u6807\u9898\u5C5E\u6027",
    "toolbar.viewIcon": "\u56FE\u6807\uFF08\u53EF\u9009\uFF09",
    "toolbar.duplicateCurrentView": "\u590D\u5236\u5F53\u524D\u89C6\u56FE",
    "toolbar.setViewIcon": "\u8BBE\u7F6E\u89C6\u56FE\u56FE\u6807",
    "toolbar.chooseTemplate": "\u9009\u62E9\u6A21\u677F",
    "toolbar.insertPlacement": "\u65B0\u7B14\u8BB0\u4F4D\u7F6E",
    "toolbar.insertAtTop": "\u63D2\u5165\u5230\u9876\u90E8",
    "toolbar.insertAtBottom": "\u63D2\u5165\u5230\u5E95\u90E8",
    "toolbar.createBlankNote": "\u521B\u5EFA\u7A7A\u767D\u7B14\u8BB0",
    "toolbar.setDefaultTemplate": "\u8BBE\u7F6E\u9ED8\u8BA4\u6A21\u677F",
    "toolbar.configureTemplates": "\u914D\u7F6E\u6A21\u677F\u2026",
    "toolbar.propertiesHidden": "\u5C5E\u6027\uFF0C\u9690\u85CF {count} \u9879",
    "toolbar.clearAll": "\u5168\u90E8\u6E05\u9664",
    "toolbar.filter": "\u7B5B\u9009",
    "toolbar.sort": "\u6392\u5E8F",
    "toolbar.view": "\u89C6\u56FE",
    "toolbar.settings": "\u8BBE\u7F6E",
    "toolbar.group": "\u5206\u7EC4",
    "toolbar.groupBy": "\u6309\u5B57\u6BB5\u5206\u7EC4",
    "toolbar.groupOptions": "\u5206\u7EC4\u9009\u9879",
    "toolbar.groupOrder": "\u5206\u7EC4\u987A\u5E8F",
    "toolbar.showEmptyGroup": "\u663E\u793A\u7A7A\u5206\u7EC4",
    "toolbar.enableBoardSubgroups": "\u542F\u7528\u5B50\u7EC4",
    "toolbar.subgroupBy": "\u6309\u5B57\u6BB5\u5B50\u5206\u7EC4",
    "toolbar.selectBoardSubgroupField": "\u8BF7\u9009\u62E9\u5B50\u7EC4\u5B57\u6BB5",
    "toolbar.noAvailableBoardSubgroupFields": "\u6CA1\u6709\u53EF\u7528\u7684\u5B50\u7EC4\u5B57\u6BB5",
    "toolbar.properties": "\u5C5E\u6027",
    "toolbar.hiddenCount": "{count} \u9690\u85CF",
    "toolbar.export": "\u5BFC\u51FA",
    "toolbar.refreshDatabase": "\u5237\u65B0\u6570\u636E\u5E93",
    "toolbar.refreshingDatabase": "\u6B63\u5728\u5237\u65B0\u6570\u636E\u5E93\u2026",
    "toolbar.pendingRefreshFiles": "\u6709 {count} \u4E2A\u6587\u4EF6\u5F85\u5237\u65B0",
    "toolbar.pendingRefreshUnknown": "\u6709\u53D8\u66F4\u5F85\u5237\u65B0",
    "errors.refreshFailed": "\u6570\u636E\u5E93\u5237\u65B0\u5931\u8D25\uFF0C\u5F85\u5237\u65B0\u53D8\u66F4\u5DF2\u4FDD\u7559\u3002",
    "toolbar.share": "\u5206\u4EAB / \u5BFC\u51FA",
    "toolbar.copyFormats": "\u5BFC\u51FA\u5230\u526A\u8D34\u677F",
    "toolbar.new": "\u65B0\u5EFA",
    "toolbar.newFromTemplate": "\u4ECE\u6A21\u677F\u65B0\u5EFA",
    "toolbar.newFromTemplateTooltip": "\u4ECE\u6A21\u677F\u65B0\u5EFA\uFF1A{path}",
    "board.newGroup": "\u65B0\u5EFA\u5206\u7EC4",
    "board.groupNamePlaceholder": "\u5206\u7EC4\u540D\u79F0",
    "board.groupColor": "\u5206\u7EC4\u989C\u8272",
    "board.groupExists": "\u5206\u7EC4\u201C{name}\u201D\u5DF2\u5B58\u5728\u3002",
    "toolbar.selectedCount": "\u5DF2\u9009\u62E9 {count} \u9879",
    "toolbar.selectedCells": "\u5DF2\u9009\u62E9 {count} \u4E2A\u5355\u5143\u683C",
    "toolbar.undo": "\u64A4\u9500",
    "toolbar.openFullView": "\u5728\u5B8C\u6574\u6570\u636E\u5E93\u4E2D\u6253\u5F00",
    "toolbar.hideEmbedHeader": "\u9690\u85CF\u5D4C\u5165\u8868\u5934",
    "toolbar.showEmbedHeader": "\u663E\u793A\u5D4C\u5165\u8868\u5934",
    "toolbar.addDatabase": "\u65B0\u5EFA\u6570\u636E\u5E93",
    "toolbar.toggleDatabaseIcon": "\u542F\u7528/\u5173\u95ED\u6570\u636E\u5E93\u56FE\u6807",
    "toolbar.deleteDatabase": "\u5220\u9664\u6570\u636E\u5E93",
    "toolbar.renameDatabase": "\u91CD\u547D\u540D\u6570\u636E\u5E93",
    "toolbar.copyCurrentDatabase": "\u590D\u5236\u5F53\u524D\u6570\u636E\u5E93",
    "toolbar.copyCurrentView": "\u590D\u5236\u5F53\u524D\u89C6\u56FE",
    "toolbar.copyViewCode": "\u590D\u5236\u8BE5\u89C6\u56FE\u4EE3\u7801",
    "toolbar.changeViewType": "\u66F4\u6539\u89C6\u56FE\u7C7B\u578B",
    "toolbar.changeLayout": "\u66F4\u6539\u5E03\u5C40",
    "toolbar.moveViewFirst": "\u79FB\u5230\u6700\u524D",
    "toolbar.moveViewLast": "\u79FB\u5230\u6700\u540E",
    "toolbar.openDatabaseFile": "\u6253\u5F00\u5BF9\u5E94\u6570\u636E\u5E93\u6587\u4EF6",
    "toolbar.exportCsvMarkdownZip": "\u5BFC\u51FA CSV + Markdown ZIP",
    "toolbar.moreViews": "\u66F4\u591A\u89C6\u56FE",
    "toolbar.addView": "\u6DFB\u52A0\u89C6\u56FE",
    "toolbar.rename": "\u91CD\u547D\u540D",
    "toolbar.deleteView": "\u5220\u9664\u89C6\u56FE",
    "toolbar.copyCsv": "\u590D\u5236\u4E3A CSV",
    "toolbar.copyMarkdown": "\u590D\u5236\u4E3A Markdown \u8868\u683C",
    "toolbar.openAsMarkdown": "\u4EE5 Markdown \u6253\u5F00",
    "command.openDashboard": "Note database: \u6253\u5F00\u9762\u677F",
    "command.createDatabaseFile": "Note database: \u4ECE\u914D\u7F6E\u578B\u6570\u636E\u5E93\u751F\u6210\u6570\u636E\u5E93\u6587\u4EF6",
    "command.convertBase": "Note database: \u5C06 .base \u6587\u4EF6\u8F6C\u6362\u4E3A\u6570\u636E\u5E93",
    "command.showDatabaseFiles": "Note database: \u67E5\u770B\u6570\u636E\u5E93\u6587\u4EF6",
    "command.importDatabaseFile": "Note database: \u5C06\u5F53\u524D\u6570\u636E\u5E93\u6587\u4EF6\u5BFC\u5165\u4E3A\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "command.importCsvMarkdown": "Note database: \u5BFC\u5165 CSV + Markdown \u6587\u4EF6",
    "command.exportCsvMarkdown": "Note database: \u5C06\u5F53\u524D\u6570\u636E\u5E93\u89C6\u56FE\u5BFC\u51FA\u4E3A CSV + Markdown ZIP",
    "command.undoDatabaseEdit": "Note database: \u64A4\u9500\u4E0A\u4E00\u6B21\u6570\u636E\u5E93\u7F16\u8F91",
    "selection.copyCells": "\u590D\u5236",
    "selection.copyTsv": "\u590D\u5236 TSV",
    "selection.copyMarkdown": "\u590D\u5236 Markdown",
    "selection.copyCsv": "\u590D\u5236 CSV",
    "selection.pasteCells": "\u7C98\u8D34",
    "selection.fillCells": "\u586B\u5145",
    "selection.fillValue": "\u586B\u5145\u503C",
    "selection.fillPlaceholder": "\u8F93\u5165\u586B\u5145\u503C",
    "selection.clearCells": "\u6E05\u7A7A",
    "selection.fillPrompt": "\u5C06\u9009\u4E2D\u5355\u5143\u683C\u586B\u5145\u4E3A\uFF1A",
    "bulkEdit.editField": "\u7F16\u8F91\u5B57\u6BB5",
    "bulkEdit.field": "\u5B57\u6BB5",
    "bulkEdit.searchField": "\u641C\u7D22\u5B57\u6BB5",
    "bulkEdit.checked": "\u5DF2\u52FE\u9009",
    "bulkEdit.unchecked": "\u672A\u52FE\u9009",
    "bulkEdit.leavesView": "{count} \u6761\u8BB0\u5F55\u5C06\u79BB\u5F00\u5F53\u524D\u89C6\u56FE",
    "bulkEdit.leavesDatabase": "{count} \u6761\u8BB0\u5F55\u5C06\u79BB\u5F00\u8BE5\u6570\u636E\u5E93",
    "bulkEdit.movesGroup": "{count} \u6761\u8BB0\u5F55\u5C06\u79FB\u52A8\u5230\u5176\u4ED6\u5206\u7EC4",
    "bulkEdit.missing": "{count} \u6761\u7F3A\u5931\u8BB0\u5F55\u5C06\u88AB\u8DF3\u8FC7",
    "bulkEdit.apply": "\u5E94\u7528",
    "bulkEdit.noEditableFields": "\u6CA1\u6709\u53EF\u7F16\u8F91\u5B57\u6BB5\u3002",
    "bulkEdit.noChanges": "\u6CA1\u6709\u9700\u8981\u4FEE\u6539\u7684\u8BB0\u5F55\u3002",
    "bulkEdit.allMissing": "\u6240\u9009\u8BB0\u5F55\u5747\u5DF2\u7F3A\u5931\u3002",
    "bulkEdit.confirmTitle": "\u786E\u8BA4\u6279\u91CF\u7F16\u8F91",
    "bulkEdit.confirmChanged": "\u5C06\u4FEE\u6539 {count} \u6761\u8BB0\u5F55",
    "bulkEdit.completed": "\u5DF2\u66F4\u65B0 {count} \u6761\u8BB0\u5F55\u3002",
    "bulkEdit.completedSkipped": "\u5DF2\u66F4\u65B0 {count} \u6761\u8BB0\u5F55\uFF0C\u8DF3\u8FC7 {skipped} \u6761\u7F3A\u5931\u8BB0\u5F55\u3002",
    "bulkEdit.previewChanged": "\u786E\u8BA4\u671F\u95F4\u8BB0\u5F55\u53D1\u751F\u4E86\u53D8\u5316\uFF0C\u8BF7\u67E5\u770B\u6700\u65B0\u9884\u89C8\u540E\u91CD\u65B0\u5E94\u7528\u3002",
    "undo.bulkEdit": "\u6279\u91CF\u7F16\u8F91\u8BB0\u5F55",
    "undo.fillCells": "\u586B\u5145\u5355\u5143\u683C",
    "undo.pasteCells": "\u7C98\u8D34\u5355\u5143\u683C",
    "undo.moveCells": "\u79FB\u52A8\u5355\u5143\u683C",
    "undo.clearCells": "\u6E05\u7A7A\u5355\u5143\u683C",
    "undo.editCell": "\u7F16\u8F91\u5355\u5143\u683C",
    "undo.renameFile": "\u91CD\u547D\u540D\u6587\u4EF6",
    "undo.viewConfig": "\u89C6\u56FE\u914D\u7F6E",
    "undo.filterConfig": "\u7B5B\u9009\u6761\u4EF6",
    "undo.sortConfig": "\u6392\u5E8F\u89C4\u5219",
    "undo.groupConfig": "\u5206\u7EC4\u8BBE\u7F6E",
    "undo.summaryConfig": "\u6C47\u603B\u8BBE\u7F6E",
    "undo.hideColumnsConfig": "\u5217\u663E\u793A\u8BBE\u7F6E",
    "undo.columnWidthConfig": "\u5217\u5BBD",
    "undo.columnOrderConfig": "\u5217\u987A\u5E8F",
    "undo.columnRenameConfig": "\u5217\u91CD\u547D\u540D",
    "undo.columnTypeConfig": "\u5217\u7C7B\u578B",
    "undo.columnWrapConfig": "\u5217\u6362\u884C",
    "undo.insertColumnConfig": "\u63D2\u5165\u5217",
    "undo.addColumnConfig": "\u6DFB\u52A0\u5217",
    "undo.duplicateColumnConfig": "\u590D\u5236\u5217",
    "undo.deleteColumnConfig": "\u5220\u9664\u5217",
    "undo.fieldOptionsConfig": "\u5B57\u6BB5\u9009\u9879",
    "undo.formulaConfig": "\u516C\u5F0F\u7F16\u8F91",
    "undo.viewTypeConfig": "\u89C6\u56FE\u7C7B\u578B",
    "undo.chartConfig": "\u56FE\u8868\u8BBE\u7F6E",
    "undo.chartTypeConfig": "\u56FE\u8868\u7C7B\u578B",
    "undo.chartGroupConfig": "\u56FE\u8868\u5206\u7EC4",
    "undo.chartMeasureConfig": "\u56FE\u8868\u6570\u503C\u8BBE\u7F6E",
    "undo.chartStyleConfig": "\u56FE\u8868\u6837\u5F0F",
    "undo.chartReferenceLinesConfig": "\u56FE\u8868\u53C2\u8003\u7EBF",
    "undo.chartVisibleGroupsConfig": "\u56FE\u8868\u53EF\u89C1\u5206\u7EC4",
    "undo.chartDrilldownFilterConfig": "\u56FE\u8868\u4E0B\u94BB\u7B5B\u9009",
    "undo.chartDateBucketConfig": "\u56FE\u8868\u65E5\u671F\u5206\u6876",
    "undo.chartNumberBucketConfig": "\u56FE\u8868\u6570\u503C\u5206\u6876",
    "undo.chartNumberBucketSizeConfig": "\u56FE\u8868\u5206\u6876\u5927\u5C0F",
    "undo.chartSubgroupConfig": "\u56FE\u8868\u5B50\u5206\u7EC4",
    "undo.chartSortConfig": "\u56FE\u8868\u6392\u5E8F",
    "undo.chartOmitZeroValuesConfig": "\u9690\u85CF 0 \u503C",
    "undo.chartCumulativeConfig": "\u56FE\u8868\u7D2F\u8BA1\u503C",
    "undo.chartValueFieldConfig": "\u56FE\u8868\u6570\u503C\u5B57\u6BB5",
    "undo.chartAggregationConfig": "\u56FE\u8868\u805A\u5408\u65B9\u5F0F",
    "undo.chartColorPaletteConfig": "\u56FE\u8868\u8272\u677F",
    "undo.chartColorByValueConfig": "\u56FE\u8868\u6309\u6570\u503C\u7740\u8272",
    "undo.chartTitleConfig": "\u56FE\u8868\u6807\u9898",
    "undo.chartHeightConfig": "\u56FE\u8868\u9AD8\u5EA6",
    "undo.chartGridLinesConfig": "\u56FE\u8868\u7F51\u683C\u7EBF",
    "undo.chartAxisNamesConfig": "\u56FE\u8868\u5750\u6807\u8F74\u540D\u79F0",
    "undo.chartAxisRangeConfig": "\u56FE\u8868\u5750\u6807\u8F74\u8303\u56F4",
    "undo.chartAxisMinConfig": "\u56FE\u8868\u5750\u6807\u8F74\u6700\u5C0F\u503C",
    "undo.chartAxisMaxConfig": "\u56FE\u8868\u5750\u6807\u8F74\u6700\u5927\u503C",
    "undo.chartShowTitleConfig": "\u56FE\u8868\u6807\u9898\u663E\u793A",
    "undo.chartDataLabelsConfig": "\u56FE\u8868\u6570\u636E\u6807\u7B7E",
    "undo.chartDataLabelModeConfig": "\u56FE\u8868\u6570\u636E\u6807\u7B7E\u6A21\u5F0F",
    "undo.chartDataLabelColorConfig": "\u56FE\u8868\u6570\u636E\u6807\u7B7E\u989C\u8272",
    "undo.chartLegendConfig": "\u56FE\u8868\u56FE\u4F8B",
    "undo.chartSmoothLineConfig": "\u56FE\u8868\u5E73\u6ED1\u7EBF",
    "undo.chartGradientAreaConfig": "\u56FE\u8868\u9762\u79EF\u6E10\u53D8",
    "undo.chartDonutCenterConfig": "\u73AF\u5F62\u56FE\u4E2D\u5FC3\u6570\u503C",
    "undo.chartReferenceLineAddConfig": "\u65B0\u589E\u56FE\u8868\u53C2\u8003\u7EBF",
    "undo.chartReferenceLineTypeConfig": "\u56FE\u8868\u53C2\u8003\u7EBF\u7C7B\u578B",
    "undo.chartReferenceLineTitleConfig": "\u56FE\u8868\u53C2\u8003\u7EBF\u6807\u7B7E",
    "undo.chartReferenceLineValueConfig": "\u56FE\u8868\u53C2\u8003\u7EBF\u6570\u503C",
    "undo.chartReferenceLineStyleConfig": "\u56FE\u8868\u53C2\u8003\u7EBF\u6837\u5F0F",
    "undo.chartReferenceLineColorConfig": "\u56FE\u8868\u53C2\u8003\u7EBF\u989C\u8272",
    "undo.chartReferenceLineRemoveConfig": "\u5220\u9664\u56FE\u8868\u53C2\u8003\u7EBF",
    "undo.calendarStartFieldConfig": "\u65E5\u5386\u5F00\u59CB\u65E5\u671F\u5B57\u6BB5",
    "undo.calendarEndFieldConfig": "\u65E5\u5386\u7ED3\u675F\u65E5\u671F\u5B57\u6BB5",
    "undo.calendarTitleFieldConfig": "\u65E5\u5386\u6807\u9898\u5B57\u6BB5",
    "undo.calendarColorFieldConfig": "\u65E5\u5386\u989C\u8272\u5B57\u6BB5",
    "undo.calendarMonthConfig": "\u65E5\u5386\u6708\u4EFD",
    "undo.calendarCellSizeConfig": "\u65E5\u5386\u5355\u5143\u683C\u5C3A\u5BF8",
    "undo.calendarScaleConfig": "\u65E5\u5386\u5C3A\u5EA6",
    "undo.calendarColumnSizeConfig": "\u65E5\u5386\u5217\u5BBD",
    "undo.calendarRowSizeConfig": "\u65E5\u5386\u884C\u9AD8",
    "undo.calendarFirstDayOfWeekConfig": "\u65E5\u5386\u6BCF\u5468\u8D77\u59CB\u65E5",
    "undo.calendarMonthLanesConfig": "\u65E5\u5386\u6BCF\u5929\u4E8B\u4EF6\u6570",
    "undo.calendarAllDayLanesConfig": "\u65E5\u5386\u5168\u5929\u680F\u884C\u6570",
    "undo.calendarSlotDurationConfig": "\u65E5\u5386\u65F6\u95F4\u7C92\u5EA6",
    "undo.calendarTimeWindowConfig": "\u65E5\u5386\u53EF\u89C1\u65F6\u6BB5",
    "undo.calendarHourHeightConfig": "\u65E5\u5386\u5C0F\u65F6\u9AD8\u5EA6",
    "undo.timelineStartFieldConfig": "\u65F6\u95F4\u7EBF\u5F00\u59CB\u65E5\u671F\u5B57\u6BB5",
    "undo.timelineEndFieldConfig": "\u65F6\u95F4\u7EBF\u7ED3\u675F\u65E5\u671F\u5B57\u6BB5",
    "undo.timelineTitleFieldConfig": "\u65F6\u95F4\u7EBF\u6807\u9898\u5B57\u6BB5",
    "undo.timelineColorFieldConfig": "\u65F6\u95F4\u7EBF\u989C\u8272\u5B57\u6BB5",
    "undo.timelineScaleConfig": "\u65F6\u95F4\u7EBF\u523B\u5EA6",
    "undo.timelineAnchorConfig": "\u65F6\u95F4\u7EBF\u7A97\u53E3",
    "undo.timelineColumnWidthConfig": "\u65F6\u95F4\u7EBF\u5217\u5BBD",
    "undo.showEmptyFieldsConfig": "\u7A7A\u5B57\u6BB5\u663E\u793A",
    "undo.listCompactFieldsConfig": "\u5217\u8868\u7D27\u51D1\u5B57\u6BB5\u5E03\u5C40",
    "undo.databaseNameConfig": "\u6570\u636E\u5E93\u540D\u79F0",
    "undo.databaseDescriptionConfig": "\u6570\u636E\u5E93\u63CF\u8FF0",
    "undo.databaseCoverConfig": "\u6570\u636E\u5E93\u5C01\u9762",
    "undo.conditionalFormatConfig": "\u6761\u4EF6\u683C\u5F0F",
    "undo.newRecordTemplateConfig": "\u65B0\u8BB0\u5F55\u6A21\u677F",
    "undo.sourceFolderConfig": "\u6765\u6E90\u6587\u4EF6\u5939",
    "undo.sourceRulesConfig": "\u6765\u6E90\u89C4\u5219",
    "undo.newRecordFolderConfig": "\u65B0\u8BB0\u5F55\u6587\u4EF6\u5939",
    "undo.computedSyncModeConfig": "\u8BA1\u7B97\u7ED3\u679C\u4FDD\u5B58\u65B9\u5F0F",
    "undo.galleryCoverFieldConfig": "\u753B\u5ECA\u5C01\u9762\u5B57\u6BB5",
    "undo.galleryImageFitConfig": "\u753B\u5ECA\u56FE\u7247\u9002\u5E94\u65B9\u5F0F",
    "undo.galleryCoverRatioConfig": "\u753B\u5ECA\u5C01\u9762\u6BD4\u4F8B",
    "undo.boardCoverFieldConfig": "\u770B\u677F\u5C01\u9762\u5B57\u6BB5",
    "undo.boardImageFitConfig": "\u770B\u677F\u56FE\u7247\u9002\u5E94\u65B9\u5F0F",
    "undo.boardCoverRatioConfig": "\u770B\u677F\u5C01\u9762\u6BD4\u4F8B",
    "undo.titleFieldConfig": "\u6807\u9898\u5B57\u6BB5",
    "undo.boardSubgroupConfig": "\u770B\u677F\u5B50\u5206\u7EC4",
    "undo.boardColumnWidthConfig": "\u770B\u677F\u5217\u5BBD",
    "undo.displayWidthConfig": "\u663E\u793A\u5BBD\u5EA6",
    "undo.cardOrderConfig": "\u5361\u7247\u987A\u5E8F",
    "undo.timelineDates": "\u65F6\u95F4\u7EBF\u65E5\u671F",
    "undo.timelineInvalidEvents": "\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6\u4FEE\u590D",
    "undo.createRow": "\u65B0\u5EFA\u6761\u76EE",
    "undo.cardSizeConfig": "\u5361\u7247\u5C3A\u5BF8",
    "undo.groupCollapseConfig": "\u5206\u7EC4\u6298\u53E0",
    "undo.statusPresetConfig": "\u72B6\u6001\u9884\u8BBE",
    "undo.defaultColumnWidthConfig": "\u9ED8\u8BA4\u5217\u5BBD",
    "undo.rowDensityConfig": "\u884C\u5BC6\u5EA6",
    "confirm.clearCells": "\u6E05\u7A7A\u9009\u4E2D\u7684 {count} \u4E2A\u5355\u5143\u683C\uFF1F",
    "groupOrder.textAsc": "A \u2192 Z",
    "groupOrder.textDesc": "Z \u2192 A",
    "groupOrder.numberAsc": "\u5C0F \u2192 \u5927",
    "groupOrder.numberDesc": "\u5927 \u2192 \u5C0F",
    "groupOrder.currencyAsc": "\u4F4E \u2192 \u9AD8",
    "groupOrder.currencyDesc": "\u9AD8 \u2192 \u4F4E",
    "groupOrder.dateAsc": "\u65E9 \u2192 \u665A",
    "groupOrder.dateDesc": "\u665A \u2192 \u65E9",
    "groupOrder.checkboxFalseFirst": "\u672A\u52FE\u9009\u4F18\u5148",
    "groupOrder.checkboxTrueFirst": "\u5DF2\u52FE\u9009\u4F18\u5148",
    "groupOrder.optionAsc": "\u6309\u9009\u9879\u987A\u5E8F",
    "groupOrder.optionDesc": "\u53CD\u5411\u9009\u9879\u987A\u5E8F",
    "groupOrder.multiSelectPriority": "\u6309\u6700\u9AD8\u4F18\u5148\u7EA7\u9009\u9879\u6392\u5E8F",
    "groupOrder.custom": "\u81EA\u5B9A\u4E49\u5206\u7EC4\u65F6\u9009\u9879\u987A\u5E8F...",
    "group.expand": "\u5C55\u5F00\u5206\u7EC4",
    "group.collapse": "\u6298\u53E0\u5206\u7EC4",
    "group.expandMore": "\u5C55\u5F00 +{count}",
    "group.expandAll": "\u5B8C\u5168\u5C55\u5F00",
    "group.collapseToLimit": "\u6536\u8D77",
    "group.selectRows": "\u9009\u62E9\u5206\u7EC4\u4E2D\u7684\u884C",
    "panel.addCondition": "\u6DFB\u52A0\u6761\u4EF6",
    "panel.addSort": "\u6DFB\u52A0\u6392\u5E8F",
    "panel.emptyFilters": "\u70B9\u51FB\u4E0B\u65B9\u300C\u6DFB\u52A0\u6761\u4EF6\u300D\u5F00\u59CB\u7B5B\u9009\u3002",
    "panel.emptySorts": "\u70B9\u51FB\u4E0B\u65B9\u300C\u6DFB\u52A0\u6392\u5E8F\u300D\u5F00\u59CB\u591A\u6761\u4EF6\u6392\u5E8F\u3002",
    "sortPanel.calendarHint": "\u65E5\u5386\u89C6\u56FE\u4F1A\u5148\u6309\u4E8B\u4EF6\u8DE8\u5EA6\u3001\u5168\u5929\u4E8B\u4EF6\u548C\u91CD\u53E0\u65F6\u6BB5\u6392\u5E03\uFF0C\u6392\u5E8F\u89C4\u5219\u5728\u53EF\u6392\u5E8F\u7684\u4E8B\u4EF6\u987A\u5E8F\u4E2D\u751F\u6548\u3002",
    "panel.and": "AND\uFF08\u5168\u90E8\u6EE1\u8DB3\uFF09",
    "panel.or": "OR\uFF08\u4EFB\u4E00\u6EE1\u8DB3\uFF09",
    "panel.field": "\u5B57\u6BB5",
    "panel.operator": "\u6761\u4EF6",
    "panel.sortDirection": "\u65B9\u5411",
    "panel.value": "\u503C",
    "panel.all": "\u5168\u90E8",
    "panel.addColumn": "\u6DFB\u52A0\u5C5E\u6027",
    "panel.createProperty": "\u65B0\u5EFA\u5C5E\u6027\u2026",
    "panel.dragToSort": "\u62D6\u62FD\u6392\u5E8F",
    "panel.doubleClickEdit": "\u53CC\u51FB\u7F16\u8F91\u5C5E\u6027",
    "panel.wrap": "\u6362\u884C\u663E\u793A\u5B8C\u6574\u5185\u5BB9",
    "panel.groupedPropertyHidden": "\u6B64\u5C5E\u6027\u5DF2\u7528\u4E8E\u5206\u7EC4\u6545\u4E0D\u4F1A\u51FA\u73B0\u5728\u6761\u76EE\u5185\u5BB9\u4E2D",
    "panel.titleFieldHint": "\u8BE5\u5C5E\u6027\u5DF2\u88AB\u7528\u4F5C\u6807\u9898\u3002",
    "panel.groupFieldHint": "\u8BE5\u5C5E\u6027\u5DF2\u7528\u4E8E\u5206\u7EC4\u6545\u4E0D\u4F1A\u51FA\u73B0\u5728\u6761\u76EE\u5185\u5BB9\u4E2D\u3002",
    "panel.subgroupFieldHint": "\u8BE5\u5C5E\u6027\u5DF2\u7528\u4E8E\u5B50\u5206\u7EC4\u6545\u4E0D\u4F1A\u51FA\u73B0\u5728\u6761\u76EE\u5185\u5BB9\u4E2D\u3002",
    "panel.open": "\u6253\u5F00",
    "panel.noProperties": "\u6682\u65E0\u5C5E\u6027",
    "panel.hiddenProperties": "\u9690\u85CF\u5C5E\u6027",
    "viewConfig.title": "\u89C6\u56FE\u8BBE\u7F6E",
    "viewConfig.databaseSection": "\u5F53\u524D\u6570\u636E\u5E93",
    "viewConfig.viewSection": "\u5F53\u524D\u89C6\u56FE",
    "viewConfig.viewSourceRules": "\u542F\u7528\u672C\u89C6\u56FE\u6765\u6E90\u89C4\u5219",
    "viewConfig.viewSourceRulesHint": "\u542F\u7528\u540E\uFF0C\u8FD9\u4E9B\u89C4\u5219\uFF08\u6765\u81EA\u5D4C\u5165\u6216 .base \u8F6C\u6362\uFF09\u4E0E\u6570\u636E\u5E93\u6765\u6E90\u89C4\u5219\u53E0\u52A0\u751F\u6548\uFF1B\u5173\u95ED\u5219\u4E0D\u751F\u6548\u3002",
    "undo.viewSourceRulesConfig": "\u89C6\u56FE\u6765\u6E90\u89C4\u5219",
    "viewConfig.viewType": "\u89C6\u56FE\u7C7B\u578B",
    "viewConfig.rowDensity": "\u884C\u5BC6\u5EA6",
    "viewConfig.rowDensity.compact": "\u7D27\u51D1",
    "viewConfig.rowDensity.default": "\u9ED8\u8BA4",
    "viewConfig.rowDensity.comfortable": "\u8212\u9002",
    "viewConfig.summarySumField": "SUM \u5B57\u6BB5",
    "viewConfig.summarySumFieldNone": "\u4E0D\u663E\u793A",
    "viewConfig.summaryField": "\u6C47\u603B",
    "viewConfig.summaryFieldNone": "\u79FB\u9664\u6C47\u603B",
    "viewConfig.summaryAdd": "+ \u6C47\u603B",
    "viewConfig.summaryCount": "\u8BA1\u6570",
    "viewConfig.summaryUnique": "\u552F\u4E00\u503C",
    "viewConfig.summaryEmpty": "\u7A7A\u503C",
    "viewConfig.summaryFilled": "\u975E\u7A7A",
    "viewConfig.summaryChecked": "\u5DF2\u52FE\u9009",
    "viewConfig.summaryUnchecked": "\u672A\u52FE\u9009",
    "viewConfig.summaryEarliest": "\u6700\u65E9",
    "viewConfig.summaryLatest": "\u6700\u665A",
    "viewConfig.summaryStddev": "\u6807\u51C6\u5DEE",
    "viewConfig.databaseReadonly": "\u8FD9\u91CC\u4EC5\u663E\u793A\u6570\u636E\u5E93\u8BBE\u7F6E\uFF1B\u5982\u9700\u4FEE\u6539\uFF0C\u8BF7\u79FB\u52A8\u5230\u5B8C\u6574\u6570\u636E\u5E93\u754C\u9762\u4E2D\u3002",
    "viewConfig.noTableSettings": "\u8868\u683C\u89C6\u56FE\u6682\u65E0\u989D\u5916\u5E03\u5C40\u8BBE\u7F6E\u3002",
    "viewConfig.noExtraSettings": "\u6B64\u89C6\u56FE\u6682\u65E0\u989D\u5916\u5E03\u5C40\u8BBE\u7F6E\u3002",
    "chart.other": "\u5176\u4ED6",
    "chart.countLabel": "\u8BA1\u6570",
    "chart.noFields": "\u6CA1\u6709\u53EF\u5206\u7C7B\u7684\u5B57\u6BB5\u3002\u8BF7\u5148\u521B\u5EFA select\u3001status\u3001multi-select \u6216 checkbox \u5C5E\u6027\u3002",
    "chart.noFieldSelected": "\u8BF7\u5728\u89C6\u56FE\u8BBE\u7F6E\u4E2D\u9009\u62E9\u7EDF\u8BA1\u5B57\u6BB5\u3002",
    "chart.noValueFieldSelected": "\u8BF7\u5728\u89C6\u56FE\u8BBE\u7F6E\u4E2D\u9009\u62E9\u6570\u503C\u5B57\u6BB5\u3002",
    "chart.noRecords": "\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u4E0B\u6CA1\u6709\u53EF\u7EDF\u8BA1\u7684\u7B14\u8BB0\u3002",
    "chart.allGroupsHidden": "\u6240\u6709\u56FE\u8868\u5206\u7EC4\u90FD\u5DF2\u9690\u85CF\u3002\u8BF7\u5728\u56FE\u8868\u9009\u9879\u4E2D\u81F3\u5C11\u663E\u793A\u4E00\u4E2A\u5206\u7EC4\u3002",
    "chart.showAllGroups": "\u663E\u793A\u6240\u6709\u5206\u7EC4",
    "chart.invalidAxisRange": "\u8BF7\u8F93\u5165\u5927\u4E8E\u6700\u5C0F\u503C\u7684\u6570\u503C\u8F74\u6700\u5927\u503C\u3002",
    "chart.resetAxisRange": "\u91CD\u7F6E\u6570\u503C\u8F74\u8303\u56F4",
    "chart.chooseDefaultGroup": "\u9009\u62E9\u9ED8\u8BA4\u5206\u7EC4",
    "chart.chooseDefaultValue": "\u9009\u62E9\u9ED8\u8BA4\u6570\u503C\u5B57\u6BB5",
    "chart.barChart": "\u67F1\u72B6\u56FE",
    "chart.stackedBarChart": "\u5806\u53E0\u67F1\u72B6\u56FE",
    "chart.groupedBarChart": "\u5206\u7EC4\u67F1\u72B6\u56FE",
    "chart.percentStackedBarChart": "\u767E\u5206\u6BD4\u5806\u53E0\u67F1\u72B6\u56FE",
    "chart.horizontalBarChart": "\u6C34\u5E73\u6761\u5F62\u56FE",
    "chart.lineChart": "\u6298\u7EBF\u56FE",
    "chart.areaChart": "\u9762\u79EF\u56FE",
    "chart.pieChart": "\u997C\u56FE",
    "chart.donutChart": "\u73AF\u5F62\u56FE",
    "chart.numberChart": "\u5355\u6570\u5B57",
    "chart.mixedChart": "\u6DF7\u5408\u56FE",
    "chart.total": "\u603B\u8BA1",
    "chart.countAggregation": "\u8BA1\u6570",
    "chart.sumAggregation": "\u6C42\u548C",
    "chart.avgAggregation": "\u5E73\u5747\u503C",
    "chart.medianAggregation": "\u4E2D\u4F4D\u6570",
    "chart.minAggregation": "\u6700\u5C0F\u503C",
    "chart.maxAggregation": "\u6700\u5927\u503C",
    "chart.rangeAggregation": "\u8303\u56F4",
    "chart.uniqueAggregation": "\u552F\u4E00\u503C",
    "chart.emptyAggregation": "\u7A7A\u503C",
    "chart.notEmptyAggregation": "\u975E\u7A7A\u503C",
    "chart.percentEmptyAggregation": "\u7A7A\u503C\u767E\u5206\u6BD4",
    "chart.percentNotEmptyAggregation": "\u975E\u7A7A\u767E\u5206\u6BD4",
    "chart.checkedAggregation": "\u5DF2\u52FE\u9009",
    "chart.uncheckedAggregation": "\u672A\u52FE\u9009",
    "chart.percentCheckedAggregation": "\u52FE\u9009\u767E\u5206\u6BD4",
    "chart.toolbarType": "\u7C7B\u578B",
    "chart.toolbarGroup": "\u5206\u7EC4",
    "chart.toolbarBucket": "\u7C92\u5EA6",
    "chart.toolbarStack": "\u5806\u53E0",
    "chart.toolbarSeries": "\u5B50\u5206\u7EC4",
    "chart.toolbarSubgroup": "\u5B50\u5206\u7EC4",
    "chart.toolbarAggregation": "\u805A\u5408",
    "chart.toolbarValue": "\u6570\u503C",
    "chart.toolbarLineAggregation": "\u7EBF\u805A\u5408",
    "chart.toolbarLineValue": "\u7EBF\u6570\u503C",
    "chart.recordsValue": "\u8BB0\u5F55",
    "chart.exportImage": "\u5BFC\u51FA PNG",
    "chart.copyPng": "\u590D\u5236 PNG",
    "chart.exportedImage": "\u5DF2\u5BFC\u51FA\u56FE\u8868\u56FE\u7247",
    "chart.copiedPng": "\u5DF2\u590D\u5236 PNG",
    "chart.exportUnavailable": "\u5F53\u524D\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u56FE\u8868\u56FE\u7247\u3002",
    "chart.dateBucketDay": "\u65E5",
    "chart.dateBucketWeek": "\u5468",
    "chart.dateBucketMonth": "\u6708",
    "chart.dateBucketQuarter": "\u5B63\u5EA6",
    "chart.dateBucketYear": "\u5E74",
    "chart.numberBucketAuto": "\u81EA\u52A8",
    "chart.numberBucketFixed": "\u56FA\u5B9A",
    "chart.numberBucketSize": "\u533A\u95F4\u5927\u5C0F",
    "chart.options": "\u56FE\u8868\u9009\u9879",
    "chart.optionsData": "\u6570\u636E",
    "chart.optionsStyle": "\u6837\u5F0F",
    "chart.optionsExport": "\u5BFC\u51FA",
    "chart.autoTitleCount": "\u8BA1\u6570",
    "chart.autoTitleValue": "{value} \u7684{aggregation}",
    "chart.autoTitleCountBy": "\u6309 {group} \u8BA1\u6570",
    "chart.autoTitleValueBy": "\u6309 {group} \u67E5\u770B {value} \u7684{aggregation}",
    "chart.autoTitleMixed": "\u6309 {group} \u67E5\u770B {primary} \u548C {secondary}",
    "chart.autoTitleDateGroup": "\u6309{bucket}\u7EDF\u8BA1 {field}",
    "chart.autoTitleNumberBucketGroup": "{field}\u533A\u95F4",
    "chart.sortBy": "\u6392\u5E8F",
    "chart.sortOptionOrder": "\u9009\u9879\u987A\u5E8F",
    "chart.sortValueDesc": "\u6570\u503C\u964D\u5E8F",
    "chart.sortValueAsc": "\u6570\u503C\u5347\u5E8F",
    "chart.sortLabelAsc": "\u6807\u7B7E A-Z",
    "chart.sortLabelDesc": "\u6807\u7B7E Z-A",
    "chart.visibleGroups": "\u53EF\u89C1\u5206\u7EC4",
    "chart.visibleGroupsEntry": "\u9009\u62E9\u5206\u7EC4",
    "chart.omitZeroValues": "\u9690\u85CF 0 \u503C",
    "chart.cumulative": "\u7D2F\u8BA1",
    "chart.title": "\u6807\u9898",
    "chart.titleHelp": "\u7559\u7A7A\u65F6\u4F7F\u7528\u81EA\u52A8\u751F\u6210\u7684\u56FE\u8868\u6807\u9898\u3002",
    "chart.height": "\u9AD8\u5EA6",
    "chart.heightSmall": "\u5C0F",
    "chart.heightMedium": "\u4E2D",
    "chart.heightLarge": "\u5927",
    "chart.heightXLarge": "\u8D85\u5927",
    "chart.gridLines": "\u7F51\u683C\u7EBF",
    "chart.gridNone": "\u65E0",
    "chart.gridValue": "\u6570\u503C\u8F74",
    "chart.gridBoth": "\u53CC\u8F74",
    "chart.axisNames": "\u8F74\u540D\u79F0",
    "chart.axisNone": "\u65E0",
    "chart.axisX": "X \u8F74",
    "chart.axisY": "Y \u8F74",
    "chart.axisBoth": "\u53CC\u8F74",
    "chart.valueAxisRange": "\u6570\u503C\u8F74",
    "chart.axisAuto": "\u81EA\u52A8",
    "chart.axisZeroBased": "\u4ECE 0 \u5F00\u59CB",
    "chart.axisCustom": "\u81EA\u5B9A\u4E49",
    "chart.axisMin": "\u6700\u5C0F\u503C",
    "chart.axisMax": "\u6700\u5927\u503C",
    "chart.referenceLines": "\u53C2\u8003\u7EBF",
    "chart.referenceLinesEntry": "\u53C2\u8003\u7EBF",
    "chart.referenceLineConstant": "\u56FA\u5B9A\u503C",
    "chart.referenceLineAverage": "\u5E73\u5747\u503C",
    "chart.referenceLineMedian": "\u4E2D\u4F4D\u6570",
    "chart.referenceLineMin": "\u6700\u5C0F\u503C",
    "chart.referenceLineMax": "\u6700\u5927\u503C",
    "chart.referenceLineStyle": "\u7EBF\u578B",
    "chart.referenceLineSolid": "\u5B9E\u7EBF",
    "chart.referenceLineDashed": "\u865A\u7EBF",
    "chart.referenceLineDotted": "\u70B9\u7EBF",
    "chart.referenceLineColor": "\u989C\u8272",
    "chart.addReferenceLine": "\u589E\u52A0\u53C2\u8003\u7EBF +",
    "chart.referenceLineColorDefault": "\u9ED8\u8BA4",
    "chart.referenceLineColorGray": "\u7070\u8272",
    "chart.referenceLineColorBlue": "\u84DD\u8272",
    "chart.referenceLineColorGreen": "\u7EFF\u8272",
    "chart.referenceLineColorAmber": "\u7425\u73C0",
    "chart.referenceLineColorRed": "\u7EA2\u8272",
    "chart.referenceLineColorPurple": "\u7D2B\u8272",
    "chart.referenceLineColorPink": "\u7C89\u8272",
    "chart.colorPalette": "\u989C\u8272",
    "chart.colorPaletteAuto": "\u81EA\u52A8",
    "chart.colorPaletteAccent": "\u5F3A\u8C03\u8272",
    "chart.colorPaletteColorful": "\u843D\u65E5",
    "chart.colorPalettePastel": "\u85B0\u8863\u8349",
    "chart.colorPaletteVivid": "\u8393\u679C",
    "chart.colorPaletteWarm": "\u816E\u7EA2",
    "chart.colorPaletteCool": "\u6D77\u6D0B",
    "chart.colorPaletteMono": "\u77F3\u58A8",
    "chart.colorPaletteOption": "\u9009\u9879\u989C\u8272",
    "chart.colorByValue": "\u6309\u6570\u503C\u7740\u8272",
    "chart.dataLabelMode": "\u6807\u7B7E\u6A21\u5F0F",
    "chart.dataLabelColor": "\u6807\u7B7E\u989C\u8272",
    "chart.dataLabelColorAuto": "\u81EA\u52A8\u5BF9\u6BD4",
    "chart.dataLabelColorDark": "\u6DF1\u8272",
    "chart.dataLabelColorLight": "\u6D45\u8272",
    "chart.dataLabelColorAccent": "\u5F3A\u8C03\u8272",
    "chart.dataLabelValue": "\u6570\u503C",
    "chart.dataLabelPercent": "\u767E\u5206\u6BD4",
    "chart.dataLabelLabelValue": "\u6807\u7B7E + \u6570\u503C",
    "chart.optionsStyleEntry": "\u8C03\u6574\u6837\u5F0F",
    "chart.showTitle": "\u663E\u793A\u6807\u9898",
    "chart.showDataLabels": "\u6570\u636E\u6807\u7B7E",
    "chart.showLegend": "\u56FE\u4F8B",
    "chart.smoothLine": "\u5E73\u6ED1\u7EBF\u6761",
    "chart.gradientArea": "\u6E10\u53D8\u9762\u79EF",
    "chart.donutCenter": "\u4E2D\u5FC3\u6570\u503C",
    "chart.donutCenterHidden": "\u9690\u85CF",
    "chart.donutCenterTotal": "\u603B\u8BA1",
    "chart.donutCenterAggregation": "\u805A\u5408\u503C",
    "chart.applyFilter": "\u5E94\u7528\u4E3A\u7B5B\u9009",
    "chart.drilldownSummary": "{count} \u6761\u5339\u914D\u8BB0\u5F55",
    "chart.drilldownFile": "\u6587\u4EF6",
    "chart.drilldownPath": "\u8DEF\u5F84",
    "chart.drilldownOpenAll": "\u5168\u90E8\u6253\u5F00",
    "chart.drilldownCopyLinks": "\u590D\u5236\u94FE\u63A5",
    "chart.drilldownCopiedLinks": "\u5DF2\u590D\u5236 {count} \u4E2A\u94FE\u63A5",
    "chart.drilldownMore": "\u8FD8\u6709 {count} \u6761",
    "chart.fieldGroup.properties": "\u5C5E\u6027",
    "chart.fieldGroup.formulas": "\u8BA1\u7B97\u5B57\u6BB5",
    "chart.fieldGroup.fileMetadata": "\u6587\u4EF6\u5143\u6570\u636E",
    "chart.disabledBarOnly": "\u4EC5\u5728\u67F1\u72B6\u56FE\u53EF\u7528\u3002",
    "chart.disabledLineAreaMixed": "\u4EC5\u5728\u6298\u7EBF\u56FE\u3001\u9762\u79EF\u56FE\u6216\u6DF7\u5408\u56FE\u53EF\u7528\u3002",
    "chart.disabledDonutOnly": "\u4EC5\u5728\u73AF\u5F62\u56FE\u53EF\u7528\u3002",
    "chart.disabledNeedsGroups": "\u9009\u62E9\u6709\u53EF\u7528\u5206\u7EC4\u7684\u5B57\u6BB5\u540E\u53EF\u7528\u3002",
    "chart.disabledCumulative": "\u4EC5\u5728\u67F1\u72B6\u56FE\u3001\u6298\u7EBF\u56FE\u6216\u9762\u79EF\u56FE\u7684 Count / Sum \u53EF\u7528\u3002",
    "chart.disabledAggregationForValue": "\u4EC5\u5728\u652F\u6301\u6B64\u805A\u5408\u7684\u5B57\u6BB5\u53EF\u7528\u3002",
    "chart.disabledAggregationNeedsValue": "\u9009\u62E9\u6570\u503C\u5B57\u6BB5\u540E\u53EF\u7528\u3002",
    "chart.disabledAggregationNumericOnly": "\u4EC5\u652F\u6301\u6570\u503C\u6216\u8D27\u5E01\u5B57\u6BB5\u3002",
    "chart.disabledAggregationCheckboxOnly": "\u4EC5\u652F\u6301\u590D\u9009\u6846\u5B57\u6BB5\u3002",
    "calendar.noDateField": "\u8BF7\u4E3A\u65E5\u5386\u89C6\u56FE\u9009\u62E9\u4E00\u4E2A\u65E5\u671F\u5C5E\u6027\u3002",
    "calendar.noWritableDateField": "\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A\u53EF\u5199\u7684\u65E5\u671F\u5C5E\u6027\uFF0C\u518D\u7F16\u8F91\u65E5\u5386\u6216\u65F6\u95F4\u7EBF\u65E5\u671F\u3002",
    "calendar.noDateChange": "\u65E5\u671F\u672A\u53D8\u66F4",
    "calendar.sameDateFieldWarning": "\u5F00\u59CB\u548C\u7ED3\u675F\u4F7F\u7528\u4E86\u540C\u4E00\u4E2A\u5C5E\u6027\u3002\u82E5\u8981\u7A33\u5B9A\u4FDD\u5B58\u65F6\u95F4\u6BB5\u5E76\u62D6\u62FD\u8C03\u6574\u4E24\u7AEF\uFF0C\u8BF7\u4F7F\u7528\u4E24\u4E2A\u4E0D\u540C\u7684\u65E5\u671F\u5C5E\u6027\u3002",
    "calendar.sameDateFieldNotice": "\u5F00\u59CB\u548C\u7ED3\u675F\u90FD\u4F7F\u7528\u4E86\u300C{field}\u300D\u3002\u5355\u4E2A\u5C5E\u6027\u53EA\u80FD\u4FDD\u5B58\u5176\u4E2D\u4E00\u7AEF\uFF1B\u82E5\u8981\u7A33\u5B9A\u62D6\u62FD\u8C03\u6574\uFF0C\u8BF7\u4F7F\u7528\u4E0D\u540C\u7684\u5F00\u59CB/\u7ED3\u675F\u5C5E\u6027\u3002",
    "calendar.convertDateTimeTitle": "\u8F6C\u6362\u4E3A\u65E5\u671F\u548C\u65F6\u95F4\uFF1F",
    "calendar.convertDateTimeMessage": "\u8FD9\u6B21\u7F16\u8F91\u4F1A\u5199\u5165\u5177\u4F53\u65F6\u95F4\u3002\u662F\u5426\u5C06 {fields} \u8F6C\u6362\u4E3A\u65E5\u671F\u548C\u65F6\u95F4\u5C5E\u6027\uFF0C\u4EE5\u4FBF Obsidian \u4FDD\u7559\u65F6\u95F4\u90E8\u5206\uFF1F",
    "calendar.convertDateTimeConfirm": "\u8F6C\u6362",
    "calendar.noEvents": "\u6CA1\u6709\u53EF\u5728\u65E5\u5386\u4E2D\u663E\u793A\u7684\u65E5\u671F\u8BB0\u5F55\u3002",
    "calendar.moreEvents": "\u8FD8\u6709 {count} \u6761",
    "calendar.moreEventsTitle": "{date} \u8FD8\u6709 {count} \u6761\u4E8B\u4EF6",
    "calendar.resizeStart": "\u8C03\u6574\u5F00\u59CB\u65E5\u671F",
    "calendar.resizeEnd": "\u8C03\u6574\u7ED3\u675F\u65E5\u671F",
    "calendar.moveToday": "\u79FB\u5230\u4ECA\u5929",
    "calendar.movePrevDay": "\u63D0\u524D\u4E00\u5929",
    "calendar.moveNextDay": "\u63A8\u540E\u4E00\u5929",
    "calendar.moveToDate": "\u79FB\u52A8\u5230\u65E5\u671F",
    "calendar.moveToDatePrompt": "\u8BF7\u8F93\u5165\u65E5\u671F\uFF0C\u683C\u5F0F\u4E3A YYYY-MM-DD",
    "calendar.extendOneDay": "\u5EF6\u957F\u4E00\u5929",
    "calendar.shortenOneDay": "\u7F29\u77ED\u4E00\u5929",
    "calendar.noAllDayEvents": "\u65E0\u5168\u5929 / \u8DE8\u5929\u4E8B\u4EF6",
    "timeline.noDateField": "\u8BF7\u4E3A\u65F6\u95F4\u7EBF\u89C6\u56FE\u9009\u62E9\u4E00\u4E2A\u65E5\u671F\u5C5E\u6027\u3002",
    "timeline.dayRequiresDateTime": "\u65F6\u95F4\u7EBF\u65E5\u89C6\u56FE\u9700\u8981\u5F00\u59CB/\u7ED3\u675F\u5C5E\u6027\u90FD\u662F\u65E5\u671F\u548C\u65F6\u95F4\u3002\u8BF7\u6253\u5F00\u5B8C\u6574\u6570\u636E\u5E93\u89C6\u56FE\u5E76\u5148\u8F6C\u6362\u65E5\u671F\u5C5E\u6027\u3002",
    "timeline.invalidEventsNotice": "\u53D1\u73B0 {count} \u4E2A\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6\uFF08\u7ED3\u675F\u65F6\u95F4\u4E0D\u665A\u4E8E\u5F00\u59CB\u65F6\u95F4\uFF09\uFF0C\u5DF2\u9690\u85CF\u3002",
    "timeline.invalidEventsCalculating": "\u6B63\u5728\u68C0\u67E5\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6...",
    "timeline.viewInvalidEvents": "\u67E5\u770B\u5E76\u4FEE\u590D",
    "timeline.invalidEventsConflictNotice": "{count} \u4E2A\u4E8B\u4EF6\u65F6\u95F4\u51B2\u7A81\uFF08\u7ED3\u675F\u2264\u5F00\u59CB\uFF09",
    "timeline.fixInvalidEvents": "\u4FEE\u590D",
    "timeline.invalidEventsNone": "\u672A\u53D1\u73B0\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6\u3002",
    "timeline.invalidEventsTitle": "\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6",
    "timeline.invalidEventsTitleWithCount": "\u65E0\u6548\u65F6\u95F4\u4E8B\u4EF6\uFF08{count}\uFF09",
    "timeline.invalidEventsDesc": "\u8FD9\u4E9B\u4E8B\u4EF6\u7684\u7ED3\u675F\u65F6\u95F4\u65E9\u4E8E\u6216\u7B49\u4E8E\u5F00\u59CB\u65F6\u95F4\uFF0C\u5DF2\u5728\u65F6\u95F4\u7EBF\u9690\u85CF\u3002\u8BF7\u8C03\u6574\u5F00\u59CB/\u7ED3\u675F\u65F6\u95F4\uFF0C\u4F7F\u7ED3\u675F\u665A\u4E8E\u5F00\u59CB\u3002",
    "timeline.invalidEventsNote": "\u7B14\u8BB0",
    "timeline.invalidEventsStart": "\u5F00\u59CB",
    "timeline.invalidEventsEnd": "\u7ED3\u675F",
    "timeline.invalidEventsSpan": "\u65F6\u957F",
    "timeline.invalidEventsSelectAll": "\u9009\u62E9\u6240\u6709\u65E0\u6548\u4E8B\u4EF6",
    "timeline.invalidEventsSelectRow": "\u9009\u62E9 {name}",
    "timeline.invalidEventsSelected": "\u5DF2\u9009\u62E9 {count} \u4E2A",
    "timeline.invalidEventsQuickFix": "\u4E00\u952E\u4FEE\u590D\u6240\u9009",
    "timeline.invalidEventsQuickFixShort": "\u4FEE\u590D",
    "timeline.invalidEventsStillInvalid": "\u4ECD\u65E0\u6548",
    "timeline.invalidEventsSpanDays": "{count} \u5929",
    "timeline.invalidEventsSpanHours": "{count} \u5C0F\u65F6",
    "timeline.invalidEventsSpanHoursMinutes": "{hours} \u5C0F\u65F6 {minutes} \u5206\u949F",
    "timeline.invalidEventsSpanMinutes": "{count} \u5206\u949F",
    "timeline.invalidEventsConfirm": "\u4FDD\u5B58\u4FEE\u6539",
    "propertyConflict.title": "\u5C5E\u6027\u7C7B\u578B\u51B2\u7A81",
    "propertyConflict.desc": "\u53D1\u73B0 {count} \u4E2A\u5C5E\u6027\u51B2\u7A81\u3002\u8BF7\u5148\u7EDF\u4E00\u4E0B\u5217\u6570\u636E\u5E93\u5B9A\u4E49\uFF0C\u6216\u9009\u62E9\u4ECD\u7136\u66F4\u6539\u5E76\u4FDD\u7559\u51B2\u7A81\u3002",
    "propertyConflict.typeMismatch": "\u7C7B\u578B\u4E0D\u4E00\u81F4",
    "propertyConflict.datePrecision": "\u65E5\u671F\u7CBE\u5EA6",
    "propertyConflict.datePrecisionHint": "\u540C\u4E00\u4E2A\u5C5E\u6027 key \u540C\u65F6\u88AB\u5B9A\u4E49\u4E3A\u65E5\u671F\u548C\u65E5\u671F\u65F6\u95F4\u3002\u5982\u679C\u4EFB\u4E00\u6570\u636E\u5E93\u9700\u8981\u65F6\u95F4\u503C\uFF0C\u5EFA\u8BAE\u7EDF\u4E00\u4E3A\u65E5\u671F\u65F6\u95F4\uFF1B\u8F6C\u6210\u65E5\u671F\u53EF\u80FD\u4E22\u5931\u65F6\u95F4\u3002",
    "propertyConflict.computedHint": "\u4FDD\u5B58\u578B\u8BA1\u7B97\u5B57\u6BB5\u4F1A\u53C2\u4E0E\u68C0\u6D4B\uFF0C\u56E0\u4E3A\u8BE5\u6570\u636E\u5E93\u53EF\u80FD\u628A\u516C\u5F0F\u7ED3\u679C\u5199\u56DE frontmatter\u3002",
    "propertyConflict.ignore": "\u6682\u65F6\u5FFD\u7565",
    "propertyConflict.dismissSession": "\u672C\u4F1A\u8BDD\u4E0D\u518D\u63D0\u9192",
    "propertyConflict.openProperties": "\u6253\u5F00\u5C5E\u6027\u7BA1\u7406",
    "propertyConflict.ignoreAndApply": "\u4EC5\u7EE7\u7EED\u672C\u6B21\u66F4\u6539",
    "propertyConflict.applyResolvedTypes": "\u63D0\u4EA4\u5DF2\u89E3\u51B3\u7684\u7C7B\u578B",
    "propertyConflict.resolved": "\u6240\u6709\u51B2\u7A81\u90FD\u5DF2\u89E3\u51B3\uFF0C\u5C06\u63D0\u4EA4\u8FD9\u4E9B\u7C7B\u578B\u4FEE\u6539\u3002",
    "propertyConflict.unresolved": "\u8BF7\u5148\u81F3\u5C11\u89E3\u51B3\u4E00\u4E2A\u5C5E\u6027\u51B2\u7A81\uFF0C\u518D\u63D0\u4EA4\u4FEE\u6539\u3002",
    "propertyConflict.partialResolved": "\u5C06\u63D0\u4EA4 {resolved} \u4E2A\u5DF2\u89E3\u51B3\u51B2\u7A81\uFF1B{unresolved} \u4E2A\u672A\u89E3\u51B3\u51B2\u7A81\u4F1A\u4FDD\u6301\u4E0D\u53D8\u3002",
    "propertyConflict.statusResolved": "\u5DF2\u89E3\u51B3",
    "propertyConflict.statusUnresolved": "\u672A\u89E3\u51B3",
    "propertyConflict.observableTypesLabel": "\u51B2\u7A81\u7684 frontmatter \u503C\u5F62\u6001",
    "propertyConflict.detectedTypesLabel": "\u5F53\u524D\u53D1\u73B0\u7684\u7C7B\u578B",
    "propertyConflict.detectedTypesSummary": "\u68C0\u6D4B\u5230 {count} \u79CD\u5E95\u5C42\u5B58\u50A8\u5F62\u6001\uFF1A",
    "propertyConflict.fileCount": "\uFF08{count} \u4E2A\u6587\u4EF6\uFF09",
    "propertyConflict.resolveInstruction": "\u9700\u8981\u7EDF\u4E00\u4E3A\u517C\u5BB9\u7C7B\u578B\u624D\u80FD\u7EE7\u7EED\u3002",
    "propertyConflict.affectedFiles": "\u6D89\u53CA\u6570\u636E\u5E93\u6587\u4EF6\uFF08{count} \u4E2A\uFF09",
    "propertyConflict.currentStorage": "\u5E95\u5C42\u5B58\u50A8",
    "propertyConflict.changeTo": "\u6539\u4E3A",
    "propertyConflict.pluginType": "\u63D2\u4EF6\u7C7B\u578B",
    "propertyConflict.targetStorage": "\u5C06\u5B58\u50A8\u4E3A",
    "propertyConflict.targetStorageSame": "\u4ECD\u5C06\u5B58\u50A8\u4E3A",
    "propertyConflict.targetStorageChanged": "\u5C06\u5B58\u50A8\u4E3A",
    "propertyConflict.conflictItem": "\u51B2\u7A81\u76EE\u6807\u7C7B\u578B\uFF1A{type}",
    "propertyConflict.columnDatabaseName": "\u6570\u636E\u5E93\u540D",
    "propertyConflict.columnDatabasePath": "\u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84",
    "propertyConflict.columnObsidianType": "\u5F53\u524D\u5B58\u50A8\u5F62\u5F0F",
    "propertyConflict.columnPluginType": "\u5C5E\u6027\u7C7B\u578B",
    "propertyConflict.columnTargetStorageType": "\u76EE\u6807\u5B58\u50A8\u5F62\u5F0F",
    "propertyConflict.changeTypeFor": "\u4FEE\u6539 {database} \u4E2D {key} \u7684\u7C7B\u578B",
    "propertyConflict.updatedDefinitions": "\u5DF2\u66F4\u65B0 {count} \u4E2A\u6570\u636E\u5E93\u4E2D {key} \u7684\u7C7B\u578B\u5B9A\u4E49\u3002",
    "propertyConflict.sourceColumn": "\u5C5E\u6027\u5217",
    "propertyConflict.sourceComputed": "\u4FDD\u5B58\u578B\u516C\u5F0F",
    "propertyConflict.observable.text": "\u6587\u672C",
    "propertyConflict.observable.multitext": "\u591A\u6587\u672C",
    "propertyConflict.observable.number": "\u6570\u5B57",
    "propertyConflict.observable.date": "\u65E5\u671F",
    "propertyConflict.observable.datetime": "\u65E5\u671F\u548C\u65F6\u95F4",
    "propertyConflict.observable.checkbox": "\u590D\u9009\u6846",
    "timeline.noEvents": "\u6CA1\u6709\u53EF\u5728\u65F6\u95F4\u7EBF\u4E2D\u663E\u793A\u7684\u65E5\u671F\u8BB0\u5F55\u3002",
    "timeline.noEventsInRange": "\u5F53\u524D\u65F6\u95F4\u8303\u56F4\u5185\u6CA1\u6709\u65E5\u671F\u8BB0\u5F55\u3002",
    "timeline.uncategorized": "\u672A\u5206\u7EC4",
    "timeline.today": "\u4ECA\u5929",
    "timeline.prevShort": "\u5411\u5DE6\u79FB\u52A8\u4E00\u5217",
    "timeline.nextShort": "\u5411\u53F3\u79FB\u52A8\u4E00\u5217",
    "timeline.prevLong": "\u5411\u5DE6\u79FB\u52A8\u4E00\u5C4F",
    "timeline.nextLong": "\u5411\u53F3\u79FB\u52A8\u4E00\u5C4F",
    "timeline.prevDay": "\u4E0A\u4E00\u5929",
    "timeline.nextDay": "\u4E0B\u4E00\u5929",
    "timeline.prevWeek": "\u4E0A\u4E00\u5468",
    "timeline.nextWeek": "\u4E0B\u4E00\u5468",
    "timeline.prevMonth": "\u4E0A\u4E00\u6708",
    "timeline.nextMonth": "\u4E0B\u4E00\u6708",
    "timeline.prevQuarter": "\u4E0A\u4E00\u5B63",
    "timeline.nextQuarter": "\u4E0B\u4E00\u5B63",
    "timeline.scaleDay": "\u65E5",
    "timeline.scaleWeek": "\u5468",
    "timeline.scaleMonth": "\u6708",
    "timeline.scaleQuarter": "\u5B63",
    "timeline.columnWidth": "\u5217\u5BBD",
    "timeline.layoutSection": "\u5E03\u5C40",
    "timeline.jumpToEvent": "\u8DF3\u8F6C\u5230 {date} \u7684 {title}",
    "viewConfig.customColumnWidth": "\u81EA\u5B9A\u4E49\u5217\u5BBD",
    "viewConfig.eventStartDateField": "\u5F00\u59CB\u65E5\u671F",
    "viewConfig.eventEndDateField": "\u7ED3\u675F\u65E5\u671F",
    "viewConfig.eventTitleField": "\u4E8B\u4EF6\u6807\u9898",
    "viewConfig.eventColorField": "\u4E8B\u4EF6\u989C\u8272",
    "viewConfig.noColorField": "\u4E0D\u6309\u989C\u8272\u533A\u5206",
    "viewConfig.calendarKeepCellAspectRatio": "\u4FDD\u6301\u65E5\u671F\u683C\u4E3A\u65B9\u5F62",
    "viewConfig.calendarCellHeight": "\u65E5\u5386\u5355\u5143\u683C\u9AD8\u5EA6",
    "viewConfig.calendarCustomColumnWidth": "\u81EA\u5B9A\u4E49\u5217\u5BBD",
    "viewConfig.calendarColumnWidthValue": "\u5217\u5BBD",
    "viewConfig.calendarCustomRowHeight": "\u81EA\u5B9A\u4E49\u884C\u9AD8",
    "viewConfig.calendarWeekSlotDuration": "\u65F6\u95F4\u7C92\u5EA6",
    "viewConfig.calendarWeekSlotDuration.15": "15 \u5206\u949F",
    "viewConfig.calendarWeekSlotDuration.30": "30 \u5206\u949F",
    "viewConfig.calendarWeekSlotDuration.60": "60 \u5206\u949F",
    "viewConfig.calendarStartHour": "\u5F00\u59CB\u5C0F\u65F6",
    "viewConfig.calendarEndHour": "\u7ED3\u675F\u5C0F\u65F6",
    "viewConfig.calendarHourHeight": "\u5C0F\u65F6\u9AD8\u5EA6",
    "viewConfig.calendarColumnSizeMode": "\u5217\u5BBD\u6A21\u5F0F",
    "viewConfig.calendarColumnSizeMode.adaptive": "\u81EA\u9002\u5E94",
    "viewConfig.calendarColumnSizeMode.custom": "\u81EA\u5B9A\u4E49",
    "viewConfig.calendarRowSizeMode": "\u884C\u9AD8\u6A21\u5F0F",
    "viewConfig.calendarRowSizeMode.adaptive": "\u81EA\u9002\u5E94",
    "viewConfig.calendarRowSizeMode.custom": "\u81EA\u5B9A\u4E49",
    "viewConfig.calendarRowHeightValue": "\u884C\u9AD8",
    "viewConfig.calendarFirstDayOfWeek": "\u6BCF\u5468\u8D77\u59CB\u65E5",
    "viewConfig.dateGroupIgnoreTime": "\u5206\u7EC4\u65F6\u5FFD\u7565\u65F6\u523B",
    "viewConfig.groupRowLimit": "\u6BCF\u7EC4\u6700\u591A\u663E\u793A",
    "viewConfig.groupRowLimitUnlimited": "\u65E0\u9650\u5236",
    "viewConfig.groupRowLimitCustom": "\u81EA\u5B9A\u4E49",
    "viewConfig.groupRowLimitRecommended": "\u63A8\u8350",
    "viewConfig.calendarFirstDayOfWeek.auto": "\u8DDF\u968F\u7CFB\u7EDF",
    "viewConfig.calendarFirstDayOfWeek.0": "\u5468\u65E5",
    "viewConfig.calendarFirstDayOfWeek.1": "\u5468\u4E00",
    "viewConfig.calendarFirstDayOfWeek.6": "\u5468\u516D",
    "viewConfig.calendarMonthVisibleLanes": "\u6BCF\u5929\u663E\u793A\u4E8B\u4EF6\u6570",
    "viewConfig.calendarAllDayMaxLanes": "\u5168\u5929\u680F\u884C\u6570",
    "viewConfig.calendarScale": "\u65E5\u5386\u5C3A\u5EA6",
    "viewConfig.timelineGroupField": "\u65F6\u95F4\u7EBF\u5206\u7EC4",
    "viewConfig.timelineScale": "\u65F6\u95F4\u7EBF\u523B\u5EA6",
    "viewConfig.timelineScale.day": "\u6309\u5929",
    "viewConfig.timelineScale.week": "\u6309\u5468",
    "viewConfig.timelineScale.month": "\u6309\u6708",
    "viewConfig.timelineScale.quarter": "\u6309\u5B63",
    "viewConfig.chartGroupField": "\u5206\u7EC4",
    "viewConfig.chartGroupFieldNone": "\u672A\u9009\u62E9",
    "viewConfig.chartStackFieldNone": "\u672A\u9009\u62E9",
    "viewConfig.chartValueField": "\u6570\u503C\u5B57\u6BB5",
    "viewConfig.chartValueFieldNone": "\u672A\u9009\u62E9",
    "viewConfig.chartType": "\u56FE\u8868\u7C7B\u578B",
    "viewConfig.chartAggregation": "\u805A\u5408\u65B9\u5F0F",
    "viewConfig.databaseName": "\u540D\u79F0",
    "viewConfig.databaseDescription": "\u63CF\u8FF0",
    "viewConfig.descriptionPlaceholder": "\u6DFB\u52A0\u4E00\u6BB5\u7B80\u77ED\u63CF\u8FF0...",
    "viewConfig.sourceFolder": "\u6765\u6E90\u6587\u4EF6\u5939",
    "viewConfig.sourceRules": "\u6765\u6E90\u89C4\u5219",
    "viewConfig.sourceRules.help": "\u6570\u636E\u5E93\u7EA7\u9AD8\u7EA7\u89C4\u5219\u51B3\u5B9A\u54EA\u4E9B\u7B14\u8BB0\u5C5E\u4E8E\u5F53\u524D\u6570\u636E\u5E93\u3002\u4ECE .base \u8F6C\u6362\u65F6\u4F1A\u4FDD\u7559\u5D4C\u5957\u7684 AND\u3001OR \u548C NOT \u5206\u7EC4\u3002",
    "viewConfig.sourceRules.empty": "\u6CA1\u6709\u9AD8\u7EA7\u6765\u6E90\u89C4\u5219\u3002",
    "viewConfig.sourceRules.emptyGroup": "\u5F53\u524D\u5206\u7EC4\u6CA1\u6709\u89C4\u5219\u3002",
    "viewConfig.sourceRules.addRule": "\u6DFB\u52A0\u6765\u6E90\u89C4\u5219",
    "viewConfig.sourceRules.addGroup": "\u6DFB\u52A0\u89C4\u5219\u5206\u7EC4",
    "viewConfig.sourceRules.addExpression": "\u6DFB\u52A0 Bases \u8868\u8FBE\u5F0F",
    "viewConfig.sourceRules.addNot": "\u53CD\u9009\u89C4\u5219",
    "viewConfig.sourceRules.removeNot": "\u79FB\u9664 NOT",
    "viewConfig.sourceRules.remove": "\u5220\u9664\u89C4\u5219",
    "viewConfig.sourceRules.logic": "\u903B\u8F91",
    "viewConfig.sourceRules.and": "AND",
    "viewConfig.sourceRules.or": "OR",
    "viewConfig.sourceRules.not": "NOT",
    "viewConfig.sourceRules.fieldPlaceholder": "\u5C5E\u6027",
    "viewConfig.sourceRules.customField": "\u81EA\u5B9A\u4E49\u5C5E\u6027...",
    "viewConfig.sourceRules.pickProperty": "\u9009\u62E9\u5C5E\u6027\u2026",
    "viewConfig.sourceRules.noProperties": "\u672A\u627E\u5230\u5C5E\u6027",
    "viewConfig.sourceRules.searchProperties": "\u641C\u7D22\u5C5E\u6027\u2026",
    "viewConfig.sourceRules.fieldGroup.noteProperties": "\u7B14\u8BB0\u5C5E\u6027",
    "viewConfig.sourceRules.fieldGroup.formulaProperties": "\u8BA1\u7B97\u5C5E\u6027",
    "viewConfig.sourceRules.fieldGroup.fileProperties": "\u6587\u4EF6\u5C5E\u6027",
    "viewConfig.sourceRules.fieldGroup.custom": "\u81EA\u5B9A\u4E49",
    "viewConfig.sourceRules.valuePlaceholder": "\u503C",
    "viewConfig.sourceRules.expressionPlaceholder": "Bases \u8868\u8FBE\u5F0F\uFF0C\u4F8B\u5982\uFF1Aformula.ppu > 5",
    "viewConfig.sourceRules.op.inFolder": "\u4F4D\u4E8E\u6587\u4EF6\u5939",
    "viewConfig.sourceRules.op.hasTag": "\u5305\u542B\u6807\u7B7E",
    "viewConfig.sourceRules.op.hasProperty": "\u5305\u542B\u5C5E\u6027",
    "viewConfig.sourceRules.op.hasLink": "\u5305\u542B\u94FE\u63A5",
    "viewConfig.sourceRules.op.eq": "\u7B49\u4E8E",
    "viewConfig.sourceRules.op.neq": "\u4E0D\u7B49\u4E8E",
    "viewConfig.sourceRules.op.strictEq": "\u4E25\u683C\u7B49\u4E8E",
    "viewConfig.sourceRules.op.strictNeq": "\u4E25\u683C\u4E0D\u7B49\u4E8E",
    "viewConfig.sourceRules.op.contains": "\u5305\u542B",
    "viewConfig.sourceRules.op.startsWith": "\u5F00\u5934\u662F",
    "viewConfig.sourceRules.op.endsWith": "\u7ED3\u5C3E\u662F",
    "viewConfig.sourceRules.op.matches": "\u5339\u914D\u6B63\u5219",
    "viewConfig.sourceRules.op.isType": "\u7C7B\u578B\u662F",
    "viewConfig.sourceRules.op.gt": "\u5927\u4E8E",
    "viewConfig.sourceRules.op.gte": "\u5927\u4E8E\u7B49\u4E8E",
    "viewConfig.sourceRules.op.lt": "\u5C0F\u4E8E",
    "viewConfig.sourceRules.op.lte": "\u5C0F\u4E8E\u7B49\u4E8E",
    "viewConfig.sourceRules.op.empty": "\u4E3A\u7A7A",
    "viewConfig.sourceRules.op.notempty": "\u4E0D\u4E3A\u7A7A",
    "viewConfig.sourceRules.op.truthy": "\u4E3A\u771F",
    "viewConfig.sourceRules.opGroup.file": "\u6587\u4EF6",
    "viewConfig.sourceRules.opGroup.value": "\u503C",
    "viewConfig.sourceRules.opGroup.text": "\u6587\u672C",
    "viewConfig.sourceRules.opGroup.compare": "\u6BD4\u8F83",
    "viewConfig.sourceRules.opGroup.presence": "\u5B58\u5728\u6027",
    "viewConfig.sourceRules.opGroup.type": "\u7C7B\u578B",
    "viewConfig.sourceRules.opGroup.current": "\u5F53\u524D",
    "viewConfig.newRecordFolder": "\u65B0\u5EFA\u7B14\u8BB0\u6587\u4EF6\u5939",
    "viewConfig.newRecordFolderLocked": "\u4EC5\u63A7\u5236\u65B0\u5EFA\u7B14\u8BB0\u4FDD\u5B58\u4F4D\u7F6E\u3002\u7559\u7A7A\u65F6\u4F18\u5148\u4F7F\u7528\u6765\u6E90\u6587\u4EF6\u5939\uFF1B\u6765\u6E90\u4E3A\u7A7A\u65F6\u4F7F\u7528\u9ED8\u8BA4\u6570\u636E\u5E93\u6587\u4EF6\u5939\u3002",
    "viewConfig.syncComputed": "\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C",
    "viewConfig.saveComputedResults": "\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C\u5230\u7B14\u8BB0\u5C5E\u6027",
    "viewConfig.computedSyncMode": "\u8BA1\u7B97\u7ED3\u679C\u4FDD\u5B58\u65B9\u5F0F",
    "viewConfig.computedSync.displayOnly": "\u4EC5\u5728\u6570\u636E\u5E93\u4E2D\u663E\u793A\uFF08\u63A8\u8350\uFF09",
    "viewConfig.computedSync.displayOnlyDesc": "\u8BA1\u7B97\u7ED3\u679C\u4F1A\u663E\u793A\u5728\u6570\u636E\u5E93\u91CC\uFF0C\u4F46\u4E0D\u4F1A\u521B\u5EFA\u6216\u66F4\u65B0\u7B14\u8BB0\u5C5E\u6027\u3002",
    "viewConfig.computedSync.automatic": "\u81EA\u52A8\u4FDD\u5B58\u5230\u7B14\u8BB0\u5C5E\u6027",
    "viewConfig.computedSync.automaticDesc": "\u6253\u5F00\u6570\u636E\u5E93\u6216\u6570\u636E\u53D8\u5316\u540E\uFF0C\u53EF\u80FD\u4F1A\u66F4\u65B0\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7684\u591A\u6761\u7B14\u8BB0\u3002",
    "viewConfig.computedSync.manual": "\u624B\u52A8\u4FDD\u5B58\u5230\u7B14\u8BB0\u5C5E\u6027",
    "viewConfig.computedSync.manualDesc": "\u9700\u8981\u5BFC\u51FA\u3001Dataview \u6216\u5176\u4ED6\u63D2\u4EF6\u8BFB\u53D6\u8BA1\u7B97\u7ED3\u679C\u65F6\uFF0C\u518D\u70B9\u51FB\u5DE5\u5177\u680F\u6309\u94AE\u4FDD\u5B58\u3002",
    "viewConfig.computedSync.help": "\u8BA1\u7B97\u7ED3\u679C\u59CB\u7EC8\u4F1A\u5728\u6570\u636E\u5E93\u4E2D\u663E\u793A\u3002\u8FD9\u91CC\u4EC5\u51B3\u5B9A\u662F\u5426\u4E5F\u628A\u7ED3\u679C\u4FDD\u5B58\u6210\u7B14\u8BB0\u5C5E\u6027\u3002",
    "viewConfig.computedSync.confirmAutomatic": "\u81EA\u52A8\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C\u53EF\u80FD\u4F1A\u4FEE\u6539\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7684\u591A\u6761\u7B14\u8BB0\u3002\n\n\u662F\u5426\u7EE7\u7EED\uFF1F",
    "viewConfig.computedSync.manualHint": "\u8BA1\u7B97\u7ED3\u679C\u4F1A\u5148\u4FDD\u6301\u4EC5\u663E\u793A\uFF1B\u9700\u8981\u5199\u5165\u7B14\u8BB0\u5C5E\u6027\u65F6\uFF0C\u8BF7\u70B9\u51FB\u201C\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C\u201D\u3002",
    "viewConfig.computedSync.displayOnlyHint": "\u5DF2\u4FDD\u5B58\u7684\u8BA1\u7B97\u5C5E\u6027\u4F1A\u4FDD\u7559\uFF0C\u4F46 Note Database \u4E0D\u4F1A\u518D\u66F4\u65B0\u5B83\u4EEC\u3002",
    "viewConfig.computedCleanup.button": "\u6E05\u7406\u5DF2\u4FDD\u5B58\u7684\u8BA1\u7B97\u5C5E\u6027...",
    "viewConfig.computedCleanup.help": "\u4ECE\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7684\u7B14\u8BB0\u5C5E\u6027\u4E2D\u79FB\u9664\u65E7\u7684\u8BA1\u7B97\u7ED3\u679C\u503C\u3002",
    "viewConfig.computedCleanup.title": "\u6E05\u7406\u5DF2\u4FDD\u5B58\u7684\u8BA1\u7B97\u5C5E\u6027",
    "viewConfig.computedCleanup.desc": "\u9009\u62E9\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u5DF2\u5B9E\u9645\u5B58\u5728\u4E8E\u7B14\u8BB0 frontmatter \u7684\u8BA1\u7B97\u5C5E\u6027\u3002\u8FD9\u4E0D\u4F1A\u5220\u9664\u516C\u5F0F\u5217\u3002\u5982\u679C\u5F53\u524D\u5F00\u542F\u4E86\u81EA\u52A8\u4FDD\u5B58\uFF0C\u4F1A\u5148\u5207\u6362\u4E3A\u4EC5\u663E\u793A\uFF0C\u907F\u514D\u5C5E\u6027\u88AB\u91CD\u65B0\u5199\u56DE\u3002",
    "viewConfig.computedCleanup.confirm": "\u6E05\u7406\u5C5E\u6027",
    "viewConfig.computedCleanup.noFields": "\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u6CA1\u6709\u627E\u5230\u5DF2\u4FDD\u5B58\u7684\u8BA1\u7B97\u5C5E\u6027\u3002",
    "viewConfig.computedCleanup.optionField": "\u8BA1\u7B97\u5B57\u6BB5\uFF1A{label}",
    "viewConfig.computedCleanup.optionKey": "\u5C06\u6E05\u7406 frontmatter \u5C5E\u6027\uFF1A{key} \xB7 {count} \u6761\u7B14\u8BB0",
    "viewConfig.coverField": "\u5C01\u9762\u56FE\u5B57\u6BB5",
    "viewConfig.noCover": "\u4E0D\u663E\u793A\u5C01\u9762",
    "viewConfig.imageFit": "\u56FE\u7247\u663E\u793A",
    "viewConfig.cover": "\u586B\u5145\u88C1\u5207",
    "viewConfig.contain": "\u5B8C\u6574\u663E\u793A",
    "viewConfig.cardSize": "\u5361\u7247\u5C3A\u5BF8",
    "viewConfig.coverRatio": "\u5C01\u9762\u6BD4\u4F8B",
    "viewConfig.ratioPortrait": "\u7AD6\u5411 0.6",
    "viewConfig.ratioClassic": "\u7ECF\u5178 0.75",
    "viewConfig.ratioSquare": "\u6B63\u65B9\u5F62 1:1",
    "viewConfig.ratioLandscape": "\u6A2A\u5411 4:3",
    "viewConfig.ratioWide": "\u5BBD\u5C4F 16:9",
    "viewConfig.ratioCurrent": "\u5F53\u524D {ratio}",
    "viewConfig.boardColumnWidth": "\u770B\u677F\u5217\u5BBD",
    "viewConfig.defaultColumnWidth": "\u9ED8\u8BA4\u5B57\u6BB5\u5BBD\u5EA6",
    "viewConfig.titleField": "\u6807\u9898\u5B57\u6BB5",
    "viewConfig.titleAuto": "\u4F7F\u7528\u6587\u4EF6\u540D\u79F0",
    "viewConfig.noTitle": "\u4E0D\u663E\u793A\u6807\u9898",
    "viewConfig.showEmptyFields": "\u663E\u793A\u7A7A\u503C\u5C5E\u6027",
    "viewConfig.listCompactFields": "\u7D27\u51D1\u5B57\u6BB5\u5E03\u5C40",
    "viewConfig.statusPreset": "\u9ED8\u8BA4\u72B6\u6001\u9884\u8BBE",
    "viewConfig.statusPreset.help": "\u7528\u4E8E\u5728\u5F53\u524D\u5C42\u7EA7\u65B0\u5EFA\u72B6\u6001\u5C5E\u6027\u65F6\u5957\u7528\u9ED8\u8BA4\u9009\u9879\u3002\u7BA1\u7406\u9884\u8BBE\u53EA\u4F1A\u7F16\u8F91\u5F53\u524D\u6570\u636E\u5E93/\u89C6\u56FE\u5C42\u7EA7\u3002",
    "viewConfig.boardSubgroupField": "\u770B\u677F\u5B50\u7EC4",
    "viewConfig.noSubgroup": "\u4E0D\u4F7F\u7528\u5B50\u7EC4",
    "statusPresets.title": "\u72B6\u6001\u9884\u8BBE",
    "statusPresets.desc": "\u914D\u7F6E\u53EF\u590D\u7528\u7684\u72B6\u6001\u9009\u9879\u5217\u8868\uFF0C\u5E76\u9009\u62E9\u65B0\u5EFA\u72B6\u6001\u5B57\u6BB5\u9ED8\u8BA4\u4F7F\u7528\u54EA\u4E00\u7EC4\u3002",
    "statusPresets.manage": "\u7BA1\u7406\u9884\u8BBE",
    "statusPresets.none": "\u4E0D\u4F7F\u7528\u9884\u8BBE",
    "statusPresets.add": "\u6DFB\u52A0\u9884\u8BBE",
    "statusPresets.default": "\u9ED8\u8BA4\u9884\u8BBE",
    "statusPresets.defaultShort": "\u9ED8\u8BA4",
    "statusPresets.useAsDefault": "\u8BBE\u4E3A\u9ED8\u8BA4",
    "statusPresets.editOptions": "\u7F16\u8F91\u9009\u9879",
    "statusPresets.newPreset": "\u65B0\u9884\u8BBE",
    "statusPresets.namePlaceholder": "\u9884\u8BBE\u540D\u79F0",
    "statusPresets.keepOne": "\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u9884\u8BBE\u3002",
    "filter.eq": "\u7B49\u4E8E",
    "filter.neq": "\u4E0D\u7B49\u4E8E",
    "filter.contains": "\u5305\u542B",
    "filter.hasTag": "\u5305\u542B\u6807\u7B7E",
    "filter.gt": "\u5927\u4E8E",
    "filter.gte": "\u5927\u4E8E\u7B49\u4E8E",
    "filter.lt": "\u5C0F\u4E8E",
    "filter.lte": "\u5C0F\u4E8E\u7B49\u4E8E",
    "filter.empty": "\u4E3A\u7A7A",
    "filter.notempty": "\u4E0D\u4E3A\u7A7A",
    "filter.checkboxChecked": "\u5DF2\u52FE\u9009",
    "filter.checkboxUnchecked": "\u672A\u52FE\u9009",
    "menu.editProperty": "\u7F16\u8F91\u5C5E\u6027\u300C{name}\u300D...",
    "menu.back": "\u2190 \u8FD4\u56DE",
    "menu.editOptions": "\u7F16\u8F91\u9009\u9879\u3001\u989C\u8272\u548C\u987A\u5E8F...",
    "menu.openFormula": "\u6253\u5F00\u516C\u5F0F\u7F16\u8F91\u5668...",
    "menu.changeType": "\u66F4\u6539\u7C7B\u578B...",
    "menu.insertLeft": "\u63D2\u5165\u5217\uFF08\u5DE6\u4FA7\uFF09",
    "menu.insertRight": "\u63D2\u5165\u5217\uFF08\u53F3\u4FA7\uFF09",
    "menu.duplicateColumn": "\u590D\u5236\u5217",
    "menu.moveUp": "\u4E0A\u79FB",
    "menu.moveDown": "\u4E0B\u79FB",
    "menu.hideProperty": "\u9690\u85CF\u300C{name}\u300D",
    "menu.enableWrap": "\u5F00\u542F\u6362\u884C\u663E\u793A\u5B8C\u6574\u5185\u5BB9",
    "menu.disableWrap": "\u5173\u95ED\u6362\u884C\u663E\u793A\u5B8C\u6574\u5185\u5BB9",
    "menu.textRenderLink": "\u94FE\u63A5",
    "menu.textRenderPlain": "\u7EAF\u6587\u672C",
    "menu.textRenderMarkdown": "Markdown",
    "menu.textLinkSchemeTitle": "\u94FE\u63A5\u534F\u8BAE",
    "menu.textLinkSchemeHttps": "HTTPS",
    "menu.textLinkSchemeEmail": "\u90AE\u7BB1",
    "menu.textLinkSchemePhone": "\u7535\u8BDD",
    "menu.textLinkSchemeNone": "\u65E0",
    "mdToolbar.bold": "\u52A0\u7C97",
    "mdToolbar.italic": "\u659C\u4F53",
    "mdToolbar.strike": "\u5220\u9664\u7EBF",
    "mdToolbar.highlight": "\u9AD8\u4EAE",
    "mdToolbar.code": "\u884C\u5185\u4EE3\u7801",
    "mdToolbar.math": "\u516C\u5F0F",
    "mdToolbar.link": "\u94FE\u63A5",
    "mdToolbar.wikilink": "\u7B14\u8BB0\u94FE\u63A5",
    "mdToolbar.linkText": "\u6587\u5B57",
    "mdToolbar.wikilinkText": "\u7B14\u8BB0",
    "menu.numberStylePlain": "\u6570\u5B57",
    "menu.numberStyleRating": "\u8BC4\u5206",
    "menu.numberStyleProgress": "\u6C34\u5E73\u8FDB\u5EA6\u6761",
    "menu.numberStyleRing": "\u5706\u73AF\u8FDB\u5EA6\u6761",
    "menu.numberDisplayStyle": "\u663E\u793A\u6837\u5F0F",
    "menu.numberDisplayOptions": "\u663E\u793A\u9009\u9879",
    "menu.numberDisplayIcon": "\u56FE\u6807",
    "menu.numberDisplayIconEmoji": "\u81EA\u5B9A\u4E49 Emoji",
    "menu.numberDisplayEmoji": "\u81EA\u5B9A\u4E49 Emoji",
    "menu.numberDisplayIconStyle": "\u56FE\u6807\u6837\u5F0F",
    "menu.numberDisplayIconFilled": "\u5B9E\u5FC3",
    "menu.numberDisplayIconOutline": "\u7A7A\u5FC3",
    "menu.numberDisplayMax": "\u6700\u5927\u503C",
    "menu.numberDisplayDivisor": "\u9664\u6570",
    "menu.numberDisplayShowValue": "\u663E\u793A\u6570\u503C",
    "menu.numberDisplayColor": "\u989C\u8272",
    "menu.numberDisplayColorDefault": "\u9ED8\u8BA4",
    "menu.numberDisplayColorTheme": "\u4E3B\u9898\u8272",
    "menu.numberDisplayColorCustom": "\u81EA\u5B9A\u4E49",
    "menu.numberStyleCustom": "\u81EA\u5B9A\u4E49",
    "panel.numberDisplayStyle": "\u663E\u793A\u6837\u5F0F",
    "modal.numberDisplayStyle": "\u6570\u5B57\u663E\u793A\u6837\u5F0F",
    "undo.numberDisplayStyleConfig": "\u6570\u5B57\u663E\u793A\u6837\u5F0F\u914D\u7F6E",
    "menu.adjustColumnWidth": "\u8C03\u6574\u5217\u5BBD",
    "columnWidth.adjustTitle": "\u8C03\u6574\u300C{name}\u300D",
    "columnWidth.auto": "\u81EA\u52A8",
    "columnWidth.narrow": "\u7A84",
    "columnWidth.medium": "\u4E2D",
    "columnWidth.wide": "\u5BBD",
    "menu.autoFitColumn": "\u81EA\u52A8\u8C03\u6574\u5217\u5BBD",
    "menu.autoFitAllColumns": "\u81EA\u52A8\u8C03\u6574\u6240\u6709\u53EF\u89C1\u5217\u5BBD",
    "menu.sortBy": "\u6309\u300C{name}\u300D\u6392\u5E8F",
    "menu.sortAscending": "\u5347\u5E8F\u6392\u5E8F",
    "menu.sortDescending": "\u964D\u5E8F\u6392\u5E8F",
    "menu.filterByValue": "\u6309 {name} \u7B5B\u9009",
    "menu.clearSort": "\u53D6\u6D88\u6392\u5E8F",
    "menu.deleteColumn": "\u5220\u9664\u5217",
    "menu.openNote": "\u6253\u5F00\u7B14\u8BB0",
    "menu.insertAbove": "\u5728\u4E0A\u65B9\u6DFB\u52A0\u6761\u76EE",
    "menu.insertBelow": "\u5728\u4E0B\u65B9\u6DFB\u52A0\u6761\u76EE",
    "menu.newFromTemplate": "\u4ECE\u6A21\u677F\u65B0\u5EFA",
    "menu.deleteRow": "\u5220\u9664\u300C{name}\u300D",
    "menu.confirmDeleteRow": "\u786E\u5B9A\u5220\u9664\u300C{name}\u300D\uFF1F\n\n\u5BF9\u5E94\u7684 Markdown \u6587\u4EF6\u4F1A\u88AB\u79FB\u5230\u5E9F\u7EB8\u7BD3\u3002",
    "menu.duplicateRecord": "\u590D\u5236\u8BB0\u5F55",
    "menu.copySuffix": "\u526F\u672C",
    "settings.title": "Note Database \u8BBE\u7F6E",
    "settings.language.name": "\u8BED\u8A00",
    "settings.language.desc": "\u9009\u62E9\u754C\u9762\u8BED\u8A00\uFF1B\u8DDF\u968F\u7CFB\u7EDF\u4F1A\u4F7F\u7528 Obsidian/\u6D4F\u89C8\u5668\u8BED\u8A00\u3002",
    "viewConfig.yearDisplayMode": "\u65E5\u671F\u5E74\u4EFD\u663E\u793A",
    "viewConfig.yearDisplayMode.always": "\u59CB\u7EC8\u663E\u793A",
    "viewConfig.yearDisplayMode.smart": "\u667A\u80FD\u9690\u85CF",
    "viewConfig.yearDisplayMode.never": "\u59CB\u7EC8\u9690\u85CF",
    "undo.yearDisplayModeConfig": "\u66F4\u6539\u65E5\u671F\u5E74\u4EFD\u663E\u793A",
    "settings.language.system": "\u8DDF\u968F\u7CFB\u7EDF",
    "settings.language.en": "English",
    "settings.language.zhCN": "\u7B80\u4F53\u4E2D\u6587",
    "settings.language.zhTW": "\u7E41\u9AD4\u4E2D\u6587",
    "settings.databaseFolder.name": "\u9ED8\u8BA4\u8F93\u51FA\u6587\u4EF6\u5939",
    "settings.databaseFolder.desc": "\u7528\u4E8E\u4FDD\u5B58\u751F\u6210\u7684\u6570\u636E\u5E93\u6587\u4EF6\uFF1B\u5F53\u6570\u636E\u5E93\u672A\u8BBE\u7F6E\u6765\u6E90\u6587\u4EF6\u5939\u548C\u65B0\u5EFA\u7B14\u8BB0\u6587\u4EF6\u5939\u65F6\uFF0C\u65B0\u5EFA\u7B14\u8BB0\u4E5F\u4F1A\u9ED8\u8BA4\u4FDD\u5B58\u5230\u8FD9\u91CC\u3002",
    "settings.databaseFiles.name": "\u6570\u636E\u5E93\u6587\u4EF6",
    "settings.databaseFiles.modalTitle": "\u6570\u636E\u5E93\u6587\u4EF6",
    "settings.databaseFiles.emptyHint": "\u6CA1\u6709\u627E\u5230 db_view: true \u7684\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "settings.databaseFilesAlwaysOpenInNewTab.name": "\u603B\u662F\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00\u6570\u636E\u5E93\u6587\u4EF6",
    "settings.databaseFilesAlwaysOpenInNewTab.desc": "\u9ED8\u8BA4\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00 db_view Markdown \u6587\u4EF6\u3002",
    "settings.databaseFilesPreventDuplicateTabs.name": "\u9632\u6B62\u91CD\u590D\u6570\u636E\u5E93\u6587\u4EF6\u6807\u7B7E\u9875",
    "settings.databaseFilesPreventDuplicateTabs.desc": "\u5982\u679C\u6570\u636E\u5E93\u6587\u4EF6\u6807\u7B7E\u9875\u5DF2\u7ECF\u6253\u5F00\uFF0C\u5219\u5207\u6362\u5230\u5DF2\u6709\u6807\u7B7E\u9875\uFF0C\u800C\u4E0D\u662F\u518D\u6253\u5F00\u4E00\u4E2A\u3002",
    "settings.showDatabaseIcon.name": "\u663E\u793A\u6570\u636E\u5E93\u56FE\u6807",
    "settings.showDatabaseIcon.desc": "\u5728\u6570\u636E\u5E93\u6807\u9898\u680F\u663E\u793A\u56FE\u6807\u4F4D\u3002",
    "settings.dashboardInitialSource.name": "Dashboard \u8D77\u59CB\u9875\u9762",
    "settings.dashboardInitialSource.desc": "\u9009\u62E9\u6253\u5F00 Dashboard \u65F6\u9ED8\u8BA4\u663E\u793A\u7B2C\u4E00\u4E2A\u914D\u7F6E\u578B\u6570\u636E\u5E93\uFF0C\u8FD8\u662F\u7B2C\u4E00\u4E2A\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "settings.dashboardInitialSource.settings": "\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "settings.dashboardInitialSource.file": "\u6570\u636E\u5E93\u6587\u4EF6",
    "settings.csvMarkdownTransfer.name": "CSV + Markdown \u5BFC\u5165 / \u5BFC\u51FA",
    "settings.csvMarkdownTransfer.desc": "\u5BFC\u5165 CSV \u4E0E Markdown \u6587\u4EF6\uFF0C\u6216\u5C06\u5F53\u524D Dashboard \u89C6\u56FE\u5BFC\u51FA\u4E3A\u5305\u542B CSV\u3001Markdown \u6587\u4EF6\u548C\u6570\u636E\u5E93\u5143\u6570\u636E\u7684 ZIP\u3002",
    "settings.csvMarkdownTransfer.import": "\u5BFC\u5165 CSV + Markdown",
    "settings.csvMarkdownTransfer.export": "\u5BFC\u51FA\u5F53\u524D\u89C6\u56FE",
    "settings.statusPresets.name": "\u5168\u5C40\u72B6\u6001\u9884\u8BBE",
    "settings.statusPresets.desc": "\u7BA1\u7406\u72B6\u6001\u5B57\u6BB5\u53EF\u590D\u7528\u7684\u9009\u9879\u5217\u8868\uFF0C\u5E76\u9009\u62E9\u5168\u5C40\u9ED8\u8BA4\u9884\u8BBE\u3002",
    "settings.groups.general": "\u901A\u7528\u8BBE\u7F6E",
    "settings.groups.dataManagement": "\u6570\u636E\u7BA1\u7406",
    "settings.groups.statusPresets": "\u72B6\u6001\u9884\u8BBE",
    "settings.groups.databases": "\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "settings.groups.databaseFiles": "\u6587\u4EF6\u578B\u6570\u636E\u5E93",
    "settings.groups.databaseFiles.desc": "\u72EC\u7ACB\u7684 .md \u6587\u4EF6\uFF0Cfrontmatter \u4E2D\u542B\u6709 db_view: true\u3002",
    "settings.groups.trash": "\u56DE\u6536\u7AD9",
    "settings.addDatabaseFile": "\u65B0\u5EFA\u6570\u636E\u5E93\u6587\u4EF6",
    "settings.databaseList.columns": "\u5217",
    "settings.databaseList.views": "\u89C6\u56FE",
    "settings.databaseList.title": "\u6570\u636E\u5E93",
    "settings.databaseList.desc": "\u7BA1\u7406\u914D\u7F6E\u578B\u6570\u636E\u5E93\u3002\u8FD9\u4E9B\u6570\u636E\u5E93\u4E0D\u76F4\u63A5\u5B58\u50A8\u4E3A\u6587\u4EF6\uFF0C\u800C\u662F\u4FDD\u5B58\u5728\u63D2\u4EF6\u914D\u7F6E\u4E2D\u3002",
    "settings.databaseList.manageInDashboard": "\u8BF7\u5728 Dashboard \u7684\u8BBE\u7F6E\u6309\u94AE\u4E2D\u7F16\u8F91\u6B64\u6570\u636E\u5E93\u3002",
    "settings.empty.title": "\u8FD8\u6CA1\u6709\u914D\u7F6E\u6570\u636E\u5E93",
    "settings.empty.desc": "\u53EF\u4EE5\u5728\u8FD9\u91CC\u521B\u5EFA\u7A7A\u7684\u914D\u7F6E\u578B\u6570\u636E\u5E93\uFF0C\u4E5F\u53EF\u4EE5\u4ECE\u547D\u4EE4\u9762\u677F\u5BFC\u5165 Obsidian .base \u6216\u751F\u6210\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "settings.addDatabase": "\u6DFB\u52A0\u7A7A\u6570\u636E\u5E93",
    "settings.databaseName": "\u6570\u636E\u5E93\u540D\u79F0",
    "settings.sourceFolder": "\u6765\u6E90\u6587\u4EF6\u5939",
    "settings.sourceFolder.desc": "\u7528\u4E8E\u626B\u63CF\u7B14\u8BB0\u7684 vault \u8DEF\u5F84\u3002\u7559\u7A7A\u65F6\u626B\u63CF vault \u6839\u76EE\u5F55\u3002",
    "settings.sourceFolder.placeholder": "\u4F8B\u5982: Projects",
    "settings.defaultSort": "\u9ED8\u8BA4\u6392\u5E8F",
    "settings.sortField": "\u6392\u5E8F\u5B57\u6BB5",
    "settings.deleteDatabase": "\u5220\u9664\u6B64\u6570\u636E\u5E93",
    "settings.trash": "\u56DE\u6536\u7AD9",
    "settings.confirmPermanentDelete": "\u6C38\u4E45\u5220\u9664\u6570\u636E\u5E93\u300C{name}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
    "deleteDatabase.title": "\u5220\u9664\u6570\u636E\u5E93\u300C{name}\u300D",
    "deleteDatabase.info": "\u6B64\u6570\u636E\u5E93\u5F53\u524D\u5339\u914D {count} \u4E2A\u7B14\u8BB0\u6587\u4EF6\u3002",
    "deleteDatabase.deleteFiles": "\u540C\u65F6\u5C06\u5339\u914D\u7684\u7B14\u8BB0\u6587\u4EF6\u79FB\u81F3\u7CFB\u7EDF\u56DE\u6536\u7AD9",
    "deleteDatabase.deleteFilesDesc": "\u5171 {count} \u4E2A\u6587\u4EF6\uFF0C\u6587\u4EF6\u5C06\u88AB\u79FB\u81F3\u7CFB\u7EDF\u56DE\u6536\u7AD9\u3002",
    "deleteDatabase.moveToPluginTrash": "\u79FB\u81F3\u63D2\u4EF6\u56DE\u6536\u7AD9",
    "deleteDatabase.moveToSystemTrash": "\u79FB\u81F3\u7CFB\u7EDF\u56DE\u6536\u7AD9",
    "addDatabase.title": "\u65B0\u5EFA\u6570\u636E\u5E93",
    "addDatabase.sourceDesc": "\u7528\u4E8E\u626B\u63CF\u7B14\u8BB0\u7684 vault \u8DEF\u5F84\u3002\u7559\u7A7A\u65F6\u626B\u63CF vault \u6839\u76EE\u5F55\u3002",
    "addDatabase.createAs": "\u521B\u5EFA\u65B9\u5F0F",
    "addDatabase.createInSettings": "\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "addDatabase.createAsFile": "\u6570\u636E\u5E93\u6587\u4EF6",
    "addDatabase.create": "\u521B\u5EFA",
    "addDatabase.scanTitle": "\u53D1\u73B0\u4EE5\u4E0B\u5C5E\u6027",
    "addDatabase.scanDesc": "\u5728\u6E90\u6587\u4EF6\u5939\u7684\u6587\u4EF6\u4E2D\u53D1\u73B0\u4E86\u4EE5\u4E0B\u5C5E\u6027\uFF0C\u8BF7\u9009\u62E9\u8981\u4F5C\u4E3A\u6570\u636E\u5E93\u5217\u5305\u542B\u7684\u5C5E\u6027\u3002",
    "baseImport.title": "\u786E\u8BA4\u5BFC\u5165\u5C5E\u6027",
    "baseImport.desc": "\u4EE5\u4E0B\u5C5E\u6027\u5DF2\u4ECE\u6587\u4EF6\u4E2D\u81EA\u52A8\u63A8\u65AD\u3002\u4F60\u53EF\u4EE5\u4FEE\u6539\u7C7B\u578B\u540E\u518D\u786E\u8BA4\u5BFC\u5165\u3002file.name \u4F1A\u81EA\u52A8\u4F5C\u4E3A\u6587\u4EF6\u540D\u5217\u6DFB\u52A0\uFF0C\u56E0\u6B64\u4E0D\u4F1A\u51FA\u73B0\u5728\u4E0B\u65B9\u5217\u8868\u4E2D\u3002",
    "baseImport.chooseBaseFile": "\u9009\u62E9 .base \u6587\u4EF6",
    "baseImport.chooseBaseFilePlaceholder": "\u641C\u7D22 .base \u6587\u4EF6...",
    "baseImport.property": "\u5C5E\u6027\u952E",
    "baseImport.displayName": "\u5217\u6807\u9898",
    "baseImport.inferredType": "\u63A8\u65AD\u7C7B\u578B",
    "baseImport.fileCount": "\u6587\u4EF6\u6570",
    "baseImport.confirm": "\u786E\u8BA4\u5BFC\u5165",
    "baseImport.include": "\u5305\u542B",
    "csvMarkdownImport.title": "\u5BFC\u5165 CSV + Markdown \u6587\u4EF6",
    "csvMarkdownImport.desc": "\u8BF7\u4F18\u5148\u9009\u62E9\u672C\u63D2\u4EF6\u5BFC\u51FA\u7684\u6C47\u603B CSV \u6587\u4EF6\uFF08\u540D\u4E3A *_all.csv\uFF09\uFF0C\u4E5F\u53EF\u4EE5\u9009\u62E9\u5404\u89C6\u56FE\u7684\u72EC\u7ACB CSV \u6587\u4EF6\u3002\u53EF\u9009\u6DFB\u52A0 Markdown \u6587\u4EF6\u548C note-database.json \u5143\u6570\u636E\u4EE5\u5B8C\u6574\u6062\u590D\u6570\u636E\u5E93\u7ED3\u6784\u3002",
    "csvMarkdownImport.csv": "CSV \u6587\u4EF6",
    "csvMarkdownImport.markdown": "Markdown \u6587\u4EF6",
    "csvMarkdownImport.metadata": "\u6570\u636E\u5E93\u5143\u6570\u636E",
    "csvMarkdownImport.databaseName": "\u6570\u636E\u5E93\u540D\u79F0",
    "csvMarkdownImport.targetFolder": "\u5BFC\u5165\u7B14\u8BB0\u6587\u4EF6\u5939",
    "csvMarkdownImport.import": "\u5BFC\u5165",
    "csvMarkdownImport.chooseCsv": "\u9009\u62E9 CSV",
    "csvMarkdownImport.chooseMarkdown": "\u9009\u62E9 Markdown \u6587\u4EF6",
    "csvMarkdownImport.chooseMetadata": "\u9009\u62E9\u5143\u6570\u636E",
    "csvMarkdownImport.noFile": "\u672A\u9009\u62E9\u6587\u4EF6",
    "csvMarkdownImport.filesSelected": "\u5DF2\u9009\u62E9 {count} \u4E2A\u6587\u4EF6",
    "csvMarkdownExport.title": "\u5BFC\u51FA CSV + Markdown ZIP",
    "csvMarkdownExport.desc": "ZIP \u5185\u5305\u542B CSV\u3001\u6BCF\u6761\u8BB0\u5F55\u5BF9\u5E94\u7684 Markdown \u6587\u4EF6\uFF0C\u4EE5\u53CA\u7528\u4E8E\u91CD\u65B0\u5BFC\u5165\u6570\u636E\u5E93\u7ED3\u6784\u7684 note-database.json\u3002",
    "csvMarkdownExport.includeFrontmatter": "\u5BFC\u51FA\u7684 Markdown \u6587\u4EF6\u5305\u542B frontmatter \u5B57\u6BB5",
    "csvMarkdownExport.includeAllTableViews": "\u540C\u65F6\u5305\u542B\u6240\u6709\u8868\u683C\u89C6\u56FE\u7684 CSV \u6587\u4EF6",
    "csvMarkdownExport.chooseLocation": "\u9009\u62E9\u5BFC\u51FA\u4F4D\u7F6E",
    "csvMarkdownExport.export": "\u5BFC\u51FA",
    "defaults.newDatabase": "\u65B0\u6570\u636E\u5E93",
    "defaults.nameColumn": "\u540D\u79F0",
    "formula.title": "\u7F16\u8F91\u516C\u5F0F\uFF1A{name}",
    "formula.subtitle": "\u8BA1\u7B97\u5B57\u6BB5 \xB7 \u5C5E\u6027 key: {key}",
    "formula.resultType": "\u7ED3\u679C\u7C7B\u578B",
    "formula.storage.displayOnly": "\u865A\u62DF\u5C5E\u6027 key\uFF1A{key}",
    "formula.storage.savedProperty": "\u4FDD\u5B58\u5230\u7B14\u8BB0\u5C5E\u6027 key\uFF1A{key}",
    "formula.storage.displayOnlyNote": "\u8FD9\u4E2A\u516C\u5F0F\u53EA\u5728\u6570\u636E\u5E93\u4E2D\u663E\u793A\uFF0C\u4E0D\u4F1A\u51FA\u73B0\u5728\u7B14\u8BB0\u5C5E\u6027\u91CC\u3002",
    "formula.storage.manualNote": "\u9700\u8981\u628A\u8FD9\u4E2A\u503C\u5199\u5165\u7B14\u8BB0\u5C5E\u6027\u65F6\uFF0C\u8BF7\u70B9\u51FB\u201C\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C\u201D\u3002",
    "formula.storage.automaticNote": "\u8FD9\u4E2A\u503C\u53EF\u4EE5\u81EA\u52A8\u4FDD\u5B58\u5230\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7B14\u8BB0\u7684\u5C5E\u6027\u4E2D\u3002",
    "formula.typeNumber": "\u6570\u5B57",
    "formula.typeText": "\u6587\u672C",
    "formula.typeDate": "\u65E5\u671F",
    "formula.typeDatetime": "\u65E5\u671F\u548C\u65F6\u95F4",
    "formula.resultTypeDatetime": "\u7ED3\u679C\u7C7B\u578B\u4E3A\u65E5\u671F\u548C\u65F6\u95F4\uFF0C\u4F46\u5F53\u524D\u7ED3\u679C\u4E0D\u662F\u65E5\u671F\u65F6\u95F4\u5B57\u7B26\u4E32",
    "formula.fn.HOUR.desc": "\u8FD4\u56DE\u65E5\u671F\u65F6\u95F4\u7684\u5C0F\u65F6\uFF080-23\uFF09\u3002",
    "formula.fn.MINUTE.desc": "\u8FD4\u56DE\u65E5\u671F\u65F6\u95F4\u7684\u5206\u949F\uFF080-59\uFF09\u3002",
    "formula.fn.SECOND.desc": "\u8FD4\u56DE\u65E5\u671F\u65F6\u95F4\u7684\u79D2\u6570\uFF080-59\uFF09\u3002",
    "formula.fn.TIME.desc": "\u6839\u636E\u65F6\u3001\u5206\u3001\u79D2\u6784\u9020 HH:mm:ss \u65F6\u95F4\u5B57\u7B26\u4E32\u3002",
    "formula.ex.dateTime.name": "\u6309\u5C0F\u65F6\u504F\u79FB\u65E5\u671F\u65F6\u95F4",
    "formula.ex.dateTime.desc": "\u7ED9\u65E5\u671F\u65F6\u95F4\u589E\u52A0\u5C0F\u65F6\uFF0C\u4FDD\u7559\u65F6\u95F4\u90E8\u5206\u3002",
    "formula.typeCheckbox": "\u590D\u9009\u6846",
    "formula.sectionTitle": "\u516C\u5F0F",
    "formula.referenceNote": "\u5F15\u7528\u5B57\u6BB5\uFF1A\u8F93\u5165 [\uFF0C\u6309\u5217\u6807\u9898\u641C\u7D22\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u63D2\u5165\u516C\u5F0F\u5F15\u7528\u3002",
    "formula.referenceNoteAdvanced": "\u4F8B\u5982\uFF1A\u5217\u6807\u9898\u201C\u5355\u4EF7\u201D \u2192 \u516C\u5F0F\u5F15\u7528 [price]\u3002\u88F8\u5199 price \u53EA\u662F\u5C5E\u6027\u952E\u7684\u517C\u5BB9\u7B80\u5199\uFF0C\u4E0D\u80FD\u88F8\u5199\u5217\u6807\u9898\u3002",
    "formula.referenceNoteBase": "\u5F15\u7528\u5B57\u6BB5\uFF1A\u8F93\u5165 [\uFF0C\u6309\u5217\u6807\u9898\u641C\u7D22\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u63D2\u5165\u5BF9\u5E94\u7684 Bases \u516C\u5F0F\u5F15\u7528\u3002",
    "formula.referenceNoteBaseAdvanced": "\u4F8B\u5982\uFF1A\u5217\u6807\u9898\u201C\u5355\u4EF7\u201D \u2192 note.price\uFF1B\u8BA1\u7B97\u5B57\u6BB5\u4F7F\u7528 formula.total\u3002\u4E0D\u80FD\u88F8\u5199\u5217\u6807\u9898\u3002",
    "formula.previewItem": "\u9884\u89C8\u6761\u76EE",
    "formula.noPreviewItems": "\u6CA1\u6709\u53EF\u9884\u89C8\u7684\u6761\u76EE",
    "formula.calcResult": "\u8BA1\u7B97\u7ED3\u679C",
    "formula.notCalculated": "\u672A\u8BA1\u7B97",
    "formula.waitingForFormula": "\u6B63\u5728\u7B49\u5F85\u516C\u5F0F",
    "formula.enterFormula": "\u8BF7\u8F93\u5165\u516C\u5F0F",
    "formula.noPreviewSaveFirst": "\u6CA1\u6709\u9884\u89C8\u6761\u76EE\uFF0C\u4FDD\u5B58\u540E\u4F1A\u5728\u6570\u636E\u5E93\u4E2D\u8BA1\u7B97",
    "formula.valid": "\u516C\u5F0F\u6709\u6548",
    "formula.noPreview": "\u65E0\u9884\u89C8",
    "formula.fieldNotExist": "\u5B57\u6BB5\u4E0D\u5B58\u5728\uFF1A{name}",
    "formula.undefinedVariable": "\u672A\u5B9A\u4E49\u7684\u53D8\u91CF\u6216\u5B57\u6BB5\uFF1A{name}\u3002\u8BF7\u8F93\u5165 [\uFF0C\u6309\u5217\u6807\u9898\u641C\u7D22\u5E76\u63D2\u5165\u516C\u5F0F\u5F15\u7528\u3002",
    "formula.columnTitleAsVariable": "\u201C{label}\u201D\u662F\u5217\u6807\u9898\uFF0C\u4E0D\u80FD\u4F5C\u4E3A\u88F8\u53D8\u91CF\u4F7F\u7528\u3002\u8BF7\u6539\u7528\u516C\u5F0F\u5F15\u7528 [{key}]\u3002",
    "formula.divisionByZero": "\u9664\u96F6\u9519\u8BEF\uFF1A\u7ED3\u679C\u4E3A\u65E0\u7A77\u5927\uFF0C\u8BF7\u7528 IFERROR \u5904\u7406",
    "formula.resultNaN": "\u8BA1\u7B97\u7ED3\u679C\u4E0D\u662F\u6709\u6548\u6570\u5B57\uFF08NaN\uFF09\u3002\u5F15\u7528\u5B57\u6BB5\u53EF\u80FD\u4E3A\u7A7A\u6216\u4E0D\u662F\u6570\u5B57\uFF0C\u8BF7\u4F7F\u7528 IFERROR([a] / [b], 0) \u63D0\u4F9B\u56DE\u9000\u503C\u3002",
    "formula.resultTypeMismatch": "\u7ED3\u679C\u7C7B\u578B\u4E3A\u6570\u5B57\uFF0C\u4F46\u5F53\u524D\u7ED3\u679C\u4E0D\u662F\u6570\u5B57",
    "formula.resultTypeDate": "\u7ED3\u679C\u7C7B\u578B\u4E3A\u65E5\u671F\uFF0C\u4F46\u5F53\u524D\u7ED3\u679C\u4E0D\u662F\u65E5\u671F",
    "formula.resultTypeCheckbox": "\u7ED3\u679C\u7C7B\u578B\u4E3A\u590D\u9009\u6846\uFF0C\u4F46\u5F53\u524D\u7ED3\u679C\u4E0D\u662F true \u6216 false",
    "formula.save": "\u4FDD\u5B58\u516C\u5F0F",
    "formula.notModified": "\u672A\u4FEE\u6539",
    "formula.invalid": "\u516C\u5F0F\u65E0\u6548",
    "formula.fieldsAndFunctions": "\u5B57\u6BB5\u4E0E\u51FD\u6570",
    "formula.searchPlaceholder": "\u641C\u7D22\u51FD\u6570\u6216\u5B57\u6BB5...",
    "formula.noMatch": "\u6CA1\u6709\u5339\u914D\u7684\u5B57\u6BB5\u6216\u51FD\u6570",
    "formula.noMatchHint": "\u6362\u4E00\u4E2A\u5173\u952E\u8BCD\uFF0C\u6216\u5148\u5728\u6570\u636E\u5E93\u4E2D\u6DFB\u52A0\u5B57\u6BB5\u3002",
    "formula.insertField": "\u63D2\u5165\u516C\u5F0F\u5F15\u7528 {reference}",
    "formula.fieldHint": "\u516C\u5F0F\u5F15\u7528\u4F7F\u7528\u5C5E\u6027\u952E\uFF1B\u4FEE\u6539\u5C5E\u6027\u952E\u65F6\uFF0C\u63D2\u4EF6\u4F1A\u5C3D\u91CF\u540C\u6B65\u66F4\u65B0\u65B9\u62EC\u53F7\u5F15\u7528\u3002",
    "formula.columnTitle": "\u5217\u6807\u9898",
    "formula.formulaReference": "\u516C\u5F0F\u5F15\u7528",
    "formula.referenceShort": "\u5F15\u7528",
    "formula.availableOptions": "\u53EF\u9009\u9879",
    "formula.noOptions": "\u5F53\u524D\u6570\u636E\u5E93\u4E2D\u6CA1\u6709\u627E\u5230\u53EF\u9009\u9879\u3002",
    "formula.fileTagsHint": "file.tags \u6765\u81EA Obsidian \u6807\u7B7E\u548C frontmatter tags\u3002\u5B83\u5728\u516C\u5F0F\u4E2D\u662F\u6807\u7B7E\u5217\u8868\uFF0C\u4E0D\u4F7F\u7528\u6570\u636E\u5E93\u9009\u9879\u989C\u8272\u3002",
    "formula.syntaxHint": "\u516C\u5F0F\u8BED\u6CD5\u57FA\u4E8E JavaScript \u8868\u8FBE\u5F0F\uFF1A\u76F8\u7B49\u6BD4\u8F83\u4F7F\u7528 ===\uFF0C\u6587\u672C\u4F7F\u7528\u5F15\u53F7\uFF0C\u516C\u5F0F\u53EF\u4EE5\u7528 = \u5F00\u5934\u3002",
    "formula.typeCoercionHint": "\u7ED3\u679C\u7C7B\u578B\u7528\u4E8E\u6821\u9A8C\u548C\u663E\u793A\uFF0C\u4E0D\u9650\u5236\u8BE5\u5B57\u6BB5\u7EE7\u7EED\u53C2\u4E0E\u540E\u7EED\u8BA1\u7B97\u3002",
    "formula.ifErrorFallbackHint": '\u7ED3\u679C\u53EF\u80FD\u4E3A ERROR \u6216 NaN \u65F6\uFF0C\u53EF\u4F7F\u7528 IFERROR(\u8868\u8FBE\u5F0F, "")\uFF0C\u5728\u6CA1\u6709\u6709\u6548\u7ED3\u679C\u65F6\u76F4\u63A5\u7559\u7A7A\u3002',
    "formula.fieldValues": "\u5B57\u6BB5\u53D6\u503C",
    "formula.noReferencedFields": "\u5F53\u524D\u516C\u5F0F\u6CA1\u6709\u9700\u8981\u4EE3\u5165\u7684\u5B57\u6BB5\u503C\u3002",
    "formula.substitutedFormula": "\u4EE3\u5165\u540E\u516C\u5F0F",
    "formula.emptyValue": "\u7A7A",
    "formula.enterToSeeSteps": "\u8F93\u5165\u516C\u5F0F\u540E\u4F1A\u663E\u793A\u4EE3\u5165\u540E\u516C\u5F0F\u548C\u5B57\u6BB5\u53D6\u503C\u3002",
    "formula.noPreviewForSteps": "\u6CA1\u6709\u53EF\u7528\u4E8E\u516C\u5F0F\u4EE3\u5165\u7684\u9884\u89C8\u6761\u76EE\u3002",
    "formula.catFields": "\u5B57\u6BB5",
    "formula.catExamples": "\u793A\u4F8B",
    "formula.catLogic": "\u903B\u8F91",
    "formula.catMath": "\u6570\u5B66",
    "formula.catText": "\u6587\u672C",
    "formula.catDate": "\u65E5\u671F",
    "formula.catStats": "\u7EDF\u8BA1",
    "formula.fn.IF.desc": "\u6309\u6761\u4EF6\u8FD4\u56DE\u4E24\u4E2A\u503C\u4E4B\u4E00\u3002\u6761\u4EF6\u8868\u8FBE\u5F0F\u4F7F\u7528 JavaScript \u6BD4\u8F83\u7B26\uFF0C\u4F8B\u5982 ===\u3001!==\u3001>\u3001<\u3002",
    "formula.fn.IFERROR.desc": "\u5F53\u7ED3\u679C\u4E3A\u7A7A\u3001NaN \u6216 Infinity \u65F6\u8FD4\u56DE\u5907\u7528\u503C\u3002",
    "formula.fn.DAYS.desc": "\u8BA1\u7B97\u4E24\u4E2A\u65E5\u671F\u4E4B\u95F4\u7684\u5929\u6570\uFF0C\u8FD4\u56DE end_date - start_date\u3002",
    "formula.fn.ADDDAYS.desc": "\u5728\u65E5\u671F\u4E0A\u589E\u52A0\u6307\u5B9A\u5929\u6570\uFF0C\u8FD4\u56DE YYYY-MM-DD\u3002",
    "formula.fn.TEXT.desc": "\u628A\u6570\u5B57\u6216\u65E5\u671F\u683C\u5F0F\u5316\u4E3A\u6587\u672C\uFF08\u652F\u6301 0.00\u3001#,##0.00\u30010%\uFF09\u3002",
    "formula.fn.ROUND.desc": "\u6309\u6307\u5B9A\u4F4D\u6570\u56DB\u820D\u4E94\u5165\u3002",
    "formula.fn.AND.desc": "\u6240\u6709\u6761\u4EF6\u90FD\u4E3A\u771F\u65F6\u8FD4\u56DE true\u3002",
    "formula.fn.OR.desc": "\u4EFB\u610F\u6761\u4EF6\u4E3A\u771F\u65F6\u8FD4\u56DE true\u3002",
    "formula.fn.SUM.desc": "\u5BF9\u591A\u4E2A\u6570\u5B57\u6C42\u548C\u3002",
    "formula.fn.AVERAGE.desc": "\u8BA1\u7B97\u5E73\u5747\u503C\u3002",
    "formula.fn.MIN.desc": "\u8FD4\u56DE\u6700\u5C0F\u503C\u3002",
    "formula.fn.MAX.desc": "\u8FD4\u56DE\u6700\u5927\u503C\u3002",
    "formula.fn.ABS.desc": "\u8FD4\u56DE\u7EDD\u5BF9\u503C\u3002",
    "formula.fn.MOD.desc": "\u8FD4\u56DE\u4F59\u6570\uFF0C\u5E76\u6B63\u786E\u5904\u7406\u8D1F\u6570\u3002",
    "formula.fn.POWER.desc": "\u8FD4\u56DE number \u7684 power \u6B21\u65B9\u3002",
    "formula.fn.ROUNDUP.desc": "\u6309\u6307\u5B9A\u4F4D\u6570\u5411\u4E0A\u53D6\u6574\u3002",
    "formula.fn.ROUNDDOWN.desc": "\u6309\u6307\u5B9A\u4F4D\u6570\u5411\u4E0B\u53D6\u6574\u3002",
    "formula.fn.CONCAT.desc": "\u62FC\u63A5\u6587\u672C\u3002",
    "formula.fn.TEXTJOIN.desc": "\u7528\u5206\u9694\u7B26\u62FC\u63A5\u591A\u4E2A\u6587\u672C\u3002",
    "formula.fn.LEN.desc": "\u8FD4\u56DE\u6587\u672C\u957F\u5EA6\u3002",
    "formula.fn.LEFT.desc": "\u4ECE\u5DE6\u4FA7\u622A\u53D6\u6587\u672C\u3002",
    "formula.fn.RIGHT.desc": "\u4ECE\u53F3\u4FA7\u622A\u53D6\u6587\u672C\u3002",
    "formula.fn.MID.desc": "\u4ECE\u6307\u5B9A\u4F4D\u7F6E\u622A\u53D6\u6587\u672C\u3002",
    "formula.fn.TRIM.desc": "\u53BB\u9664\u9996\u5C3E\u7A7A\u683C\u3002",
    "formula.fn.UPPER.desc": "\u8F6C\u6362\u4E3A\u5927\u5199\u3002",
    "formula.fn.LOWER.desc": "\u8F6C\u6362\u4E3A\u5C0F\u5199\u3002",
    "formula.fn.CONTAINS.desc": "\u5224\u65AD\u6587\u672C\u662F\u5426\u5305\u542B\u5173\u952E\u8BCD\u3002",
    "formula.fn.TODAY.desc": "\u8FD4\u56DE\u4ECA\u5929\u65E5\u671F\u3002",
    "formula.fn.NOW.desc": "\u8FD4\u56DE\u5F53\u524D\u65E5\u671F\u548C\u65F6\u95F4\u3002",
    "formula.fn.YEAR.desc": "\u8FD4\u56DE\u5E74\u4EFD\u3002",
    "formula.fn.MONTH.desc": "\u8FD4\u56DE\u6708\u4EFD\u3002",
    "formula.fn.DATE.desc": "\u6839\u636E\u5E74\u6708\u65E5\u6784\u9020\u65E5\u671F\uFF0C\u8FD4\u56DE YYYY-MM-DD\u3002",
    "formula.fn.EOMONTH.desc": "\u8FD4\u56DE\u6307\u5B9A\u6708\u4EFD\u504F\u79FB\u540E\u7684\u6708\u672B\u65E5\u671F\u3002",
    "formula.fn.DATEADD.desc": "\u6309 days/weeks/months/years \u589E\u52A0\u65E5\u671F\u3002",
    "formula.fn.WEEKDAY.desc": "\u8FD4\u56DE\u661F\u671F\u3002\u9ED8\u8BA4 0=\u5468\u65E5..6=\u5468\u516D\uFF1B\u4F20 return_type\uFF081/2/3\uFF09\u6309 Excel \u7F16\u53F7\u3002",
    "formula.fn.WEEKNUM.desc": "\u8FD4\u56DE ISO \u5468\u6570\u3002",
    "formula.fn.NETWORKDAYS.desc": "\u8FD4\u56DE\u4E24\u65E5\u671F\u4E4B\u95F4\u7684\u5DE5\u4F5C\u65E5\u6570\uFF08\u5468\u4E00\u5230\u5468\u4E94\uFF0C\u542B\u9996\u5C3E\uFF09\uFF1B\u53EF\u9009\u5047\u65E5\u53C2\u6570\u6392\u9664\u3002",
    "formula.fn.COUNT.desc": "\u7EDF\u8BA1\u6570\u5B57\u503C\u6570\u91CF\u3002",
    "formula.fn.COUNTA.desc": "\u7EDF\u8BA1\u975E\u7A7A\u503C\u6570\u91CF\u3002",
    "formula.fn.COUNTIF.desc": "\u7EDF\u8BA1\u7B26\u5408\u6761\u4EF6\u7684\u503C\u3002\u5F53\u524D\u652F\u6301\u5355\u503C\u6216\u6570\u7EC4\u3002",
    "formula.fn.IFS.desc": '\u8FD4\u56DE\u7B2C\u4E00\u4E2A\u4E3A\u771F\u7684\u6761\u4EF6\u5BF9\u5E94\u7684\u503C\uFF0C\u6216\u8FD4\u56DE\u6700\u540E\u7684\u5907\u7528\u503C\u3002\u5F53\u5206\u652F\u53EF\u80FD\u5931\u8D25\u4E14\u53C2\u6570\u4F1A\u7ACB\u5373\u6C42\u503C\u65F6\uFF0C\u53EF\u4F7F\u7528 field("x")\u3001IFERROR \u6216 ?:\u3002',
    "formula.fn.SWITCH.desc": "\u8FD4\u56DE\u7B2C\u4E00\u4E2A\u5339\u914D\u8868\u8FBE\u5F0F\u5BF9\u5E94\u7684\u503C\uFF0C\u6216\u8FD4\u56DE\u6700\u540E\u7684\u5907\u7528\u503C\u3002",
    "formula.fn.SQRT.desc": "\u8FD4\u56DE\u4E00\u4E2A\u6570\u5B57\u7684\u5E73\u65B9\u6839\u3002",
    "formula.fn.LN.desc": "\u8FD4\u56DE\u4E00\u4E2A\u6570\u5B57\u7684\u81EA\u7136\u5BF9\u6570\u3002",
    "formula.fn.LOG.desc": "\u8FD4\u56DE\u4EE5 10 \u4E3A\u5E95\u7684\u5BF9\u6570\uFF0C\u4E5F\u53EF\u6307\u5B9A\u53EF\u9009\u5E95\u6570\u3002",
    "formula.fn.LOG10.desc": "\u8FD4\u56DE\u4E00\u4E2A\u6570\u5B57\u7684\u4EE5 10 \u4E3A\u5E95\u7684\u5BF9\u6570\u3002",
    "formula.fn.EXP.desc": "\u8FD4\u56DE e \u7684\u6307\u5B9A\u6B21\u5E42\u3002",
    "formula.fn.CBRT.desc": "\u8FD4\u56DE\u4E00\u4E2A\u6570\u5B57\u7684\u7ACB\u65B9\u6839\u3002",
    "formula.fn.LET.desc": "\u5C06\u4E00\u4E2A\u503C\u7ED1\u5B9A\u5230\u5E26\u5F15\u53F7\u7684\u53D8\u91CF\u540D\uFF0C\u5E76\u4F7F\u7528\u8BE5\u53D8\u91CF\u8BA1\u7B97\u7ED3\u679C\u8868\u8FBE\u5F0F\u3002",
    "formula.fn.LETS.desc": "\u6309\u987A\u5E8F\u7ED1\u5B9A\u591A\u4E2A\u5E26\u5F15\u53F7\u7684\u53D8\u91CF\u540D\u548C\u503C\uFF0C\u7136\u540E\u8BA1\u7B97\u7ED3\u679C\u8868\u8FBE\u5F0F\u3002",
    "formula.ex.conditional.name": "\u6761\u4EF6\u5224\u65AD",
    "formula.ex.conditional.desc": "\u6309\u5B57\u6BB5\u503C\u8FD4\u56DE\u4E0D\u540C\u7ED3\u679C\u3002",
    "formula.ex.dateDiff.name": "\u65E5\u671F\u5DEE",
    "formula.ex.dateDiff.desc": "\u8BA1\u7B97\u4E24\u4E2A\u65E5\u671F\u4E4B\u95F4\u76F8\u5DEE\u591A\u5C11\u5929\u3002",
    "formula.ex.errorFallback.name": "\u7A7A\u503C\u515C\u5E95",
    "formula.ex.errorFallback.desc": "\u8BA1\u7B97\u5931\u8D25\u6216\u7ED3\u679C\u4E3A\u7A7A\u65F6\u8FD4\u56DE 0\u3002",
    "formula.ex.rounding.name": "\u6570\u5B57\u56DB\u820D\u4E94\u5165",
    "formula.ex.rounding.desc": "\u628A\u6570\u5B57\u7ED3\u679C\u63A7\u5236\u5230\u4E24\u4F4D\u5C0F\u6570\u3002",
    "formula.ex.nestedIf.name": "\u5D4C\u5957 IF\uFF08\u8BC4\u7EA7\uFF09",
    "formula.ex.nestedIf.desc": "\u7528\u5D4C\u5957 IF \u6761\u4EF6\u5C06\u5206\u6570\u5206\u4E3A\u4E0D\u540C\u7B49\u7EA7\u3002",
    "formula.ex.daysFromNow.name": "\u8DDD\u4ECA\u5929\u6570",
    "formula.ex.daysFromNow.desc": "\u8BA1\u7B97\u8DDD\u79BB\u67D0\u65E5\u671F\u8FD8\u6709\u591A\u5C11\u5929\uFF08\u5DF2\u8FC7\u671F\u4E3A\u8D1F\u6570\uFF09\u3002",
    "formula.ex.concat.name": "\u62FC\u63A5\u6587\u672C",
    "formula.ex.concat.desc": "\u5C06\u591A\u4E2A\u5B57\u6BB5\u548C\u56FA\u5B9A\u6587\u672C\u5408\u5E76\u4E3A\u4E00\u4E2A\u5B57\u7B26\u4E32\u3002",
    "formula.ex.dateAdd.name": "\u65E5\u671F\u52A0\u51CF",
    "formula.ex.dateAdd.desc": "\u7ED9\u65E5\u671F\u52A0\u6708/\u5929\u5F97\u5230\u65B0\u65E5\u671F\u3002",
    "formula.ex.textFormat.name": "\u683C\u5F0F\u5316\u6570\u5B57",
    "formula.ex.textFormat.desc": "\u7528\u9017\u53F7\u5206\u9694\u548C\u56FA\u5B9A\u5C0F\u6570\u4F4D\u683C\u5F0F\u5316\u6570\u5B57\u3002",
    "formula.ex.yearMonth.name": "\u63D0\u53D6\u5E74\u6708",
    "formula.ex.yearMonth.desc": "\u4ECE\u65E5\u671F\u4E2D\u63D0\u53D6\u5E74\u6708\u4FE1\u606F\u8F93\u51FA\u4E3A YYYY-MM \u6587\u672C\u3002",
    "formula.error.empty": "\u516C\u5F0F\u4E0D\u80FD\u4E3A\u7A7A",
    "formula.error.undefinedVar": "\u5B58\u5728\u672A\u5B9A\u4E49\u5B57\u6BB5\u6216\u53D8\u91CF\uFF1A{name}",
    "formula.error.incomplete": "\u516C\u5F0F\u8BED\u6CD5\u4E0D\u5B8C\u6574\u6216\u4E0D\u7B26\u5408 JavaScript \u8868\u8FBE\u5F0F",
    "formula.error.unexpectedEnd": "\u516C\u5F0F\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u68C0\u67E5\u62EC\u53F7\u6216\u8FD0\u7B97\u7B26\u662F\u5426\u914D\u5BF9",
    "formula.error.unexpectedToken": "\u516C\u5F0F\u8BED\u6CD5\u9519\u8BEF\uFF1A{message}",
    "formula.error.letArgCount": "let/lets \u9700\u8981\u6210\u5BF9\u7684\u540D\u79F0\u548C\u503C\uFF0C\u5E76\u5305\u542B\u7ED3\u679C\u8868\u8FBE\u5F0F\u3002",
    "formula.error.letName": "let/lets \u53D8\u91CF\u540D\u5FC5\u987B\u662F\u5E26\u5F15\u53F7\u7684\u6807\u8BC6\u7B26\u3002",
    "formula.error.notFunction": '"{name}" \u4E0D\u662F\u51FD\u6570\uFF0C\u8BF7\u68C0\u67E5\u62FC\u5199\u6216\u662F\u5426\u8BEF\u7528\u5B57\u6BB5\u540D',
    "formula.error.nullProperty": "\u65E0\u6CD5\u8BFB\u53D6 null/undefined \u503C\u7684\u5C5E\u6027\uFF0C\u8BF7\u7528 IFERROR \u5904\u7406\u7A7A\u503C",
    "formula.error.notIterable": "\u53C2\u6570\u7C7B\u578B\u9519\u8BEF\uFF1A\u671F\u671B\u6570\u7EC4\u6216\u53EF\u8FED\u4EE3\u5BF9\u8C61",
    "formula.error.typeError": "\u7C7B\u578B\u9519\u8BEF\uFF1A{message}",
    "formula.error.invalidDate": "\u65E5\u671F\u683C\u5F0F\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u65E5\u671F\u5B57\u6BB5\u503C",
    "formula.error.rangeError": "\u6570\u503C\u8303\u56F4\u9519\u8BEF\uFF1A{message}",
    "formula.error.generic": "\u8BA1\u7B97\u5931\u8D25\uFF1A{message}",
    "formula.error.genericShort": "\u8BA1\u7B97\u5931\u8D25",
    "formula.error.dangerousToken": "\u516C\u5F0F\u5305\u542B\u7981\u6B62\u7684\u5173\u952E\u5B57\uFF1A{token}",
    "formula.error.noFunction": "\u516C\u5F0F\u4E2D\u4E0D\u5141\u8BB8\u5B9A\u4E49\u51FD\u6570",
    "formula.error.noArrowFunction": "\u516C\u5F0F\u4E2D\u4E0D\u5141\u8BB8\u4F7F\u7528\u7BAD\u5934\u51FD\u6570",
    "formula.copyAiPrompt": "\u590D\u5236 AI \u63D0\u793A\u8BCD",
    "formula.confirmDiscard": "\u6709\u672A\u4FDD\u5B58\u7684\u66F4\u6539\uFF0C\u786E\u5B9A\u653E\u5F03\u5417\uFF1F",
    "formula.discard": "\u653E\u5F03",
    "cell.doubleClickRename": "\u53CC\u51FB\u91CD\u547D\u540D",
    "cell.doubleClickEdit": "\u53CC\u51FB\u7F16\u8F91",
    "cell.clickToEdit": "\u70B9\u51FB\u7F16\u8F91",
    "cell.doubleClickEditFormula": "\u53CC\u51FB\u7F16\u8F91\u516C\u5F0F",
    "cell.doubleClickConfigureRollup": "\u53CC\u51FB\u914D\u7F6E\u6C47\u603B",
    "cell.noOptions": "\u6CA1\u6709\u53EF\u9009\u9879",
    "cell.addOption": "\u65B0\u589E\u9009\u9879",
    "cell.optionExists": "\u9009\u9879\u300C{name}\u300D\u5DF2\u5B58\u5728",
    "cell.clear": "\u6E05\u7A7A",
    "cell.dragFill": "\u62D6\u62FD\u586B\u5145",
    "cell.invalidDate": "\u65E5\u671F\u65E0\u6548\uFF0C\u5DF2\u81EA\u52A8\u4FEE\u6B63",
    "errors.updateFailed": "\u66F4\u65B0\u5931\u8D25: {error}",
    "errors.renameFailed": "\u91CD\u547D\u540D\u5931\u8D25: {error}",
    "errors.fileExists": "\u6587\u4EF6\u300C{name}.md\u300D\u5DF2\u5B58\u5728\uFF0C\u65E0\u6CD5\u91CD\u547D\u540D",
    "errors.renderError": "\u6E32\u67D3\u51FA\u9519: {message}",
    "errors.noStack": "\u65E0\u5806\u6808\u4FE1\u606F",
    "errors.viewConfigEmpty": "\u89C6\u56FE\u914D\u7F6E\u4E3A\u7A7A",
    "errors.currentDb": '\u5F53\u524D\u6570\u636E\u5E93: "{name}"',
    "errors.databaseViewNotFound": "\u672A\u627E\u5230\u6570\u636E\u5E93\u89C6\u56FE\u3002\u8BF7\u4F7F\u7528 dbPath/databasePath \u6216 dbId/databaseId \u6307\u5B9A\u6570\u636E\u5E93\uFF0C\u53EF\u9009 viewId \u6307\u5B9A\u89C6\u56FE\u3002",
    "errors.noColumns": "\u6CA1\u6709\u914D\u7F6E\u5217\u3002\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A\u5C5E\u6027\u5217\u3002",
    "errors.dataReadFailed": "\u8BFB\u53D6\u6570\u636E\u5931\u8D25: {error}",
    "errors.noDataExport": "\u6CA1\u6709\u6570\u636E\u53EF\u5BFC\u51FA",
    "errors.noVisibleColumns": "\u6CA1\u6709\u53EF\u89C1\u5217\u53EF\u5BFC\u51FA",
    "errors.clipboardFailed": "\u590D\u5236\u5230\u526A\u8D34\u677F\u5931\u8D25",
    "errors.copyFailed": "\u590D\u5236\u5931\u8D25: {error}",
    "errors.readFolderFailed": "\u8BFB\u53D6\u6587\u4EF6\u5939\u5931\u8D25: {error}",
    "errors.deleteFailed": "\u5220\u9664\u5931\u8D25: {error}",
    "errors.saveViewConfigFailed": "\u4FDD\u5B58\u89C6\u56FE\u914D\u7F6E\u5931\u8D25: {error}",
    "errors.batchFillFailed": "\u6279\u91CF\u586B\u5145\u5931\u8D25: {error}",
    "errors.createFailed": "\u65B0\u589E\u5931\u8D25: {error}",
    "errors.unsupportedBaseFilters": "\u6B64 .base \u6587\u4EF6\u4F7F\u7528\u4E86 Note Database \u65E0\u6CD5\u5728\u4E0D\u6539\u53D8\u542B\u4E49\u7684\u524D\u63D0\u4E0B\u8F6C\u6362\u7684\u5168\u5C40\u7B5B\u9009\u8868\u8FBE\u5F0F\u3002",
    "notice.createdDbFile": "\u5DF2\u521B\u5EFA\u6570\u636E\u5E93\u6587\u4EF6: {path}",
    "notice.copiedDbFile": "\u5DF2\u590D\u5236\u6570\u636E\u5E93\u6587\u4EF6: {path}",
    "notice.copiedDatabase": "\u5DF2\u590D\u5236\u6570\u636E\u5E93: {name}",
    "notice.databasesMigrated": "\u5DF2\u8FC1\u79FB {count} \u4E2A\u6570\u636E\u5E93\u5230\u6587\u4EF6",
    "notice.copiedView": "\u5DF2\u590D\u5236\u89C6\u56FE: {name}",
    "notice.copiedEmbedCode": "\u5DF2\u590D\u5236\u8BE5\u89C6\u56FE\u7684\u5D4C\u5165\u4EE3\u7801",
    "notice.copiedExport": "\u5DF2\u590D\u5236 {format} \u5230\u526A\u8D34\u677F\uFF08{count} \u884C\uFF09",
    "notice.syncedFormulas": "\u5DF2\u5C06\u8BA1\u7B97\u7ED3\u679C\u4FDD\u5B58\u5230 {count} \u6761\u7B14\u8BB0",
    "notice.clearedComputedFrontmatter": "\u5DF2\u4ECE {count} \u6761\u7B14\u8BB0\u4E2D\u79FB\u9664\u201C{key}\u201D",
    "notice.filledCells": "\u5DF2\u586B\u5145 {count} \u4E2A\u5355\u5143\u683C",
    "notice.filledCellsSkipped": "\u5DF2\u586B\u5145 {count} \u4E2A\u5355\u5143\u683C\uFF0C\u8DF3\u8FC7 {skipped} \u4E2A\u4E0D\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.copiedCells": "\u5DF2\u590D\u5236 {count} \u4E2A\u5355\u5143\u683C",
    "notice.cutCells": "\u5DF2\u526A\u5207 {count} \u4E2A\u5355\u5143\u683C\uFF0C\u7C98\u8D34\u540E\u5C06\u79FB\u52A8\u6570\u636E",
    "notice.cutSourceChanged": "\u526A\u5207\u6765\u6E90\u5DF2\u7ECF\u53D8\u5316\uFF0C\u56E0\u6B64\u6CA1\u6709\u6E05\u7A7A\u6765\u6E90\u5355\u5143\u683C\u3002",
    "notice.pastedCells": "\u5DF2\u7C98\u8D34 {count} \u4E2A\u5355\u5143\u683C",
    "notice.pastedCellsSkipped": "\u5DF2\u7C98\u8D34 {count} \u4E2A\u5355\u5143\u683C\uFF0C\u8DF3\u8FC7 {skipped} \u4E2A\u4E0D\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.pastedCellsCreatedRows": "\u5DF2\u7C98\u8D34 {count} \u4E2A\u5355\u5143\u683C\u5E76\u521B\u5EFA {rows} \u6761\u8BB0\u5F55",
    "notice.pastedCellsCreatedRowsSkipped": "\u5DF2\u7C98\u8D34 {count} \u4E2A\u5355\u5143\u683C\u5E76\u521B\u5EFA {rows} \u6761\u8BB0\u5F55\uFF0C\u8DF3\u8FC7 {skipped} \u4E2A\u4E0D\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.createdRowsRuleRisk": "\u6709 {count} \u6761\u65B0\u8BB0\u5F55\u53EF\u80FD\u4E0D\u7B26\u5408\u5F53\u524D\u6765\u6E90\u89C4\u5219\u3002",
    "notice.clearedCells": "\u5DF2\u6E05\u7A7A {count} \u4E2A\u5355\u5143\u683C",
    "notice.clearedCellsSkipped": "\u5DF2\u6E05\u7A7A {count} \u4E2A\u5355\u5143\u683C\uFF0C\u8DF3\u8FC7 {skipped} \u4E2A\u4E0D\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.noEditableCells": "\u9009\u533A\u4E2D\u6CA1\u6709\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.noEditableCellsSkipped": "\u9009\u533A\u4E2D\u6CA1\u6709\u53EF\u7F16\u8F91\u5355\u5143\u683C\uFF0C\u5DF2\u8DF3\u8FC7 {skipped} \u4E2A\u4E0D\u53EF\u7F16\u8F91\u5355\u5143\u683C\u3002",
    "notice.nothingToUndo": "\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u64CD\u4F5C",
    "notice.nothingToRedo": "\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u64CD\u4F5C",
    "notice.undone": "\u5DF2\u64A4\u9500\uFF1A{action}",
    "notice.redone": "\u5DF2\u91CD\u505A\uFF1A{action}",
    "notice.createdRow": "\u5DF2\u65B0\u589E\u4E00\u884C: {name}",
    "notice.createdNote": "\u5DF2\u521B\u5EFA\u7B14\u8BB0\uFF1A{path}",
    "notice.createdNoteRuleRisk": "\u5DF2\u521B\u5EFA {path}\uFF0C\u5B83\u53EF\u80FD\u4E0D\u7B26\u5408\u5F53\u524D\u6765\u6E90\u89C4\u5219\uFF08{reasons}\uFF09\u3002",
    "createRuleRisk.unappliedRule": "\u90E8\u5206\u89C4\u5219\u65E0\u6CD5\u81EA\u52A8\u586B\u5145",
    "createRuleRisk.conflictOverride": "\u6765\u6E90\u89C4\u5219\u8986\u76D6\u4E86\u89C6\u56FE\u9ED8\u8BA4\u503C",
    "createRuleRisk.conflictSameField": "\u540C\u4E00\u5C5E\u6027\u5B58\u5728\u51B2\u7A81\u89C4\u5219",
    "createRuleRisk.folderConflict": "\u65B0\u8BB0\u5F55\u6587\u4EF6\u5939\u4E0E\u5FC5\u9009\u6587\u4EF6\u5939\u51B2\u7A81",
    "createRuleRisk.filenameSuffix": "\u540C\u540D\u6587\u4EF6\u5BFC\u81F4\u6587\u4EF6\u540D\u6539\u53D8",
    "createRuleRisk.filenameInvalid": "\u6587\u4EF6\u540D\u5305\u542B\u975E\u6CD5\u5B57\u7B26",
    "createRuleRisk.filenameNormalized": "\u6587\u4EF6\u540D\u88AB\u5F52\u4E00\u5316\u6539\u53D8",
    "createRuleRisk.filenameEmpty": "\u6587\u4EF6\u540D\u89C4\u5219\u4E3A\u7A7A",
    "createRuleRisk.unconstructable": "\u90E8\u5206\u89C4\u5219\u65E0\u6CD5\u6784\u9020",
    "createRuleRisk.readonlyFileField": "\u53EA\u8BFB\u6587\u4EF6\u5B57\u6BB5\u65E0\u6CD5\u8BBE\u7F6E",
    "notice.deletedRow": "\u5DF2\u5220\u9664: {name}",
    "notice.duplicatedRecord": "\u5DF2\u590D\u5236\u5230 {path}",
    "notice.selectGroupField": "\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A\u5206\u7EC4\u5C5E\u6027",
    "notice.viewLimit": "\u6700\u591A\u652F\u6301 15 \u4E2A\u89C6\u56FE",
    "notice.editInFullView": "\u8BF7\u5728\u5B8C\u6574\u6570\u636E\u5E93\u89C6\u56FE\u4E2D{action}",
    "notice.embedReadonly": "\u5D4C\u5165\u6570\u636E\u5E93\u4E3A\u53EA\u8BFB\u6A21\u5F0F\uFF0C\u8BF7\u5728\u5B8C\u6574\u6570\u636E\u5E93\u89C6\u56FE\u4E2D{action}",
    "notice.noDbCopyInfo": "\u672A\u627E\u5230\u53EF\u590D\u5236\u7684\u6570\u636E\u5E93\u5B9A\u4F4D\u4FE1\u606F",
    "confirm.deleteSelected": "\u786E\u5B9A\u5220\u9664\u9009\u4E2D\u7684 {count} \u4E2A\u6761\u76EE\uFF1F\n\n\u5BF9\u5E94 Markdown \u6587\u4EF6\u4F1A\u88AB\u79FB\u5230\u5E9F\u7EB8\u7BD3\u3002",
    "defaults.untitledNote": "\u672A\u547D\u540D",
    "defaults.viewCopy": "{name} \u526F\u672C",
    "defaults.dbCopy": "{name} \u526F\u672C",
    "empty.noDatabases": "\u8FD8\u6CA1\u6709\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "empty.createFirstDatabase": "\u521B\u5EFA\u81EA\u5DF1\u7684\u7B2C\u4E00\u4E2A Note Database",
    "empty.noColumnsDb": "\u6570\u636E\u5E93\u300C{name}\u300D\u6CA1\u6709\u914D\u7F6E\u5217\u3002\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A\u5C5E\u6027\u5217\u3002",
    "emptyState.starterPresets": "\u4ECE\u6A21\u677F\u5F00\u59CB",
    "emptyState.presetTasksTitle": "\u4EFB\u52A1",
    "emptyState.presetTasksDesc": "\u901A\u8FC7\u72B6\u6001\u3001\u4F18\u5148\u7EA7\u4E0E\u622A\u6B62\u65E5\u671F\u8DDF\u8E2A\u5DE5\u4F5C\u3002",
    "emptyState.presetProjectsTitle": "\u9879\u76EE",
    "emptyState.presetProjectsDesc": "\u96C6\u4E2D\u7BA1\u7406\u9879\u76EE\u3001\u8D1F\u8D23\u4EBA\u3001\u72B6\u6001\u548C\u76EE\u6807\u65E5\u671F\u3002",
    "emptyState.presetReadingListTitle": "\u9605\u8BFB\u6E05\u5355",
    "emptyState.presetReadingListDesc": "\u6309\u4F5C\u8005\u3001\u8FDB\u5EA6\u3001\u8BC4\u5206\u4E0E\u5206\u7C7B\u6574\u7406\u4E66\u7C4D\u3002",
    "emptyState.presetNotesTitle": "\u7B14\u8BB0",
    "emptyState.presetNotesDesc": "\u4F7F\u7528\u6807\u7B7E\u548C\u65F6\u95F4\u6233\u5EFA\u7ACB\u7B80\u5355\u7684\u4ED3\u5E93\u7D22\u5F15\u3002",
    "modal.editProperty": "\u7F16\u8F91\u5C5E\u6027 \u2014 {label}",
    "modal.propertyKey": "\u5C5E\u6027\u952E",
    "modal.propertyKeyHint": "\u666E\u901A\u5C5E\u6027\u4F1A\u4EE5\u6B64\u952E\u5B58\u5165\u7B14\u8BB0 YAML/frontmatter\uFF0C\u516C\u5F0F\u5F15\u7528\u4E5F\u4F7F\u7528\u8FD9\u4E2A\u952E\u3002",
    "modal.displayName": "\u5217\u6807\u9898",
    "modal.propertyType": "\u5C5E\u6027\u7C7B\u578B",
    "modal.createProperty": "\u65B0\u5EFA\u5C5E\u6027",
    "modal.frontmatterKey": "\u5C5E\u6027\u952E",
    "modal.rollupNeedsRelation": "\u8BF7\u5148\u521B\u5EFA\u5173\u8054\u5C5E\u6027",
    "modal.wrapContent": "\u6362\u884C\u663E\u793A\u5B8C\u6574\u5185\u5BB9",
    "modal.migrateValues": "\u540C\u65F6\u6539\u53D8 .md \u6587\u4EF6\u4E2D\u540C\u540D\u7684 frontmatter \u7684\u503C",
    "modal.migrateValuesDesc": "\u52FE\u9009\u540E\uFF1A\u6BCF\u6761 .md \u6587\u4EF6\u4E2D\uFF0C\u65E7\u5C5E\u6027\u7684\u503C\u4F1A\u8FC1\u79FB\u5230\u65B0\u5C5E\u6027\u540D\uFF0C\u5FC5\u8981\u65F6\u8986\u76D6\u5DF2\u6709\u503C\u3002\u4E0D\u52FE\u9009\u65F6\uFF1A\u65B0\u5C5E\u6027\u4FDD\u7559\u539F\u6709\u503C\u3002\u65E0\u8BBA\u662F\u5426\u52FE\u9009\uFF0C\u65E7\u5C5E\u6027\u540D\u5BF9\u5E94\u7684 frontmatter \u90FD\u4F1A\u88AB\u5220\u9664\uFF0CObsidian \u4E2D\u7684\u5C5E\u6027\u7C7B\u578B\u4E5F\u4F1A\u540C\u6B65\u66F4\u65B0\u4E3A\u5F53\u524D\u5217\u7684\u7C7B\u578B\u3002",
    "modal.migrateComputedDisabled": "\u8BA1\u7B97\u5B57\u6BB5\u7531\u516C\u5F0F\u52A8\u6001\u751F\u6210\uFF0C\u65E0\u9700\u4ECE frontmatter \u8FC1\u79FB\u5C5E\u6027\u503C\u3002",
    "modal.propertyKeyRequired": "\u5C5E\u6027\u952E\u4E0D\u80FD\u4E3A\u7A7A",
    "modal.propertyKeyExists": "\u5C5E\u6027\u952E\u300C{key}\u300D\u5DF2\u5B58\u5728",
    "modal.groupOrderTitle": "\u5206\u7EC4\u987A\u5E8F \u2014 {field}",
    "modal.groupOrderHint": "\u62D6\u62FD\u6216\u4F7F\u7528\u6309\u94AE\u8C03\u6574\u987A\u5E8F\u3002\u5C5E\u6027\u9009\u9879\u548C\u65B0\u51FA\u73B0\u7684\u5206\u7EC4\u4F1A\u81EA\u52A8\u8865\u9F50\u5230\u5217\u8868\u4E2D\u3002",
    "modal.resetToOptionOrder": "\u6309\u9009\u9879\u987A\u5E8F\u91CD\u7F6E",
    "modal.saveOrder": "\u4FDD\u5B58\u987A\u5E8F",
    "modal.statusOptions": "{type}\u9009\u9879 \u2014 {label}",
    "modal.addOption": "+ \u6DFB\u52A0\u9009\u9879",
    "modal.newOption": "\u65B0\u9009\u9879",
    "modal.optionNameDuplicate": "\u9009\u9879\u540D\u79F0\u4E0D\u80FD\u91CD\u590D",
    "modal.confirmDeleteOption": "\u786E\u8BA4\u5220\u9664\u9009\u9879\u300C{name}\u300D\uFF1F",
    "modal.preset": "\u9884\u8BBE",
    "modal.untitled": "\u672A\u547D\u540D",
    "modal.moveUp": "\u4E0A\u79FB",
    "modal.moveDown": "\u4E0B\u79FB",
    "common.colorGray": "\u7070\u8272",
    "common.colorBrown": "\u68D5\u8272",
    "common.colorOrange": "\u6A59\u8272",
    "common.colorYellow": "\u9EC4\u8272",
    "common.colorGreen": "\u7EFF\u8272",
    "common.colorBlue": "\u84DD\u8272",
    "common.colorPurple": "\u7D2B\u8272",
    "common.colorPink": "\u7C89\u8272",
    "common.colorRed": "\u7EA2\u8272",
    "common.colorSlate": "\u84DD\u7070\u8272",
    "common.colorCyan": "\u9752\u8272",
    "common.colorTeal": "\u84DD\u7EFF\u8272",
    "common.colorLime": "\u9EC4\u7EFF\u8272",
    "common.colorIndigo": "\u975B\u84DD\u8272",
    "common.colorViolet": "\u7D2B\u7F57\u5170\u8272",
    "common.colorRose": "\u73AB\u7EA2\u8272",
    "columnType.text": "\u6587\u672C",
    "columnType.number": "\u6570\u5B57",
    "columnType.date": "\u65E5\u671F",
    "columnType.datetime": "\u65E5\u671F\u548C\u65F6\u95F4",
    "columnType.currency": "\u8D27\u5E01",
    "columnType.select": "\u9009\u62E9",
    "columnType.multiSelect": "\u591A\u9009",
    "columnType.status": "\u72B6\u6001",
    "columnType.checkbox": "\u590D\u9009\u6846",
    "columnType.computed": "\u8BA1\u7B97\u5B57\u6BB5",
    "columnType.relation": "\u5173\u8054",
    "columnType.rollup": "\u6C47\u603B",
    "columnType.files": "\u6587\u4EF6",
    "relation.configure": "\u914D\u7F6E\u5173\u8054",
    "relation.targetDatabase": "\u76EE\u6807\u6570\u636E\u5E93",
    "relation.targetDatabaseRequired": "\u8BF7\u9009\u62E9\u76EE\u6807\u6570\u636E\u5E93\u3002",
    "rollup.configure": "\u914D\u7F6E\u6C47\u603B",
    "rollup.relationField": "\u5173\u8054\u5C5E\u6027",
    "rollup.targetField": "\u76EE\u6807\u5C5E\u6027",
    "rollup.aggregation": "\u8BA1\u7B97\u65B9\u5F0F",
    "rollup.list": "\u663E\u793A\u552F\u4E00\u503C",
    "rollup.relationRequired": "\u8BF7\u5148\u521B\u5EFA\u5E76\u914D\u7F6E\u4E00\u4E2A\u5173\u8054\u5C5E\u6027\uFF0C\u518D\u6DFB\u52A0\u6C47\u603B\u3002",
    "rollup.configurationRequired": "\u8BF7\u9009\u62E9\u5173\u8054\u5C5E\u6027\u548C\u76EE\u6807\u5C5E\u6027\u3002",
    "undo.relationConfig": "\u914D\u7F6E\u5173\u8054",
    "undo.rollupConfig": "\u914D\u7F6E\u6C47\u603B",
    "relation.search": "\u641C\u7D22\u76EE\u6807\u8BB0\u5F55",
    "relation.noResults": "\u6CA1\u6709\u5339\u914D\u7684\u8BB0\u5F55",
    "relation.selectedCount": "\u5DF2\u9009\u62E9 {count} \u6761",
    "relation.targetChangeImpact": "\u5207\u6362\u540E\u5C06\u6E05\u9664 {records} \u6761\u8BB0\u5F55\u4E2D\u7684\u73B0\u6709\u5173\u8054\uFF0C\u5E76\u91CD\u65B0\u68C0\u67E5 {rollups} \u4E2A\u4F9D\u8D56\u6C47\u603B\u3002\u6B64\u64CD\u4F5C\u53EF\u4EE5\u64A4\u9500\u3002",
    "relation.targetChangeInvalidRollups": "\u4EE5\u4E0B\u6C47\u603B\u9700\u8981\u91CD\u65B0\u9009\u62E9\u6570\u503C\u5C5E\u6027\uFF1A{names}",
    "relation.saveAndClear": "\u4FDD\u5B58\u5E76\u6E05\u9664\u65E7\u5173\u8054",
    "undo.relationTargetChange": "\u5207\u6362\u5173\u8054\u6570\u636E\u5E93",
    "notice.relationTargetChanged": "\u5DF2\u6E05\u9664 {records} \u6761\u8BB0\u5F55\u4E2D\u7684\u5173\u8054\uFF1B{rollups} \u4E2A\u6C47\u603B\u9700\u8981\u91CD\u65B0\u914D\u7F6E\u3002",
    "cell.rollupReadonly": "\u6C47\u603B\u5C5E\u6027\u7531\u7CFB\u7EDF\u81EA\u52A8\u8BA1\u7B97\uFF0C\u4E0D\u80FD\u76F4\u63A5\u7F16\u8F91\u3002",
    "column.confirmDeleteRollup": "\u5220\u9664\u6C47\u603B\u5C5E\u6027\u201C{label}\u201D\uFF1F\u6E90\u7B14\u8BB0\u4E2D\u7684\u5C5E\u6027\u4E0D\u4F1A\u88AB\u4FEE\u6539\u3002",
    "columnType.group.basic": "\u57FA\u7840",
    "columnType.group.options": "\u9009\u9879",
    "columnType.group.advanced": "\u9AD8\u7EA7",
    "column.keyRequired": "\u5C5E\u6027\u540D\u4E0D\u80FD\u4E3A\u7A7A",
    "column.keyExists": "\u5C5E\u6027\u300C{key}\u300D\u5DF2\u5B58\u5728",
    "column.migratedFiles": "\uFF0C\u5DF2\u8FC1\u79FB {count} \u4E2A\u6587\u4EF6",
    "column.cleanedOldProps": "\uFF0C\u5DF2\u6E05\u7406 {count} \u4E2A\u65E7\u5C5E\u6027",
    "column.skippedConflicts": "\uFF0C{count} \u4E2A\u6587\u4EF6\u56E0\u76EE\u6807\u5C5E\u6027\u5DF2\u6709\u503C\u800C\u8DF3\u8FC7",
    "column.updatedProperty": "\u5DF2\u66F4\u65B0\u5C5E\u6027\u300C{label}\u300D\uFF08frontmatter\u300C{key}\u300D\uFF09{migration}",
    "column.renameFailed": "\u91CD\u547D\u540D\u5931\u8D25: {error}",
    "column.confirmDeleteVirtual": "\u786E\u5B9A\u5220\u9664\u5217\u300C{label}\u300D\uFF1F\n\n\u6B64\u5217\u4E3A\u865A\u62DF\u6587\u4EF6\u5143\u6570\u636E\uFF0C\u6CA1\u6709\u5BF9\u5E94\u7684\u7B14\u8BB0 frontmatter \u5C5E\u6027\u3002",
    "column.confirmDelete": "\u786E\u5B9A\u5220\u9664\u5217\u300C{label}\u300D\uFF1F\n\n\u9009\u62E9\u662F\u5426\u540C\u65F6\u5220\u9664\u5F53\u524D\u6570\u636E\u5E93\u5185\u6240\u6709\u6761\u76EE\u7684\u7B14\u8BB0\u5C5E\u6027\u300C{key}\u300D\u3002",
    "column.deleteWithData": "\u5220\u9664\u5217 + \u7B14\u8BB0\u6570\u636E",
    "column.deleteColumnOnly": "\u4EC5\u5220\u9664\u5217\uFF08\u4FDD\u7559\u7B14\u8BB0\u6570\u636E\uFF09",
    "column.confirmDeleteComputed": "\u786E\u5B9A\u5220\u9664\u8BA1\u7B97\u5B57\u6BB5\u300C{label}\u300D\uFF1F\n\n\u8FD9\u53EA\u4F1A\u4ECE\u6570\u636E\u5E93\u4E2D\u79FB\u9664\u516C\u5F0F\u5217\u3002\u5DF2\u4FDD\u5B58\u5230\u7B14\u8BB0\u91CC\u7684\u5C5E\u6027\u4F1A\u4FDD\u7559\uFF0C\u9664\u975E\u4F60\u4E0B\u4E00\u6B65\u9009\u62E9\u6E05\u7406\u3002",
    "column.confirmDeleteComputedSavedProperty": "\u662F\u5426\u540C\u65F6\u4ECE\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7684\u7B14\u8BB0\u4E2D\u5220\u9664\u5DF2\u4FDD\u5B58\u7684\u5C5E\u6027\u300C{key}\u300D\uFF1F\n\n\u9009\u62E9\u53D6\u6D88\u4F1A\u4FDD\u7559\u8FD9\u4E9B\u7B14\u8BB0\u5C5E\u6027\uFF0C\u53EA\u5220\u9664\u516C\u5F0F\u5217\u3002",
    "column.confirmRenameComputedSavedProperty": "\u662F\u5426\u540C\u65F6\u628A\u5DF2\u4FDD\u5B58\u7684\u7B14\u8BB0\u5C5E\u6027\u4ECE\u300C{oldKey}\u300D\u91CD\u547D\u540D\u4E3A\u300C{newKey}\u300D\uFF1F\n\n\u9009\u62E9\u53D6\u6D88\u4F1A\u4FDD\u7559\u5DF2\u6709\u7B14\u8BB0\u5C5E\u6027\uFF0C\u53EA\u91CD\u547D\u540D\u516C\u5F0F\u5B57\u6BB5\u3002",
    "column.confirmConvertComputedCleanup": "\u8981\u628A\u300C{key}\u300D\u6539\u4E3A\u8BA1\u7B97\u5B57\u6BB5\u5417\uFF1F\n\n\u8BA1\u7B97\u7ED3\u679C\u5C06\u53EA\u5728\u6570\u636E\u5E93\u4E2D\u663E\u793A\u3002\u9009\u62E9\u786E\u5B9A\u4F1A\u540C\u65F6\u4ECE\u5F53\u524D\u6570\u636E\u5E93\u8303\u56F4\u5185\u7684\u7B14\u8BB0\u4E2D\u79FB\u9664\u5DF2\u6709\u5C5E\u6027\u300C{key}\u300D\uFF1B\u9009\u62E9\u53D6\u6D88\u4F1A\u4FDD\u7559\u5DF2\u6709\u7B14\u8BB0\u5C5E\u6027\u3002",
    "column.confirmConvertComputedSavedProperty": "\u8981\u628A\u300C{key}\u300D\u6539\u4E3A\u8BA1\u7B97\u5B57\u6BB5\u5417\uFF1F\n\n\u4EE5\u540E\u4FDD\u5B58\u8BA1\u7B97\u7ED3\u679C\u65F6\uFF0C\u53EF\u80FD\u4F1A\u8986\u76D6\u7B14\u8BB0\u5C5E\u6027\u300C{key}\u300D\u4E2D\u7684\u5DF2\u6709\u503C\u3002\u662F\u5426\u7EE7\u7EED\uFF1F",
    "column.deletedComputed": "\u5DF2\u5220\u9664\u8BA1\u7B97\u5217",
    "column.deletedColumn": "\u5DF2\u5220\u9664\u5217\uFF0C\u5E76\u4ECE {count} \u4E2A\u6587\u4EF6\u4E2D\u79FB\u9664\u7B14\u8BB0\u5C5E\u6027\u300C{key}\u300D",
    "column.deleteFailed": "\u5220\u9664\u5217\u5931\u8D25: {error}",
    "column.insertColumn": "\u63D2\u5165\u5217",
    "column.insertedColumn": "\u5DF2\u63D2\u5165\u5217",
    "column.addColumn": "\u6DFB\u52A0\u5217",
    "column.addedColumn": "\u5DF2\u6DFB\u52A0\u5217",
    "column.copiedLabel": "{label} (\u590D\u5236)",
    "column.copiedComputed": "\u5DF2\u590D\u5236\u8BA1\u7B97\u5217",
    "column.copiedColumn": "\u5DF2\u5C06 frontmatter\u300C{source}\u300D\u590D\u5236\u5230\u300C{target}\u300D\uFF0C\u5171 {count} \u4E2A\u6587\u4EF6",
    "column.copyColumnFailed": "\u590D\u5236\u5217\u5931\u8D25: {error}",
    "column.changedToComputed": "\u5DF2\u66F4\u6539\u4E3A\u8BA1\u7B97\u5B57\u6BB5",
    "column.changedType": "\u5DF2\u66F4\u6539 frontmatter\u300C{key}\u300D\u7684\u7C7B\u578B\uFF0C\u5E76\u540C\u6B65 {count} \u4E2A\u6587\u4EF6",
    "column.changeTypeFailed": "\u66F4\u6539\u7C7B\u578B\u5931\u8D25: {error}",
    "column.newColumn": "\u65B0\u5217",
    "column.addedProperty": "{prefix}\uFF0C\u5E76\u4E3A {count} \u4E2A\u6587\u4EF6\u6DFB\u52A0 frontmatter\u300C{key}\u300D",
    "column.actionFailed": "{action}\u5931\u8D25: {error}",
    "column.openMenu": "\u6253\u5F00 {label} \u83DC\u5355",
    "fileField.readonly": "\u300C{label}\u300D\u662F\u53EA\u8BFB\u6587\u4EF6\u5143\u6570\u636E\u5B57\u6BB5\u3002",
    "fileField.tagsFrontmatterOnly": "file.tags \u53EA\u4F1A\u66F4\u65B0 frontmatter \u7684 tags \u6570\u7EC4\uFF0C\u4E0D\u4F1A\u4FEE\u6539\u6B63\u6587\u4E2D\u7684 #tag\u3002",
    "fileField.fixedType": "file.* \u5B57\u6BB5\u4F7F\u7528\u56FA\u5B9A\u7684\u6587\u4EF6\u5143\u6570\u636E\u884C\u4E3A\uFF0C\u4E0D\u80FD\u50CF\u666E\u901A frontmatter \u5C5E\u6027\u4E00\u6837\u4FEE\u6539 key\u3001\u7C7B\u578B\u6216\u9009\u9879\u3002",
    "fileField.skippedReadonlyBatch": "\u5DF2\u8DF3\u8FC7 {count} \u4E2A\u53EA\u8BFB\u6587\u4EF6\u5143\u6570\u636E\u5B57\u6BB5\u3002",
    "fileField.unsupportedKey": "\u300C{key}\u300D\u662F\u6587\u4EF6\u5143\u6570\u636E\u4FDD\u7559\u5B57\u6BB5\uFF0C\u8BF7\u6362\u4E00\u4E2A\u5C5E\u6027\u540D\u3002",
    "fileField.addFileProperty": "\u6587\u4EF6\u5C5E\u6027",
    "fileField.selectFileProperty": "\u9009\u62E9\u8981\u6DFB\u52A0\u7684\u5C5E\u6027",
    "fileField.invalidTag": "\u300C{tag}\u300D\u6CA1\u6709\u4FDD\u5B58\u3002Obsidian \u6807\u7B7E\u4E0D\u80FD\u662F\u7EAF\u6570\u5B57\uFF0C\u4E0D\u80FD\u5305\u542B\u7A7A\u683C\uFF0C\u4E5F\u4E0D\u80FD\u5305\u542B\u4E0D\u652F\u6301\u7684\u5B57\u7B26\u3002",
    "fileField.migrationIgnored": "\u300C{key}\u300D\u662F\u6587\u4EF6\u5143\u6570\u636E\u5B57\u6BB5\uFF0Cfrontmatter \u503C\u8FC1\u79FB\u4E0D\u4F1A\u6267\u884C\uFF1B\u672C\u6B21\u53EA\u66F4\u65B0\u5217\u914D\u7F6E\u3002",
    "notice.editProperty": "\u7F16\u8F91\u5C5E\u6027",
    "notice.editEntry": "\u7F16\u8F91\u6761\u76EE",
    "notice.deleteEntry": "\u5220\u9664\u6761\u76EE",
    "notice.createEntry": "\u65B0\u5EFA\u6761\u76EE",
    "notice.cannotCreateTab": "\u65E0\u6CD5\u521B\u5EFA\u65B0\u7684\u6807\u7B7E\u9875",
    "notice.alreadyDbFile": "\u5F53\u524D\u6587\u4EF6\u5DF2\u662F\u6570\u636E\u5E93\u6587\u4EF6\uFF0C\u65E0\u9700\u8F6C\u6362\u3002",
    "notice.alreadyFileDb": "\u5F53\u524D\u6570\u636E\u5E93\u5DF2\u662F\u6587\u4EF6\u6570\u636E\u5E93\uFF0C\u65E0\u9700\u8F6C\u6362\u3002",
    "notice.noExportableDb": "\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "notice.importCancelled": "\u5DF2\u53D6\u6D88\u5BFC\u5165",
    "notice.generatedFromBase": "\u5DF2\u4ECE .base \u751F\u6210: {path}",
    "notice.noBaseFilesFound": "\u5F53\u524D vault \u4E2D\u6CA1\u6709\u627E\u5230 .base \u6587\u4EF6\u3002",
    "notice.baseMapViewDowngraded": "\u6B64 .base \u6587\u4EF6\u4E2D\u7684\u5730\u56FE\u89C6\u56FE\u5DF2\u6309\u8868\u683C\u89C6\u56FE\u5BFC\u5165\u3002",
    "notice.noImportableProperties": "\u6CA1\u6709\u68C0\u6D4B\u5230\u53EF\u5BFC\u5165\u7684\u5C5E\u6027\u3002",
    "notice.notValidDbFile": "\u5F53\u524D\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u6570\u636E\u5E93\u6587\u4EF6",
    "notice.dbAlreadyExists": "\u6570\u636E\u5E93\u300C{name}\u300D\u5DF2\u5728\u914D\u7F6E\u578B\u6570\u636E\u5E93\u4E2D\u5B58\u5728\u3002",
    "notice.addedToSettings": "\u5DF2\u5BFC\u5165\u4E3A\u914D\u7F6E\u578B\u6570\u636E\u5E93: {name}",
    "notice.noDbFilesFound": "\u6CA1\u6709\u627E\u5230 db_view: true \u7684\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "notice.noActiveDbFileToImport": "\u8BF7\u5148\u6253\u5F00\u6570\u636E\u5E93\u6587\u4EF6\uFF0C\u6216\u5728 Dashboard \u4E2D\u9009\u4E2D\u4E00\u4E2A\u6570\u636E\u5E93\u6587\u4EF6\u3002",
    "notice.openDashboardToExportCsvMarkdown": "\u8BF7\u5148\u6253\u5F00\u6570\u636E\u5E93 Dashboard\uFF0C\u518D\u5BFC\u51FA CSV + Markdown ZIP\u3002",
    "notice.exportedCsvMarkdownZip": "\u5DF2\u5BFC\u51FA CSV + Markdown ZIP: {path}",
    "notice.exportedCsvMarkdownZipExternal": "\u5DF2\u5BFC\u51FA CSV + Markdown ZIP \u5230\uFF1A{path}",
    "notice.csvMarkdownImportInvalidCsv": "\u9009\u62E9\u7684 CSV \u6587\u4EF6\u4E3A\u7A7A\u6216\u683C\u5F0F\u65E0\u6548\u3002",
    "notice.csvMarkdownImportInvalidMetadata": "\u9009\u62E9\u7684\u5143\u6570\u636E\u6587\u4EF6\u65E0\u6548\uFF0C\u5DF2\u5FFD\u7565\u3002",
    "notice.csvMarkdownImportComplete": "\u5DF2\u5BFC\u5165 {count} \u6761\u8BB0\u5F55\uFF0C\u5E76\u521B\u5EFA\u6570\u636E\u5E93\u6587\u4EF6: {path}",
    "confirm.deleteDbFile": "\u786E\u5B9A\u5220\u9664\u6570\u636E\u5E93\u6587\u4EF6\u300C{path}\u300D\uFF1F\u6587\u4EF6\u4F1A\u88AB\u79FB\u5230\u5E9F\u7EB8\u7BD3\u3002",
    "settings.trash.restoreAsConfig": "\u6062\u590D\u4E3A\u914D\u7F6E\u578B\u6570\u636E\u5E93",
    "settings.trash.restoreAsFile": "\u6062\u590D\u4E3A\u6587\u4EF6\u578B\u6570\u636E\u5E93",
    "settings.trash.restoreTitle": "\u6062\u590D\u300C{name}\u300D",
    "settings.trash.restoreDesc": "\u9009\u62E9\u6062\u590D\u65B9\u5F0F\u3002",
    "settings.trash.confirmPermanentDelete": "\u6C38\u4E45\u5220\u9664\u300C{name}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
    "settings.trash.manageTitle": "\u63D2\u4EF6\u56DE\u6536\u7AD9",
    "settings.trash.manageDesc": "\u79FB\u81F3\u63D2\u4EF6\u56DE\u6536\u7AD9\u7684\u6570\u636E\u5E93\u53EF\u4EE5\u6062\u590D\u6216\u6C38\u4E45\u5220\u9664\u3002",
    "settings.trash.name": "\u63D2\u4EF6\u56DE\u6536\u7AD9",
    "settings.trash.empty": "\u56DE\u6536\u7AD9\u4E3A\u7A7A\u3002",
    "common.open": "\u6253\u5F00"
  };
  var zhTW = {
    ...zhCN,
    "common.add": "\u65B0\u589E",
    "common.save": "\u5132\u5B58",
    "common.cancel": "\u53D6\u6D88",
    "common.clear": "\u6E05\u9664",
    "common.close": "\u95DC\u9589",
    "common.databaseTotal": "\u8CC7\u6599\u5EAB\u7E3D\u6578",
    "common.delete": "\u522A\u9664",
    "common.edit": "\u7DE8\u8F2F",
    "common.more": "\u66F4\u591A",
    "recordIcon.emoji": "\u8868\u60C5\u7B26\u865F",
    "recordIcon.icons": "\u5716\u793A",
    "recordIcon.remove": "\u79FB\u9664",
    "recordIcon.random": "\u96A8\u6A5F",
    "recordIcon.recent": "\u6700\u8FD1",
    "recordIcon.show": "\u986F\u793A\u5716\u793A",
    "recordIcon.field": "\u8A18\u9304\u5716\u793A\u6B04\u4F4D",
    "recordIcon.override": "\u8986\u84CB\u8CC7\u6599\u5EAB\u5716\u793A\u6B04\u4F4D",
    "recordIcon.selectField": "\u9078\u64C7\u5716\u793A\u5C6C\u6027",
    "recordIcon.noTextField": "\u8ACB\u5148\u5EFA\u7ACB\u4E00\u500B\u53EF\u5BEB\u6587\u5B57\u5C6C\u6027\uFF0C\u518D\u555F\u7528\u8A18\u9304\u5716\u793A\u3002",
    "recordIcon.createField": "\u5EFA\u7ACB\u5716\u793A\u5C6C\u6027\u2026",
    "recordIcon.configureField": "\u8A2D\u5B9A\u8A18\u9304\u5716\u793A\u5C6C\u6027\u2026",
    "iconPicker.search": "\u641C\u5C0B\u5716\u793A\u548C\u8868\u60C5\u7B26\u865F",
    "iconPicker.searchResults": "\u641C\u5C0B\u7D50\u679C",
    "recordIcon.changeRecord": "\u66F4\u6539\u6B64\u8A18\u9304\u7684\u5716\u793A",
    "recordIcon.hideInView": "\u96B1\u85CF\u76EE\u524D\u6AA2\u8996\u7684\u8A18\u9304\u5716\u793A",
    "recordIcon.followDatabaseField": "\u8DDF\u96A8\u8CC7\u6599\u5EAB\u8A2D\u5B9A\uFF08\u76EE\u524D\uFF1A{field}\uFF09",
    "recordIcon.currentViewField": "\u76EE\u524D\u6AA2\u8996\u7684\u8A18\u9304\u5716\u793A\u5C6C\u6027",
    "recordIcon.databaseDefaultField": "\u8CC7\u6599\u5EAB\u5168\u57DF\u5716\u793A\u9810\u8A2D\u5C6C\u6027",
    "recordIcon.createViewField": "\u5EFA\u7ACB\u4E26\u7528\u65BC\u76EE\u524D\u6AA2\u8996\u2026",
    "recordIcon.createDatabaseField": "\u5EFA\u7ACB\u70BA\u8CC7\u6599\u5EAB\u5168\u57DF\u9810\u8A2D\u2026",
    "recordIcon.iconKeyConflict": "\u5DF2\u5B58\u5728\u540D\u70BA icon \u7684\u4E0D\u76F8\u5BB9\u5C6C\u6027\uFF0C\u8ACB\u4F7F\u7528\u5176\u4ED6\u540D\u7A31\u6216 record_icon\u3002",
    "recordIcon.fileKeyInvalid": "\u8A18\u9304\u5716\u793A\u5C6C\u6027\u4E0D\u80FD\u4F7F\u7528\u4FDD\u7559\u7684 file.* \u547D\u540D\u7A7A\u9593\u3002",
    "recordIcon.category.people": "\u4EBA\u7269",
    "recordIcon.category.nature": "\u81EA\u7136",
    "recordIcon.category.food": "\u98DF\u7269",
    "recordIcon.category.activities": "\u6D3B\u52D5",
    "recordIcon.category.travel": "\u65C5\u884C",
    "recordIcon.category.objects": "\u7269\u54C1",
    "recordIcon.category.symbols": "\u7B26\u865F",
    "recordIcon.category.flags": "\u65D7\u5E5F",
    "recordIcon.category.common": "\u5E38\u7528",
    "recordIcon.category.interface": "\u4ECB\u9762",
    "recordIcon.category.files": "\u6A94\u6848",
    "recordIcon.category.communication": "\u6E9D\u901A",
    "recordIcon.category.media": "\u5A92\u9AD4",
    "recordIcon.category.time": "\u6642\u9593",
    "recordIcon.category.places": "\u5730\u9EDE",
    "recordIcon.category.business": "\u5546\u696D",
    "recordIcon.category.other": "\u5176\u4ED6",
    "common.noResults": "\u6C92\u6709\u7D50\u679C",
    "common.create": "\u5EFA\u7ACB",
    "common.restore": "\u9084\u539F",
    "common.permanentlyDelete": "\u6C38\u4E45\u522A\u9664",
    "common.untitled": "\u672A\u547D\u540D",
    "common.enumerationJoin": "\u3001",
    "common.notSet": "\u672A\u8A2D\u5B9A",
    "common.moveUp": "\u4E0A\u79FB",
    "common.moveDown": "\u4E0B\u79FB",
    "databaseCover.label": "\u8CC7\u6599\u5EAB\u5C01\u9762",
    "databaseCover.choose": "\u9078\u64C7\u5C01\u9762\u5716\u7247",
    "databaseCover.remove": "\u79FB\u9664\u5C01\u9762",
    "conditionalFormat.title": "\u689D\u4EF6\u683C\u5F0F",
    "conditionalFormat.add": "\u65B0\u589E\u898F\u5247",
    "conditionalFormat.empty": "\u66AB\u7121\u683C\u5F0F\u898F\u5247",
    "conditionalFormat.target": "\u683C\u5F0F\u76EE\u6A19",
    "conditionalFormat.targetField": "\u76EE\u6A19\u5C6C\u6027",
    "filter.field": "\u5C6C\u6027",
    "filter.operator": "\u904B\u7B97\u5B50",
    "conditionalFormat.dynamicToday": "\u52D5\u614B\u4ECA\u5929",
    "conditionalFormat.record": "\u6574\u7B46\u8A18\u9304",
    "conditionalFormat.field": "\u6B64\u5C6C\u6027",
    "conditionalFormat.color": "\u984F\u8272",
    "conditionalFormat.icon": "\u5716\u793A",
    "conditionalFormat.bold": "\u7C97\u9AD4",
    "conditionalFormat.group": "\u689D\u4EF6\u7D44",
    "template.label": "\u65B0\u8A18\u9304\u7BC4\u672C",
    "template.choose": "\u9078\u64C7\u7BC4\u672C\u7B46\u8A18",
    "template.remove": "\u79FB\u9664\u7BC4\u672C",
    "template.help": "\u7BC4\u672C\u5C6C\u6027\u6703\u5148\u65BC\u6AA2\u8996\u9810\u8A2D\u503C\u548C\u4F86\u6E90\u898F\u5247\u5408\u4F75\u3002",
    "template.engine.markdown": "Markdown",
    "template.engine.label": "\u7BC4\u672C\u5F15\u64CE",
    "template.engine.core": "\u6838\u5FC3 Templates",
    "template.engine.templater": "Templater",
    "template.missing": "\u8A2D\u5B9A\u7684\u7BC4\u672C\u6A94\u6848\u5DF2\u4E0D\u5B58\u5728\u3002",
    "template.loadFailed": "\u7121\u6CD5\u8F09\u5165\u8A18\u9304\u7BC4\u672C\uFF1A{error}",
    "template.templaterUnavailable": "\u672A\u5B89\u88DD Templater\uFF0C\u6216\u76EE\u524D\u7248\u672C\u6C92\u6709\u76F8\u5BB9\u4ECB\u9762\u3002",
    "template.templaterFailed": "\u7B46\u8A18\u5DF2\u5EFA\u7ACB\uFF0C\u4F46 Templater \u8655\u7406\u5931\u6557\uFF1A{error}",
    "columnType.relation": "\u95DC\u806F",
    "columnType.rollup": "\u5F59\u7E3D",
    "columnType.files": "\u6A94\u6848",
    "relation.configure": "\u8A2D\u5B9A\u95DC\u806F",
    "relation.targetDatabase": "\u76EE\u6A19\u8CC7\u6599\u5EAB",
    "relation.targetDatabaseRequired": "\u8ACB\u9078\u64C7\u76EE\u6A19\u8CC7\u6599\u5EAB\u3002",
    "rollup.configure": "\u8A2D\u5B9A\u5F59\u7E3D",
    "rollup.relationField": "\u95DC\u806F\u5C6C\u6027",
    "rollup.targetField": "\u76EE\u6A19\u5C6C\u6027",
    "rollup.aggregation": "\u8A08\u7B97\u65B9\u5F0F",
    "rollup.list": "\u986F\u793A\u552F\u4E00\u503C",
    "rollup.relationRequired": "\u8ACB\u5148\u5EFA\u7ACB\u4E26\u8A2D\u5B9A\u4E00\u500B\u95DC\u806F\u5C6C\u6027\uFF0C\u518D\u65B0\u589E\u5F59\u7E3D\u3002",
    "rollup.configurationRequired": "\u8ACB\u9078\u64C7\u95DC\u806F\u5C6C\u6027\u548C\u76EE\u6A19\u5C6C\u6027\u3002",
    "undo.relationConfig": "\u8A2D\u5B9A\u95DC\u806F",
    "undo.rollupConfig": "\u8A2D\u5B9A\u5F59\u7E3D",
    "relation.search": "\u641C\u5C0B\u76EE\u6A19\u8A18\u9304",
    "relation.noResults": "\u6C92\u6709\u7B26\u5408\u7684\u8A18\u9304",
    "relation.selectedCount": "\u5DF2\u9078\u64C7 {count} \u7B46",
    "relation.targetChangeImpact": "\u5207\u63DB\u5F8C\u5C07\u6E05\u9664 {records} \u7B46\u8A18\u9304\u4E2D\u7684\u73FE\u6709\u95DC\u806F\uFF0C\u4E26\u91CD\u65B0\u6AA2\u67E5 {rollups} \u500B\u4F9D\u8CF4\u5F59\u7E3D\u3002\u6B64\u64CD\u4F5C\u53EF\u4EE5\u5FA9\u539F\u3002",
    "relation.targetChangeInvalidRollups": "\u4EE5\u4E0B\u5F59\u7E3D\u9700\u8981\u91CD\u65B0\u9078\u64C7\u6578\u503C\u5C6C\u6027\uFF1A{names}",
    "relation.saveAndClear": "\u5132\u5B58\u4E26\u6E05\u9664\u820A\u95DC\u806F",
    "undo.relationTargetChange": "\u5207\u63DB\u95DC\u806F\u8CC7\u6599\u5EAB",
    "notice.relationTargetChanged": "\u5DF2\u6E05\u9664 {records} \u7B46\u8A18\u9304\u4E2D\u7684\u95DC\u806F\uFF1B{rollups} \u500B\u5F59\u7E3D\u9700\u8981\u91CD\u65B0\u8A2D\u5B9A\u3002",
    "cell.rollupReadonly": "\u5F59\u7E3D\u5C6C\u6027\u7531\u7CFB\u7D71\u81EA\u52D5\u8A08\u7B97\uFF0C\u4E0D\u80FD\u76F4\u63A5\u7DE8\u8F2F\u3002",
    "column.confirmDeleteRollup": "\u522A\u9664\u5F59\u7E3D\u5C6C\u6027\u300C{label}\u300D\uFF1F\u4F86\u6E90\u7B46\u8A18\u4E2D\u7684\u5C6C\u6027\u4E0D\u6703\u88AB\u4FEE\u6539\u3002",
    "filter.value": "\u6BD4\u8F03\u503C",
    "notice.createdNote": "\u5DF2\u5EFA\u7ACB\u7B46\u8A18\uFF1A{path}",
    "notice.createdNoteRuleRisk": "\u5DF2\u5EFA\u7ACB {path}\uFF0C\u5B83\u53EF\u80FD\u4E0D\u7B26\u5408\u76EE\u524D\u4F86\u6E90\u898F\u5247\uFF08{reasons}\uFF09\u3002",
    "createRuleRisk.unappliedRule": "\u90E8\u5206\u898F\u5247\u7121\u6CD5\u81EA\u52D5\u586B\u5165",
    "createRuleRisk.conflictOverride": "\u4F86\u6E90\u898F\u5247\u8986\u84CB\u4E86\u8996\u5716\u9810\u8A2D\u503C",
    "createRuleRisk.conflictSameField": "\u540C\u4E00\u5C6C\u6027\u5B58\u5728\u885D\u7A81\u898F\u5247",
    "createRuleRisk.folderConflict": "\u65B0\u8A18\u9304\u8CC7\u6599\u593E\u8207\u5FC5\u9078\u8CC7\u6599\u593E\u885D\u7A81",
    "createRuleRisk.filenameSuffix": "\u540C\u540D\u6A94\u6848\u5C0E\u81F4\u6A94\u540D\u6539\u8B8A",
    "createRuleRisk.filenameInvalid": "\u6A94\u540D\u5305\u542B\u975E\u6CD5\u5B57\u5143",
    "createRuleRisk.filenameNormalized": "\u6A94\u540D\u88AB\u6B78\u4E00\u5316\u6539\u8B8A",
    "createRuleRisk.filenameEmpty": "\u6A94\u540D\u898F\u5247\u70BA\u7A7A",
    "createRuleRisk.unconstructable": "\u90E8\u5206\u898F\u5247\u7121\u6CD5\u69CB\u9020",
    "createRuleRisk.readonlyFileField": "\u552F\u8B80\u6A94\u6848\u6B04\u4F4D\u7121\u6CD5\u8A2D\u5B9A",
    "common.untitledDatabase": "\u672A\u547D\u540D\u8CC7\u6599\u5EAB",
    "common.empty": "\u7A7A",
    "common.database": "\u8CC7\u6599\u5EAB",
    "common.tableView": "\u8868\u683C\u6AA2\u8996",
    "common.boardView": "\u770B\u677F\u6AA2\u8996",
    "common.galleryView": "\u5716\u5EAB\u6AA2\u8996",
    "common.listView": "\u5217\u8868\u6AA2\u8996",
    "common.chartView": "\u5716\u8868\u6AA2\u8996",
    "common.calendarView": "\u65E5\u66C6\u6AA2\u8996",
    "common.timelineView": "\u6642\u9593\u7DDA\u6AA2\u8996",
    "calendar.prevMonth": "\u4E0A\u500B\u6708",
    "calendar.prevYear": "\u4E0A\u4E00\u5E74",
    "calendar.prevYearRange": "\u4E0A\u4E00\u7D44\u5E74\u4EFD",
    "calendar.today": "\u4ECA\u5929",
    "calendar.unscheduled": "\u672A\u6392\u7A0B",
    "board.collapseGroup": "\u647A\u758A\u5206\u7D44",
    "board.columnOptions": "\u6B04\u9078\u9805",
    "board.deleteGroup": "\u522A\u9664\u5206\u7D44",
    "board.hideColumn": "\u96B1\u85CF\u6B04",
    "board.sortAscending": "\u5347\u51AA\u6392\u5E8F",
    "board.sortDescending": "\u964D\u51AA\u6392\u5E8F",
    "calendar.previewEvent": "\u9810\u89BD\u4E8B\u4EF6",
    "calendar.setupPreview": "\u8A2D\u5B9A\u9810\u89BD",
    "calendar.week": "\u9031",
    "dropdown.noResults": "\u7121\u7D50\u679C",
    "datePicker.presets": "\u5FEB\u901F\u65E5\u671F",
    "datePicker.today": "\u4ECA\u5929",
    "datePicker.tomorrow": "\u660E\u5929",
    "datePicker.nextWeek": "\u4E0B\u9031",
    "datePicker.clear": "\u6E05\u9664",
    "calendar.minutePlaceholder": "mm",
    "calendar.datePicker": "\u8DF3\u8F49\u5230\u65E5\u671F",
    "calendar.nextMonth": "\u4E0B\u500B\u6708",
    "calendar.nextYear": "\u4E0B\u4E00\u5E74",
    "calendar.nextYearRange": "\u4E0B\u4E00\u7D44\u5E74\u4EFD",
    "calendar.prevWeek": "\u4E0A\u4E00\u9031",
    "calendar.nextWeek": "\u4E0B\u4E00\u9031",
    "calendar.prevDay": "\u4E0A\u4E00\u5929",
    "calendar.nextDay": "\u4E0B\u4E00\u5929",
    "calendar.switchToDayTitle": "\u5207\u63DB\u5230\u65E5\u6AA2\u8996\uFF1F",
    "calendar.switchToDayMessage": "\u5C07\u5728\u65E5\u6AA2\u8996\u4E2D\u958B\u555F {date}\uFF0C\u662F\u5426\u5207\u63DB\uFF1F",
    "calendar.switchToDayConfirm": "\u5207\u63DB",
    "calendar.openDayView": "\u958B\u555F\u65E5\u6AA2\u8996",
    "calendar.options": "\u65E5\u66C6\u9078\u9805",
    "calendar.scaleMonth": "\u6708",
    "calendar.scaleWeek": "\u9031",
    "calendar.scaleDay": "\u65E5",
    "calendar.layout": "\u7248\u9762",
    "calendar.time": "\u6642\u9593",
    "calendar.appearance": "\u5916\u89C0",
    "calendar.sizing": "\u5C3A\u5BF8",
    "calendar.weekViewComingSoon": "\u9031\u8996\u5716\u5373\u5C07\u4E0A\u7DDA",
    "timeline.options": "\u6642\u9593\u7DDA\u9078\u9805",
    "common.noGroup": "\u4E0D\u5206\u7D44",
    "common.uncategorized": "\u672A\u5206\u985E",
    "group.computedCreateDisabled": "\u8A72\u5206\u7D44\u7531\u516C\u5F0F\u9A45\u52D5\u7121\u6CD5\u76F4\u63A5\u65B0\u5EFA",
    "changelog.releaseNotes": "## 1.2.8 \u66F4\u65B0\u5167\u5BB9\n\n- **\u5FEB\u901F\u7BE9\u9078\u8207\u6392\u5E8F\uFF1A** \u9802\u6B04\u76F4\u63A5\u986F\u793A\u76EE\u524D\u898F\u5247\uFF0C\u53EF\u539F\u5730\u7DE8\u8F2F\u4E00\u689D\u6216\u76F4\u63A5\u79FB\u9664\u3002\n- **\u770B\u677F\u8A18\u9304\u5C01\u9762\uFF1A** \u6BCF\u500B\u770B\u677F\u6AA2\u8996\u7368\u7ACB\u9078\u64C7\u5716\u7247\u5C6C\u6027\u3001\u88C1\u5207\u65B9\u5F0F\u548C\u9577\u5BEC\u6BD4\u3002\n- **\u66F4\u6E05\u695A\u7684\u516C\u5F0F\uFF1A** \u5340\u5206\u986F\u793A\u540D\u7A31\u8207 frontmatter \u5C6C\u6027\u540D\uFF0C\u9810\u89BD\u5BE6\u969B\u4EE3\u5165\u503C\uFF0C\u652F\u63F4 `file.name`\u3001`file.tags` \u548C `IFERROR`\u3002\n- **\u95DC\u806F\u8207\u5F59\u7E3D\uFF1A** \u5207\u63DB\u76EE\u6A19\u8CC7\u6599\u5EAB\u4F5C\u70BA\u4E00\u6B21\u53EF\u5FA9\u539F\u64CD\u4F5C\uFF0C\u96D9\u64CA Rollup \u5132\u5B58\u683C\u5373\u53EF\u8A2D\u5B9A\u3002\n- **\u7D71\u4E00\u7DE8\u8F2F\u9AD4\u9A57\uFF1A** \u65B0\u589E\u5C6C\u6027\u8996\u7A97\u3001\u9078\u9805\u5206\u7D44\u5F69\u8272\u6A19\u7C64\u3001\u539F\u751F Page Preview \u548C\u65E5\u671F\u9078\u64C7\u5668\u4FDD\u6301\u4E00\u81F4\u3002\n\n\u7B46\u8A18\u8207\u95DC\u806F\u4ECD\u7136\u53EA\u662F\u5132\u5B58\u5728\u672C\u6A5F\u7684 Markdown \u548C Obsidian \u96D9\u93C8\u3002",
    "changelog.viewPluginPage": "\u524D\u5F80\u793E\u7FA4\u5916\u639B\u9801\u67E5\u770B\u5B8C\u6574\u529F\u80FD\u4ECB\u7D39 \u2192",
    "common.noMatchingData": "\u6C92\u6709\u7B26\u5408\u7684\u8CC7\u6599\u3002",
    "common.groupBy": "\u4F9D {name} \u5206\u7D44",
    "common.asc": "\u5347\u51AA",
    "common.desc": "\u964D\u51AA",
    "common.true": "\u662F",
    "common.false": "\u5426",
    "search.calendarTimelineSummary": "\u627E\u5230 {total} \u689D\uFF0C\u76EE\u524D\u7BC4\u570D\u5167 {visible} \u689D",
    "search.noMatches": "\u6C92\u6709\u5339\u914D\u9805\u3002",
    "search.inCurrentRange": "\u76EE\u524D\u7BC4\u570D\u5167",
    "search.outsideCurrentRange": "\u76EE\u524D\u7BC4\u570D\u5916",
    "search.moreResults": "\u9084\u6709 {count} \u689D\u672A\u986F\u793A",
    "mobile.moveCard": "\u79FB\u52D5\u5361\u7247",
    "mobile.moveToGroup": "\u79FB\u52D5\u5230\u5206\u7D44",
    "mobile.moveTo": "\u79FB\u52D5\u5230",
    "mobile.moveTop": "\u79FB\u5230\u9802\u90E8",
    "mobile.moveBottom": "\u79FB\u5230\u5E95\u90E8",
    "mobile.moveBefore": "\u79FB\u5230\u524D\u9762",
    "mobile.moveAfter": "\u79FB\u5230\u5F8C\u9762",
    "common.colorGray": "\u7070\u8272",
    "common.colorBrown": "\u68D5\u8272",
    "common.colorOrange": "\u6A59\u8272",
    "common.colorYellow": "\u9EC3\u8272",
    "common.colorGreen": "\u7DA0\u8272",
    "common.colorBlue": "\u85CD\u8272",
    "common.colorPurple": "\u7D2B\u8272",
    "common.colorPink": "\u7C89\u8272",
    "common.colorRed": "\u7D05\u8272",
    "common.colorSlate": "\u85CD\u7070\u8272",
    "common.colorCyan": "\u9752\u8272",
    "common.colorTeal": "\u85CD\u7DA0\u8272",
    "common.colorLime": "\u9EC3\u7DA0\u8272",
    "common.colorIndigo": "\u975B\u85CD\u8272",
    "common.colorViolet": "\u7D2B\u7F85\u862D\u8272",
    "common.colorRose": "\u73AB\u7D05\u8272",
    "toolbar.defaultWidth": "\u9810\u8A2D\u5BEC\u5EA6",
    "toolbar.wide": "\u5BEC\u7248",
    "toolbar.queryCluster": "\u67E5\u8A62\u63A7\u5236\u9805",
    "toolbar.propertiesCluster": "\u5C6C\u6027\u63A7\u5236\u9805",
    "toolbar.utilities": "\u66F4\u591A\u5DE5\u5177",
    "toolbar.viewSwitcher": "\u6AA2\u8996\u5207\u63DB\u5668",
    "toolbar.openDatabaseSwitcher": "\u5207\u63DB\u8CC7\u6599\u5EAB",
    "toolbar.viewSettings": "\u6AA2\u8996\u8A2D\u5B9A",
    "toolbar.displayWidth": "\u986F\u793A\u5BEC\u5EA6",
    "toolbar.searchShortcut": "\u641C\u5C0B\uFF08\u2318F / Ctrl+F\uFF09",
    "toolbar.clearSearch": "\u6E05\u9664\u641C\u5C0B",
    "toolbar.allViews": "\u6240\u6709\u6AA2\u8996",
    "toolbar.searchViews": "\u641C\u5C0B\u6AA2\u8996",
    "toolbar.moreViewsCount": "\u66F4\u591A\u6AA2\u8996\uFF08{count}\uFF09",
    "toolbar.maxViews": "\u6700\u591A 15 \u500B\u6AA2\u8996",
    "toolbar.newViewName": "\u6AA2\u8996\u540D\u7A31\uFF08\u9078\u586B\uFF09",
    "toolbar.viewKeyField": "\u6A19\u984C\u5C6C\u6027",
    "toolbar.viewIcon": "\u5716\u793A\uFF08\u9078\u586B\uFF09",
    "toolbar.duplicateCurrentView": "\u8907\u88FD\u76EE\u524D\u6AA2\u8996",
    "toolbar.setViewIcon": "\u8A2D\u5B9A\u6AA2\u8996\u5716\u793A",
    "toolbar.chooseTemplate": "\u9078\u64C7\u7BC4\u672C",
    "toolbar.insertPlacement": "\u65B0\u7B46\u8A18\u4F4D\u7F6E",
    "toolbar.insertAtTop": "\u63D2\u5165\u81F3\u9802\u7AEF",
    "toolbar.insertAtBottom": "\u63D2\u5165\u81F3\u5E95\u7AEF",
    "toolbar.createBlankNote": "\u5EFA\u7ACB\u7A7A\u767D\u7B46\u8A18",
    "toolbar.setDefaultTemplate": "\u8A2D\u5B9A\u9810\u8A2D\u7BC4\u672C",
    "toolbar.configureTemplates": "\u8A2D\u5B9A\u7BC4\u672C\u2026",
    "toolbar.propertiesHidden": "\u5C6C\u6027\uFF0C\u96B1\u85CF {count} \u9805",
    "toolbar.clearAll": "\u5168\u90E8\u6E05\u9664",
    "toolbar.filter": "\u7BE9\u9078",
    "toolbar.sort": "\u6392\u5E8F",
    "toolbar.view": "\u6AA2\u8996",
    "toolbar.settings": "\u8A2D\u5B9A",
    "toolbar.group": "\u5206\u7D44",
    "toolbar.groupBy": "\u4F9D\u6B04\u4F4D\u5206\u7D44",
    "toolbar.groupOptions": "\u5206\u7D44\u9078\u9805",
    "toolbar.groupOrder": "\u5206\u7D44\u9806\u5E8F",
    "toolbar.showEmptyGroup": "\u986F\u793A\u7A7A\u5206\u7D44",
    "toolbar.enableBoardSubgroups": "\u555F\u7528\u5B50\u7D44",
    "toolbar.subgroupBy": "\u4F9D\u6B04\u4F4D\u5B50\u5206\u7D44",
    "toolbar.selectBoardSubgroupField": "\u8ACB\u9078\u64C7\u5B50\u7D44\u6B04\u4F4D",
    "toolbar.noAvailableBoardSubgroupFields": "\u6C92\u6709\u53EF\u7528\u7684\u5B50\u7D44\u6B04\u4F4D",
    "toolbar.properties": "\u5C6C\u6027",
    "toolbar.hiddenCount": "{count} \u96B1\u85CF",
    "toolbar.export": "\u532F\u51FA",
    "toolbar.refreshDatabase": "\u91CD\u65B0\u6574\u7406\u8CC7\u6599\u5EAB",
    "toolbar.refreshingDatabase": "\u6B63\u5728\u91CD\u65B0\u6574\u7406\u8CC7\u6599\u5EAB\u2026",
    "toolbar.pendingRefreshFiles": "\u6709 {count} \u500B\u6A94\u6848\u5F85\u91CD\u65B0\u6574\u7406",
    "toolbar.pendingRefreshUnknown": "\u6709\u8B8A\u66F4\u5F85\u91CD\u65B0\u6574\u7406",
    "errors.refreshFailed": "\u8CC7\u6599\u5EAB\u91CD\u65B0\u6574\u7406\u5931\u6557\uFF0C\u5F85\u91CD\u65B0\u6574\u7406\u8B8A\u66F4\u5DF2\u4FDD\u7559\u3002",
    "toolbar.share": "\u5206\u4EAB / \u532F\u51FA",
    "toolbar.copyFormats": "\u532F\u51FA\u5230\u526A\u8CBC\u7C3F",
    "toolbar.new": "\u65B0\u589E",
    "toolbar.newFromTemplate": "\u5F9E\u7BC4\u672C\u65B0\u589E",
    "toolbar.newFromTemplateTooltip": "\u5F9E\u7BC4\u672C\u65B0\u589E\uFF1A{path}",
    "board.newGroup": "\u65B0\u589E\u5206\u7D44",
    "board.groupNamePlaceholder": "\u5206\u7D44\u540D\u7A31",
    "board.groupColor": "\u5206\u7D44\u984F\u8272",
    "board.groupExists": "\u5206\u7D44\u300C{name}\u300D\u5DF2\u5B58\u5728\u3002",
    "toolbar.selectedCount": "\u5DF2\u9078\u53D6 {count} \u9805",
    "toolbar.selectedCells": "\u5DF2\u9078\u53D6 {count} \u500B\u5132\u5B58\u683C",
    "toolbar.undo": "\u5FA9\u539F",
    "notice.cutCells": "\u5DF2\u526A\u4E0B {count} \u500B\u5132\u5B58\u683C\uFF0C\u8CBC\u4E0A\u5F8C\u5C07\u79FB\u52D5\u8CC7\u6599",
    "notice.cutSourceChanged": "\u526A\u4E0B\u4F86\u6E90\u5DF2\u7D93\u8B8A\u66F4\uFF0C\u56E0\u6B64\u6C92\u6709\u6E05\u7A7A\u4F86\u6E90\u5132\u5B58\u683C\u3002",
    "notice.pastedCellsCreatedRows": "\u5DF2\u8CBC\u4E0A {count} \u500B\u5132\u5B58\u683C\u4E26\u5EFA\u7ACB {rows} \u7B46\u8A18\u9304",
    "notice.pastedCellsCreatedRowsSkipped": "\u5DF2\u8CBC\u4E0A {count} \u500B\u5132\u5B58\u683C\u4E26\u5EFA\u7ACB {rows} \u7B46\u8A18\u9304\uFF0C\u7565\u904E {skipped} \u500B\u552F\u8B80\u5132\u5B58\u683C\u3002",
    "notice.createdRowsRuleRisk": "\u6709 {count} \u7B46\u65B0\u8A18\u9304\u53EF\u80FD\u4E0D\u7B26\u5408\u76EE\u524D\u4F86\u6E90\u898F\u5247\u3002",
    "notice.nothingToUndo": "\u6C92\u6709\u53EF\u5FA9\u539F\u7684\u64CD\u4F5C",
    "notice.nothingToRedo": "\u6C92\u6709\u53EF\u91CD\u505A\u7684\u64CD\u4F5C",
    "notice.undone": "\u5DF2\u5FA9\u539F\uFF1A{action}",
    "notice.redone": "\u5DF2\u91CD\u505A\uFF1A{action}",
    "toolbar.openFullView": "\u5728\u5B8C\u6574\u8CC7\u6599\u5EAB\u4E2D\u958B\u555F",
    "toolbar.hideEmbedHeader": "\u96B1\u85CF\u5D4C\u5165\u8868\u982D",
    "toolbar.showEmbedHeader": "\u986F\u793A\u5D4C\u5165\u8868\u982D",
    "toolbar.addDatabase": "\u65B0\u589E\u8CC7\u6599\u5EAB",
    "toolbar.toggleDatabaseIcon": "\u555F\u7528/\u95DC\u9589\u8CC7\u6599\u5EAB\u5716\u793A",
    "toolbar.deleteDatabase": "\u522A\u9664\u8CC7\u6599\u5EAB",
    "toolbar.renameDatabase": "\u91CD\u65B0\u547D\u540D\u8CC7\u6599\u5EAB",
    "toolbar.copyCurrentDatabase": "\u8907\u88FD\u76EE\u524D\u8CC7\u6599\u5EAB",
    "toolbar.copyCurrentView": "\u8907\u88FD\u76EE\u524D\u6AA2\u8996",
    "toolbar.copyViewCode": "\u8907\u88FD\u6B64\u6AA2\u8996\u5D4C\u5165\u78BC",
    "toolbar.changeViewType": "\u66F4\u6539\u6AA2\u8996\u985E\u578B",
    "toolbar.changeLayout": "\u66F4\u6539\u7248\u9762\u914D\u7F6E",
    "toolbar.moveViewFirst": "\u79FB\u5230\u6700\u524D",
    "toolbar.moveViewLast": "\u79FB\u5230\u6700\u5F8C",
    "toolbar.openDatabaseFile": "\u958B\u555F\u5C0D\u61C9\u8CC7\u6599\u5EAB\u6A94\u6848",
    "toolbar.exportCsvMarkdownZip": "\u532F\u51FA CSV + Markdown ZIP",
    "toolbar.moreViews": "\u66F4\u591A\u6AA2\u8996",
    "toolbar.addView": "\u65B0\u589E\u6AA2\u8996",
    "toolbar.rename": "\u91CD\u65B0\u547D\u540D",
    "toolbar.deleteView": "\u522A\u9664\u6AA2\u8996",
    "toolbar.copyCsv": "\u8907\u88FD\u70BA CSV",
    "toolbar.copyMarkdown": "\u8907\u88FD\u70BA Markdown \u8868\u683C",
    "toolbar.openAsMarkdown": "\u4EE5 Markdown \u958B\u555F",
    "command.openDashboard": "Note database: \u958B\u555F\u9762\u677F",
    "command.createDatabaseFile": "Note database: \u5F9E\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\u7522\u751F\u8CC7\u6599\u5EAB\u6A94\u6848",
    "command.convertBase": "Note database: \u5C07 .base \u6A94\u8F49\u63DB\u70BA\u8CC7\u6599\u5EAB",
    "command.showDatabaseFiles": "Note database: \u67E5\u770B\u8CC7\u6599\u5EAB\u6A94\u6848",
    "command.importDatabaseFile": "Note database: \u5C07\u76EE\u524D\u8CC7\u6599\u5EAB\u6A94\u6848\u532F\u5165\u70BA\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB",
    "command.importCsvMarkdown": "Note database: \u532F\u5165 CSV + Markdown \u6A94",
    "command.exportCsvMarkdown": "Note database: \u5C07\u76EE\u524D\u8CC7\u6599\u5EAB\u6AA2\u8996\u532F\u51FA\u70BA CSV + Markdown ZIP",
    "command.undoDatabaseEdit": "Note database: \u5FA9\u539F\u4E0A\u4E00\u6B21\u8CC7\u6599\u5EAB\u7DE8\u8F2F",
    "selection.copyCells": "\u8907\u88FD",
    "selection.copyTsv": "\u8907\u88FD TSV",
    "selection.copyMarkdown": "\u8907\u88FD Markdown",
    "selection.copyCsv": "\u8907\u88FD CSV",
    "selection.pasteCells": "\u8CBC\u4E0A",
    "selection.fillCells": "\u586B\u5165",
    "selection.fillValue": "\u586B\u5165\u503C",
    "selection.fillPlaceholder": "\u8F38\u5165\u586B\u5165\u503C",
    "selection.clearCells": "\u6E05\u9664",
    "selection.fillPrompt": "\u5C07\u9078\u53D6\u5132\u5B58\u683C\u586B\u5165\u70BA\uFF1A",
    "bulkEdit.editField": "\u7DE8\u8F2F\u6B04\u4F4D",
    "bulkEdit.field": "\u6B04\u4F4D",
    "bulkEdit.searchField": "\u641C\u5C0B\u6B04\u4F4D",
    "bulkEdit.checked": "\u5DF2\u52FE\u9078",
    "bulkEdit.unchecked": "\u672A\u52FE\u9078",
    "bulkEdit.leavesView": "{count} \u7B46\u8A18\u9304\u5C07\u96E2\u958B\u76EE\u524D\u6AA2\u8996",
    "bulkEdit.leavesDatabase": "{count} \u7B46\u8A18\u9304\u5C07\u96E2\u958B\u6B64\u8CC7\u6599\u5EAB",
    "bulkEdit.movesGroup": "{count} \u7B46\u8A18\u9304\u5C07\u79FB\u81F3\u5176\u4ED6\u5206\u7D44",
    "bulkEdit.missing": "{count} \u7B46\u7F3A\u5931\u8A18\u9304\u5C07\u88AB\u7565\u904E",
    "bulkEdit.apply": "\u5957\u7528",
    "bulkEdit.noEditableFields": "\u6C92\u6709\u53EF\u7DE8\u8F2F\u6B04\u4F4D\u3002",
    "bulkEdit.noChanges": "\u6C92\u6709\u9700\u8981\u4FEE\u6539\u7684\u8A18\u9304\u3002",
    "bulkEdit.allMissing": "\u6240\u9078\u8A18\u9304\u5747\u5DF2\u7F3A\u5931\u3002",
    "bulkEdit.confirmTitle": "\u78BA\u8A8D\u6279\u91CF\u7DE8\u8F2F",
    "bulkEdit.confirmChanged": "\u5C07\u4FEE\u6539 {count} \u7B46\u8A18\u9304",
    "bulkEdit.completed": "\u5DF2\u66F4\u65B0 {count} \u7B46\u8A18\u9304\u3002",
    "bulkEdit.completedSkipped": "\u5DF2\u66F4\u65B0 {count} \u7B46\u8A18\u9304\uFF0C\u7565\u904E {skipped} \u7B46\u7F3A\u5931\u8A18\u9304\u3002",
    "bulkEdit.previewChanged": "\u78BA\u8A8D\u671F\u9593\u8A18\u9304\u767C\u751F\u4E86\u8B8A\u5316\uFF0C\u8ACB\u67E5\u770B\u6700\u65B0\u9810\u89BD\u5F8C\u91CD\u65B0\u5957\u7528\u3002",
    "undo.bulkEdit": "\u6279\u91CF\u7DE8\u8F2F\u8A18\u9304",
    "undo.fillCells": "\u586B\u5165\u5132\u5B58\u683C",
    "undo.pasteCells": "\u8CBC\u4E0A\u5132\u5B58\u683C",
    "undo.moveCells": "\u79FB\u52D5\u5132\u5B58\u683C",
    "undo.clearCells": "\u6E05\u9664\u5132\u5B58\u683C",
    "undo.editCell": "\u7DE8\u8F2F\u5132\u5B58\u683C",
    "undo.renameFile": "\u91CD\u65B0\u547D\u540D\u6A94\u6848",
    "undo.viewConfig": "\u6AA2\u8996\u8A2D\u5B9A",
    "undo.filterConfig": "\u7BE9\u9078\u689D\u4EF6",
    "undo.sortConfig": "\u6392\u5E8F\u898F\u5247",
    "undo.groupConfig": "\u5206\u7D44\u8A2D\u5B9A",
    "undo.hideColumnsConfig": "\u6B04\u986F\u793A\u8A2D\u5B9A",
    "undo.columnWidthConfig": "\u6B04\u5BEC",
    "undo.columnOrderConfig": "\u6B04\u9806\u5E8F",
    "undo.columnRenameConfig": "\u6B04\u91CD\u547D\u540D",
    "undo.columnTypeConfig": "\u6B04\u985E\u578B",
    "undo.columnWrapConfig": "\u6B04\u63DB\u884C",
    "undo.insertColumnConfig": "\u63D2\u5165\u6B04",
    "undo.addColumnConfig": "\u65B0\u589E\u6B04",
    "undo.duplicateColumnConfig": "\u8907\u88FD\u6B04",
    "undo.deleteColumnConfig": "\u522A\u9664\u6B04",
    "undo.fieldOptionsConfig": "\u6B04\u4F4D\u9078\u9805",
    "undo.formulaConfig": "\u516C\u5F0F\u7DE8\u8F2F",
    "undo.viewTypeConfig": "\u6AA2\u8996\u985E\u578B",
    "undo.chartConfig": "\u5716\u8868\u8A2D\u5B9A",
    "undo.chartTypeConfig": "\u5716\u8868\u985E\u578B",
    "undo.chartGroupConfig": "\u5716\u8868\u5206\u7D44",
    "undo.chartMeasureConfig": "\u5716\u8868\u6578\u503C\u8A2D\u5B9A",
    "undo.chartStyleConfig": "\u5716\u8868\u6A23\u5F0F",
    "undo.chartReferenceLinesConfig": "\u5716\u8868\u53C3\u8003\u7DDA",
    "undo.chartVisibleGroupsConfig": "\u5716\u8868\u53EF\u898B\u5206\u7D44",
    "undo.chartDrilldownFilterConfig": "\u5716\u8868\u4E0B\u947D\u7BE9\u9078",
    "undo.chartDateBucketConfig": "\u5716\u8868\u65E5\u671F\u5206\u6876",
    "undo.chartNumberBucketConfig": "\u5716\u8868\u6578\u503C\u5206\u6876",
    "undo.chartNumberBucketSizeConfig": "\u5716\u8868\u5206\u6876\u5927\u5C0F",
    "undo.chartSubgroupConfig": "\u5716\u8868\u5B50\u5206\u7D44",
    "undo.chartSortConfig": "\u5716\u8868\u6392\u5E8F",
    "undo.chartOmitZeroValuesConfig": "\u96B1\u85CF 0 \u503C",
    "undo.chartCumulativeConfig": "\u5716\u8868\u7D2F\u8A08\u503C",
    "undo.chartValueFieldConfig": "\u5716\u8868\u6578\u503C\u6B04\u4F4D",
    "undo.chartAggregationConfig": "\u5716\u8868\u805A\u5408\u65B9\u5F0F",
    "undo.chartColorPaletteConfig": "\u5716\u8868\u8272\u76E4",
    "undo.chartColorByValueConfig": "\u5716\u8868\u6309\u6578\u503C\u8457\u8272",
    "undo.chartTitleConfig": "\u5716\u8868\u6A19\u984C",
    "undo.chartHeightConfig": "\u5716\u8868\u9AD8\u5EA6",
    "undo.chartGridLinesConfig": "\u5716\u8868\u7DB2\u683C\u7DDA",
    "undo.chartAxisNamesConfig": "\u5716\u8868\u5EA7\u6A19\u8EF8\u540D\u7A31",
    "undo.chartAxisRangeConfig": "\u5716\u8868\u5EA7\u6A19\u8EF8\u7BC4\u570D",
    "undo.chartAxisMinConfig": "\u5716\u8868\u5EA7\u6A19\u8EF8\u6700\u5C0F\u503C",
    "undo.chartAxisMaxConfig": "\u5716\u8868\u5EA7\u6A19\u8EF8\u6700\u5927\u503C",
    "undo.chartShowTitleConfig": "\u5716\u8868\u6A19\u984C\u986F\u793A",
    "undo.chartDataLabelsConfig": "\u5716\u8868\u8CC7\u6599\u6A19\u7C64",
    "undo.chartDataLabelModeConfig": "\u5716\u8868\u8CC7\u6599\u6A19\u7C64\u6A21\u5F0F",
    "undo.chartDataLabelColorConfig": "\u5716\u8868\u8CC7\u6599\u6A19\u7C64\u984F\u8272",
    "undo.chartLegendConfig": "\u5716\u8868\u5716\u4F8B",
    "undo.chartSmoothLineConfig": "\u5716\u8868\u5E73\u6ED1\u7DDA",
    "undo.chartGradientAreaConfig": "\u5716\u8868\u9762\u7A4D\u6F38\u5C64",
    "undo.chartDonutCenterConfig": "\u74B0\u5F62\u5716\u4E2D\u5FC3\u6578\u503C",
    "undo.chartReferenceLineAddConfig": "\u65B0\u589E\u5716\u8868\u53C3\u8003\u7DDA",
    "undo.chartReferenceLineTypeConfig": "\u5716\u8868\u53C3\u8003\u7DDA\u985E\u578B",
    "undo.chartReferenceLineTitleConfig": "\u5716\u8868\u53C3\u8003\u7DDA\u6A19\u7C64",
    "undo.chartReferenceLineValueConfig": "\u5716\u8868\u53C3\u8003\u7DDA\u6578\u503C",
    "undo.chartReferenceLineStyleConfig": "\u5716\u8868\u53C3\u8003\u7DDA\u6A23\u5F0F",
    "undo.chartReferenceLineColorConfig": "\u5716\u8868\u53C3\u8003\u7DDA\u984F\u8272",
    "undo.chartReferenceLineRemoveConfig": "\u522A\u9664\u5716\u8868\u53C3\u8003\u7DDA",
    "undo.calendarStartFieldConfig": "\u65E5\u66C6\u958B\u59CB\u65E5\u671F\u6B04\u4F4D",
    "undo.calendarEndFieldConfig": "\u65E5\u66C6\u7D50\u675F\u65E5\u671F\u6B04\u4F4D",
    "undo.calendarTitleFieldConfig": "\u65E5\u66C6\u6A19\u984C\u6B04\u4F4D",
    "undo.calendarColorFieldConfig": "\u65E5\u66C6\u984F\u8272\u6B04\u4F4D",
    "undo.calendarMonthConfig": "\u65E5\u66C6\u6708\u4EFD",
    "undo.calendarCellSizeConfig": "\u65E5\u66C6\u55AE\u5143\u683C\u5C3A\u5BF8",
    "undo.calendarScaleConfig": "\u65E5\u66C6\u5C3A\u5EA6",
    "undo.calendarColumnSizeConfig": "\u65E5\u66C6\u5217\u5BEC",
    "undo.calendarRowSizeConfig": "\u65E5\u66C6\u884C\u9AD8",
    "undo.calendarFirstDayOfWeekConfig": "\u65E5\u66C6\u6BCF\u9031\u8D77\u59CB\u65E5",
    "undo.calendarMonthLanesConfig": "\u65E5\u66C6\u6BCF\u5929\u4E8B\u4EF6\u6578",
    "undo.calendarAllDayLanesConfig": "\u65E5\u66C6\u5168\u5929\u6B04\u884C\u6578",
    "undo.calendarSlotDurationConfig": "\u65E5\u66C6\u6642\u9593\u7C92\u5EA6",
    "undo.calendarTimeWindowConfig": "\u65E5\u66C6\u53EF\u898B\u6642\u6BB5",
    "undo.calendarHourHeightConfig": "\u65E5\u66C6\u5C0F\u6642\u9AD8\u5EA6",
    "undo.timelineStartFieldConfig": "\u6642\u9593\u7DDA\u958B\u59CB\u65E5\u671F\u6B04\u4F4D",
    "undo.timelineEndFieldConfig": "\u6642\u9593\u7DDA\u7D50\u675F\u65E5\u671F\u6B04\u4F4D",
    "undo.timelineTitleFieldConfig": "\u6642\u9593\u7DDA\u6A19\u984C\u6B04\u4F4D",
    "undo.timelineColorFieldConfig": "\u6642\u9593\u7DDA\u984F\u8272\u6B04\u4F4D",
    "undo.timelineScaleConfig": "\u6642\u9593\u7DDA\u523B\u5EA6",
    "undo.timelineAnchorConfig": "\u6642\u9593\u7DDA\u8996\u7A97",
    "undo.timelineColumnWidthConfig": "\u6642\u9593\u7DDA\u5217\u5BEC",
    "undo.showEmptyFieldsConfig": "\u7A7A\u6B04\u4F4D\u986F\u793A",
    "undo.listCompactFieldsConfig": "\u5217\u8868\u7DCA\u6E4A\u6B04\u4F4D\u4F48\u5C40",
    "undo.databaseNameConfig": "\u8CC7\u6599\u5EAB\u540D\u7A31",
    "undo.databaseDescriptionConfig": "\u8CC7\u6599\u5EAB\u63CF\u8FF0",
    "undo.databaseCoverConfig": "\u8CC7\u6599\u5EAB\u5C01\u9762",
    "undo.conditionalFormatConfig": "\u689D\u4EF6\u683C\u5F0F",
    "undo.newRecordTemplateConfig": "\u65B0\u8A18\u9304\u7BC4\u672C",
    "undo.sourceFolderConfig": "\u4F86\u6E90\u8CC7\u6599\u593E",
    "undo.sourceRulesConfig": "\u4F86\u6E90\u898F\u5247",
    "undo.newRecordFolderConfig": "\u65B0\u8A18\u9304\u8CC7\u6599\u593E",
    "undo.computedSyncModeConfig": "\u8A08\u7B97\u7D50\u679C\u5132\u5B58\u65B9\u5F0F",
    "undo.galleryCoverFieldConfig": "\u756B\u5ECA\u5C01\u9762\u6B04\u4F4D",
    "undo.galleryImageFitConfig": "\u756B\u5ECA\u5716\u7247\u9069\u61C9\u65B9\u5F0F",
    "undo.galleryCoverRatioConfig": "\u756B\u5ECA\u5C01\u9762\u6BD4\u4F8B",
    "undo.boardCoverFieldConfig": "\u770B\u677F\u5C01\u9762\u6B04\u4F4D",
    "undo.boardImageFitConfig": "\u770B\u677F\u5716\u7247\u9069\u61C9\u65B9\u5F0F",
    "undo.boardCoverRatioConfig": "\u770B\u677F\u5C01\u9762\u6BD4\u4F8B",
    "undo.titleFieldConfig": "\u6A19\u984C\u6B04\u4F4D",
    "undo.boardSubgroupConfig": "\u770B\u677F\u5B50\u5206\u7D44",
    "undo.boardColumnWidthConfig": "\u770B\u677F\u6B04\u5BEC",
    "undo.displayWidthConfig": "\u986F\u793A\u5BEC\u5EA6",
    "undo.cardOrderConfig": "\u5361\u7247\u9806\u5E8F",
    "undo.timelineDates": "\u6642\u9593\u7DDA\u65E5\u671F",
    "undo.timelineInvalidEvents": "\u7121\u6548\u6642\u9593\u4E8B\u4EF6\u4FEE\u5FA9",
    "undo.createRow": "\u65B0\u589E\u9805\u76EE",
    "undo.cardSizeConfig": "\u5361\u7247\u5C3A\u5BF8",
    "undo.groupCollapseConfig": "\u5206\u7D44\u6298\u758A",
    "undo.statusPresetConfig": "\u72C0\u614B\u9810\u8A2D",
    "undo.defaultColumnWidthConfig": "\u9810\u8A2D\u6B04\u5BEC",
    "undo.rowDensityConfig": "\u5217\u5BC6\u5EA6",
    "confirm.clearCells": "\u6E05\u9664\u9078\u53D6\u7684 {count} \u500B\u5132\u5B58\u683C\uFF1F",
    "groupOrder.textAsc": "A \u2192 Z",
    "groupOrder.textDesc": "Z \u2192 A",
    "groupOrder.numberAsc": "\u5C0F \u2192 \u5927",
    "groupOrder.numberDesc": "\u5927 \u2192 \u5C0F",
    "groupOrder.currencyAsc": "\u4F4E \u2192 \u9AD8",
    "groupOrder.currencyDesc": "\u9AD8 \u2192 \u4F4E",
    "groupOrder.dateAsc": "\u65E9 \u2192 \u665A",
    "groupOrder.dateDesc": "\u665A \u2192 \u65E9",
    "groupOrder.checkboxFalseFirst": "\u672A\u52FE\u9078\u512A\u5148",
    "groupOrder.checkboxTrueFirst": "\u5DF2\u52FE\u9078\u512A\u5148",
    "groupOrder.optionAsc": "\u4F9D\u9078\u9805\u9806\u5E8F",
    "groupOrder.optionDesc": "\u53CD\u5411\u9078\u9805\u9806\u5E8F",
    "groupOrder.multiSelectPriority": "\u4F9D\u6700\u9AD8\u512A\u5148\u7D1A\u9078\u9805\u6392\u5E8F",
    "groupOrder.custom": "\u81EA\u8A02\u5206\u7D44\u6642\u9078\u9805\u9806\u5E8F...",
    "group.expand": "\u5C55\u958B\u5206\u7D44",
    "group.collapse": "\u6298\u758A\u5206\u7D44",
    "group.expandMore": "\u5C55\u958B +{count}",
    "group.expandAll": "\u5B8C\u5168\u5C55\u958B",
    "group.collapseToLimit": "\u6536\u8D77",
    "panel.addCondition": "\u65B0\u589E\u689D\u4EF6",
    "panel.addSort": "\u65B0\u589E\u6392\u5E8F",
    "panel.emptyFilters": "\u9EDE\u9078\u4E0B\u65B9\u300C\u65B0\u589E\u689D\u4EF6\u300D\u958B\u59CB\u7BE9\u9078\u3002",
    "panel.emptySorts": "\u9EDE\u9078\u4E0B\u65B9\u300C\u65B0\u589E\u6392\u5E8F\u300D\u958B\u59CB\u591A\u689D\u4EF6\u6392\u5E8F\u3002",
    "sortPanel.calendarHint": "\u65E5\u66C6\u6AA2\u8996\u6703\u5148\u4F9D\u4E8B\u4EF6\u8DE8\u5EA6\u3001\u5168\u5929\u4E8B\u4EF6\u548C\u91CD\u758A\u6642\u6BB5\u6392\u5217\uFF0C\u6392\u5E8F\u898F\u5247\u5728\u53EF\u6392\u5E8F\u7684\u4E8B\u4EF6\u9806\u5E8F\u4E2D\u751F\u6548\u3002",
    "panel.and": "AND\uFF08\u5168\u90E8\u7B26\u5408\uFF09",
    "panel.or": "OR\uFF08\u4EFB\u4E00\u7B26\u5408\uFF09",
    "panel.field": "\u6B04\u4F4D",
    "panel.operator": "\u689D\u4EF6",
    "panel.sortDirection": "\u65B9\u5411",
    "panel.value": "\u503C",
    "panel.all": "\u5168\u90E8",
    "panel.addColumn": "\u65B0\u589E\u5C6C\u6027",
    "panel.createProperty": "\u65B0\u5EFA\u5C6C\u6027\u2026",
    "panel.dragToSort": "\u62D6\u66F3\u6392\u5E8F",
    "panel.doubleClickEdit": "\u96D9\u64CA\u7DE8\u8F2F\u5C6C\u6027",
    "panel.wrap": "\u63DB\u884C\u986F\u793A\u5B8C\u6574\u5167\u5BB9",
    "panel.groupedPropertyHidden": "\u6B64\u5C6C\u6027\u5DF2\u7528\u65BC\u5206\u7D44\u6545\u4E0D\u6703\u51FA\u73FE\u5728\u689D\u76EE\u5167\u5BB9\u4E2D",
    "panel.titleFieldHint": "\u8A72\u5C6C\u6027\u5DF2\u88AB\u7528\u4F5C\u6A19\u984C\u3002",
    "panel.groupFieldHint": "\u8A72\u5C6C\u6027\u5DF2\u7528\u65BC\u5206\u7D44\u6545\u4E0D\u6703\u51FA\u73FE\u5728\u689D\u76EE\u5167\u5BB9\u4E2D\u3002",
    "panel.subgroupFieldHint": "\u8A72\u5C6C\u6027\u5DF2\u7528\u65BC\u5B50\u5206\u7D44\u6545\u4E0D\u6703\u51FA\u73FE\u5728\u689D\u76EE\u5167\u5BB9\u4E2D\u3002",
    "panel.open": "\u6253\u958B",
    "panel.noProperties": "\u6C92\u6709\u5C6C\u6027",
    "panel.hiddenProperties": "\u96B1\u85CF\u5C6C\u6027",
    "viewConfig.title": "\u6AA2\u8996\u8A2D\u5B9A",
    "viewConfig.databaseSection": "\u76EE\u524D\u8CC7\u6599\u5EAB",
    "viewConfig.viewSection": "\u76EE\u524D\u6AA2\u8996",
    "viewConfig.viewSourceRules": "\u555F\u7528\u672C\u8996\u5716\u4F86\u6E90\u898F\u5247",
    "viewConfig.viewSourceRulesHint": "\u555F\u7528\u5F8C\uFF0C\u9019\u4E9B\u898F\u5247\uFF08\u4F86\u81EA\u5D4C\u5165\u6216 .base \u8F49\u63DB\uFF09\u8207\u8CC7\u6599\u5EAB\u4F86\u6E90\u898F\u5247\u758A\u52A0\u751F\u6548\uFF1B\u95DC\u9589\u5247\u4E0D\u751F\u6548\u3002",
    "undo.viewSourceRulesConfig": "\u8996\u5716\u4F86\u6E90\u898F\u5247",
    "viewConfig.viewType": "\u6AA2\u8996\u985E\u578B",
    "viewConfig.summarySumField": "SUM \u6B04\u4F4D",
    "viewConfig.summarySumFieldNone": "\u4E0D\u986F\u793A",
    "viewConfig.summaryField": "\u5F59\u7E3D",
    "viewConfig.summaryFieldNone": "\u79FB\u9664\u5F59\u7E3D",
    "viewConfig.summaryAdd": "+ \u5F59\u7E3D",
    "viewConfig.summaryCount": "\u8A08\u6578",
    "viewConfig.summaryUnique": "\u552F\u4E00\u503C",
    "viewConfig.summaryEmpty": "\u7A7A\u503C",
    "viewConfig.summaryFilled": "\u975E\u7A7A",
    "viewConfig.summaryChecked": "\u5DF2\u52FE\u9078",
    "viewConfig.summaryUnchecked": "\u672A\u52FE\u9078",
    "viewConfig.summaryEarliest": "\u6700\u65E9",
    "viewConfig.summaryLatest": "\u6700\u665A",
    "viewConfig.summaryStddev": "\u6A19\u6E96\u5DEE",
    "viewConfig.databaseReadonly": "\u6B64\u8655\u50C5\u986F\u793A\u8CC7\u6599\u5EAB\u8A2D\u5B9A\uFF1B\u5982\u9700\u4FEE\u6539\uFF0C\u8ACB\u79FB\u52D5\u5230\u5B8C\u6574\u8CC7\u6599\u5EAB\u4ECB\u9762\u4E2D\u3002",
    "viewConfig.noTableSettings": "\u8868\u683C\u6AA2\u8996\u66AB\u7121\u984D\u5916\u7248\u9762\u8A2D\u5B9A\u3002",
    "viewConfig.noExtraSettings": "\u6B64\u6AA2\u8996\u66AB\u7121\u984D\u5916\u7248\u9762\u8A2D\u5B9A\u3002",
    "chart.other": "\u5176\u4ED6",
    "chart.countLabel": "\u8A08\u6578",
    "chart.noFields": "\u6C92\u6709\u53EF\u5206\u985E\u7684\u6B04\u4F4D\u3002\u8ACB\u5148\u5EFA\u7ACB select\u3001status\u3001multi-select \u6216 checkbox \u5C6C\u6027\u3002",
    "chart.noFieldSelected": "\u8ACB\u5728\u6AA2\u8996\u8A2D\u5B9A\u4E2D\u9078\u64C7\u7D71\u8A08\u6B04\u4F4D\u3002",
    "chart.noValueFieldSelected": "\u8ACB\u5728\u6AA2\u8996\u8A2D\u5B9A\u4E2D\u9078\u64C7\u6578\u503C\u6B04\u4F4D\u3002",
    "chart.noRecords": "\u76EE\u524D\u7BE9\u9078\u689D\u4EF6\u4E0B\u6C92\u6709\u53EF\u7D71\u8A08\u7684\u7B46\u8A18\u3002",
    "chart.allGroupsHidden": "\u6240\u6709\u5716\u8868\u5206\u7D44\u90FD\u5DF2\u96B1\u85CF\u3002\u8ACB\u5728\u5716\u8868\u9078\u9805\u4E2D\u81F3\u5C11\u986F\u793A\u4E00\u500B\u5206\u7D44\u3002",
    "chart.showAllGroups": "\u986F\u793A\u6240\u6709\u5206\u7D44",
    "chart.invalidAxisRange": "\u8ACB\u8F38\u5165\u5927\u65BC\u6700\u5C0F\u503C\u7684\u6578\u503C\u8EF8\u6700\u5927\u503C\u3002",
    "chart.resetAxisRange": "\u91CD\u8A2D\u6578\u503C\u8EF8\u7BC4\u570D",
    "chart.chooseDefaultGroup": "\u9078\u64C7\u9810\u8A2D\u5206\u7D44",
    "chart.chooseDefaultValue": "\u9078\u64C7\u9810\u8A2D\u6578\u503C\u6B04\u4F4D",
    "chart.barChart": "\u9577\u689D\u5716",
    "chart.stackedBarChart": "\u5806\u758A\u9577\u689D\u5716",
    "chart.groupedBarChart": "\u5206\u7D44\u9577\u689D\u5716",
    "chart.percentStackedBarChart": "\u767E\u5206\u6BD4\u5806\u758A\u9577\u689D\u5716",
    "chart.horizontalBarChart": "\u6C34\u5E73\u9577\u689D\u5716",
    "chart.lineChart": "\u6298\u7DDA\u5716",
    "chart.areaChart": "\u9762\u7A4D\u5716",
    "chart.pieChart": "\u5713\u9905\u5716",
    "chart.donutChart": "\u74B0\u5F62\u5716",
    "chart.numberChart": "\u55AE\u4E00\u6578\u5B57",
    "chart.mixedChart": "\u6DF7\u5408\u5716",
    "chart.total": "\u7E3D\u8A08",
    "chart.countAggregation": "\u8A08\u6578",
    "chart.sumAggregation": "\u52A0\u7E3D",
    "chart.avgAggregation": "\u5E73\u5747\u503C",
    "chart.medianAggregation": "\u4E2D\u4F4D\u6578",
    "chart.minAggregation": "\u6700\u5C0F\u503C",
    "chart.maxAggregation": "\u6700\u5927\u503C",
    "chart.rangeAggregation": "\u7BC4\u570D",
    "chart.uniqueAggregation": "\u552F\u4E00\u503C",
    "chart.emptyAggregation": "\u7A7A\u503C",
    "chart.notEmptyAggregation": "\u975E\u7A7A\u503C",
    "chart.percentEmptyAggregation": "\u7A7A\u503C\u767E\u5206\u6BD4",
    "chart.percentNotEmptyAggregation": "\u975E\u7A7A\u767E\u5206\u6BD4",
    "chart.checkedAggregation": "\u5DF2\u52FE\u9078",
    "chart.uncheckedAggregation": "\u672A\u52FE\u9078",
    "chart.percentCheckedAggregation": "\u52FE\u9078\u767E\u5206\u6BD4",
    "chart.toolbarType": "\u985E\u578B",
    "chart.toolbarGroup": "\u5206\u7D44",
    "chart.toolbarBucket": "\u7C92\u5EA6",
    "chart.toolbarStack": "\u5806\u758A",
    "chart.toolbarSeries": "\u5B50\u5206\u7D44",
    "chart.toolbarSubgroup": "\u5B50\u5206\u7D44",
    "chart.toolbarAggregation": "\u805A\u5408",
    "chart.toolbarValue": "\u6578\u503C",
    "chart.toolbarLineAggregation": "\u7DDA\u805A\u5408",
    "chart.toolbarLineValue": "\u7DDA\u6578\u503C",
    "chart.recordsValue": "\u8A18\u9304",
    "chart.exportImage": "\u532F\u51FA PNG",
    "chart.copyPng": "\u8907\u88FD PNG",
    "chart.exportedImage": "\u5DF2\u532F\u51FA\u5716\u8868\u5716\u7247",
    "chart.copiedPng": "\u5DF2\u8907\u88FD PNG",
    "chart.exportUnavailable": "\u76EE\u524D\u6C92\u6709\u53EF\u532F\u51FA\u7684\u5716\u8868\u5716\u7247\u3002",
    "chart.dateBucketDay": "\u65E5",
    "chart.dateBucketWeek": "\u9031",
    "chart.dateBucketMonth": "\u6708",
    "chart.dateBucketQuarter": "\u5B63\u5EA6",
    "chart.dateBucketYear": "\u5E74",
    "chart.numberBucketAuto": "\u81EA\u52D5",
    "chart.numberBucketFixed": "\u56FA\u5B9A",
    "chart.numberBucketSize": "\u5340\u9593\u5927\u5C0F",
    "chart.options": "\u5716\u8868\u9078\u9805",
    "chart.optionsData": "\u8CC7\u6599",
    "chart.optionsStyle": "\u6A23\u5F0F",
    "chart.optionsExport": "\u532F\u51FA",
    "chart.autoTitleCount": "\u8A08\u6578",
    "chart.autoTitleValue": "{value} \u7684{aggregation}",
    "chart.autoTitleCountBy": "\u4F9D {group} \u8A08\u6578",
    "chart.autoTitleValueBy": "\u4F9D {group} \u67E5\u770B {value} \u7684{aggregation}",
    "chart.autoTitleMixed": "\u4F9D {group} \u67E5\u770B {primary} \u548C {secondary}",
    "chart.autoTitleDateGroup": "\u4F9D{bucket}\u7D71\u8A08 {field}",
    "chart.autoTitleNumberBucketGroup": "{field}\u5340\u9593",
    "chart.sortBy": "\u6392\u5E8F",
    "chart.sortOptionOrder": "\u9078\u9805\u9806\u5E8F",
    "chart.sortValueDesc": "\u6578\u503C\u964D\u5E8F",
    "chart.sortValueAsc": "\u6578\u503C\u5347\u5E8F",
    "chart.sortLabelAsc": "\u6A19\u7C64 A-Z",
    "chart.sortLabelDesc": "\u6A19\u7C64 Z-A",
    "chart.visibleGroups": "\u53EF\u898B\u5206\u7D44",
    "chart.visibleGroupsEntry": "\u9078\u64C7\u5206\u7D44",
    "chart.omitZeroValues": "\u96B1\u85CF 0 \u503C",
    "chart.cumulative": "\u7D2F\u8A08",
    "chart.title": "\u6A19\u984C",
    "chart.titleHelp": "\u7559\u7A7A\u6642\u4F7F\u7528\u81EA\u52D5\u7522\u751F\u7684\u5716\u8868\u6A19\u984C\u3002",
    "chart.height": "\u9AD8\u5EA6",
    "chart.heightSmall": "\u5C0F",
    "chart.heightMedium": "\u4E2D",
    "chart.heightLarge": "\u5927",
    "chart.heightXLarge": "\u8D85\u5927",
    "chart.gridLines": "\u683C\u7DDA",
    "chart.gridNone": "\u7121",
    "chart.gridValue": "\u6578\u503C\u8EF8",
    "chart.gridBoth": "\u96D9\u8EF8",
    "chart.axisNames": "\u8EF8\u540D\u7A31",
    "chart.axisNone": "\u7121",
    "chart.axisX": "X \u8EF8",
    "chart.axisY": "Y \u8EF8",
    "chart.axisBoth": "\u96D9\u8EF8",
    "chart.valueAxisRange": "\u6578\u503C\u8EF8",
    "chart.axisAuto": "\u81EA\u52D5",
    "chart.axisZeroBased": "\u5F9E 0 \u958B\u59CB",
    "chart.axisCustom": "\u81EA\u8A02",
    "chart.axisMin": "\u6700\u5C0F\u503C",
    "chart.axisMax": "\u6700\u5927\u503C",
    "chart.referenceLines": "\u53C3\u8003\u7DDA",
    "chart.referenceLinesEntry": "\u53C3\u8003\u7DDA",
    "chart.referenceLineConstant": "\u56FA\u5B9A\u503C",
    "chart.referenceLineAverage": "\u5E73\u5747\u503C",
    "chart.referenceLineMedian": "\u4E2D\u4F4D\u6578",
    "chart.referenceLineMin": "\u6700\u5C0F\u503C",
    "chart.referenceLineMax": "\u6700\u5927\u503C",
    "chart.referenceLineStyle": "\u7DDA\u578B",
    "chart.referenceLineSolid": "\u5BE6\u7DDA",
    "chart.referenceLineDashed": "\u865B\u7DDA",
    "chart.referenceLineDotted": "\u9EDE\u7DDA",
    "chart.referenceLineColor": "\u984F\u8272",
    "chart.addReferenceLine": "\u589E\u52A0\u53C3\u8003\u7DDA +",
    "chart.referenceLineColorDefault": "\u9810\u8A2D",
    "chart.referenceLineColorGray": "\u7070\u8272",
    "chart.referenceLineColorBlue": "\u85CD\u8272",
    "chart.referenceLineColorGreen": "\u7DA0\u8272",
    "chart.referenceLineColorAmber": "\u7425\u73C0",
    "chart.referenceLineColorRed": "\u7D05\u8272",
    "chart.referenceLineColorPurple": "\u7D2B\u8272",
    "chart.referenceLineColorPink": "\u7C89\u8272",
    "chart.colorPalette": "\u984F\u8272",
    "chart.colorPaletteAuto": "\u81EA\u52D5",
    "chart.colorPaletteAccent": "\u5F37\u8ABF\u8272",
    "chart.colorPaletteColorful": "\u843D\u65E5",
    "chart.colorPalettePastel": "\u85B0\u8863\u8349",
    "chart.colorPaletteVivid": "\u8393\u679C",
    "chart.colorPaletteWarm": "\u816E\u7D05",
    "chart.colorPaletteCool": "\u6D77\u6D0B",
    "chart.colorPaletteMono": "\u77F3\u58A8",
    "chart.colorPaletteOption": "\u9078\u9805\u984F\u8272",
    "chart.colorByValue": "\u4F9D\u6578\u503C\u8457\u8272",
    "chart.dataLabelMode": "\u6A19\u7C64\u6A21\u5F0F",
    "chart.dataLabelColor": "\u6A19\u7C64\u984F\u8272",
    "chart.dataLabelColorAuto": "\u81EA\u52D5\u5C0D\u6BD4",
    "chart.dataLabelColorDark": "\u6DF1\u8272",
    "chart.dataLabelColorLight": "\u6DFA\u8272",
    "chart.dataLabelColorAccent": "\u5F37\u8ABF\u8272",
    "chart.dataLabelValue": "\u6578\u503C",
    "chart.dataLabelPercent": "\u767E\u5206\u6BD4",
    "chart.dataLabelLabelValue": "\u6A19\u7C64 + \u6578\u503C",
    "chart.optionsStyleEntry": "\u8ABF\u6574\u6A23\u5F0F",
    "chart.showTitle": "\u986F\u793A\u6A19\u984C",
    "chart.showDataLabels": "\u8CC7\u6599\u6A19\u7C64",
    "chart.showLegend": "\u5716\u4F8B",
    "chart.smoothLine": "\u5E73\u6ED1\u7DDA\u689D",
    "chart.gradientArea": "\u6F38\u5C64\u9762\u7A4D",
    "chart.donutCenter": "\u4E2D\u5FC3\u6578\u503C",
    "chart.donutCenterHidden": "\u96B1\u85CF",
    "chart.donutCenterTotal": "\u7E3D\u8A08",
    "chart.donutCenterAggregation": "\u805A\u5408\u503C",
    "chart.applyFilter": "\u5957\u7528\u70BA\u7BE9\u9078",
    "chart.drilldownSummary": "{count} \u7B46\u7B26\u5408\u8A18\u9304",
    "chart.drilldownFile": "\u6A94\u6848",
    "chart.drilldownPath": "\u8DEF\u5F91",
    "chart.drilldownOpenAll": "\u5168\u90E8\u958B\u555F",
    "chart.drilldownCopyLinks": "\u8907\u88FD\u9023\u7D50",
    "chart.drilldownCopiedLinks": "\u5DF2\u8907\u88FD {count} \u500B\u9023\u7D50",
    "chart.drilldownMore": "\u9084\u6709 {count} \u7B46",
    "chart.fieldGroup.properties": "\u5C6C\u6027",
    "chart.fieldGroup.formulas": "\u8A08\u7B97\u6B04\u4F4D",
    "chart.fieldGroup.fileMetadata": "\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599",
    "chart.disabledBarOnly": "\u50C5\u5728\u67F1\u72C0\u5716\u53EF\u7528\u3002",
    "chart.disabledLineAreaMixed": "\u50C5\u5728\u6298\u7DDA\u5716\u3001\u9762\u7A4D\u5716\u6216\u6DF7\u5408\u5716\u53EF\u7528\u3002",
    "chart.disabledDonutOnly": "\u50C5\u5728\u74B0\u5F62\u5716\u53EF\u7528\u3002",
    "chart.disabledNeedsGroups": "\u9078\u64C7\u6709\u53EF\u7528\u5206\u7D44\u7684\u6B04\u4F4D\u5F8C\u53EF\u7528\u3002",
    "chart.disabledCumulative": "\u50C5\u5728\u67F1\u72C0\u5716\u3001\u6298\u7DDA\u5716\u6216\u9762\u7A4D\u5716\u7684 Count / Sum \u53EF\u7528\u3002",
    "chart.disabledAggregationForValue": "\u50C5\u5728\u652F\u63F4\u6B64\u805A\u5408\u7684\u6B04\u4F4D\u53EF\u7528\u3002",
    "chart.disabledAggregationNeedsValue": "\u9078\u64C7\u6578\u503C\u6B04\u4F4D\u5F8C\u53EF\u7528\u3002",
    "chart.disabledAggregationNumericOnly": "\u50C5\u652F\u63F4\u6578\u503C\u6216\u8CA8\u5E63\u6B04\u4F4D\u3002",
    "chart.disabledAggregationCheckboxOnly": "\u50C5\u652F\u63F4\u6838\u53D6\u65B9\u584A\u6B04\u4F4D\u3002",
    "calendar.noDateField": "\u8ACB\u70BA\u65E5\u66C6\u6AA2\u8996\u9078\u64C7\u4E00\u500B\u65E5\u671F\u5C6C\u6027\u3002",
    "calendar.noWritableDateField": "\u8ACB\u5148\u9078\u64C7\u4E00\u500B\u53EF\u5BEB\u7684\u65E5\u671F\u5C6C\u6027\uFF0C\u518D\u7DE8\u8F2F\u65E5\u66C6\u6216\u6642\u9593\u7DDA\u65E5\u671F\u3002",
    "calendar.noDateChange": "\u65E5\u671F\u672A\u8B8A\u66F4",
    "calendar.sameDateFieldWarning": "\u958B\u59CB\u548C\u7D50\u675F\u4F7F\u7528\u4E86\u540C\u4E00\u500B\u5C6C\u6027\u3002\u82E5\u8981\u7A69\u5B9A\u5132\u5B58\u6642\u9593\u6BB5\u4E26\u62D6\u66F3\u8ABF\u6574\u5169\u7AEF\uFF0C\u8ACB\u4F7F\u7528\u5169\u500B\u4E0D\u540C\u7684\u65E5\u671F\u5C6C\u6027\u3002",
    "calendar.sameDateFieldNotice": "\u958B\u59CB\u548C\u7D50\u675F\u90FD\u4F7F\u7528\u4E86\u300C{field}\u300D\u3002\u55AE\u4E00\u5C6C\u6027\u53EA\u80FD\u5132\u5B58\u5176\u4E2D\u4E00\u7AEF\uFF1B\u82E5\u8981\u7A69\u5B9A\u62D6\u66F3\u8ABF\u6574\uFF0C\u8ACB\u4F7F\u7528\u4E0D\u540C\u7684\u958B\u59CB\uFF0F\u7D50\u675F\u5C6C\u6027\u3002",
    "calendar.convertDateTimeTitle": "\u8F49\u63DB\u70BA\u65E5\u671F\u548C\u6642\u9593\uFF1F",
    "calendar.convertDateTimeMessage": "\u9019\u6B21\u7DE8\u8F2F\u6703\u5BEB\u5165\u5177\u9AD4\u6642\u9593\u3002\u662F\u5426\u5C07 {fields} \u8F49\u63DB\u70BA\u65E5\u671F\u548C\u6642\u9593\u5C6C\u6027\uFF0C\u4EE5\u4FBF Obsidian \u4FDD\u7559\u6642\u9593\u90E8\u5206\uFF1F",
    "calendar.convertDateTimeConfirm": "\u8F49\u63DB",
    "calendar.noEvents": "\u6C92\u6709\u53EF\u5728\u65E5\u66C6\u4E2D\u986F\u793A\u7684\u65E5\u671F\u8A18\u9304\u3002",
    "calendar.moreEvents": "\u9084\u6709 {count} \u689D",
    "calendar.moreEventsTitle": "{date} \u9084\u6709 {count} \u689D\u4E8B\u4EF6",
    "calendar.resizeStart": "\u8ABF\u6574\u958B\u59CB\u65E5\u671F",
    "calendar.resizeEnd": "\u8ABF\u6574\u7D50\u675F\u65E5\u671F",
    "calendar.moveToday": "\u79FB\u5230\u4ECA\u5929",
    "calendar.movePrevDay": "\u63D0\u524D\u4E00\u5929",
    "calendar.moveNextDay": "\u63A8\u5F8C\u4E00\u5929",
    "calendar.moveToDate": "\u79FB\u52D5\u5230\u65E5\u671F",
    "calendar.moveToDatePrompt": "\u8ACB\u8F38\u5165\u65E5\u671F\uFF0C\u683C\u5F0F\u70BA YYYY-MM-DD",
    "calendar.extendOneDay": "\u5EF6\u9577\u4E00\u5929",
    "calendar.shortenOneDay": "\u7E2E\u77ED\u4E00\u5929",
    "calendar.noAllDayEvents": "\u7121\u5168\u5929 / \u8DE8\u5929\u4E8B\u4EF6",
    "timeline.noDateField": "\u8ACB\u70BA\u6642\u9593\u7DDA\u6AA2\u8996\u9078\u64C7\u4E00\u500B\u65E5\u671F\u5C6C\u6027\u3002",
    "timeline.dayRequiresDateTime": "\u6642\u9593\u7DDA\u65E5\u6AA2\u8996\u9700\u8981\u958B\u59CB\uFF0F\u7D50\u675F\u5C6C\u6027\u90FD\u662F\u65E5\u671F\u548C\u6642\u9593\u3002\u8ACB\u958B\u555F\u5B8C\u6574\u8CC7\u6599\u5EAB\u6AA2\u8996\u4E26\u5148\u8F49\u63DB\u65E5\u671F\u5C6C\u6027\u3002",
    "timeline.invalidEventsNotice": "\u767C\u73FE {count} \u500B\u7121\u6548\u6642\u9593\u4E8B\u4EF6\uFF08\u7D50\u675F\u6642\u9593\u4E0D\u665A\u65BC\u958B\u59CB\u6642\u9593\uFF09\uFF0C\u5DF2\u96B1\u85CF\u3002",
    "timeline.invalidEventsCalculating": "\u6B63\u5728\u6AA2\u67E5\u7121\u6548\u6642\u9593\u4E8B\u4EF6...",
    "timeline.viewInvalidEvents": "\u67E5\u770B\u4E26\u4FEE\u5FA9",
    "timeline.invalidEventsConflictNotice": "{count} \u500B\u4E8B\u4EF6\u6642\u9593\u885D\u7A81\uFF08\u7D50\u675F\u2264\u958B\u59CB\uFF09",
    "timeline.fixInvalidEvents": "\u4FEE\u5FA9",
    "timeline.invalidEventsNone": "\u672A\u767C\u73FE\u7121\u6548\u6642\u9593\u4E8B\u4EF6\u3002",
    "timeline.invalidEventsTitle": "\u7121\u6548\u6642\u9593\u4E8B\u4EF6",
    "timeline.invalidEventsTitleWithCount": "\u7121\u6548\u6642\u9593\u4E8B\u4EF6\uFF08{count}\uFF09",
    "timeline.invalidEventsDesc": "\u9019\u4E9B\u4E8B\u4EF6\u7684\u7D50\u675F\u6642\u9593\u65E9\u65BC\u6216\u7B49\u65BC\u958B\u59CB\u6642\u9593\uFF0C\u5DF2\u5728\u6642\u9593\u7DDA\u96B1\u85CF\u3002\u8ACB\u8ABF\u6574\u958B\u59CB/\u7D50\u675F\u6642\u9593\uFF0C\u4F7F\u7D50\u675F\u665A\u65BC\u958B\u59CB\u3002",
    "timeline.invalidEventsNote": "\u7B46\u8A18",
    "timeline.invalidEventsStart": "\u958B\u59CB",
    "timeline.invalidEventsEnd": "\u7D50\u675F",
    "timeline.invalidEventsSpan": "\u6642\u9577",
    "timeline.invalidEventsSelectAll": "\u9078\u64C7\u6240\u6709\u7121\u6548\u4E8B\u4EF6",
    "timeline.invalidEventsSelectRow": "\u9078\u64C7 {name}",
    "timeline.invalidEventsSelected": "\u5DF2\u9078\u64C7 {count} \u500B",
    "timeline.invalidEventsQuickFix": "\u4E00\u9375\u4FEE\u5FA9\u6240\u9078",
    "timeline.invalidEventsQuickFixShort": "\u4FEE\u5FA9",
    "timeline.invalidEventsStillInvalid": "\u4ECD\u7121\u6548",
    "timeline.invalidEventsSpanDays": "{count} \u5929",
    "timeline.invalidEventsSpanHours": "{count} \u5C0F\u6642",
    "timeline.invalidEventsSpanHoursMinutes": "{hours} \u5C0F\u6642 {minutes} \u5206\u9418",
    "timeline.invalidEventsSpanMinutes": "{count} \u5206\u9418",
    "timeline.invalidEventsConfirm": "\u5132\u5B58\u8B8A\u66F4",
    "propertyConflict.title": "\u5C6C\u6027\u985E\u578B\u885D\u7A81",
    "propertyConflict.desc": "\u767C\u73FE {count} \u500B\u5C6C\u6027\u885D\u7A81\u3002\u8ACB\u5148\u7D71\u4E00\u4E0B\u5217\u8CC7\u6599\u5EAB\u5B9A\u7FA9\uFF0C\u6216\u9078\u64C7\u4ECD\u7136\u8B8A\u66F4\u4E26\u4FDD\u7559\u885D\u7A81\u3002",
    "propertyConflict.typeMismatch": "\u985E\u578B\u4E0D\u4E00\u81F4",
    "propertyConflict.datePrecision": "\u65E5\u671F\u7CBE\u5EA6",
    "propertyConflict.datePrecisionHint": "\u540C\u4E00\u500B\u5C6C\u6027 key \u540C\u6642\u88AB\u5B9A\u7FA9\u70BA\u65E5\u671F\u548C\u65E5\u671F\u6642\u9593\u3002\u5982\u679C\u4EFB\u4E00\u8CC7\u6599\u5EAB\u9700\u8981\u6642\u9593\u503C\uFF0C\u5EFA\u8B70\u7D71\u4E00\u70BA\u65E5\u671F\u6642\u9593\uFF1B\u8F49\u6210\u65E5\u671F\u53EF\u80FD\u907A\u5931\u6642\u9593\u3002",
    "propertyConflict.computedHint": "\u5132\u5B58\u578B\u8A08\u7B97\u6B04\u4F4D\u6703\u53C3\u8207\u6AA2\u6E2C\uFF0C\u56E0\u70BA\u8A72\u8CC7\u6599\u5EAB\u53EF\u80FD\u628A\u516C\u5F0F\u7D50\u679C\u5BEB\u56DE frontmatter\u3002",
    "propertyConflict.ignore": "\u66AB\u6642\u5FFD\u7565",
    "propertyConflict.dismissSession": "\u672C\u6B21\u5DE5\u4F5C\u968E\u6BB5\u4E0D\u518D\u63D0\u9192",
    "propertyConflict.openProperties": "\u958B\u555F\u5C6C\u6027\u7BA1\u7406",
    "propertyConflict.ignoreAndApply": "\u50C5\u7E7C\u7E8C\u672C\u6B21\u8B8A\u66F4",
    "propertyConflict.applyResolvedTypes": "\u63D0\u4EA4\u5DF2\u89E3\u6C7A\u7684\u985E\u578B",
    "propertyConflict.resolved": "\u6240\u6709\u885D\u7A81\u90FD\u5DF2\u89E3\u6C7A\uFF0C\u5C07\u63D0\u4EA4\u9019\u4E9B\u985E\u578B\u4FEE\u6539\u3002",
    "propertyConflict.unresolved": "\u8ACB\u5148\u81F3\u5C11\u89E3\u6C7A\u4E00\u500B\u5C6C\u6027\u885D\u7A81\uFF0C\u518D\u63D0\u4EA4\u4FEE\u6539\u3002",
    "propertyConflict.partialResolved": "\u5C07\u63D0\u4EA4 {resolved} \u500B\u5DF2\u89E3\u6C7A\u885D\u7A81\uFF1B{unresolved} \u500B\u672A\u89E3\u6C7A\u885D\u7A81\u6703\u4FDD\u6301\u4E0D\u8B8A\u3002",
    "propertyConflict.statusResolved": "\u5DF2\u89E3\u6C7A",
    "propertyConflict.statusUnresolved": "\u672A\u89E3\u6C7A",
    "propertyConflict.observableTypesLabel": "\u885D\u7A81\u7684 frontmatter \u503C\u5F62\u614B",
    "propertyConflict.detectedTypesLabel": "\u76EE\u524D\u767C\u73FE\u7684\u985E\u578B",
    "propertyConflict.detectedTypesSummary": "\u6AA2\u6E2C\u5230 {count} \u7A2E\u5E95\u5C64\u5132\u5B58\u5F62\u614B\uFF1A",
    "propertyConflict.fileCount": "\uFF08{count} \u500B\u6A94\u6848\uFF09",
    "propertyConflict.resolveInstruction": "\u9700\u8981\u7D71\u4E00\u70BA\u76F8\u5BB9\u985E\u578B\u624D\u80FD\u7E7C\u7E8C\u3002",
    "propertyConflict.affectedFiles": "\u6D89\u53CA\u8CC7\u6599\u5EAB\u6A94\u6848\uFF08{count} \u500B\uFF09",
    "propertyConflict.currentStorage": "\u5E95\u5C64\u5132\u5B58",
    "propertyConflict.changeTo": "\u6539\u70BA",
    "propertyConflict.pluginType": "\u63D2\u4EF6\u985E\u578B",
    "propertyConflict.targetStorage": "\u5C07\u5132\u5B58\u70BA",
    "propertyConflict.targetStorageSame": "\u4ECD\u5C07\u5132\u5B58\u70BA",
    "propertyConflict.targetStorageChanged": "\u5C07\u5132\u5B58\u70BA",
    "propertyConflict.conflictItem": "\u885D\u7A81\u76EE\u6A19\u985E\u578B\uFF1A{type}",
    "propertyConflict.columnDatabaseName": "\u8CC7\u6599\u5EAB\u540D",
    "propertyConflict.columnDatabasePath": "\u8CC7\u6599\u5EAB\u6A94\u6848\u8DEF\u5F91",
    "propertyConflict.columnObsidianType": "\u76EE\u524D\u5132\u5B58\u5F62\u5F0F",
    "propertyConflict.columnPluginType": "\u5C6C\u6027\u985E\u578B",
    "propertyConflict.columnTargetStorageType": "\u76EE\u6A19\u5132\u5B58\u5F62\u5F0F",
    "propertyConflict.changeTypeFor": "\u4FEE\u6539 {database} \u4E2D {key} \u7684\u985E\u578B",
    "propertyConflict.updatedDefinitions": "\u5DF2\u66F4\u65B0 {count} \u500B\u8CC7\u6599\u5EAB\u4E2D {key} \u7684\u985E\u578B\u5B9A\u7FA9\u3002",
    "propertyConflict.sourceColumn": "\u5C6C\u6027\u6B04",
    "propertyConflict.sourceComputed": "\u5132\u5B58\u578B\u516C\u5F0F",
    "propertyConflict.observable.text": "\u6587\u5B57",
    "propertyConflict.observable.multitext": "\u591A\u6587\u5B57",
    "propertyConflict.observable.number": "\u6578\u5B57",
    "propertyConflict.observable.date": "\u65E5\u671F",
    "propertyConflict.observable.datetime": "\u65E5\u671F\u548C\u6642\u9593",
    "propertyConflict.observable.checkbox": "\u6838\u53D6\u65B9\u584A",
    "timeline.noEvents": "\u6C92\u6709\u53EF\u5728\u6642\u9593\u7DDA\u4E2D\u986F\u793A\u7684\u65E5\u671F\u8A18\u9304\u3002",
    "timeline.noEventsInRange": "\u76EE\u524D\u6642\u9593\u7BC4\u570D\u5167\u6C92\u6709\u65E5\u671F\u8A18\u9304\u3002",
    "timeline.uncategorized": "\u672A\u5206\u7D44",
    "timeline.today": "\u4ECA\u5929",
    "timeline.prevShort": "\u5411\u5DE6\u79FB\u52D5\u4E00\u6B04",
    "timeline.nextShort": "\u5411\u53F3\u79FB\u52D5\u4E00\u6B04",
    "timeline.prevLong": "\u5411\u5DE6\u79FB\u52D5\u4E00\u5C4F",
    "timeline.nextLong": "\u5411\u53F3\u79FB\u52D5\u4E00\u5C4F",
    "timeline.prevDay": "\u4E0A\u4E00\u5929",
    "timeline.nextDay": "\u4E0B\u4E00\u5929",
    "timeline.prevWeek": "\u4E0A\u4E00\u9031",
    "timeline.nextWeek": "\u4E0B\u4E00\u9031",
    "timeline.prevMonth": "\u4E0A\u4E00\u6708",
    "timeline.nextMonth": "\u4E0B\u4E00\u6708",
    "timeline.prevQuarter": "\u4E0A\u4E00\u5B63",
    "timeline.nextQuarter": "\u4E0B\u4E00\u5B63",
    "timeline.scaleDay": "\u65E5",
    "timeline.scaleWeek": "\u9031",
    "timeline.scaleMonth": "\u6708",
    "timeline.scaleQuarter": "\u5B63",
    "timeline.columnWidth": "\u5217\u5BEC",
    "timeline.layoutSection": "\u7248\u9762",
    "timeline.jumpToEvent": "\u8DF3\u8F49\u5230 {date} \u7684 {title}",
    "viewConfig.customColumnWidth": "\u81EA\u8A02\u5217\u5BEC",
    "viewConfig.eventStartDateField": "\u958B\u59CB\u65E5\u671F",
    "viewConfig.eventEndDateField": "\u7D50\u675F\u65E5\u671F",
    "viewConfig.eventTitleField": "\u4E8B\u4EF6\u6A19\u984C",
    "viewConfig.eventColorField": "\u4E8B\u4EF6\u984F\u8272",
    "viewConfig.noColorField": "\u4E0D\u4F9D\u984F\u8272\u5340\u5206",
    "viewConfig.calendarKeepCellAspectRatio": "\u4FDD\u6301\u65E5\u671F\u683C\u70BA\u65B9\u5F62",
    "viewConfig.calendarCellHeight": "\u65E5\u66C6\u55AE\u5143\u683C\u9AD8\u5EA6",
    "viewConfig.calendarCustomColumnWidth": "\u81EA\u8A02\u5217\u5BEC",
    "viewConfig.calendarColumnWidthValue": "\u5217\u5BEC",
    "viewConfig.calendarCustomRowHeight": "\u81EA\u8A02\u884C\u9AD8",
    "viewConfig.calendarWeekSlotDuration": "\u6642\u9593\u7C92\u5EA6",
    "viewConfig.calendarWeekSlotDuration.15": "15 \u5206\u9418",
    "viewConfig.calendarWeekSlotDuration.30": "30 \u5206\u9418",
    "viewConfig.calendarWeekSlotDuration.60": "60 \u5206\u9418",
    "viewConfig.calendarStartHour": "\u958B\u59CB\u5C0F\u6642",
    "viewConfig.calendarEndHour": "\u7D50\u675F\u5C0F\u6642",
    "viewConfig.calendarHourHeight": "\u5C0F\u6642\u9AD8\u5EA6",
    "viewConfig.calendarColumnSizeMode": "\u6B04\u5BEC\u6A21\u5F0F",
    "viewConfig.calendarColumnSizeMode.adaptive": "\u81EA\u9069\u61C9",
    "viewConfig.calendarColumnSizeMode.custom": "\u81EA\u8A02",
    "viewConfig.calendarRowSizeMode": "\u884C\u9AD8\u6A21\u5F0F",
    "viewConfig.calendarRowSizeMode.adaptive": "\u81EA\u9069\u61C9",
    "viewConfig.calendarRowSizeMode.custom": "\u81EA\u8A02",
    "viewConfig.calendarRowHeightValue": "\u884C\u9AD8",
    "viewConfig.calendarFirstDayOfWeek": "\u6BCF\u9031\u8D77\u59CB\u65E5",
    "viewConfig.dateGroupIgnoreTime": "\u5206\u7D44\u6642\u5FFD\u7565\u6642\u523B",
    "viewConfig.groupRowLimit": "\u6BCF\u7D44\u6700\u591A\u986F\u793A",
    "viewConfig.groupRowLimitUnlimited": "\u7121\u9650\u5236",
    "viewConfig.groupRowLimitCustom": "\u81EA\u8A02",
    "viewConfig.groupRowLimitRecommended": "\u63A8\u85A6",
    "viewConfig.calendarFirstDayOfWeek.auto": "\u8DDF\u96A8\u7CFB\u7D71",
    "viewConfig.calendarFirstDayOfWeek.0": "\u9031\u65E5",
    "viewConfig.calendarFirstDayOfWeek.1": "\u9031\u4E00",
    "viewConfig.calendarFirstDayOfWeek.6": "\u9031\u516D",
    "viewConfig.calendarMonthVisibleLanes": "\u6BCF\u5929\u986F\u793A\u4E8B\u4EF6\u6578",
    "viewConfig.calendarAllDayMaxLanes": "\u5168\u5929\u6B04\u884C\u6578",
    "viewConfig.calendarScale": "\u65E5\u66C6\u5C3A\u5EA6",
    "viewConfig.timelineGroupField": "\u6642\u9593\u7DDA\u5206\u7D44",
    "viewConfig.timelineScale": "\u6642\u9593\u7DDA\u523B\u5EA6",
    "viewConfig.timelineScale.day": "\u6309\u65E5",
    "viewConfig.timelineScale.week": "\u6309\u9031",
    "viewConfig.timelineScale.month": "\u6309\u6708",
    "viewConfig.timelineScale.quarter": "\u6309\u5B63",
    "viewConfig.chartGroupField": "\u5206\u7D44",
    "viewConfig.chartGroupFieldNone": "\u672A\u9078\u64C7",
    "viewConfig.chartStackFieldNone": "\u672A\u9078\u64C7",
    "viewConfig.chartValueField": "\u6578\u503C\u6B04\u4F4D",
    "viewConfig.chartValueFieldNone": "\u672A\u9078\u64C7",
    "viewConfig.chartType": "\u5716\u8868\u985E\u578B",
    "viewConfig.chartAggregation": "\u805A\u5408\u65B9\u5F0F",
    "viewConfig.databaseName": "\u540D\u7A31",
    "viewConfig.databaseDescription": "\u63CF\u8FF0",
    "viewConfig.descriptionPlaceholder": "\u65B0\u589E\u4E00\u6BB5\u7C21\u77ED\u63CF\u8FF0...",
    "viewConfig.sourceFolder": "\u4F86\u6E90\u8CC7\u6599\u593E",
    "viewConfig.sourceRules": "\u4F86\u6E90\u898F\u5247",
    "viewConfig.sourceRules.help": "\u8CC7\u6599\u5EAB\u7D1A\u9032\u968E\u898F\u5247\u6C7A\u5B9A\u54EA\u4E9B\u7B46\u8A18\u5C6C\u65BC\u76EE\u524D\u8CC7\u6599\u5EAB\u3002\u5F9E .base \u8F49\u63DB\u6642\u6703\u4FDD\u7559\u5DE2\u72C0 AND\u3001OR \u8207 NOT \u7FA4\u7D44\u3002",
    "viewConfig.sourceRules.empty": "\u6C92\u6709\u9032\u968E\u4F86\u6E90\u898F\u5247\u3002",
    "viewConfig.sourceRules.emptyGroup": "\u76EE\u524D\u7FA4\u7D44\u6C92\u6709\u898F\u5247\u3002",
    "viewConfig.sourceRules.addRule": "\u65B0\u589E\u4F86\u6E90\u898F\u5247",
    "viewConfig.sourceRules.addGroup": "\u65B0\u589E\u898F\u5247\u7FA4\u7D44",
    "viewConfig.sourceRules.addExpression": "\u65B0\u589E Bases \u904B\u7B97\u5F0F",
    "viewConfig.sourceRules.addNot": "\u53CD\u5411\u898F\u5247",
    "viewConfig.sourceRules.removeNot": "\u79FB\u9664 NOT",
    "viewConfig.sourceRules.remove": "\u522A\u9664\u898F\u5247",
    "viewConfig.sourceRules.logic": "\u908F\u8F2F",
    "viewConfig.sourceRules.and": "AND",
    "viewConfig.sourceRules.or": "OR",
    "viewConfig.sourceRules.not": "NOT",
    "viewConfig.sourceRules.fieldPlaceholder": "\u5C6C\u6027",
    "viewConfig.sourceRules.customField": "\u81EA\u8A02\u5C6C\u6027...",
    "viewConfig.sourceRules.pickProperty": "\u9078\u64C7\u5C6C\u6027\u2026",
    "viewConfig.sourceRules.noProperties": "\u627E\u4E0D\u5230\u5C6C\u6027",
    "viewConfig.sourceRules.searchProperties": "\u641C\u5C0B\u5C6C\u6027\u2026",
    "viewConfig.sourceRules.fieldGroup.noteProperties": "\u7B46\u8A18\u5C6C\u6027",
    "viewConfig.sourceRules.fieldGroup.formulaProperties": "\u8A08\u7B97\u5C6C\u6027",
    "viewConfig.sourceRules.fieldGroup.fileProperties": "\u6A94\u6848\u5C6C\u6027",
    "viewConfig.sourceRules.fieldGroup.custom": "\u81EA\u8A02",
    "viewConfig.sourceRules.valuePlaceholder": "\u503C",
    "viewConfig.sourceRules.expressionPlaceholder": "Bases \u904B\u7B97\u5F0F\uFF0C\u4F8B\u5982\uFF1Aformula.ppu > 5",
    "viewConfig.sourceRules.op.inFolder": "\u4F4D\u65BC\u8CC7\u6599\u593E",
    "viewConfig.sourceRules.op.hasTag": "\u5305\u542B\u6A19\u7C64",
    "viewConfig.sourceRules.op.hasProperty": "\u5305\u542B\u5C6C\u6027",
    "viewConfig.sourceRules.op.hasLink": "\u5305\u542B\u9023\u7D50",
    "viewConfig.sourceRules.op.eq": "\u7B49\u65BC",
    "viewConfig.sourceRules.op.neq": "\u4E0D\u7B49\u65BC",
    "viewConfig.sourceRules.op.strictEq": "\u56B4\u683C\u7B49\u65BC",
    "viewConfig.sourceRules.op.strictNeq": "\u56B4\u683C\u4E0D\u7B49\u65BC",
    "viewConfig.sourceRules.op.contains": "\u5305\u542B",
    "viewConfig.sourceRules.op.startsWith": "\u958B\u982D\u662F",
    "viewConfig.sourceRules.op.endsWith": "\u7D50\u5C3E\u662F",
    "viewConfig.sourceRules.op.matches": "\u7B26\u5408\u6B63\u5247",
    "viewConfig.sourceRules.op.isType": "\u985E\u578B\u662F",
    "viewConfig.sourceRules.op.gt": "\u5927\u65BC",
    "viewConfig.sourceRules.op.gte": "\u5927\u65BC\u7B49\u65BC",
    "viewConfig.sourceRules.op.lt": "\u5C0F\u65BC",
    "viewConfig.sourceRules.op.lte": "\u5C0F\u65BC\u7B49\u65BC",
    "viewConfig.sourceRules.op.empty": "\u70BA\u7A7A",
    "viewConfig.sourceRules.op.notempty": "\u4E0D\u70BA\u7A7A",
    "viewConfig.sourceRules.op.truthy": "\u70BA\u771F",
    "viewConfig.sourceRules.opGroup.file": "\u6A94\u6848",
    "viewConfig.sourceRules.opGroup.value": "\u503C",
    "viewConfig.sourceRules.opGroup.text": "\u6587\u5B57",
    "viewConfig.sourceRules.opGroup.compare": "\u6BD4\u8F03",
    "viewConfig.sourceRules.opGroup.presence": "\u5B58\u5728\u6027",
    "viewConfig.sourceRules.opGroup.type": "\u985E\u578B",
    "viewConfig.sourceRules.opGroup.current": "\u76EE\u524D",
    "viewConfig.newRecordFolder": "\u65B0\u589E\u7B46\u8A18\u8CC7\u6599\u593E",
    "viewConfig.newRecordFolderLocked": "\u50C5\u63A7\u5236\u65B0\u589E\u7B46\u8A18\u5132\u5B58\u4F4D\u7F6E\u3002\u7559\u7A7A\u6642\u512A\u5148\u4F7F\u7528\u4F86\u6E90\u8CC7\u6599\u593E\uFF1B\u4F86\u6E90\u70BA\u7A7A\u6642\u4F7F\u7528\u9810\u8A2D\u8CC7\u6599\u5EAB\u8CC7\u6599\u593E\u3002",
    "viewConfig.syncComputed": "\u5132\u5B58\u8A08\u7B97\u7D50\u679C",
    "viewConfig.saveComputedResults": "\u5132\u5B58\u8A08\u7B97\u7D50\u679C\u5230\u7B46\u8A18\u5C6C\u6027",
    "viewConfig.computedSyncMode": "\u8A08\u7B97\u7D50\u679C\u5132\u5B58\u65B9\u5F0F",
    "viewConfig.computedSync.displayOnly": "\u50C5\u5728\u8CC7\u6599\u5EAB\u4E2D\u986F\u793A\uFF08\u5EFA\u8B70\uFF09",
    "viewConfig.computedSync.displayOnlyDesc": "\u8A08\u7B97\u7D50\u679C\u6703\u986F\u793A\u5728\u8CC7\u6599\u5EAB\u88E1\uFF0C\u4F46\u4E0D\u6703\u5EFA\u7ACB\u6216\u66F4\u65B0\u7B46\u8A18\u5C6C\u6027\u3002",
    "viewConfig.computedSync.automatic": "\u81EA\u52D5\u5132\u5B58\u5230\u7B46\u8A18\u5C6C\u6027",
    "viewConfig.computedSync.automaticDesc": "\u958B\u555F\u8CC7\u6599\u5EAB\u6216\u8CC7\u6599\u8B8A\u52D5\u5F8C\uFF0C\u53EF\u80FD\u6703\u66F4\u65B0\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7684\u591A\u7BC7\u7B46\u8A18\u3002",
    "viewConfig.computedSync.manual": "\u624B\u52D5\u5132\u5B58\u5230\u7B46\u8A18\u5C6C\u6027",
    "viewConfig.computedSync.manualDesc": "\u9700\u8981\u532F\u51FA\u3001Dataview \u6216\u5176\u4ED6\u5916\u639B\u8B80\u53D6\u8A08\u7B97\u7D50\u679C\u6642\uFF0C\u518D\u9EDE\u64CA\u5DE5\u5177\u5217\u6309\u9215\u5132\u5B58\u3002",
    "viewConfig.computedSync.help": "\u8A08\u7B97\u7D50\u679C\u4E00\u5F8B\u6703\u5728\u8CC7\u6599\u5EAB\u4E2D\u986F\u793A\u3002\u6B64\u8A2D\u5B9A\u53EA\u6C7A\u5B9A\u662F\u5426\u4E5F\u628A\u7D50\u679C\u5132\u5B58\u6210\u7B46\u8A18\u5C6C\u6027\u3002",
    "viewConfig.computedSync.confirmAutomatic": "\u81EA\u52D5\u5132\u5B58\u8A08\u7B97\u7D50\u679C\u53EF\u80FD\u6703\u4FEE\u6539\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7684\u591A\u7BC7\u7B46\u8A18\u3002\n\n\u662F\u5426\u7E7C\u7E8C\uFF1F",
    "viewConfig.computedSync.manualHint": "\u8A08\u7B97\u7D50\u679C\u6703\u5148\u4FDD\u6301\u50C5\u986F\u793A\uFF1B\u9700\u8981\u5BEB\u5165\u7B46\u8A18\u5C6C\u6027\u6642\uFF0C\u8ACB\u9EDE\u64CA\u300C\u5132\u5B58\u8A08\u7B97\u7D50\u679C\u300D\u3002",
    "viewConfig.computedSync.displayOnlyHint": "\u5DF2\u5132\u5B58\u7684\u8A08\u7B97\u5C6C\u6027\u6703\u4FDD\u7559\uFF0C\u4F46 Note Database \u4E0D\u6703\u518D\u66F4\u65B0\u5B83\u5011\u3002",
    "viewConfig.computedCleanup.button": "\u6E05\u7406\u5DF2\u5132\u5B58\u7684\u8A08\u7B97\u5C6C\u6027...",
    "viewConfig.computedCleanup.help": "\u5F9E\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7684\u7B46\u8A18\u5C6C\u6027\u4E2D\u79FB\u9664\u820A\u7684\u8A08\u7B97\u7D50\u679C\u503C\u3002",
    "viewConfig.computedCleanup.title": "\u6E05\u7406\u5DF2\u5132\u5B58\u7684\u8A08\u7B97\u5C6C\u6027",
    "viewConfig.computedCleanup.desc": "\u9078\u64C7\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u5DF2\u5BE6\u969B\u5B58\u5728\u65BC\u7B46\u8A18 frontmatter \u7684\u8A08\u7B97\u5C6C\u6027\u3002\u9019\u4E0D\u6703\u522A\u9664\u516C\u5F0F\u6B04\u3002\u5982\u679C\u76EE\u524D\u958B\u555F\u4E86\u81EA\u52D5\u5132\u5B58\uFF0C\u6703\u5148\u5207\u63DB\u70BA\u50C5\u986F\u793A\uFF0C\u907F\u514D\u5C6C\u6027\u88AB\u91CD\u65B0\u5BEB\u56DE\u3002",
    "viewConfig.computedCleanup.confirm": "\u6E05\u7406\u5C6C\u6027",
    "viewConfig.computedCleanup.noFields": "\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u6C92\u6709\u627E\u5230\u5DF2\u5132\u5B58\u7684\u8A08\u7B97\u5C6C\u6027\u3002",
    "viewConfig.computedCleanup.optionField": "\u8A08\u7B97\u6B04\u4F4D\uFF1A{label}",
    "viewConfig.computedCleanup.optionKey": "\u5C07\u6E05\u7406 frontmatter \u5C6C\u6027\uFF1A{key} \xB7 {count} \u7BC7\u7B46\u8A18",
    "viewConfig.coverField": "\u5C01\u9762\u5716\u6B04\u4F4D",
    "viewConfig.noCover": "\u4E0D\u986F\u793A\u5C01\u9762",
    "viewConfig.imageFit": "\u5716\u7247\u986F\u793A",
    "viewConfig.cover": "\u586B\u6EFF\u88C1\u5207",
    "viewConfig.contain": "\u5B8C\u6574\u986F\u793A",
    "viewConfig.cardSize": "\u5361\u7247\u5C3A\u5BF8",
    "viewConfig.coverRatio": "\u5C01\u9762\u6BD4\u4F8B",
    "viewConfig.boardColumnWidth": "\u770B\u677F\u6B04\u5BEC",
    "viewConfig.defaultColumnWidth": "\u9810\u8A2D\u6B04\u4F4D\u5BEC\u5EA6",
    "viewConfig.titleField": "\u6A19\u984C\u6B04\u4F4D",
    "viewConfig.titleAuto": "\u4F7F\u7528\u6A94\u6848\u540D\u7A31",
    "viewConfig.noTitle": "\u4E0D\u986F\u793A\u6A19\u984C",
    "viewConfig.showEmptyFields": "\u986F\u793A\u7A7A\u503C\u5C6C\u6027",
    "viewConfig.listCompactFields": "\u7DCA\u6E4A\u6B04\u4F4D\u4F48\u5C40",
    "viewConfig.statusPreset": "\u9810\u8A2D\u72C0\u614B\u9810\u8A2D",
    "viewConfig.statusPreset.help": "\u7528\u65BC\u5728\u76EE\u524D\u5C64\u7D1A\u65B0\u589E\u72C0\u614B\u5C6C\u6027\u6642\u5957\u7528\u9810\u8A2D\u9078\u9805\u3002\u7BA1\u7406\u9810\u8A2D\u53EA\u6703\u7DE8\u8F2F\u76EE\u524D\u8CC7\u6599\u5EAB/\u6AA2\u8996\u5C64\u7D1A\u3002",
    "viewConfig.boardSubgroupField": "\u770B\u677F\u5B50\u7D44",
    "viewConfig.noSubgroup": "\u4E0D\u4F7F\u7528\u5B50\u7D44",
    "statusPresets.title": "\u72C0\u614B\u9810\u8A2D",
    "statusPresets.desc": "\u8A2D\u5B9A\u53EF\u91CD\u8907\u4F7F\u7528\u7684\u72C0\u614B\u9078\u9805\u5217\u8868\uFF0C\u4E26\u9078\u64C7\u65B0\u589E\u72C0\u614B\u6B04\u4F4D\u9810\u8A2D\u4F7F\u7528\u54EA\u4E00\u7D44\u3002",
    "statusPresets.manage": "\u7BA1\u7406\u9810\u8A2D",
    "statusPresets.none": "\u4E0D\u4F7F\u7528\u9810\u8A2D",
    "statusPresets.add": "\u65B0\u589E\u9810\u8A2D",
    "statusPresets.default": "\u9810\u8A2D",
    "statusPresets.defaultShort": "\u9810\u8A2D",
    "statusPresets.useAsDefault": "\u8A2D\u70BA\u9810\u8A2D",
    "statusPresets.editOptions": "\u7DE8\u8F2F\u9078\u9805",
    "statusPresets.newPreset": "\u65B0\u9810\u8A2D",
    "statusPresets.namePlaceholder": "\u9810\u8A2D\u540D\u7A31",
    "statusPresets.keepOne": "\u81F3\u5C11\u4FDD\u7559\u4E00\u500B\u9810\u8A2D\u3002",
    "filter.eq": "\u7B49\u65BC",
    "filter.neq": "\u4E0D\u7B49\u65BC",
    "filter.contains": "\u5305\u542B",
    "filter.hasTag": "\u5305\u542B\u6A19\u7C64",
    "filter.gt": "\u5927\u65BC",
    "filter.gte": "\u5927\u65BC\u7B49\u65BC",
    "filter.lt": "\u5C0F\u65BC",
    "filter.lte": "\u5C0F\u65BC\u7B49\u65BC",
    "filter.empty": "\u70BA\u7A7A",
    "filter.notempty": "\u4E0D\u70BA\u7A7A",
    "filter.checkboxChecked": "\u5DF2\u52FE\u9078",
    "filter.checkboxUnchecked": "\u672A\u52FE\u9078",
    "menu.editProperty": "\u7DE8\u8F2F\u5C6C\u6027\u300C{name}\u300D...",
    "menu.back": "\u2190 \u8FD4\u56DE",
    "menu.editOptions": "\u7DE8\u8F2F\u9078\u9805\u3001\u984F\u8272\u548C\u9806\u5E8F...",
    "menu.openFormula": "\u958B\u555F\u516C\u5F0F\u7DE8\u8F2F\u5668...",
    "menu.changeType": "\u8B8A\u66F4\u985E\u578B...",
    "menu.insertLeft": "\u5728\u5DE6\u5074\u63D2\u5165\u5C6C\u6027",
    "menu.insertRight": "\u5728\u53F3\u5074\u63D2\u5165\u5C6C\u6027",
    "menu.duplicateColumn": "\u8907\u88FD\u5C6C\u6027",
    "menu.moveUp": "\u4E0A\u79FB",
    "menu.moveDown": "\u4E0B\u79FB",
    "menu.hideProperty": "\u96B1\u85CF\u300C{name}\u300D",
    "menu.enableWrap": "\u958B\u555F\u63DB\u884C\u986F\u793A\u5B8C\u6574\u5167\u5BB9",
    "menu.disableWrap": "\u95DC\u9589\u63DB\u884C\u986F\u793A\u5B8C\u6574\u5167\u5BB9",
    "menu.textRenderLink": "\u9023\u7D50",
    "menu.textRenderPlain": "\u7D14\u6587\u5B57",
    "menu.textRenderMarkdown": "Markdown",
    "menu.textLinkSchemeTitle": "\u9023\u7D50\u5354\u5B9A",
    "menu.textLinkSchemeHttps": "HTTPS",
    "menu.textLinkSchemeEmail": "\u96FB\u5B50\u90F5\u4EF6",
    "menu.textLinkSchemePhone": "\u96FB\u8A71",
    "menu.textLinkSchemeNone": "\u7121",
    "mdToolbar.bold": "\u7C97\u9AD4",
    "mdToolbar.italic": "\u659C\u9AD4",
    "mdToolbar.strike": "\u522A\u9664\u7DDA",
    "mdToolbar.highlight": "\u6A19\u793A",
    "mdToolbar.code": "\u884C\u5167\u7A0B\u5F0F\u78BC",
    "mdToolbar.math": "\u516C\u5F0F",
    "mdToolbar.link": "\u9023\u7D50",
    "mdToolbar.wikilink": "\u7B46\u8A18\u9023\u7D50",
    "mdToolbar.linkText": "\u6587\u5B57",
    "mdToolbar.wikilinkText": "\u7B46\u8A18",
    "menu.numberStylePlain": "\u6578\u5B57",
    "menu.numberStyleRating": "\u8A55\u5206",
    "menu.numberStyleProgress": "\u6C34\u5E73\u9032\u5EA6\u689D",
    "menu.numberStyleRing": "\u5713\u74B0\u9032\u5EA6\u689D",
    "menu.numberDisplayStyle": "\u986F\u793A\u6A23\u5F0F",
    "menu.numberDisplayOptions": "\u986F\u793A\u9078\u9805",
    "menu.numberDisplayIcon": "\u5716\u793A",
    "menu.numberDisplayIconEmoji": "\u81EA\u8A02 Emoji",
    "menu.numberDisplayEmoji": "\u81EA\u8A02 Emoji",
    "menu.numberDisplayIconStyle": "\u5716\u793A\u6A23\u5F0F",
    "menu.numberDisplayIconFilled": "\u5BE6\u5FC3",
    "menu.numberDisplayIconOutline": "\u7A7A\u5FC3",
    "menu.numberDisplayMax": "\u6700\u5927\u503C",
    "menu.numberDisplayDivisor": "\u9664\u6578",
    "menu.numberDisplayShowValue": "\u986F\u793A\u6578\u503C",
    "menu.numberDisplayColor": "\u984F\u8272",
    "menu.numberDisplayColorDefault": "\u9810\u8A2D",
    "menu.numberDisplayColorTheme": "\u4E3B\u984C\u8272",
    "menu.numberDisplayColorCustom": "\u81EA\u8A02",
    "menu.numberStyleCustom": "\u81EA\u8A02",
    "panel.numberDisplayStyle": "\u986F\u793A\u6A23\u5F0F",
    "modal.numberDisplayStyle": "\u6578\u5B57\u986F\u793A\u6A23\u5F0F",
    "undo.numberDisplayStyleConfig": "\u6578\u5B57\u986F\u793A\u6A23\u5F0F\u914D\u7F6E",
    "menu.adjustColumnWidth": "\u8ABF\u6574\u6B04\u5BEC",
    "columnWidth.adjustTitle": "\u8ABF\u6574\u300C{name}\u300D",
    "columnWidth.auto": "\u81EA\u52D5",
    "columnWidth.narrow": "\u7A84",
    "columnWidth.medium": "\u4E2D",
    "columnWidth.wide": "\u5BEC",
    "menu.autoFitColumn": "\u81EA\u52D5\u8ABF\u6574\u6B04\u5BEC",
    "menu.autoFitAllColumns": "\u81EA\u52D5\u8ABF\u6574\u6240\u6709\u53EF\u898B\u6B04\u5BEC",
    "menu.sortBy": "\u4F9D\u300C{name}\u300D\u6392\u5E8F",
    "menu.clearSort": "\u53D6\u6D88\u6392\u5E8F",
    "menu.deleteColumn": "\u522A\u9664\u5C6C\u6027",
    "menu.openNote": "\u958B\u555F\u7B46\u8A18",
    "menu.insertAbove": "\u5728\u4E0A\u65B9\u65B0\u589E\u689D\u76EE",
    "menu.insertBelow": "\u5728\u4E0B\u65B9\u65B0\u589E\u689D\u76EE",
    "menu.newFromTemplate": "\u5F9E\u7BC4\u672C\u65B0\u589E",
    "menu.deleteRow": "\u522A\u9664\u300C{name}\u300D",
    "menu.confirmDeleteRow": "\u78BA\u5B9A\u522A\u9664\u300C{name}\u300D\uFF1F\n\n\u5C0D\u61C9\u7684 Markdown \u6A94\u6848\u6703\u88AB\u79FB\u5230\u56DE\u6536\u6876\u3002",
    "menu.duplicateRecord": "\u8907\u88FD\u8A18\u9304",
    "menu.copySuffix": "\u526F\u672C",
    "settings.title": "Note Database \u8A2D\u5B9A",
    "settings.language.name": "\u8A9E\u8A00",
    "settings.language.desc": "\u9078\u64C7\u4ECB\u9762\u8A9E\u8A00\uFF1B\u8DDF\u96A8\u7CFB\u7D71\u6703\u4F7F\u7528 Obsidian/\u700F\u89BD\u5668\u8A9E\u8A00\u3002",
    "viewConfig.yearDisplayMode": "\u65E5\u671F\u5E74\u4EFD\u986F\u793A",
    "viewConfig.yearDisplayMode.always": "\u59CB\u7D42\u986F\u793A",
    "viewConfig.yearDisplayMode.smart": "\u667A\u6167\u96B1\u85CF",
    "viewConfig.yearDisplayMode.never": "\u59CB\u7D42\u96B1\u85CF",
    "undo.yearDisplayModeConfig": "\u8B8A\u66F4\u65E5\u671F\u5E74\u4EFD\u986F\u793A",
    "settings.language.system": "\u8DDF\u96A8\u7CFB\u7D71",
    "settings.language.zhCN": "\u7C21\u9AD4\u4E2D\u6587",
    "settings.language.zhTW": "\u7E41\u9AD4\u4E2D\u6587",
    "settings.databaseFolder.name": "\u9810\u8A2D\u8F38\u51FA\u8CC7\u6599\u593E",
    "settings.databaseFolder.desc": "\u7528\u65BC\u5132\u5B58\u7522\u751F\u7684\u8CC7\u6599\u5EAB\u6A94\u6848\uFF1B\u7576\u8CC7\u6599\u5EAB\u672A\u8A2D\u5B9A\u4F86\u6E90\u8CC7\u6599\u593E\u548C\u65B0\u589E\u7B46\u8A18\u8CC7\u6599\u593E\u6642\uFF0C\u65B0\u589E\u7B46\u8A18\u4E5F\u6703\u9810\u8A2D\u5132\u5B58\u5728\u9019\u88E1\u3002",
    "settings.databaseFiles.name": "\u8CC7\u6599\u5EAB\u6A94\u6848",
    "settings.databaseFiles.modalTitle": "\u8CC7\u6599\u5EAB\u6A94\u6848",
    "settings.databaseFiles.emptyHint": "\u6C92\u6709\u627E\u5230 db_view: true \u7684\u8CC7\u6599\u5EAB\u6A94\u6848\u3002",
    "settings.databaseFilesAlwaysOpenInNewTab.name": "\u7E3D\u662F\u5728\u65B0\u5206\u9801\u958B\u555F\u8CC7\u6599\u5EAB\u6A94\u6848",
    "settings.databaseFilesAlwaysOpenInNewTab.desc": "\u9810\u8A2D\u5728\u65B0\u5206\u9801\u958B\u555F db_view Markdown \u6A94\u6848\u3002",
    "settings.databaseFilesPreventDuplicateTabs.name": "\u9632\u6B62\u91CD\u8907\u8CC7\u6599\u5EAB\u6A94\u6848\u5206\u9801",
    "settings.databaseFilesPreventDuplicateTabs.desc": "\u5982\u679C\u8CC7\u6599\u5EAB\u6A94\u6848\u5206\u9801\u5DF2\u7D93\u958B\u555F\uFF0C\u5247\u5207\u63DB\u5230\u65E2\u6709\u5206\u9801\uFF0C\u800C\u4E0D\u662F\u518D\u958B\u555F\u4E00\u500B\u3002",
    "settings.showDatabaseIcon.name": "\u986F\u793A\u8CC7\u6599\u5EAB\u5716\u793A",
    "settings.showDatabaseIcon.desc": "\u5728\u8CC7\u6599\u5EAB\u6A19\u984C\u5217\u986F\u793A\u5716\u793A\u4F4D\u3002",
    "settings.dashboardInitialSource.name": "Dashboard \u8D77\u59CB\u9801\u9762",
    "settings.dashboardInitialSource.desc": "\u9078\u64C7\u958B\u555F Dashboard \u6642\u9810\u8A2D\u986F\u793A\u7B2C\u4E00\u500B\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\uFF0C\u9084\u662F\u7B2C\u4E00\u500B\u8CC7\u6599\u5EAB\u6A94\u6848\u3002",
    "settings.dashboardInitialSource.settings": "\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB",
    "settings.dashboardInitialSource.file": "\u8CC7\u6599\u5EAB\u6A94\u6848",
    "settings.csvMarkdownTransfer.name": "CSV + Markdown \u532F\u5165 / \u532F\u51FA",
    "settings.csvMarkdownTransfer.desc": "\u532F\u5165 CSV \u8207 Markdown \u6A94\uFF0C\u6216\u5C07\u76EE\u524D Dashboard \u6AA2\u8996\u532F\u51FA\u70BA\u5305\u542B CSV\u3001Markdown \u6A94\u548C\u8CC7\u6599\u5EAB\u4E2D\u7E7C\u8CC7\u6599\u7684 ZIP\u3002",
    "settings.csvMarkdownTransfer.import": "\u532F\u5165 CSV + Markdown",
    "settings.csvMarkdownTransfer.export": "\u532F\u51FA\u76EE\u524D\u6AA2\u8996",
    "settings.statusPresets.name": "\u5168\u57DF\u72C0\u614B\u9810\u8A2D",
    "settings.statusPresets.desc": "\u7BA1\u7406\u72C0\u614B\u6B04\u4F4D\u53EF\u91CD\u8907\u4F7F\u7528\u7684\u9078\u9805\u5217\u8868\uFF0C\u4E26\u9078\u64C7\u5168\u57DF\u9810\u8A2D\u3002",
    "settings.groups.general": "\u4E00\u822C\u8A2D\u5B9A",
    "settings.groups.dataManagement": "\u8CC7\u6599\u7BA1\u7406",
    "settings.groups.statusPresets": "\u72C0\u614B\u9810\u8A2D",
    "settings.groups.databases": "\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB",
    "settings.groups.databaseFiles": "\u6A94\u6848\u578B\u8CC7\u6599\u5EAB",
    "settings.groups.databaseFiles.desc": "\u7368\u7ACB\u7684 .md \u6A94\u6848\uFF0Cfrontmatter \u4E2D\u542B\u6709 db_view: true\u3002",
    "settings.groups.trash": "\u56DE\u6536\u6876",
    "settings.addDatabaseFile": "\u65B0\u589E\u8CC7\u6599\u5EAB\u6A94\u6848",
    "settings.databaseList.columns": "\u6B04",
    "settings.databaseList.views": "\u6AA2\u8996",
    "settings.databaseList.title": "\u8CC7\u6599\u5EAB",
    "settings.databaseList.desc": "\u7BA1\u7406\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\u3002\u9019\u4E9B\u8CC7\u6599\u5EAB\u4E0D\u76F4\u63A5\u5132\u5B58\u70BA\u6A94\u6848\uFF0C\u800C\u662F\u4FDD\u5B58\u5728\u5916\u639B\u8A2D\u5B9A\u4E2D\u3002",
    "settings.databaseList.manageInDashboard": "\u8ACB\u5728 Dashboard \u7684\u8A2D\u5B9A\u6309\u9215\u4E2D\u7DE8\u8F2F\u6B64\u8CC7\u6599\u5EAB\u3002",
    "settings.empty.title": "\u5C1A\u672A\u8A2D\u5B9A\u8CC7\u6599\u5EAB",
    "settings.empty.desc": "\u53EF\u4EE5\u5728\u9019\u88E1\u5EFA\u7ACB\u7A7A\u767D\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\uFF0C\u4E5F\u53EF\u4EE5\u5F9E\u547D\u4EE4\u9762\u677F\u532F\u5165 Obsidian .base \u6216\u7522\u751F\u8CC7\u6599\u5EAB\u6A94\u6848\u3002",
    "settings.addDatabase": "\u65B0\u589E\u7A7A\u767D\u8CC7\u6599\u5EAB",
    "settings.databaseName": "\u8CC7\u6599\u5EAB\u540D\u7A31",
    "settings.sourceFolder": "\u4F86\u6E90\u8CC7\u6599\u593E",
    "settings.sourceFolder.desc": "\u7528\u65BC\u6383\u63CF\u7B46\u8A18\u7684 vault \u8DEF\u5F91\u3002\u7559\u7A7A\u6642\u6383\u63CF vault \u6839\u76EE\u9304\u3002",
    "settings.defaultSort": "\u9810\u8A2D\u6392\u5E8F",
    "settings.sortField": "\u6392\u5E8F\u6B04\u4F4D",
    "settings.deleteDatabase": "\u522A\u9664\u6B64\u8CC7\u6599\u5EAB",
    "settings.trash": "\u56DE\u6536\u6876",
    "deleteDatabase.title": "\u522A\u9664\u8CC7\u6599\u5EAB\u300C{name}\u300D",
    "deleteDatabase.info": "\u6B64\u8CC7\u6599\u5EAB\u76EE\u524D\u7B26\u5408 {count} \u500B\u7B46\u8A18\u6A94\u6848\u3002",
    "deleteDatabase.deleteFiles": "\u540C\u6642\u5C07\u7B26\u5408\u7684\u7B46\u8A18\u6A94\u6848\u79FB\u81F3\u7CFB\u7D71\u56DE\u6536\u6876",
    "deleteDatabase.deleteFilesDesc": "\u5171 {count} \u500B\u6A94\u6848\uFF0C\u6A94\u6848\u5C07\u88AB\u79FB\u81F3\u7CFB\u7D71\u56DE\u6536\u6876\u3002",
    "deleteDatabase.moveToPluginTrash": "\u79FB\u81F3\u5916\u639B\u56DE\u6536\u6876",
    "deleteDatabase.moveToSystemTrash": "\u79FB\u81F3\u7CFB\u7D71\u56DE\u6536\u6876",
    "settings.confirmPermanentDelete": "\u6C38\u4E45\u522A\u9664\u8CC7\u6599\u5EAB\u300C{name}\u300D\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002",
    "addDatabase.title": "\u65B0\u589E\u8CC7\u6599\u5EAB",
    "addDatabase.sourceDesc": "\u7528\u65BC\u6383\u63CF\u7B46\u8A18\u7684 vault \u8DEF\u5F91\u3002\u7559\u7A7A\u6642\u6383\u63CF vault \u6839\u76EE\u9304\u3002",
    "addDatabase.createAs": "\u5EFA\u7ACB\u65B9\u5F0F",
    "addDatabase.createInSettings": "\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB",
    "addDatabase.createAsFile": "\u8CC7\u6599\u5EAB\u6A94\u6848",
    "addDatabase.create": "\u5EFA\u7ACB",
    "addDatabase.scanTitle": "\u767C\u73FE\u4EE5\u4E0B\u5C6C\u6027",
    "addDatabase.scanDesc": "\u5728\u6E90\u8CC7\u6599\u593E\u7684\u6A94\u6848\u4E2D\u767C\u73FE\u4E86\u4EE5\u4E0B\u5C6C\u6027\uFF0C\u8ACB\u9078\u64C7\u8981\u4F5C\u70BA\u8CC7\u6599\u5EAB\u6B04\u4F4D\u5305\u542B\u7684\u5C6C\u6027\u3002",
    "baseImport.title": "\u78BA\u8A8D\u532F\u5165\u5C6C\u6027",
    "baseImport.desc": "\u4EE5\u4E0B\u5C6C\u6027\u5DF2\u5F9E\u6A94\u6848\u4E2D\u81EA\u52D5\u63A8\u65B7\u3002\u4F60\u53EF\u4EE5\u4FEE\u6539\u985E\u578B\u5F8C\u518D\u78BA\u8A8D\u532F\u5165\u3002file.name \u6703\u81EA\u52D5\u4F5C\u70BA\u6A94\u6848\u540D\u7A31\u6B04\u52A0\u5165\uFF0C\u56E0\u6B64\u4E0D\u6703\u51FA\u73FE\u5728\u4E0B\u65B9\u6E05\u55AE\u4E2D\u3002",
    "baseImport.chooseBaseFile": "\u9078\u64C7 .base \u6A94",
    "baseImport.chooseBaseFilePlaceholder": "\u641C\u5C0B .base \u6A94...",
    "baseImport.property": "\u5C6C\u6027\u9375",
    "baseImport.displayName": "\u6B04\u6A19\u984C",
    "baseImport.inferredType": "\u63A8\u65B7\u985E\u578B",
    "baseImport.fileCount": "\u6A94\u6848\u6578",
    "baseImport.confirm": "\u78BA\u8A8D\u532F\u5165",
    "baseImport.include": "\u5305\u542B",
    "csvMarkdownImport.title": "\u532F\u5165 CSV + Markdown \u6A94",
    "csvMarkdownImport.desc": "\u8ACB\u512A\u5148\u9078\u64C7\u672C\u63D2\u4EF6\u532F\u51FA\u7684\u532F\u7E3D CSV \u6A94\uFF08\u540D\u70BA *_all.csv\uFF09\uFF0C\u4E5F\u53EF\u4EE5\u9078\u64C7\u5404\u6AA2\u8996\u7684\u7368\u7ACB CSV \u6A94\u3002\u53EF\u9078\u65B0\u589E Markdown \u6A94\u548C note-database.json \u4E2D\u7E7C\u8CC7\u6599\u4EE5\u5B8C\u6574\u6062\u5FA9\u8CC7\u6599\u5EAB\u7D50\u69CB\u3002",
    "csvMarkdownImport.csv": "CSV \u6A94",
    "csvMarkdownImport.markdown": "Markdown \u6A94",
    "csvMarkdownImport.metadata": "\u8CC7\u6599\u5EAB\u4E2D\u7E7C\u8CC7\u6599",
    "csvMarkdownImport.databaseName": "\u8CC7\u6599\u5EAB\u540D\u7A31",
    "csvMarkdownImport.targetFolder": "\u532F\u5165\u7B46\u8A18\u8CC7\u6599\u593E",
    "csvMarkdownImport.import": "\u532F\u5165",
    "csvMarkdownImport.chooseCsv": "\u9078\u64C7 CSV",
    "csvMarkdownImport.chooseMarkdown": "\u9078\u64C7 Markdown \u6A94",
    "csvMarkdownImport.chooseMetadata": "\u9078\u64C7\u4E2D\u7E7C\u8CC7\u6599",
    "csvMarkdownImport.noFile": "\u672A\u9078\u64C7\u6A94\u6848",
    "csvMarkdownImport.filesSelected": "\u5DF2\u9078\u64C7 {count} \u500B\u6A94\u6848",
    "csvMarkdownExport.title": "\u532F\u51FA CSV + Markdown ZIP",
    "csvMarkdownExport.desc": "ZIP \u5167\u5305\u542B CSV\u3001\u6BCF\u7B46\u8A18\u9304\u5C0D\u61C9\u7684 Markdown \u6A94\uFF0C\u4EE5\u53CA\u7528\u65BC\u91CD\u65B0\u532F\u5165\u8CC7\u6599\u5EAB\u7D50\u69CB\u7684 note-database.json\u3002",
    "csvMarkdownExport.includeFrontmatter": "\u532F\u51FA\u7684 Markdown \u6A94\u5305\u542B frontmatter \u6B04\u4F4D",
    "csvMarkdownExport.includeAllTableViews": "\u540C\u6642\u5305\u542B\u6240\u6709\u8868\u683C\u6AA2\u8996\u7684 CSV \u6A94",
    "csvMarkdownExport.chooseLocation": "\u9078\u64C7\u532F\u51FA\u4F4D\u7F6E",
    "csvMarkdownExport.export": "\u532F\u51FA",
    "notice.noExportableDb": "\u6C92\u6709\u53EF\u532F\u51FA\u7684\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB",
    "notice.noBaseFilesFound": "\u76EE\u524D vault \u4E2D\u6C92\u6709\u627E\u5230 .base \u6A94\u3002",
    "notice.baseMapViewDowngraded": "\u6B64 .base \u6A94\u6848\u4E2D\u7684\u5730\u5716\u6AA2\u8996\u5DF2\u6309\u8868\u683C\u6AA2\u8996\u532F\u5165\u3002",
    "notice.noImportableProperties": "\u6C92\u6709\u6AA2\u6E2C\u5230\u53EF\u5C0E\u5165\u7684\u5C6C\u6027\u3002",
    "notice.notValidDbFile": "\u76EE\u524D\u6A94\u6848\u4E0D\u662F\u6709\u6548\u7684\u8CC7\u6599\u5EAB\u6A94\u6848",
    "notice.dbAlreadyExists": "\u8CC7\u6599\u5EAB\u300C{name}\u300D\u5DF2\u5B58\u5728\u65BC\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\u4E2D\u3002",
    "notice.addedToSettings": "\u5DF2\u532F\u5165\u70BA\u8A2D\u5B9A\u578B\u8CC7\u6599\u5EAB\uFF1A{name}",
    "notice.noActiveDbFileToImport": "\u8ACB\u5148\u958B\u555F\u8CC7\u6599\u5EAB\u6A94\u6848\uFF0C\u6216\u5728 Dashboard \u4E2D\u9078\u53D6\u4E00\u500B\u8CC7\u6599\u5EAB\u6A94\u6848\u3002",
    "notice.openDashboardToExportCsvMarkdown": "\u8ACB\u5148\u958B\u555F\u8CC7\u6599\u5EAB Dashboard\uFF0C\u518D\u532F\u51FA CSV + Markdown ZIP\u3002",
    "notice.exportedCsvMarkdownZip": "\u5DF2\u532F\u51FA CSV + Markdown ZIP\uFF1A{path}",
    "notice.exportedCsvMarkdownZipExternal": "\u5DF2\u532F\u51FA CSV + Markdown ZIP \u5230\uFF1A{path}",
    "notice.csvMarkdownImportInvalidCsv": "\u9078\u64C7\u7684 CSV \u6A94\u70BA\u7A7A\u6216\u683C\u5F0F\u7121\u6548\u3002",
    "notice.csvMarkdownImportInvalidMetadata": "\u9078\u64C7\u7684\u4E2D\u7E7C\u8CC7\u6599\u6A94\u7121\u6548\uFF0C\u5DF2\u5FFD\u7565\u3002",
    "notice.csvMarkdownImportComplete": "\u5DF2\u532F\u5165 {count} \u7B46\u8A18\u9304\uFF0C\u4E26\u5EFA\u7ACB\u8CC7\u6599\u5EAB\u6A94\u6848\uFF1A{path}",
    "defaults.newDatabase": "\u65B0\u8CC7\u6599\u5EAB",
    "defaults.nameColumn": "\u540D\u7A31",
    "empty.noDatabases": "\u9084\u6C92\u6709\u8CC7\u6599\u5EAB\u6A94\u6848\u3002",
    "empty.createFirstDatabase": "\u5EFA\u7ACB\u81EA\u5DF1\u7684\u7B2C\u4E00\u500B Note Database",
    "formula.title": "\u7DE8\u8F2F\u516C\u5F0F\uFF1A{name}",
    "formula.subtitle": "\u8A08\u7B97\u6B04\u4F4D \xB7 \u5C6C\u6027 key: {key}",
    "formula.storage.displayOnly": "\u865B\u64EC\u5C6C\u6027 key\uFF1A{key}",
    "formula.storage.savedProperty": "\u5132\u5B58\u5230\u7B46\u8A18\u5C6C\u6027 key\uFF1A{key}",
    "formula.storage.displayOnlyNote": "\u9019\u500B\u516C\u5F0F\u53EA\u5728\u8CC7\u6599\u5EAB\u4E2D\u986F\u793A\uFF0C\u4E0D\u6703\u51FA\u73FE\u5728\u7B46\u8A18\u5C6C\u6027\u88E1\u3002",
    "formula.storage.manualNote": "\u9700\u8981\u628A\u9019\u500B\u503C\u5BEB\u5165\u7B46\u8A18\u5C6C\u6027\u6642\uFF0C\u8ACB\u9EDE\u64CA\u300C\u5132\u5B58\u8A08\u7B97\u7D50\u679C\u300D\u3002",
    "formula.storage.automaticNote": "\u9019\u500B\u503C\u53EF\u4EE5\u81EA\u52D5\u5132\u5B58\u5230\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7B46\u8A18\u7684\u5C6C\u6027\u4E2D\u3002",
    "formula.resultType": "\u7D50\u679C\u985E\u578B",
    "formula.typeNumber": "\u6578\u5B57",
    "formula.typeText": "\u6587\u5B57",
    "formula.typeDate": "\u65E5\u671F",
    "formula.typeDatetime": "\u65E5\u671F\u548C\u6642\u9593",
    "formula.resultTypeDatetime": "\u7D50\u679C\u985E\u578B\u70BA\u65E5\u671F\u548C\u6642\u9593\uFF0C\u4F46\u76EE\u524D\u7D50\u679C\u4E0D\u662F\u65E5\u671F\u6642\u9593\u5B57\u4E32",
    "formula.fn.HOUR.desc": "\u56DE\u50B3\u65E5\u671F\u6642\u9593\u7684\u5C0F\u6642\uFF080-23\uFF09\u3002",
    "formula.fn.MINUTE.desc": "\u56DE\u50B3\u65E5\u671F\u6642\u9593\u7684\u5206\u9418\uFF080-59\uFF09\u3002",
    "formula.fn.SECOND.desc": "\u56DE\u50B3\u65E5\u671F\u6642\u9593\u7684\u79D2\u6578\uFF080-59\uFF09\u3002",
    "formula.fn.TIME.desc": "\u6839\u64DA\u6642\u3001\u5206\u3001\u79D2\u69CB\u9020 HH:mm:ss \u6642\u9593\u5B57\u4E32\u3002",
    "formula.ex.dateTime.name": "\u4F9D\u5C0F\u6642\u504F\u79FB\u65E5\u671F\u6642\u9593",
    "formula.ex.dateTime.desc": "\u7D66\u65E5\u671F\u6642\u9593\u589E\u52A0\u5C0F\u6642\uFF0C\u4FDD\u7559\u6642\u9593\u90E8\u5206\u3002",
    "formula.typeCheckbox": "\u6838\u53D6\u65B9\u584A",
    "formula.sectionTitle": "\u516C\u5F0F",
    "formula.referenceNote": "\u5F15\u7528\u6B04\u4F4D\uFF1A\u8F38\u5165 [\uFF0C\u6309\u6B04\u6A19\u984C\u641C\u5C0B\uFF0C\u5916\u639B\u6703\u81EA\u52D5\u63D2\u5165\u516C\u5F0F\u5F15\u7528\u3002",
    "formula.referenceNoteAdvanced": "\u4F8B\u5982\uFF1A\u6B04\u6A19\u984C\u300C\u55AE\u50F9\u300D \u2192 \u516C\u5F0F\u5F15\u7528 [price]\u3002\u76F4\u63A5\u5BEB price \u53EA\u662F\u5C6C\u6027\u9375\u7684\u76F8\u5BB9\u7C21\u5BEB\uFF0C\u4E0D\u80FD\u76F4\u63A5\u5BEB\u6B04\u6A19\u984C\u3002",
    "formula.referenceNoteBase": "\u5F15\u7528\u6B04\u4F4D\uFF1A\u8F38\u5165 [\uFF0C\u6309\u6B04\u6A19\u984C\u641C\u5C0B\uFF0C\u5916\u639B\u6703\u81EA\u52D5\u63D2\u5165\u5C0D\u61C9\u7684 Bases \u516C\u5F0F\u5F15\u7528\u3002",
    "formula.referenceNoteBaseAdvanced": "\u4F8B\u5982\uFF1A\u6B04\u6A19\u984C\u300C\u55AE\u50F9\u300D \u2192 note.price\uFF1B\u8A08\u7B97\u6B04\u4F4D\u4F7F\u7528 formula.total\u3002\u4E0D\u80FD\u76F4\u63A5\u5BEB\u6B04\u6A19\u984C\u3002",
    "formula.previewItem": "\u9810\u89BD\u689D\u76EE",
    "formula.noPreviewItems": "\u6C92\u6709\u53EF\u9810\u89BD\u7684\u689D\u76EE",
    "formula.calcResult": "\u8A08\u7B97\u7D50\u679C",
    "formula.notCalculated": "\u672A\u8A08\u7B97",
    "formula.waitingForFormula": "\u6B63\u5728\u7B49\u5F85\u516C\u5F0F",
    "formula.enterFormula": "\u8ACB\u8F38\u5165\u516C\u5F0F",
    "formula.noPreviewSaveFirst": "\u6C92\u6709\u9810\u89BD\u689D\u76EE\uFF0C\u5132\u5B58\u5F8C\u6703\u5728\u8CC7\u6599\u5EAB\u4E2D\u8A08\u7B97",
    "formula.valid": "\u516C\u5F0F\u6709\u6548",
    "formula.noPreview": "\u7121\u9810\u89BD",
    "formula.fieldNotExist": "\u6B04\u4F4D\u4E0D\u5B58\u5728\uFF1A{name}",
    "formula.undefinedVariable": "\u672A\u5B9A\u7FA9\u7684\u8B8A\u6578\u6216\u6B04\u4F4D\uFF1A{name}\u3002\u8ACB\u8F38\u5165 [\uFF0C\u6309\u6B04\u6A19\u984C\u641C\u5C0B\u4E26\u63D2\u5165\u516C\u5F0F\u5F15\u7528\u3002",
    "formula.columnTitleAsVariable": "\u300C{label}\u300D\u662F\u6B04\u6A19\u984C\uFF0C\u4E0D\u80FD\u4F5C\u70BA\u88F8\u8B8A\u6578\u4F7F\u7528\u3002\u8ACB\u6539\u7528\u516C\u5F0F\u5F15\u7528 [{key}]\u3002",
    "formula.divisionByZero": "\u9664\u96F6\u932F\u8AA4\uFF1A\u7D50\u679C\u70BA\u7121\u7AAE\u5927\uFF0C\u8ACB\u7528 IFERROR \u8655\u7406",
    "formula.resultNaN": "\u8A08\u7B97\u7D50\u679C\u4E0D\u662F\u6709\u6548\u6578\u5B57\uFF08NaN\uFF09\u3002\u5F15\u7528\u6B04\u4F4D\u53EF\u80FD\u70BA\u7A7A\u6216\u4E0D\u662F\u6578\u5B57\uFF0C\u8ACB\u4F7F\u7528 IFERROR([a] / [b], 0) \u63D0\u4F9B\u56DE\u9000\u503C\u3002",
    "formula.resultTypeMismatch": "\u7D50\u679C\u985E\u578B\u70BA\u6578\u5B57\uFF0C\u4F46\u76EE\u524D\u7D50\u679C\u4E0D\u662F\u6578\u5B57",
    "formula.resultTypeDate": "\u7D50\u679C\u985E\u578B\u70BA\u65E5\u671F\uFF0C\u4F46\u76EE\u524D\u7D50\u679C\u4E0D\u662F\u65E5\u671F",
    "formula.resultTypeCheckbox": "\u7D50\u679C\u985E\u578B\u70BA\u6838\u53D6\u65B9\u584A\uFF0C\u4F46\u76EE\u524D\u7D50\u679C\u4E0D\u662F true \u6216 false",
    "formula.save": "\u5132\u5B58\u516C\u5F0F",
    "formula.notModified": "\u672A\u4FEE\u6539",
    "formula.invalid": "\u516C\u5F0F\u7121\u6548",
    "formula.fieldsAndFunctions": "\u6B04\u4F4D\u8207\u51FD\u5F0F",
    "formula.searchPlaceholder": "\u641C\u5C0B\u51FD\u5F0F\u6216\u6B04\u4F4D...",
    "formula.noMatch": "\u6C92\u6709\u7B26\u5408\u7684\u6B04\u4F4D\u6216\u51FD\u5F0F",
    "formula.noMatchHint": "\u63DB\u4E00\u500B\u95DC\u9375\u8A5E\uFF0C\u6216\u5148\u5728\u8CC7\u6599\u5EAB\u4E2D\u65B0\u589E\u6B04\u4F4D\u3002",
    "formula.insertField": "\u63D2\u5165\u516C\u5F0F\u5F15\u7528 {reference}",
    "formula.fieldHint": "\u516C\u5F0F\u5F15\u7528\u4F7F\u7528\u5C6C\u6027\u9375\uFF1B\u4FEE\u6539\u5C6C\u6027\u9375\u6642\uFF0C\u5916\u639B\u6703\u76E1\u91CF\u540C\u6B65\u66F4\u65B0\u65B9\u62EC\u865F\u5F15\u7528\u3002",
    "formula.columnTitle": "\u6B04\u6A19\u984C",
    "formula.formulaReference": "\u516C\u5F0F\u5F15\u7528",
    "formula.referenceShort": "\u5F15\u7528",
    "formula.availableOptions": "\u53EF\u9078\u9805",
    "formula.noOptions": "\u76EE\u524D\u8CC7\u6599\u5EAB\u4E2D\u6C92\u6709\u627E\u5230\u53EF\u9078\u9805\u3002",
    "formula.fileTagsHint": "file.tags \u4F86\u81EA Obsidian \u6A19\u7C64\u548C frontmatter tags\u3002\u5B83\u5728\u516C\u5F0F\u4E2D\u662F\u6A19\u7C64\u5217\u8868\uFF0C\u4E0D\u4F7F\u7528\u8CC7\u6599\u5EAB\u9078\u9805\u984F\u8272\u3002",
    "formula.syntaxHint": "\u516C\u5F0F\u8A9E\u6CD5\u57FA\u65BC JavaScript \u904B\u7B97\u5F0F\uFF1A\u76F8\u7B49\u6BD4\u8F03\u4F7F\u7528 ===\uFF0C\u6587\u5B57\u4F7F\u7528\u5F15\u865F\uFF0C\u516C\u5F0F\u53EF\u4EE5\u7528 = \u958B\u982D\u3002",
    "formula.typeCoercionHint": "\u7D50\u679C\u985E\u578B\u7528\u65BC\u6821\u9A57\u548C\u986F\u793A\uFF0C\u4E0D\u9650\u5236\u8A72\u6B04\u4F4D\u7E7C\u7E8C\u53C3\u8207\u5F8C\u7E8C\u8A08\u7B97\u3002",
    "formula.ifErrorFallbackHint": '\u7D50\u679C\u53EF\u80FD\u70BA ERROR \u6216 NaN \u6642\uFF0C\u53EF\u4F7F\u7528 IFERROR(\u904B\u7B97\u5F0F, "")\uFF0C\u5728\u6C92\u6709\u6709\u6548\u7D50\u679C\u6642\u76F4\u63A5\u7559\u7A7A\u3002',
    "formula.fieldValues": "\u6B04\u4F4D\u53D6\u503C",
    "formula.noReferencedFields": "\u76EE\u524D\u516C\u5F0F\u6C92\u6709\u9700\u8981\u4EE3\u5165\u7684\u6B04\u4F4D\u503C\u3002",
    "formula.substitutedFormula": "\u4EE3\u5165\u5F8C\u516C\u5F0F",
    "formula.emptyValue": "\u7A7A",
    "formula.enterToSeeSteps": "\u8F38\u5165\u516C\u5F0F\u5F8C\u6703\u986F\u793A\u4EE3\u5165\u5F8C\u516C\u5F0F\u548C\u6B04\u4F4D\u53D6\u503C\u3002",
    "formula.noPreviewForSteps": "\u6C92\u6709\u53EF\u7528\u65BC\u516C\u5F0F\u4EE3\u5165\u7684\u9810\u89BD\u9805\u76EE\u3002",
    "formula.catFields": "\u6B04\u4F4D",
    "formula.catExamples": "\u7BC4\u4F8B",
    "formula.catLogic": "\u908F\u8F2F",
    "formula.catMath": "\u6578\u5B78",
    "formula.catText": "\u6587\u5B57",
    "formula.catDate": "\u65E5\u671F",
    "formula.catStats": "\u7D71\u8A08",
    "formula.fn.IF.desc": "\u6309\u689D\u4EF6\u56DE\u50B3\u5169\u500B\u503C\u4E4B\u4E00\u3002\u689D\u4EF6\u904B\u7B97\u5F0F\u4F7F\u7528 JavaScript \u6BD4\u8F03\u7B26\uFF0C\u4F8B\u5982 ===\u3001!==\u3001>\u3001<\u3002",
    "formula.fn.IFERROR.desc": "\u7576\u7D50\u679C\u70BA\u7A7A\u3001NaN \u6216 Infinity \u6642\u56DE\u50B3\u5099\u7528\u503C\u3002",
    "formula.fn.DAYS.desc": "\u8A08\u7B97\u5169\u500B\u65E5\u671F\u4E4B\u9593\u7684\u5929\u6578\uFF0C\u56DE\u50B3 end_date - start_date\u3002",
    "formula.fn.ADDDAYS.desc": "\u5728\u65E5\u671F\u4E0A\u589E\u52A0\u6307\u5B9A\u5929\u6578\uFF0C\u56DE\u50B3 YYYY-MM-DD\u3002",
    "formula.fn.TEXT.desc": "\u5C07\u6578\u5B57\u6216\u65E5\u671F\u683C\u5F0F\u5316\u70BA\u6587\u5B57\uFF08\u652F\u63F4 0.00\u3001#,##0.00\u30010%\uFF09\u3002",
    "formula.fn.ROUND.desc": "\u6309\u6307\u5B9A\u4F4D\u6578\u56DB\u6368\u4E94\u5165\u3002",
    "formula.fn.AND.desc": "\u6240\u6709\u689D\u4EF6\u90FD\u70BA\u771F\u6642\u56DE\u50B3 true\u3002",
    "formula.fn.OR.desc": "\u4EFB\u4E00\u689D\u4EF6\u70BA\u771F\u6642\u56DE\u50B3 true\u3002",
    "formula.fn.SUM.desc": "\u5C0D\u591A\u500B\u6578\u5B57\u6C42\u548C\u3002",
    "formula.fn.AVERAGE.desc": "\u8A08\u7B97\u5E73\u5747\u503C\u3002",
    "formula.fn.MIN.desc": "\u56DE\u50B3\u6700\u5C0F\u503C\u3002",
    "formula.fn.MAX.desc": "\u56DE\u50B3\u6700\u5927\u503C\u3002",
    "formula.fn.ABS.desc": "\u56DE\u50B3\u7D55\u5C0D\u503C\u3002",
    "formula.fn.MOD.desc": "\u56DE\u50B3\u9918\u6578\uFF0C\u4E26\u6B63\u78BA\u8655\u7406\u8CA0\u6578\u3002",
    "formula.fn.POWER.desc": "\u56DE\u50B3 number \u7684 power \u6B21\u65B9\u3002",
    "formula.fn.ROUNDUP.desc": "\u6309\u6307\u5B9A\u4F4D\u6578\u5411\u4E0A\u53D6\u6574\u3002",
    "formula.fn.ROUNDDOWN.desc": "\u6309\u6307\u5B9A\u4F4D\u6578\u5411\u4E0B\u53D6\u6574\u3002",
    "formula.fn.CONCAT.desc": "\u62FC\u63A5\u6587\u5B57\u3002",
    "formula.fn.TEXTJOIN.desc": "\u7528\u5206\u9694\u7B26\u62FC\u63A5\u591A\u6BB5\u6587\u5B57\u3002",
    "formula.fn.LEN.desc": "\u56DE\u50B3\u6587\u5B57\u9577\u5EA6\u3002",
    "formula.fn.LEFT.desc": "\u5F9E\u5DE6\u5074\u64F7\u53D6\u6587\u5B57\u3002",
    "formula.fn.RIGHT.desc": "\u5F9E\u53F3\u5074\u64F7\u53D6\u6587\u5B57\u3002",
    "formula.fn.MID.desc": "\u5F9E\u6307\u5B9A\u4F4D\u7F6E\u64F7\u53D6\u6587\u5B57\u3002",
    "formula.fn.TRIM.desc": "\u53BB\u9664\u9996\u5C3E\u7A7A\u767D\u3002",
    "formula.fn.UPPER.desc": "\u8F49\u63DB\u70BA\u5927\u5BEB\u3002",
    "formula.fn.LOWER.desc": "\u8F49\u63DB\u70BA\u5C0F\u5BEB\u3002",
    "formula.fn.CONTAINS.desc": "\u5224\u65B7\u6587\u5B57\u662F\u5426\u5305\u542B\u95DC\u9375\u8A5E\u3002",
    "formula.fn.TODAY.desc": "\u56DE\u50B3\u4ECA\u5929\u65E5\u671F\u3002",
    "formula.fn.NOW.desc": "\u56DE\u50B3\u76EE\u524D\u65E5\u671F\u548C\u6642\u9593\u3002",
    "formula.fn.YEAR.desc": "\u56DE\u50B3\u5E74\u4EFD\u3002",
    "formula.fn.MONTH.desc": "\u56DE\u50B3\u6708\u4EFD\u3002",
    "formula.fn.DATE.desc": "\u6839\u64DA\u5E74\u6708\u65E5\u5EFA\u69CB\u65E5\u671F\uFF0C\u56DE\u50B3 YYYY-MM-DD\u3002",
    "formula.fn.EOMONTH.desc": "\u56DE\u50B3\u6307\u5B9A\u6708\u4EFD\u504F\u79FB\u5F8C\u7684\u6708\u672B\u65E5\u671F\u3002",
    "formula.fn.DATEADD.desc": "\u6309 days/weeks/months/years \u589E\u52A0\u65E5\u671F\u3002",
    "formula.fn.WEEKDAY.desc": "\u56DE\u50B3\u661F\u671F\u3002\u9810\u8A2D 0=\u9031\u65E5..6=\u9031\u516D\uFF1B\u50B3 return_type\uFF081/2/3\uFF09\u4F9D Excel \u7DE8\u865F\u3002",
    "formula.fn.WEEKNUM.desc": "\u56DE\u50B3 ISO \u9031\u6578\u3002",
    "formula.fn.NETWORKDAYS.desc": "\u56DE\u50B3\u5169\u65E5\u671F\u4E4B\u9593\u7684\u5DE5\u4F5C\u65E5\u6578\uFF08\u9031\u4E00\u5230\u9031\u4E94\uFF0C\u542B\u9996\u5C3E\uFF09\uFF1B\u53EF\u9078\u5047\u65E5\u53C3\u6578\u6392\u9664\u3002",
    "formula.fn.COUNT.desc": "\u7D71\u8A08\u6578\u5B57\u503C\u6578\u91CF\u3002",
    "formula.fn.COUNTA.desc": "\u7D71\u8A08\u975E\u7A7A\u503C\u6578\u91CF\u3002",
    "formula.fn.COUNTIF.desc": "\u7D71\u8A08\u7B26\u5408\u689D\u4EF6\u7684\u503C\u3002\u76EE\u524D\u652F\u63F4\u55AE\u503C\u6216\u9663\u5217\u3002",
    "formula.fn.IFS.desc": '\u56DE\u50B3\u7B2C\u4E00\u500B\u70BA\u771F\u7684\u689D\u4EF6\u6240\u5C0D\u61C9\u7684\u503C\uFF0C\u6216\u56DE\u50B3\u6700\u5F8C\u7684\u5099\u7528\u503C\u3002\u7576\u5206\u652F\u53EF\u80FD\u5931\u6557\u4E14\u53C3\u6578\u6703\u7ACB\u5373\u6C42\u503C\u6642\uFF0C\u53EF\u4F7F\u7528 field("x")\u3001IFERROR \u6216 ?:\u3002',
    "formula.fn.SWITCH.desc": "\u56DE\u50B3\u7B2C\u4E00\u500B\u7B26\u5408\u8868\u9054\u5F0F\u6240\u5C0D\u61C9\u7684\u503C\uFF0C\u6216\u56DE\u50B3\u6700\u5F8C\u7684\u5099\u7528\u503C\u3002",
    "formula.fn.SQRT.desc": "\u56DE\u50B3\u6578\u5B57\u7684\u5E73\u65B9\u6839\u3002",
    "formula.fn.LN.desc": "\u56DE\u50B3\u6578\u5B57\u7684\u81EA\u7136\u5C0D\u6578\u3002",
    "formula.fn.LOG.desc": "\u56DE\u50B3\u4EE5 10 \u70BA\u5E95\u7684\u5C0D\u6578\uFF0C\u4E5F\u53EF\u6307\u5B9A\u9078\u7528\u7684\u5E95\u6578\u3002",
    "formula.fn.LOG10.desc": "\u56DE\u50B3\u6578\u5B57\u7684\u4EE5 10 \u70BA\u5E95\u7684\u5C0D\u6578\u3002",
    "formula.fn.EXP.desc": "\u56DE\u50B3 e \u7684\u6307\u5B9A\u6B21\u65B9\u3002",
    "formula.fn.CBRT.desc": "\u56DE\u50B3\u6578\u5B57\u7684\u7ACB\u65B9\u6839\u3002",
    "formula.fn.LET.desc": "\u5C07\u4E00\u500B\u503C\u7E6B\u7D50\u5230\u52A0\u5F15\u865F\u7684\u8B8A\u6578\u540D\u7A31\uFF0C\u4E26\u4F7F\u7528\u8A72\u8B8A\u6578\u8A08\u7B97\u7D50\u679C\u904B\u7B97\u5F0F\u3002",
    "formula.fn.LETS.desc": "\u4F9D\u5E8F\u7E6B\u7D50\u591A\u500B\u52A0\u5F15\u865F\u7684\u8B8A\u6578\u540D\u7A31\u548C\u503C\uFF0C\u7136\u5F8C\u8A08\u7B97\u7D50\u679C\u904B\u7B97\u5F0F\u3002",
    "formula.ex.conditional.name": "\u689D\u4EF6\u5224\u65B7",
    "formula.ex.conditional.desc": "\u6309\u6B04\u4F4D\u503C\u56DE\u50B3\u4E0D\u540C\u7D50\u679C\u3002",
    "formula.ex.dateDiff.name": "\u65E5\u671F\u5DEE",
    "formula.ex.dateDiff.desc": "\u8A08\u7B97\u5169\u500B\u65E5\u671F\u4E4B\u9593\u76F8\u5DEE\u591A\u5C11\u5929\u3002",
    "formula.ex.errorFallback.name": "\u7A7A\u503C\u515C\u5E95",
    "formula.ex.errorFallback.desc": "\u8A08\u7B97\u5931\u6557\u6216\u7D50\u679C\u70BA\u7A7A\u6642\u56DE\u50B3 0\u3002",
    "formula.ex.rounding.name": "\u6578\u5B57\u56DB\u6368\u4E94\u5165",
    "formula.ex.rounding.desc": "\u5C07\u6578\u5B57\u7D50\u679C\u63A7\u5236\u5230\u5169\u4F4D\u5C0F\u6578\u3002",
    "formula.ex.nestedIf.name": "\u5DE2\u72C0 IF\uFF08\u8A55\u7D1A\uFF09",
    "formula.ex.nestedIf.desc": "\u7528\u5DE2\u72C0 IF \u689D\u4EF6\u5C07\u5206\u6578\u5206\u70BA\u4E0D\u540C\u7B49\u7D1A\u3002",
    "formula.ex.daysFromNow.name": "\u8DDD\u4ECA\u5929\u6578",
    "formula.ex.daysFromNow.desc": "\u8A08\u7B97\u8DDD\u96E2\u67D0\u65E5\u671F\u9084\u6709\u591A\u5C11\u5929\uFF08\u5DF2\u904E\u671F\u70BA\u8CA0\u6578\uFF09\u3002",
    "formula.ex.concat.name": "\u62FC\u63A5\u6587\u5B57",
    "formula.ex.concat.desc": "\u5C07\u591A\u500B\u6B04\u4F4D\u548C\u56FA\u5B9A\u6587\u5B57\u5408\u4F75\u70BA\u4E00\u500B\u5B57\u4E32\u3002",
    "formula.ex.dateAdd.name": "\u65E5\u671F\u52A0\u6E1B",
    "formula.ex.dateAdd.desc": "\u7D66\u65E5\u671F\u52A0\u6708/\u5929\u5F97\u5230\u65B0\u65E5\u671F\u3002",
    "formula.ex.textFormat.name": "\u683C\u5F0F\u5316\u6578\u5B57",
    "formula.ex.textFormat.desc": "\u7528\u9017\u865F\u5206\u9694\u548C\u56FA\u5B9A\u5C0F\u6578\u4F4D\u683C\u5F0F\u5316\u6578\u5B57\u3002",
    "formula.ex.yearMonth.name": "\u63D0\u53D6\u5E74\u6708",
    "formula.ex.yearMonth.desc": "\u5F9E\u65E5\u671F\u4E2D\u63D0\u53D6\u5E74\u6708\u8CC7\u8A0A\u8F38\u51FA\u70BA YYYY-MM \u6587\u5B57\u3002",
    "formula.error.empty": "\u516C\u5F0F\u4E0D\u80FD\u70BA\u7A7A",
    "formula.error.undefinedVar": "\u5B58\u5728\u672A\u5B9A\u7FA9\u6B04\u4F4D\u6216\u8B8A\u6578\uFF1A{name}",
    "formula.error.incomplete": "\u516C\u5F0F\u8A9E\u6CD5\u4E0D\u5B8C\u6574\u6216\u4E0D\u7B26\u5408 JavaScript \u904B\u7B97\u5F0F",
    "formula.error.unexpectedEnd": "\u516C\u5F0F\u4E0D\u5B8C\u6574\uFF0C\u8ACB\u6AA2\u67E5\u62EC\u865F\u6216\u904B\u7B97\u5B50\u662F\u5426\u914D\u5C0D",
    "formula.error.unexpectedToken": "\u516C\u5F0F\u8A9E\u6CD5\u932F\u8AA4\uFF1A{message}",
    "formula.error.letArgCount": "let/lets \u9700\u8981\u6210\u5C0D\u7684\u540D\u7A31\u548C\u503C\uFF0C\u4E26\u5305\u542B\u7D50\u679C\u904B\u7B97\u5F0F\u3002",
    "formula.error.letName": "let/lets \u8B8A\u6578\u540D\u7A31\u5FC5\u9808\u662F\u52A0\u5F15\u865F\u7684\u8B58\u5225\u5B57\u3002",
    "formula.error.notFunction": '"{name}" \u4E0D\u662F\u51FD\u5F0F\uFF0C\u8ACB\u6AA2\u67E5\u62FC\u5BEB\u6216\u662F\u5426\u8AA4\u7528\u6B04\u4F4D\u540D\u7A31',
    "formula.error.nullProperty": "\u7121\u6CD5\u8B80\u53D6 null/undefined \u503C\u7684\u5C6C\u6027\uFF0C\u8ACB\u7528 IFERROR \u8655\u7406\u7A7A\u503C",
    "formula.error.notIterable": "\u53C3\u6578\u985E\u578B\u932F\u8AA4\uFF1A\u671F\u671B\u9663\u5217\u6216\u53EF\u8FED\u4EE3\u7269\u4EF6",
    "formula.error.typeError": "\u985E\u578B\u932F\u8AA4\uFF1A{message}",
    "formula.error.invalidDate": "\u65E5\u671F\u683C\u5F0F\u7121\u6548\uFF0C\u8ACB\u6AA2\u67E5\u65E5\u671F\u6B04\u4F4D\u503C",
    "formula.error.rangeError": "\u6578\u503C\u7BC4\u570D\u932F\u8AA4\uFF1A{message}",
    "formula.error.generic": "\u8A08\u7B97\u5931\u6557\uFF1A{message}",
    "formula.error.genericShort": "\u8A08\u7B97\u5931\u6557",
    "formula.error.dangerousToken": "\u516C\u5F0F\u5305\u542B\u7981\u6B62\u7684\u95DC\u9375\u5B57\uFF1A{token}",
    "formula.error.noFunction": "\u516C\u5F0F\u4E2D\u4E0D\u5141\u8A31\u5B9A\u7FA9\u51FD\u5F0F",
    "formula.error.noArrowFunction": "\u516C\u5F0F\u4E2D\u4E0D\u5141\u8A31\u4F7F\u7528\u7BAD\u982D\u51FD\u5F0F",
    "formula.copyAiPrompt": "\u8907\u88FD AI \u63D0\u793A\u8A5E",
    "formula.confirmDiscard": "\u6709\u672A\u5132\u5B58\u7684\u8B8A\u66F4\uFF0C\u78BA\u5B9A\u653E\u68C4\u55CE\uFF1F",
    "formula.discard": "\u653E\u68C4",
    "notice.syncedFormulas": "\u5DF2\u5C07\u8A08\u7B97\u7D50\u679C\u5132\u5B58\u5230 {count} \u7BC7\u7B46\u8A18",
    "notice.clearedComputedFrontmatter": "\u5DF2\u5F9E {count} \u7BC7\u7B46\u8A18\u4E2D\u79FB\u9664\u300C{key}\u300D",
    "column.confirmDeleteVirtual": "\u78BA\u5B9A\u522A\u9664\u6B04\u300C{label}\u300D\uFF1F\n\n\u6B64\u6B04\u70BA\u865B\u64EC\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\uFF0C\u6C92\u6709\u5C0D\u61C9\u7684\u7B46\u8A18 frontmatter \u5C6C\u6027\u3002",
    "column.confirmDelete": "\u78BA\u5B9A\u522A\u9664\u6B04\u300C{label}\u300D\uFF1F\n\n\u9078\u64C7\u662F\u5426\u540C\u6642\u522A\u9664\u76EE\u524D\u8CC7\u6599\u5EAB\u5167\u6240\u6709\u689D\u76EE\u7684\u7B46\u8A18\u5C6C\u6027\u300C{key}\u300D\u3002",
    "column.deleteWithData": "\u522A\u9664\u6B04 + \u7B46\u8A18\u8CC7\u6599",
    "column.deleteColumnOnly": "\u50C5\u522A\u9664\u6B04\uFF08\u4FDD\u7559\u7B46\u8A18\u8CC7\u6599\uFF09",
    "column.confirmDeleteComputed": "\u78BA\u5B9A\u522A\u9664\u8A08\u7B97\u6B04\u4F4D\u300C{label}\u300D\uFF1F\n\n\u9019\u53EA\u6703\u5F9E\u8CC7\u6599\u5EAB\u4E2D\u79FB\u9664\u516C\u5F0F\u6B04\u3002\u5DF2\u5132\u5B58\u5230\u7B46\u8A18\u88E1\u7684\u5C6C\u6027\u6703\u4FDD\u7559\uFF0C\u9664\u975E\u4F60\u4E0B\u4E00\u6B65\u9078\u64C7\u6E05\u7406\u3002",
    "column.confirmDeleteComputedSavedProperty": "\u662F\u5426\u540C\u6642\u5F9E\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7684\u7B46\u8A18\u4E2D\u522A\u9664\u5DF2\u5132\u5B58\u7684\u5C6C\u6027\u300C{key}\u300D\uFF1F\n\n\u9078\u64C7\u53D6\u6D88\u6703\u4FDD\u7559\u9019\u4E9B\u7B46\u8A18\u5C6C\u6027\uFF0C\u53EA\u522A\u9664\u516C\u5F0F\u6B04\u3002",
    "column.deletedColumn": "\u5DF2\u522A\u9664\u6B04\uFF0C\u4E26\u5F9E {count} \u500B\u6A94\u6848\u4E2D\u79FB\u9664\u7B46\u8A18\u5C6C\u6027\u300C{key}\u300D",
    "column.confirmRenameComputedSavedProperty": "\u662F\u5426\u540C\u6642\u628A\u5DF2\u5132\u5B58\u7684\u7B46\u8A18\u5C6C\u6027\u5F9E\u300C{oldKey}\u300D\u91CD\u65B0\u547D\u540D\u70BA\u300C{newKey}\u300D\uFF1F\n\n\u9078\u64C7\u53D6\u6D88\u6703\u4FDD\u7559\u65E2\u6709\u7B46\u8A18\u5C6C\u6027\uFF0C\u53EA\u91CD\u65B0\u547D\u540D\u516C\u5F0F\u6B04\u4F4D\u3002",
    "column.confirmConvertComputedCleanup": "\u8981\u628A\u300C{key}\u300D\u6539\u70BA\u8A08\u7B97\u6B04\u4F4D\u55CE\uFF1F\n\n\u8A08\u7B97\u7D50\u679C\u5C07\u53EA\u5728\u8CC7\u6599\u5EAB\u4E2D\u986F\u793A\u3002\u9078\u64C7\u78BA\u5B9A\u6703\u540C\u6642\u5F9E\u76EE\u524D\u8CC7\u6599\u5EAB\u7BC4\u570D\u5167\u7684\u7B46\u8A18\u4E2D\u79FB\u9664\u65E2\u6709\u5C6C\u6027\u300C{key}\u300D\uFF1B\u9078\u64C7\u53D6\u6D88\u6703\u4FDD\u7559\u65E2\u6709\u7B46\u8A18\u5C6C\u6027\u3002",
    "column.confirmConvertComputedSavedProperty": "\u8981\u628A\u300C{key}\u300D\u6539\u70BA\u8A08\u7B97\u6B04\u4F4D\u55CE\uFF1F\n\n\u4E4B\u5F8C\u5132\u5B58\u8A08\u7B97\u7D50\u679C\u6642\uFF0C\u53EF\u80FD\u6703\u8986\u84CB\u7B46\u8A18\u5C6C\u6027\u300C{key}\u300D\u4E2D\u7684\u65E2\u6709\u503C\u3002\u662F\u5426\u7E7C\u7E8C\uFF1F",
    "fileField.readonly": "\u300C{label}\u300D\u662F\u552F\u8B80\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\u6B04\u4F4D\u3002",
    "fileField.tagsFrontmatterOnly": "file.tags \u53EA\u6703\u66F4\u65B0 frontmatter \u7684 tags \u9663\u5217\uFF0C\u4E0D\u6703\u4FEE\u6539\u6B63\u6587\u4E2D\u7684 #tag\u3002",
    "fileField.fixedType": "file.* \u6B04\u4F4D\u4F7F\u7528\u56FA\u5B9A\u7684\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\u884C\u70BA\uFF0C\u4E0D\u80FD\u50CF\u4E00\u822C frontmatter \u5C6C\u6027\u4E00\u6A23\u4FEE\u6539 key\u3001\u985E\u578B\u6216\u9078\u9805\u3002",
    "fileField.skippedReadonlyBatch": "\u5DF2\u7565\u904E {count} \u500B\u552F\u8B80\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\u6B04\u4F4D\u3002",
    "fileField.unsupportedKey": "\u300C{key}\u300D\u662F\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\u4FDD\u7559\u6B04\u4F4D\uFF0C\u8ACB\u63DB\u4E00\u500B\u5C6C\u6027\u540D\u7A31\u3002",
    "fileField.addFileProperty": "\u6A94\u6848\u5C6C\u6027",
    "fileField.selectFileProperty": "\u9078\u64C7\u8981\u6DFB\u52A0\u7684\u5C6C\u6027",
    "fileField.invalidTag": "\u300C{tag}\u300D\u6C92\u6709\u5132\u5B58\u3002Obsidian \u6A19\u7C64\u4E0D\u80FD\u662F\u7D14\u6578\u5B57\uFF0C\u4E0D\u80FD\u5305\u542B\u7A7A\u683C\uFF0C\u4E5F\u4E0D\u80FD\u5305\u542B\u4E0D\u652F\u63F4\u7684\u5B57\u5143\u3002",
    "fileField.migrationIgnored": "\u300C{key}\u300D\u662F\u6A94\u6848\u4E2D\u7E7C\u8CC7\u6599\u6B04\u4F4D\uFF0Cfrontmatter \u503C\u9077\u79FB\u4E0D\u6703\u57F7\u884C\uFF1B\u672C\u6B21\u53EA\u66F4\u65B0\u6B04\u4F4D\u8A2D\u5B9A\u3002",
    "errors.unsupportedBaseFilters": "\u6B64 .base \u6A94\u6848\u4F7F\u7528\u4E86 Note Database \u7121\u6CD5\u5728\u4E0D\u6539\u8B8A\u542B\u7FA9\u7684\u524D\u63D0\u4E0B\u8F49\u63DB\u7684\u5168\u57DF\u7BE9\u9078\u904B\u7B97\u5F0F\u3002",
    "app.name": "Note Database",
    "cell.addOption": "\u65B0\u589E\u9078\u9805",
    "cell.clear": "\u6E05\u7A7A",
    "cell.doubleClickEdit": "\u96D9\u64CA\u7DE8\u8F2F",
    "cell.doubleClickEditFormula": "\u96D9\u64CA\u7DE8\u8F2F\u516C\u5F0F",
    "cell.doubleClickConfigureRollup": "\u96D9\u64CA\u8A2D\u5B9A\u5F59\u7E3D",
    "cell.doubleClickRename": "\u96D9\u64CA\u91CD\u547D\u540D",
    "cell.dragFill": "\u62D6\u62FD\u586B\u5145",
    "cell.invalidDate": "\u65E5\u671F\u7121\u6548\uFF0C\u5DF2\u81EA\u52D5\u4FEE\u6B63",
    "cell.noOptions": "\u6C92\u6709\u53EF\u9078\u9805",
    "cell.optionExists": "\u9078\u9805\u300C{name}\u300D\u5DF2\u5B58\u5728",
    "column.actionFailed": "{action}\u5931\u6557: {error}",
    "column.addColumn": "\u6DFB\u52A0\u5217",
    "column.addedColumn": "\u5DF2\u6DFB\u52A0\u5217",
    "column.addedProperty": "{prefix}\uFF0C\u4F75\u70BA {count} \u500B\u6587\u4EF6\u6DFB\u52A0 frontmatter\u300C{key}\u300D",
    "column.changedToComputed": "\u5DF2\u66F4\u6539\u70BA\u8A08\u7B97\u5B57\u6BB5",
    "column.changedType": "\u5DF2\u66F4\u6539 frontmatter\u300C{key}\u300D\u7684\u985E\u578B\uFF0C\u4E26\u540C\u6B65 {count} \u500B\u6587\u4EF6",
    "column.changeTypeFailed": "\u66F4\u6539\u985E\u578B\u5931\u6557: {error}",
    "column.cleanedOldProps": "\uFF0C\u5DF2\u6E05\u7406 {count} \u500B\u820A\u5C6C\u6027",
    "column.copiedColumn": "\u5DF2\u5C07 frontmatter\u300C{source}\u300D\u8907\u88FD\u5230\u300C{target}\u300D\uFF0C\u5171 {count} \u500B\u6587\u4EF6",
    "column.copiedComputed": "\u5DF2\u8907\u88FD\u8A08\u7B97\u5217",
    "column.copiedLabel": "{label} (\u8907\u88FD)",
    "column.copyColumnFailed": "\u8907\u88FD\u5217\u5931\u6557: {error}",
    "column.deletedComputed": "\u5DF2\u522A\u9664\u8A08\u7B97\u5217",
    "column.deleteFailed": "\u522A\u9664\u5217\u5931\u6557: {error}",
    "column.insertColumn": "\u63D2\u5165\u5217",
    "column.insertedColumn": "\u5DF2\u63D2\u5165\u5217",
    "column.keyExists": "\u5C6C\u6027\u300C{key}\u300D\u5DF2\u5B58\u5728",
    "column.keyRequired": "\u5C6C\u6027\u540D\u4E0D\u80FD\u70BA\u7A7A",
    "column.migratedFiles": "\uFF0C\u5DF2\u9077\u79FB {count} \u500B\u6587\u4EF6",
    "column.newColumn": "\u65B0\u5217",
    "column.openMenu": "\u6253\u958B {label} \u83DC\u55AE",
    "column.renameFailed": "\u91CD\u547D\u540D\u5931\u6557: {error}",
    "column.skippedConflicts": "\uFF0C{count} \u500B\u6587\u4EF6\u56E0\u76EE\u6A19\u5C6C\u6027\u5DF2\u6709\u503C\u800C\u8DF3\u904E",
    "column.updatedProperty": "\u5DF2\u66F4\u65B0\u5C6C\u6027\u300C{label}\u300D\uFF08frontmatter\u300C{key}\u300D\uFF09{migration}",
    "columnType.checkbox": "\u8907\u9078\u6846",
    "columnType.computed": "\u8A08\u7B97\u5B57\u6BB5",
    "columnType.currency": "\u8CA8\u5E63",
    "columnType.date": "\u65E5\u671F",
    "columnType.datetime": "\u65E5\u671F\u548C\u6642\u9593",
    "columnType.group.advanced": "\u9AD8\u7D1A",
    "columnType.group.basic": "\u57FA\u790E",
    "columnType.group.options": "\u9078\u9805",
    "columnType.multiSelect": "\u591A\u9078",
    "columnType.number": "\u6578\u5B57",
    "columnType.select": "\u9078\u64C7",
    "columnType.status": "\u72C0\u614B",
    "columnType.text": "\u6587\u672C",
    "common.open": "\u6253\u958B",
    "common.search": "\u641C\u7D22",
    "common.total": "\u7E3D\u6578",
    "confirm.deleteDbFile": "\u78BA\u5B9A\u522A\u9664\u6578\u64DA\u5EAB\u6587\u4EF6\u300C{path}\u300D\uFF1F\u6587\u4EF6\u6703\u88AB\u79FB\u5230\u5EE2\u7D19\u7C0D\u3002",
    "confirm.deleteSelected": "\u78BA\u5B9A\u522A\u9664\u9078\u4E2D\u7684 {count} \u500B\u689D\u76EE\uFF1F\n\n\u5C0D\u61C9 Markdown \u6587\u4EF6\u6703\u88AB\u79FB\u5230\u5EE2\u7D19\u7C0D\u3002",
    "defaults.dbCopy": "{name} \u526F\u672C",
    "defaults.untitledNote": "\u672A\u547D\u540D",
    "defaults.viewCopy": "{name} \u526F\u672C",
    "empty.noColumnsDb": "\u6578\u64DA\u5EAB\u300C{name}\u300D\u6C92\u6709\u914D\u7F6E\u5217\u3002\u8ACB\u5728\u8A2D\u7F6E\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u500B\u5C6C\u6027\u5217\u3002",
    "errors.batchFillFailed": "\u6279\u91CF\u586B\u5145\u5931\u6557: {error}",
    "errors.clipboardFailed": "\u8907\u88FD\u5230\u526A\u8CBC\u677F\u5931\u6557",
    "errors.copyFailed": "\u8907\u88FD\u5931\u6557: {error}",
    "errors.createFailed": "\u65B0\u589E\u5931\u6557: {error}",
    "errors.currentDb": '\u7576\u524D\u6578\u64DA\u5EAB: "{name}"',
    "errors.databaseViewNotFound": "\u672A\u627E\u5230\u6578\u64DA\u5EAB\u8996\u5716\u3002\u8ACB\u4F7F\u7528 dbPath/databasePath \u6216 dbId/databaseId \u6307\u5B9A\u6578\u64DA\u5EAB\uFF0C\u53EF\u9078 viewId \u6307\u5B9A\u8996\u5716\u3002",
    "errors.dataReadFailed": "\u8B80\u53D6\u6578\u64DA\u5931\u6557: {error}",
    "errors.deleteFailed": "\u522A\u9664\u5931\u6557: {error}",
    "errors.fileExists": "\u6587\u4EF6\u300C{name}.md\u300D\u5DF2\u5B58\u5728\uFF0C\u7121\u6CD5\u91CD\u547D\u540D",
    "errors.noColumns": "\u6C92\u6709\u914D\u7F6E\u5217\u3002\u8ACB\u5728\u8A2D\u7F6E\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u500B\u5C6C\u6027\u5217\u3002",
    "errors.noDataExport": "\u6C92\u6709\u6578\u64DA\u53EF\u5C0E\u51FA",
    "errors.noStack": "\u7121\u5806\u68E7\u4FE1\u606F",
    "errors.noVisibleColumns": "\u6C92\u6709\u53EF\u898B\u5217\u53EF\u5C0E\u51FA",
    "errors.readFolderFailed": "\u8B80\u53D6\u6587\u4EF6\u593E\u5931\u6557: {error}",
    "errors.renameFailed": "\u91CD\u547D\u540D\u5931\u6557: {error}",
    "errors.renderError": "\u6E32\u67D3\u51FA\u932F: {message}",
    "errors.saveViewConfigFailed": "\u4FDD\u5B58\u8996\u5716\u914D\u7F6E\u5931\u6557: {error}",
    "errors.updateFailed": "\u66F4\u65B0\u5931\u6557: {error}",
    "errors.viewConfigEmpty": "\u8996\u5716\u914D\u7F6E\u70BA\u7A7A",
    "emptyState.starterPresets": "\u5F9E\u7BC4\u672C\u958B\u59CB",
    "emptyState.presetTasksTitle": "\u4EFB\u52D9",
    "emptyState.presetTasksDesc": "\u900F\u904E\u72C0\u614B\u3001\u512A\u5148\u7D1A\u8207\u622A\u6B62\u65E5\u671F\u8FFD\u8E64\u5DE5\u4F5C\u3002",
    "emptyState.presetProjectsTitle": "\u5C08\u6848",
    "emptyState.presetProjectsDesc": "\u96C6\u4E2D\u7BA1\u7406\u5C08\u6848\u3001\u8CA0\u8CAC\u4EBA\u3001\u72C0\u614B\u548C\u76EE\u6A19\u65E5\u671F\u3002",
    "emptyState.presetReadingListTitle": "\u95B1\u8B80\u6E05\u55AE",
    "emptyState.presetReadingListDesc": "\u6309\u4F5C\u8005\u3001\u9032\u5EA6\u3001\u8A55\u5206\u8207\u5206\u985E\u6574\u7406\u66F8\u7C4D\u3002",
    "emptyState.presetNotesTitle": "\u7B46\u8A18",
    "emptyState.presetNotesDesc": "\u4F7F\u7528\u6A19\u7C64\u548C\u6642\u9593\u6233\u5EFA\u7ACB\u7C21\u55AE\u7684\u5009\u5EAB\u7D22\u5F15\u3002",
    "modal.addOption": "+ \u6DFB\u52A0\u9078\u9805",
    "modal.confirmDeleteOption": "\u78BA\u8A8D\u522A\u9664\u9078\u9805\u300C{name}\u300D\uFF1F",
    "modal.displayName": "\u6B04\u6A19\u984C",
    "modal.propertyType": "\u5C6C\u6027\u985E\u578B",
    "modal.createProperty": "\u65B0\u5EFA\u5C6C\u6027",
    "modal.frontmatterKey": "\u5C6C\u6027\u9375",
    "modal.rollupNeedsRelation": "\u8ACB\u5148\u5EFA\u7ACB\u95DC\u806F\u5C6C\u6027",
    "modal.editProperty": "\u7DE8\u8F2F\u5C6C\u6027 \u2014 {label}",
    "modal.groupOrderHint": "\u62D6\u62FD\u6216\u4F7F\u7528\u6309\u9215\u8ABF\u6574\u9806\u5E8F\u3002\u5C6C\u6027\u9078\u9805\u548C\u65B0\u51FA\u73FE\u7684\u5206\u7D44\u6703\u81EA\u52D5\u88DC\u9F4A\u5230\u5217\u8868\u4E2D\u3002",
    "modal.groupOrderTitle": "\u5206\u7D44\u9806\u5E8F \u2014 {field}",
    "modal.migrateComputedDisabled": "\u8A08\u7B97\u5B57\u6BB5\u7531\u516C\u5F0F\u52D5\u614B\u751F\u6210\uFF0C\u7121\u9700\u5F9E frontmatter \u9077\u79FB\u5C6C\u6027\u503C\u3002",
    "modal.migrateValues": "\u540C\u6642\u6539\u8B8A .md \u6587\u4EF6\u4E2D\u540C\u540D\u7684 frontmatter \u7684\u503C",
    "modal.migrateValuesDesc": "\u52FE\u9078\u5F8C\uFF1A\u6BCF\u689D .md \u6587\u4EF6\u4E2D\uFF0C\u820A\u5C6C\u6027\u7684\u503C\u6703\u9077\u79FB\u5230\u65B0\u5C6C\u6027\u540D\uFF0C\u5FC5\u8981\u6642\u8986\u84CB\u5DF2\u6709\u503C\u3002\u4E0D\u52FE\u9078\u6642\uFF1A\u65B0\u5C6C\u6027\u4FDD\u7559\u539F\u6709\u503C\u3002\u7121\u8AD6\u662F\u5426\u52FE\u9078\uFF0C\u820A\u5C6C\u6027\u540D\u5C0D\u61C9\u7684 frontmatter \u90FD\u6703\u88AB\u522A\u9664\uFF0CObsidian \u4E2D\u7684\u5C6C\u6027\u985E\u578B\u4E5F\u6703\u540C\u6B65\u66F4\u65B0\u70BA\u7576\u524D\u5217\u7684\u985E\u578B\u3002",
    "modal.moveDown": "\u4E0B\u79FB",
    "modal.moveUp": "\u4E0A\u79FB",
    "modal.newOption": "\u65B0\u9078\u9805",
    "modal.optionNameDuplicate": "\u9078\u9805\u540D\u7A31\u4E0D\u80FD\u91CD\u8907",
    "modal.preset": "\u9810\u8A2D",
    "modal.propertyKey": "\u5C6C\u6027\u9375",
    "modal.propertyKeyExists": "\u5C6C\u6027\u9375\u300C{key}\u300D\u5DF2\u5B58\u5728",
    "modal.propertyKeyHint": "\u4E00\u822C\u5C6C\u6027\u6703\u4EE5\u6B64\u9375\u5B58\u5165\u7B46\u8A18 YAML/frontmatter\uFF0C\u516C\u5F0F\u5F15\u7528\u4E5F\u4F7F\u7528\u9019\u500B\u9375\u3002",
    "modal.propertyKeyRequired": "\u5C6C\u6027\u9375\u4E0D\u80FD\u70BA\u7A7A",
    "modal.resetToOptionOrder": "\u6309\u9078\u9805\u9806\u5E8F\u91CD\u7F6E",
    "modal.saveOrder": "\u4FDD\u5B58\u9806\u5E8F",
    "modal.statusOptions": "{type}\u9078\u9805 \u2014 {label}",
    "modal.untitled": "\u672A\u547D\u540D",
    "modal.wrapContent": "\u63DB\u884C\u986F\u793A\u5B8C\u6574\u5167\u5BB9",
    "notice.alreadyDbFile": "\u7576\u524D\u6587\u4EF6\u5DF2\u662F\u6578\u64DA\u5EAB\u6587\u4EF6\uFF0C\u7121\u9700\u8F49\u63DB\u3002",
    "notice.alreadyFileDb": "\u7576\u524D\u6578\u64DA\u5EAB\u5DF2\u662F\u6587\u4EF6\u6578\u64DA\u5EAB\uFF0C\u7121\u9700\u8F49\u63DB\u3002",
    "notice.cannotCreateTab": "\u7121\u6CD5\u5275\u5EFA\u65B0\u7684\u6A19\u7C64\u9801",
    "notice.clearedCells": "\u5DF2\u6E05\u7A7A {count} \u500B\u55AE\u5143\u683C",
    "notice.clearedCellsSkipped": "\u5DF2\u6E05\u7A7A {count} \u500B\u55AE\u5143\u683C\uFF0C\u8DF3\u904E {skipped} \u500B\u4E0D\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\u3002",
    "notice.copiedCells": "\u5DF2\u8907\u88FD {count} \u500B\u55AE\u5143\u683C",
    "notice.copiedDatabase": "\u5DF2\u8907\u88FD\u6578\u64DA\u5EAB: {name}",
    "notice.copiedDbFile": "\u5DF2\u8907\u88FD\u6578\u64DA\u5EAB\u6587\u4EF6: {path}",
    "notice.copiedEmbedCode": "\u5DF2\u8907\u88FD\u8A72\u8996\u5716\u7684\u5D4C\u5165\u4EE3\u78BC",
    "notice.copiedExport": "\u5DF2\u8907\u88FD {format} \u5230\u526A\u8CBC\u677F\uFF08{count} \u884C\uFF09",
    "notice.copiedView": "\u5DF2\u8907\u88FD\u8996\u5716: {name}",
    "notice.createdDbFile": "\u5DF2\u5275\u5EFA\u6578\u64DA\u5EAB\u6587\u4EF6: {path}",
    "notice.createdRow": "\u5DF2\u65B0\u589E\u4E00\u884C: {name}",
    "notice.createEntry": "\u65B0\u5EFA\u689D\u76EE",
    "notice.databasesMigrated": "\u5DF2\u9077\u79FB {count} \u500B\u6578\u64DA\u5EAB\u5230\u6587\u4EF6",
    "notice.deletedRow": "\u5DF2\u522A\u9664: {name}",
    "notice.deleteEntry": "\u522A\u9664\u689D\u76EE",
    "notice.duplicatedRecord": "\u5DF2\u8907\u88FD\u5230 {path}",
    "notice.editEntry": "\u7DE8\u8F2F\u689D\u76EE",
    "notice.editInFullView": "\u8ACB\u5728\u5B8C\u6574\u6578\u64DA\u5EAB\u8996\u5716\u4E2D{action}",
    "notice.editProperty": "\u7DE8\u8F2F\u5C6C\u6027",
    "notice.embedReadonly": "\u5D4C\u5165\u6578\u64DA\u5EAB\u70BA\u53EA\u8B80\u6A21\u5F0F\uFF0C\u8ACB\u5728\u5B8C\u6574\u6578\u64DA\u5EAB\u8996\u5716\u4E2D{action}",
    "notice.filledCells": "\u5DF2\u586B\u5145 {count} \u500B\u55AE\u5143\u683C",
    "notice.filledCellsSkipped": "\u5DF2\u586B\u5145 {count} \u500B\u55AE\u5143\u683C\uFF0C\u8DF3\u904E {skipped} \u500B\u4E0D\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\u3002",
    "notice.generatedFromBase": "\u5DF2\u5F9E .base \u751F\u6210: {path}",
    "notice.importCancelled": "\u5DF2\u53D6\u6D88\u5C0E\u5165",
    "notice.noDbCopyInfo": "\u672A\u627E\u5230\u53EF\u8907\u88FD\u7684\u6578\u64DA\u5EAB\u5B9A\u4F4D\u4FE1\u606F",
    "notice.noDbFilesFound": "\u6C92\u6709\u627E\u5230 db_view: true \u7684\u6578\u64DA\u5EAB\u6587\u4EF6\u3002",
    "notice.noEditableCells": "\u9078\u5340\u4E2D\u6C92\u6709\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\u3002",
    "notice.noEditableCellsSkipped": "\u9078\u5340\u4E2D\u6C92\u6709\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\uFF0C\u5DF2\u8DF3\u904E {skipped} \u500B\u4E0D\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\u3002",
    "notice.pastedCells": "\u5DF2\u7C98\u8CBC {count} \u500B\u55AE\u5143\u683C",
    "notice.pastedCellsSkipped": "\u5DF2\u7C98\u8CBC {count} \u500B\u55AE\u5143\u683C\uFF0C\u8DF3\u904E {skipped} \u500B\u4E0D\u53EF\u7DE8\u8F2F\u55AE\u5143\u683C\u3002",
    "notice.selectGroupField": "\u8ACB\u5148\u9078\u64C7\u4E00\u500B\u5206\u7D44\u5C6C\u6027",
    "notice.viewLimit": "\u6700\u591A\u652F\u6301 15 \u500B\u8996\u5716",
    "settings.language.en": "English",
    "settings.sourceFolder.placeholder": "\u4F8B\u5982: Projects",
    "settings.trash.confirmPermanentDelete": "\u6C38\u4E45\u522A\u9664\u300C{name}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u92B7\u3002",
    "settings.trash.empty": "\u56DE\u6536\u7AD9\u70BA\u7A7A\u3002",
    "settings.trash.manageDesc": "\u79FB\u81F3\u63D2\u4EF6\u56DE\u6536\u7AD9\u7684\u6578\u64DA\u5EAB\u53EF\u4EE5\u6062\u5FA9\u6216\u6C38\u4E45\u522A\u9664\u3002",
    "settings.trash.manageTitle": "\u63D2\u4EF6\u56DE\u6536\u7AD9",
    "settings.trash.name": "\u63D2\u4EF6\u56DE\u6536\u7AD9",
    "settings.trash.restoreAsConfig": "\u6062\u5FA9\u70BA\u914D\u7F6E\u578B\u6578\u64DA\u5EAB",
    "settings.trash.restoreAsFile": "\u6062\u5FA9\u70BA\u6587\u4EF6\u578B\u6578\u64DA\u5EAB",
    "settings.trash.restoreDesc": "\u9078\u64C7\u6062\u5FA9\u65B9\u5F0F\u3002",
    "settings.trash.restoreTitle": "\u6062\u5FA9\u300C{name}\u300D",
    "viewConfig.ratioClassic": "\u7D93\u5178 0.75",
    "viewConfig.ratioCurrent": "\u7576\u524D {ratio}",
    "viewConfig.ratioLandscape": "\u6A6B\u5411 4:3",
    "viewConfig.ratioPortrait": "\u8C4E\u5411 0.6",
    "viewConfig.ratioSquare": "\u6B63\u65B9\u5F62 1:1",
    "viewConfig.ratioWide": "\u5BEC\u5C4F 16:9"
  };
  var dictionaries = {
    en,
    "zh-CN": zhCN,
    "zh-TW": zhTW
  };
  var currentLocale = "system";
  function getEffectiveLocale(locale = currentLocale) {
    if (locale !== "system") return locale;
    const docLang = typeof window !== "undefined" && window.activeDocument?.documentElement?.lang;
    const navLang = typeof navigator !== "undefined" && navigator.language;
    const lang = (docLang || navLang || "").toLowerCase();
    if (lang.includes("zh-tw") || lang.includes("zh-hk") || lang.includes("zh-hant")) return "zh-TW";
    if (lang.startsWith("zh")) return "zh-CN";
    return "en";
  }
  function t(key, vars) {
    const locale = getEffectiveLocale();
    const template = dictionaries[locale][key] || dictionaries.en[key] || key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  }

  // src/data/aggregate.ts
  var NUMERIC_ROLLUP_KINDS = /* @__PURE__ */ new Set([
    "count",
    "sum",
    "avg",
    "min",
    "max",
    "median",
    "range",
    "percentEmpty",
    "percentFilled"
  ]);
  function isNumericRollupKind(id) {
    return NUMERIC_ROLLUP_KINDS.has(id);
  }
  function min(numbers) {
    const finite = finiteNumbers(numbers);
    return finite.length > 0 ? Math.min(...finite) : null;
  }
  function max(numbers) {
    const finite = finiteNumbers(numbers);
    return finite.length > 0 ? Math.max(...finite) : null;
  }
  function median(numbers) {
    const finite = finiteNumbers(numbers);
    if (finite.length === 0) return null;
    const sorted = [...finite].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }
  function range(numbers) {
    const finite = finiteNumbers(numbers);
    if (finite.length === 0) return null;
    return Math.max(...finite) - Math.min(...finite);
  }
  function earliest(timestamps) {
    const finite = finiteNumbers(timestamps);
    return finite.length > 0 ? new Date(Math.min(...finite)) : null;
  }
  function latest(timestamps) {
    const finite = finiteNumbers(timestamps);
    return finite.length > 0 ? new Date(Math.max(...finite)) : null;
  }
  function finiteNumbers(numbers) {
    return numbers.filter((value) => Number.isFinite(value));
  }

  // src/data/column-display.ts
  function getComputedFieldForColumn(col, computedFields) {
    if (col.type !== "computed") return void 0;
    const key = getComputedStorageKey(col);
    return computedFields?.find((field) => field.key === key);
  }
  function getColumnDisplayType(col, computedFields) {
    if (col.type === "rollup") {
      const aggregation = col.rollupConfig?.aggregation ?? "";
      return aggregation === "earliest" || aggregation === "latest" ? "date" : isNumericRollupKind(aggregation) ? "number" : "text";
    }
    if (col.type !== "computed") return col.type;
    return getComputedFieldForColumn(col, computedFields)?.type || "text";
  }
  function getComputedStorageKey(col) {
    if (col.type !== "computed") return col.key;
    return normalizeComputedStorageKey(col.computedKey || col.key);
  }
  function normalizeComputedStorageKey(key) {
    return key.startsWith("formula.") ? key.slice("formula.".length) : key;
  }

  // src/data/stringify.ts
  function stringifyValue(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
    if (typeof value === "boolean" || typeof value === "bigint") return String(value);
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Error) return value.message;
    if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).join(", ");
    try {
      return JSON.stringify(value) || "";
    } catch {
      return Object.prototype.toString.call(value);
    }
  }

  // src/data/date-time-format.ts
  var DATE_TIME_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/;
  function isDateLikeColumnType(type) {
    return type === "date" || type === "datetime";
  }
  function parseDateTimeParts(value) {
    if (value == null || value === "") return null;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
      const date = new Date(value);
      const year2 = date.getFullYear();
      const month2 = pad2(date.getMonth() + 1);
      const day2 = pad2(date.getDate());
      return {
        dateKey: `${year2}-${month2}-${day2}`,
        year: year2,
        month: month2,
        day: day2,
        time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
      };
    }
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      const year2 = value.getUTCFullYear();
      const month2 = pad2(value.getUTCMonth() + 1);
      const day2 = pad2(value.getUTCDate());
      return {
        dateKey: `${year2}-${month2}-${day2}`,
        year: year2,
        month: month2,
        day: day2,
        time: `${pad2(value.getUTCHours())}:${pad2(value.getUTCMinutes())}`
      };
    }
    const text = stringifyValue(value).trim();
    const match = text.match(DATE_TIME_RE);
    if (match) {
      const year2 = Number(match[1]);
      const monthNumber = Number(match[2]);
      const dayNumber = Number(match[3]);
      if (!isValidDateParts(year2, monthNumber, dayNumber)) return null;
      const month2 = pad2(monthNumber);
      const day2 = pad2(dayNumber);
      const hour = match[4] != null ? Number(match[4]) : void 0;
      const minute = match[5] != null ? Number(match[5]) : void 0;
      const time = hour != null && minute != null && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? `${pad2(hour)}:${pad2(minute)}` : void 0;
      return { dateKey: `${year2}-${month2}-${day2}`, year: year2, month: month2, day: day2, time };
    }
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return null;
    const year = parsed.getFullYear();
    const month = pad2(parsed.getMonth() + 1);
    const day = pad2(parsed.getDate());
    return {
      dateKey: `${year}-${month}-${day}`,
      year,
      month,
      day,
      time: `${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`
    };
  }
  function formatDateValueDisplay(value, options = {}) {
    const parts = parseDateTimeParts(value);
    if (!parts) return stringifyValue(value);
    return formatDateParts(parts, shouldShowYear(parts.year, options));
  }
  function formatDateTimeValueDisplay(value, options = {}) {
    const parts = parseDateTimeParts(value);
    if (!parts) return stringifyValue(value);
    const date = formatDateParts(parts, shouldShowYear(parts.year, options));
    const time = parts.time || (options.showTimeWhenMissing ? "00:00" : "");
    return time ? `${date} ${time}` : date;
  }
  var dateDisplayMode = "always";
  function shouldShowYear(year, options) {
    if (dateDisplayMode === "always") return true;
    if (dateDisplayMode === "never") return false;
    const contextYear = options.contextYear ?? (/* @__PURE__ */ new Date()).getFullYear();
    return year !== contextYear;
  }
  function formatDateParts(parts, showYear) {
    const date = new Date(parts.year, Number(parts.month) - 1, Number(parts.day));
    const options = showYear ? { year: "numeric", month: "long", day: "numeric" } : { month: "long", day: "numeric" };
    return new Intl.DateTimeFormat(getEffectiveLocale(), options).format(date);
  }
  function isValidDateParts(year, month, day) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  function pad2(value) {
    return String(value).padStart(2, "0");
  }
  function toDateTimestamp(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
    const parts = parseDateTimeParts(value);
    if (parts) {
      const hour = parts.time ? Number(parts.time.slice(0, 2)) : 0;
      const minute = parts.time ? Number(parts.time.slice(3, 5)) : 0;
      return new Date(parts.year, Number(parts.month) - 1, Number(parts.day), hour, minute).getTime();
    }
    const text = stringifyValue(value).trim();
    return /^\d+$/.test(text) && Number.isFinite(Number(text)) ? Number(text) : null;
  }

  // src/data/status-colors.ts
  var STATUS_COLORS = [
    "gray",
    "brown",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "red",
    "slate",
    "cyan",
    "teal",
    "lime",
    "indigo",
    "violet",
    "rose"
  ];

  // src/data/column-types.ts
  var STATUS_OPTION_PRESETS = [
    {
      key: "general",
      label: "\u901A\u7528\u72B6\u6001",
      options: [
        { value: "\u672A\u5F00\u59CB", color: "gray" },
        { value: "\u8FDB\u884C\u4E2D", color: "blue" },
        { value: "\u5DF2\u5B8C\u6210", color: "green" }
      ]
    },
    {
      key: "task",
      label: "\u4EFB\u52A1\u72B6\u6001",
      options: [
        { value: "\u5F85\u5904\u7406", color: "gray" },
        { value: "\u8FDB\u884C\u4E2D", color: "blue" },
        { value: "\u53D7\u963B", color: "orange" },
        { value: "\u5DF2\u5B8C\u6210", color: "green" },
        { value: "\u5DF2\u53D6\u6D88", color: "red" }
      ]
    },
    {
      key: "reading",
      label: "\u9605\u8BFB\u72B6\u6001",
      options: [
        { value: "\u5F85\u8BFB", color: "gray" },
        { value: "\u9605\u8BFB\u4E2D", color: "blue" },
        { value: "\u5DF2\u8BFB", color: "green" },
        { value: "\u6682\u505C", color: "orange" },
        { value: "\u653E\u5F03", color: "red" }
      ]
    },
    {
      key: "review",
      label: "\u5BA1\u6838\u72B6\u6001",
      options: [
        { value: "\u5F85\u5BA1\u6838", color: "gray" },
        { value: "\u5BA1\u6838\u4E2D", color: "blue" },
        { value: "\u5DF2\u901A\u8FC7", color: "green" },
        { value: "\u5DF2\u62D2\u7EDD", color: "red" }
      ]
    }
  ];
  var DEFAULT_STATUS_OPTIONS = STATUS_OPTION_PRESETS[0].options;
  var DEFAULT_STATUS_PRESET_ID = STATUS_OPTION_PRESETS[0].key;
  var OPTION_COLORS = [...STATUS_COLORS];
  function getColumnOptions(col) {
    return col.statusOptions?.length ? col.statusOptions : [];
  }
  function isObsidianTagsKey(key) {
    return key === "tags";
  }
  function normalizeObsidianTagValue(value) {
    return stringifyValue(value).trim().replace(/^#/, "");
  }
  function validateObsidianTagValue(value) {
    const tag = normalizeObsidianTagValue(value);
    if (!tag) return { valid: false, value: tag };
    if (/\s/.test(tag)) return { valid: false, value: tag };
    if (/^\d+$/.test(tag)) return { valid: false, value: tag };
    if (!/^[\p{L}\p{N}_\-/]+$/u.test(tag)) return { valid: false, value: tag };
    return { valid: true, value: tag };
  }
  function normalizeValidObsidianTagValue(value) {
    const result = validateObsidianTagValue(value);
    return result.valid ? result.value : null;
  }
  function toValidObsidianTagValues(value) {
    const seen = /* @__PURE__ */ new Set();
    const values = [];
    for (const raw of getObsidianTagInputEntries(value)) {
      const tag = normalizeValidObsidianTagValue(raw);
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      values.push(tag);
    }
    return values;
  }
  function getObsidianTagInputEntries(value) {
    if (Array.isArray(value)) return value;
    if (value == null || value === "") return [];
    if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
    return [value];
  }
  function normalizeOptionValueForKey(key, value) {
    return isObsidianTagsKey(key) ? normalizeObsidianTagValue(value) : stringifyValue(value).trim();
  }
  function resolveOptionDisplay(col, value) {
    const normalized = normalizeOptionValueForKey(col.key, value);
    const option = getColumnOptions(col).find(
      (candidate) => normalizeOptionValueForKey(col.key, candidate.value) === normalized
    );
    return { value: normalized, option };
  }
  function toBooleanValue(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const normalized = stringifyValue(value).trim().toLowerCase();
    return ["true", "yes", "y", "1", "on", "checked", "\u662F", "\u5DF2\u52FE\u9009"].includes(normalized);
  }

  // src/data/relation-links.ts
  var WIKILINK_PATTERN = /^\s*\[\[([\s\S]+?)\]\]\s*$/;
  function parseRelationLink(value) {
    if (typeof value !== "string") return null;
    const match = value.match(WIKILINK_PATTERN);
    if (!match) return null;
    const body = match[1].trim();
    if (!body) return null;
    const separator = body.indexOf("|");
    const targetWithSubpath = (separator >= 0 ? body.slice(0, separator) : body).trim();
    const target = targetWithSubpath.split("#", 1)[0].trim();
    if (!target) return null;
    const alias = separator >= 0 ? body.slice(separator + 1).trim() : void 0;
    return { raw: value, target, alias: alias || void 0 };
  }
  function getRelationDisplayLabel(link, fallback = link.target) {
    return link.alias || link.target.split("/").pop() || fallback;
  }

  // src/data/group-display.ts
  function getDateGroupMode(config, field) {
    return field && config.dateGroupModes?.[field] || "exact";
  }
  function isUncategorizedGroupKey(groupKey) {
    const key = stringifyValue(groupKey).trim();
    return !key || key === t("common.uncategorized");
  }
  function formatGroupKeyDisplay(config, groupField, groupKey, options = {}) {
    const key = stringifyValue(groupKey).trim();
    const uncategorizedLabel = options.uncategorizedLabel || t("common.uncategorized");
    if (isUncategorizedGroupKey(groupKey) || options.uncategorizedKeys?.includes(key)) return uncategorizedLabel;
    const column = groupField ? config.schema.columns.find((candidate) => candidate.key === groupField) : void 0;
    const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : void 0;
    if (displayType === "date") return formatDateValueDisplay(key);
    if (displayType === "datetime") {
      if (getDateGroupMode(config, groupField) === "date") return formatDateValueDisplay(key);
      return formatDateTimeValueDisplay(key, { mode: "full", showTimeWhenMissing: true });
    }
    if (displayType === "checkbox") return toBooleanValue(key) ? t("common.true") : t("common.false");
    if (displayType === "relation") {
      const link = parseRelationLink(key);
      return link ? getRelationDisplayLabel(link, key) : key;
    }
    return key;
  }
  function resolveGroupCreateDefaults(config, groupField, groupKey) {
    if (groupKey === t("common.uncategorized")) return { [groupField]: "" };
    const col = config.schema.columns.find((candidate) => candidate.key === groupField);
    if (col?.type === "multi-select" || col?.type === "relation") return { [groupField]: [groupKey] };
    if (col?.type === "checkbox") return { [groupField]: toBooleanValue(groupKey) };
    return { [groupField]: groupKey };
  }
  function isComputedGroupField(config, field) {
    if (!field) return false;
    if (field.startsWith("formula.")) return true;
    const col = config.schema.columns.find((candidate) => candidate.key === field);
    return col?.type === "computed" || col?.type === "rollup";
  }

  // src/views/group-label-renderer.ts
  function renderGroupLabel(parent, config, field, groupKey, className) {
    const label = formatGroupKeyDisplay(config, field, groupKey);
    const title = parent.createSpan({ cls: className });
    title.title = label;
    const column = field ? config.schema.columns.find((candidate) => candidate.key === field) : void 0;
    const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : void 0;
    const isOptionGroup = displayType === "status" || displayType === "select" || displayType === "multi-select";
    if (!isOptionGroup) {
      title.setText(label);
      return;
    }
    if (isUncategorizedGroupKey(groupKey)) {
      title.setText(label);
      return;
    }
    const { option } = column ? resolveOptionDisplay(column, groupKey) : { option: void 0 };
    title.createSpan({
      cls: `status-badge status-color-${option?.color || "gray"}`,
      attr: { "data-status-color": option?.color || "gray" },
      text: label
    });
  }

  // src/views/drag-drop-feedback.ts
  var DROP_BEFORE_CLASS = "is-drop-before";
  var DROP_AFTER_CLASS = "is-drop-after";
  var DragDropFeedbackState = class {
    constructor() {
      this.target = null;
      this.placement = null;
      this.phase = null;
      this.sourceId = null;
      this.sourcePaths = [];
      this.destinationId = null;
      this.error = null;
    }
    begin(sourceId, sourcePaths = [], destinationId = null) {
      this.sourceId = sourceId;
      this.sourcePaths = [...sourcePaths];
      this.destinationId = destinationId;
      this.error = null;
      this.phase = "over";
    }
    update(target, placement, destinationId) {
      if (this.target === target && this.placement === placement) return;
      this.removePlacementClasses();
      this.target = target;
      this.placement = placement;
      this.destinationId = destinationId ?? target.dataset.noteDatabaseDestinationId ?? null;
      this.phase = "over";
      this.error = null;
      target.classList.add(getPlacementClass(placement));
    }
    setPending() {
      this.setPhase("pending");
    }
    commit() {
      this.setPhase("committed");
    }
    fail(error) {
      this.error = error == null ? null : String(error);
      this.setPhase("failed");
    }
    getPhase() {
      return this.phase;
    }
    getSnapshot() {
      return {
        phase: this.phase,
        sourceId: this.sourceId,
        sourcePaths: [...this.sourcePaths],
        destinationId: this.destinationId,
        placement: this.placement,
        error: this.error
      };
    }
    clear() {
      this.removePlacementClasses();
      this.target = null;
      this.placement = null;
      this.phase = null;
      this.sourceId = null;
      this.sourcePaths = [];
      this.destinationId = null;
      this.error = null;
    }
    clearTarget(target) {
      if (this.target !== target) return;
      this.clear();
    }
    getPlacement(target) {
      if (this.target !== target) return null;
      return this.placement;
    }
    setPhase(phase) {
      this.phase = phase;
      this.target?.classList.toggle("is-drop-pending", phase === "pending");
      this.target?.classList.toggle("is-drop-committed", phase === "committed");
      this.target?.classList.toggle("is-drop-failed", phase === "failed");
      const count = this.sourcePaths.length || 1;
      if (phase === "pending") {
        this.announce(t("drag.movingItems", { count }));
      } else if (phase === "committed") {
        this.announce(t("operation.moved", { count }));
      } else if (phase === "failed") {
        this.announce(this.error || t("operation.failed"));
      }
    }
    announce(message) {
      if (!message) return;
      const doc = this.target?.ownerDocument ?? (typeof document !== "undefined" ? document : null);
      if (!doc) return;
      const container = (this.target && typeof this.target.closest === "function" ? this.target.closest(".note-database-container") : null) ?? doc.body;
      if (!container) return;
      let liveRegion = typeof container.querySelector === "function" ? container.querySelector(":scope > .db-sr-status, .db-sr-status") : null;
      if (!liveRegion && typeof doc.createElement === "function" && typeof container.appendChild === "function") {
        liveRegion = doc.createElement("div");
        liveRegion.className = "db-sr-status";
        liveRegion.setAttribute("role", "status");
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "true");
        container.appendChild(liveRegion);
      }
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }
    removePlacementClasses() {
      if (!this.target) return;
      this.target.classList.remove(
        DROP_BEFORE_CLASS,
        DROP_AFTER_CLASS,
        "is-drop-pending",
        "is-drop-committed",
        "is-drop-failed"
      );
    }
  };
  function resolveDropPlacement(target, event, axis) {
    const rect = target.getBoundingClientRect();
    if (axis === "horizontal") {
      return event.clientX > rect.left + rect.width / 2 ? "after" : "before";
    }
    return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  }
  function getPlacementClass(placement) {
    return placement === "after" ? DROP_AFTER_CLASS : DROP_BEFORE_CLASS;
  }

  // src/views/mobile-move-icon.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  function renderMobileMoveIcon(target) {
    target.empty();
    const svg = window.activeDocument.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("icon", "icon-tabler", "icon-tabler-caret-up-down");
    appendPath(svg, "m8 9 4-4 4 4");
    appendPath(svg, "m16 15-4 4-4-4");
    target.appendChild(svg);
  }
  function appendPath(svg, d) {
    const path = window.activeDocument.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    svg.appendChild(path);
  }

  // src/views/property-type-icon.ts
  var SVG_NS2 = "http://www.w3.org/2000/svg";
  var PROPERTY_TYPE_ICON_NAMES = {
    text: "letter-case",
    number: "number-123",
    date: "calendar",
    datetime: "clock",
    currency: "coin",
    select: "circle-dot",
    "multi-select": "tags",
    status: "progress-check",
    checkbox: "square-check",
    computed: "math-function",
    relation: "link",
    rollup: "sum",
    files: "link"
  };
  var PROPERTY_TYPE_ICON_DEFS = {
    "letter-case": {
      paths: [
        { d: "M0 0h24v24H0z", attrs: { stroke: "none", fill: "none" } },
        { d: "M14 15.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" },
        { d: "M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5" },
        { d: "M3 13h7" },
        { d: "M21 12v7" }
      ]
    },
    "number-123": {
      paths: [
        { d: "M0 0h24v24H0z", attrs: { stroke: "none", fill: "none" } },
        { d: "M3 10l2 -2v8" },
        { d: "M9 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" },
        { d: "M17 8h2.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-2.5" }
      ]
    },
    // date：纯日历，对齐 Obsidian 原生 Date 类型图标（lucide calendar）
    "calendar": {
      paths: [
        { d: "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" },
        { d: "M16 3v4" },
        { d: "M8 3v4" },
        { d: "M4 11h16" }
      ]
    },
    // datetime：纯时钟，对齐 Obsidian 原生 Date & time 类型图标（lucide clock）
    "clock": {
      paths: [
        { d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" },
        { d: "M12 7v5l3 3" }
      ]
    },
    coin: {
      paths: [
        { d: "M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" },
        { d: "M14.8 9a3 3 0 0 0 -2.8 -1.5a2.5 2.5 0 0 0 0 5a2.5 2.5 0 0 1 0 5a3 3 0 0 1 -2.8 -1.5" },
        { d: "M12 6v12" }
      ]
    },
    "circle-dot": {
      paths: [
        { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" },
        { d: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }
      ]
    },
    tags: {
      paths: [
        { d: "M7.5 7.5m-.5 0a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" },
        { d: "M3 6v5.2a2 2 0 0 0 .6 1.4l7.8 7.8a2 2 0 0 0 2.8 0l5.2 -5.2a2 2 0 0 0 0 -2.8l-7.8 -7.8a2 2 0 0 0 -1.4 -.6h-5.2a2 2 0 0 0 -2 2z" },
        { d: "M12 3l8.4 8.4a2 2 0 0 1 0 2.8l-4.4 4.4" }
      ]
    },
    "progress-check": {
      paths: [
        { d: "M0 0h24v24H0z", attrs: { stroke: "none", fill: "none" } },
        { d: "M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" },
        { d: "M14 3.223a9.003 9.003 0 0 1 0 17.554" },
        { d: "M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" },
        { d: "M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" },
        { d: "M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" },
        { d: "M9 12l2 2l4 -4" }
      ]
    },
    "square-check": {
      paths: [
        { d: "M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" },
        { d: "M9 12l2 2l4 -4" }
      ]
    },
    "math-function": {
      paths: [
        { d: "M0 0h24v24H0z", attrs: { stroke: "none", fill: "none" } },
        { d: "M3 19a2 2 0 0 0 2 2c2 0 2 -4 3 -9s1 -9 3 -9a2 2 0 0 1 2 2" },
        { d: "M5 12h6" },
        { d: "M15 12l6 6" },
        { d: "M15 18l6 -6" }
      ]
    },
    link: {
      paths: [
        { d: "M10 13a5 5 0 0 0 7.07 .07l2 -2a5 5 0 0 0 -7.07 -7.07l-1.15 1.15" },
        { d: "M14 11a5 5 0 0 0 -7.07 -.07l-2 2a5 5 0 0 0 7.07 7.07l1.15 -1.15" }
      ]
    },
    sum: {
      paths: [
        { d: "M18 4h-10l6 8l-6 8h10" }
      ]
    }
  };
  function getPropertyTypeIconName(col) {
    return col.key === "file.name" ? PROPERTY_TYPE_ICON_NAMES.text : PROPERTY_TYPE_ICON_NAMES[col.type];
  }
  function getPropertyTypeIconDef(col) {
    return PROPERTY_TYPE_ICON_DEFS[getPropertyTypeIconName(col)] || PROPERTY_TYPE_ICON_DEFS["letter-case"];
  }
  function renderPropertyTypeIcon(parent, col, cls = "db-property-icon") {
    const icon = parent.createSpan({ cls });
    const iconName = getPropertyTypeIconName(col);
    const doc = parent.ownerDocument || window.activeDocument;
    const svg = doc.createElementNS(SVG_NS2, "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("icon", "icon-tabler", "icons-tabler-outline", `icon-tabler-${iconName}`);
    for (const pathDef of getPropertyTypeIconDef(col).paths) {
      const path = doc.createElementNS(SVG_NS2, "path");
      path.setAttribute("d", pathDef.d);
      if (pathDef.attrs) {
        for (const [name, value] of Object.entries(pathDef.attrs)) {
          path.setAttribute(name, value);
        }
      }
      svg.appendChild(path);
    }
    icon.setAttribute("data-icon", iconName);
    icon.appendChild(svg);
    return icon;
  }

  // src/views/table-layout.ts
  function getTableMinWidth(selectionWidth, columnWidths) {
    return selectionWidth + columnWidths.reduce((total, width) => total + width, 0);
  }
  function getTableLayout(selectionWidth, columnWidths, availableWidth = 0) {
    const baseWidth = getTableMinWidth(selectionWidth, columnWidths);
    const rendered = [...columnWidths];
    const extra = Math.max(0, Math.floor(availableWidth) - baseWidth);
    if (extra > 0 && rendered.length > 0) {
      rendered[rendered.length - 1] += extra;
    }
    return {
      tableWidth: baseWidth + extra,
      columnWidths: rendered
    };
  }
  function getTableColumnStyle(width, _index, _total) {
    return { width: `${width}px` };
  }

  // src/data/group-visibility.ts
  function getGroupRowLimit(config) {
    return config.groupRowLimit && config.groupRowLimit > 0 ? config.groupRowLimit : 0;
  }
  function getGroupVisibleCount(config, field, key, totalCount) {
    const limit = getGroupRowLimit(config);
    if (limit <= 0) return totalCount;
    const expanded = config.expandedGroupRows?.[field]?.[key];
    if (expanded === -1) return totalCount;
    if (typeof expanded === "number" && expanded > 0) return Math.min(expanded, totalCount);
    return Math.min(limit, totalCount);
  }

  // src/views/group-expand-controls.ts
  function renderGroupExpandControls(parent, config, field, key, totalCount, actions) {
    const limit = getGroupRowLimit(config);
    if (limit <= 0 || totalCount <= limit) return false;
    const visible = getGroupVisibleCount(config, field, key, totalCount);
    const hidden = totalCount - visible;
    const expandedBeyondLimit = visible > limit;
    if (hidden <= 0 && !expandedBeyondLimit) return false;
    const row = parent.createDiv({ cls: "db-group-expand-controls" });
    if (hidden > 0) {
      const more = row.createEl("button", {
        cls: "db-group-expand-btn db-group-expand-more",
        text: t("group.expandMore", { count: Math.min(limit, hidden) })
      });
      more.onclick = () => actions.expandGroup?.(field, key, visible + limit);
      const all = row.createEl("button", {
        cls: "db-group-expand-btn db-group-expand-all",
        text: t("group.expandAll")
      });
      all.onclick = () => actions.expandGroup?.(field, key, -1);
    }
    if (expandedBeyondLimit) {
      const collapse = row.createEl("button", {
        cls: "db-group-expand-btn db-group-collapse",
        text: t("group.collapseToLimit")
      });
      collapse.onclick = () => actions.expandGroup?.(field, key, 0);
    }
    return true;
  }

  // src/data/multi-group-display.ts
  function getGroupHeaderClassName(depth) {
    const normalizedDepth = normalizeDepth(depth);
    return normalizedDepth === 0 ? "db-group-header" : `db-group-header db-group-header--depth-${normalizedDepth}`;
  }
  function getGroupHeaderDepthValue(depth) {
    const normalizedDepth = normalizeDepth(depth);
    return normalizedDepth === 0 ? void 0 : String(normalizedDepth);
  }
  function normalizeDepth(depth) {
    return Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
  }

  // src/views/empty-state-renderer.ts
  var STARTER_PRESETS = [
    {
      id: "tasks",
      get name() {
        return t("emptyState.presetTasksTitle");
      },
      get description() {
        return t("emptyState.presetTasksDesc");
      },
      icon: "check-square",
      columns: [
        { key: "file.name", label: "Title", type: "text" },
        { key: "status", label: "Status", type: "status", statusOptions: [
          { value: "To Do", color: "gray" },
          { value: "In Progress", color: "blue" },
          { value: "Done", color: "green" }
        ] },
        { key: "priority", label: "Priority", type: "select", statusOptions: [
          { value: "P1", color: "red" },
          { value: "P2", color: "orange" },
          { value: "P3", color: "gray" }
        ] },
        { key: "due", label: "Due Date", type: "date" }
      ]
    },
    {
      id: "projects",
      get name() {
        return t("emptyState.presetProjectsTitle");
      },
      get description() {
        return t("emptyState.presetProjectsDesc");
      },
      icon: "briefcase-business",
      columns: [
        { key: "file.name", label: "Project Name", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "lead", label: "Lead", type: "text" },
        { key: "targetDate", label: "Target Date", type: "date" },
        { key: "tags", label: "Tags", type: "multi-select" }
      ]
    },
    {
      id: "reading-list",
      get name() {
        return t("emptyState.presetReadingListTitle");
      },
      get description() {
        return t("emptyState.presetReadingListDesc");
      },
      icon: "book-open",
      columns: [
        { key: "file.name", label: "Book Title", type: "text" },
        { key: "author", label: "Author", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "rating", label: "Rating", type: "number" },
        { key: "category", label: "Category", type: "select" }
      ]
    },
    {
      id: "notes",
      get name() {
        return t("emptyState.presetNotesTitle");
      },
      get description() {
        return t("emptyState.presetNotesDesc");
      },
      icon: "notebook-tabs",
      columns: [
        { key: "file.name", label: "Note Title", type: "text" },
        { key: "tags", label: "Tags", type: "multi-select" },
        { key: "file.created", label: "Created Date", type: "date" },
        { key: "file.modified", label: "Modified Date", type: "date" }
      ]
    }
  ];
  var EMPTY_STATE_COPY = {
    "no-database": {
      title: "emptyState.noDatabaseTitle",
      message: "emptyState.noDatabaseMessage",
      icon: "database"
    },
    "no-columns": {
      title: "emptyState.noColumnsTitle",
      message: "emptyState.noColumnsMessage",
      icon: "columns-3"
    },
    "no-matching-data": {
      title: "emptyState.noMatchingTitle",
      message: "emptyState.noMatchingMessage",
      icon: "inbox"
    },
    "search-empty": {
      title: "emptyState.searchEmptyTitle",
      message: "emptyState.searchEmptyMessage",
      icon: "search-x"
    },
    "filter-empty": {
      title: "emptyState.filterEmptyTitle",
      message: "emptyState.filterEmptyMessage",
      icon: "list-filter"
    },
    "filter-and-search-empty": {
      title: "emptyState.filterAndSearchTitle",
      message: "emptyState.filterAndSearchMessage",
      icon: "list-filter"
    },
    "limit-empty": {
      title: "emptyState.limitEmptyTitle",
      message: "emptyState.limitEmptyMessage",
      icon: "list-x"
    },
    "no-date-field": {
      title: "emptyState.noDateFieldTitle",
      message: "emptyState.noDateFieldMessage",
      icon: "calendar-plus"
    },
    "no-events": {
      title: "emptyState.noEventsTitle",
      message: "emptyState.noEventsMessage",
      icon: "calendar-off"
    },
    "no-events-in-range": {
      title: "emptyState.noEventsInRangeTitle",
      message: "emptyState.noEventsInRangeMessage",
      icon: "calendar-search"
    },
    "read-failed": {
      title: "emptyState.readFailedTitle",
      message: "emptyState.readFailedMessage",
      icon: "triangle-alert"
    },
    "empty-group": {
      title: "emptyState.emptyGroupTitle",
      message: "emptyState.emptyGroupMessage",
      icon: "folder-open"
    }
  };
  var EmptyStateRenderer = class {
    renderCard(container, options) {
      const copy = EMPTY_STATE_COPY[options.reason];
      const classes = ["db-empty", "db-empty-card", options.compact ? "is-compact" : "", options.className || ""].filter(Boolean).join(" ");
      const card = container.createDiv({ cls: classes, attr: { "data-empty-reason": options.reason } });
      const icon = card.createDiv({ cls: "db-empty-card-icon", attr: { "aria-hidden": "true" } });
      setIcon(icon, options.icon || copy.icon);
      const content = card.createDiv({ cls: "db-empty-card-content" });
      content.createEl("h3", {
        cls: "db-empty-card-title",
        text: options.title || t(copy.title)
      });
      content.createDiv({
        cls: "db-empty-card-message",
        text: options.message || t(copy.message)
      });
      if (options.diagnostics) {
        content.createSpan({ cls: "db-empty-card-diagnostics", text: options.diagnostics });
      }
      if (options.actions && options.actions.length > 0) {
        const actionGroup = content.createDiv({ cls: "db-empty-action-group" });
        for (const action of options.actions) {
          const button = actionGroup.createEl("button", {
            cls: ["db-empty-action", action.primary ? "mod-cta" : "", action.cls || ""].filter(Boolean).join(" "),
            attr: { type: "button", "aria-label": action.label }
          });
          if (action.icon) setIcon(button.createSpan({ cls: "db-empty-action-icon", attr: { "aria-hidden": "true" } }), action.icon);
          button.createSpan({ text: action.label });
          button.onclick = () => {
            void action.onClick();
          };
        }
      }
      return card;
    }
    renderHero(container, options) {
      const hero = container.createDiv({ cls: "db-empty-hero", attr: { "data-empty-reason": "no-database" } });
      const icon = hero.createDiv({ cls: "db-empty-hero-icon", attr: { "aria-hidden": "true" } });
      setIcon(icon, "database");
      const content = hero.createDiv({ cls: "db-empty-hero-content" });
      content.createEl("h2", { cls: "db-empty-hero-title", text: options.title });
      content.createDiv({ cls: "db-empty-hero-description", text: options.desc });
      const actions = content.createDiv({ cls: "db-empty-action-group" });
      const create = actions.createEl("button", {
        cls: "db-empty-action mod-cta",
        attr: { type: "button", "aria-label": t("emptyState.createDatabase") }
      });
      setIcon(create.createSpan({ cls: "db-empty-action-icon", attr: { "aria-hidden": "true" } }), "plus");
      create.createSpan({ text: t("emptyState.createDatabase") });
      create.onclick = () => {
        void options.onCreateDb();
      };
      const presets = hero.createDiv({ cls: "db-empty-presets", attr: { "aria-label": t("emptyState.starterPresets") } });
      presets.createDiv({ cls: "db-empty-presets-title", text: t("emptyState.starterPresets") });
      const presetGrid = presets.createDiv({ cls: "db-empty-preset-grid" });
      for (const preset of STARTER_PRESETS) {
        const card = presetGrid.createEl("button", {
          cls: "db-empty-preset-card",
          attr: { type: "button" }
        });
        const presetIcon = card.createDiv({ cls: "db-empty-preset-icon", attr: { "aria-hidden": "true" } });
        setIcon(presetIcon, preset.icon);
        card.createEl("strong", { cls: "db-empty-preset-title", text: preset.name });
        card.createSpan({ cls: "db-empty-preset-description", text: preset.description });
        card.onclick = () => {
          void options.onSelectPreset(preset);
        };
      }
      return hero;
    }
    renderTableRow(tbody, colSpan, options) {
      const row = tbody.createEl("tr", { cls: "db-empty-table-row" });
      const cell = row.createEl("td", { attr: { colspan: String(Math.max(1, colSpan)) } });
      this.renderCard(cell, { ...options, compact: true });
      return row;
    }
  };

  // src/data/range-selection.ts
  function getSelectionState(orderedIds, selectedIds) {
    const selectedCount = orderedIds.reduce((count, id) => count + (selectedIds.has(id) ? 1 : 0), 0);
    return {
      checked: orderedIds.length > 0 && selectedCount === orderedIds.length,
      indeterminate: selectedCount > 0 && selectedCount < orderedIds.length
    };
  }

  // src/data/chart-aggregation.ts
  function toChartNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  // src/data/euro-format.ts
  var nlNumber = new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  });
  var nlNumber2 = new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  var nlEuro = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  function formatEuroNumber2(value) {
    return Number.isFinite(value) ? nlNumber2.format(value) : "-";
  }

  // src/data/file-fields.ts
  var BASE_FILE_FIELD_KEYS = /* @__PURE__ */ new Set([
    "file.file",
    "file.name",
    "file.basename",
    "file.path",
    "file.folder",
    "file.ext",
    "file.extension",
    "file.ctime",
    "file.created",
    "file.mtime",
    "file.modified",
    "file.size",
    "file.tags",
    "file.links",
    "file.backlinks",
    "file.embeds",
    "file.properties"
  ]);
  function isBaseFileField(key) {
    return BASE_FILE_FIELD_KEYS.has(key);
  }
  function getFileFieldValue(file, key, frontmatter, cache, app) {
    if (key === "file.name") return file.name;
    if (key === "file.file") return file.path;
    if (key === "file.basename") return file.basename || file.name.replace(/\.md$/i, "");
    if (key === "file.path") return file.path;
    if (key === "file.folder") return file.parent?.path || "";
    if (key === "file.ext" || key === "file.extension") return file.extension;
    if (key === "file.ctime" || key === "file.created") return file.stat.ctime;
    if (key === "file.mtime" || key === "file.modified") return file.stat.mtime;
    if (key === "file.size") return file.stat.size;
    if (key === "file.tags") {
      return toValidObsidianTagValues([
        ...toValidObsidianTagValues(frontmatter?.["tags"]),
        ...cache ? getAllTags(cache) || [] : []
      ]);
    }
    if (key === "file.links") return getFileLinks(cache);
    if (key === "file.embeds") return getFileEmbeds(cache);
    if (key === "file.backlinks") return getFileBacklinks(app, file);
    if (key === "file.properties") return frontmatter || {};
    return void 0;
  }
  function getRowFileFieldValue(row, key) {
    return getFileFieldValue(row.file, key, row.frontmatter, row.cache, row.app);
  }
  function getFileLinks(cache) {
    const links = [
      ...(cache?.links || []).map((link) => link.link),
      ...Object.values(cache?.frontmatterLinks || {}).map((link) => link.link)
    ];
    return Array.from(new Set(links.filter(Boolean)));
  }
  function getFileEmbeds(cache) {
    return Array.from(new Set((cache?.embeds || []).map((link) => link.link).filter(Boolean)));
  }
  function getFileBacklinks(app, file) {
    const resolvedLinks = app?.metadataCache.resolvedLinks;
    if (!resolvedLinks) return [];
    return Object.entries(resolvedLinks).filter(([_source, targets]) => targets && Object.prototype.hasOwnProperty.call(targets, file.path)).map(([source]) => source).sort();
  }

  // src/data/keyboard-utils.ts
  function isImeComposing(event) {
    return event.isComposing;
  }

  // src/views/overlay-stack.ts
  var nextOverlayId = 0;
  var OverlayStack = class {
    constructor() {
      this.surfaces = [];
      this.listeners = /* @__PURE__ */ new WeakMap();
    }
    register(options) {
      const doc = options.panel.ownerDocument;
      const id = options.id || `db-overlay-${++nextOverlayId}`;
      this.unregister(id, false);
      const surface = {
        id,
        panel: options.panel,
        anchor: options.anchor,
        parentId: options.parentId,
        close: options.close,
        closeOnOutsidePointerDown: options.closeOnOutsidePointerDown !== false,
        closeOnEscape: options.closeOnEscape !== false
      };
      this.surfaces.push(surface);
      this.ensureDocumentListeners(doc);
      return {
        id,
        unregister: () => this.unregister(id)
      };
    }
    unregister(id, restoreFocus = true) {
      const index = this.surfaces.findIndex((surface2) => surface2.id === id);
      if (index < 0) return false;
      const [surface] = this.surfaces.splice(index, 1);
      if (restoreFocus) this.restoreFocus(surface);
      this.removeDocumentListenersIfIdle(surface.panel.ownerDocument);
      return true;
    }
    dismissTop(reason = "programmatic") {
      const surface = this.getTopSurface();
      if (!surface) return false;
      this.removeSurface(surface, false);
      surface.close(reason);
      if (reason !== "action") this.restoreFocus(surface);
      return true;
    }
    dismissPanel(panel, reason = "programmatic") {
      const surface = this.surfaces.find((candidate) => candidate.panel === panel);
      if (!surface) return false;
      this.removeSurface(surface, false);
      surface.close(reason);
      if (reason !== "action") this.restoreFocus(surface);
      return true;
    }
    getTopSurface() {
      return this.surfaces[this.surfaces.length - 1];
    }
    isTopSurface(panel) {
      return this.getTopSurface()?.panel === panel;
    }
    size() {
      return this.surfaces.length;
    }
    clear() {
      while (this.dismissTop("programmatic")) {
      }
    }
    ensureDocumentListeners(doc) {
      if (this.listeners.has(doc)) return;
      const keydown = (event) => {
        if (event.key === "Escape") this.handleEscape(doc, event);
      };
      const pointerdown = (event) => this.handlePointerDown(doc, event);
      doc.addEventListener("keydown", keydown, true);
      doc.addEventListener("pointerdown", pointerdown, true);
      this.listeners.set(doc, { keydown, pointerdown });
    }
    handleEscape(doc, event) {
      const surface = this.getTopSurfaceForDocument(doc);
      if (!surface?.closeOnEscape) return;
      event.preventDefault();
      event.stopPropagation();
      this.dismissSurface(surface, "escape");
    }
    handlePointerDown(doc, event) {
      const surface = this.getTopSurfaceForDocument(doc);
      if (!surface?.closeOnOutsidePointerDown) return;
      const target = event.target;
      const NodeConstructor = doc.defaultView?.Node;
      const isNode = typeof NodeConstructor === "function" && target instanceof NodeConstructor;
      if (isNode && (surface.panel.contains(target) || surface.anchor?.contains(target))) return;
      this.dismissSurface(surface, "outside-pointerdown");
    }
    getTopSurfaceForDocument(doc) {
      for (let index = this.surfaces.length - 1; index >= 0; index -= 1) {
        const surface = this.surfaces[index];
        if (surface.panel.ownerDocument === doc) return surface;
      }
      return void 0;
    }
    dismissSurface(surface, reason) {
      this.removeSurface(surface, false);
      surface.close(reason);
      if (reason !== "action") this.restoreFocus(surface);
    }
    removeSurface(surface, restoreFocus) {
      const index = this.surfaces.indexOf(surface);
      if (index < 0) return;
      this.surfaces.splice(index, 1);
      if (restoreFocus) this.restoreFocus(surface);
      this.removeDocumentListenersIfIdle(surface.panel.ownerDocument);
    }
    restoreFocus(surface) {
      if (!surface.anchor?.isConnected || typeof surface.anchor.focus !== "function") return;
      surface.anchor.focus({ preventScroll: true });
    }
    removeDocumentListenersIfIdle(doc) {
      if (this.surfaces.some((surface) => surface.panel.ownerDocument === doc)) return;
      const listeners = this.listeners.get(doc);
      if (!listeners) return;
      doc.removeEventListener("keydown", listeners.keydown, true);
      doc.removeEventListener("pointerdown", listeners.pointerdown, true);
      this.listeners.delete(doc);
    }
  };
  var overlayStack = new OverlayStack();

  // src/views/popover-auto-close.ts
  function installPopoverAutoClose(options) {
    void options.delayMs;
    void options.isActiveTarget;
    const registration = overlayStack.register({
      panel: options.panel,
      anchor: options.anchorEl,
      parentId: options.parentId,
      close: options.close,
      closeOnOutsidePointerDown: options.closeOnOutsidePointerDown,
      closeOnEscape: options.closeOnEscape
    });
    let cleaned = false;
    return () => {
      if (cleaned) return;
      cleaned = true;
      registration.unregister();
    };
  }

  // src/views/dom-guards.ts
  function hasInstanceOf(value) {
    return typeof Node !== "undefined" && value instanceof Node || typeof value === "object" && value !== null && "instanceOf" in value;
  }
  function isHTMLElement(value) {
    return hasInstanceOf(value) && value.instanceOf(HTMLElement);
  }

  // src/views/mobile-bottom-sheet.ts
  function applySheetChrome(panel, isSheet) {
    panel.toggleClass("db-mobile-bottom-sheet", isSheet);
    const existingHandle = panel.querySelector(".db-mobile-bottom-sheet-handle");
    if (isSheet && !existingHandle) {
      const handle = panel.ownerDocument.createElement("div");
      handle.className = "db-mobile-bottom-sheet-handle";
      handle.setAttribute("aria-hidden", "true");
      panel.prepend(handle);
      return;
    }
    if (!isSheet) existingHandle?.remove();
  }

  // src/views/popover-position.ts
  var positionCleanups = /* @__PURE__ */ new WeakMap();
  function positionToolbarPopover(panel, anchorEl, options = {}) {
    if (!anchorEl?.isConnected) return;
    const margin = options.margin ?? 12;
    const gap = options.gap ?? 6;
    const minWidth = options.minWidth ?? 160;
    const preferredWidth = options.preferredWidth ?? 520;
    const maxPreferredWidth = options.maxWidth ?? preferredWidth;
    const ownerDocument = panel.ownerDocument;
    const view = ownerDocument.defaultView || window;
    const mobileSheet = isMobileBottomSheet(ownerDocument);
    positionCleanups.get(panel)?.();
    panel.addClass("db-anchored-popover");
    applySheetChrome(panel, mobileSheet);
    if (!panel.hasClass("is-visible")) {
      panel.addClass("db-overlay-enter");
      view.requestAnimationFrame(() => {
        if (panel.isConnected) panel.addClass("is-visible");
      });
    }
    panel.setCssProps({
      position: "fixed",
      right: "auto",
      bottom: "auto",
      boxSizing: "border-box",
      overflowY: "auto",
      overscrollBehavior: "contain"
    });
    const place = () => {
      if (!panel.isConnected || !anchorEl.isConnected) return;
      const savedPanelScroll = panel.scrollTop;
      const bounds = getVisiblePopoverBounds(null);
      const anchorRect = anchorEl.getBoundingClientRect();
      const maxWidth = Math.max(minWidth, Math.min(maxPreferredWidth, bounds.width - margin * 2));
      const width = Math.min(preferredWidth, maxWidth);
      panel.setCssProps({
        width: `${width}px`,
        maxWidth: `${maxWidth}px`,
        maxHeight: ""
      });
      if (mobileSheet) {
        panel.style.setProperty("--db-mobile-sheet-bottom", `${Math.max(0, view.innerHeight - bounds.bottom)}px`);
        panel.setCssProps({
          left: "0px",
          right: "0px",
          top: "auto",
          bottom: `${Math.max(0, view.innerHeight - bounds.bottom)}px`,
          width: "100%",
          maxWidth: "100%",
          // Cap at 90% of the small viewport. The stylesheet asks for 90svh, but this inline value
          // wins, so the ceiling has to be applied here too or the rule never takes effect. `svh`
          // is the viewport with the browser chrome shown, which is the height a sheet actually gets.
          maxHeight: `${Math.min(Math.max(160, bounds.height - margin * 2), view.innerHeight * 0.9)}px`
        });
        panel.scrollTop = savedPanelScroll;
        return;
      }
      setPosition(panel, bounds.left + margin, bounds.top + margin, void 0, 0, 0);
      const panelRect = panel.getBoundingClientRect();
      const measuredWidth = Math.min(panelRect.width || width, maxWidth);
      const naturalHeight = Math.max(panel.scrollHeight, panelRect.height || 0);
      const belowSpace = Math.max(0, bounds.bottom - anchorRect.bottom - gap - margin);
      const aboveSpace = Math.max(0, anchorRect.top - bounds.top - gap - margin);
      const useAbove = aboveSpace > belowSpace && belowSpace < Math.min(naturalHeight, 240);
      const availableHeight = useAbove ? aboveSpace : belowSpace;
      const anchorLeft = resolvePopoverHorizontalLeft(
        anchorRect,
        bounds,
        measuredWidth,
        gap,
        margin,
        options.align ?? "right",
        options.preferredSide
      );
      if (availableHeight <= 0) {
        const fallbackHeight = Math.max(0, bounds.height - margin * 2);
        setPosition(
          panel,
          anchorLeft,
          bounds.top + margin,
          void 0,
          0,
          0
        );
        panel.style.maxHeight = `${fallbackHeight}px`;
        panel.scrollTop = savedPanelScroll;
        return;
      }
      const renderedHeight = Math.min(naturalHeight, availableHeight);
      const top = useAbove ? anchorRect.top - gap - renderedHeight : anchorRect.bottom + gap;
      setPosition(
        panel,
        anchorLeft,
        clamp(top, bounds.top + margin, bounds.bottom - renderedHeight - margin),
        void 0,
        0,
        0
      );
      panel.style.maxHeight = `${availableHeight}px`;
      panel.scrollTop = savedPanelScroll;
    };
    place();
    view.requestAnimationFrame(place);
    let frame;
    const schedule = () => {
      if (!panel.isConnected) {
        cleanup();
        return;
      }
      if (frame !== void 0) return;
      frame = view.requestAnimationFrame(() => {
        frame = void 0;
        place();
      });
    };
    const visualViewport = view.visualViewport;
    const cleanup = () => {
      if (frame !== void 0) view.cancelAnimationFrame(frame);
      view.removeEventListener("resize", schedule);
      ownerDocument.removeEventListener("scroll", schedule, true);
      visualViewport?.removeEventListener("resize", schedule);
      visualViewport?.removeEventListener("scroll", schedule);
      if (positionCleanups.get(panel) === cleanup) positionCleanups.delete(panel);
    };
    view.addEventListener("resize", schedule);
    ownerDocument.addEventListener("scroll", schedule, true);
    visualViewport?.addEventListener("resize", schedule);
    visualViewport?.addEventListener("scroll", schedule);
    positionCleanups.set(panel, cleanup);
  }
  function resolvePopoverHorizontalLeft(anchor, bounds, width, gap, margin, align = "right", preferredSide) {
    const minLeft = bounds.left + margin;
    const maxLeft = Math.max(minLeft, bounds.right - width - margin);
    const aligned = align === "left" ? anchor.left : align === "center" ? anchor.left + anchor.width / 2 - width / 2 : anchor.right - width;
    if (preferredSide === "right") {
      const right = anchor.right + gap;
      if (right <= maxLeft) return right;
      const left = anchor.left - gap - width;
      if (left >= minLeft) return left;
    } else if (preferredSide === "left") {
      const left = anchor.left - gap - width;
      if (left >= minLeft) return left;
      const right = anchor.right + gap;
      if (right <= maxLeft) return right;
    } else {
      const alignedFits = aligned >= minLeft && aligned <= maxLeft;
      if (alignedFits) return aligned;
      const right = anchor.right + gap;
      if (right <= maxLeft) return right;
      const left = anchor.left - gap - width;
      if (left >= minLeft) return left;
    }
    return clamp(aligned, minLeft, maxLeft);
  }
  function setPosition(panel, globalLeft, globalTop, containerRect, scrollLeft, scrollTop) {
    if (!containerRect) {
      panel.setCssProps({ left: `${globalLeft}px`, top: `${globalTop}px` });
      return;
    }
    panel.setCssProps({
      left: `${globalLeft - containerRect.left + scrollLeft}px`,
      top: `${globalTop - containerRect.top + scrollTop}px`
    });
  }
  function getVisiblePopoverBounds(container) {
    const doc = container?.ownerDocument || window.activeDocument;
    const view = doc.defaultView || window;
    const viewport = getVisualViewportBounds(view);
    const app = doc.querySelector(".workspace-split.mod-root") || doc.querySelector(".app-container") || doc.querySelector(".workspace");
    const appRect = isHTMLElement(app) ? app.getBoundingClientRect() : viewport;
    const containerRect = container?.getBoundingClientRect() || viewport;
    const left = Math.max(viewport.left, appRect.left, containerRect.left);
    const top = Math.max(viewport.top, appRect.top, containerRect.top);
    const right = Math.min(viewport.right, appRect.right, containerRect.right);
    let bottom = Math.min(viewport.bottom, appRect.bottom, containerRect.bottom);
    if (doc.body.classList.contains("is-phone")) {
      const navbar = doc.querySelector(".mobile-navbar");
      const navbarHeight = isHTMLElement(navbar) ? navbar.getBoundingClientRect().height : 50;
      const safeBottom = parseFloat(getComputedStyle(doc.body).getPropertyValue("--safe-area-inset-bottom") || "0");
      bottom = Math.min(bottom, viewport.bottom - navbarHeight - safeBottom);
    }
    if (right <= left || bottom <= top) return viewport;
    return new DOMRect(left, top, right - left, bottom - top);
  }
  function isMobileBottomSheet(doc) {
    if (doc.body.classList.contains("is-phone")) return true;
    const view = doc.defaultView;
    const touchPoints = typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
    const coarsePointer = Boolean(view?.matchMedia?.("(pointer: coarse)").matches);
    return Boolean(view && view.innerWidth <= 600 && (touchPoints > 0 || coarsePointer));
  }
  function getVisualViewportBounds(view) {
    const visual = view.visualViewport;
    if (!visual) return new DOMRect(0, 0, view.innerWidth, view.innerHeight);
    return new DOMRect(visual.offsetLeft, visual.offsetTop, visual.width, visual.height);
  }
  function clamp(value, min2, max2) {
    if (max2 < min2) return min2;
    return Math.min(Math.max(value, min2), max2);
  }

  // src/views/dropdown-field.ts
  var nextDropdownId = 0;
  function openDropdownMenu(options) {
    const doc = options.anchor.ownerDocument;
    const valueEl = doc.createElement("span");
    let closed = false;
    let cleanup;
    const close = () => {
      if (closed) return;
      closed = true;
      cleanup?.();
      cleanup = void 0;
      options.onClose?.();
    };
    cleanup = openDropdownPopover(options.anchor, {
      parent: options.anchor,
      label: options.label,
      options: options.options,
      value: options.value,
      onChange: (value) => options.onChange(value),
      popoverClassName: options.popoverClassName,
      searchable: options.searchable,
      searchPlaceholder: options.searchPlaceholder,
      closeOnSelect: options.closeOnSelect,
      renderIcon: options.renderIcon ? (parent, icon) => options.renderIcon?.(parent, icon) : void 0
    }, valueEl, close);
    return close;
  }
  function openDropdownPopover(anchor, options, valueEl, close) {
    const contextClass = getDropdownPopoverContextClass(anchor);
    const host = getDropdownPopoverHost(anchor);
    const searchable = options.searchable === true && options.options.length > 8;
    const panel = host.createDiv({ cls: `db-dropdown-popover ${contextClass}${searchable ? " is-searchable" : ""}${options.popoverClassName ? ` ${options.popoverClassName}` : ""}` });
    const popupId = `db-dropdown-${++nextDropdownId}`;
    panel.setAttr("id", popupId);
    panel.setAttr("role", "listbox");
    panel.setAttr("aria-label", options.label);
    anchor.setAttr("aria-controls", popupId);
    let searchInput;
    if (searchable) {
      const searchWrap = panel.createDiv({ cls: "db-dropdown-search" });
      searchInput = searchWrap.createEl("input", {
        attr: {
          type: "search",
          placeholder: options.searchPlaceholder || options.label,
          "aria-label": options.label,
          "aria-controls": popupId,
          "aria-autocomplete": "list"
        }
      });
    }
    const optionsHost = searchable ? panel.createDiv({ cls: "db-dropdown-options" }) : panel;
    let currentSection = "";
    let currentSectionEl;
    const sectionRows = [];
    const emptyRow = optionsHost.createDiv({ cls: "db-dropdown-empty", text: t("dropdown.noResults"), attr: { role: "status", hidden: "true" } });
    let activeIndex = options.options.findIndex((option) => option.value === options.value && !option.disabled);
    if (activeIndex < 0) {
      activeIndex = options.options.findIndex((option) => !option.disabled);
    }
    if (activeIndex < 0) activeIndex = 0;
    let typeahead = "";
    let typeaheadTimer;
    const getVisibleRows = () => sectionRows.filter((item) => !item.row.hasClass("is-hidden") && !item.option.disabled);
    const syncActiveOption = (focus = false) => {
      const visibleRows = getVisibleRows();
      if (!visibleRows.length) {
        activeIndex = -1;
        return;
      }
      const active = sectionRows[activeIndex];
      if (!active || active.option.disabled || active.row.hasClass("is-hidden")) {
        activeIndex = sectionRows.indexOf(visibleRows[0]);
      }
      for (const item of sectionRows) item.row.setAttr("tabindex", item === sectionRows[activeIndex] ? "0" : "-1");
      const row = sectionRows[activeIndex]?.row;
      if (focus && row) {
        row.focus();
        row.scrollIntoView?.({ block: "nearest" });
      }
    };
    const selectRow = (item) => {
      if (item.row.disabled || item.option.disabled) return;
      activeIndex = sectionRows.findIndex((candidate) => candidate.row === item.row);
      syncActiveOption();
      if (!item.option.preserveValueOnSelect) {
        syncDropdownSelection(sectionRows, item.value);
        valueEl.setText(item.option.text);
      }
      options.onChange(item.value);
      if (options.closeOnSelect !== false) close();
    };
    for (const option of options.options) {
      if (option.section && option.section !== currentSection) {
        currentSection = option.section;
        currentSectionEl = optionsHost.createDiv({ cls: "db-dropdown-section-title", text: option.section });
      }
      const row = optionsHost.createEl("button", {
        cls: `db-dropdown-option db-menu-item${option.icon ? " has-icon" : ""}${option.swatches?.length ? " has-swatches" : ""}${option.value === options.value ? " is-selected" : ""}${option.disabled ? " is-disabled" : ""}`,
        attr: { type: "button", role: "option", "aria-selected": option.value === options.value ? "true" : "false", tabindex: "-1" }
      });
      row.setAttr("data-value", option.value);
      row.setAttr("data-search-text", `${option.text} ${option.value} ${option.disabledReason || ""}`.toLowerCase());
      if (option.disabled && option.disabledReason) {
        row.setAttr("aria-disabled", "true");
      } else {
        row.disabled = option.disabled === true;
      }
      if (option.disabledReason) {
        row.setAttr("title", option.disabledReason);
        row.setAttr("aria-label", `${option.text}: ${option.disabledReason}`);
      }
      const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
      if (option.value === options.value) setIcon(check, "check");
      if (option.icon) {
        const iconEl = row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon" });
        if (options.renderIcon) options.renderIcon(iconEl, option.icon);
        else setIcon(iconEl, option.icon);
      }
      const text = row.createSpan({ cls: "db-dropdown-option-text db-menu-item-label" });
      text.createSpan({ cls: "db-dropdown-option-label", text: option.text });
      if (option.swatches?.length) {
        const swatches = row.createSpan({ cls: "db-dropdown-option-swatches", attr: { "aria-hidden": "true" } });
        for (const color of option.swatches.slice(0, 5)) {
          swatches.createSpan({ cls: "db-dropdown-option-swatch", attr: { style: `background-color: ${color}` } });
        }
      }
      const rowData = { section: currentSectionEl, row, value: option.value, option };
      row.onclick = () => selectRow(rowData);
      sectionRows.push(rowData);
    }
    syncActiveOption();
    if (searchInput) {
      searchInput.oninput = () => {
        const visibleRows = filterDropdownOptions(sectionRows, searchInput?.value || "", emptyRow);
        activeIndex = visibleRows.length ? sectionRows.indexOf(visibleRows[0]) : -1;
        syncActiveOption();
      };
      searchInput.onkeydown = (event) => {
        if (isImeComposing(event)) return;
        const visibleRows = getVisibleRows();
        if (event.key === "ArrowDown") {
          if (!visibleRows.length) return;
          event.preventDefault();
          syncActiveOption(true);
        } else if (event.key === "ArrowUp") {
          if (!visibleRows.length) return;
          event.preventDefault();
          activeIndex = sectionRows.indexOf(visibleRows[visibleRows.length - 1]);
          syncActiveOption(true);
        } else if (event.key === "Enter") {
          if (!visibleRows.length) return;
          event.preventDefault();
          selectRow(visibleRows[0]);
        }
      };
      window.setTimeout(() => searchInput?.focus(), 0);
    }
    positionToolbarPopover(panel, anchor, { preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6 });
    if (!searchInput) {
      syncActiveOption(true);
    }
    const onKeydown = (event) => {
      if (isImeComposing(event) || event.target === searchInput) return;
      const target = event.target;
      const currentRowIndex = target ? sectionRows.findIndex((item) => item.row === target) : -1;
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key) && event.key.length !== 1) return;
      const visibleRows = getVisibleRows();
      if (!visibleRows.length) return;
      if (currentRowIndex >= 0) activeIndex = currentRowIndex;
      const visibleIndex = visibleRows.findIndex((item) => sectionRows.indexOf(item) === activeIndex);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = Math.max(0, Math.min(visibleRows.length - 1, (visibleIndex < 0 ? 0 : visibleIndex) + delta));
        activeIndex = sectionRows.indexOf(visibleRows[next]);
        syncActiveOption(true);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        activeIndex = sectionRows.indexOf(event.key === "Home" ? visibleRows[0] : visibleRows[visibleRows.length - 1]);
        syncActiveOption(true);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const activeRow = sectionRows[activeIndex];
        if (activeRow) selectRow(activeRow);
      } else if (/^\S$/u.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        typeahead += event.key.toLowerCase();
        if (typeaheadTimer !== void 0) window.clearTimeout(typeaheadTimer);
        typeaheadTimer = window.setTimeout(() => {
          typeahead = "";
          typeaheadTimer = void 0;
        }, 500);
        const match = visibleRows.find((item) => item.option.text.toLowerCase().startsWith(typeahead));
        if (match) {
          event.preventDefault();
          activeIndex = sectionRows.indexOf(match);
          syncActiveOption(true);
        }
      }
    };
    panel.addEventListener("keydown", onKeydown);
    const removeAutoClose = installPopoverAutoClose({ panel, anchorEl: anchor, close });
    return () => {
      panel.removeEventListener("keydown", onKeydown);
      if (typeaheadTimer !== void 0) window.clearTimeout(typeaheadTimer);
      removeAutoClose();
      anchor.removeAttribute("aria-controls");
      panel.remove();
    };
  }
  function getDropdownPopoverHost(anchor) {
    if (anchor.closest(".note-database-settings, .note-database-modal")) return anchor.ownerDocument.body;
    const container = anchor.closest(".note-database-container");
    if (container instanceof HTMLElement) return container;
    return anchor.parentElement || anchor;
  }
  function getDropdownPopoverContextClass(anchor) {
    if (anchor.closest(".note-database-settings")) return "db-dropdown-popover-context-settings";
    if (anchor.closest(".note-database-modal")) return "db-dropdown-popover-context-modal";
    return "db-dropdown-popover-context-container";
  }
  function syncDropdownSelection(rows, value) {
    for (const item of rows) {
      const selected = item.value === value;
      item.row.toggleClass("is-selected", selected);
      item.row.setAttr("aria-selected", selected ? "true" : "false");
      const check = item.row.querySelector(".db-dropdown-option-check");
      check?.replaceChildren();
      if (selected && check) setIcon(check, "check");
    }
  }
  function filterDropdownOptions(rows, query, emptyRow) {
    const normalized = query.trim().toLowerCase();
    const visibleRows = [];
    for (const item of rows) {
      const matches = !normalized || (item.row.getAttribute("data-search-text") || "").includes(normalized);
      item.row.toggleClass("is-hidden", !matches);
      if (matches && !item.row.disabled) visibleRows.push(item);
    }
    const sections = Array.from(new Set(rows.map((item) => item.section).filter((item) => item != null)));
    for (const section of sections) {
      const hasVisibleRow = rows.some((item) => item.section === section && !item.row.hasClass("is-hidden"));
      section.toggleClass("is-hidden", !hasVisibleRow);
    }
    if (emptyRow) emptyRow.toggleAttribute("hidden", visibleRows.length > 0);
    return visibleRows;
  }

  // src/views/table-footer-renderer.ts
  function calculateTableAggregate(values, summaryName) {
    const nonEmpty = values.filter((value) => !isEmpty(value));
    const numbers = nonEmpty.map((value) => toChartNumber(value)).filter((value) => value != null);
    const dates = nonEmpty.map((value) => toDateTimestamp(value)).filter((value) => value != null);
    const booleans = nonEmpty.filter((value) => typeof value === "boolean");
    const kind = normalizeCalculationKind(summaryName);
    switch (kind) {
      case "SUM":
        return numbers.length ? sum(numbers) : null;
      case "AVERAGE":
        return numbers.length ? sum(numbers) / numbers.length : null;
      case "MEDIAN":
        return median(numbers);
      case "MIN":
        return min(numbers);
      case "MAX":
        return max(numbers);
      case "RANGE": {
        const numericRange = range(numbers);
        return numericRange ?? (dates.length > 1 ? Math.max(...dates) - Math.min(...dates) : null);
      }
      case "STDDEV":
        return numbers.length ? standardDeviation(numbers) : null;
      case "COUNT":
      case "FILLED":
        return nonEmpty.length;
      case "UNIQUE":
        return new Set(nonEmpty.map((value) => JSON.stringify(value))).size;
      case "EMPTY":
        return values.filter(isEmpty).length;
      case "CHECKED":
        return booleans.filter(Boolean).length;
      case "UNCHECKED":
        return booleans.filter((value) => !value).length;
      case "EARLIEST":
        return earliest(dates);
      case "LATEST":
        return latest(dates);
      default:
        return null;
    }
  }
  function normalizeCalculationKind(summaryName) {
    const compact = summaryName.trim().toUpperCase().replace(/[\s_-]+/g, "");
    switch (compact) {
      case "SUM":
        return "SUM";
      case "AVG":
      case "AVERAGE":
      case "MEAN":
        return "AVERAGE";
      case "MEDIAN":
        return "MEDIAN";
      case "MIN":
        return "MIN";
      case "MAX":
        return "MAX";
      case "RANGE":
        return "RANGE";
      case "STDDEV":
      case "STDEV":
      case "STANDARDDEVIATION":
        return "STDDEV";
      case "COUNT":
      case "COUNTFILLED":
      case "COUNTNONEMPTY":
        return "COUNT";
      case "FILLED":
        return "FILLED";
      case "UNIQUE":
      case "COUNTUNIQUE":
        return "UNIQUE";
      case "EMPTY":
      case "COUNTEMPTY":
        return "EMPTY";
      case "CHECKED":
        return "CHECKED";
      case "UNCHECKED":
        return "UNCHECKED";
      case "EARLIEST":
        return "EARLIEST";
      case "LATEST":
        return "LATEST";
      default:
        return null;
    }
  }
  function getCalculationKindsForColumn(config, column) {
    const computedType = column.type === "computed" ? config.schema.computedFields.find((field) => field.key === (column.computedKey || column.key))?.type : void 0;
    const type = computedType || column.type;
    const common = ["COUNT", "UNIQUE", "EMPTY", "FILLED"];
    if (type === "number" || type === "currency") return ["SUM", "AVERAGE", "MEDIAN", "MIN", "MAX", "RANGE", "STDDEV", ...common];
    if (column.type === "rollup" && isNumericRollupKind(column.rollupConfig?.aggregation ?? "")) {
      return ["SUM", "AVERAGE", "MEDIAN", "MIN", "MAX", "RANGE", "STDDEV", ...common];
    }
    if (isDateLikeColumnType(type)) return ["EARLIEST", "LATEST", "RANGE", ...common];
    if (type === "checkbox") return ["CHECKED", "UNCHECKED", ...common];
    return common;
  }
  var TableFooterRenderer = class {
    renderFooter(table, config, columns, rows, options) {
      table.querySelector(":scope > tfoot")?.remove();
      const footer = table.createEl("tfoot", { cls: "db-table-footer" });
      const footerRow = footer.createEl("tr", { cls: "db-table-footer-row" });
      if (!options.isReadOnly) footerRow.createEl("td", { cls: "db-table-footer-utility" });
      if (options.hasRecordIcon) footerRow.createEl("td", { cls: "db-table-footer-utility" });
      for (const column of columns) {
        const cell = footerRow.createEl("td", {
          cls: "db-table-footer-cell",
          attr: { "data-note-database-column-key": column.key }
        });
        const rules = (config.summaryRules || []).filter((rule) => rule.field === column.key);
        const values = rules.map((rule) => ({ kind: normalizeCalculationKind(rule.summary), rawKind: rule.summary })).map(({ kind, rawKind }) => ({ kind, rawKind, value: calculateTableAggregate(rows.map((row) => getRowValue(row, column)), rawKind) })).filter(({ value }) => value != null && value !== "");
        const trigger = cell.createEl("button", {
          cls: `db-table-footer-trigger${values.length ? " has-calculation" : ""}`,
          attr: { type: "button", "aria-label": t("table.calculateFor", { name: column.label || column.key }) }
        });
        if (values.length > 0) {
          for (const { kind, rawKind, value } of values) {
            const item = trigger.createSpan({ cls: "db-table-footer-value" });
            item.createSpan({ cls: "db-table-footer-kind", text: kind ? getCalculationLabel(kind) : rawKind });
            item.createSpan({ cls: "db-table-footer-result", text: formatCalculationValue(value) });
          }
        } else {
          trigger.createSpan({ cls: "db-table-footer-calculate-hint", text: t("table.calculate") });
        }
        if (options.isReadOnly) {
          trigger.disabled = true;
        } else {
          trigger.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.openCalculationMenu(trigger, config, column, values[0]?.kind || null, options);
          };
        }
      }
      footerRow.createEl("td", { cls: "db-table-footer-add-column" });
      return footer;
    }
    openCalculationMenu(anchor, config, column, current, options) {
      const choices = [
        { value: "", text: t("table.calculation.none") },
        ...getCalculationKindsForColumn(config, column).map((kind) => ({ value: kind, text: getCalculationLabel(kind) }))
      ];
      openDropdownMenu({
        anchor,
        label: t("table.calculation.label", { name: column.label || column.key }),
        value: current || "",
        options: choices,
        popoverClassName: "db-table-calculation-popover",
        onChange: (value) => {
          const kind = normalizeCalculationKind(value);
          if (!kind && value !== "") return;
          options.onCalculationChange(column.key, kind);
        }
      });
    }
  };
  function getRowValue(row, column) {
    if (column.type === "computed" || column.type === "rollup") {
      return row.computed[column.type === "computed" ? column.computedKey || column.key : column.key];
    }
    if (isBaseFileField(column.key)) return getRowFileFieldValue(row, column.key);
    return row.frontmatter[column.key];
  }
  function getCalculationLabel(kind) {
    return t(`table.calculation.${kind.toLowerCase()}`);
  }
  function formatCalculationValue(value) {
    if (value instanceof Date) return parseDateTimeParts(value)?.dateKey || value.toISOString().slice(0, 10);
    if (typeof value === "number") return formatEuroNumber2(value);
    return stringifyValue(value);
  }
  function isEmpty(value) {
    return value == null || value === "" || Array.isArray(value) && value.length === 0;
  }
  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }
  function standardDeviation(values) {
    const average = sum(values) / values.length;
    return Math.sqrt(sum(values.map((value) => (value - average) ** 2)) / values.length);
  }

  // src/views/edge-auto-scroller.ts
  var DEFAULT_EDGE_SIZE = 40;
  var DEFAULT_MAX_SPEED = 18;
  var DEFAULT_ACCELERATION = 0.8;
  function clamp2(value, min2, max2) {
    return Math.min(Math.max(value, min2), max2);
  }
  function getAnimationFrame(options) {
    return options.requestAnimationFrame || ((callback) => window.requestAnimationFrame(callback));
  }
  function getCancelAnimationFrame(options) {
    return options.cancelAnimationFrame || ((handle) => window.cancelAnimationFrame(handle));
  }
  function calculateEdgeVelocity(position, start, end, edgeSize = DEFAULT_EDGE_SIZE, maxSpeed = DEFAULT_MAX_SPEED) {
    if (!Number.isFinite(position) || !Number.isFinite(start) || !Number.isFinite(end)) return 0;
    const size = Math.max(1, edgeSize);
    const max2 = Math.max(0, maxSpeed);
    if (position < start + size) {
      return -max2 * Math.pow(clamp2((start + size - position) / size, 0, 1), 2);
    }
    if (position > end - size) {
      return max2 * Math.pow(clamp2((position - (end - size)) / size, 0, 1), 2);
    }
    return 0;
  }
  function getEdgeScrollVelocity(pointerX, pointerY, bounds, options = {}) {
    return {
      x: calculateEdgeVelocity(pointerX, bounds.left, bounds.right, options.edgeSize, options.maxSpeed),
      y: calculateEdgeVelocity(pointerY, bounds.top, bounds.bottom, options.edgeSize, options.maxSpeed)
    };
  }
  var EdgeAutoScroller = class {
    constructor(container, options = {}) {
      this.container = container;
      this.pointer = null;
      this.frameHandle = null;
      this.velocity = { x: 0, y: 0 };
      this.edgeSize = Math.max(1, options.edgeSize ?? DEFAULT_EDGE_SIZE);
      this.maxSpeed = Math.max(0, options.maxSpeed ?? DEFAULT_MAX_SPEED);
      this.acceleration = clamp2(options.acceleration ?? DEFAULT_ACCELERATION, 0.01, 1);
      this.requestFrame = getAnimationFrame(options);
      this.cancelFrame = getCancelAnimationFrame(options);
    }
    updatePointer(clientX, clientY) {
      this.pointer = { x: clientX, y: clientY };
      this.recalculateVelocity();
      if (this.hasVelocity()) this.schedule();
      else this.stopFrame();
    }
    update(event) {
      this.updatePointer(event.clientX, event.clientY);
    }
    stop() {
      this.pointer = null;
      this.velocity = { x: 0, y: 0 };
      this.stopFrame();
    }
    destroy() {
      this.stop();
    }
    isRunning() {
      return this.frameHandle !== null;
    }
    getVelocity() {
      return { ...this.velocity };
    }
    getBounds() {
      const rect = this.container.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    }
    recalculateVelocity() {
      if (!this.pointer) {
        this.velocity = { x: 0, y: 0 };
        return;
      }
      this.velocity = getEdgeScrollVelocity(this.pointer.x, this.pointer.y, this.getBounds(), {
        edgeSize: this.edgeSize,
        maxSpeed: this.maxSpeed
      });
    }
    hasVelocity() {
      return this.velocity.x !== 0 || this.velocity.y !== 0;
    }
    schedule() {
      if (this.frameHandle !== null) return;
      this.frameHandle = this.requestFrame(() => {
        this.frameHandle = null;
        this.scrollFrame();
      });
    }
    scrollFrame() {
      if (!this.pointer) return;
      this.recalculateVelocity();
      if (!this.hasVelocity()) return;
      const horizontalRoom = Math.max(0, this.container.scrollWidth - this.container.clientWidth);
      const verticalRoom = Math.max(0, this.container.scrollHeight - this.container.clientHeight);
      const nextLeft = clamp2(this.container.scrollLeft + this.velocity.x, 0, horizontalRoom);
      const nextTop = clamp2(this.container.scrollTop + this.velocity.y, 0, verticalRoom);
      const moved = nextLeft !== this.container.scrollLeft || nextTop !== this.container.scrollTop;
      this.container.scrollLeft = nextLeft;
      this.container.scrollTop = nextTop;
      if (moved) {
        this.velocity = {
          x: this.velocity.x * (1 + this.acceleration),
          y: this.velocity.y * (1 + this.acceleration)
        };
        this.velocity.x = clamp2(this.velocity.x, -this.maxSpeed, this.maxSpeed);
        this.velocity.y = clamp2(this.velocity.y, -this.maxSpeed, this.maxSpeed);
        this.schedule();
      } else {
        this.stopFrame();
      }
    }
    stopFrame() {
      if (this.frameHandle === null) return;
      this.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  };

  // src/data/touch-environment.ts
  var TOUCH_LAYOUT_MAX_WIDTH = 760;
  function getDefaultWindow() {
    return typeof window === "undefined" ? void 0 : window;
  }
  function getContainerWidth(container) {
    if (!container) return void 0;
    const rectWidth = container.getBoundingClientRect?.().width;
    if (Number.isFinite(rectWidth) && rectWidth > 0) return rectWidth;
    const clientWidth = container.clientWidth;
    return Number.isFinite(clientWidth) && clientWidth > 0 ? clientWidth : void 0;
  }
  function isTouchDevice(container, ownerWindow = getDefaultWindow()) {
    const platformTouch = Boolean(Platform.isMobile || Platform.isTablet);
    const coarsePointer = Boolean(ownerWindow?.matchMedia?.("(pointer: coarse)").matches);
    const width = getContainerWidth(container);
    const narrowContainer = width != null && width <= TOUCH_LAYOUT_MAX_WIDTH;
    return platformTouch || coarsePointer || narrowContainer;
  }

  // src/views/menu-row.ts
  function createMenuRow(parent, options) {
    const row = parent.createEl("button", {
      cls: "db-menu-item",
      attr: { type: "button", role: "menuitem" }
    });
    let iconEl = null;
    if (options.icon) {
      iconEl = row.createSpan({ cls: "db-menu-item-icon" });
      setIcon(iconEl, options.icon);
    }
    const labelEl = row.createSpan({ cls: "db-menu-item-label", text: options.label });
    let valueEl = null;
    if (options.value !== void 0) {
      valueEl = row.createSpan({ cls: "db-menu-item-current", text: options.value });
    }
    if (options.submenu) {
      const chevron = row.createSpan({
        cls: `db-menu-item-chevron${valueEl ? "" : " db-menu-item-current"}`
      });
      setIcon(chevron, "chevron-right");
      row.setAttr("aria-haspopup", "true");
      row.setAttr("aria-expanded", "false");
    }
    if (options.disabled) {
      row.setAttr("disabled", "true");
      row.setAttr("aria-disabled", "true");
      if (options.disabledReason) {
        row.setAttr("title", options.disabledReason);
        row.setAttr("aria-label", `${options.label}: ${options.disabledReason}`);
      }
    }
    row.toggleClass("is-warning", Boolean(options.warning));
    if (options.tooltip) row.setAttr("title", options.tooltip);
    row.toggleClass("is-selected", Boolean(options.selected));
    row.setAttr("aria-checked", options.selected ? "true" : "false");
    if (options.onClick && !options.disabled) {
      row.onclick = (event) => options.onClick?.(event);
    }
    return {
      row,
      iconEl,
      labelEl,
      valueEl,
      setValue(text) {
        const target = valueEl ?? row.createSpan({ cls: "db-menu-item-current" });
        target.setText(text);
        valueEl = target;
      },
      setSelected(selected) {
        row.toggleClass("is-selected", selected);
        row.setAttr("aria-checked", selected ? "true" : "false");
      }
    };
  }
  function createMenuSection(parent, label) {
    return parent.createDiv({ cls: "db-menu-section", text: label });
  }
  function createMenuSeparator(parent) {
    const separator = parent.createDiv({ cls: "db-menu-separator" });
    separator.setAttr("role", "separator");
    return separator;
  }

  // src/views/owned-menu.ts
  function createOwnedMenu(doc, options = {}) {
    const el = doc.body.createDiv({ cls: "db-menu db-owned-menu" });
    el.setAttr("role", "menu");
    el.setAttr("tabindex", "-1");
    let open = true;
    const rows = () => Array.from(el.querySelectorAll(".db-menu-item:not([disabled])"));
    const close = () => {
      if (!open) return;
      open = false;
      doc.removeEventListener("pointerdown", onOutside, true);
      doc.removeEventListener("keydown", onKeydown, true);
      el.remove();
      options.onClose?.();
      options.returnFocus?.focus({ preventScroll: true });
    };
    const onOutside = (event) => {
      if (event.target instanceof Node && el.contains(event.target)) return;
      close();
    };
    const onKeydown = (event) => {
      const items = rows();
      if (items.length === 0) return;
      const active = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
      const index = active ? items.indexOf(active) : -1;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = (index + step + items.length) % items.length;
        items[next].focus({ preventScroll: true });
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        items[event.key === "Home" ? 0 : items.length - 1].focus({ preventScroll: true });
      }
    };
    return {
      el,
      addRow(rowOptions) {
        const handle = createMenuRow(el, {
          ...rowOptions,
          onClick: (event) => {
            rowOptions.onClick?.(event);
            if (!rowOptions.submenu) close();
          }
        });
        return handle.row;
      },
      addSection(label) {
        createMenuSection(el, label);
      },
      addSeparator() {
        createMenuSeparator(el);
      },
      showAt(point) {
        const bounds = getVisiblePopoverBounds(null);
        const rect = el.getBoundingClientRect();
        const left = clamp(point.x, bounds.left + 4, Math.max(bounds.left + 4, bounds.right - rect.width - 4));
        const flipUp = point.y + rect.height > bounds.bottom - 4;
        const top = flipUp ? clamp(point.y - rect.height, bounds.top + 4, bounds.bottom - 4) : clamp(point.y, bounds.top + 4, Math.max(bounds.top + 4, bounds.bottom - rect.height - 4));
        el.setCssProps({ position: "fixed" });
        setPosition(el, left, top, void 0, 0, 0);
        rows()[0]?.focus({ preventScroll: true });
        doc.addEventListener("pointerdown", onOutside, true);
        doc.addEventListener("keydown", onKeydown, true);
      },
      close
    };
  }
  function createOwnedMenuForEvent(event, options = {}) {
    const fromView = event.view?.document ?? null;
    const fromTarget = event.target instanceof Node ? event.target.ownerDocument : null;
    return createOwnedMenu(fromView ?? fromTarget ?? activeDocument, options);
  }

  // src/views/table-renderer.ts
  var ROW_MIME = "application/x-note-database-row";
  var ROW_FROM_GROUP_MIME = "application/x-note-database-row-from-group";
  var TableRenderer = class {
    constructor(actions) {
      this.actions = actions;
      this.rowByPath = /* @__PURE__ */ new Map();
      this.rowDropFeedback = new DragDropFeedbackState();
      this.emptyStateRenderer = new EmptyStateRenderer();
      this.footerRenderer = new TableFooterRenderer();
      this.renderContainer = null;
    }
    renderTable(container, config, rows, emptyState) {
      this.clearTable(container);
      this.renderContainer = container;
      this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
      this.applyDensity(container, config);
      const visibleColumns = this.actions.getVisibleColumns(config, rows);
      const tableWrap = container.createDiv({ cls: "db-table-wrap" });
      const table = tableWrap.createEl("table", { cls: "db-table" });
      table.toggleClass("is-create-entry-hidden", Boolean(this.actions.hideCreateEntry));
      const availableWidth = this.getAvailableTableWidth(tableWrap);
      this.applyTableWidth(table, config, visibleColumns, availableWidth);
      this.renderColgroup(table, config, visibleColumns, availableWidth);
      this.renderHeader(table, config, visibleColumns, rows);
      const tbody = table.ownerDocument.createElement("tbody");
      this.renderRows(tbody, config, rows, visibleColumns);
      if (rows.length === 0) {
        this.emptyStateRenderer.renderTableRow(
          tbody,
          visibleColumns.length + this.getUtilityColumnCount(config),
          emptyState || { reason: "no-matching-data" }
        );
      }
      if (!this.actions.hideCreateEntry) {
        this.renderNewRow(tbody, visibleColumns.length + this.getUtilityColumnCount(config), void 0, rows);
      }
      table.appendChild(tbody);
      this.renderFooter(table, config, visibleColumns, rows);
      this.applyGridSemantics(table, config, visibleColumns, rows);
    }
    renderGroupedTable(containerEl, config, rows, groups, groupField, emptyState) {
      this.clearTable(containerEl);
      this.renderContainer = containerEl;
      this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
      this.applyDensity(containerEl, config);
      const container = containerEl.createDiv({ cls: "db-grouped-table" });
      const visibleColumns = this.actions.getVisibleColumns(config, rows);
      const tableMinWidth = this.getTableMinWidth(config, visibleColumns);
      const tableWrap = container.createDiv({ cls: "db-table-wrap" });
      tableWrap.style.minWidth = `${tableMinWidth}px`;
      const table = tableWrap.createEl("table", { cls: "db-table" });
      table.toggleClass("is-create-entry-hidden", Boolean(this.actions.hideCreateEntry));
      const availableWidth = this.getAvailableTableWidth(tableWrap);
      this.applyTableWidth(table, config, visibleColumns, availableWidth);
      this.renderColgroup(table, config, visibleColumns, availableWidth);
      this.renderHeader(table, config, visibleColumns, rows);
      const tbody = table.ownerDocument.createElement("tbody");
      const renderableGroups = this.getRenderableGroups(config, groups, groupField);
      if (renderableGroups.length === 0) {
        this.emptyStateRenderer.renderTableRow(
          tbody,
          visibleColumns.length + this.getUtilityColumnCount(config),
          emptyState || { reason: "no-matching-data" }
        );
      }
      let actionsRendered = false;
      for (const renderable of renderableGroups) {
        const group = renderable.group;
        const divider = this.renderGroupDividerRow(tbody, config, renderable, visibleColumns.length + this.getUtilityColumnCount(config));
        if (groupField && renderable.depth === 0) this.setupGroupDropTarget(divider, groupField, group.key);
        if (renderable.collapsed || group.children?.length) continue;
        const computedGroup = renderable.groupPath.some((pathGroup) => isComputedGroupField(config, pathGroup.field));
        const defaults = !computedGroup && renderable.groupPath.length > 0 ? this.getGroupDefaults(config, renderable.groupPath) : void 0;
        const rowMoveGroups = renderable.depth === 0 ? groups.filter((candidate) => (candidate.depth ?? 0) === 0) : void 0;
        this.renderRows(
          tbody,
          config,
          renderable.visibleRows,
          visibleColumns,
          groupField,
          group.key,
          rowMoveGroups,
          renderable.groupPath,
          renderable.depth === 0,
          defaults,
          computedGroup
        );
        if (group.rows.length === 0) {
          const groupEmptyOptions = emptyState ? actionsRendered && emptyState.actions ? { ...emptyState, actions: void 0 } : emptyState : { reason: "empty-group" };
          if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0) {
            actionsRendered = true;
          }
          this.emptyStateRenderer.renderTableRow(
            tbody,
            visibleColumns.length + this.getUtilityColumnCount(config),
            groupEmptyOptions
          );
        }
        if (!this.actions.hideCreateEntry) {
          this.renderNewRow(tbody, visibleColumns.length + this.getUtilityColumnCount(config), defaults, group.rows, computedGroup);
        }
        if (groupField) this.renderGroupExpandRow(
          tbody,
          config,
          groupField,
          renderable.collapseKey,
          group.rows.length,
          visibleColumns.length + this.getUtilityColumnCount(config)
        );
      }
      table.appendChild(tbody);
      this.renderFooter(table, config, visibleColumns, rows);
      this.applyGridSemantics(table, config, visibleColumns, rows);
    }
    /**
     * Replace only changed rows in an ungrouped table. The caller must already
     * have rebuilt the row pipeline; this method refuses the patch unless the
     * rendered path order and visible column schema are unchanged.
     */
    patchUngroupedRows(container, config, rows, changedPaths) {
      const table = container.querySelector(":scope > .db-table-wrap > table.db-table");
      const tbody = table?.querySelector(":scope > tbody");
      if (!table || !tbody) return false;
      const renderedRows = Array.from(
        tbody.querySelectorAll(":scope > tr[data-note-database-row-path]")
      );
      const renderedPaths = renderedRows.map((row) => row.getAttribute("data-note-database-row-path") || "");
      const nextPaths = rows.map((row) => row.file.path);
      if (renderedPaths.length !== nextPaths.length || renderedPaths.some((path, index) => path !== nextPaths[index])) {
        return false;
      }
      const visibleColumns = this.actions.getVisibleColumns(config, rows);
      const renderedColumnKeys = Array.from(
        table.querySelectorAll(":scope > thead [data-note-database-column-key]")
      ).map((header) => header.getAttribute("data-note-database-column-key") || "");
      if (renderedColumnKeys.length !== visibleColumns.length || renderedColumnKeys.some((key, index) => key !== visibleColumns[index]?.key)) {
        return false;
      }
      this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
      const interaction = this.actions.captureInteractionSnapshot?.();
      const rowByPath = this.rowByPath;
      for (const oldRow of renderedRows) {
        const path = oldRow.getAttribute("data-note-database-row-path") || "";
        if (!changedPaths.has(path)) continue;
        const row = rowByPath.get(path);
        if (!row) return false;
        const replacement = this.renderRow(tbody, config, row, rows, visibleColumns);
        oldRow.replaceWith(replacement);
      }
      if (interaction) this.actions.restoreInteractionSnapshot?.(interaction);
      this.applyGridSemantics(table, config, visibleColumns, rows);
      return true;
    }
    /**
     * Replace only changed rows in a grouped table. Group headers, counts,
     * collapsed state, visible row order, and column schemas must all still
     * match. Any structural change falls back to the normal full render.
     */
    patchGroupedRows(container, config, rows, groups, groupField, changedPaths) {
      const grouped = container.querySelector(":scope > .db-grouped-table");
      if (!grouped) return false;
      if (config.summaryRules && config.summaryRules.length > 0) return false;
      const visibleColumns = this.actions.getVisibleColumns(config, rows);
      const table = grouped.querySelector(":scope > .db-table-wrap > table.db-table");
      const tbody = table?.querySelector(":scope > tbody");
      const renderedHeaders = tbody ? Array.from(tbody.querySelectorAll(":scope > tr.db-group-divider-row")) : [];
      const renderableGroups = this.getRenderableGroups(config, groups, groupField);
      if (!table || !tbody || renderedHeaders.length !== renderableGroups.length) return false;
      const renderedColumnKeys = Array.from(
        table.querySelectorAll(":scope > thead [data-note-database-column-key]")
      ).map((header) => header.getAttribute("data-note-database-column-key") || "");
      if (renderedColumnKeys.length !== visibleColumns.length || renderedColumnKeys.some((key, index) => key !== visibleColumns[index]?.key)) {
        return false;
      }
      const renderedRowsByGroup = [];
      for (let index = 0; index < renderableGroups.length; index += 1) {
        const renderable = renderableGroups[index];
        const group = renderable.group;
        const header = renderedHeaders[index];
        if (header.getAttribute("data-note-database-group-key") !== group.key) return false;
        if (header.querySelector(".db-group-count")?.textContent !== String(group.count)) return false;
        const collapsed = renderable.collapsed;
        if (header.classList.contains("is-collapsed") !== collapsed) return false;
        const visibleRows = collapsed || group.children?.length ? [] : renderable.visibleRows;
        const renderedRows = Array.from(
          this.rowsBetweenGroupDividers(header, renderedHeaders[index + 1]).filter((rowEl) => rowEl.hasAttribute("data-note-database-row-path"))
        );
        const renderedPaths = renderedRows.map(
          (rowEl) => rowEl.getAttribute("data-note-database-row-path") || ""
        );
        const nextPaths = visibleRows.map((row) => row.file.path);
        if (renderedPaths.length !== nextPaths.length || renderedPaths.some((path, rowIndex) => path !== nextPaths[rowIndex])) {
          return false;
        }
        renderedRowsByGroup.push({ tbody, renderedRows, renderable, visibleRows });
      }
      this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
      const interaction = this.actions.captureInteractionSnapshot?.();
      for (const { tbody: tbody2, renderedRows, renderable, visibleRows } of renderedRowsByGroup) {
        const { group } = renderable;
        for (const oldRow of renderedRows) {
          const path = oldRow.getAttribute("data-note-database-row-path") || "";
          if (!changedPaths.has(path)) continue;
          const row = this.rowByPath.get(path);
          if (!row) return false;
          const replacement = this.renderRow(
            tbody2,
            config,
            row,
            visibleRows,
            visibleColumns,
            groupField,
            group.key,
            groups,
            renderable.groupPath,
            renderable.depth === 0
          );
          oldRow.replaceWith(replacement);
        }
      }
      if (interaction) this.actions.restoreInteractionSnapshot?.(interaction);
      this.applyGridSemantics(table, config, visibleColumns, rows);
      return true;
    }
    rowsBetweenGroupDividers(current, next) {
      const rows = [];
      let sibling = current.nextElementSibling;
      while (sibling && sibling !== next) {
        rows.push(sibling);
        sibling = sibling.nextElementSibling;
      }
      return rows;
    }
    clearTable(container) {
      this.rowDropFeedback.clear();
      container.querySelectorAll(".db-table-wrap, .db-grouped-table, .db-empty").forEach((el) => el.remove());
    }
    renderColgroup(table, config, columns, availableWidth = 0) {
      const colgroup = table.createEl("colgroup");
      const renderedWidths = this.getRenderedColumnWidths(config, columns, availableWidth);
      if (!this.actions.isReadOnly) {
        const selectionCol = colgroup.createEl("col");
        const selectionWidth = this.getSelectionColumnWidth();
        selectionCol.addClass("db-select-colgroup");
        selectionCol.setAttr("width", String(selectionWidth));
        selectionCol.style.width = `${selectionWidth}px`;
      }
      if (this.shouldRenderRecordIcon(config)) {
        const iconCol = colgroup.createEl("col");
        const iconWidth = this.getRecordIconColumnWidth();
        iconCol.addClass("db-record-icon-colgroup");
        iconCol.setAttr("width", String(iconWidth));
        iconCol.style.width = `${iconWidth}px`;
      }
      columns.forEach((col, index) => {
        const colEl = colgroup.createEl("col");
        colEl.setAttr("data-note-database-column-key", col.key);
        const style = getTableColumnStyle(renderedWidths[index], index, columns.length);
        if (style.width) colEl.style.width = style.width;
        if (style.minWidth) colEl.style.minWidth = style.minWidth;
      });
      const addColumn = colgroup.createEl("col", { cls: "db-add-column-colgroup" });
      addColumn.setAttr("width", String(this.getAddColumnWidth()));
      addColumn.style.width = `${this.getAddColumnWidth()}px`;
      addColumn.style.minWidth = `${this.getAddColumnWidth()}px`;
    }
    getTableMinWidth(config, columns) {
      return getTableMinWidth(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)));
    }
    getTableWidth(config, columns, availableWidth = 0) {
      return getTableLayout(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)), availableWidth).tableWidth;
    }
    applyTableWidth(table, config, columns, availableWidth = 0) {
      const width = this.getTableWidth(config, columns, availableWidth);
      table.style.minWidth = `${width}px`;
      table.style.width = `${width}px`;
    }
    getRenderedColumnWidths(config, columns, availableWidth = 0) {
      return getTableLayout(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)), availableWidth).columnWidths;
    }
    getColumnWidth(config, col) {
      return config.columnWidths?.[col.key] || col.width || config.defaultColumnWidth || 150;
    }
    getSelectionColumnWidth() {
      return isTouchDevice(this.renderContainer) ? 48 : 40;
    }
    getRecordIconColumnWidth() {
      return 28;
    }
    shouldRenderRecordIcon(config) {
      return config.showRecordIcon === true && typeof this.actions.renderRecordIcon === "function";
    }
    getUtilityColumnsWidth(config) {
      return (this.actions.isReadOnly ? 0 : this.getSelectionColumnWidth()) + (this.shouldRenderRecordIcon(config) ? this.getRecordIconColumnWidth() : 0) + this.getAddColumnWidth();
    }
    getUtilityColumnCount(config) {
      return (this.actions.isReadOnly ? 0 : 1) + (this.shouldRenderRecordIcon(config) ? 1 : 0) + 1;
    }
    getAddColumnWidth() {
      return 42;
    }
    applyDensity(container, config) {
      container.setAttribute("data-row-density", config.rowDensity || "default");
    }
    getAvailableTableWidth(tableWrap) {
      const parent = tableWrap.parentElement;
      if (!parent) return 0;
      const cs = getComputedStyle(parent);
      const paddingLeft = parseFloat(cs.paddingLeft) || 0;
      const paddingRight = parseFloat(cs.paddingRight) || 0;
      return Math.max(0, Math.floor(parent.getBoundingClientRect().width - paddingLeft - paddingRight));
    }
    renderHeader(table, config, columns, rows) {
      const thead = table.createEl("thead");
      const headerRow = thead.createEl("tr", { attr: { role: "row", "aria-rowindex": "1" } });
      table.setAttr("role", "grid");
      table.setAttr("aria-label", t("table.ariaLabel"));
      if (!this.actions.isReadOnly) {
        const selectTh = headerRow.createEl("th", { cls: "db-select-col", attr: { role: "columnheader" } });
        const selectInner = selectTh.createDiv({ cls: "db-select-inner" });
        const selectAll = selectInner.createEl("input", { attr: { type: "checkbox" } });
        selectAll.checked = this.actions.areAllRowsSelected(rows);
        selectAll.onchange = () => {
          this.actions.toggleRowsSelected(rows, selectAll.checked);
        };
      }
      if (this.shouldRenderRecordIcon(config)) {
        headerRow.createEl("th", {
          cls: "db-record-icon-col",
          attr: { role: "columnheader", "aria-label": t("recordIcon.icons"), title: t("recordIcon.icons") }
        });
      }
      for (const col of columns) {
        const th = headerRow.createEl("th");
        th.setAttr("role", "columnheader");
        th.setAttr("aria-colindex", String(Array.from(headerRow.children).indexOf(th) + 1));
        th.setAttr("data-note-database-column-key", col.key);
        th.toggleClass("is-narrow", this.isHeaderNarrow(config, col));
        const content = th.createDiv({ cls: "db-th-content" });
        renderPropertyTypeIcon(content, col);
        content.createSpan({ cls: "db-th-label", text: col.label || col.key, attr: { title: col.label || col.key } });
        const sort = this.getColumnSortState(config, col);
        if (sort) {
          th.setAttr("aria-sort", sort.direction === "asc" ? "ascending" : "descending");
          const arrow = sort.direction === "asc" ? "\u25B2" : "\u25BC";
          const suffix = sort.total > 1 ? String(sort.index + 1) : "";
          content.createSpan({
            text: `${arrow}${suffix}`,
            cls: `sort-indicator sort-indicator-${sort.direction}`,
            attr: { title: sort.total > 1 ? `${sort.index + 1}. ${sort.direction}` : sort.direction }
          });
        }
        if (!sort) th.setAttr("aria-sort", "none");
        this.actions.setupColumnHeader(th, col);
      }
      const addTh = headerRow.createEl("th", { cls: "db-add-column-th", attr: { role: "columnheader" } });
      const addButton = addTh.createEl("button", {
        cls: "db-add-column-button",
        attr: { type: "button", "aria-label": t("table.addColumn"), title: t("table.addColumn") }
      });
      setIcon(addButton, "plus");
      if (this.actions.isReadOnly || !this.actions.addColumn) {
        addButton.disabled = true;
      } else {
        addButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          void this.actions.addColumn?.();
        };
      }
      Array.from(headerRow.children).forEach((header, index) => {
        header.setAttr("aria-colindex", String(index + 1));
      });
    }
    getRenderableGroups(config, groups, groupField) {
      const result = [];
      const fieldsByDepth = [];
      let collapsedDepth;
      for (const group of groups) {
        const depth = Math.max(0, group.depth ?? 0);
        if (collapsedDepth != null) {
          if (depth > collapsedDepth) continue;
          collapsedDepth = void 0;
        }
        fieldsByDepth.length = depth + 1;
        const displayField = group.field ?? (depth === 0 ? groupField : fieldsByDepth[depth]);
        if (displayField) fieldsByDepth[depth] = displayField;
        const collapseKey = group.collapseKey ?? group.key;
        const collapsed = Boolean(groupField && this.actions.isGroupCollapsed?.(groupField, collapseKey));
        const visibleCount = groupField ? getGroupVisibleCount(config, groupField, collapseKey, group.rows.length) : group.rows.length;
        result.push({
          group,
          depth,
          displayField,
          collapseKey,
          collapsed,
          visibleRows: group.rows.slice(0, visibleCount),
          groupPath: this.getGroupPath(group, fieldsByDepth, groupField)
        });
        if (collapsed) collapsedDepth = depth;
      }
      return result;
    }
    renderGroupDividerRow(tbody, config, renderable, colspan) {
      const { group, depth, displayField, collapseKey, collapsed } = renderable;
      const selectionRows = group.rows;
      const divider = tbody.createEl("tr", {
        cls: `db-group-divider-row ${getGroupHeaderClassName(depth)}${collapsed ? " is-collapsed" : ""}`,
        attr: {
          "data-note-database-group-key": group.key,
          "data-note-database-group-field": displayField || "",
          "data-note-database-group-paths": JSON.stringify(selectionRows.map((row) => row.file.path))
        }
      });
      const sectionId = this.getGroupSectionId(displayField || "group", collapseKey);
      divider.setAttr("id", sectionId);
      const depthValue = getGroupHeaderDepthValue(depth);
      if (depthValue !== void 0) divider.style.setProperty("--db-group-depth", depthValue);
      const cell = divider.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
      const content = cell.createDiv({ cls: "db-group-divider-content" });
      if (!this.actions.isReadOnly) {
        const selectedIds = new Set(selectionRows.filter((row) => this.actions.isRowSelected(row)).map((row) => row.file.path));
        const selection = getSelectionState(selectionRows.map((row) => row.file.path), selectedIds);
        const checkbox = content.createEl("input", {
          cls: "db-group-divider-checkbox",
          attr: { type: "checkbox", "aria-label": t("group.selectRows") }
        });
        checkbox.checked = selection.checked;
        checkbox.indeterminate = selection.indeterminate;
        checkbox.onclick = (event) => event.stopPropagation();
        checkbox.onchange = () => this.actions.toggleRowsSelected(selectionRows, checkbox.checked);
      }
      const label = content.createSpan({ cls: "db-group-header-label" });
      if (displayField) {
        const toggle = label.createEl("button", {
          cls: `db-group-collapse-toggle${collapsed ? " is-collapsed" : ""}`,
          attr: {
            type: "button",
            "aria-label": collapsed ? t("group.expand") : t("group.collapse"),
            "aria-expanded": String(!collapsed),
            "aria-controls": sectionId
          }
        });
        toggle.createSpan({ cls: "db-collapse-triangle" });
        toggle.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.actions.toggleGroupCollapsed?.(displayField, collapseKey);
        };
      }
      renderGroupLabel(label, config, displayField, group.key, "db-group-title-text");
      label.createSpan({ cls: "db-group-count", text: String(group.count) });
      const summaries = content.createDiv({ cls: "db-group-divider-summaries" });
      this.actions.renderGroupSummaries?.(summaries, group.rows, config);
      return divider;
    }
    renderGroupExpandRow(tbody, config, field, key, totalCount, colspan) {
      const row = tbody.createEl("tr", { cls: "db-group-expand-row" });
      const cell = row.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
      if (!renderGroupExpandControls(cell, config, field, key, totalCount, this.actions)) row.remove();
    }
    renderRowInsertionLine(tbody, config, defaults, afterPath, beforePath, colspan) {
      if (this.actions.isReadOnly || this.actions.hideCreateEntry || !this.actions.createEntry || isExplicitlySorted(config)) return;
      const line = tbody.createEl("tr", {
        cls: "db-row-insert-line",
        attr: { "data-before-path": beforePath, "data-after-path": afterPath }
      });
      const cell = line.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
      const button = cell.createEl("button", {
        cls: "db-row-insert-button",
        attr: { type: "button", "aria-label": t("table.insertRow") }
      });
      setIcon(button, "plus");
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.createEntry?.(defaults, { beforePath, afterPath });
      };
    }
    renderFooter(table, config, columns, rows) {
      this.footerRenderer.renderFooter(table, config, columns, rows, {
        isReadOnly: this.actions.isReadOnly,
        hasRecordIcon: this.shouldRenderRecordIcon(config),
        onCalculationChange: (columnKey, calculation) => {
          this.actions.changeColumnCalculation?.(columnKey, calculation);
        }
      });
    }
    getColumnSortState(config, col) {
      const rules = (config.sortRules || []).filter((rule) => rule.field && rule.direction);
      const index = rules.findIndex((rule) => rule.field === col.key);
      if (index >= 0) return { direction: rules[index].direction, index, total: rules.length };
      if (rules.length === 0 && config.sortColumn === col.key) {
        return { direction: config.sortDirection || "asc", index: 0, total: 1 };
      }
      return null;
    }
    isHeaderNarrow(config, col) {
      const width = this.getColumnWidth(config, col);
      const labelLength = (col.label || col.key).length;
      return width < Math.min(180, Math.max(96, labelLength * 7 + 54));
    }
    renderRows(tbody, config, rows, columns, groupField, groupKey, groups, groupPath, allowGroupMove = true, insertDefaults, computedGroup = false) {
      rows.forEach((row, index) => {
        this.renderRow(tbody, config, row, rows, columns, groupField, groupKey, groups, groupPath, allowGroupMove);
        if (index < rows.length - 1 && !computedGroup) {
          this.renderRowInsertionLine(tbody, config, insertDefaults, rows[index].file.path, rows[index + 1].file.path, columns.length + this.getUtilityColumnCount(config));
        }
      });
    }
    renderRow(tbody, config, row, rows, columns, groupField, groupKey, groups, groupPath, allowGroupMove = true) {
      const tr = tbody.createEl("tr", {
        attr: { "data-note-database-row-path": row.file.path, role: "row" }
      });
      this.actions.applyConditionalFormat?.(tr, row, config);
      if (groupField && groupKey != null) {
        tr.setAttr("data-note-database-group-field", groupField);
        tr.setAttr("data-note-database-group-key", groupKey);
      }
      this.actions.setupRow(tr, row, {
        visibleRows: rows,
        groups: groupPath ?? (groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : void 0)
      });
      if (!this.actions.isReadOnly) {
        const selectTd = tr.createEl("td", { cls: "db-select-col" });
        const selectInner = selectTd.createDiv({ cls: "db-select-inner" });
        const rowMoveField = allowGroupMove ? groupField : void 0;
        const rowMoveKey = allowGroupMove ? groupKey : void 0;
        this.setupRowDrag(selectInner, tr, row, rows, config, rowMoveField, rowMoveKey, {
          visibleRows: rows,
          groups: groupPath ?? (groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : void 0)
        });
        if (isTouchDevice(this.renderContainer) && (this.canManualReorder(config) || Boolean(rowMoveField && groups?.length))) {
          this.renderMobileMoveButton(selectInner, config, row, rows, rowMoveField, rowMoveKey, groups);
        }
        const cb = selectInner.createEl("input", { attr: { type: "checkbox" } });
        cb.checked = this.actions.isRowSelected(row);
        cb.onclick = (event) => {
          event.stopPropagation();
          this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
        };
      }
      if (this.shouldRenderRecordIcon(config)) {
        const iconTd = tr.createEl("td", { cls: "db-record-icon-col" });
        const icon = this.actions.renderRecordIcon?.(iconTd, row, config, true);
        icon?.setAttr("tabindex", "-1");
      }
      for (const col of columns) {
        const td = tr.createEl("td", {
          attr: {
            "data-note-database-row-path": row.file.path,
            "data-note-database-column-key": col.key
          }
        });
        this.actions.renderCell(td, row, col);
        this.actions.applyConditionalFormat?.(td, row, config, col.key);
        if (!this.actions.isReadOnly) this.actions.setupFillHandle?.(td, row, col);
      }
      tr.createEl("td", { cls: "db-add-column-cell", attr: { "aria-hidden": "true" } });
      return tr;
    }
    /** Phone layouts use a compact menu instead of HTML drag and drop. */
    renderMobileMoveButton(parent, config, row, rows, groupField, groupKey, groups) {
      const button = parent.createEl("button", {
        cls: "db-table-mobile-move-btn",
        attr: { type: "button", title: t("mobile.moveCard"), "aria-label": t("mobile.moveCard") }
      });
      renderMobileMoveIcon(button);
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const menu = createOwnedMenuForEvent(event);
        if (this.canManualReorder(config)) this.addMobilePositionItems(menu, row, rows);
        if (groupField && groupKey != null && groups?.length && this.actions.moveRowToGroupAndPosition) {
          if (this.canManualReorder(config)) menu.addSeparator();
          for (const group of groups) {
            if (group.key === groupKey) continue;
            const groupLabel = formatGroupKeyDisplay(config, groupField, group.key);
            menu.addRow({ icon: "folder-input", label: `${t("mobile.moveTo")} ${groupLabel}`, onClick: () => {
              const paths = group.rows.map((candidate) => candidate.file.path).filter((path) => path !== row.file.path);
              void this.actions.moveRowToGroupAndPosition?.(
                row,
                groupField,
                groupKey,
                group.key,
                paths[paths.length - 1],
                void 0
              );
            } });
          }
        }
        menu.showAt({ x: event.clientX, y: event.clientY });
      };
    }
    /** Add local rank movement actions shared by grouped and ungrouped table rows. */
    addMobilePositionItems(menu, row, rows) {
      const paths = rows.map((candidate) => candidate.file.path);
      const index = paths.indexOf(row.file.path);
      const move = (targetIndex) => {
        const remaining = paths.filter((path) => path !== row.file.path);
        const boundedIndex = Math.max(0, Math.min(targetIndex, remaining.length));
        this.actions.moveRowToPosition?.(row.file.path, remaining[boundedIndex - 1], remaining[boundedIndex]);
      };
      menu.addRow({ icon: "chevron-up", label: t("menu.moveUp"), disabled: index <= 0, onClick: () => move(index - 1) });
      menu.addRow({ icon: "chevron-down", label: t("menu.moveDown"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(index + 1) });
      menu.addRow({ icon: "chevrons-up", label: t("mobile.moveTop"), disabled: index <= 0, onClick: () => move(0) });
      menu.addRow({ icon: "chevrons-down", label: t("mobile.moveBottom"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(paths.length - 1) });
    }
    renderNewRow(tbody, colspan, defaults, rows = [], computedGroup = false) {
      const tr = tbody.createEl("tr", { cls: "db-new-row" });
      const td = tr.createEl("td", { attr: { colspan: String(Math.max(colspan, 1)) } });
      if (computedGroup) {
        td.createEl("button", { cls: "db-new-row-button is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
        return;
      }
      const btn = td.createEl("button", { cls: "db-new-row-button", text: `+ ${t("toolbar.new")}` });
      btn.onclick = () => this.createEntryNearEnd(defaults, rows);
    }
    createEntryNearEnd(defaults, rows) {
      this.actions.createEntry(defaults, this.getCreatePosition(rows));
    }
    getCreatePosition(rows) {
      const last = rows[rows.length - 1];
      return last ? { afterPath: last.file.path } : void 0;
    }
    setupRowDrag(handleParent, tr, row, rows, config, groupField, groupKey, context) {
      const canMoveGroup = Boolean(groupField && groupKey != null && typeof this.actions.moveRowsToGroup === "function");
      const canReorder = this.canManualReorder(config);
      if (this.actions.isReadOnly) return;
      if (isTouchDevice(this.renderContainer)) return;
      if (!handleParent) return;
      const handle = handleParent.createEl("button", {
        cls: "db-table-row-drag-handle",
        attr: { type: "button", title: t("panel.dragToSort"), "aria-label": t("panel.dragToSort") }
      });
      setIcon(handle, "grip-vertical");
      handle.draggable = canMoveGroup || canReorder;
      tr.addClass("is-manual-row-draggable");
      handle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.showRowMenu?.(event, row, context, handle);
      });
      handle.addEventListener("dragstart", (event) => {
        if (!handle.draggable) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        event.dataTransfer?.setData(ROW_MIME, row.file.path);
        event.dataTransfer?.setData("text/plain", row.file.path);
        if (groupKey != null) event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        if (event.dataTransfer) {
          const rect = tr.getBoundingClientRect();
          event.dataTransfer.setDragImage(tr, event.clientX - rect.left, event.clientY - rect.top);
        }
        this.draggingPath = row.file.path;
        this.rowDropFeedback.begin(row.file.path, [row.file.path]);
        this.rowAutoScroller = new EdgeAutoScroller(tr.closest(".db-table-wrap") || tr);
        this.setRowDraggingMode(tr, true);
        tr.addClass("is-dragging");
      });
      handle.addEventListener("dragend", () => {
        this.draggingPath = void 0;
        this.rowAutoScroller?.destroy();
        this.rowAutoScroller = void 0;
        this.setRowDraggingMode(tr, false);
        tr.removeClass("is-dragging");
        if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
      });
      if (!canReorder) return;
      tr.addEventListener("dragover", (event) => {
        const dragPath = this.draggingPath || event.dataTransfer?.getData(ROW_MIME);
        if (!dragPath || dragPath === row.file.path) return;
        if (!this.isRowDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        this.rowAutoScroller?.update(event);
        this.rowDropFeedback.update(tr, resolveDropPlacement(tr, event, "vertical"));
      });
      tr.addEventListener("dragleave", () => {
        this.rowDropFeedback.clearTarget(tr);
      });
      tr.addEventListener("drop", (event) => {
        if (!this.isRowDrag(event)) return;
        const dragPath = this.draggingPath || event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
        const draggedRow = dragPath ? this.rowByPath.get(dragPath) : void 0;
        if (!dragPath || dragPath === row.file.path || !draggedRow) return;
        event.preventDefault();
        event.stopPropagation();
        this.draggingPath = void 0;
        this.rowAutoScroller?.destroy();
        this.rowAutoScroller = void 0;
        this.setRowDraggingMode(tr, false);
        const placement = this.rowDropFeedback.getPlacement(tr) || resolveDropPlacement(tr, event, "vertical");
        this.rowDropFeedback.setPending();
        const isAfter = placement === "after";
        const position = this.getDropPosition(rows, dragPath, row.file.path, isAfter);
        void this.moveRowToDropPosition(draggedRow, dragPath, groupField, groupKey, event, position.beforePath, position.afterPath).then(() => this.rowDropFeedback.commit()).catch((error) => this.rowDropFeedback.fail(error));
      });
    }
    setupGroupDropTarget(target, groupField, groupKey) {
      if (this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
      target.addEventListener("dragover", (event) => {
        if (!this.isRowDrag(event)) return;
        event.preventDefault();
        this.setGroupDropTarget(target, true);
      });
      target.addEventListener("dragleave", () => this.setGroupDropTarget(target, false));
      target.addEventListener("drop", (event) => {
        if (!this.isRowDrag(event)) return;
        const path = event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
        const row = path ? this.rowByPath.get(path) : void 0;
        if (!row || !path) return;
        event.preventDefault();
        event.stopPropagation();
        this.setGroupDropTarget(target, false);
        const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
        this.rowDropFeedback.begin(path, [path], groupKey);
        this.rowDropFeedback.setPending();
        void Promise.resolve(this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey)).then(() => this.rowDropFeedback.commit()).catch((error) => this.rowDropFeedback.fail(error));
      });
    }
    setGroupDropTarget(target, active) {
      target.toggleClass("is-drop-target", active);
      const tableWrap = target.closest(".db-table-wrap");
      if (tableWrap && target !== tableWrap) tableWrap.toggleClass("is-drop-target", active);
    }
    isRowDrag(event) {
      return Boolean(this.draggingPath) || Array.from(event.dataTransfer?.types || []).includes(ROW_MIME);
    }
    canManualReorder(config) {
      if (!this.actions.moveRowToPosition) return false;
      return !isExplicitlySorted(config);
    }
    getDropPosition(rows, dragPath, targetPath, isAfter) {
      const paths = rows.map((candidate) => candidate.file.path).filter((path) => path !== dragPath);
      const targetIndex = paths.indexOf(targetPath);
      if (targetIndex < 0) return {};
      if (isAfter) {
        return {
          beforePath: targetPath,
          afterPath: targetIndex < paths.length - 1 ? paths[targetIndex + 1] : void 0
        };
      }
      return {
        beforePath: targetIndex > 0 ? paths[targetIndex - 1] : void 0,
        afterPath: targetPath
      };
    }
    async moveRowToDropPosition(row, dragPath, groupField, groupKey, event, beforePath, afterPath) {
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      if (groupField && groupKey != null && fromGroupKey !== groupKey) {
        if (this.actions.moveRowToGroupAndPosition) {
          await this.actions.moveRowToGroupAndPosition(row, groupField, fromGroupKey, groupKey, beforePath, afterPath);
          return;
        }
        await this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey);
      }
      this.actions.moveRowToPosition?.(dragPath, beforePath, afterPath);
    }
    setRowDraggingMode(rowEl, active) {
      const container = rowEl.closest(".note-database-container");
      container?.toggleClass("is-row-dragging", active);
      if (!active) {
        container?.querySelectorAll(".db-table th.db-drop-target, .db-table th.db-dragging").forEach((el) => {
          el.classList.remove("db-drop-target", "db-dragging");
        });
      }
    }
    getGroupSectionId(field, key) {
      return `group-section-${encodeURIComponent(`${field}:${key}`)}`;
    }
    applyGridSemantics(table, config, columns, rows) {
      const rowCount = table.querySelectorAll("tbody > tr[data-note-database-row-path]").length;
      table.setAttr("aria-rowcount", String(Math.max(1, rowCount + 1)));
      table.setAttr("aria-colcount", String(columns.length + this.getUtilityColumnCount(config)));
      table.querySelectorAll("tbody > tr[data-note-database-row-path]").forEach((row, index) => {
        row.setAttr("role", "row");
        row.setAttr("aria-rowindex", String(index + 2));
        const dataRow = rows.find((candidate) => candidate.file.path === row.dataset.noteDatabaseRowPath);
        const selected = dataRow ? this.actions.isRowSelected(dataRow) : false;
        row.setAttr("aria-selected", String(Boolean(selected)));
        Array.from(row.children).forEach((cell) => {
          const element = cell;
          element.setAttr("role", "gridcell");
          element.setAttr("aria-colindex", String(Array.from(row.children).indexOf(cell) + 1));
          element.setAttr("aria-selected", String(Boolean(selected) || element.hasClass("db-cell-range-selected")));
        });
      });
    }
    getGroupPath(group, fieldsByDepth, groupField) {
      const keys = group.path?.length ? group.path : [group.key];
      return keys.map((key, index) => ({
        field: fieldsByDepth[index] || (index === 0 ? groupField : index === keys.length - 1 ? group.field : void 0),
        key
      })).filter((pathGroup) => Boolean(pathGroup.field));
    }
    getGroupDefaults(config, groupPath) {
      const defaults = {};
      for (const { field, key } of groupPath) {
        if (isComputedGroupField(config, field)) continue;
        const groupDefaults = resolveGroupCreateDefaults(config, field, key);
        for (const [defaultKey, value] of Object.entries(groupDefaults)) defaults[defaultKey] = value;
      }
      return defaults;
    }
  };

  // tools/bench/table-render-bench.ts
  var COLUMN_COUNTS = [4, 16];
  var ROW_COUNTS = [100, 500, 1e3, 2e3];
  var REPEATS = 5;
  function makeColumns(count) {
    return Array.from({ length: count }, (_unused, i) => ({
      key: i === 0 ? "file.name" : `field${i}`,
      label: i === 0 ? "Name" : `Field ${i}`,
      type: "text"
    }));
  }
  function makeRows(count, columns) {
    return Array.from({ length: count }, (_unused, i) => {
      const frontmatter = {};
      for (const col of columns) frontmatter[col.key] = `${col.key}-${i}`;
      return {
        file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
        frontmatter,
        computed: {}
      };
    });
  }
  function makeConfig(columns) {
    return { name: "Bench", sourceFolder: "notes", columns };
  }
  function makeActions(columns) {
    return {
      getVisibleColumns: () => columns,
      isRowSelected: () => false,
      toggleRowSelected: () => void 0,
      areAllRowsSelected: () => false,
      toggleRowsSelected: () => void 0,
      setupColumnHeader: (th, col) => {
        th.setText(col.label);
      },
      setupRow: () => void 0,
      // Constant-time on purpose: this bench isolates structural cost, not cell rendering.
      renderCell: (td, row, col) => {
        td.setText(String(row.frontmatter[col.key] ?? ""));
      },
      createEntry: () => void 0
    };
  }
  function percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  }
  function runBench(host, detached = false) {
    const samples = [];
    for (const columnCount of COLUMN_COUNTS) {
      const columns = makeColumns(columnCount);
      const config = makeConfig(columns);
      const actions = makeActions(columns);
      for (const rowCount of ROW_COUNTS) {
        const rows = makeRows(rowCount, columns);
        const renderTimes = [];
        let layoutMs = 0;
        let domNodes = 0;
        for (let run = 0; run <= REPEATS; run += 1) {
          const container = detached ? host.ownerDocument.createElement("div") : host.createDiv({ cls: "note-database-container" });
          if (detached) container.className = "note-database-container";
          const renderer = new TableRenderer(actions);
          const start = performance.now();
          renderer.renderTable(container, config, rows);
          if (detached) host.appendChild(container);
          const rendered = performance.now();
          const layoutStart = performance.now();
          void container.offsetHeight;
          const layoutEnd = performance.now();
          if (run > 0) {
            renderTimes.push(rendered - start);
            layoutMs += layoutEnd - layoutStart;
            domNodes = container.querySelectorAll("*").length;
          }
          container.remove();
        }
        const median2 = percentile(renderTimes, 0.5);
        samples.push({
          columns: columnCount,
          rows: rowCount,
          renderMs: Number(median2.toFixed(2)),
          p95Ms: Number(percentile(renderTimes, 0.95).toFixed(2)),
          layoutMs: Number((layoutMs / REPEATS).toFixed(2)),
          domNodes,
          msPerRow: Number((median2 / rowCount).toFixed(4))
        });
      }
    }
    return samples;
  }

  // tools/bench/dist/entry.ts
  installObsidianDomShim(window);
  window.__bench = (detached) => runBench(document.body, detached);
})();
