import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-sans-arabic';
import '@/styles/base.css';
import '@/styles/tokens-ar.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SkipLink } from '@/components/SkipLink';

export const metadata: Metadata = {
  metadataBase: new URL('https://lingora.com'),
  title: 'معاينة أساس لينجورا ثنائية اللغة للموقع | Lingora',
  description:
    'هذه معاينة تقنية لأساس موقع لينجورا، مخصصة لاختبار اللغة واتجاه القراءة قبل إعداد المحتوى المعتمد ومراجعته.',
};

export default function ArabicRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <SkipLink href="#main-content" label="انتقل إلى المحتوى" />
        <SiteHeader locale="ar" />
        {children}
        <SiteFooter locale="ar" />
      </body>
    </html>
  );
}
