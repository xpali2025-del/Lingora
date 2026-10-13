# SEO intent, duplication and research plan

**Review date:** 2026-10-13  
**Status:** editorial research; no Search Console or keyword-volume export supplied.

## Decision applied: withhold the country pages

The source engineering prompt says a country hub should exist only when it contains useful, unique local content and otherwise be merged into a regional hub. The 12 country records in this project currently repeat the same generic purchase checks while lacking documented local payment, tax, delivery, support, or consumer-rights details. Their routes are now marked `research-only` and are excluded from static output. The JSON records remain in the repository as research briefs, not as landing pages. Do not reactivate a country route merely by changing its publication state.

The current public draft set is 14 routes (seven per language); `/about/` and `/en/about/` are indexable at the owner’s request, while the other 12 routes remain `noindex,nofollow`. This includes one shared payment-methods page per language with owner-supplied Yemen and Gulf instructions. A country route may be proposed again only after the owner supplies a distinct local user need, primary sources, a dated fact sheet, and original copy that answers that need better than a shared regional guide. If the research supports one regional page rather than several country pages, consolidate instead of creating city/country keyword variants.

## One primary intent per active route

| Locale / route                 | Search stage                 | Proposed primary phrase               | User task the page owns                                                                                                     | Explicitly not this page's job                                                                                      |
| ------------------------------ | ---------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Arabic `/`                     | Brand navigation             | `Lingora Duolingo Super`              | Identify the Lingora project, its relationship to the product, and where to read the offer details.                         | Compete for term, price, or purchase queries.                                                                       |
| Arabic `/subscription/`        | Transactional investigation  | `اشتراك Duolingo Super لمدة 12 شهرًا` | Let a buyer check term, seller identity, redemption conditions, final amount, support and failure handling before deciding. | Claim availability, authorization, regional payment, or refund terms that are not approved.                         |
| Arabic `/payment-methods/`     | Payment/checkout information | `طرق الدفع لدى Lingora`               | Show owner-supplied payment methods by market and explain safe verification before sending money.                           | Guarantee payment acceptance, exchange rates, settlement times, or publish an incomplete crypto address/API secret. |
| Arabic `/about/`               | Brand investigation          | `عن Lingora`                          | Explain Lingora’s purpose, vision, Super scope, and public contact channels.                                                | Invent legal identity, affiliation, or substitute for legal policy.                                                 |
| Arabic `/disclaimer/`          | Policy                       | `إخلاء مسؤولية`                       | Publish approved disclaimer wording for the actual business and jurisdictions.                                              | Use generic sales copy in place of legal approval.                                                                  |
| Arabic `/privacy/`             | Policy                       | `سياسة الخصوصية`                      | Describe implemented data collection, recipients, retention and user rights.                                                | Publish boilerplate that does not match the actual checkout and vendors.                                            |
| Arabic `/refund/`              | Policy                       | `سياسة استرداد المبلغ`                | State approved refund, cancellation and failed-fulfilment procedures.                                                       | Promise an unapproved outcome or response time.                                                                     |
| English `/en/`                 | Brand navigation             | `Lingora Duolingo Super`              | Explain the project and route brand searches to the offer review page.                                                      | Target transaction/term searches owned by Plans.                                                                    |
| English `/en/plans/`           | Transactional investigation  | `12-month Duolingo Super link`        | Explain the 12-month offer checks and what buyers must verify before deciding.                                              | Imply live inventory, resale authorization, local payment or refund policy.                                         |
| English `/en/payment-methods/` | Payment/checkout information | `Lingora payment methods`             | Present owner-supplied Yemen/Gulf methods and international USDT network guidance.                                          | Guarantee every-country access, rates, fees, settlement, or use an incomplete address/API credential.               |
| English `/en/about/`           | Brand investigation          | `About Lingora`                       | Explain Lingora’s purpose, vision, Super scope, and public contact channels.                                                | Invent legal identity, affiliation, or checkout terms.                                                              |
| English `/en/disclaimer/`      | Policy                       | `reseller disclaimer`                 | Publish approved relationship and limitation wording.                                                                       | Treat a draft as legal approval.                                                                                    |
| English `/en/privacy/`         | Policy                       | `privacy policy`                      | Describe actual site and order data flows and user rights.                                                                  | Reuse a generic privacy template.                                                                                   |
| English `/en/refund/`          | Policy                       | `refund policy`                       | State the adopted refund and non-delivery process.                                                                          | Promise terms the owner has not adopted.                                                                            |

