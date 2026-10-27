'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { CopyButton } from './CopyButton';
import { Field } from './Field';
import {
  errorMessage,
  fieldPatterns,
  orderCopy,
  orderFragment,
  postJson,
  readOrderFragment,
  recallOrder,
  rememberOrder,
  type Locale,
  type OrderView,
} from './order-copy';

const REFRESH_MS = 20_000;
const MAX_REFRESHES = 45;

function formatDate(value: string | null, locale: Locale) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function OrderTracker({ locale }: { locale: Locale }) {
  const copy = orderCopy[locale];
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const refreshes = useRef(0);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const lookup = useCallback(
    async (id: string, mail: string, quiet = false) => {
      if (!quiet) {
        setBusy(true);
        setError(null);
      }
      const result = await postJson<OrderView>('/api/order-lookup', {
        orderId: id.trim().toUpperCase(),
        email: mail.trim(),
      });
      if (!quiet) setBusy(false);
      if (!result.ok) {
        if (!quiet) {
          setOrder(null);
          setError(errorMessage(copy, result.error));
        }
        return;
      }
      setOrder(result.data);
      rememberOrder(result.data.id, mail.trim());
      window.history.replaceState(
        null,
        '',
        orderFragment(result.data.id, mail.trim()),
      );
      if (!quiet)
        window.requestAnimationFrame(() => resultRef.current?.focus());
    },
    [copy],
  );

  // Auto-fill from the payment redirect link, or from the last order on this device.
  useEffect(() => {
    const saved = readOrderFragment() ?? recallOrder();
    if (!saved) return;
    setOrderId(saved.id);
    setEmail(saved.email);
    void lookup(saved.id, saved.email);
  }, [lookup]);

  // Refresh while the order is waiting on review or stock, so the code appears without reloading.
  useEffect(() => {
    if (
      !order ||
      (order.status !== 'payment_review' && order.status !== 'paid')
    )
      return;
    const timer = window.setInterval(() => {
      refreshes.current += 1;
      if (refreshes.current > MAX_REFRESHES) return window.clearInterval(timer);
      void lookup(order.id, email, true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [order, email, lookup]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (!fieldPatterns.orderId(orderId) || !fieldPatterns.email(email)) return;
    refreshes.current = 0;
    void lookup(orderId, email);
  }

  const isLink = order?.code ? /^https?:\/\//iu.test(order.code) : false;

  return (
    <div className="order-flow">
      <form noValidate onSubmit={submit} className="order-form tracker-form">
        <Field
          label={copy.orderNumber}
          error={copy.fieldErrors.orderId}
          value={orderId}
          valid={fieldPatterns.orderId}
          onValue={setOrderId}
          forceError={attempted}
          dir="ltr"
          autoComplete="off"
          spellCheck={false}
          placeholder="LG-XXXXXXXXXX"
        />
        <Field
          label={copy.email}
          error={copy.fieldErrors.email}
          value={email}
          valid={fieldPatterns.email}
          onValue={setEmail}
          forceError={attempted}
          type="email"
          dir="ltr"
          autoComplete="email"
        />
        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? copy.looking : copy.lookup}
        </button>
      </form>

      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      {order && (
        <section
          className="order-panel tracker-result"
          aria-labelledby="tracker-status"
        >
          <p className="order-muted">{copy.statusLabel}</p>
          <h2
            id="tracker-status"
            ref={resultRef}
            tabIndex={-1}
            className={`status-badge status-${order.status}`}
          >
            {copy.status[order.status]}
          </h2>
          <p className="order-muted" aria-live="polite">
            {copy.statusHelp[order.status]}
          </p>

          {order.status === 'fulfilled' && order.code && (
            <div className="code-box">
              <h3>{copy.codeHeading}</h3>
              <bdi dir="ltr" className="code-value">
                {order.code}
              </bdi>
              <div className="form-actions">
                <CopyButton
                  value={order.code}
                  label={copy.copy}
                  copiedLabel={copy.copied}
                />
                {isLink && (
                  <a
                    className="secondary-button"
                    href={order.code}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.openLink}
                  </a>
                )}
              </div>
              <p className="order-muted">{copy.codeHelp}</p>
            </div>
          )}

          {(order.status === 'awaiting_payment' ||
            order.status === 'payment_review') && (
            <a
              className="primary-button"
              href={copy.orderPath + orderFragment(order.id, email.trim())}
            >
              {copy.continuePayment}
            </a>
          )}

          <details
            className="order-details"
            open={order.status !== 'fulfilled'}
          >
            <summary>{copy.details}</summary>
            <dl>
              <div>
                <dt>{copy.orderNumber}</dt>
                <dd>
                  <bdi dir="ltr">{order.id}</bdi>{' '}
                  <CopyButton
                    value={order.id}
                    label={copy.copy}
                    copiedLabel={copy.copied}
                  />
                </dd>
              </div>
              <div>
                <dt>{copy.plan}</dt>
                <dd>{copy.individual}</dd>
              </div>
              <div>
                <dt>{copy.total}</dt>
                <dd>
                  <bdi dir="ltr">
                    {Number(order.amount)} {order.currency} · {order.usdtAmount}{' '}
                    USDT
                  </bdi>
                </dd>
              </div>
              <div>
                <dt>{copy.payMethod}</dt>
                <dd>
                  {order.paymentMethod === 'usdt_bep20'
                    ? copy.cryptoTitle
                    : (order.paymentMethod ?? '—')}
                </dd>
              </div>
              <div>
                <dt>{copy.created}</dt>
                <dd>{formatDate(order.createdAt, locale)}</dd>
              </div>
              <div>
                <dt>{copy.paidAt}</dt>
                <dd>{formatDate(order.paidAt, locale)}</dd>
              </div>
            </dl>
          </details>
        </section>
      )}
    </div>
  );
}
