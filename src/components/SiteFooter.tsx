import { Container } from './Container';

type Locale = 'ar' | 'en';

const footerLinks: Record<Locale, { href: string; label: string }[]> = {
  ar: [
    { href: '/about/', label: 'من نحن' },
    { href: '/subscription/', label: 'معلومات الاشتراك' },
    { href: '/privacy/', label: 'سياسة الخصوصية' },
    { href: '/refund/', label: 'سياسة الاسترداد' },
    { href: '/disclaimer/', label: 'إخلاء المسؤولية' },
  ],
  en: [
    { href: '/en/about/', label: 'About' },
    { href: '/en/plans/', label: 'Plan information' },
    { href: '/en/privacy/', label: 'Privacy policy' },
    { href: '/en/refund/', label: 'Refund policy' },
    { href: '/en/disclaimer/', label: 'Disclaimer' },
  ],
};

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <Container>
        <nav
          className="footer-nav"
          aria-label={locale === 'ar' ? 'روابط الموقع' : 'Site links'}
        >
          {footerLinks[locale].map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className="footer-note">
          {locale === 'ar'
            ? 'معاينة غير جاهزة للإطلاق؛ النصوص والمعلومات بانتظار المراجعة.'
            : 'Preview only; content and information are awaiting review before launch.'}
        </p>
        <p className="footer-brand">© Lingora</p>
      </Container>
    </footer>
  );
}
