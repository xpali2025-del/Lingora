import type { Metadata } from 'next';
import { getAllContent, getContentByRoute, type Locale } from './content';

/** Arabic route -> English route; every other pair mirrors under /en/. */
const ENGLISH_ROUTE_BY_ARABIC: Record<string, string> = {
  '/': '/en/',
  '/subscription/': '/en/plans/',
};

function counterpartRoute(locale: Locale, route: string): string {
  if (locale === 'ar') return ENGLISH_ROUTE_BY_ARABIC[route] ?? `/en${route}`;
  const arabic = Object.entries(ENGLISH_ROUTE_BY_ARABIC).find(
    ([, english]) => english === route,
  );
  return arabic ? arabic[0] : route.replace(/^\/en/, '');
}

function indexableCounterpart(locale: Locale, route: string): string | null {
  const other: Locale = locale === 'ar' ? 'en' : 'ar';
  const target = counterpartRoute(locale, route);
  const match = getAllContent(other).find(
    (record) => record.route === target && record.indexable,
  );
  return match ? target : null;
}

export function buildPageMetadata(locale: Locale, route: string): Metadata {
  const page = getContentByRoute(locale, route);
  const counterpart = page.indexable
    ? indexableCounterpart(locale, route)
    : null;
  const arabicRoute = locale === 'ar' ? route : counterpart;
  const englishRoute = locale === 'en' ? route : counterpart;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: route,
      ...(counterpart && arabicRoute && englishRoute
        ? {
            languages: {
              ar: arabicRoute,
              en: englishRoute,
              'x-default': '/',
            },
          }
        : {}),
    },
    openGraph: {
      type: 'website',
      siteName: 'Lingora',
      title: page.title,
      description: page.description,
      url: route,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_AR',
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
