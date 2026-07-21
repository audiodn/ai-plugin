import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const validatorPath = join(
  ROOT,
  'src',
  'skills',
  'audiodn',
  'scripts',
  'validate-audiodn-project.mjs',
);

const { runValidation } = await import(validatorPath);

/** Write a set of {relPath: contents} into a fresh temp project and validate it. */
function validateProject(files) {
  const dir = mkdtempSync(join(tmpdir(), 'adn-validate-'));
  try {
    for (const [rel, contents] of Object.entries(files)) {
      const full = join(dir, rel);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, contents);
    }
    return runValidation(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const rules = (result) => result.findings.map((f) => f.rule);

describe('validate-audiodn-project: mixed-component-credentials (path-mixing)', () => {
  it('flags a component with both api-key and play-session-id', () => {
    const res = validateProject({
      'src/Player.jsx':
        "export const P = () => (\n  <audiodn-player api-key=\"pk\" play-session-id=\"ps\" />\n);\n",
    });
    assert.ok(rules(res).includes('mixed-component-credentials'));
    assert.ok(res.errorCount >= 1);
  });

  it('flags a multi-line uploader tag with both credentials', () => {
    const res = validateProject({
      'src/Up.jsx':
        'export const U = () => (\n  <audiodn-uploader\n    api-key="uk"\n    upload-session-id="us"\n  />\n);\n',
    });
    assert.ok(rules(res).includes('mixed-component-credentials'));
  });

  it('does not flag a component that uses only one credential', () => {
    const res = validateProject({
      'src/Player.jsx':
        'export const P = () => <audiodn-player play-session-id="ps" scope="track" id="t" />;\n',
    });
    assert.ok(!rules(res).includes('mixed-component-credentials'));
  });
});

describe('validate-audiodn-project: existing rules still hold', () => {
  it('flags a server API key referenced in client code', () => {
    const res = validateProject({
      'src/PlayerClient.tsx':
        "'use client';\nconst k = process.env.ADN_API_KEY;\nfetch('https://api.audiodelivery.net/v1/track/123', { headers: { Authorization: `Bearer ${k}` } });\n",
    });
    assert.ok(rules(res).includes('server-key-in-client'));
  });

  it('flags an invented /v1 endpoint but accepts a known one', () => {
    const invented = validateProject({
      'server/api.js':
        "await fetch('https://api.audiodelivery.net/v1/audio/normalize-lufs', { method: 'POST' });\n",
    });
    assert.ok(rules(invented).includes('invented-endpoint'));

    const known = validateProject({
      'server/api.js':
        "await fetch('https://api.audiodelivery.net/v1/upload_session', { method: 'POST' });\n",
    });
    assert.ok(!rules(known).includes('invented-endpoint'));
  });

  it('reports a clean project with no errors', () => {
    const res = validateProject({
      'server/upload.js':
        "// server route\nconst s = await fetch('https://api.audiodelivery.net/v1/upload_session', { method: 'POST', headers: { Authorization: `Bearer ${process.env.ADN_API_KEY}` } });\nconst t = await fetch(`https://api.audiodelivery.net/v1/upload/${id}/track`, { method: 'POST' });\nconst up = t.track_upload;\n",
    });
    assert.equal(res.errorCount, 0, JSON.stringify(res.findings));
  });
});