These are qualitative intent assignments, not measured search-demand claims. The homepage, plan, and payment-methods primary phrases have separate owners. The checker detects duplicate metadata/FAQs, highly overlapping multiword primaries, same-language five-word shingle similarity, and keyword-density/primary-phrase overuse; a density warning is applied only to non-stopword, non-primary topical tokens to reduce false positives.

## Research status and evidence

- **Keyword volume / difficulty:** blank. Neither Search Console nor the absent Keywords Workbook provides these values. Google Search Console and an actual keyword-tool export are still needed for demand, market, and page/query mapping. The CSV importer does not invent or assign metrics.
- **Duolingo Super product facts:** one shared source record, `content/product-facts.json`, renders a cautious feature summary on both plans pages and links to Duolingo's official guide. It is not evidence that Lingora has inventory, authorization, or region-specific availability. Last checked 2026-10-13; recheck the source and in-account offer before publication.
- **Payment details:** The owner supplied Yemen Haseb/bank/wallet details and Gulf Mada/Visa/transfer options for the shared `/payment-methods/` page on 2026-10-13. These are recorded as owner-provided, not independently verified. The submitted BEP20 address is incomplete and the API credential is treated as exposed; neither is stored in the public site. Do not enable crypto checkout until a complete address, provider docs, and a secure server-side integration are verified.
- **Country pages:** all 12 country records remain blocked and excluded. The new shared payment page is not a country hub and does not reactivate any of them. A country route still needs a distinct local user need, dated evidence, consumer/tax/support details, and original copy.
- **Legal:** privacy, refund, and disclaimer pages remain drafts until actual data flows/terms and approved legal wording are supplied.

## Completeness standard (not an arbitrary word-count target)

The source prompt supplies editorial word ranges, but word count by itself is not a Google ranking requirement. The final acceptance test is whether a reader can finish the page's specific task without searching again for an answer. For each publish candidate, review:

1. The page states who created it, how its claims were checked, and why the page exists.
2. It answers the assigned user need with first-party facts, step-by-step guidance, source links, and appropriate limitations.
3. Its facts are current, attributed, and specific to the actual business/product—not templated across countries.
4. The CTA and internal links fit that intent; no second URL owns the same query cluster.
5. FAQs add questions not answered elsewhere and are not generated solely to capture query variations.
6. Owner/legal/local-market blockers are resolved. Keep affected routes noindex or withheld; the About-page indexing request is the only current exception.

## External guidance used

- Google Search Central, [Spam policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies): describes doorway abuse, scaled-content abuse and keyword stuffing, including substantially similar region pages and city/region keyword blocks.
- Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): evaluates originality, completeness and whether readers leave with their task answered; it does not prescribe a minimum word count.
- Duolingo, [Duolingo 101: How to learn a language on Duolingo](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/): official source for the limited Super feature statements stored centrally in `content/product-facts.json`.

## Next data needed to finish the remaining blockers

- Search Console `queries.csv`, `pages.csv`, and preferably `query-page.csv` for the live property.
- Keyword Planner (or equivalent) exports by language and actual target market, with provider/date/method preserved.
- Owner-confirmed reseller authority/source, seller identity, inventory/validity, exact redemption steps, price and currency by track, payment availability, fulfilment/support/refund terms.
- Approved privacy/disclaimer/refund text that matches the implemented data and commerce flow.
- Local evidence for any market page proposed for restoration.
