import Image from 'next/image';
import { Fragment } from 'react';
import { Container } from './Container';
import type { ContentRecord } from '@/lib/content-schema';
import { buildStructuredData } from '@/lib/structured-data';
import productFacts from '../../content/product-facts.json';

function BrandText({ text }: { text: string }) {
  return text
    .split(
      /(Duolingo Super|Duolingo|Lingora|\+966554751363|info@lingora\.com|sales@lingora\.com)/g,
    )
    .map((part, index) => {
      if (part === '+966554751363') {
        return (
          <a key={`${part}-${index}`} href={`tel:${part}`} dir="ltr">
            {part}
          </a>
        );
      }
      if (part === 'info@lingora.com' || part === 'sales@lingora.com') {
        return (
          <a key={`${part}-${index}`} href={`mailto:${part}`} dir="ltr">
            {part}
          </a>
        );
      }
      if (/^(Duolingo Super|Duolingo|Lingora)$/.test(part)) {
        return (
          <bdi key={`${part}-${index}`} lang="en" dir="ltr">
            {part}
          </bdi>
        );
      }
      return part;
    });
}

const labelByType: Record<
  ContentRecord['pageType'],
  { ar: string; en: string }
> = {
  home: { ar: 'مسودة الصفحة الرئيسية', en: 'Home draft' },
  plans: { ar: 'مسودة معلومات الاشتراك', en: 'Plan information draft' },
  about: { ar: 'معلومات التواصل', en: 'Contact' },
  policy: { ar: 'مسودة سياسة', en: 'Policy draft' },
  payments: { ar: 'مسودة طرق الدفع', en: 'Payment methods draft' },
  'market-hub': { ar: 'مسودة صفحة سوق', en: 'Market page draft' },
};

