# Project Index — Lingora

> اقرأ هذا الملف أولاً ولا تعيد قراءة الملفات. تحقق من الحداثة: `git diff --stat <Commit>..HEAD`.
> Last indexed: 2026-10-13 · Base: origin/main b22ce74 (merged into claude/charming-fermat-c6tw7t)

## ما هو المشروع
موقع ثابت (static export) ثنائي اللغة لبيع/شرح اشتراك Duolingo Super: عربي RTL على `/` وإنجليزي LTR على `/en/`. Next.js 16.4 (App Router) + React 19.3 + TypeScript + zod. نشر على Cloudflare Pages (`out/`). CMS: Decap في `public/admin`. Node >= 20.9.

## خريطة الملفات (108 ملفاً)
| المسار | الغرض |
|---|---|
| `content/{ar,en}/*.json` | سجلات المحتوى (26 سجلاً: 14 مسار أساسي + 12 سوق `research-only` غير منشورة). تُتحقق بـ `src/lib/content-schema.ts` |
| `content/product-facts.json` | حقائق المنتج |
| `src/app/(ar)/**`, `src/app/en/**` | الصفحات والتخطيطات (`[slug]`, home, subscription/plans) |
| `src/components/` | ContentPage (الأكبر، 243 سطراً)، SiteHeader/Footer، MarketSwitcher، ButtonLink، Container، SkipLink |
| `src/lib/` | content.ts (تحميل)، content-schema.ts (zod)، content-quality.mjs، gsc-csv.mjs، metadata.ts |
| `src/styles/` | base.css (513)، tokens-ar/en.css (خصائص منطقية فقط) |
| `scripts/` | فحوص ما بعد البناء: verify-static-html/content-export، smoke-export، headers، prune-static-runtime، first-load-bundle، check-content-quality/logical-css/traceability، gsc-csv-report، export-seo-workbook.py، static-server |
| `tests/*.test.mjs` | 7 اختبارات وحدة (node:test) |
| `e2e/foundation.spec.ts` + `playwright.config.ts` | 10 اختبارات متصفح |
| `specs/` | SDD: CONSTITUTION، 001-foundation، 002-content-seo، TRACEABILITY (21 REQ)، OPEN_DECISIONS (OD-01..12)، CONFLICTS، GATE reports |
| `docs/` | SEO reports/handoff/خطة، SDD prompt، workbook xlsx، DEPENDENCIES |
| `public/` | _headers (CSP)، robots، sitemap، admin/ (Decap)، images |

أوامر: `check:all` (lint, typecheck, format:check, logical-css, traceability, seo:check, unit, e2e, build, test:static, size, audit).

## نتائج الفحص (تم تشغيلها فعلياً)
نجح: lint، typecheck، logical-css، traceability، seo:check، unit 7/7، npm audit (0 ثغرات).

## تقرير المشكلات
| # | النوع | المشكلة | الخطورة |
|---|---|---|---|
| 1 | إعدادات/CI | `format:check` يفشل في 45 ملفاً: `.prettierrc` (singleQuote) مفقود من المستودع، فيفشل `check:all` | عالية |
| 2 | إعدادات | (أُضيف `.gitignore` الآن) كان غائباً؛ تم تتبع `scripts/__pycache__/*.pyc` و`tsconfig.tsbuildinfo`؛ `.size-budget/` يُنتج بالبناء | متوسطة |
| 3 | CI | لا يوجد `.github/` (workflows)، رغم أن README يشترط CI/branch protection | متوسطة |
| 4 | محتوى | 10 صفحات أقل من هدف الكلمات (home 297/1000، disclaimer 82/500، privacy، refund، subscription/plans) | متوسطة (مسودة) |
| 5 | قانوني | disclaimer/privacy/refund بلا مراجعة قانونية (OD-05/06) | عالية قبل الإطلاق |
| 6 | أمان/دفع | عنوان BEP20 ناقص غير منشور (OD-11)؛ مفتاح API سُرّب في الدردشة ويجب إبطاله (OD-12)؛ بيانات الدفع غير مُتحقق منها | عالية |
| 7 | إعدادات CMS | `public/admin/config.yml` يحوي `OWNER/lingora` و`oauth.example.invalid` placeholders؛ CSP للإدارة يحمّل من unpkg | متوسطة |
| 8 | تجاري | OD-01 (حقوق إعادة البيع) مؤجل؛ لا يُطلق التجارة | حاجز إطلاق |
| 9 | مصادر | SG-01: Architecture Plan وKeywords workbook مفقودان | متوسطة |
| 10 | SEO | أحجام البحث/الصعوبة/GSC فارغة؛ 12 سوقاً بلا محتوى | منخفضة |

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

