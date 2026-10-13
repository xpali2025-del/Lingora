# 001 — Foundation Plan

Status: **APPROVED for P1 planning; implementation is governed by P1 tests and GATE-1**

## Proposed boundaries

- Generate a static bilingual Next.js App Router site; keep commerce endpoints outside the static rendering path.
- Use separate Arabic and English route/layout roots with explicit locale direction.
- Keep CSS tokens track-specific and enforce logical properties with a check in CI.
- Prefer Server Components. For non-interactive public content exports, keep route links as native anchors, remove unused Next hydration scripts after export, and verify that browser navigation remains functional. Future order pages are excluded from this optimization so their approved client islands can remain interactive.
- Route CMS edits through pull requests and the same CI pipeline.
- Defer final brand tokens to OD-08. No gateway, merchant, or legal assumptions are made here.

## Risks / unresolved inputs

- Architecture Plan §2, §4, §5, §9, §14, and §17 could not be checked because the plan is missing.
- Exact deploy configuration, brand tokens, component-library scope, header policy, and size-limit configuration need source reconciliation and owner approval.
- The requested implementation stack is specified by the prompt, but versions/dependencies are intentionally undecided.
