# Fernando Ramos — Academic Website

The live website is published from [`docs/`](docs/) using GitHub Pages.

## Updating site content

Recurring content is read from data files, so edit the data instead of duplicated page markup:

- **News:** [`docs/data/news.json`](docs/data/news.json). The homepage shows the five newest entries; [All news](https://fvramos.github.io/news.html) shows every entry.
- **Publications:** [`docs/publications.json`](docs/publications.json). Add or remove a publication object; the page groups entries by year automatically.

After committing changes to `master`, GitHub Pages republishes the site. News records use `date`, `date_label`, `title`, and `body_html`; optional fields are `image`, `image_alt`, `image_class`, `image_link`, `width`, `height`, or `icon: "reading"`. Publication records use `title`, `authors`, `venue`, `year`, and `url`.

The site is static; no Jekyll or Node build step is required.
