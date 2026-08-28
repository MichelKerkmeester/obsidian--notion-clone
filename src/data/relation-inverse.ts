// ───────────────────────────────────────────────────────────────────
// MODULE:    relation-inverse
// COMPONENT: display-only inverse relation index (who links to this record)
// ───────────────────────────────────────────────────────────────────
//
// A relation stores one wikilink on its source record. The target side can
// derive its inbound records from the metadata cache without adding a
// mirrored property, keeping the target note untouched and mobile-safe.
// SYNC_WRITES_DEFAULT stays false for the same reason: writing a mirrored
// inverse property back to the target file is an opt-in feature, not the
// default, so a fresh install never mutates notes it merely reads.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
import type { NoteRecord } from "./data-source";
import { parseRelationValues } from "./relation-links";
import type { ColumnDef, DatabaseConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES & CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const SYNC_WRITES_DEFAULT = false;

export interface RelationInverseContext {
  app: App;
  databases: DatabaseConfig[];
  getRecordsForDatabase(database: DatabaseConfig): NoteRecord[];
}

export interface RelationInverseEdge {
  sourceDatabase: DatabaseConfig;
  relationColumn: ColumnDef;
  sourceRecord: NoteRecord;
}

export interface RelationInverseResult {
  inboundByPath: Map<string, RelationInverseEdge[]>;
  sourcePaths: Set<string>;
  sourceDatabaseIds: Set<string>;
}

interface RelationSource {
  database: DatabaseConfig;
  relationColumn: ColumnDef;
}

// ───────────────────────────────────────────────────────────────────
// 3. BUILD INVERSE INDEX
// ───────────────────────────────────────────────────────────────────

export function buildRelationInverse(context: RelationInverseContext): RelationInverseResult {
  const inboundByPath = new Map<string, RelationInverseEdge[]>();
  const sourcePaths = new Set<string>();
  const sourceDatabaseIds = new Set<string>();
  const databaseById = new Map(context.databases.map((database) => [database.id, database]));
  const relationSourcesByTargetId = new Map<string, RelationSource[]>();

  for (const database of context.databases) {
    for (const relationColumn of database.schema.columns.filter(
      (column) => column.type === "relation" && column.relationConfig?.targetDatabaseId
    )) {
      const targetDatabaseId = relationColumn.relationConfig!.targetDatabaseId;
      const sources = relationSourcesByTargetId.get(targetDatabaseId) || [];
      sources.push({ database, relationColumn });
      relationSourcesByTargetId.set(targetDatabaseId, sources);
    }
  }

  for (const [targetDatabaseId, sources] of relationSourcesByTargetId) {
    const targetDatabase = databaseById.get(targetDatabaseId);
    if (!targetDatabase) continue;
    const recordsByPath = new Map(
      context.getRecordsForDatabase(targetDatabase).map((record) => [record.file.path, record])
    );

    for (const { database: sourceDatabase, relationColumn } of sources) {
      for (const sourceRecord of context.getRecordsForDatabase(sourceDatabase)) {
        const seenPaths = new Set<string>();
        for (const link of parseRelationValues(sourceRecord.frontmatter[relationColumn.key])) {
          const resolved = context.app.metadataCache.getFirstLinkpathDest(
            link.target,
            sourceRecord.file.path
          );
          if (!resolved || seenPaths.has(resolved.path)) continue;
          if (!recordsByPath.has(resolved.path)) continue;
          seenPaths.add(resolved.path);

          const edges = inboundByPath.get(resolved.path) || [];
          edges.push({ sourceDatabase, relationColumn, sourceRecord });
          inboundByPath.set(resolved.path, edges);
          sourcePaths.add(sourceRecord.file.path);
          sourceDatabaseIds.add(sourceDatabase.id);
        }
      }
    }
  }

  return { inboundByPath, sourcePaths, sourceDatabaseIds };
}

export function mergeRelationInverseMembership(
  result: Pick<RelationInverseResult, "sourcePaths" | "sourceDatabaseIds">,
  targetPaths: Set<string>,
  targetDatabaseIds: Set<string>,
): void {
  for (const path of result.sourcePaths) targetPaths.add(path);
  for (const databaseId of result.sourceDatabaseIds) targetDatabaseIds.add(databaseId);
}
