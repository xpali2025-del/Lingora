import type { ContentRecord } from './content-schema';
import { LOGO_PATH, SITE_URL } from './metadata';

// Contact details rendered in the visible About copy; JSON-LD must not add facts beyond them.
export const PUBLIC_CONTACT = {
  telephone: '+966554751363',
  generalEmail: 'info@lingora.com',
  salesEmail: 'sales@lingora.com',
} as const;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function buildStructuredData(
  content: ContentRecord,
): Record<string, unknown> | null {
  // Only indexable About pages carry markup; drafts stay unmarked until approved.
  if (content.pageType !== 'about' || !content.indexable) return null;
  const pageUrl = `${SITE_URL}${content.route}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Lingora',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}${LOGO_PATH}`,
        email: PUBLIC_CONTACT.generalEmail,
        telephone: PUBLIC_CONTACT.telephone,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'general enquiries',
            telephone: PUBLIC_CONTACT.telephone,
            email: PUBLIC_CONTACT.generalEmail,
            availableLanguage: ['ar', 'en'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            email: PUBLIC_CONTACT.salesEmail,
            availableLanguage: ['ar', 'en'],
          },
        ],
      },
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.h1,
        description: content.description,
        inLanguage: content.locale,
        about: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };
}
