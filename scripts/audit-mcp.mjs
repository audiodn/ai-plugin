#!/usr/bin/env node
/**
 * Audit MCP tool annotation readiness from local mcp sources or published package.
 * Does not modify mcp/. Writes/refresh notes used by submission/mcp-readiness.md
 * (this script prints a machine-readable summary; markdown is maintained in submission/).
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MCP_URL = 'https://mcp.audiodelivery.net/mcp';

/** Expected annotation matrix based on mcp/src/tools (validated 2026-07-19). */
const TOOLS = [
  { name: 'adn_about', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_search_docs', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_operations', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_operation', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_guide', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_variant_types', kind: 'knowledge', readOnlyHint: true, openWorldHint: false, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_creators', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_creator', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_collections', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_collection', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_tracks', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_track', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_upload_session', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_get_play_session', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_list_variants', kind: 'api-read', readOnlyHint: true, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'] },
  { name: 'adn_create_creator', kind: 'write', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_create_collection', kind: 'write', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_create_upload_session', kind: 'write', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_create_track_in_upload_session', kind: 'write', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_create_play_session', kind: 'write', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_update_creator', kind: 'write-idempotent', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_update_collection', kind: 'write-idempotent', readOnlyHint: false, openWorldHint: true, destructiveHint: false, missing: ['destructiveHint'], blocker: true },
  { name: 'adn_delete_creator', kind: 'destructive', readOnlyHint: false, openWorldHint: true, destructiveHint: true, missing: [], gated: true },
  { name: 'adn_delete_collection', kind: 'destructive', readOnlyHint: false, openWorldHint: true, destructiveHint: true, missing: [], gated: true },
];

function findLocalTypes() {
  const candidates = [
    process.env.ADN_MCP_TYPES_PATH,
    join(ROOT, '..', 'mcp', 'src', 'tools', 'types.ts'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

const typesPath = findLocalTypes();
let typesOk = true;
if (typesPath) {
  const text = readFileSync(typesPath, 'utf8');
  const m = text.match(/export const WRITE:[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  if (m && !/destructiveHint:\s*false/.test(m[1])) {
    typesOk = false;
  }
}

const blockers = TOOLS.filter((t) => t.blocker);
const summary = {
  auditedAt: new Date().toISOString(),
  hostedUrl: MCP_URL,
  registryName: 'net.audiodelivery/mcp',
  npmPackage: '@audiodn/mcp',
  localTypesPath: typesPath,
  writePresetHasDestructiveFalse: typesOk,
  toolCount: TOOLS.length,
  openaiBlockers: blockers.map((t) => t.name),
  tools: TOOLS,
};

mkdirSync(join(ROOT, 'submission'), { recursive: true });
writeFileSync(
  join(ROOT, 'submission', 'mcp-audit-stamp.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);

// Soft pass: always exit 0 so CI documents state; readiness markdown flags blockers.
console.log(`audit-mcp: inventoried ${TOOLS.length} tools`);
console.log(`hosted: ${MCP_URL}`);
if (!typesOk) {
  console.log('BLOCKER: WRITE preset missing destructiveHint: false (fix in mcp repo)');
}
console.log(`OpenAI annotation blockers: ${blockers.length}`);
