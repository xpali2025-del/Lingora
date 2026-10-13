# Keyword, Search Console, and content review workflow

Status: **Working draft.** Keyword phrases in `content/{ar,en}/*.json` are explicitly proposed seeds based on the project brief. They are not measured volumes, difficulty scores, or confirmed Search Console queries.

## Tools and what each one can prove

- **Google Keyword Planner:** use for estimated monthly-search ranges and advertiser competition after selecting country, language, and date range. Advertiser competition is not organic SEO difficulty. Export the keyword table as CSV and retain the account's targeting settings.
- **Google Trends:** use for relative interest and seasonality comparisons. Trends is an index, not absolute monthly search volume.
- **Google Search Console:** use after the domain property is verified and has data. Export the Search results report for the last 16 months, Web search type, with Queries and Pages as separate exports. Include clicks, impressions, CTR, and average position. A query-to-page export is preferred where available; separate query and page totals do not establish ownership by themselves.
- **Optional paid tools:** Ahrefs or Semrush may add an estimated volume/difficulty column, but label the provider and export date. Do not mix metrics from different providers as if they were one dataset.

This workspace has no direct Search Console or Keyword Planner account connection. Put user-exported files in `data/search-console/` and `data/keywords/`; never place credentials, tokens, or account secrets in the repository. Run `npm run seo:gsc` to create a review report from the CSVs. The import is advisory and does not automatically rewrite page ownership or copy.

## Editorial rules

1. Keep one primary query intent and one owner page per locale. Record short-tail and long-tail variants separately.
2. Keep `volume`, `difficulty`, and Search Console metrics `null` until an exported source supplies them. Record tool/provider and date when importing a measured value.
3. Do not invent Duolingo product features, local payment methods, prices, legal claims, or resale authorization.
4. Country hubs remain `TO RESEARCH` until they contain verified, genuinely local information; do not publish doorway copy.
5. Policy pages remain `LEGAL-REVIEW-REQUIRED` until approved source wording and counsel review are available.
6. Run `npm run seo:check` after content changes. The gate checks titles, descriptions, primary-keyword placement, exact primary ownership, FAQ uniqueness, and five-word-shingle similarity. Word-count shortfalls are reported as drafts; never pad with repeated or generic text.
7. All blocked routes stay `noindex,nofollow` until evidence and approval are complete. The two About pages are the sole owner-approved indexable exception; the sitemap lists only those pages.
