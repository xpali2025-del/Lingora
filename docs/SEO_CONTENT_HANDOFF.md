# SEO content and keyword draft handoff

## What is included

- 26 JSON records: 15 Arabic and 11 English, including 14 core route drafts (seven per language) and 12 country-market research records.
- 14 current static routes (seven Arabic and seven English): `/about/` and `/en/about/` are indexable by owner request; the other 12 routes remain `noindex,nofollow` drafts. The 12 market records are `research-only` and excluded from static output until they have distinct, sourced local value.
- Shared `/payment-methods/` and `/en/payment-methods/` pages with owner-supplied Yemen/Gulf details and international USDT/BEP20 guidance; payment details remain draft and are not independently verified.
- Per-page search-intent assignments, unique active primary-keyword ownership, qualitative short-tail/long-tail clusters, draft copy, FAQs, and publication blockers.
- A central source record for Duolingo Super feature facts (`content/product-facts.json`), rendered on both Plans pages with a link to the official source. Owner-confirmed offer copy now distinguishes individual and Family Super, states that Family is not discounted, and clarifies that Lingora does not offer Max; these sales claims are not independently verified.
- A content schema, CMS fields, shared renderer, intent/keyword/FAQ/similarity checks, and static route/canonical checks.
- CSV-only Search Console reporting and the workbook `docs/Lingora_SEO_Content_Draft.xlsx`.

## Fixes applied for repetition and doorway risk

The 12 country-market pages repeated generic buyer checks and lacked sourced local details. They are retained as research records, but their routes are not generated. They must not be restored by changing only a country name or flipping a status field. The quality gate rejects serving market hubs without unique, sourced local evidence.

The home pages own branded/navigation intent; Subscription/Plans own 12-month offer investigation; the new payment-methods pages own payment/checkout information; About owns Lingora’s purpose, vision, offer scope, and public contacts; privacy/refund/disclaimer retain separate policy tasks. The gate checks exact keyword ownership, high token overlap between primaries, title/description/FAQ uniqueness, five-word shingle similarity, and non-primary keyword density.

## Draft and research status

Only the two About routes are indexable at the owner’s request; the other 12 served routes remain `noindex,nofollow`. Google may still choose whether to index eligible pages. Keyword volume/difficulty and Search Console values remain blank because no exports were supplied. The missing Architecture Plan and Keywords Workbook still prevent verification of the original keyword metrics and some owner decisions. Search Console handling is CSV-only; no export was supplied.

Several route records remain below their project editorial word ranges. The checker reports this transparently; it does not recommend padding. The target ranges are editorial specifications, not a Google ranking formula. The owner expanded both About pages to include mission, vision, reasons to choose Lingora, phone `+966554751363`, and `info@lingora.com` / `sales@lingora.com`; these pages are indexable by owner request, but Google indexing is not guaranteed. Privacy/refund/disclaimer pages need actual data-flow/operational terms and approved legal wording. The two payment pages include owner-supplied methods but remain drafts until receiving capability, complete BEP20 destination, and any backend integration are verified.

## Search intent and workflow

See `docs/SEO_INTENT_RESEARCH_PLAN.md` for the route ownership map, market merge decision, source notes and remaining inputs. The workbook's `Owner Inputs` sheet is a fill-in list of the operational, legal, local-market and research evidence needed to finish the blocked pages. Proposed keywords are qualitative seeds only.

1. Validate candidate terms with dated keyword-tool exports by language and target market. Keep provider and methodology with each figure.
2. Add Search Console `queries.csv`, `pages.csv`, and preferably `query-page.csv` under `data/search-console/`; run `npm run seo:gsc`. The importer does not connect to an account or automatically assign a page owner.
3. Run `npm run seo:check` after every content or keyword change. Research-only market records stay out of routes until their unique-local-evidence blockers are resolved.
4. Before publication, resolve actual operator/reseller authority, inventory and redemption process, price/payment/fulfilment/refund terms, privacy data flows, and legal wording. The two About routes are indexable at the owner's request; delivery of their contact channels remains untested, and search-engine inclusion is not guaranteed.
5. Run `npm run check:all` before release.

## Verification completed for this revision

- `npm run seo:check`: passed for 26 records: 14 draft routes served (2 indexable About and 12 noindex), 12 market records withheld, 14 unique active intents, and 36 unique FAQs. Word-range shortfalls remain reported for legacy pages.
- `npm run test:unit`: 7 tests passed.
- `npm run test:e2e`: 10 browser tests passed, including payment methods, owner-confirmed offer wording, About mission/contact content and indexing, cross-locale navigation, and descriptive image alt text. `npm run test:static` verifies research-only country URLs return 404 in the production export.
- `npm run build`, `npm run test:static`, and `npm run size`: passed; 14 content routes exported and metadata/canonical/language/direction, route-specific robots, sitemap, and image-alt checks passed.
- `npm audit --omit=dev`: 0 vulnerabilities.
