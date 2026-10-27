import Image from 'next/image';
import { Container } from './Container';
import { MarketSwitcher } from './MarketSwitcher';

type Locale = 'ar' | 'en';

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-header">
      <Container>
        <div className="header-row">
          <a
            className="wordmark"
            href={locale === 'ar' ? '/' : '/en/'}
            aria-label={
              locale === 'ar' ? 'Lingora — الصفحة الرئيسية' : 'Lingora home'
            }
          >
            <Image
              src="/images/lingora-logo.webp"
              alt={
                locale === 'ar'
                  ? 'شعار Lingora لمعلومات اشتراك Duolingo Super'
                  : 'Lingora logo for Duolingo Super subscription information'
              }
              width={800}
              height={727}
              priority
            />
          </a>
          <nav
            className="primary-nav"
            aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
          >
            <a
              className="nav-cta"
              href={locale === 'ar' ? '/order/' : '/en/order/'}
            >
              {locale === 'ar' ? 'اشترك الآن' : 'Subscribe'}
            </a>
            <a href={locale === 'ar' ? '/track/' : '/en/track/'}>
              {locale === 'ar' ? 'تتبّع الطلب' : 'Track order'}
            </a>
            <a href={locale === 'ar' ? '/about/' : '/en/about/'}>
              {locale === 'ar' ? 'من نحن' : 'About'}
            </a>
            <a
              href={
                locale === 'ar' ? '/payment-methods/' : '/en/payment-methods/'
              }
            >
              {locale === 'ar' ? 'طرق الدفع' : 'Payment methods'}
            </a>
          </nav>
          <MarketSwitcher locale={locale} />
        </div>
      </Container>
    </header>
  );
}
