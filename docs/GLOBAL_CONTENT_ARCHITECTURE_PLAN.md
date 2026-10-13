# Lingora Global Content Architecture & Execution Plan

**Status:** proposed for owner approval · **Date:** 2026-10-13 · **Language:** English (technical/executive)
**Builds on:** `PROJECT_INDEX.md`, `specs/CONSTITUTION.md`, `specs/CONFLICTS.md` (C1–C4, SG-01), `specs/OPEN_DECISIONS.md`, `docs/SEO_INTENT_RESEARCH_PLAN.md`.
**Scope:** how to write and ship page and blog content for 18 target markets without duplicate, templated or doorway pages.

Markets in scope: Saudi Arabia, Yemen, Egypt, Bahrain, Qatar, Morocco, Kenya, South Africa, Ghana, Bangladesh, Indonesia, Turkey, United Kingdom, Germany, France, Spain, Canada, Australia.

---

## 1. Executive summary

1. **Language-first, not country-first.** Eighteen markets collapse into **eight language tracks**. Two exist already (Arabic, English) and cover 12 of the 18 markets with **zero new locales**. Six are new (Turkish, Indonesian, French, Spanish, German, Bengali).
2. **No per-country landing pages.** The 12 existing country records stay `research-only` (they were withheld at GATE-1 for being near-identical generic pages). Country reach is earned through:
   - one **market data module** (currency, payment rails, support language, legal notes) embedded in the shared Plans/Payment pages, rendered from structured data, not prose;
   - **blog articles**, each owning one topic (languages/Duolingo) and one named country scenario that has local facts.
3. **Sequencing by expected return, validated by data.** Wave 1 deepens Arabic and English (cheapest, already built). New locales follow in waves 2–4, each gated by keyword data, a native editor and payment readiness. The market ranking in §4 is a **judgment-based hypothesis**; no volume, price or conversion data exists yet (SG-01). Replace it with Keyword Planner/GSC data before committing budget.
4. **Duplication is prevented structurally**, not by reviewers' memory: a site-wide intent registry, an angle library, per-locale similarity gates and a "unique facts" requirement, all enforced in CI (§7).

---

## 2. Non-negotiable constraints (inherited)

| Rule                                                                           | Source                        | Consequence for this plan                                                                 |
| ------------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| One primary intent per route, owned once site-wide                             | `SEO_INTENT_RESEARCH_PLAN.md` | Extend the registry to articles and new locales.                                          |
| No padding to hit word counts                                                  | SDD prompt, GATE reports      | Depth comes from verified facts, not repetition.                                          |
| "Independent reseller" wording until publishable proof of authorization exists | C3 / OD-03                    | Owner states authorization exists; publish only text the owner can substantiate (see §9). |
| Per-track pricing only (SAR 50 / USD 15)                                       | C1 / OD-04                    | Market modules show informational conversions only; no per-country charging.              |
| Terms in `restrictedTerms` never appear in visible copy                        | `seo:check` guard             | Applies to every locale.                                                                  |
| Static export, zero client JS on content pages, JS budget 90 KB                | `package.json`, CI            | New locales add HTML/CSS/fonts only.                                                      |
| No fabricated volumes, prices, reviews or legal text                           | CONSTITUTION                  | Unknowns stay `null` / `LEGAL-REVIEW-REQUIRED`.                                           |

---

## 3. Market → language track map

| Track      | Locale          | Markets served                                                                                          | Status         |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| Arabic     | `ar` (root `/`) | Saudi Arabia, Yemen, Egypt, Bahrain, Qatar, Morocco (Arabic-speaking users)                             | Built (drafts) |
| English    | `en` (`/en/`)   | UK, Canada, Australia, South Africa, Kenya, Ghana, Bangladesh (English-search users), Qatar/Gulf expats | Built (drafts) |
| French     | `fr` (`/fr/`)   | France, Morocco (French-search users), Canada (Quebec, later)                                           | New            |
| Spanish    | `es` (`/es/`)   | Spain                                                                                                   | New            |
| German     | `de` (`/de/`)   | Germany                                                                                                 | New            |
| Turkish    | `tr` (`/tr/`)   | Turkey                                                                                                  | New            |
| Indonesian | `id` (`/id/`)   | Indonesia                                                                                               | New            |
| Bengali    | `bn` (`/bn/`)   | Bangladesh                                                                                              | New            |
| Swahili    | `sw` (`/sw/`)   | Kenya (optional, only if English data shows demand gap)                                                 | Deferred       |

