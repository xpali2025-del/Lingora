export function counterpartRoute(locale: string, route: string): string;
export function alternatesFor(
  record: {
    locale: string;
    route: string;
    indexable: boolean;
    hreflangGroup?: string;
  },
  allRecords: {
    locale: string;
    route: string;
    indexable: boolean;
    hreflangGroup?: string;
  }[],
): Record<string, string> | null;
