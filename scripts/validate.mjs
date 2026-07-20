#!/usr/bin/env node
/**
 * Validate manifests, frontmatter, security rules, MCP URLs, and stale dist.
 */
import {
  readFileSync,
  readdirSync,
  lstatSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const REQUIRED_UPLOAD =
  'Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.';
const MCP_URL = 'https://mcp.audiodelivery.net/mcp';
const LOUDNESS_FORBIDDEN =
  /\b(LUFS|loudness normalization|true-peak limiting|dynamic-range processing|gain normalization)\b/i;
const SECRET_LIKE = /adn_[a-z]+_[A-Za-z0-9]{12,}|Bearer\s+adn_[A-Za-z0-9_]{12,}/i;

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = lstatSync(full);
    if (st.isSymbolicLink()) {
      fail(`Symlink found: ${relative(ROOT, full)}`);
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const block = text.slice(4, end).trim();
  const data = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v === 'true') v = true;
    if (v === 'false') v = false;
    data[m[1]] = v;
  }
  return data;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`Invalid JSON ${relative(ROOT, path)}: ${e.message}`);
    return null;
  }
}

function hashTree(dir) {
  const files = walk(dir)
    .map((f) => relative(dir, f))
    .sort();
  const h = createHash('sha256');
  for (const rel of files) {
    if (rel === 'BUILD_INFO.json') continue;
    h.update(rel);
    h.update('\0');
    h.update(readFileSync(join(dir, rel)));
    h.update('\0');
  }
  return h.digest('hex');
}

// --- manifests ---
for (const platform of ['cursor', 'claude', 'openai']) {
  const base = join(ROOT, 'dist', platform);
  if (!existsSync(base)) {
    fail(`Missing dist/${platform} — run npm run build`);
    continue;
  }
  const manifestPath =
    platform === 'cursor'
      ? join(base, '.cursor-plugin', 'plugin.json')
      : platform === 'claude'
        ? join(base, '.claude-plugin', 'plugin.json')
        : join(base, '.codex-plugin', 'plugin.json');
  const man = readJson(manifestPath);
  if (!man) continue;
  if (!man.name || typeof man.name !== 'string') fail(`${platform}: missing name`);
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(man.name || '')) {
    fail(`${platform}: name must be lowercase kebab-case`);
  }
  if (!man.version) fail(`${platform}: missing version`);
  if (!man.description) fail(`${platform}: missing description`);

  // path containment / no ..
  const files = walk(base);
  for (const f of files) {
    const rel = relative(base, f);
    if (rel.includes('..')) fail(`${platform}: path escapes root: ${rel}`);
  }

  // MCP config — platform schemas differ
  const mcpPath =
    platform === 'cursor' ? join(base, 'mcp.json') : join(base, '.mcp.json');
  const mcp = readJson(mcpPath);
  if (!mcp) {
    fail(`${platform}: missing MCP config at ${relative(ROOT, mcpPath)}`);
  } else if (platform === 'openai') {
    // Codex: direct server map (or mcp_servers wrapper), not mcpServers
    const entry = mcp.audiodn || mcp.mcp_servers?.audiodn;
    if (!entry?.url) fail('openai: .mcp.json missing audiodn.url (direct map)');
    else if (entry.url !== MCP_URL) fail(`openai: MCP url must be ${MCP_URL}`);
    if (mcp.mcpServers) {
      fail('openai: .mcp.json should be a direct server map, not mcpServers wrapper');
    }
  } else if (!mcp.mcpServers?.audiodn) {
    fail(`${platform}: missing mcpServers.audiodn`);
  } else if (mcp.mcpServers.audiodn.url !== MCP_URL) {
    fail(`${platform}: MCP url must be ${MCP_URL}`);
  } else if (platform === 'claude') {
    const t = mcp.mcpServers.audiodn.type;
    if (t !== 'http' && t !== 'streamable-http') {
      fail('claude: mcpServers.audiodn must set type to "http" (or streamable-http)');
    }
  }

  // Platform-specific manifest extras
  if (platform === 'claude') {
    if (!man.displayName) fail('claude: plugin.json missing displayName');
    if (man.defaultEnabled !== false) {
      fail('claude: defaultEnabled should be false (external MCP opt-in)');
    }
  }
  if (platform === 'openai') {
    if (!man.interface?.displayName) fail('openai: missing interface.displayName');
    if (!man.interface?.privacyPolicyURL) fail('openai: missing interface.privacyPolicyURL');
    if (!man.interface?.termsOfServiceURL) fail('openai: missing interface.termsOfServiceURL');
    if (!man.interface?.logo?.startsWith('./')) {
      fail('openai: interface.logo must be a ./ relative path');
    }
    if (!Array.isArray(man.interface?.defaultPrompt) || man.interface.defaultPrompt.length < 1) {
      fail('openai: interface.defaultPrompt should be a non-empty array');
    }
    for (const field of ['skills', 'mcpServers']) {
      if (typeof man[field] === 'string' && !man[field].startsWith('./')) {
        fail(`openai: ${field} path must start with ./`);
      }
    }
  }
  if (platform === 'cursor') {
    if (!man.logo) fail('cursor: missing logo');
    if (!existsSync(join(base, man.logo))) fail(`cursor: logo file missing: ${man.logo}`);
  }

  // skill frontmatter
  const skill = join(base, 'skills', 'audiodn', 'SKILL.md');
  if (!existsSync(skill)) fail(`${platform}: missing skills/audiodn/SKILL.md`);
  else {
    const fm = parseFrontmatter(readFileSync(skill, 'utf8'));
    if (!fm?.name || !fm?.description) fail(`${platform}: skill frontmatter incomplete`);
    if (typeof fm.description === 'string' && fm.description.length > 600) {
      warn(`${platform}: skill description is long (${fm.description.length} chars)`);
    }
  }
}

