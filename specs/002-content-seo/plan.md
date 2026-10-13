# 002 — Content & SEO Engine Plan

Status: **APPROVED for P1 planning; implementation is governed by P1 tests and GATE-1**

## Proposed boundaries

- Keep bilingual content in framework-agnostic MDX/JSON under `content/{ar,en}/`; validate typed records with Zod.
- Put metadata, canonical, hreflang, structured data, sitemap and robots generation behind reusable helpers and build-time gates.
- Separate informational pricing data from checkout pricing; checkout price remains server-controlled.
- Build gates with positive and negative fixtures; normalize Arabic similarity according to the prompt; keep legal/brand and content gates blocking as specified.
- Treat page copy and workbook imports as source data, not implementation assumptions.

## Risks / unresolved inputs

- Workbook is needed to import keywords, page map, FAQ bank, informational pricing, and similarity regression fixtures.
- Architecture Plan is needed to verify exact page metadata, hreflang pairs, topic ownership, draft disclaimer/policy text, and word targets.
- This spec is a prompt-derived draft. Do not claim content or SEO gates pass until their fixtures and source data are supplied and tested.