Rules:

- A country never gets its own locale; a locale is a language. `en-GB`/`en-AU`/`en-CA` variants are **not** created; one English track serves all.
- Morocco is served by **both** Arabic and French tracks; the two share structured facts (currency, payment methods) but not prose.
- hreflang uses language codes only (`ar`, `en`, `fr`…) plus `x-default`. Region codes (`en-gb`) are added only if a region gets materially different content (different price/currency/legal) and then only via the market module, not duplicate pages.

---

## 4. Market prioritization (hypothesis, to be validated)

Scoring is 1–5 judgment, **not measured data**. Criteria: addressable language demand (L), purchasing power / payment fit (P), competition headroom (C), localization cost (inverse, X), legal/compliance risk (inverse, R). Total = L + P + C + X + R.

| Rank | Track / markets                     | L   | P   | C   | X   | R   | Total | Rationale                                                                                                   | Wave      |
| ---- | ----------------------------------- | --- | --- | --- | --- | --- | ----- | ----------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Arabic: SA, EG, YE, BH, QA, MA      | 5   | 4   | 4   | 5   | 3   | 21    | Built; owner has payment rails for Yemen/Gulf; native team.                                                 | 1         |
| 2    | English: UK, CA, AU, ZA, KE, GH, BD | 5   | 5   | 2   | 5   | 3   | 20    | Built; highest competition, so differentiate by angle, not volume.                                          | 1         |
| 3    | Turkish: TR                         | 4   | 3   | 4   | 3   | 3   | 17    | Large mobile-learning population, English-learning demand; consumer-law and card-payment details to verify. | 2         |
| 4    | Indonesian: ID                      | 4   | 3   | 4   | 3   | 3   | 17    | Large population, English/exam demand; local payment rails (e-wallets) must be checked.                     | 2         |
| 5    | French: FR, MA                      | 4   | 4   | 3   | 3   | 2   | 16    | One locale serves two markets; EU consumer/GDPR obligations.                                                | 2         |
| 6    | Spanish: ES                         | 3   | 4   | 3   | 3   | 2   | 15    | Strong competition, EU obligations; can extend to LatAm later.                                              | 3         |
| 7    | German: DE                          | 3   | 5   | 2   | 3   | 2   | 15    | High purchasing power, strict consumer/data law, strong incumbents.                                         | 3         |
| 8    | Bengali: BD                         | 3   | 2   | 4   | 2   | 3   | 14    | Needs Bengali font/typography and low-ARPU payment fit; English track may capture part of the demand first. | 4         |
| —    | Swahili: KE                         | 2   | 2   | 4   | 2   | 3   | 13    | Defer; Kenyan search is largely English.                                                                    | Gate only |

**Decision gate G-LOC (per new locale):** proceed only if all pass:

1. Keyword Planner/GSC shows non-trivial demand for the locale's primary intents (thresholds set by owner; record provider/date/method).
2. A **native editor** is contracted (writer + reviewer).
3. A payment path exists for that market or the page honestly states "contact support" (OD-02).
4. Legal checklist for that jurisdiction has an owner (§9).

---

## 5. Content architecture

### 5.1 Page inventory per locale

**Tier A: core commercial pages (7 per locale, written once, never cloned):**
home, plans, payment-methods, about, disclaimer, privacy, refund.

- Written by **transcreation from a brief**, not translation of another locale's text.
- Each locale's core pages own distinct intents (same table as `SEO_INTENT_RESEARCH_PLAN.md`) and cite local specifics: currency display, local payment names, local support hours, local legal references.

**Tier B: market data module (no prose pages):**
`content/markets.json` holds, per market: currency and informational conversion, payment rails, support language/hours, consumer-law pointer, last verified date. It renders as a compact table in Plans/Payment pages ("Where this works"). It is the **only** place country names are repeated. This prevents 18 pages from restating the same checklist.

**Tier C: blog (`/blog/`, per locale):** the main engine for country reach (§6).

**Tier D: country hub pages:** forbidden by default. A country page may exist only if it passes the **Distinct Local Value Test (DLVT)**:

