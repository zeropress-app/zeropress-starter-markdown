# Getting Started

The starter includes a small documentation site so you can write and preview
pages immediately.

## Preview locally

Install the dependencies and start the local server:

```sh
npm ci
npm run dev
```

Open the address printed by Wrangler. Saving a file in `documents/`, `public/`,
or `theme/` rebuilds the site and reloads the preview.

## Add a page

Create `documents/guides/first-page.md`:

```md
# My First Page

A short introduction to the topic.

## Try it

Explain the first step here.
```

The page will be available at `/guides/first-page`.

Link to it from another Markdown file, or add it to the sidebar in
`documents/.zeropress/config.json`. See [Navigation](guides/navigation.md)
for menu and reading-order examples.

## Project layout

```txt
documents/
  index.md
  getting-started.md
  guides/
    markdown.md
    navigation.md
    configuration.md
  markdown-examples/
    index.md
  .zeropress/
    config.json
public/
  favicon.svg
theme/
  assets/
  partials/
  page.html
wrangler.jsonc
```

Markdown files are page sources. The `public/` directory holds files served
directly, and `theme/` contains the editable Docs theme.

## Publish changes

Push your changes to the repository connected to Cloudflare Workers.
The default build command is `npm run build`, followed by `npm run deploy`.

After the first deployment, set `site.url` in the site configuration to your
public URL. This enables canonical URLs and the sitemap. When your own content
is ready for search engines to crawl, set `site.robots.allow_indexing` to `true`
in the same configuration file.

For a local deployment check:

```sh
npm run deploy:dry-run
```

> [!NOTE]
> The dry run builds and validates the site without uploading it.

## Continue writing

Open [Markdown](guides/markdown.md) for page titles, frontmatter, and source links.
