#!/usr/bin/env node
/**
 * Deterministically generate dist/{cursor,claude,openai} from src/.
 * No symlinks. Real file copies only.
 */
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  lstatSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = process.env.ADN_PLUGIN_DIST
  ? join(ROOT, process.env.ADN_PLUGIN_DIST)
  : join(ROOT, 'dist');
const ASSETS = join(ROOT, 'assets');
const WRITE_MARKETPLACES = process.env.ADN_SKIP_MARKETPLACES !== '1';
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const shared = JSON.parse(readFileSync(join(SRC, 'listings', 'shared.json'), 'utf8'));

function loadListing(name) {
  const overlay = JSON.parse(readFileSync(join(SRC, 'listings', `${name}.json`), 'utf8'));
  const { extends: _e, ...rest } = overlay;
  return { ...shared, ...rest, version: pkg.version };
}

function emptyDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function writeJson(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`);
}

function copyText(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, readFileSync(from));
}

function pluginReadme(listing, platform) {
  return `# ${listing.displayName} plugin (${platform})

${listing.description}

## Security

- Server API Access keys must not appear in browser or mobile code.
- Client-side Player/Uploader keys only in documented scopes.
- Secrets from environment variables or the platform credential mechanism.
- Creating an upload session does not itself return the final upload URL for each track. Each track requires its own track-creation request.

## MCP

- Hosted (default): \`${listing.mcp.hostedUrl}\`
- Registry: \`${listing.mcp.registryName}\`
- Local stdio: \`npx -y @audiodn/mcp\` with \`ADN_API_KEY\`
- Knowledge/doc tools work without a key on the hosted server; live API tools need a Bearer API Access key.

## Canonical resources

- Docs: ${listing.canonical.docs}
- OpenAPI: ${listing.canonical.openapi}
- AI guide: ${listing.canonical.forAiAgents}

## License

MIT — see LICENSE.
`;
}

function mcpConfigHosted(listing) {
  return {
    mcpServers: {
      audiodn: {
        url: listing.mcp.hostedUrl,
      },
    },
  };
}

function buildCursor(listing) {
  const out = join(DIST, 'cursor');
  emptyDir(out);
  writeJson(join(out, '.cursor-plugin', 'plugin.json'), {
    name: listing.name,
    version: listing.version,
    description: listing.description,
    author: listing.author,
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
    logo: listing.logo,
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(join(SRC, 'commands'), join(out, 'commands'));
  copyDir(join(SRC, 'rules'), join(out, 'rules'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, 'mcp.json'), mcpConfigHosted(listing));
  writeFileSync(join(out, 'README.md'), pluginReadme(listing, 'Cursor'));
  copyText(join(ROOT, 'LICENSE'), join(out, 'LICENSE'));
}

function buildClaude(listing) {
  const out = join(DIST, 'claude');
  emptyDir(out);
  writeJson(join(out, '.claude-plugin', 'plugin.json'), {
    name: listing.name,
    version: listing.version,
    description: listing.description,
    author: listing.author,
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(join(SRC, 'commands'), join(out, 'commands'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, '.mcp.json'), mcpConfigHosted(listing));
  writeFileSync(join(out, 'README.md'), pluginReadme(listing, 'Claude Code'));
  copyText(join(ROOT, 'LICENSE'), join(out, 'LICENSE'));
}

function buildOpenai(listing) {
  const out = join(DIST, 'openai');
  emptyDir(out);
  writeJson(join(out, '.codex-plugin', 'plugin.json'), {
    name: listing.name,
    version: listing.version,
    description: listing.description,
    author: listing.author.name,
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
    skills: './skills/',
    mcpServers: './.mcp.json',
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, '.mcp.json'), mcpConfigHosted(listing));
  writeFileSync(join(out, 'README.md'), pluginReadme(listing, 'OpenAI / Codex'));
  copyText(join(ROOT, 'LICENSE'), join(out, 'LICENSE'));
}

function writeRootMarketplaces(listings) {
  writeJson(join(ROOT, '.cursor-plugin', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    owner: { name: 'AudioDN' },
    metadata: {
      description: 'AudioDN plugin for Cursor',
      version: pkg.version,
    },
    plugins: [
      {
        name: listings.cursor.name,
        source: 'dist/cursor',
        description: listings.cursor.description,
        version: listings.cursor.version,
        author: listings.cursor.author,
        homepage: listings.cursor.homepage,
        repository: listings.cursor.repository,
        license: listings.cursor.license,
        keywords: listings.cursor.keywords,
        logo: 'dist/cursor/assets/logo.png',
        category: listings.cursor.category,
      },
    ],
  });

  writeJson(join(ROOT, '.claude-plugin', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    owner: { name: 'AudioDN' },
    metadata: {
      description: 'AudioDN plugin for Claude Code',
      version: pkg.version,
    },
    plugins: [
      {
        name: listings.claude.name,
        source: './dist/claude',
        description: listings.claude.description,
        version: listings.claude.version,
      },
    ],
  });

  writeJson(join(ROOT, '.agents', 'plugins', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    interface: { displayName: 'AudioDN' },
    plugins: [
      {
        name: listings.openai.name,
        source: {
          source: 'local',
          path: './dist/openai',
        },
        policy: {
          installation: 'AVAILABLE',
          authentication: 'ON_INSTALL',
        },
        category: listings.openai.category || 'Developer Tools',
      },
    ],
  });
}

function assertNoSymlinksSync(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = lstatSync(full);
    if (st.isSymbolicLink()) {
      throw new Error(`Symlink not allowed in dist: ${relative(ROOT, full)}`);
    }
    if (st.isDirectory()) assertNoSymlinksSync(full);
  }
}

const listings = {
  cursor: loadListing('cursor'),
  claude: loadListing('claude'),
  openai: loadListing('openai'),
};

emptyDir(DIST);
buildCursor(listings.cursor);
buildClaude(listings.claude);
buildOpenai(listings.openai);
if (WRITE_MARKETPLACES) writeRootMarketplaces(listings);
assertNoSymlinksSync(DIST);

writeFileSync(
  join(DIST, 'BUILD_INFO.json'),
  `${JSON.stringify(
    {
      version: pkg.version,
      platforms: ['cursor', 'claude', 'openai'],
    },
    null,
    2,
  )}\n`,
);

console.log(`Built dist/cursor, dist/claude, dist/openai (v${pkg.version})`);
