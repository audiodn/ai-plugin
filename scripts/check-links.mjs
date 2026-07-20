#!/usr/bin/env node
/**
 * Check canonical AudioDN URLs resolve.
 */
const URLS = [
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

const errors = [];

for (const url of URLS) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    let status = res.status;
    if (!ALLOWED_STATUS.has(status) && status === 403) {
      // Some CDNs block HEAD; try GET
      const g = await fetch(url, { method: 'GET', redirect: 'follow' });
      status = g.status;
    }
    if (!ALLOWED_STATUS.has(status) && status !== 200) {
      // retry GET for APIs that dislike HEAD
      const g = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { Accept: 'application/json,text/html,*/*' },
      });
      status = g.status;
    }
    if (!ALLOWED_STATUS.has(status)) {
      errors.push(`${url} -> ${status}`);
    } else {
      console.log(`OK ${status} ${url}`);
    }
  } catch (e) {
    errors.push(`${url} -> ${e.message}`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  process.exit(1);
}
console.log('check-links: ok');
