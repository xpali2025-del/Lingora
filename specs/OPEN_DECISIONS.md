# Open Decisions — Lingora

Status: **OD-01–OD-10 deferred by owner at GATE-0; listed defaults apply.** Decision rows are transcribed from the engineering prompt; the absent source files may reveal additional questions. Deferral is not approval to launch or to invent missing source details.

| ID    | Decision                                                                                                                                                                            | Blocks              | Default if owner defers                          |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------ |
| OD-01 | Source and legal right to resell codes; single-use? expiry?                                                                                                                         | Launch              | Do not go live                                   |
| OD-02 | Payment gateway per track/country; owner-supplied Yemen and Gulf methods are recorded for the shared payment page, but receiving, fees, settlement, and activation remain untested. | P4                  | Lite MVP; do not claim an integrated checkout    |
| OD-03 | “Independent reseller” vs “authorized” (needs written proof)                                                                                                                        | P3 copy             | “Independent reseller”                           |
| OD-04 | Per-country charging (workbook) vs per-track charging (plan); Yemen SAR or USD; EN pages for Gulf expats SAR 50 or USD 15                                                           | P4 price table      | Per-track only (C1)                              |
| OD-05 | VAT treatment, commercial registration, Maroof/merchant disclosures                                                                                                                 | P3 legal pages      | Mark `LEGAL-REVIEW-REQUIRED`                     |
| OD-06 | Refund conditions and support response time                                                                                                                                         | P3 refund page      | Plan §12.2 draft, flagged                        |
| OD-07 | Data retention periods for orders/events                                                                                                                                            | P4 cleanup job      | Configurable, no default deletion                |
| OD-08 | Brand assets: logo, colours, handles, Arabic transliteration (لينجورا / لينغورا)                                                                                                    | P1 tokens           | Placeholder tokens from Plan §9.1                |
| OD-09 | Redeem-link retrieval window (Plan example: 30 days)                                                                                                                                | P4                  | 30 days                                          |
| OD-10 | Low-stock alert threshold (Plan example: < 20 codes) and alert channel                                                                                                              | P4                  | 20, email                                        |
| OD-11 | Full verified BNB Smart Chain (BEP20) recipient address; the string submitted is incomplete and must not be used.                                                                   | Payment page        | Keep crypto address unpublished until verified   |
| OD-12 | API provider documentation, webhook/signature validation, and a replacement for the credential exposed in chat.                                                                     | Payment integration | Revoke/rotate; keep replacement server-side only |

## Gate-0 note

The user selected proceeding from the prompt alone. Accordingly, source gap `SG-01` is recorded rather than silently filled with assumptions. Requirements that rely on the Architecture Plan or workbook remain provisional until those sources are supplied or their absence is explicitly accepted for the relevant scope.
