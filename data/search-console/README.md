# Search Console CSV input

No Search Console account is connected here. If you want an evidence-based query map, export CSVs from Search Console → Performance → Search results (Web, up to the last 16 months) and place them here as:

- `queries.csv` — query, clicks, impressions, CTR, position.
- `pages.csv` — page URL, clicks, impressions, CTR, position.
- Optional `query-page.csv` — query and page in the same row if available from a trusted export.

Keep original headers and do not include credentials or personal data. Then run `npm run seo:gsc`; it creates `reports/search-console/summary.md` for review. No keyword ownership or page copy is changed automatically.
