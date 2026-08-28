import { App, setIcon } from "obsidian";
import { getRelationDisplayLabel, parseRelationValues } from "../data/RelationLinks";
import { RowData } from "../data/types";
import { setFieldTooltip } from "./FieldTooltip";
import { markNoteHoverLink } from "./HoverLinkPreview";
import { t } from "../i18n";

export function renderRelationValue(
  parent: HTMLElement,
  app: App | undefined,
  row: RowData,
  value: unknown,
  compact = false,
): boolean {
  const links = parseRelationValues(value);
  if (links.length === 0) return false;
  const wrap = parent.createDiv({ cls: `db-relation-values${compact ? " is-compact" : ""}` });
  setFieldTooltip(wrap, links.map((link) => link.alias || link.target));
  for (const link of links) {
    const resolved = app?.metadataCache.getFirstLinkpathDest(link.target, row.file.path);
    const anchor = wrap.createEl("a", {
      cls: "db-relation-link internal-link",
      attr: { href: "#", title: link.target },
    });
    if (app && !resolved) {
      anchor.addClass("is-unresolved");
      anchor.setAttr("title", t("relation.notFoundInVault"));
      setFieldTooltip(anchor, t("relation.notFoundInVault"));
    }
    markNoteHoverLink(anchor, link.target, row.file.path);
    const icon = anchor.createSpan({ cls: "db-relation-link-icon" });
    setIcon(icon, resolved || !app ? "file-text" : "alert-triangle");
    anchor.createSpan({
      cls: "db-relation-link-label",
      text: getRelationDisplayLabel(link),
    });
    anchor.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      void app?.workspace.openLinkText(link.target, row.file.path);
    };
  }
  return true;
}