- at least 5 verified, dated, sourced facts unique to that country (payment rails, currency/tax treatment, consumer-rights rules, support availability, exam/learning context);
- measured unique-content share ≥ 70% against all same-locale pages (shingle gate);
- a user need that the shared Plans/Payment pages cannot answer;
- owner and legal sign-off.

If the test fails, merge into the regional/shared page.

### 5.2 URL and routing

```
/                 ar home            /en/            en home
/subscription/    ar plans           /en/plans/      en plans
/payment-methods/ ar payments        /en/payment-methods/
/blog/            ar blog index      /en/blog/       en blog index
/blog/<slug>/     ar article         /en/blog/<slug>/
/tr/  /id/  /fr/  /es/  /de/  /bn/   same structure under each prefix
```

- Slugs are written in the target language (transliterated Latin where the script is non-Latin), not copied from English.
- Trailing-slash policy is preserved (static export).
- `ar` stays at root (existing canonical URLs unchanged).

### 5.3 Data model changes (`src/lib/content-schema.ts`)

| Field                                       | Type                                                                        | Purpose                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `locale`                                    | enum `ar,en,fr,es,de,tr,id,bn,sw`                                           | Extend current `ar,en`.                                                            |
| `pageType`                                  | add `'article'`, `'blog-index'`                                             | Blog support.                                                                      |
| `hreflangGroup`                             | string id                                                                   | Links translations/equivalents instead of path-mirroring.                          |
| `sourceMode`                                | `'original' \| 'transcreated'`                                              | Records how text was produced; machine-only translation is not allowed.            |
| `localHook`                                 | string                                                                      | The locale-specific angle (exam, payment rail, regulation). Required for articles. |
| `uniqueFacts`                               | array of `{fact, sourceUrl, checked}` min 3 (articles), min 5 (country hub) | Forces local substance.                                                            |
| `reviewedBy`                                | `{role:'native-editor', name, date}`                                        | Review trail; required before `indexable: true`.                                   |
| `author` / `datePublished` / `dateModified` | metadata                                                                    | Article JSON-LD and E-E-A-T.                                                       |
| `sources`                                   | array of URLs                                                               | Primary sources only.                                                              |
| `angle`                                     | enum from angle library (§6.2)                                              | Unique angle per language.                                                         |

`keywordResearch` is unchanged (`synonyms`, `semanticTerms`, `restrictedTerms` apply per locale).

### 5.4 Rendering and platform

- Replace two hard-coded root layouts with a `src/i18n/locales.ts` config: `{code, dir, htmlLang, hrefPrefix, fontClass, markets[]}`; each locale gets its own `<html lang dir>` via route groups or a `[locale]` root layout with `generateStaticParams`.
- Fonts: self-hosted only. Add a Bengali font (`@fontsource/noto-sans-bengali`) scoped to `bn`; load per locale to keep first-load small. Record in `docs/DEPENDENCIES.md`.
- Tokens: `tokens-<locale>.css` only where direction/typography differ (LTR locales share `tokens-en.css`).
- `metadata.ts`: replace the `counterpartRoute` heuristic with lookups by `hreflangGroup`; emit `hreflang` for every locale present in the group, plus `x-default`.
- **Sitemap:** generate `out/sitemap.xml` (and per-locale sitemaps once >500 URLs) from content at build time; include `xhtml:link` alternates automatically. Today it is hand-written.
- JSON-LD: `Organization`, `WebSite`, `BreadcrumbList` as now; add `BlogPosting` (author, datePublished, dateModified, inLanguage) for indexable articles. Do not depend on FAQ rich results; keep FAQ markup only where the visible page has the Q&A.
- Static-site constraints unchanged: no client JS, CSP `script-src 'self'`, JSON-LD data blocks only.

---

## 6. Blog system: how country reach is earned without repetition

### 6.1 Principle

Every article = **one topic about languages or Duolingo** + **one country scenario with local facts** + **one angle from the library**. The same `(angle)` is used **at most once per language track**; the same country appears at most once per quarter per language. Articles help the reader do something; the sales mention is a contextual link to Plans, never the article's purpose.

### 6.2 Angle library (examples; each used once per language)

