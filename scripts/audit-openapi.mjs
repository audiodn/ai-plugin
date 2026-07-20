#!/usr/bin/env node
/**
 * Assert skill-documented API paths/methods exist in OpenAPI.
 * Local mode: ADN_OPENAPI_PATH or ../www/public/openapi.json
 * Standalone: https://audiodeliverynetwork.com/openapi.json
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const DOCUMENTED = [
  { method: 'post', path: '/v1/upload_session' },
  { method: 'get', path: '/v1/upload_session/{upload_session_id}' },
  { method: 'post', path: '/v1/upload/{upload_session_id}/track' },
  { method: 'get', path: '/v1/track/{track_id}' },
  { method: 'post', path: '/v1/play_session/{scope}' },
  { method: 'get', path: '/v1/play_session/{play_session_id}' },
  { method: 'get', path: '/v1/play/{play_session_id}/{play_track_id}' },
  { method: 'get', path: '/v1/play/{play_session_id}/{play_track_id}/{variant_index}/download' },
  { method: 'post', path: '/v1/api_key' },
  { method: 'get', path: '/v1/variant' },
  { method: 'get', path: '/v1/variant/{variant_id}' },
  { method: 'post', path: '/v1/track/{track_id}/variant' },
];

async function loadOpenApi() {
  const localCandidates = [
    process.env.ADN_OPENAPI_PATH,
    join(ROOT, '..', 'www', 'public', 'openapi.json'),
  ].filter(Boolean);

  for (const p of localCandidates) {
    if (existsSync(p)) {
      return {
        source: p,
        spec: JSON.parse(readFileSync(p, 'utf8')),
      };
    }
  }

  const url = process.env.ADN_OPENAPI_URL || 'https://audiodeliverynetwork.com/openapi.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch OpenAPI ${url}: ${res.status}`);
  return { source: url, spec: await res.json() };
}

function pathExists(paths, template) {
  return Object.prototype.hasOwnProperty.call(paths, template);
}

const { source, spec } = await loadOpenApi();
const paths = spec.paths || {};
const errors = [];

for (const { method, path } of DOCUMENTED) {
  if (!pathExists(paths, path)) {
    errors.push(`Missing path ${path}`);
    continue;
  }
  const ops = paths[path];
  if (!ops[method]) {
    errors.push(`Missing method ${method.toUpperCase()} ${path}`);
  }
}

const meta = {
  retrievedAt: new Date().toISOString(),
  source,
  openapiVersion: spec.info?.version || null,
  title: spec.info?.title || null,
};

mkdirSync(join(ROOT, 'submission'), { recursive: true });
writeFileSync(
  join(ROOT, 'submission', 'openapi-audit-stamp.json'),
  `${JSON.stringify(meta, null, 2)}\n`,
);

if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`OpenAPI source: ${source}`);
  process.exit(1);
}

console.log(`audit-openapi: ok (${DOCUMENTED.length} operations) from ${source}`);