// Cursor rule
{
  const rule = join(ROOT, 'dist', 'cursor', 'rules', 'audiodn.mdc');
  if (!existsSync(rule)) fail('cursor: missing rules/audiodn.mdc');
  else {
    const fm = parseFrontmatter(readFileSync(rule, 'utf8'));
    if (fm?.alwaysApply !== false) fail('cursor: rule must have alwaysApply: false');
  }
}

// Commands frontmatter (cursor + claude)
for (const platform of ['cursor', 'claude']) {
  const cmdDir = join(ROOT, 'dist', platform, 'commands');
  if (!existsSync(cmdDir)) {
    fail(`${platform}: missing commands/`);
    continue;
  }
  for (const f of walk(cmdDir)) {
    if (!/\.md$/.test(f)) continue;
    const fm = parseFrontmatter(readFileSync(f, 'utf8'));
    if (!fm?.name || !fm?.description) {
      fail(`${platform}: command frontmatter incomplete: ${relative(ROOT, f)}`);
    }
  }
}

// Root marketplaces
for (const p of [
  '.cursor-plugin/marketplace.json',
  '.claude-plugin/marketplace.json',
  '.agents/plugins/marketplace.json',
]) {
  if (!existsSync(join(ROOT, p))) fail(`Missing ${p}`);
  else readJson(join(ROOT, p));
}

// Content rules across src + dist markdown
const mdFiles = [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'dist')),
  ...walk(join(ROOT, 'submission')).filter(() => existsSync(join(ROOT, 'submission'))),
].filter((f) => /\.(md|mdc|json)$/.test(f));

let uploadSentenceFound = false;
for (const f of mdFiles) {
  const text = readFileSync(f, 'utf8');
  const collapsed = text.replace(/\s+/g, ' ');
  if (collapsed.includes(REQUIRED_UPLOAD)) uploadSentenceFound = true;
  if (SECRET_LIKE.test(text) && !/placeholder|example|adn_\.\.\.|adn_\$\{/i.test(text)) {
    // allow documented patterns like adn_...
    if (!/adn_\.\.\./.test(text) && SECRET_LIKE.test(text)) {
      const m = text.match(SECRET_LIKE);
      if (m && !/adn_\.\.\.|your_key|EXAMPLE/i.test(m[0])) {
        fail(`Possible real credential in ${relative(ROOT, f)}: ${m[0].slice(0, 24)}...`);
      }
    }
  }
  // Loudness claims — allow negation / disclaimers
  if (LOUDNESS_FORBIDDEN.test(text)) {
    const isNegation =
      /does\s+\*\*not\*\*|does not|do not claim|not part of|unsupported|refuse|no lufs|not\s+lufs|wrong fit|prefer:|instead|not loudness|\*\*not\*\*\s+LUFS/i.test(
        text,
      );
    if (!isNegation) {
      fail(`Unsupported loudness-normalization claim in ${relative(ROOT, f)}`);
    }
  }
  // Browser example with server key
  if (
    /<(script|audiodn-player|audiodn-uploader)[^>]*>[\s\S]{0,400}ADN_API_KEY/i.test(text) ||
    /api-key=["']\$\{?ADN_API_KEY/i.test(text)
  ) {
    fail(`Browser example appears to use server API key in ${relative(ROOT, f)}`);
  }
}

if (!uploadSentenceFound) {
  fail('Required upload guidance sentence missing from bundled content');
}

// Ensure skill + upload ref contain the sentence
for (const rel of [
  'src/skills/audiodn/SKILL.md',
  'src/skills/audiodn/references/upload-flow.md',
  'dist/cursor/skills/audiodn/SKILL.md',
  'dist/claude/skills/audiodn/SKILL.md',
  'dist/openai/skills/audiodn/SKILL.md',
]) {
  const p = join(ROOT, rel);
  const text = existsSync(p) ? readFileSync(p, 'utf8').replace(/\s+/g, ' ') : '';
  if (!text.includes(REQUIRED_UPLOAD)) {
    fail(`Missing required upload sentence in ${rel}`);
  }
}

// Stale dist check: build to a temp dist dir and compare platform hashes
{
  const tmpRel = `.tmp-dist-${process.pid}`;
  const tmpDist = join(ROOT, tmpRel);
  try {
    const build = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], {
      cwd: ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        ADN_PLUGIN_DIST: tmpRel,
        ADN_SKIP_MARKETPLACES: '1',
      },
    });
    if (build.status !== 0) {
      fail(`Fresh build for stale check failed: ${build.stderr || build.stdout}`);
    } else {
      for (const p of ['cursor', 'claude', 'openai']) {
        const committed = hashTree(join(ROOT, 'dist', p));
        const fresh = hashTree(join(tmpDist, p));
        if (committed !== fresh) {
          fail(`dist/${p} is stale relative to src/. Run npm run build and commit dist/.`);
        }
      }
    }
  } finally {
    rmSync(tmpDist, { recursive: true, force: true });
  }
}

if (warnings.length) {
  for (const w of warnings) console.warn(`WARN  ${w}`);
}
if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`\nvalidate: ${errors.length} error(s)`);
  process.exit(1);
}
console.log('validate: ok');
