import type { Metadata } from 'next';
import { getContentByRoute, type Locale } from './content';

export function buildPageMetadata(locale: Locale, route: string): Metadata {
  const page = getContentByRoute(locale, route);
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: route,
      ...(page.pageType === 'about'
        ? {
            languages: {
              ar: '/about/',
              en: '/en/about/',
              'x-default': '/',
            },
          }
        : {}),
    },
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
