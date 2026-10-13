# Conflicts & Source Gaps — Lingora

Status: **Reviewed at GATE-0; SG-01 partially closed on 2026-10-13 (Keywords & Content Workbook received; Architecture Plan still absent).** Source of current register: `docs/Lingora_SDD_Engineering_Prompt.md` only. The Architecture Plan v1.1 (`.docx`) and Keywords & Content Workbook (`.xlsx`) were not present in the workspace; no claims below imply those files were reviewed.

## Known conflicts from the engineering prompt

| ID  | Conflict                                                                                                                    | Sources                                        | Default until owner decides                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Architecture Plan fixes price by track (SAR 50 / USD 15, never by IP or country); workbook proposes per-country currencies. | Plan §2.3, §6.2 vs Workbook `Pricing_Payments` | Charge SAR 50 on AR track and USD 15 on EN track only. Other prices are informational conversions; per-country charging remains disabled pending approval. |
| C2  | Meta description length: Plan 120–155; workbook check 110–160. Title: Plan 45–60; workbook only checks ≤60.                 | Plan §10.4 vs Workbook `Page_Map`              | Enforce stricter Plan limits: title 45–60, description 120–155.                                                                                            |
| C3  | “Authorized distributor” vs “independent reseller.”                                                                         | Plan §12.1                                     | Use “independent reseller” everywhere. “Authorized” is build-failing without written proof.                                                                |
| C4  | Workbook draft word counts are below Plan targets on several pages.                                                         | Plan §8.2 vs Workbook `Page_Map`               | Treat workbook copy as draft; fail release content gates, do not pad with filler.                                                                          |

## Source gap

| ID    | Gap                                                                                                                                                       | Impact / handling                                                                                                                                                                                                                                                                                                                                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SG-01 | The Architecture Plan v1.1 is absent. The Keywords & Content Workbook (`Lingora_Keywords_Content_Workbook.xlsx`) was received on 2026-10-13 and reviewed. | Workbook: volume/difficulty are blank (no data). Imported only safe keyword variants, neutral FAQs and the Arabic spelling دولينجو; excluded discount-code, no-personal-data, unverified fulfilment/refund answers and per-country prices (conflict C1). Plan-dependent details (hreflang map, legal text, architecture) remain unverified; keep provisional. |

## Newly discovered conflicts

None identified from the prompt alone. This is not confirmation that the two absent source files contain no additional conflicts.
