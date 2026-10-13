# 002 — Content & SEO Engine Specification

Status: **APPROVED at GATE-0 (owner deferred OD-01–OD-10); payment-method change request added 2026-10-13.**  
Source basis: Lingora SDD Engineering Prompt, Sections 1, 5, 6, 7, plus the owner's explicit payment-page and supplied-asset requirements. The Architecture Plan and Keywords Workbook are missing; legal/source-specific terms and keyword metrics remain unverified (SG-01).

## Requirements

### REQ-SEO-001 (MUST)

**Statement:** Every content record SHALL be schema-validated and include title, description, H1, slug, primary keyword, intent type, locale, last-verified date, and sources checked; FAQ questions within a page SHALL be unique.  
**Rationale:** §5.1 TEST-CNT-001 and §6 S6.  
**Acceptance:** GIVEN a record missing any required field or containing duplicate FAQ questions WHEN validated THEN validation fails with the field or duplicate identified.  
**Verification:** unit, CI-gate.  
**Out of scope:** Importing the absent workbook's actual rows.

### REQ-SEO-002 (MUST)

**Statement:** Each indexable page SHALL have a unique 45–60-character title with the brand last, a 120–155-character description, and an absolute self-canonical on `https://lingora.com`.  
**Rationale:** Prompt §1 C2 and §5.1 TEST-SEO-001.  
**Acceptance:** GIVEN page metadata WHEN the metadata gate runs THEN every title, description, and canonical satisfies these limits and uniqueness rules.  
**Verification:** unit, CI-gate.  
**Out of scope:** Editing workbook metadata not available in the workspace.

### REQ-SEO-003 (MUST)

**Statement:** Hreflang output SHALL use only the approved language/region codes, be reciprocal for mapped counterparts, and set `x-default` to `/`; pages without a counterpart SHALL list only themselves.  
**Rationale:** §5.1 TEST-SEO-002 and §7.  
**Acceptance:** GIVEN the locale map WHEN hreflang is generated THEN mappings are reciprocal, codes are allowlisted, and default/counterpart rules pass.  
**Verification:** unit, CI-gate.  
**Out of scope:** Verifying the missing Plan's full hreflang map.

### REQ-SEO-004 (MUST)

**Statement:** Structured data SHALL match visible page content and page type, use only server-side track pricing, and omit Review/AggregateRating markup unless genuine displayed reviews exist.  
**Rationale:** §5.1 TEST-SEO-003; §6 L4 and S4.  
**Acceptance:** GIVEN each supported page type WHEN JSON-LD is validated THEN required visible fields and server prices match, and no unsupported review/rating markup appears.  
**Verification:** unit, CI-gate.  
**Out of scope:** Publishing legal/brand claims not supported by verified sources.

### REQ-SEO-005 (MUST)

**Statement:** The SEO engine SHALL generate valid locale sitemaps and robots directives, disallow `/api/`, and mark `/order/` and `/en/order/` as `noindex,nofollow`.  
**Rationale:** §4 index-control criteria, §5.2, §5.7, §7.  
**Acceptance:** GIVEN a production export WHEN sitemap/robots/order metadata checks run THEN all intended URLs are present, `/api/` is disallowed, and both order pages are non-indexable.  
**Verification:** CI-gate, integration.  
**Out of scope:** Post-deploy IndexNow dispatch.

### REQ-SEO-006 (MUST)

**Statement:** Content gates SHALL enforce the prompt's keyword budget and density limits and reject unsupported Duolingo/legal claims, prohibited authorization wording without proof, and prohibited brand-asset references.  
**Rationale:** §5.1 TEST-GATE-002 and TEST-GATE-006; §6 L1, L3, S3, S5, S6.  
**Acceptance:** GIVEN content with a term over 2.5% density, a primary phrase over its placement budget, an unverified claim, or prohibited wording/assets WHEN checked THEN the relevant gate fails; compliant fixtures pass.  
**Verification:** unit, CI-gate.  
**Out of scope:** Legal counsel approval or authorization proof.

### REQ-SEO-007 (MUST)

**Statement:** Content gates SHALL detect cross-page near-duplicate content, repeated FAQ questions, readability violations, and duplicate primary-keyword ownership, using the normalization and thresholds defined in the prompt.  
**Rationale:** §5.1 TEST-GATE-001, 003, 004, 005 and §6 S1–S2.  
**Acceptance:** GIVEN passing and failing fixtures WHEN gates run THEN similarity at or above 25%, duplicate FAQ/keyword ownership, or defined readability failures are rejected and watch-level similarity is reported.  
**Verification:** unit, CI-gate.  
**Out of scope:** Authoring or translating page copy.

### REQ-SEO-008 (MUST)

