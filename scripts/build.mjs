#!/usr/bin/env node
/**
 * Deterministically generate dist/{cursor,claude,openai} from src/.
 * No symlinks. Real file copies only.
 *
 * Platform MCP notes (verified against current docs):
 * - Cursor: remote entries use `url` (optional headers); no type required.
 * - Claude: remote entries MUST include `"type": "http"` (or streamable-http).
 * - OpenAI/Codex: `.mcp.json` is a direct server map or `{ mcp_servers: ... }`.
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
  const authNote =
    `- Hosted MCP: connect \`https://mcp.audiodelivery.net/mcp\` and sign in with your AudioDN account via OAuth (no pasted API key).`
    + `\n- Local stdio alternative: \`ADN_API_KEY\` with \`npx @audiodn/mcp\`.`;

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
${authNote}

## Canonical resources

- Docs: ${listing.canonical.docs}
- OpenAPI: ${listing.canonical.openapi}
- AI guide: ${listing.canonical.forAiAgents}

## License

MIT — see LICENSE.
`;
}

/** Cursor remote MCP — url only; OAuth account login (no pasted API key). */
function mcpConfigCursor(listing) {
  return {
    mcpServers: {
      audiodn: {
        url: listing.mcp.hostedUrl,
      },
    },
  };
}

/**
 * Claude remote MCP — type is required.
 * Without type, Claude treats the entry as stdio and skips it.
 */
function mcpConfigClaude(listing) {
  return {
    mcpServers: {
      audiodn: {
        type: 'http',
        url: listing.mcp.hostedUrl,
      },
    },
  };
}

/**
 * OpenAI/Codex — direct server map (not mcpServers wrapper).
 * Portal submission still uses the hosted URL separately for the app/MCP review.
 */
function mcpConfigOpenai(listing) {
  return {
    audiodn: {
      url: listing.mcp.hostedUrl,
    },
  };
}

function buildCursor(listing) {
  const out = join(DIST, 'cursor');
  emptyDir(out);
  writeJson(join(out, '.cursor-plugin', 'plugin.json'), {
    name: listing.name,
    displayName: listing.displayName,
    version: listing.version,
    description: listing.description,
    author: listing.author,
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
    logo: listing.logo,
    primaryColor: listing.primaryColor || listing.brandColor,
    variables: listing.pluginVariables,
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(join(SRC, 'commands'), join(out, 'commands'));
  copyDir(join(SRC, 'rules'), join(out, 'rules'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, 'mcp.json'), mcpConfigCursor(listing));
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
    displayName: listing.displayName,
    author: listing.author,
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
    logo: listing.logo,
    // External MCP — install disabled until user opts in (Claude Code >= 2.1.154)
    defaultEnabled: false,
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(join(SRC, 'commands'), join(out, 'commands'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, '.mcp.json'), mcpConfigClaude(listing));
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
    author: {
      name: listing.author.name,
      url: listing.author.url,
    },
    homepage: listing.homepage,
    repository: listing.repository,
    license: listing.license,
    keywords: listing.keywords,
    skills: './skills/',
    mcpServers: './.mcp.json',
    interface: {
      displayName: listing.displayName,
      shortDescription: listing.shortDescription,
      longDescription: listing.longDescription,
      developerName: listing.author.name,
      category: listing.category || 'Developer Tools',
      capabilities: ['Read', 'Write'],
      websiteURL: listing.canonical.website,
      privacyPolicyURL: listing.canonical.privacy,
      termsOfServiceURL: listing.canonical.terms,
      defaultPrompt: listing.defaultPrompts,
      brandColor: listing.brandColor,
      logo: `./${listing.logoSquare || 'assets/logo-square.png'}`,
      composerIcon: `./${listing.logoSquare || 'assets/logo-square.png'}`,
    },
  });
  copyDir(join(SRC, 'skills', 'audiodn'), join(out, 'skills', 'audiodn'));
  copyDir(ASSETS, join(out, 'assets'));
  writeJson(join(out, '.mcp.json'), mcpConfigOpenai(listing));
  writeFileSync(join(out, 'README.md'), pluginReadme(listing, 'OpenAI / Codex'));
  copyText(join(ROOT, 'LICENSE'), join(out, 'LICENSE'));
}

function writeRootMarketplaces(listings) {
  writeJson(join(ROOT, '.cursor-plugin', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    owner: { name: listings.cursor.displayName },
    metadata: {
      description: `${listings.cursor.displayName} plugin for Cursor`,
      version: pkg.version,
    },
    plugins: [
      {
        name: listings.cursor.name,
        displayName: listings.cursor.displayName,
        source: 'dist/cursor',
        description: listings.cursor.description,
        version: listings.cursor.version,
        author: listings.cursor.author,
        homepage: listings.cursor.homepage,
        repository: listings.cursor.repository,
        license: listings.cursor.license,
        keywords: listings.cursor.keywords,
        logo: `dist/cursor/${listings.cursor.logo}`,
        category: listings.cursor.category,
      },
    ],
  });

  writeJson(join(ROOT, '.claude-plugin', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    owner: { name: listings.claude.displayName },
    metadata: {
      description: `${listings.claude.displayName} plugin for Claude Code`,
      version: pkg.version,
    },
    plugins: [
      {
        name: listings.claude.name,
        source: './dist/claude',
        description: listings.claude.description,
        version: listings.claude.version,
        displayName: listings.claude.displayName,
        author: listings.claude.author,
        homepage: listings.claude.homepage,
        repository: listings.claude.repository,
        license: listings.claude.license,
        keywords: listings.claude.keywords,
        category: 'development',
        tags: listings.claude.keywords,
        defaultEnabled: false,
      },
    ],
  });

  writeJson(join(ROOT, '.agents', 'plugins', 'marketplace.json'), {
    name: 'audiodn-ai-plugin',
    interface: { displayName: listings.openai.displayName },
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
