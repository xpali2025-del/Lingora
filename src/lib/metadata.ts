import type { Metadata } from 'next';
import { getContentByRoute, type Locale } from './content';

export const SITE_URL = 'https://lingora.com';
export const LOGO_PATH = '/images/lingora-logo.png';

export const siteIcons: Metadata['icons'] = {
  icon: [
    { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    { url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
  ],
  apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
};

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
    openGraph: {
      type: 'website',
      siteName: 'Lingora',
      title: page.title,
      description: page.description,
      url: route,
      images: [{ url: LOGO_PATH, width: 800, height: 727, alt: 'Lingora' }],
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
      images: [LOGO_PATH],
    },
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
