import { Container } from '@/components/Container';
import { OrderFlow } from '@/components/order/OrderFlow';
import { getTransferAccounts, transactionalMetadata } from '@/lib/order-pages';

export const metadata = transactionalMetadata(
  'اطلب اشتراك Duolingo Super | Lingora',
  'اطلب اشتراك Duolingo Super لمدة 12 شهرًا: اختر الاشتراك، أدخل بياناتك، ادفع، ثم تتبّع طلبك وانسخ الكود.',
  '/order/',
);

export default function ArabicOrderPage() {
  return (
    <main id="main-content" className="page-main content-page order-page">
      <Container>
        <h1>
          اطلب اشتراك{' '}
          <bdi lang="en" dir="ltr">
            Duolingo Super
          </bdi>
        </h1>
        <p className="lead content-lead">
          أربع خطوات: اختر الاشتراك، أدخل بياناتك، ادفع، ثم تتبّع طلبك وانسخ
          الكود.
        </p>
        <OrderFlow locale="ar" transferAccounts={getTransferAccounts('ar')} />
      </Container>
    </main>
  );
}
