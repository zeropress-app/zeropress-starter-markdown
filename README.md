# ZeroPress Markdown Starter

Publish a Markdown documentation site with ZeroPress and the Docs theme.
Grouped navigation, search, page outlines, and previous/next links are included.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zeropress-app/zeropress-starter-markdown/tree/latest)

## Deploy

Use the button to create your repository and deploy it to Cloudflare Workers.
Keep the default commands: `npm run build` and `npm run deploy`.

Edit the files in `documents/` and push your changes to publish them.
After deployment, set `site.url` in `documents/.zeropress/config.json` to your
site's public URL to enable canonical URLs and the sitemap.

The sample disallows crawling by default. When your own content is ready for
search engines to crawl, set `site.robots.allow_indexing` to `true` in the same
configuration file.

## Write

- `documents/index.md` is the home page.
- Other Markdown files become pages. Start each page with a heading.
- Link to Markdown files with relative paths, such as `[Getting Started](getting-started.md)`.
  ZeroPress converts these to published page URLs.
- Use `public/` for files served directly, such as the included favicons.

The sample pages demonstrate frontmatter, nested routes, alerts, task lists,
tables, highlighted code, and Mermaid diagrams. Markdown source files and build
configuration are not published.

## Customize

Edit `documents/.zeropress/config.json` to set:

- `site`: title, description, language, public URL, and search.
- `menus.primary`: sidebar groups and nested links using published URLs.
- `menus.footer`: footer links.
- `collections`: previous/next reading order using Markdown source paths.

The public URL may stay empty until your first deployment. Search is enabled
by default. Local development uses ZeroPress search; production builds use Pagefind.

Edit `theme/assets/style.css` for styles and the HTML files in `theme/` for
layout. The included [navigation guide](documents/guides/navigation.md) and
[configuration reference](documents/guides/configuration.md) show working examples.

See [ZeroPress Build Pages](https://build-pages.zeropress.dev/)
for frontmatter and other configuration options.

## Local development

Use Node.js 22.22.0 or later; `.node-version` selects Node.js 24.

```sh
npm ci
npm run dev
```

The local preview rebuilds when you save files in `documents/`, `public/`, or
`theme/`. If a build fails, it keeps the last successful site while you fix the
source.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch files, rebuild, and serve locally |
| `npm run build` | Generate the site in `dist/` and replace its search with Pagefind |
| `npm run preview` | Build and preview the deployment output, including Pagefind |
| `npm run deploy` | Deploy the existing `dist/` |
| `npm run deploy:dry-run` | Build and validate deployment without uploading |
| `npm test` | Check page generation and local development |
| `npm run format:wrangler` | Format `wrangler.jsonc` |

Generated files in `dist/` and `.zeropress-build-pages/` are excluded from Git.

## Search

The Docs search dialog works with both ZeroPress's built-in search and
[Pagefind](https://pagefind.app/). `npm run dev` uses the built-in index for quick
rebuilds. `npm run build` and `npm run preview` use Pagefind.

After a successful site build, `postbuild` runs `search:replace-with-pagefind`
using the Pagefind version installed with the project. It writes the index to
`dist/_zeropress/pagefind/`, replaces `search.js` with the generated Pagefind
adapter, then removes the unused `search.json`. If indexing fails, the build
fails before the adapter is replaced. Pages are indexed from their content;
sidebar, navigation, and footer text are excluded.

Set `site.search` to `false` in `documents/.zeropress/config.json` to disable
search. Pagefind is then skipped. A site with no searchable pages retains an
empty built-in index rather than indexing unrelated HTML. Pagefind uses its own
ranking and language handling.

To keep built-in search in production, remove `postbuild` from `package.json`
and rebuild. You can also remove `search:replace-with-pagefind`, its script,
and the Pagefind dependency if you no longer use them.

## License

MIT
