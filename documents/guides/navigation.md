# Navigation

The sidebar, page outline, and previous/next links help readers move through the
documentation.

## Sidebar groups

Edit `menus.primary` in `documents/.zeropress/config.json`.
Top-level entries with children become collapsible groups:

```json
{
  "menus": {
    "primary": {
      "name": "Documentation",
      "items": [
        {
          "title": "GET STARTED",
          "url": "/",
          "meta": { "accent": "blue" },
          "children": [
            { "title": "Overview", "url": "/" },
            { "title": "Getting Started", "url": "/getting-started" }
          ]
        }
      ]
    }
  }
}
```

Use published URLs in menus. Markdown body links use source paths instead.

## Nested pages

A sidebar page can have one more level of child links. This site's **Markdown**
entry contains **Markdown Examples**:

```json
{
  "title": "Markdown",
  "url": "/guides/markdown",
  "children": [
    { "title": "Markdown Examples", "url": "/markdown-examples/" }
  ]
}
```

Docs highlights the current page. On smaller screens, open the navigation menu
from the header.

## Reading order

Collections define the previous/next links at the bottom of a page.
Their items use paths relative to `documents/`:

```json
{
  "collections": {
    "guides": {
      "title": "Guides",
      "items": [
        "guides/markdown.md",
        "markdown-examples/index.md",
        "guides/navigation.md"
      ]
    }
  }
}
```

The last page in a collection does not continue into another group.

## Page outline

Headings in a document become **On this page** links. Keep headings descriptive
so readers can scan the outline before reading the whole page.

## Footer links

Use `menus.footer` for links outside the main reading flow. This starter includes
[About](../about.md) and the Build Pages documentation in its footer.
