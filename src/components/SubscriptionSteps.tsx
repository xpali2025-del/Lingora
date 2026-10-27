import { PRICE_TABLE } from '@/server/prices.mjs';

type Locale = 'ar' | 'en';

const stepsCopy = {
  ar: {
    heading: 'كيف تشترك؟',
    steps: [
      [
        'اختر الاشتراك',
        `Duolingo Super فردي لمدة 12 شهرًا بسعر ${Number(PRICE_TABLE.individual.ar.amount)} ر.س.`,
      ],
      [
        'أدخل بياناتك',
        'الاسم والبريد الإلكتروني ورقم واتساب، واحفظ رقم الطلب.',
      ],
      [
        'ادفع',
        'بـ USDT عبر BEP20 ويُتحقق تلقائيًا، أو بتحويل محلي، أو اطلب طريقة أخرى.',
      ],
      [
        'تتبّع طلبك',
        'تنتقل تلقائيًا إلى صفحة التتبع وتنسخ الكود عند اكتمال الطلب.',
      ],
    ],
    start: 'ابدأ الطلب',
    track: 'تتبّع طلبًا سابقًا',
    orderPath: '/order/',
    trackPath: '/track/',
  },
  en: {
    heading: 'How to subscribe',
    steps: [
      [
        'Choose the plan',
        `Duolingo Super individual for 12 months at USD ${Number(PRICE_TABLE.individual.en.amount)}.`,
      ],
      [
        'Enter your details',
        'Name, email and WhatsApp number; save your order number.',
      ],
      [
        'Pay',
        'With USDT on BEP20, verified automatically, by local transfer, or request another method.',
      ],
      [
        'Track your order',
        'You land on the tracking page automatically and copy the code once the order is complete.',
      ],
    ],
    start: 'Start your order',
    track: 'Track an existing order',
    orderPath: '/en/order/',
    trackPath: '/en/track/',
  },
} as const;

export function SubscriptionSteps({ locale }: { locale: Locale }) {
  const copy = stepsCopy[locale];
  return (
    <section
      className="subscription-steps"
      aria-labelledby="subscription-steps-heading"
    >
      <h2 id="subscription-steps-heading">{copy.heading}</h2>
      <ol>
        {copy.steps.map(([title, text], index) => (
          <li key={title}>
            <span className="order-step-number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="form-actions">
        <a className="primary-button" href={copy.orderPath}>
          {copy.start}
        </a>
        <a className="text-button" href={copy.trackPath}>
          {copy.track}
        </a>
      </div>
    </section>
  );
}
