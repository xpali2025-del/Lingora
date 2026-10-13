import type { Metadata } from 'next';
import { getAllContent, getContentByRoute, type Locale } from './content';
import { alternatesFor } from './hreflang.mjs';
import { ogLocaleFor } from '@/i18n/locales';

export function buildPageMetadata(locale: Locale, route: string): Metadata {
  const page = getContentByRoute(locale, route);
  const languages = alternatesFor(page, [
    ...getAllContent('ar'),
    ...getAllContent('en'),
  ]);
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: route,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: 'website',
      siteName: 'Lingora',
      title: page.title,
      description: page.description,
      url: route,
      locale: ogLocaleFor(locale),
      alternateLocale: ogLocaleFor(locale === 'ar' ? 'en' : 'ar'),
      images: [{ url: '/images/lingora-logo.png', alt: 'Lingora' }],
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
      images: ['/images/lingora-logo.png'],
    },
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
