type Locale = 'ar' | 'en';

export function MarketSwitcher({ locale }: { locale: Locale }) {
  return (
    <nav
      className="market-switcher"
      aria-label={locale === 'ar' ? 'اختيار اللغة' : 'Language'}
    >
      {locale === 'ar' ? (
        <>
          <a href="/" lang="ar" aria-current="page">
            العربية
          </a>
          <a href="/en/" lang="en">
            English
          </a>
        </>
      ) : (
        <>
          <a href="/" lang="ar">
            العربية
          </a>
          <a href="/en/" lang="en" aria-current="page">
            English
          </a>
        </>
      )}
    </nav>
  );
}
