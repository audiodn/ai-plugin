#!/usr/bin/env node
/**
 * Check that canonical AudioDN URLs resolve, plus every AudioDN doc/site link
 * embedded in the bundled skill content (src/ + dist/). Catches broken or
 * mistyped links (e.g. a reference to a page that no longer exists).
 *
 * Note: redirects are treated as "resolves" — production may still 301/308
 * legacy or trailing-slash paths — so this catches 404s/typos, not every
 * out-of-date-but-still-live link. Content should still use canonical URLs.
 */
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Always-checked canonical hosts / resources.
const BASE_URLS = [
  'https://audiodeliverynetwork.com',
  'https://audiodeliverynetwork.com/docs/',
  'https://audiodeliverynetwork.com/for-ai-agents/',
  'https://audiodeliverynetwork.com/openapi.json',
  'https://audiodeliverynetwork.com/privacy',
  'https://audiodeliverynetwork.com/terms',
  'https://api.audiodelivery.net',
  'https://mcp.audiodelivery.net/mcp',
  'https://audiodeliverynetwork.com/logo.png',
  'https://registry.npmjs.org/@audiodn/mcp',
  'https://registry.npmjs.org/@audiodn/agent-kit',
];

const ALLOWED_STATUS = new Set([200, 301, 302, 303, 307, 308, 405]);
// MCP Streamable HTTP often returns 405 on HEAD/GET without MCP session — still means host is up.

const SCAN_ROOTS = ['src', 'dist', 'README.md'];
const SCAN_EXT = new Set(['.md', '.mdc']);
// Skip templated/example URLs that are not meant to resolve.
const TEMPLATED = /[{}<>`$]|:[a-z_]+|YOUR_|ORGANIZATION_ID|EXAMPLE|\.\.\./i;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  const st = lstatSync(dir);
  if (st.isFile()) {
    out.push(dir);
    return out;
  }
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let s;
    try {
      s = lstatSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(extname(name))) out.push(full);
  }
  return out;
}

/** Collect AudioDN doc/site links embedded in bundled content. */
function collectEmbeddedLinks() {
  const found = new Set();
  const files = SCAN_ROOTS.flatMap((r) => walk(join(ROOT, r)));
  const urlRe = /https?:\/\/[^\s)\]"'`>]+/g;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const raw of text.match(urlRe) || []) {
      const url = raw.replace(/[.,;:)]+$/, '');
      if (TEMPLATED.test(url)) continue;
      // Only verify first-party AudioDN links here (npm/others in BASE_URLS).
      if (!/^https?:\/\/[^/]*audiodelivery(?:network)?\.(?:com|net)\b/.test(url)) continue;
      // Skip the /v1 API host paths (require methods/keys) and delivery subdomains.
      if (/\/v1\//.test(url)) continue;
      found.add(url);
    }
  }
  return [...found];
}

async function statusOf(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    let status = res.status;
    if (!ALLOWED_STATUS.has(status)) {
      // Some CDNs/routes dislike HEAD; retry GET.
      const g = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { Accept: 'application/json,text/html,*/*' },
      });
      status = g.status;
    }
    return status;
  } catch (e) {
    return `ERR ${e.message}`;
  }
}

const urls = [...new Set([...BASE_URLS, ...collectEmbeddedLinks()])].sort();
const errors = [];

for (const url of urls) {
  const status = await statusOf(url);
  if (typeof status === 'number' && ALLOWED_STATUS.has(status)) {
    console.log(`OK ${status} ${url}`);
  } else {
    errors.push(`${url} -> ${status}`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  process.exit(1);
}
console.log(`check-links: ok (${urls.length} urls)`);