**Statement:** The page manifest SHALL preserve the 12 existing core routes, add the owner-requested Arabic and English payment-methods routes, and retain all 12 original market URLs only as `research-only` records until distinct evidence is approved. The export SHALL contain 14 served drafts: 12 noindex routes and the owner-requested indexable About routes in both locales; no market hubs are served.  
**Rationale:** Prompt §7 launch scope and owner-approved About indexing request.  
**Acceptance:** GIVEN the content records WHEN static export validation runs THEN 14 core routes are exported exactly once, all 12 market records stay withheld, payment routes remain noindex, and only `/about/` plus `/en/about/` are indexable as specified in REQ-SEO-013.  
**Verification:** CI-gate, integration.  
**Out of scope:** Restoring market/country hubs without a separate evidence review, payment-gateway checkout implementation without provider documentation, and any additional non-payment route.

### REQ-SEO-009 (MUST)

**Statement:** Duolingo feature, payment, legal, and market-specific claims SHALL have verified sources and a last-verified date; unavailable evidence SHALL remain marked `TO RESEARCH` rather than fabricated.  
**Rationale:** §6 S5–S6.  
**Acceptance:** GIVEN a claim without source/date WHEN content validation runs THEN it is rejected or marked `TO RESEARCH` and cannot be promoted as verified.  
**Verification:** unit, CI-gate, manual-with-evidence.  
**Out of scope:** Performing external research or legal review in this phase.

### REQ-SEO-010 (MUST)

**Statement:** Page-level validation SHALL check one H1, correct locale direction, required footer disclaimer, Western-digit price formatting, primary CTA/link constraints, word-count targets, and topic ownership against approved content inputs.  
**Rationale:** §5.2 and §5.3.  
**Acceptance:** GIVEN page fixtures WHEN validation runs THEN each specified invariant is reported per page, with violations failing the relevant gate; no text is padded to meet word counts.  
**Verification:** CI-gate, e2e.  
**Out of scope:** Final legal policy approval; policy pages remain marked `LEGAL-REVIEW-REQUIRED` until counsel approves.

### REQ-SEO-011 (MUST) — Payment methods change request

**Statement:** The bilingual payment-methods routes SHALL show the owner-supplied Yemen Haseb reference, Kuraimi account numbers/currencies/beneficiary, Yemen wallet providers/number, Gulf Mada/Visa/transfer options, and USDT on BNB Smart Chain (BEP20). The copy SHALL distinguish owner-supplied information from tested payment acceptance, qualify international crypto access by local rules and wallet support, and SHALL NOT publish API secrets or incomplete wallet addresses.
**Rationale:** Explicit owner request dated 2026-10-13; existing static content does not execute payments.
**Acceptance:** GIVEN both payment records WHEN the content and export gates run THEN every supplied customer-facing payment identifier is visible in both records, the exact API secret is absent from source/export, the incomplete address is absent from customer instructions, payment routes remain noindex drafts, and the publication blockers name the missing live integration checks.
**Verification:** schema, SEO/content gate, static export, and browser tests.
**Out of scope:** Activating checkout, processing transfers, storing a gateway secret, or claiming every-country legal/technical availability.

### REQ-SEO-012 (MUST) — Supplied images and descriptive alternatives

**Statement:** The first supplied image SHALL be used as the Lingora company logo; the second supplied image SHALL appear near the Arabic subscription/features copy. Every rendered image SHALL have a written, descriptive, context-relevant alt string with the company/product terms only where useful.
**Rationale:** Explicit owner image instructions dated 2026-10-13 and accessible image-search context.
**Acceptance:** GIVEN every exported content route WHEN the static image-alt validator runs THEN every `<img>` has a non-empty descriptive alt (minimum 20 characters); the logo image is visible in both language layouts and the feature screenshot appears on `/subscription/`.
**Verification:** static export and Playwright.
**Out of scope:** Adding unprovided photography, logos, or marketing claims.

### REQ-SEO-013 (MUST) — Owner-confirmed offer wording and About purpose/contact pages

**Statement:** The Arabic and English home/plan pages SHALL describe owner-confirmed availability as Duolingo Super individual and Family options, state that Family is not discounted, and clarify that Lingora does not offer Duolingo Max. These statements SHALL be labeled in project source as owner-confirmed, not independently verified. Both About pages SHALL include the owner-directed mission, vision, “why Lingora” copy, and owner-supplied public phone/email details. Only the two About routes are indexable; all other served routes remain noindex,nofollow, and market routes stay withheld.
**Rationale:** Owner follow-up on 2026-10-13.
**Acceptance:** GIVEN the bilingual content WHEN SEO and browser tests run THEN the Super/Family/discount/Max distinction is clear, About copy avoids unsupported business/legal claims, the confirmed phone and emails are visible, robots metadata permits indexing only on the two About routes, and the sitemap lists exactly those routes. Google indexing is not guaranteed.
**Verification:** content gate, static export verifier, sitemap/robots checks, and Playwright.
**Out of scope:** Verifying inventory, resale rights, discount terms, payment, fulfillment, legal claims, or guaranteeing search-engine indexing.
