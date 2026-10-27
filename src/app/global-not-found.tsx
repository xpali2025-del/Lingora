import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-sans-arabic';
import '@/styles/base.css';
import '@/styles/tokens-ar.css';
import '@/styles/tokens-en.css';
import { Container } from '@/components/Container';
import { siteIcons } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة | Page not found | Lingora',
  icons: siteIcons,
};

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main id="main-content" className="page-main content-page not-found">
          <Container>
            <h1>الصفحة غير موجودة</h1>
            <p className="lead">
              ربما نُقل الرابط أو لم يعد متاحًا. يمكنك العودة إلى الصفحة
              الرئيسية أو قراءة صفحة من نحن.
            </p>
            <nav className="not-found-links" aria-label="روابط مقترحة">
              <a className="button-link" href="/">
                الصفحة الرئيسية
              </a>
              <a href="/about/">من نحن</a>
            </nav>
            <section lang="en" dir="ltr" className="not-found-alt">
              <h2>Page not found</h2>
              <p>
                This link may have moved or is no longer available. Go to the
                English home page or read about Lingora.
              </p>
              <nav className="not-found-links" aria-label="Suggested links">
                <a className="button-link" href="/en/">
                  English home
                </a>
                <a href="/en/about/">About Lingora</a>
              </nav>
            </section>
          </Container>
        </main>
      </body>
    </html>
  );
}
