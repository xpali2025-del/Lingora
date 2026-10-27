import { Container } from '@/components/Container';
import { OrderFlow } from '@/components/order/OrderFlow';
import { getTransferAccounts, transactionalMetadata } from '@/lib/order-pages';

export const metadata = transactionalMetadata(
  'Order Duolingo Super | Lingora',
  'Order a 12-month Duolingo Super subscription: choose the plan, enter your details, pay, then track your order and copy the code.',
  '/en/order/',
);

export default function EnglishOrderPage() {
  return (
    <main id="main-content" className="page-main content-page order-page">
      <Container>
        <h1>Order Duolingo Super</h1>
        <p className="lead content-lead">
          Four steps: choose the plan, enter your details, pay, then track your
          order and copy the code.
        </p>
        <OrderFlow locale="en" transferAccounts={getTransferAccounts('en')} />
      </Container>
    </main>
  );
}
