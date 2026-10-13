# 001 — Foundation Specification

Status: **APPROVED at GATE-0 (owner deferred OD-01–OD-10)**  
Source basis: Lingora SDD Engineering Prompt, Sections 3, 4, 5.8, 6. Architecture Plan and workbook were not supplied; see `../CONFLICTS.md` (SG-01).

## Requirements

### REQ-FND-001 (MUST)

**Statement:** The public site SHALL be built with Next.js App Router and TypeScript, statically exported with `output: 'export'` and `trailingSlash: true`, and SHALL NOT require Workers at runtime to render indexable pages.  
**Rationale:** Constitution A1; static CDN delivery is an availability requirement.  
**Acceptance:** GIVEN a production build WHEN the export is inspected THEN it emits static public pages with trailing-slash URLs and no public-page runtime dependency on a Worker.  
**Verification:** CI-gate, manual-with-evidence.  
**Out of scope:** Commerce API and Worker implementation.

### REQ-FND-002 (MUST)

**Statement:** The site SHALL expose Arabic at `/` with `lang="ar"` and `dir="rtl"`, and English at `/en/` with `lang="en"` and `dir="ltr"`, without runtime language detection, IP redirects, or automatic content switching.  
**Rationale:** Constitution A2.  
**Acceptance:** GIVEN either root route WHEN rendered THEN its language and direction match the route, and requests from different IPs do not change route or content.  
**Verification:** integration, e2e.  
**Out of scope:** User-triggered market-switcher behavior beyond preserving explicit route selection.

### REQ-FND-003 (MUST)

**Statement:** Track-specific design tokens SHALL be defined through CSS variables and all component styling SHALL use logical properties rather than physical left/right properties.  
**Rationale:** Constitution A3 and the RTL test strategy in §5.3.  
**Acceptance:** GIVEN the stylesheet and component source WHEN the style lint runs THEN no prohibited left/right margin, padding, or positioning declarations are present, and AR/EN token files exist.  
**Verification:** CI-gate, e2e.  
**Out of scope:** Final brand palette pending OD-08.

### REQ-FND-004 (MUST)

**Statement:** Public content pages SHALL make no third-party requests except the allowed cookie-less Cloudflare analytics, and client-side code SHALL be limited to checkout, market switching, and clipboard-copy islands; FAQ interaction SHALL use native details/summary.  
**Rationale:** Constitution A4, P3; §5.3.  
**Acceptance:** GIVEN a content page with JavaScript disabled WHEN its FAQ is used THEN it remains operable, and a network audit finds no disallowed third-party request.  
**Verification:** e2e, manual-with-evidence.  
**Out of scope:** Checkout/order exceptions for Turnstile and payment gateway.

### REQ-FND-005 (MUST)

**Statement:** The deployable site SHALL target Cloudflare Pages, with commerce/runtime services isolated to Workers, D1, and KV, and CMS changes SHALL pass the same pull-request checks as code changes.  
**Rationale:** Constitution A6; §5.8.  
**Acceptance:** GIVEN a CMS content change WHEN submitted THEN the required CI checks run and no bypass path is configured; static-page rendering remains independent of commerce services.  
**Verification:** CI-gate, manual-with-evidence.  
**Out of scope:** Live gateway and production account setup.

### REQ-FND-006 (MUST)

**Statement:** Foundation CI SHALL run lint, TypeScript type checking, formatting checks, and the configured content validation, and SHALL fail on any error or warning specified by the release rules.  
**Rationale:** §4 and §5.8.  
**Acceptance:** GIVEN an intentional lint, type, formatting, or content-validation failure WHEN CI runs THEN the job fails and reports the failing check.  
**Verification:** CI-gate.  
**Out of scope:** Content-specific SEO gates specified in 002.

### REQ-FND-007 (MUST)

**Statement:** The application SHALL NOT add heavy general-purpose or animation dependencies, and every new dependency SHALL have a one-line size, license, and maintenance justification in its plan.  
**Rationale:** Constitution A7 and Definition of Done item 5.  
**Acceptance:** GIVEN a proposed dependency WHEN its change is reviewed THEN it has the required justification and does not introduce a prohibited heavy library.  
**Verification:** manual-with-evidence, CI-gate.  
**Out of scope:** Choosing exact versions before the approved plan.

### REQ-FND-008 (MUST)

**Statement:** The foundation SHALL provide an automated smoke test for both Arabic RTL and English LTR root layouts before the foundation phase can pass.  
**Rationale:** Phase P1 exit criteria and Definition of Done item 9.  
**Acceptance:** GIVEN the built application WHEN the layout smoke tests run THEN Arabic reports `ar/rtl`, English reports `en/ltr`, and both tests pass.  
**Verification:** e2e, CI-gate.  
**Out of scope:** Full page-level visual and cross-browser coverage, specified in later phases.