export function ContentPage({ content }: { content: ContentRecord }) {
  const isArabic = content.locale === 'ar';
  const isPlansPage = content.pageType === 'plans';
  const isContactPage = content.pageType === 'about';
  const ctaHref = isPlansPage
    ? isArabic
      ? '/payment-methods/'
      : '/en/payment-methods/'
    : isArabic
      ? '/subscription/'
      : '/en/plans/';
  const ctaLabel = isPlansPage
    ? isArabic
      ? 'راجع طرق الدفع'
      : 'Review payment methods'
    : isArabic
      ? 'راجع معلومات الاشتراك'
      : 'Review plan information';
  const showArabicSubscriptionScreenshot =
    content.locale === 'ar' && content.route === '/subscription/';
  const structuredData = buildStructuredData(content);

  return (
    <main id="main-content" className="page-main content-page">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <Container>
        <div className="content-kicker">
          <span className="content-kicker-dot" />
          {labelByType[content.pageType][content.locale]}
        </div>
        <h1>
          <BrandText text={content.h1} />
        </h1>
        <p className="lead content-lead">
          <BrandText text={content.intro} />
        </p>

        {!isContactPage && (
          <div className="draft-notice" role="status">
            <strong>
              {isArabic ? 'مسودة قيد المراجعة' : 'Editorial draft'}
            </strong>
            <span>
              {isArabic
                ? 'هذه الصفحة غير جاهزة للنشر أو الفهرسة. الكلمات والمقاييس مقترحة حتى مراجعة المصادر.'
                : 'This page is not ready for publication or indexing. Keywords and metrics remain provisional until sources are reviewed.'}
            </span>
          </div>
        )}

        {content.paymentOptions && (
          <section
            className="payment-options"
            aria-label={isArabic ? 'وسائل الدفع' : 'Payment methods'}
          >
            <div className="payment-options-heading">
              <span className="section-eyebrow">
                {isArabic ? 'حسب السوق' : 'By market'}
              </span>
              <h2>
                {isArabic
                  ? 'اختر وسيلة الدفع التي تطابق تعليمات طلبك'
                  : 'Choose the method shown in your order instructions'}
              </h2>
            </div>
            <div className="payment-options-grid">
              {content.paymentOptions.map((option) => (
                <article
                  className="payment-option-card"
                  key={`${option.group}-${option.label}`}
                >
                  <div className="payment-option-top">
                    <span className="payment-option-group">{option.group}</span>
                    <span className="payment-option-mark" aria-hidden="true">
                      ◈
                    </span>
                  </div>
                  <h3>{option.label}</h3>
                  <bdi className="payment-option-value" dir="ltr">
                    {option.value}
                  </bdi>
                  <p>{option.details}</p>
                </article>
              ))}
            </div>
            <p className="payment-safety-note">
              {isArabic
                ? 'تحقق من المستفيد والشبكة والمبلغ قبل الإرسال. لا تستخدم عنوان تحويل ناقصًا، ولا ترسل بيانات البطاقة أو رمز التحقق في المحادثات.'
                : 'Check the beneficiary, network, and amount before sending. Never use an incomplete address or send card details or verification codes in chat.'}
            </p>
          </section>
        )}

        <article className="article-content">
          {content.sections.map((section, sectionIndex) => (
            <Fragment key={`${section.heading}-${sectionIndex}`}>
              <section className="article-section">
                <h2>
                  <BrandText text={section.heading} />
                </h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${sectionIndex}-${paragraphIndex}`}>
                    <BrandText text={paragraph} />
                  </p>
                ))}
              </section>
              {showArabicSubscriptionScreenshot && sectionIndex === 1 && (
                <figure className="subscription-figure">
                  <Image
                    src="/images/duolingo-super-features-ar.jpg"
                    alt="لقطة شاشة من واجهة Duolingo Super بالعربية تعرض التدريب المخصص والطاقة غير المحدودة ومزايا الاشتراك"
                    width={900}
                    height={1875}
                    sizes="(max-width: 48rem) 100vw, 24rem"
                  />
                  <figcaption>
                    لقطة توضيحية لواجهة أرسلها المستخدم؛ قد تختلف المزايا وطريقة
                    عرضها بحسب إصدار التطبيق والحساب.
                  </figcaption>
                </figure>
              )}
            </Fragment>
          ))}
        </article>

        {content.pageType === 'plans' && (
          <section
            className="verified-product-facts"
            aria-labelledby="product-facts-heading"
          >
            <h2 id="product-facts-heading">
              <BrandText text={productFacts[content.locale].heading} />
            </h2>
            <ul>
              {productFacts[content.locale].facts.map((fact) => (
                <li key={fact}>
                  <BrandText text={fact} />
                </li>
              ))}
            </ul>
            <p>{productFacts[content.locale].note}</p>
            <a href={productFacts.sourceUrl} target="_blank" rel="noreferrer">
              {productFacts[content.locale].sourceLabel}
            </a>
            <small>
              {productFacts[content.locale].checkedLabel}:{' '}
              {productFacts.lastChecked}
            </small>
          </section>
        )}

        {content.faqs.length > 0 && (
          <section className="content-faq" aria-labelledby="faq-heading">
            <div className="section-eyebrow">
              {isArabic ? 'إجابات واضحة' : 'Clear answers'}
            </div>
            <h2 id="faq-heading">
              {isArabic ? 'أسئلة شائعة' : 'Frequently asked questions'}
            </h2>
            <div className="faq-list">
              {content.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    <BrandText text={faq.question} />
                  </summary>
                  <p>
                    <BrandText text={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {!isContactPage && (
          <div className="content-cta">
            <div>
              <span className="section-eyebrow">
                {isArabic ? 'الخطوة التالية' : 'Next step'}
              </span>
              <h2>
                {isArabic
                  ? 'اقرأ التفاصيل قبل أن تقرر.'
                  : 'Review the details before deciding.'}
              </h2>
            </div>
            <a href={ctaHref}>
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </Container>
    </main>
  );
}
