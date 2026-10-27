export type Locale = 'ar' | 'en';

export const orderCopy = {
  ar: {
    steps: ['اختر الاشتراك', 'بياناتك', 'الدفع', 'تتبّع الطلب'],
    planHeading: 'اختر الاشتراك',
    individual: 'Duolingo Super فردي — 12 شهرًا',
    individualNote: 'رابط اشتراك لمدة 12 شهرًا لحساب واحد.',
    family: 'Duolingo Super العائلي',
    familyNote: 'السعر يُحدد عند الطلب؛ أرسل طلبًا وستتواصل معك الإدارة.',
    familyAction: 'اطلب الخيار العائلي',
    choose: 'اختر هذا الاشتراك',
    detailsHeading: 'أدخل بياناتك',
    detailsHint: 'نستخدم هذه البيانات للتواصل معك بشأن طلبك وتسليم الكود فقط.',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    emailHint: 'ستحتاجه مع رقم الطلب لتتبّع طلبك.',
    whatsapp: 'رقم واتساب',
    whatsappHint: 'مع رمز الدولة، مثل ‎+966…',
    back: 'رجوع',
    toPayment: 'متابعة إلى الدفع',
    creating: 'جارٍ إنشاء الطلب…',
    orderCreated: 'تم إنشاء طلبك',
    saveOrder: 'احفظ رقم طلبك؛ ستحتاجه مع بريدك لتتبّع الطلب واستلام الكود.',
    orderNumber: 'رقم الطلب',
    copy: 'نسخ',
    copied: 'تم النسخ',
    total: 'المبلغ',
    payHeading: 'ادفع لإكمال طلبك',
    cryptoTitle: 'USDT عبر شبكة BNB Smart Chain (BEP20)',
    cryptoSteps: [
      'من Binance أو أي محفظة، أرسل USDT على شبكة BNB Smart Chain (BEP20) فقط.',
      'أرسل المبلغ الظاهر بالضبط حتى يُطابق طلبك تلقائيًا؛ رسوم الشبكة أو السحب تُضاف عليه ولا تُخصم منه.',
      'بعد الإرسال الصق رقم العملية (TxID) واضغط «تحقق من الدفع».',
    ],
    exactAmount: 'المبلغ المطلوب بالضبط',
    address: 'عنوان الاستلام (BEP20)',
    txLabel: 'رقم العملية (TxID / Transaction hash)',
    txHint: 'يبدأ بـ 0x ويتكون من 66 حرفًا.',
    verify: 'تحقق من الدفع',
    verifying: 'جارٍ التحقق من الشبكة…',
    cryptoUnavailable:
      'الدفع عبر USDT قيد التجهيز حاليًا. استخدم التحويل المحلي أدناه أو اطلب طريقة دفع أخرى.',
    transferTitle: 'تحويل بنكي أو محفظة إلكترونية',
    transferIntro:
      'حوّل المبلغ إلى أحد الحسابات التالية، ثم أدخل اسم الوسيلة ورقم الحوالة. ستراجع الإدارة الحوالة يدويًا.',
    method: 'الوسيلة المستخدمة',
    reference: 'رقم الحوالة أو المرجع',
    report: 'أرسل بيانات الحوالة',
    reporting: 'جارٍ الإرسال…',
    otherTitle: 'لا تتوفر لديك هذه الطرق؟',
    otherIntro:
      'أرسل طلب طريقة دفع أخرى، وستتواصل معك الإدارة عبر واتساب أو البريد.',
    preferred: 'طريقة الدفع التي تناسبك',
    note: 'ملاحظة (اختياري)',
    sendRequest: 'أرسل الطلب',
    sending: 'جارٍ الإرسال…',
    requestSent: 'وصل طلبك. ستتواصل معك الإدارة قريبًا عبر واتساب أو البريد.',
    trackHeading: 'تتبّع طلبك',
    trackIntro: 'أدخل رقم الطلب والبريد الإلكتروني المستخدم عند الطلب.',
    lookup: 'اعرض حالة الطلب',
    looking: 'جارٍ البحث…',
    statusLabel: 'الحالة',
    status: {
      awaiting_payment: 'بانتظار الدفع',
      payment_review: 'الدفع قيد المراجعة',
      paid: 'تم الدفع — جارٍ تجهيز الكود',
      fulfilled: 'مكتمل — الكود جاهز',
      cancelled: 'ملغى',
    },
    statusHelp: {
      awaiting_payment: 'لم يصل الدفع بعد. أكمل الدفع من صفحة الطلب.',
      payment_review:
        'استلمنا بيانات الحوالة وتراجعها الإدارة. ستتحدث الصفحة تلقائيًا.',
      paid: 'تأكد الدفع وسيُضاف الكود فور توفره. ستتحدث الصفحة تلقائيًا.',
      fulfilled: 'انسخ الكود أو الرابط أدناه واحتفظ به في مكان آمن.',
      cancelled: 'هذا الطلب ملغى. تواصل معنا إن كان ذلك خطأ.',
    },
    codeHeading: 'كود الاشتراك',
    codeHelp:
      'اضغط «نسخ» ثم استخدم الكود أو افتح الرابط من حساب Duolingo الذي تريد تفعيل الاشتراك عليه. لا تشاركه مع أحد.',
    openLink: 'افتح الرابط',
    continuePayment: 'أكمل الدفع',
    details: 'تفاصيل الطلب',
    plan: 'الاشتراك',
    created: 'تاريخ الطلب',
    paidAt: 'تاريخ الدفع',
    payMethod: 'وسيلة الدفع',
    newOrder: 'طلب جديد',
    errors: {
      invalid_input: 'تحقق من الحقول المظللة.',
      order_not_found:
        'لم نجد طلبًا بهذا الرقم والبريد. تأكد منهما وحاول مجددًا.',
      payment_not_found:
        'لم نجد العملية على الشبكة بعد. انتظر دقيقة ثم حاول مجددًا.',
      payment_no_match:
        'العملية لا تطابق الطلب. تأكد من الشبكة BEP20 وعنوان الاستلام والمبلغ المطلوب بالضبط.',
      payment_failed: 'العملية فاشلة على الشبكة. تحقق منها في محفظتك.',
      payment_before_order: 'هذه العملية أقدم من طلبك ولا يمكن احتسابها له.',
      payment_confirmations:
        'العملية في طريقها؛ تنتظر تأكيدات الشبكة. حاول مجددًا بعد دقيقة.',
      tx_already_used: 'رقم العملية هذا مستخدم في طلب آخر.',
      crypto_unavailable: 'الدفع عبر USDT غير متاح حاليًا.',
      plan_unavailable: 'هذا الاشتراك غير متاح للطلب المباشر حاليًا.',
      order_cancelled: 'هذا الطلب ملغى.',
      database_unconfigured:
        'نظام الطلبات قيد الإعداد. تواصل معنا عبر واتساب أو البريد.',
      database_unavailable:
        'تعذر الوصول إلى نظام الطلبات مؤقتًا. حاول بعد قليل.',
      codes_key_missing:
        'نظام الطلبات قيد الإعداد. تواصل معنا عبر واتساب أو البريد.',
      network: 'تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.',
      fallback: 'حدث خطأ غير متوقع. حاول مجددًا أو تواصل معنا.',
    },
    fieldErrors: {
      name: 'اكتب اسمك (حرفان على الأقل).',
      email: 'اكتب بريدًا إلكترونيًا صحيحًا.',
      whatsapp: 'اكتب رقم واتساب صحيحًا مع رمز الدولة.',
      txHash: 'رقم العملية يبدأ بـ 0x ويتكون من 66 حرفًا.',
      reference: 'اكتب رقم الحوالة (3 أحرف على الأقل).',
      method: 'اختر الوسيلة المستخدمة.',
      preferredMethod: 'اكتب طريقة الدفع التي تناسبك.',
      orderId: 'رقم الطلب يبدأ بـ LG- ثم 10 أحرف.',
    },
    trackPath: '/track/',
    orderPath: '/order/',
    paymentMethodsPath: '/payment-methods/',
    paymentMethodsLink: 'تفاصيل طرق الدفع',
  },
  en: {
    steps: ['Choose plan', 'Your details', 'Payment', 'Track order'],
    planHeading: 'Choose your subscription',
    individual: 'Duolingo Super individual — 12 months',
    individualNote: 'A 12-month subscription link for one account.',
    family: 'Duolingo Super Family',
    familyNote:
      'Priced on request; send a request and the team will contact you.',
    familyAction: 'Request the Family option',
    choose: 'Choose this plan',
    detailsHeading: 'Enter your details',
    detailsHint:
      'We use these details only to contact you about this order and deliver the code.',
    name: 'Name',
    email: 'Email',
    emailHint: 'You need it with your order number to track the order.',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'Include the country code, e.g. +966…',
    back: 'Back',
    toPayment: 'Continue to payment',
    creating: 'Creating your order…',
    orderCreated: 'Your order is created',
    saveOrder:
      'Save your order number; you need it with your email to track the order and receive the code.',
    orderNumber: 'Order number',
    copy: 'Copy',
    copied: 'Copied',
    total: 'Amount',
    payHeading: 'Pay to complete your order',
    cryptoTitle: 'USDT on BNB Smart Chain (BEP20)',
    cryptoSteps: [
      'From Binance or any wallet, send USDT on the BNB Smart Chain (BEP20) network only.',
      'Send exactly the amount shown so the payment matches your order automatically; network or withdrawal fees go on top, not out of it.',
      'After sending, paste the transaction ID (TxID) and select “Verify payment”.',
    ],
    exactAmount: 'Exact amount to send',
    address: 'Receiving address (BEP20)',
    txLabel: 'Transaction ID (TxID / transaction hash)',
    txHint: 'Starts with 0x and is 66 characters long.',
    verify: 'Verify payment',
    verifying: 'Checking the network…',
    cryptoUnavailable:
      'USDT payment is being set up. Use a local transfer below or request another payment method.',
    transferTitle: 'Bank transfer or e-wallet',
    transferIntro:
      'Transfer the amount to one of these accounts, then enter the method and transfer reference. The team reviews transfers manually.',
    method: 'Method used',
    reference: 'Transfer number or reference',
    report: 'Send transfer details',
    reporting: 'Sending…',
    otherTitle: 'None of these methods available to you?',
    otherIntro:
      'Request another payment method and the team will contact you by WhatsApp or email.',
    preferred: 'Payment method that suits you',
    note: 'Note (optional)',
    sendRequest: 'Send request',
    sending: 'Sending…',
    requestSent:
      'Request received. The team will contact you soon by WhatsApp or email.',
    trackHeading: 'Track your order',
    trackIntro: 'Enter the order number and the email you used when ordering.',
    lookup: 'Show order status',
    looking: 'Searching…',
    statusLabel: 'Status',
    status: {
      awaiting_payment: 'Awaiting payment',
      payment_review: 'Payment under review',
      paid: 'Paid — preparing your code',
      fulfilled: 'Complete — code ready',
      cancelled: 'Cancelled',
    },
    statusHelp: {
      awaiting_payment:
        'Payment has not arrived yet. Complete payment from the order page.',
      payment_review:
        'We received your transfer details and the team is reviewing them. This page refreshes automatically.',
      paid: 'Payment is confirmed and your code is added as soon as it is available. This page refreshes automatically.',
      fulfilled: 'Copy the code or link below and keep it somewhere safe.',
      cancelled: 'This order is cancelled. Contact us if this is a mistake.',
    },
    codeHeading: 'Subscription code',
    codeHelp:
      'Select “Copy”, then use the code or open the link from the Duolingo account you want to activate. Do not share it with anyone.',
    openLink: 'Open link',
    continuePayment: 'Complete payment',
    details: 'Order details',
    plan: 'Plan',
    created: 'Ordered',
    paidAt: 'Paid',
    payMethod: 'Payment method',
    newOrder: 'New order',
    errors: {
      invalid_input: 'Check the highlighted fields.',
      order_not_found:
        'No order matches this number and email. Check both and try again.',
      payment_not_found:
        'The transaction is not on the network yet. Wait a minute and try again.',
      payment_no_match:
        'The transaction does not match this order. Check the BEP20 network, receiving address and exact amount.',
      payment_failed:
        'The transaction failed on the network. Check it in your wallet.',
      payment_before_order:
        'This transaction is older than your order and cannot be counted for it.',
      payment_confirmations:
        'The transaction is on its way and waiting for network confirmations. Try again in a minute.',
      tx_already_used: 'This transaction ID is already used for another order.',
      crypto_unavailable: 'USDT payment is not available right now.',
      plan_unavailable: 'This plan cannot be ordered directly right now.',
      order_cancelled: 'This order is cancelled.',
      database_unconfigured:
        'The order system is being set up. Contact us by WhatsApp or email.',
      database_unavailable:
        'The order system is temporarily unreachable. Try again shortly.',
      codes_key_missing:
        'The order system is being set up. Contact us by WhatsApp or email.',
      network:
        'Could not connect. Check your internet connection and try again.',
      fallback: 'Something went wrong. Try again or contact us.',
    },
    fieldErrors: {
      name: 'Enter your name (at least 2 characters).',
      email: 'Enter a valid email address.',
      whatsapp: 'Enter a valid WhatsApp number with the country code.',
      txHash: 'The transaction ID starts with 0x and is 66 characters long.',
      reference: 'Enter the transfer reference (at least 3 characters).',
      method: 'Choose the method you used.',
      preferredMethod: 'Enter the payment method that suits you.',
      orderId: 'The order number starts with LG- followed by 10 characters.',
    },
    trackPath: '/en/track/',
    orderPath: '/en/order/',
    paymentMethodsPath: '/en/payment-methods/',
    paymentMethodsLink: 'Payment method details',
  },
} as const;

