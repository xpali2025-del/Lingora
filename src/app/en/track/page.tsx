import { Container } from '@/components/Container';
import { OrderTracker } from '@/components/order/OrderTracker';
import { transactionalMetadata } from '@/lib/order-pages';

export const metadata = transactionalMetadata(
  'Track your order | Lingora',
  'Track your Duolingo Super order with the order number and email, and copy your code when the order is complete.',
  '/en/track/',
);

export default function EnglishTrackPage() {
  return (
    <main id="main-content" className="page-main content-page order-page">
      <Container>
        <h1>Track your order</h1>
        <p className="lead content-lead">
          Enter the order number and the email you used when ordering to see the
          status and your code.
        </p>
        <OrderTracker locale="en" />
      </Container>
    </main>
  );
}
