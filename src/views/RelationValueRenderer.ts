import { App, setIcon } from "obsidian";
import { getRelationDisplayLabel, parseRelationValues } from "../data/RelationLinks";
import { RowData } from "../data/types";
import { setFieldTooltip } from "./FieldTooltip";
import { markNoteHoverLink } from "./HoverLinkPreview";

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
    const anchor = wrap.createEl("a", {
      cls: "db-relation-link internal-link",
      attr: { href: "#", title: link.target },
    });
    markNoteHoverLink(anchor, link.target, row.file.path);
    const icon = anchor.createSpan({ cls: "db-relation-link-icon" });
    setIcon(icon, "file-text");
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