| Angle ID            | Reader task                                           | Typical evidence required                     |
| ------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `exam-prep`         | Prepare for a named local exam or visa test           | Exam body page, test format, dates            |
| `workplace`         | Learn the language for a named local industry         | Job-market or employer source                 |
| `study-abroad`      | Meet a university language requirement                | University or government requirement page     |
| `budget-plan`       | Compare free vs paid learning costs                   | Public price pages, dated                     |
| `habit-system`      | Build a study routine using app features              | Duolingo documentation                        |
| `feature-explainer` | Understand one feature (hearts, Practice Hub, Family) | Duolingo documentation, dated                 |
| `plan-comparison`   | Super vs free vs Max (Lingora sells Super only)       | `content/product-facts.json` + official guide |
| `family-learning`   | Learn together in a household                         | Family plan documentation                     |
| `travel-language`   | Prepare for a trip to a named country                 | Official tourism/immigration facts            |
| `heritage-diaspora` | Maintain a mother tongue abroad                       | Community/census source                       |
| `redeem-howto`      | Redeem a purchased link safely, avoid scams           | Process verified by owner                     |
| `myth-check`        | Debunk a common belief with sources                   | Cited sources                                 |

### 6.3 Example first-wave article map (illustrative; final list comes from keyword data)

| Locale | Country scenario | Topic                                                  | Angle                                                |
| ------ | ---------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| ar     | Egypt            | Preparing English for the work market                  | `workplace`                                          |
| ar     | Saudi Arabia     | Learning English for scholarships abroad               | `study-abroad`                                       |
| ar     | Yemen            | Free vs paid learning when payment options are limited | `budget-plan`                                        |
| ar     | Bahrain / Qatar  | Expat-household language routine                       | `family-learning`                                    |
| ar     | Morocco          | Choosing between French and English first              | `myth-check`                                         |
| en     | Kenya            | IELTS/TOEFL preparation for study abroad               | `exam-prep`                                          |
| en     | South Africa     | Learning an additional language for work               | `workplace`                                          |
| en     | Ghana            | Language-learning budgets on mobile data               | `budget-plan`                                        |
| en     | UK               | Learning Arabic or Spanish before relocating           | `heritage-diaspora`                                  |
| en     | Canada           | French for immigration points                          | `exam-prep` (different exam body from Kenya's piece) |
| en     | Australia        | Learning with family on a Family plan                  | `family-learning`                                    |
| tr     | Turkey           | English for a Turkish exam context                     | `exam-prep`                                          |
| id     | Indonesia        | English for study/work abroad                          | `study-abroad`                                       |
| fr     | France / Morocco | Learning English or Arabic with a daily habit          | `habit-system`                                       |

Each row must pass the DLVT-lite for articles: ≥ 3 `uniqueFacts` with sources, a distinct primary intent, and a different angle than any other article in that language.

### 6.4 Article brief (single source for writers)

```
slug / hreflangGroup:
locale / sourceMode:
primary intent (one sentence, from registry):
reader task and who is not served:
angle (from library):
country scenario + 3+ uniqueFacts (fact, source URL, date checked):
outline (H2/H3), forbidden terms (restrictedTerms + claims policy):
internal links (max 2 commercial, 2+ editorial):
target length: set by completeness of answer, not a quota:
native reviewer: name/date:
```

Translating a brief into another language is allowed; translating **finished text** is not (hreflang duplicates add no value). A second language version must add its own local facts.

---

## 7. Anti-duplication system (enforced in CI)

| #   | Control                           | Mechanism                                                                                                    | Fails build when                                                               |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| D1  | Site-wide **intent registry**     | `content/intent-registry.json`: `{intentId, locale, route, primaryKeyword, angle}` generated and checked     | Two routes share a primary intent or normalized primary keyword in one locale. |
| D2  | **Angle uniqueness**              | `check-content-quality.mjs`                                                                                  | An `angle` repeats within a locale (articles).                                 |
| D3  | **Shingle similarity** per locale | Existing 5-word shingle gate extended to all locales; thresholds from the workbook: WATCH ≥ 15%, FAIL ≥ 25%  | Any same-locale pair ≥ 25%.                                                    |
| D4  | **Unique facts required**         | Schema `min(3)` for articles; `min(5)` for country hubs                                                      | Missing/duplicate facts across pages.                                          |
| D5  | **Country frequency cap**         | Script counts country mentions in `localHook`                                                                | A country has more than one article per quarter per language.                  |
| D6  | **Structure diversity**           | Compare H2 sequences; flag identical heading skeletons                                                       | Two articles share ≥ 80% of H2 text pattern.                                   |
| D7  | **Metadata uniqueness**           | Existing title/description/FAQ uniqueness extended to all locales                                            | Duplicate title/description/FAQ question.                                      |
| D8  | **Restricted claims guard**       | `restrictedTerms` plus a new global claims list ("official", "authorized", "discount code") per locale       | Term found in visible copy without an approved override.                       |
| D9  | **Review gate**                   | `indexable: true` requires `reviewedBy` and `lastVerified` ≤ 90 days                                         | Missing review or stale verification.                                          |
| D10 | **Language-aware tokenization**   | Per-locale stopwords and normalization (tr dotted/dotless i, de umlauts, id affixes, bn Unicode word breaks) | Density/similarity computed on wrong tokens (guard via unit tests per locale). |

Tests: extend `tests/content-quality.test.mjs` with fixtures per locale; keep `npm run check:all` as the single gate.

---

## 8. Quality, localization and review workflow

```
Keyword data (GSC/Planner) → intent registered → brief written (EN master brief)
→ native writer transcreates (not machine translation; AI drafts allowed only
   as a starting point and must be rewritten with local facts)
→ fact check against sources → native editor review
→ CI gates D1–D10 → owner/legal sign-off (policy pages, claims)
→ publish noindex → soak review → flip indexable + sitemap → monitor
```

- **Roles:** owner (claims, pricing, authorization evidence), native writer, native editor/reviewer, legal reviewer per jurisdiction, SEO/data owner, engineer.
- **Definition of done (page):** passes CI; ≥ 3 sourced local facts; no restricted claims; reviewer sign-off; hreflang group complete; internal links valid; Lighthouse/a11y checks pass for RTL/LTR as applicable.
- **Refresh policy:** product facts and prices re-verified every 90 days (`lastVerified`); expired content flips back to `noindex` automatically via a CI date check.

---

## 9. Compliance and claims policy

This is a technical plan, not legal advice. Each item needs a named legal reviewer before launch in that market.

1. **Authorization claim (OD-03/C3).** The owner states Lingora holds permission from Duolingo. The repository contains no publishable evidence. Until the owner supplies exact wording and the supporting document (kept off-repo), pages say "independent reseller". To change this: owner provides the approved sentence → disclaimer/about updated → C3 gate relaxed by recorded owner decision. Never use "official" for Duolingo's own site relationships.
2. **Consumer law by market:** EU (FR, ES, DE) distance-selling and digital-content withdrawal rules and price/VAT display; UK Consumer Rights Act; Turkey distance-sales regulation and the KVKK data law; Indonesia consumer-protection and PDP law; Canada/Australia consumer law; Gulf/Egypt/Morocco local rules. Refund wording per market comes from the legal review, not from a template.
3. **Data protection:** GDPR/UK GDPR for EU/UK users; privacy pages must describe actual data flows (OD-07) per locale.
4. **Payments:** gateway and local rails per market (OD-02); crypto only with a verified full address and server-side integration (OD-11/12). Rotate the exposed API credential first.
5. **Prohibited copy everywhere:** discount/coupon/cheap/free-code framing, "no personal data/no email" promises, guaranteed availability, comparisons that imply affiliation with Duolingo.

---

## 10. Phased execution plan

Effort sizes: S ≈ days, M ≈ 1–2 weeks, L ≈ 3–6 weeks (single engineer or writer-equivalent; adjust to team).

### Phase 0: Foundation fixes (prerequisite) — M

| ID   | Task                                                                      | Acceptance                                        |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| P0-1 | Remove `node_modules` from branch history (force-push, owner approval)    | Clean history; `.gitignore` effective.            |
| P0-2 | Replace placeholders in `public/admin/config.yml`; rotate exposed API key | No `OWNER/` or `example.invalid` values.          |
| P0-3 | Obtain GSC property + Keyword Planner exports per language                | CSVs in `data/search-console/`, `data/keywords/`. |
| P0-4 | Resolve OD-01/05/06/11/12 or record deferrals                             | `OPEN_DECISIONS.md` updated.                      |
| P0-5 | First CI run green on GitHub                                              | `check:all` passes in Actions.                    |

### Phase 1: Platform & governance — L

| ID   | Task                                                             | Acceptance                                                          |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| P1-1 | `src/i18n/locales.ts`; generalize layouts/routes to N locales    | `ar`/`en` unchanged output (diff-clean snapshot); `fr` stub builds. |
| P1-2 | Schema extension (§5.3) + Decap collections for blog and markets | Existing 26 records still validate.                                 |
| P1-3 | `content/markets.json` + "Where this works" component            | Rendered from data on Plans/Payment; no per-country prose.          |
| P1-4 | hreflang by `hreflangGroup`; auto-generated sitemap              | `verify-content-export` checks alternates for any group.            |
| P1-5 | Intent registry + gates D1–D10 with per-locale tokenizers        | Unit tests per locale; CI fails on seeded duplicates.               |
| P1-6 | Blog templates, `BlogPosting` JSON-LD, blog index                | Zero client JS; JSON-LD validated.                                  |

### Phase 2 (Wave 1): Arabic + English depth — L

- Finish Tier A pages to approved depth (legal inputs from P0-4).
- Publish 6 articles per language track from §6.3 after keyword confirmation; all start `noindex`, flip after review.
- Success metrics at 8–12 weeks: impressions and indexed pages per locale (GSC), CTR on article → Plans, no D3 warnings.

### Phase 3 (Wave 2): Turkish, Indonesian, French — L per locale

- Gate G-LOC → native team → Tier A (7 pages) → 6 articles each → launch noindex → review → index.
- French also provisions Morocco's French intent; shared facts via `markets.json`.

### Phase 4 (Wave 3): Spanish, German — L per locale

- Same pipeline; add stricter EU legal review (withdrawal, VAT, imprint requirements).

### Phase 5 (Wave 4): Bengali (+ optional Swahili) — L

- Add Bengali font and typography QA; evaluate Swahili only if English-track data shows an unmet need.

### Continuous

- Weekly: GSC review per locale; monthly: scale/kill rule per article cluster; quarterly: re-verify product facts, prices, legal wording; refresh or `noindex` expired pages.

---

## 11. Scale / kill rules (replace gut feel with thresholds)

| Signal (per locale, 12 weeks after index)                        | Action                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Indexed but < threshold impressions on registered intents        | Re-check intent/keywords; improve unique facts; do not add pages.     |
| High impressions, low CTR                                        | Rewrite title/description (never add keywords beyond approved lists). |
| Clicks but no Plans visits                                       | Fix internal links/CTA placement.                                     |
| Plans visits but no orders                                       | Out of SEO scope; check payment/offer (OD-02/04).                     |
| D3 similarity WATCH on any pair                                  | Merge or differentiate before publishing more.                        |
| A locale misses its demand threshold for two consecutive reviews | Pause new content in that locale; keep core pages.                    |

---

## 12. Risks and mitigations

| Risk                                       | Impact                           | Mitigation                                                        |
| ------------------------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| Thin/templated pages across 18 markets     | Spam-policy exposure, deindexing | Language-first model, DLVT, gates D1–D10.                         |
| Unverified authorization or pricing claims | Legal/reputational               | Claims policy §9, owner-supplied substantiation, CI claims guard. |
| Machine-translated clones                  | Low value, duplicate signals     | Brief-based transcreation, native review, `sourceMode`.           |
| No real demand data                        | Wrong market order               | G-LOC gate; ranking in §4 is provisional.                         |
| Payment rails not ready                    | Traffic without conversion       | Gate 3 in G-LOC; honest "contact support" state.                  |
| Increased maintenance                      | Stale facts                      | `lastVerified` + auto-noindex rule; quarterly refresh.            |
| Fonts/typography for Bengali, RTL mix      | UX defects                       | Per-locale QA checklist in P5.                                    |

---

## 13. Immediate next actions (first 10 working days)

1. Owner decisions: approve this plan; confirm Wave 1 scope (Arabic + English depth) and the new-locale shortlist (TR, ID, FR first).
2. Supply: GSC/Keyword Planner exports by language and market; the publishable authorization sentence (§9.1); legal inputs for disclaimer/privacy/refund.
3. Engineering (can start now): P1-1 locale config, P1-2 schema extension, P1-5 intent registry and gates — all testable without content.
4. Editorial: recruit native editors for TR, ID, FR; finalize the angle library and the first article briefs for `ar` and `en`.
5. Review this document after the first keyword data arrives and replace §4 scores with measured values.
