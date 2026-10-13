## 6. CONSTITUTION — NON-NEGOTIABLE CONSTRAINTS

Copy this section verbatim into `specs/CONSTITUTION.md`. Violating any item is a blocking defect.

**Architecture and stack (fixed)**

- A1. Next.js App Router + TypeScript, `output: 'export'`, `trailingSlash: true`. No SSR for public pages. No runtime dependency on Workers to render any indexable page.
- A2. Two root layouts: `(ar)` = `lang=ar dir=rtl` at `/`; `en` = `lang=en dir=ltr` at `/en/`. **No runtime language detection, no IP-based redirects or content switching.**
- A3. Tailwind with CSS-variable tokens per track (`tokens-ar.css`, `tokens-en.css`) and **logical properties only**.
- A4. Server Components by default. Client islands only: checkout button, market switcher, copy-to-clipboard. FAQ = native `<details>/<summary>`.
- A5. Content lives as framework-agnostic MDX/JSON in `content/{ar,en}/`, validated by Zod. Arabic and English pages are **written independently, not translated word-for-word**.
- A6. Hosting: Cloudflare Pages + Workers + D1 + KV. Fonts self-hosted (IBM Plex Sans Arabic, Inter). Images processed at build time with `sharp` (AVIF/WebP, srcset, explicit width/height).
- A7. No heavy libraries (no full lodash/moment, no animation libraries).

**Privacy and data**

- P1. Lingora stores **no** name, email, phone, Duolingo username/password, or raw IP. Buyer key stored only as a hash.
- P2. Card data never touches Lingora (hosted gateway checkout only).
- P3. No third-party requests on content pages other than: Cloudflare analytics (cookie-less) and, on checkout/order pages only, Turnstile and the gateway. No cookies requiring a consent banner.

**Commerce integrity**

- C1. Prices come from a **server-side table**; the client never sets amount or currency.
- C2. Fulfilment is **idempotent** on `gateway_txn_id` (unique constraint) and allocation is a **single atomic statement**.
- C3. Webhooks must verify signature, timestamp tolerance, amount and currency against the order.
- C4. Redeem URLs are **encrypted at rest**; imports only through a protected CLI or Cloudflare Access page; every import/allocation is logged.
- C5. A paid buyer must never be left without a code or a documented manual-fulfilment/refund path (owner alert on paid-but-unfulfilled).

**Legal and brand**

- L1. Say **"independent reseller of Duolingo Super redeem links"**. Never "authorized/official" without documented written authorisation and its scope.
- L2. Disclaimer one-liner in every footer; full text on the disclaimer page (Plan §12.1 drafts).
- L3. Use "Duolingo" only to name the product (nominative use). **Never** use Duolingo's logo, owl, characters, or brand-green scheme. Lingora has its own identity.
- L4. No fake reviews, ratings, testimonials, counters, or urgency timers. No `AggregateRating`/`Review` schema without real, displayed, verifiable reviews.
- L5. Do not fabricate legal text beyond the Plan drafts; mark policy pages `LEGAL-REVIEW-REQUIRED` until counsel approves.

**SEO and content integrity**

- S1. One primary intent and one keyword cluster per URL. No two pages compete for a query.
- S2. A country hub exists only if it carries unique, useful content (local payment context, use cases, FAQs); otherwise it is merged into a regional hub. **No doorway pages.**
- S3. Keyword budget per page: exact primary phrase in Title, H1, first 100 words, plus ≤ 2 more uses; secondary phrases 1–2 times; the rest via synonyms. Density cap 2.5%.
- S4. Only mark up what is visible. One canonical host: `https://lingora.com` (apex, https); `www` → 301.
- S5. **Never invent data.** Search volumes, difficulty, payment-method availability, legal citations, and Duolingo feature claims must come from a verified source or remain `TO RESEARCH`. The workbook's empty volume/difficulty cells stay empty until a real tool provides values.
- S6. Every Duolingo feature claim carries a `last-verified` date and `sources-checked`; claims are stored in **one** place and referenced, not copy-pasted.

**Process**

- X1. No implementation before approved spec + failing tests.
- X2. No scope additions. Anything not in a REQ goes to `specs/BACKLOG.md`.
- X3. Never weaken or delete a test or gate to make a build pass. If a gate seems wrong, raise it at the next gate with evidence.
- X4. Never claim a check passed without showing the command and its output.
- X5. If information is missing or ambiguous, ask once, batched, at the nearest gate; otherwise record `ASSUMPTION:` and continue only with reversible choices.
