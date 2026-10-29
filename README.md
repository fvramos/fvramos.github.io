# Fernando Ramos — Academic Website

The live website is published from [`docs/`](docs/) using GitHub Pages.

## Updating site content

All content pages load their editable content from JSON files. News, publications, and projects use structured records; the remaining page sections use an `html` field so you can edit the content without changing the HTML page:

- **News:** [`docs/data/news.json`](docs/data/news.json). The homepage shows the five newest entries; [All news](https://fvramos.github.io/news.html) shows every entry.
- **Projects:** [`docs/data/projects.json`](docs/data/projects.json). Add or remove project records; the Projects page renders the lists from this file.
- **Publications:** [`docs/publications.json`](docs/publications.json). Add or remove a publication object; the page groups entries by year automatically.

After committing changes to `master`, GitHub Pages republishes the site. News records use `date`, `date_label`, `title`, and `body_html`; optional fields are `image`, `image_alt`, `image_class`, `image_link`, `width`, `height`, or `icon: "reading"`. Publication records use `title`, `authors`, `venue`, `year`, and `url`.

Homepage sections: `docs/data/home/{about,news,lab,recent-alumni,teaching,highlights,service,contact,biography}.json`. Other content pages: `docs/data/pages/{news,papers,projects,alumni,teaching,community,awards-talks,cache-explorer}.json`. Change the `html` value in a page JSON to edit that page’s content. Keep the JSON valid, including escaping quotation marks inside HTML. The Cache Explorer’s interface content is also stored in its page JSON; its simulator code remains separate.

The site is static; no Jekyll or Node build step is required.
