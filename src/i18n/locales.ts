import locales from './locales.json';
import angles from './angles.json';

/** Every locale the schema accepts; only `live` ones have routes today. */
export const ALL_LOCALE_CODES = [
  'ar',
  'en',
  'fr',
  'es',
  'de',
  'tr',
  'id',
  'bn',
  'sw',
] as const;
export type LocaleCode = (typeof ALL_LOCALE_CODES)[number];

export const ANGLE_IDS = angles as [string, ...string[]];

export const LOCALE_CONFIG = locales as ReadonlyArray<{
  code: LocaleCode;
  dir: 'rtl' | 'ltr';
  hrefPrefix: string;
  ogLocale: string;
  status: 'live' | 'planned' | 'deferred';
  markets: string[];
}>;

export function ogLocaleFor(code: LocaleCode): string {
  return (
    LOCALE_CONFIG.find((locale) => locale.code === code)?.ogLocale ?? 'en_US'
  );
}