export type OrderCopy = (typeof orderCopy)[Locale];
export type OrderStatus = keyof OrderCopy['status'];

export type OrderView = {
  id: string;
  status: OrderStatus;
  plan: string;
  track: Locale;
  amount: string;
  currency: string;
  usdtAmount: string;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  code: string | null;
  payment: { bep20Address: string | null; network: string; token: string };
};

export const fieldPatterns = {
  name: (value: string) => value.trim().length >= 2,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value.trim()),
  whatsapp: (value: string) =>
    /^\+?[0-9]{7,15}$/u.test(value.replace(/[\s()-]/gu, '')),
  txHash: (value: string) => /^0x[0-9a-fA-F]{64}$/u.test(value.trim()),
  reference: (value: string) => value.trim().length >= 3,
  method: (value: string) => value.trim().length >= 2,
  preferredMethod: (value: string) => value.trim().length >= 2,
  orderId: (value: string) =>
    /^LG-[2-9A-Z]{10}$/u.test(value.trim().toUpperCase()),
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; detail: Record<string, unknown> };

export async function postJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (response.ok) return { ok: true, data: data as T };
    return { ok: false, error: String(data.error ?? 'fallback'), detail: data };
  } catch {
    return { ok: false, error: 'network', detail: {} };
  }
}

export function errorMessage(copy: OrderCopy, error: string) {
  return (copy.errors as Record<string, string>)[error] ?? copy.errors.fallback;
}

export const LAST_ORDER_KEY = 'lingora:last-order';

export function rememberOrder(id: string, email: string) {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ id, email }));
  } catch {
    // Storage can be unavailable (private mode); the order number is shown for manual saving.
  }
}

export function recallOrder(): { id: string; email: string } | null {
  try {
    const value = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) ?? 'null');
    return value &&
      typeof value.id === 'string' &&
      typeof value.email === 'string'
      ? value
      : null;
  } catch {
    return null;
  }
}

/** Order references travel in the URL fragment so they never reach server logs. */
export function readOrderFragment(): { id: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const id = params.get('order');
  const email = params.get('email');
  return id && email ? { id, email } : null;
}

export function orderFragment(id: string, email: string) {
  return `#${new URLSearchParams({ order: id, email }).toString()}`;
}
