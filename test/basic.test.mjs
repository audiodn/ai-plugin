import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('ai-plugin', () => {
  it('has private package.json', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    assert.equal(pkg.private, true);
  });

  it('ships required upload sentence in all platform skills', () => {
    const sentence =
      'Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.';
    for (const p of ['cursor', 'claude', 'openai']) {
      const skill = join(ROOT, 'dist', p, 'skills', 'audiodn', 'SKILL.md');
      assert.ok(existsSync(skill), skill);
      assert.ok(readFileSync(skill, 'utf8').includes(sentence));
    }
  });

  it('MCP configs point at production hosted endpoint', () => {
    const url = 'https://mcp.audiodelivery.net/mcp';
    assert.equal(
      JSON.parse(readFileSync(join(ROOT, 'dist', 'cursor', 'mcp.json'), 'utf8')).mcpServers.audiodn
        .url,
      url,
    );
    const claude = JSON.parse(readFileSync(join(ROOT, 'dist', 'claude', '.mcp.json'), 'utf8'));
    assert.equal(claude.mcpServers.audiodn.url, url);
    assert.equal(claude.mcpServers.audiodn.type, 'http');
    const openai = JSON.parse(readFileSync(join(ROOT, 'dist', 'openai', '.mcp.json'), 'utf8'));
    assert.equal(openai.audiodn.url, url);
    assert.equal(openai.mcpServers, undefined);
  });

  it('OpenAI manifest includes install-surface interface metadata', () => {
    const man = JSON.parse(
      readFileSync(join(ROOT, 'dist', 'openai', '.codex-plugin', 'plugin.json'), 'utf8'),
    );
    assert.equal(man.interface.displayName, 'AudioDN');
    assert.ok(man.interface.privacyPolicyURL.includes('/privacy'));
    assert.ok(man.interface.logo.startsWith('./'));
  });

  it('Claude manifest has displayName and http MCP type', () => {
    const man = JSON.parse(
      readFileSync(join(ROOT, 'dist', 'claude', '.claude-plugin', 'plugin.json'), 'utf8'),
    );
    assert.equal(man.displayName, 'AudioDN');
    assert.equal(man.defaultEnabled, false);
  });

  it('build is reproducible for platform trees', () => {
    const a = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.equal(a.status, 0, a.stderr || a.stdout);
  });
});
