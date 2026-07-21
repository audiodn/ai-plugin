import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'src', 'skills', 'audiodn', 'SKILL.md');
const REFDIR = join(ROOT, 'src', 'skills', 'audiodn', 'references');

function listedReferences() {
  const text = readFileSync(SKILL, 'utf8');
  const listed = new Set();
  for (const m of text.matchAll(/`references\/([\w-]+\.md)`/g)) listed.add(m[1]);
  return listed;
}

function referenceFiles() {
  return new Set(readdirSync(REFDIR).filter((f) => f.endsWith('.md')));
}

describe('skill references wiring', () => {
  it('every reference file is listed in SKILL.md', () => {
    const listed = listedReferences();
    const files = referenceFiles();
    const orphans = [...files].filter((f) => !listed.has(f));
    assert.equal(orphans.length, 0, `Reference files not linked in SKILL.md: ${orphans.join(', ')}`);
  });

  it('every SKILL.md reference link resolves to a real file', () => {
    const listed = listedReferences();
    const files = referenceFiles();
    const dangling = [...listed].filter((f) => !files.has(f));
    assert.equal(dangling.length, 0, `SKILL.md links to missing references: ${dangling.join(', ')}`);
  });

  it('includes the integration-path and durable-ID references', () => {
    const files = referenceFiles();
    for (const required of [
      'choosing-an-integration.md',
      'upload-flow.md',
      'playback-and-delivery.md',
      'reading-catalog.md',
      'web-components.md',
      'webhooks.md',
      'workflows.md',
    ]) {
      assert.ok(files.has(required), `missing reference: ${required}`);
    }
  });

  it('build copies all references into every platform target', () => {
    const tmpRel = `.tmp-dist-refs-${process.pid}`;
    const tmpDist = join(ROOT, tmpRel);
    try {
      const build = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, ADN_PLUGIN_DIST: tmpRel, ADN_SKIP_MARKETPLACES: '1' },
      });
      assert.equal(build.status, 0, build.stderr || build.stdout);
      const files = referenceFiles();
      for (const platform of ['cursor', 'claude', 'openai']) {
        for (const ref of files) {
          const p = join(tmpDist, platform, 'skills', 'audiodn', 'references', ref);
          assert.ok(existsSync(p), `missing ${platform} reference: ${ref}`);
        }
      }
    } finally {
      rmSync(tmpDist, { recursive: true, force: true });
    }
  });
});
