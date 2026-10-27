import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-sans-arabic';
import '@/styles/base.css';
import '@/styles/tokens-en.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SkipLink } from '@/components/SkipLink';
import { siteIcons } from '@/lib/metadata';

export const metadata: Metadata = {
  metadataBase: new URL('https://lingora.com'),
  icons: siteIcons,
  title: 'Bilingual foundation preview for the Lingora website',
  description:
    'A technical preview of the Lingora website foundation for checking language routes and reading direction before approved content is prepared and reviewed.',
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <SkipLink href="#main-content" label="Skip to content" />
        <SiteHeader locale="en" />
        {children}
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
