import { Container } from '@/components/Container';
import { OrderTracker } from '@/components/order/OrderTracker';
import { transactionalMetadata } from '@/lib/order-pages';

export const metadata = transactionalMetadata(
  'تتبّع طلبك | Lingora',
  'تتبّع حالة طلب اشتراك Duolingo Super برقم الطلب والبريد الإلكتروني، وانسخ الكود عند اكتمال الطلب.',
  '/track/',
);

export default function ArabicTrackPage() {
  return (
    <main id="main-content" className="page-main content-page order-page">
      <Container>
        <h1>تتبّع طلبك</h1>
        <p className="lead content-lead">
          أدخل رقم الطلب والبريد الإلكتروني المستخدم عند الطلب لعرض الحالة
          والكود.
        </p>
        <OrderTracker locale="ar" />
      </Container>
    </main>
  );
}
