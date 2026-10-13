import type { ContentRecord } from './content-schema';

const SITE_URL = 'https://lingora.com';

const organization = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Lingora',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/lingora-logo.png`,
  email: 'info@lingora.com',
  telephone: '+966554751363',
};

/**
 * Structured data is emitted only for indexable routes, and only describes
 * facts already visible on the page. Draft (noindex) pages get none.
 */
export function buildJsonLd(content: ContentRecord): object | null {
  if (!content.indexable) return null;

  const url = `${SITE_URL}${content.route}`;
  const homeRoute = content.locale === 'ar' ? '/' : '/en/';
  const graph: object[] = [
    organization,
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Lingora',
      publisher: { '@id': organization['@id'] },
    },
    {
      '@type': content.pageType === 'about' ? 'AboutPage' : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: content.h1,
      description: content.description,
      inLanguage: content.locale,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': organization['@id'] },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Lingora',
          item: `${SITE_URL}${homeRoute}`,
        },
        ...(content.route === homeRoute
          ? []
          : [
              {
                '@type': 'ListItem',
                position: 2,
                name: content.h1,
                item: url,
              },
            ]),
      ],
    },
  ];

  if (content.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