| # | النوع | المشكلة | الخطورة |
|---|---|---|---|
| S1 | كلمات مفتاحية | كل الأرقام فارغة (volume/difficulty/GSC)؛ لا توجد بيانات بحث فعلية، والكلمات "seeds" نوعية فقط | عالية |
| S2 | مرادفات/تغطية | 3 short-tail + 3 long-tail فقط لكل صفحة، بلا مرادفات: AR subscription تفتقد (تفعيل/تجديد/باقة/سنوي/سنة كاملة/كود/اشتراك سوبر دولينجو/دوولينجو)؛ EN plans تفتقد (annual/yearly/1-year/subscription/activate/gift code/Super vs Plus/family plan). تهجئة لينجورا/لينغورا (OD-08) غير مغطاة بالعربي | عالية |
| S3 | محتوى رقيق | 10 صفحات دون الهدف؛ disclaimer (AR 86/EN 95 من 500) وprivacy/refund ~200 من 800؛ home 308/346 من 1000. الأسواق الـ12 ~110–129 كلمة (تُحجب، سليم) | عالية |
| S4 | Meta | أوصاف/عناوين المسودات تصف نفسها ("مسودة... بانتظار المراجعة"، "editorial placeholder")؛ لو فُهرست تظهر كنص داخلي ضعيف CTR. متوسط لأنها noindex حالياً | متوسطة |
| S5 | تقني | لا JSON-LD (Organization/FAQPage/BreadcrumbList) ولا Open Graph/Twitter؛ hreflang فقط لصفحة About؛ sitemap يضم About فقط | متوسطة |
| S6 | تقني | صفحتا About مفهرستان بلا FAQ ولا عناصر E-E-A-T كافية (اسم كيان قانوني، سجل تجاري، عنوان)؛ OD-05 مفتوح | متوسطة |
| S7 | تكرار/تنافس | الخطر الوحيد: home ↔ subscription/plans (شنقل نفس عبارة "Duolingo Super" + Lingora) — التشابه الفعلي منخفض (6–7%) لكن الـ primary للـ home يحتوي "Duolingo Super" المملوكة للـ plans؛ مراقبته بـ GSC | منخفضة |
| S8 | سبام/سلامة | لا حشو؛ لكن ادعاءات المالك (Family بلا خصم، لا Max، إعادة بيع مستقلة) غير موثقة؛ صفحات الدفع تعرض أرقام حسابات عامة — خطر احتيال/سمعة، وتبقى noindex | عالية (ثقة) |
| S9 | بنية | لا صفحات محتوى معرفي (how-to redeem، Super vs Max، أسئلة شائعة) تستهدف long-tail؛ Plans مثقلة بنية transactional دون مادة تعليمية | متوسطة |

### خطة SEO
1. استيراد GSC/Keyword Planner CSV بـ `npm run seo:gsc` ثم ملء volume/difficulty (S1).
2. توسيع الحقول: إضافة `synonyms` و`semanticTerms` إلى content-schema.ts وmetadata، وملء مرادفات لكل صفحة (S2).
3. إعادة صياغة meta للصفحات قبل أي فتح للفهرسة؛ إبقاء الملاحظات الداخلية في publishBlockers فقط (S4).
4. إضافة JSON-LD وOG وhreflang لكل زوج AR/EN عند فتح الفهرسة، وتحديث sitemap (S5).
5. كتابة محتوى حقيقي (من مصادر المالك/القانونية) للصفحات الرقيقة دون حشو؛ إضافة صفحات معرفية فريدة (S3,S9).
6. توثيق هوية الكيان وادعاءات المنتج قبل الفهرسة (S6,S8).
