/** Arabic route -> English route; every other pair mirrors under /en/. */
const ENGLISH_ROUTE_BY_ARABIC = {
  '/': '/en/',
  '/subscription/': '/en/plans/',
};

export function counterpartRoute(locale, route) {
  if (locale === 'ar') return ENGLISH_ROUTE_BY_ARABIC[route] ?? `/en${route}`;
  const arabic = Object.entries(ENGLISH_ROUTE_BY_ARABIC).find(
    ([, english]) => english === route,
  );
  return arabic ? arabic[0] : route.replace(/^\/en/, '');
}

/**
 * Equivalent records in other locales. Records sharing `hreflangGroup` are
 * equivalent; without a group, ar/en pages pair by the route heuristic above.
 */
function equivalents(record, allRecords) {
  if (record.hreflangGroup)
    return allRecords.filter(
      (other) =>
        other.hreflangGroup === record.hreflangGroup &&
        other.locale !== record.locale,
    );
  if (record.locale !== 'ar' && record.locale !== 'en') return [];
  const otherLocale = record.locale === 'ar' ? 'en' : 'ar';
  const target = counterpartRoute(record.locale, record.route);
  return allRecords.filter(
    (other) =>
      other.locale === otherLocale &&
      !other.hreflangGroup &&
      other.route === target,
  );
}

/** hreflang alternates for an indexable page, or null when there are none. */
export function alternatesFor(record, allRecords) {
  if (!record.indexable) return null;
  const others = equivalents(record, allRecords).filter(
    (other) => other.indexable,
  );
  if (others.length === 0) return null;
  const languages = { [record.locale]: record.route };
  for (const other of others) languages[other.locale] = other.route;
  return { ...languages, 'x-default': '/' };
}
