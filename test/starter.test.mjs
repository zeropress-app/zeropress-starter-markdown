import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

const project = dirname(dirname(fileURLToPath(import.meta.url)));
const config = {
  version: '1.0',
  site: { title: 'Example site', url: 'https://site.example', locale: 'en-US', search: true },
  menus: {
    primary: {
      name: 'Documentation',
      items: [{
        title: 'Guides',
        url: '/guide/',
        children: [{
          title: 'Guide',
          url: '/guide/',
          children: [{ title: 'Details', url: '/guide/details' }],
        }],
      }],
    },
  },
  collections: { guides: { title: 'Guides', items: ['guide/index.md', 'guide/details.md'] } },
  markdown: { updated_at: 'none', link_output: 'clean' },
  front_page: { type: 'markdown', file: 'index.md' },
};
const home = '# Example home\n\n[Guide](guide/index.md)\n\n[Download](../public/example.txt)\n';

async function fixture(t, beforeCleanup = async () => {}) {
  const root = await mkdtemp(join(tmpdir(), 'zeropress-markdown-test-'));
  t.after(async () => {
    await beforeCleanup();
    await rm(root, { recursive: true, force: true });
  });
  for (const path of ['package.json', 'scripts', 'theme', 'wrangler.jsonc']) {
    await cp(join(project, path), join(root, path), { recursive: true });
  }
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'junction');
  await mkdir(join(root, 'documents/.zeropress'), { recursive: true });
  await mkdir(join(root, 'documents/guide'), { recursive: true });
  await mkdir(join(root, 'public'));
  await writeFile(join(root, 'documents/.zeropress/config.json'), JSON.stringify(config));
  await writeFile(join(root, 'documents/index.md'), home);
  await writeFile(join(root, 'documents/guide/index.md'), '# Guide\n\n## First steps\n\n[Details](details.md)\n\n## Configuration\n\nChoose your settings.\n');
  await writeFile(join(root, 'documents/guide/details.md'), '# Details\n\nA sample page.\n');
  await writeFile(join(root, 'public/example.txt'), 'Example download\n');
  return root;
}

function command(root, args) {
  const child = spawn(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      CI: 'true',
      NO_COLOR: '1',
      WRANGLER_SEND_METRICS: 'false',
      WRANGLER_LOG_PATH: join(root, '.wrangler/logs'),
      CLOUDFLARE_API_TOKEN: '',
      CLOUDFLARE_ACCOUNT_ID: '',
    },
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const done = once(child, 'close').then(([code]) => ({ code, output }));
  return { child, done, output: () => output };
}

async function build(root) {
  return command(root, ['run', 'build']).done;
}

async function waitFor(check, message, diagnostics = () => '', timeout = 20_000) {
  const deadline = Date.now() + timeout;
  do {
    if (await check()) return;
    await delay(100);
  } while (Date.now() < deadline);
  assert.fail(message + '\n' + diagnostics());
}

