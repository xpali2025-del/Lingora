import type { Metadata } from 'next';
import type { TransferAccount } from '@/components/order/OrderFlow';
import { getContentByRoute, type Locale } from './content';
import { siteIcons } from './metadata';

/** Owner-supplied bank and wallet accounts, reused from the payment-methods record (one source). */
export function getTransferAccounts(locale: Locale): TransferAccount[] {
  const route = locale === 'ar' ? '/payment-methods/' : '/en/payment-methods/';
  return (getContentByRoute(locale, route).paymentOptions ?? [])
    .filter((option) => /^[*0-9]+$/u.test(option.value))
    .map(({ label, value, details }) => ({ label, value, details }));
}

/** Transactional pages stay out of search results (REQ-SEO-005). */
export function transactionalMetadata(
  title: string,
  description: string,
  route: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: route },
    robots: { index: false, follow: false },
    icons: siteIcons,
  };
}
