# Project Index — Lingora

> اقرأ هذا الملف أولاً ولا تعيد قراءة الملفات. تحقق من الحداثة: `git diff --stat <Commit>..HEAD`.
> Last indexed: 2026-10-13 · Base: origin/main b22ce74 (merged into claude/charming-fermat-c6tw7t)

## ما هو المشروع

موقع ثابت (static export) ثنائي اللغة لبيع/شرح اشتراك Duolingo Super: عربي RTL على `/` وإنجليزي LTR على `/en/`. Next.js 16.4 (App Router) + React 19.3 + TypeScript + zod. نشر على Cloudflare Pages (`out/`). CMS: Decap في `public/admin`. Node >= 20.9.

## خريطة الملفات (108 ملفاً)

| المسار                                            | الغرض                                                                                                                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/{ar,en}/*.json`                          | سجلات المحتوى (26 سجلاً: 14 مسار أساسي + 12 سوق `research-only` غير منشورة). تُتحقق بـ `src/lib/content-schema.ts`                                                                                                           |
| `content/product-facts.json`                      | حقائق المنتج                                                                                                                                                                                                                 |
| `src/app/(ar)/**`, `src/app/en/**`                | الصفحات والتخطيطات (`[slug]`, home, subscription/plans)                                                                                                                                                                      |
| `src/components/`                                 | ContentPage (الأكبر، 243 سطراً)، SiteHeader/Footer، MarketSwitcher، ButtonLink، Container، SkipLink                                                                                                                          |
| `src/lib/`                                        | content.ts (تحميل)، content-schema.ts (zod)، content-quality.mjs، gsc-csv.mjs، metadata.ts                                                                                                                                   |
| `src/styles/`                                     | base.css (513)، tokens-ar/en.css (خصائص منطقية فقط)                                                                                                                                                                          |
| `scripts/`                                        | فحوص ما بعد البناء: verify-static-html/content-export، smoke-export، headers، prune-static-runtime، first-load-bundle، check-content-quality/logical-css/traceability، gsc-csv-report، export-seo-workbook.py، static-server |
| `tests/*.test.mjs`                                | 7 اختبارات وحدة (node:test)                                                                                                                                                                                                  |
| `e2e/foundation.spec.ts` + `playwright.config.ts` | 10 اختبارات متصفح                                                                                                                                                                                                            |
| `specs/`                                          | SDD: CONSTITUTION، 001-foundation، 002-content-seo، TRACEABILITY (21 REQ)، OPEN_DECISIONS (OD-01..12)، CONFLICTS، GATE reports                                                                                               |
| `docs/`                                           | SEO reports/handoff/خطة، SDD prompt، workbook xlsx، DEPENDENCIES                                                                                                                                                             |
| `public/`                                         | _headers (CSP)، robots، sitemap، admin/ (Decap)، images                                                                                                                                                                      |

أوامر: `check:all` (lint, typecheck, format:check, logical-css, traceability, seo:check, unit, e2e, build, test:static, size, audit).

## نتائج الفحص (تم تشغيلها فعلياً)

نجح: lint، typecheck، logical-css، traceability، seo:check، unit 7/7، npm audit (0 ثغرات).

## تقرير المشكلات

| #   | النوع       | المشكلة                                                                                                                          | الخطورة           |
| --- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | إعدادات/CI  | `format:check` يفشل في 45 ملفاً: `.prettierrc` (singleQuote) مفقود من المستودع، فيفشل `check:all`                                | عالية             |
| 2   | إعدادات     | (أُضيف `.gitignore` الآن) كان غائباً؛ تم تتبع `scripts/__pycache__/*.pyc` و`tsconfig.tsbuildinfo`؛ `.size-budget/` يُنتج بالبناء | متوسطة            |
| 3   | CI          | لا يوجد `.github/` (workflows)، رغم أن README يشترط CI/branch protection                                                         | متوسطة            |
| 4   | محتوى       | 10 صفحات أقل من هدف الكلمات (home 297/1000، disclaimer 82/500، privacy، refund، subscription/plans)                              | متوسطة (مسودة)    |
| 5   | قانوني      | disclaimer/privacy/refund بلا مراجعة قانونية (OD-05/06)                                                                          | عالية قبل الإطلاق |
| 6   | أمان/دفع    | عنوان BEP20 ناقص غير منشور (OD-11)؛ مفتاح API سُرّب في الدردشة ويجب إبطاله (OD-12)؛ بيانات الدفع غير مُتحقق منها                 | عالية             |
| 7   | إعدادات CMS | `public/admin/config.yml` يحوي `OWNER/lingora` و`oauth.example.invalid` placeholders؛ CSP للإدارة يحمّل من unpkg                 | متوسطة            |
| 8   | تجاري       | OD-01 (حقوق إعادة البيع) مؤجل؛ لا يُطلق التجارة                                                                                  | حاجز إطلاق        |
| 9   | مصادر       | SG-01: Architecture Plan وKeywords workbook مفقودان                                                                              | متوسطة            |
| 10  | SEO         | أحجام البحث/الصعوبة/GSC فارغة؛ 12 سوقاً بلا محتوى                                                                                | منخفضة            |

## خطة الحل

1. (فوري، آمن) إضافة `.prettierrc` (singleQuote, trailingComma all) ثم `prettier --write`؛ إضافة `.gitignore` وإزالة `.pyc`/`tsbuildinfo` من التتبع. [#1,#2]
2. إضافة `.github/workflows/ci.yml` يشغّل `check:all`. [#3]
3. قرارات المالك: OD-01/05/06/11/12 وإبطال المفتاح. [#5,#6,#8]
4. استبدال placeholders في config.yml عند تفعيل CMS. [#7]
5. استكمال المحتوى بمواد موثقة دون حشو. [#4]
6. تزويد المصادر المفقودة وبيانات GSC. [#9,#10]

## صيانة

بعد أي تغيير: حدّث الجداول وسطر Last indexed.

## تقرير SEO (فُحص 2026-10-13، مبني على تحليل آلي لكل content/*.json)

**سليم:** عناوين 45–56 حرفاً والأوصاف 122–155 (ضمن حدود Plan)؛ تشابه 5-كلمات بين الصفحات ≤ 7% ولا جمل مكررة؛ لا keyword stuffing (أعلى تكرار موضوعي ≤ 5.7% في صفحات legal القصيرة وهو من قلة النص لا حشو)؛ 14 نية رئيسية مميزة؛ 36 FAQ فريدة؛ الأسواق الـ12 محجوبة (سلوك صحيح تجاه doorway pages).

| #   | النوع         | المشكلة                                                                                                                                                                                                                                                                                          | الخطورة     |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| S1  | كلمات مفتاحية | كل الأرقام فارغة (volume/difficulty/GSC)؛ لا توجد بيانات بحث فعلية، والكلمات "seeds" نوعية فقط                                                                                                                                                                                                   | عالية       |
| S2  | مرادفات/تغطية | 3 short-tail + 3 long-tail فقط لكل صفحة، بلا مرادفات: AR subscription تفتقد (تفعيل/تجديد/باقة/سنوي/سنة كاملة/كود/اشتراك سوبر دولينجو/دوولينجو)؛ EN plans تفتقد (annual/yearly/1-year/subscription/activate/gift code/Super vs Plus/family plan). تهجئة لينجورا/لينغورا (OD-08) غير مغطاة بالعربي | عالية       |
| S3  | محتوى رقيق    | 10 صفحات دون الهدف؛ disclaimer (AR 86/EN 95 من 500) وprivacy/refund ~200 من 800؛ home 308/346 من 1000. الأسواق الـ12 ~110–129 كلمة (تُحجب، سليم)                                                                                                                                                 | عالية       |
| S4  | Meta          | أوصاف/عناوين المسودات تصف نفسها ("مسودة... بانتظار المراجعة"، "editorial placeholder")؛ لو فُهرست تظهر كنص داخلي ضعيف CTR. متوسط لأنها noindex حالياً                                                                                                                                            | متوسطة      |
| S5  | تقني          | لا JSON-LD (Organization/FAQPage/BreadcrumbList) ولا Open Graph/Twitter؛ hreflang فقط لصفحة About؛ sitemap يضم About فقط                                                                                                                                                                         | متوسطة      |
| S6  | تقني          | صفحتا About مفهرستان بلا FAQ ولا عناصر E-E-A-T كافية (اسم كيان قانوني، سجل تجاري، عنوان)؛ OD-05 مفتوح                                                                                                                                                                                            | متوسطة      |
| S7  | تكرار/تنافس   | الخطر الوحيد: home ↔ subscription/plans (شنقل نفس عبارة "Duolingo Super" + Lingora) — التشابه الفعلي منخفض (6–7%) لكن الـ primary للـ home يحتوي "Duolingo Super" المملوكة للـ plans؛ مراقبته بـ GSC                                                                                             | منخفضة      |
| S8  | سبام/سلامة    | لا حشو؛ لكن ادعاءات المالك (Family بلا خصم، لا Max، إعادة بيع مستقلة) غير موثقة؛ صفحات الدفع تعرض أرقام حسابات عامة — خطر احتيال/سمعة، وتبقى noindex                                                                                                                                             | عالية (ثقة) |
| S9  | بنية          | لا صفحات محتوى معرفي (how-to redeem، Super vs Max، أسئلة شائعة) تستهدف long-tail؛ Plans مثقلة بنية transactional دون مادة تعليمية                                                                                                                                                                | متوسطة      |

### خطة SEO

1. استيراد GSC/Keyword Planner CSV بـ `npm run seo:gsc` ثم ملء volume/difficulty (S1).
2. توسيع الحقول: إضافة `synonyms` و`semanticTerms` إلى content-schema.ts وmetadata، وملء مرادفات لكل صفحة (S2).
3. إعادة صياغة meta للصفحات قبل أي فتح للفهرسة؛ إبقاء الملاحظات الداخلية في publishBlockers فقط (S4).
4. إضافة JSON-LD وOG وhreflang لكل زوج AR/EN عند فتح الفهرسة، وتحديث sitemap (S5).
5. كتابة محتوى حقيقي (من مصادر المالك/القانونية) للصفحات الرقيقة دون حشو؛ إضافة صفحات معرفية فريدة (S3,S9).
6. توثيق هوية الكيان وادعاءات المنتج قبل الفهرسة (S6,S8).

### تنفيذ خطوة 2 (مرادفات) — تم

- `src/lib/content-schema.ts`: حقلان اختياريان `keywordResearch.synonyms` و`semanticTerms`.
- `content/{ar,en}/*.json`: ملؤهما للصفحات الـ14 المنشورة كمسودة (4–5 مرادفات و4–9 مصطلحات دلالية لكل صفحة؛ مقترحات editorial غير مدعومة ببيانات بحث). صفحات الأسواق الـ12 لم تُمس.
- `scripts/check-content-quality.mjs`: يفشل إن قلّ المرادفات/المصطلحات عن 3 أو تكرر متغير مع الـ primary.
- `public/admin/config.yml`: حقلا CMS جديدان. `scripts/export-seo-workbook.py`: صفّا Synonym وSemantic term (لم يُشغَّل لإعادة توليد xlsx).
- تنبيه: لا تشغّل `prettier --write` قبل إضافة `.prettierrc` (singleQuote) وإلا تتغير علامات الاقتباس في كل الملفات.

### إصلاح #1 (format:check) — تم

أُضيف `.prettierrc` (singleQuote) و`.prettierignore` (يستثني next-env.d.ts ونص SDD المولَّد/المنقول)؛ `format:check` ينجح الآن دون تعديل أي ملف مصدر. يبقى #3 (CI workflow) و`check:all` الكامل لم يُشغَّل بعد (e2e/build).

### دمج Keywords Workbook (xlsx المرفوع من المالك) — تم جزئياً

- المصدر: `Lingora_Keywords_Content_Workbook.xlsx` (100 كلمة AR، 76 EN، 58 FAQ، Page_Map، أسعار حسب الدولة). الحجم/الصعوبة فارغة فيه (لا بيانات بحث).
- دُمج: المرادفات/المتغيرات الآمنة (تهجئات دولينجو/دوولينجو/ديولينجو، سنوي/annual، أسئلة الصفحات) في `synonyms`/`semanticTerms` للصفحات الـ14؛ ذكر «دولينجو سوبر» عند أول ظهور في مقدمة AR home وsubscription (كان الموقع يستخدم Duolingo اللاتينية 104 مرة مقابل 12 عربية)؛ 4 أسئلة FAQ جديدة محايدة (مجاني vs Super، هل Lingora الموقع الرسمي) مبنية على `product-facts.json`.
- استُبعد عمداً: «كود خصم/discount code/voucher»، «بدون بيانات شخصية/بدون ايميل»، إجابات FAQ التي تؤكد تسليماً أو واتساب أو استرداداً غير معتمد، أسعار الدول (تعارض C1)، صفحات الدول.
- متبقٍ: توثيق المصدر في SG-01، وبيانات الحجم/الصعوبة.
- ملاحظة بيئة: e2e لا تعمل في هذه الحاوية (مسار chromium مفقود)؛ ما عداها (build, seo:check, format) ينجح.

### تم: توثيق SG-01 + إعادة صياغة الأوصاف

- `specs/CONFLICTS.md`: SG-01 مُحدَّث (الـ workbook استُلم وروجع؛ Architecture Plan ما زال غائباً).
- أوصاف meta للصفحات الـ12 غير الـ About أُعيدت صياغتها (120–155 حرفاً) بصيغة موجهة للقارئ مع إبقاء حالة «قيد الاعتماد» للصفحات القانونية؛ About لم تُمس (معتمدة من المالك). S4 في تقرير SEO محلولة.

### تم: بيانات منظّمة + CI

- `src/lib/structured-data.ts`: JSON-LD (Organization, WebSite, WebPage/AboutPage, BreadcrumbList، وFAQPage إن وُجدت أسئلة) **للصفحات المفهرسة فقط** (حالياً About AR/EN)؛ المسودات noindex بلا JSON-LD عمداً. يُعرض في `ContentPage.tsx`.
- `src/lib/metadata.ts`: Open Graph + Twitter لكل الصفحات؛ hreflang مُعمَّم لأي زوج AR/EN حين تصبح الصفحتان indexable (خريطة: `/`↔`/en/`، `/subscription/`↔`/en/plans/`، والباقي `/x/`↔`/en/x/`).
- سكربتات البناء (prune/verify-static-html/verify-content-export/headers/verify-cloudflare-headers) تسمح بـ ld+json وتتحقق منه؛ `public/sitemap.xml` فيه xhtml:link alternates.
- `.github/workflows/ci.yml`: يشغّل `npm run check:all` على push إلى main وكل PR (Node 22 + Playwright chromium). لم يُجرَّب فعلياً على GitHub.
- عند فتح فهرسة صفحة جديدة: غيّر `indexable` + أضفها لـ `public/sitemap.xml` (مع alternates) — تتحقق منها verify-content-export.

### كلمات «رمادية» وبحث عالمي (بطلب المالك)

- حقل جديد `keywordResearch.restrictedTerms` (schema + CMS + تصدير workbook): مصطلحات بحث (كود/كوبون/رخيص/بدون بيانات شخصية…) تُتتبَّع للبحث والإعلانات فقط. `seo:check` يفشل إن ظهرت في النص المرئي، لأنها ادعاءات غير موثقة حالياً.
- أُضيفت مرادفات عادية (premium/بريميوم، family plan، annual، عائلي) لصفحات home وplans/subscription.
- ادعاء المالك بوجود تصريح من Duolingo غير موثق في المستودع، فيبقى النص «بائع مستقل» (C3) حتى يوفّر المالك صيغة يمكن نشرها؛ التغيير يتم بتعديل نص disclaimer/about وتخفيف بوابة C3 عن علم المالك.
- التوسع العالمي يحتاج قراراً: لغات جديدة (es/fr/tr/id/pt…) = locale جديد في الـ routing والمحتوى والـ hreflang، ولا يُنفَّذ قبل اعتماد اللغات والأسواق.

### خطة المحتوى العالمي — `docs/GLOBAL_CONTENT_ARCHITECTURE_PLAN.md` (إنجليزي، تنفيذي/تقني)

18 سوقاً → 8 مسارات لغوية (ar/en مبنيان؛ جديد: tr, id, fr, es, de, bn؛ sw مؤجل). لا صفحات دول: وحدة بيانات `markets.json` + مقالات مدونة (موضوع + دولة + زاوية فريدة). ضوابط منع التكرار D1–D10 في CI، بوابة G-LOC قبل كل لغة، موجات: 1 عربي/إنجليزي، 2 TR/ID/FR، 3 ES/DE، 4 BN. ترتيب الأسواق فرضية بلا بيانات. لم يُنفَّذ كود منها بعد.

### تنفيذ المرحلة 1 الهندسية (من GLOBAL_CONTENT_ARCHITECTURE_PLAN) — تم

| البند                 | الملفات                                                                                                                                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-1 إعداد اللغات     | `src/i18n/locales.json` (9 لغات: ar,en live؛ fr,es,de,tr,id,bn planned؛ sw deferred)، `angles.json` (12 زاوية)، `locales.ts`. **لم تُضَف مسارات/layouts للغات الجديدة بعد** (تتم عند أول محتوى معتمد)؛ ContentPage يستخدم نصوص UI عربية/إنجليزية فقط.                                                           |
| P1-2 Schema           | `content-schema.ts`: locale من 9 لغات، pageType: article/blog-index، حقول hreflangGroup/sourceMode/angle/localHook/uniqueFacts/sources/reviewedBy/author/dates؛ مقال يتطلب ≥3 حقائق ومصدراً ومراجعة إن كان indexable؛ market-hub منشور يتطلب ≥5 حقائق. `content.ts`: `getAllArticles` (من `content/<l>/blog/`). |
| P1-3 الأسواق          | `content/markets.json` (18 سوقاً: عملة ISO ومسارات لغة وموجة؛ كل ما عداه null) — **بيانات فقط، لا عرض في الصفحات** حتى التحقق.                                                                                                                                                                                  |
| P1-4 hreflang/sitemap | `src/lib/hreflang.mjs` (+d.mts) مشترك بين metadata والسكربت؛ `scripts/generate-sitemap.mjs` يولّد `out/sitemap.xml` في البناء (حُذف `public/sitemap.xml`).                                                                                                                                                      |
| P1-5 الحوكمة          | `src/lib/content-governance.mjs` (D1,D2,D4,D5,D6,D8,D9 + markets)، `load-content.mjs`، `scripts/check-governance.mjs`، `content/intent-registry.json` (مُولَّد: `npm run registry:write`)، `tests/content-governance.test.mjs`. `check:governance` ضمن `check:all`.                                             |
| CMS                   | مجموعتا `arabic-blog`/`english-blog` وحقول المقال في `public/admin/config.yml`.                                                                                                                                                                                                                                 |

- لم يُنفَّذ: P1-6 قوالب المدونة وBlogPosting JSON-LD وصفحة الفهرس (تحتاج أول مقال)، ومسارات اللغات الجديدة، D3/D7/D10 للغات الجديدة (محتوى + محلل لكل لغة).
- التحقق: lint, typecheck, format, build, seo:check, governance, 16 unit tests ناجحة. e2e لا يعمل في الحاوية.
