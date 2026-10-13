import { Container } from './Container';

type Locale = 'ar' | 'en';

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <Container>
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
