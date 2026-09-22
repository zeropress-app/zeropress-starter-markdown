# Configuration

Site settings live in `documents/.zeropress/config.json`.

## Site identity

Set the title, description, language, and public URL:

```json
{
  "version": "1.0",
  "site": {
    "title": "My Docs",
    "description": "Documentation written in Markdown.",
    "url": "https://docs.example.com",
    "locale": "en-US",
    "search": true
  }
}
```

The starter leaves `site.url` empty so it can be deployed before you choose a
domain. Set it to your site's public URL after deployment to enable canonical
URLs and the sitemap.

## Search

This starter enables ZeroPress's built-in static search with
`"search": true`. Readers can search page titles, headings, and content using
the header button or **Command+K / Ctrl+K**.

Search files are generated with the site. No search service or API token is
needed.

## Home page

The home page comes from `documents/index.md`:

```json
{
  "front_page": {
    "type": "markdown",
    "file": "index.md"
  }
}
```

## Update dates

The default `markdown.updated_at` value is `"none"`.
To show a date on a particular page, add an explicit date to its frontmatter:

```yaml
---
updated_at: "2026-09-22T00:00:00Z"
---
```

The [Markdown Examples](../markdown-examples/index.md) page uses this setting.
The displayed date follows the reader's locale.

You can use `"git"` instead to take dates from each file's latest commit.
That option requires the relevant Git history to be available during the build.

## Theme files

The editable Docs theme is included in `theme/`.

| File | Purpose |
| --- | --- |
| `assets/style.css` | Typography, spacing, and colors |
| `assets/theme.js` | Search, navigation, and other browser interactions |
| `page.html` | Document layout and previous/next links |
| `partials/sidebar.html` | Sidebar groups and page links |
| `partials/header.html` | Site title, search, and theme toggle |
| `partials/footer.html` | Footer links and attribution |

## Navigation settings

See [Navigation](navigation.md) for `menus` and `collections`.
For the full configuration reference, visit the
[Build Pages documentation](https://build-pages.zeropress.dev/reference/config/).
