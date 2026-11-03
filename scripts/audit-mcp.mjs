#!/usr/bin/env node
/**
 * Audit MCP tool annotation readiness from local mcp sources.
 * Reads annotation presets from mcp/src/tools/types.ts and inventories tools
 * from mcp/src/tools/api-tools.ts + knowledge-tools.ts when present.
 * Writes submission/mcp-audit-stamp.json. Soft-exit 0 for documentation CI.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MCP_URL = 'https://mcp.audiodelivery.net/mcp';
const MCP_ROOT = join(ROOT, '..', 'mcp');

function findLocalTypes() {
  const candidates = [
    process.env.ADN_MCP_TYPES_PATH,
    join(MCP_ROOT, 'src', 'tools', 'types.ts'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function parsePreset(text, name) {
  const re = new RegExp(
    `export const ${name}:[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`,
  );
  const m = text.match(re);
  if (!m) return null;
  const body = m[1];
  const bool = (key) => {
    const hit = body.match(new RegExp(`${key}:\\s*(true|false)`));
    return hit ? hit[1] === 'true' : undefined;
  };
  return {
    readOnlyHint: bool('readOnlyHint'),
    destructiveHint: bool('destructiveHint'),
    idempotentHint: bool('idempotentHint'),
    openWorldHint: bool('openWorldHint'),
  };
}

function inventoryTools(apiPath, knowledgePath) {
  const tools = [];
  const scan = (file, kindDefault) => {
    if (!existsSync(file)) return;
    const text = readFileSync(file, 'utf8');
    const nameRe = /name:\s*'([^']+)'/g;
    let match;
    while ((match = nameRe.exec(text)) !== null) {
      const name = match[1];
      const slice = text.slice(match.index, match.index + 600);
      const gated = /gated:\s*'delete'/.test(slice);
      let kind = kindDefault;
      let annotations = {};
      if (/DESTRUCTIVE/.test(slice) || gated) {
        kind = 'destructive';
        annotations = { readOnlyHint: false, openWorldHint: true, destructiveHint: true };
      } else if (/WRITE_IDEMPOTENT/.test(slice)) {
        kind = 'write-idempotent';
        annotations = { readOnlyHint: false, openWorldHint: true, destructiveHint: false };
      } else if (/WRITE/.test(slice)) {
        kind = 'write';
        annotations = { readOnlyHint: false, openWorldHint: true, destructiveHint: false };
      } else if (/LOCAL_READ_ONLY/.test(slice)) {
        kind = 'knowledge';
        annotations = { readOnlyHint: true, openWorldHint: false, destructiveHint: false };
      } else if (/READ_ONLY/.test(slice)) {
        kind = kindDefault === 'knowledge' ? 'knowledge' : 'api-read';
        annotations = {
          readOnlyHint: true,
          openWorldHint: kindDefault === 'knowledge' ? false : true,
          destructiveHint: false,
        };
      }
      tools.push({
        name,
        kind,
        ...annotations,
        missing: annotations.destructiveHint === undefined ? ['destructiveHint'] : [],
        gated: gated || undefined,
        blocker: false,
      });
    }
  };
  scan(knowledgePath, 'knowledge');
  scan(apiPath, 'api-read');
  return tools;
}

const typesPath = findLocalTypes();
let typesOk = false;
let presets = {};
if (typesPath) {
  const text = readFileSync(typesPath, 'utf8');
  presets = {
    READ_ONLY: parsePreset(text, 'READ_ONLY'),
    WRITE: parsePreset(text, 'WRITE'),
    WRITE_IDEMPOTENT: parsePreset(text, 'WRITE_IDEMPOTENT'),
    DESTRUCTIVE: parsePreset(text, 'DESTRUCTIVE'),
    LOCAL_READ_ONLY: parsePreset(text, 'LOCAL_READ_ONLY'),
  };
  typesOk =
    presets.WRITE?.destructiveHint === false &&
    presets.WRITE_IDEMPOTENT?.destructiveHint === false &&
    presets.READ_ONLY?.destructiveHint === false &&
    presets.LOCAL_READ_ONLY?.destructiveHint === false &&
    presets.DESTRUCTIVE?.destructiveHint === true;
}

const apiToolsPath = join(MCP_ROOT, 'src', 'tools', 'api-tools.ts');
const knowledgeToolsPath = join(MCP_ROOT, 'src', 'tools', 'knowledge-tools.ts');
const tools = inventoryTools(apiToolsPath, knowledgeToolsPath);

// A write tool is an OpenAI blocker only if the WRITE preset still omits destructiveHint:false.
for (const t of tools) {
  if ((t.kind === 'write' || t.kind === 'write-idempotent') && !typesOk) {
    t.blocker = true;
    t.missing = ['destructiveHint'];
  }
}

const blockers = tools.filter((t) => t.blocker);
const summary = {
  auditedAt: new Date().toISOString(),
  hostedUrl: MCP_URL,
  registryName: 'net.audiodelivery/mcp',
  npmPackage: '@audiodn/mcp',
  localTypesPath: typesPath,
  writePresetHasDestructiveFalse: typesOk,
  presets,
  toolCount: tools.length,
  openaiBlockers: blockers.map((t) => t.name),
  tools,
};

mkdirSync(join(ROOT, 'submission'), { recursive: true });
writeFileSync(
  join(ROOT, 'submission', 'mcp-audit-stamp.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(`audit-mcp: inventoried ${tools.length} tools from local mcp sources`);
console.log(`hosted: ${MCP_URL}`);
console.log(`WRITE destructiveHint:false present: ${typesOk}`);
console.log(`OpenAI annotation blockers: ${blockers.length}`);
if (!typesOk) {
  console.log('BLOCKER: non-destructive presets missing destructiveHint: false (fix in mcp repo)');
}
