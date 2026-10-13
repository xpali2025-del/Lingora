# P1 Foundation Evidence

Status: **P1 implementation complete; awaiting GATE-1 approval.**

## Delivered

- Next.js 16.4.0 App Router + TypeScript; `output: 'export'`, `trailingSlash: true`.
- Separate root layouts: Arabic `/` (`lang="ar"`, `dir="rtl"`) and English `/en/` (`lang="en"`, `dir="ltr"`).
- Self-hosted Inter and IBM Plex Sans Arabic fonts; track-specific CSS-variable token files; logical CSS properties only.
- Reusable components: Container, ButtonLink, header, footer, skip link, and native market switcher.
- Decap CMS admin shell with GitHub backend/editorial workflow configuration. Repository and OAuth endpoint remain placeholders.
- Cloudflare `_headers` generated for the static export; strict CSP, script hashes where required, HSTS, nosniff, Referrer-Policy, and Permissions-Policy. The admin route gets a separate CDN allowance; public-page policy does not.
- GitHub Actions CI and manual Cloudflare Pages deployment workflows; static preview server; traceability, logical-CSS, export, and size-budget checks.
- Content pages export with no JavaScript requirement; native links preserve route navigation.

## Red → Green evidence

1. Locale/browser smoke tests were written before implementing the locale layouts. On the temporary generic scaffold, the red run failed as expected: Arabic root returned `lang="en"` instead of `ar`, and the English market-switch link was absent. After implementation: `npm run test:e2e` → **4 passed** (Chromium).
2. `scripts/verify-static-html.mjs` was added before static-runtime pruning. Red run: **5 content documents failed** because Next script elements remained. After the export-pruning step: `npm run build` → `Static HTML check passed for 5 content documents; no scripts are required.`
3. Production static smoke: `npm run test:static` → **passed**; Arabic/RTL and English/LTR native-link navigation worked with no script or third-party requests. Header checks passed.

## Final local verification

Command: `npm run check:all`

Result: **exit code 0**. It runs lint, TypeScript, Prettier, logical CSS, traceability, unit tests, browser tests, static export, header/static smoke, size-limit, and `npm audit --omit=dev`.

Key output:

- `Traceability check passed: 18 REQs map to existing TASKs and TESTs.`
- Playwright: `4 passed`.
- Next production build: routes `/`, `/en`, and not-found prerendered as static.
- Static export smoke: AR/RTL and EN/LTR navigation passed without JavaScript or third-party requests.
- First-load content JS: **0 referenced scripts**; size-limit input **20 B gzipped** (empty bundle overhead; under 90 KB).
- `npm audit --omit=dev`: `found 0 vulnerabilities`.

The GitHub Actions workflow is configured but was not run on a remote GitHub repository. Cloudflare deployment, live headers, Lighthouse, axe, and cross-browser matrix remain future verification work.

## Open risks / external setup

- Architecture Plan and Keywords Workbook are still absent; prompt-derived specs remain source-limited.
- Decap config contains `OWNER/lingora` and `oauth.example.invalid`; replace both and enforce branch protection before enabling the CMS.
- OD-01 is deferred: no commerce launch until reseller rights and redeem-link conditions are verified.
- Placeholder preview copy is not final site content and is marked `noindex,nofollow`.
- No database, commerce API, customer, invoice, or report modules were built in P1; those are outside the approved Lingora foundation scope.
