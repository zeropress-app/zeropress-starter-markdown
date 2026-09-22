# Markdown

Write pages as ordinary Markdown files. A heading and a paragraph are enough to
get started.

## Titles and frontmatter

The first H1 becomes the page title. Use frontmatter when you want a separate
title or description:

```md
---
title: Installation
description: Install the package and run your first command.
---

# Install the Package

Start with the prerequisites.
```

The description is used in page metadata and search results.

## Source-relative links

Link to another Markdown file using its source path:

```md
[Markdown Examples](../markdown-examples/index.md)
[Getting Started](../getting-started.md)
```

Try [Markdown Examples](../markdown-examples/index.md) or
[Getting Started](../getting-started.md). Build Pages rewrites these links to
the published page URLs.

You can link to a section too:

```md
[Tables](../markdown-examples/index.md#tables)
```

Open the [table examples](../markdown-examples/index.md#tables).

## Page routes

| Source file | Published URL |
| --- | --- |
| `index.md` | `/` |
| `getting-started.md` | `/getting-started` |
| `guides/markdown.md` | `/guides/markdown` |
| `markdown-examples/index.md` | `/markdown-examples/` |

Use a directory's `index.md` when that directory should have its own page.

## Drafts

Set a page to draft while it is being written:

```yaml
---
status: draft
---
```

Draft pages are excluded from the generated site. Change the status to
`published`, or remove it, when the page is ready.

## Sections and formatting

Use H2 and H3 headings to divide longer pages. Docs adds those headings to the
page's table of contents.

The [examples page](../markdown-examples/index.md) shows lists, alerts, tables,
code highlighting, and Mermaid diagrams.
