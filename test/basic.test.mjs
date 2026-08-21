import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('ai-plugin', () => {
  it('is configured for a clean scoped public npm publish', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    // Published as a public scoped package (not private).
    assert.notEqual(pkg.private, true);
    assert.equal(pkg.publishConfig?.access, 'public');
    // Tarball ships only the built bundles + docs — never source, tests, or
    // the submission/ working files.
    assert.deepEqual(pkg.files, ['dist', 'README.md', 'LICENSE', 'CHANGELOG.md']);
    for (const leak of ['src', 'scripts', 'test', 'submission', 'sync-review']) {
      assert.ok(!pkg.files.includes(leak), `files must not include ${leak}`);
    }
    // A build+validate gate runs before anything is published.
    assert.ok(pkg.scripts?.prepublishOnly?.includes('build'));
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
    const mcp = JSON.parse(readFileSync(join(ROOT, 'dist', 'cursor', 'mcp.json'), 'utf8'));
    assert.equal(mcp.mcpServers.audiodn.url, url);
    assert.equal(mcp.mcpServers.audiodn.headers.Authorization, 'Bearer ${ADN_API_KEY}');
    const claude = JSON.parse(readFileSync(join(ROOT, 'dist', 'claude', '.mcp.json'), 'utf8'));
    assert.equal(claude.mcpServers.audiodn.url, url);
    assert.equal(claude.mcpServers.audiodn.type, 'http');
    assert.equal(claude.mcpServers.audiodn.headers.Authorization, 'Bearer ${ADN_API_KEY}');
    const openai = JSON.parse(readFileSync(join(ROOT, 'dist', 'openai', '.mcp.json'), 'utf8'));
    assert.equal(openai.audiodn.url, url);
    assert.equal(openai.audiodn.headers.Authorization, 'Bearer ${ADN_API_KEY}');
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

  it('Cursor manifest uses AudioDN display name and official logo', () => {
    const man = JSON.parse(
      readFileSync(join(ROOT, 'dist', 'cursor', '.cursor-plugin', 'plugin.json'), 'utf8'),
    );
    assert.equal(man.name, 'audiodn');
    assert.equal(man.displayName, 'AudioDN');
    assert.equal(man.author.name, 'Audio Delivery Network');
    assert.equal(man.logo, 'assets/logo.svg');
    assert.ok(existsSync(join(ROOT, 'dist', 'cursor', man.logo)));
    assert.equal(man.variables?.properties?.ADN_API_KEY?.type, 'string');
    assert.ok(!man.variables?.required?.includes('ADN_API_KEY'));
    const svg = readFileSync(join(ROOT, 'assets', 'logo.svg'), 'utf8');
    assert.ok(svg.includes('AudioDN'));
    assert.ok(svg.includes('#DF4D85'));
    assert.ok(!svg.includes('M34 78V50'));
  });

  it('ships store-agent-audio command and a store/play/preview skill description', () => {
    const cmd = join(ROOT, 'src', 'commands', 'store-agent-audio.md');
    assert.ok(existsSync(cmd), cmd);
    const skill = readFileSync(join(ROOT, 'src', 'skills', 'audiodn', 'SKILL.md'), 'utf8');
    assert.ok(skill.includes('hosted place to keep audio'));
    assert.ok(skill.includes('Plugins → AudioDN → Configure'));
    assert.ok(existsSync(join(ROOT, 'dist', 'cursor', 'commands', 'store-agent-audio.md')));
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