async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function stop(running) {
  const { child, done } = running;
  if (child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === 'win32') child.kill('SIGTERM');
    else process.kill(-child.pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
  await done;
}

test('builds clean page links and public assets while keeping source private', async (t) => {
  const root = await fixture(t);
  const result = await build(root);
  assert.equal(result.code, 0, result.output);
  const html = await readFile(join(root, 'dist/index.html'), 'utf8');
  assert.match(html, /Example home/);
  assert.match(html, /href="\/guide\/"/);
  assert.match(html, /href="\/example.txt"/);
  assert.match(html, /rel="canonical" href="https:\/\/site.example\/"/);
  const guide = await readFile(join(root, 'dist/guide/index.html'), 'utf8');
  assert.match(guide, /href="\/guide\/details"/);
  assert.match(guide, /<a\b(?=[^>]*href="\/guide\/")(?=[^>]*aria-current="page")[^>]*>/);
  assert.match(guide, /href="#first-steps" data-toc-link/);
  assert.match(guide, /class="pager__next" href="\/guide\/details"/);
  assert.match(html, /aria-label="Search docs"/);
  const adapter = await readFile(join(root, 'dist/_zeropress/search.js'), 'utf8');
  assert.equal(adapter, await readFile(join(root, 'dist/_zeropress/search_pagefind.js'), 'utf8'));
  await readFile(join(root, 'dist/_zeropress/pagefind/pagefind.js'));
  await assert.rejects(readFile(join(root, 'dist/_zeropress/search.json')), { code: 'ENOENT' });
  assert.match(await readFile(join(root, 'dist/sitemap.xml'), 'utf8'), /https:\/\/site.example\/guide\//);
  assert.equal(await readFile(join(root, 'dist/example.txt'), 'utf8'), 'Example download\n');
  assert.equal(await readFile(join(root, 'documents/index.md'), 'utf8'), home);
  const output = await readdir(join(root, 'dist'), { recursive: true });
  assert.equal(output.some((path) => path.endsWith('.md') || path.includes('.zeropress')), false);
});

test('keeps the last successful site on errors and removes deleted pages after a successful rebuild', async (t) => {
  const root = await fixture(t);
  assert.equal((await build(root)).code, 0);
  const previous = await readFile(join(root, 'dist/index.html'), 'utf8');
  await writeFile(join(root, 'documents/.zeropress/config.json'), '{');
  const failed = await build(root);
  assert.notEqual(failed.code, 0, failed.output);
  assert.equal(await readFile(join(root, 'dist/index.html'), 'utf8'), previous);
  const invalidStartup = await command(root, ['run', 'dev']).done;
  assert.notEqual(invalidStartup.code, 0, invalidStartup.output);
  await writeFile(join(root, 'documents/.zeropress/config.json'), JSON.stringify({ ...config, menus: {}, collections: {} }));
  await rm(join(root, 'documents/guide/details.md'));
  await writeFile(join(root, 'documents/guide/index.md'), '# Guide\n\nUpdated guide.\n');
  const rebuilt = await build(root);
  assert.equal(rebuilt.code, 0, rebuilt.output);
  assert.match(await readFile(join(root, 'dist/guide/index.html'), 'utf8'), /Updated guide/);
  assert.equal((await readdir(join(root, 'dist/guide'))).includes('details.html'), false);
});

test('serves local routes, watches source changes, and recovers from build errors', { timeout: 60_000 }, async (t) => {
  let dev;
  const root = await fixture(t, () => dev && stop(dev));
  const port = await freePort();
  dev = command(root, ['run', 'dev', '--', '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0']);
  const origin = 'http://127.0.0.1:' + port;
  async function response(path) {
    try {
      const result = await fetch(origin + path, { signal: AbortSignal.timeout(1_000) });
      return { status: result.status, body: await result.text() };
    } catch {
      return { status: 0, body: '' };
    }
  }
  async function contains(path, text) {
    assert.equal(dev.child.exitCode, null, dev.output());
    const result = await response(path);
    return result.status === 200 && result.body.includes(text);
  }
  await waitFor(() => contains('/', 'Example home'), 'Local preview did not start.', dev.output);
  assert.equal((await response('/guide/')).status, 200);
  const nativeSearch = await response('/_zeropress/search.json');
  assert.equal(nativeSearch.status, 200);
  assert.match(nativeSearch.body, /Choose your settings/);
  assert.match((await response('/_zeropress/search.js')).body, /search\.json/);
  assert.equal((await response('/guide/details')).status, 200);
  const missing = await response('/missing-page');
  assert.equal(missing.status, 404);
  assert.match(missing.body, /Page not found/i);
  assert.equal((await response('/index.md')).status, 404);
  assert.equal((await response('/.zeropress/config.json')).status, 404);

  await writeFile(join(root, 'documents/guide/details.md'), '# Changed details\n');
  await waitFor(() => contains('/guide/details', 'Changed details'), 'Markdown did not rebuild.', dev.output);
  await writeFile(join(root, 'public/example.txt'), 'Changed download\n');
  await waitFor(() => contains('/example.txt', 'Changed download'), 'Public assets did not rebuild.', dev.output);
  const template = await readFile(join(root, 'theme/page.html'), 'utf8');
  await writeFile(join(root, 'theme/page.html'), template + '\n<p>Changed theme</p>\n');
  await waitFor(() => contains('/', 'Changed theme'), 'Theme changes did not rebuild.', dev.output);

  await writeFile(join(root, 'documents/.zeropress/config.json'), '{');
  await waitFor(() => dev.output().includes('The preview keeps the last successful build.'), 'Build error was not reported.', dev.output);
  assert.equal(await contains('/', 'Changed theme'), true);
  await writeFile(join(root, 'documents/.zeropress/config.json'), JSON.stringify({ ...config, site: { ...config.site, title: 'Recovered site' } }));
  await waitFor(() => contains('/', 'Recovered site'), 'Preview did not recover after fixing configuration.', dev.output);
  await stop(dev);
  await waitFor(async () => (await response('/')).status === 0, 'Local preview did not stop.', dev.output);
});


test('builds successfully when search is disabled in the Markdown configuration', async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, 'documents/.zeropress/config.json'), JSON.stringify({ ...config, site: { ...config.site, search: false } }));
  const result = await build(root);
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /Search is disabled; skipping replacement/);
  assert.match(await readFile(join(root, 'dist/guide/index.html'), 'utf8'), /Choose your settings/);
});
