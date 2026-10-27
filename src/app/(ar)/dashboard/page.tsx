import { Container } from '@/components/Container';
import { AdminDashboard } from '@/components/order/AdminDashboard';
import { transactionalMetadata } from '@/lib/order-pages';

export const metadata = transactionalMetadata(
  'لوحة الطلبات | Lingora',
  'لوحة إدارة الطلبات وطلبات طرق الدفع ومخزون الأكواد.',
  '/dashboard/',
);

export default function DashboardPage() {
  return (
    <main id="main-content" className="page-main content-page order-page">
      <Container>
        <h1>لوحة الطلبات</h1>
        <AdminDashboard />
      </Container>
    </main>
  );
}
