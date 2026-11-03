#!/usr/bin/env node
/**
 * Sync/review helper. Does NOT rewrite skill content in CI.
 *
 * Modes:
 *   --local   Prefer sibling monorepo paths when present
 *   --write-stamp  Write retrieval stamp under submission/
 *
 * Produces a reviewable report under sync-review/ (gitignored).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const local = process.argv.includes('--local');
const writeStamp = process.argv.includes('--write-stamp') || true;

const siblings = {
  // Prefer sibling monorepo layout (ai-plugin next to audiodn-mono).
  www: [
    join(ROOT, '..', 'audiodn-mono', 'www'),
    join(ROOT, '..', 'www'),
  ].find((p) => existsSync(p)) || join(ROOT, '..', 'audiodn-mono', 'www'),
  api: [
    join(ROOT, '..', 'audiodn-mono', 'api'),
    join(ROOT, '..', 'api'),
  ].find((p) => existsSync(p)) || join(ROOT, '..', 'audiodn-mono', 'api'),
  mcp: join(ROOT, '..', 'mcp'),
  agentKit: join(ROOT, '..', 'agent-kit'),
};

const report = {
  generatedAt: new Date().toISOString(),
  mode: local ? 'local' : 'standalone',
  siblings: {},
  actions: [],
  notes: [
    'This command reports drift sources; it does not silently rewrite src/ skill content.',
    'Review sync-review/ and manually update src/ when intentional.',
  ],
};

for (const [k, p] of Object.entries(siblings)) {
  report.siblings[k] = { path: p, present: existsSync(p) };
}

mkdirSync(join(ROOT, 'sync-review'), { recursive: true });

if (local && existsSync(join(siblings.agentKit, 'assets', 'skill'))) {
  const dest = join(ROOT, 'sync-review', 'agent-kit-skill');
  cpSync(join(siblings.agentKit, 'assets', 'skill'), dest, { recursive: true });
  report.actions.push(`Copied agent-kit skill tree to sync-review/agent-kit-skill for diff`);
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

let openapiSource;
if (local && existsSync(join(siblings.www, 'public', 'openapi.json'))) {
  openapiSource = join(siblings.www, 'public', 'openapi.json');
  cpSync(openapiSource, join(ROOT, 'sync-review', 'openapi.json'));
  report.actions.push(`Copied local OpenAPI to sync-review/openapi.json`);
} else {
  const url = 'https://audiodeliverynetwork.com/openapi.json';
  const text = await fetchText(url);
  writeFileSync(join(ROOT, 'sync-review', 'openapi.json'), text);
  openapiSource = url;
  report.actions.push(`Fetched ${url}`);
}

const known = JSON.parse(
  readFileSync(join(ROOT, 'src', 'skills', 'audiodn', 'scripts', 'known-endpoints.json'), 'utf8'),
);
const spec = JSON.parse(readFileSync(join(ROOT, 'sync-review', 'openapi.json'), 'utf8'));
const openapiPaths = Object.keys(spec.paths || {}).sort();
const knownPaths = [...known.paths].sort();
const missingInKnown = openapiPaths.filter((p) => !knownPaths.includes(p));
const extraInKnown = knownPaths.filter((p) => !openapiPaths.includes(p));

report.openapi = {
  source: openapiSource,
  version: spec.info?.version,
  missingInKnown,
  extraInKnown,
};

writeFileSync(join(ROOT, 'sync-review', 'REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);

if (writeStamp) {
  mkdirSync(join(ROOT, 'submission'), { recursive: true });
  writeFileSync(
    join(ROOT, 'submission', 'sync-stamp.json'),
    `${JSON.stringify(
      {
        retrievedAt: report.generatedAt,
        mode: report.mode,
        openapiSource,
        openapiVersion: spec.info?.version,
      },
      null,
      2,
    )}\n`,
  );
}

console.log(JSON.stringify(report, null, 2));
if (missingInKnown.length || extraInKnown.length) {
  console.log('\nPath drift detected — update known-endpoints.json after review.');
  process.exitCode = 0; // reviewable, not a hard CI failure for sync
}
