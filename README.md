# Lingora

Static bilingual foundation for Lingora, built with Next.js App Router and TypeScript. Arabic is served at `/` (RTL); English at `/en/` (LTR). Public pages are statically exported for Cloudflare Pages.

## Development

- Node.js 20.9 or newer
- `npm ci`
- `npm run dev` for the development server
- `npm run test:e2e` for browser tests against both locale roots
- `npm run check:all` for the complete local verification suite
- `npm run build` to create the production export
- `npm run preview` to serve the built export locally

`npm run build` creates a static `out/` export, removes unnecessary Next.js runtime scripts from non-interactive public content pages, and generates Cloudflare security headers. Content routes remain usable through native links with JavaScript disabled. The build also prepares a gzip size-limit input from the scripts actually referenced by content pages. Deploy the contents of `out/` to Cloudflare Pages.

## SEO draft content

The SEO set contains 26 records; 14 core routes (seven per language) are exported. The Arabic and English About pages are indexable at the owner’s request; the other 12 served routes remain `noindex,nofollow` drafts, including the payment-method pages. The 12 country-market records remain `research-only` and excluded from public routes until each has distinct, source-backed local value. The payment-page bank and wallet details are owner-supplied and unverified; the BEP20 address was incomplete, and the API credential supplied in chat is not stored in this static project. Revoke/rotate it before any future server-side integration. Search volume, difficulty, and Search Console metrics remain unverified. See `docs/SEO_COMPLETION_REPORT.md`, `docs/SEO_CONTENT_HANDOFF.md`, `docs/SEO_INTENT_RESEARCH_PLAN.md`, `docs/KEYWORD_RESEARCH_WORKFLOW.md`, and `docs/Lingora_SEO_Content_Draft.xlsx`. Run `npm run seo:check` for intent ownership, keyword density, cannibalization, metadata, FAQ, and near-duplicate checks. Place real Search Console CSV exports in `data/search-console/` and run `npm run seo:gsc` to generate an import review.

## CMS and deployment notes

Decap CMS is configured in `public/admin/`. Before enabling it, replace the sample GitHub repository and configure an OAuth endpoint. Enable GitHub branch protection so Decap editorial workflow changes create pull requests and cannot bypass required CI. No production credentials belong in this repository.

OD-01 is deferred; do not launch commerce until reseller rights and redeem-link conditions are verified. Other deferred decisions and defaults are tracked in `specs/OPEN_DECISIONS.md`.
