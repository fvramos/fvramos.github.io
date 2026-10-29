# Fernando Ramos — Academic Website

The site is published from `docs/` with GitHub Pages. Website content lives in editable JSON files under `docs/data/`; the HTML pages provide the shared layout, and `docs/site-data.js` renders the JSON records.

## Update content

Edit the relevant JSON file, commit the change to `master`, and GitHub Pages will publish it automatically.

| Content | File |
| --- | --- |
| Homepage profile and introduction | [`docs/data/home/about.json`](docs/data/home/about.json) |
| Homepage news preview | [`docs/data/home/news.json`](docs/data/home/news.json) |
| PhD and MSc students | [`docs/data/home/lab.json`](docs/data/home/lab.json) |
| Recent alumni preview | [`docs/data/home/recent-alumni.json`](docs/data/home/recent-alumni.json) |
| Homepage teaching, highlights, community, contact, biography | The matching files in `docs/data/home/` |
| All news items | [`docs/data/news.json`](docs/data/news.json) |
| Publications | [`docs/data/publications.json`](docs/data/publications.json) |
| Projects | [`docs/data/projects.json`](docs/data/projects.json) |
| Alumni, by degree and year | [`docs/data/alumni.json`](docs/data/alumni.json) |
| Teaching history | [`docs/data/teaching.json`](docs/data/teaching.json) |
| Community service | [`docs/data/community.json`](docs/data/community.json) |
| Awards and talks | [`docs/data/awards-talks.json`](docs/data/awards-talks.json) |
| Cache Explorer labels, controls, and guide | [`docs/data/cache-explorer.json`](docs/data/cache-explorer.json) |

Page titles and introductions for content pages are in `docs/data/pages/`. The record files above hold the actual lists and details.

## Add a news item

Add an object to the `items` array in `docs/data/news.json`. Each item uses plain fields; links are represented as text and URL pairs, not HTML:

```json
{
  "date": "2026-11-01",
  "date_label": "1 November 2026",
  "title": "A news headline",
  "body": [
    { "text": "A short update with " },
    { "text": "a useful link", "url": "https://example.org/" }
  ],
  "image": "assets/example.png",
  "image_alt": "Describe the image"
}
```

Images are optional. To remove a news item, remove its object from the array.

## Add a publication

Add an object to the `items` array in `docs/data/publications.json`:

```json
{
  "title": "Paper title",
  "authors": ["First Author", "Second Author"],
  "venue": "Conference or journal",
  "year": 2026,
  "url": "https://doi.org/..."
}
```

The publications page groups and sorts records by year. Other collections follow the same pattern: edit or remove the relevant record, keeping the JSON syntax valid. There is no HTML to write inside content JSON.
