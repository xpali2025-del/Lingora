'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PRICE_TABLE } from '@/server/prices.mjs';
import { CopyButton } from './CopyButton';
import { Field } from './Field';
import {
  errorMessage,
  fieldPatterns,
  orderCopy,
  orderFragment,
  postJson,
  readOrderFragment,
  rememberOrder,
  type Locale,
  type OrderView,
} from './order-copy';

export type TransferAccount = { label: string; value: string; details: string };

type Step = 1 | 2 | 3;

function formatPrice(locale: Locale) {
  const price = PRICE_TABLE.individual[locale];
  return locale === 'ar'
    ? `${Number(price.amount)} ر.س / ${Number(price.amount)} SAR`
    : `USD ${Number(price.amount)}`;
}

export function OrderFlow({
  locale,
  transferAccounts,
}: {
  locale: Locale;
  transferAccounts: TransferAccount[];
}) {
  const copy = orderCopy[locale];
  const [step, setStep] = useState<Step>(1);
  const [details, setDetails] = useState({ name: '', email: '', whatsapp: '' });
  const [order, setOrder] = useState<OrderView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState<string | null>(null);
  const [txHash, setTxHash] = useState('');
  const [transfer, setTransfer] = useState({ method: '', reference: '' });
  const [request, setRequest] = useState({ preferredMethod: '', note: '' });
  const [requestSent, setRequestSent] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Resume a pending order from the tracking page link.
  useEffect(() => {
    const fragment = readOrderFragment();
    if (!fragment) return;
    void (async () => {
      const result = await postJson<OrderView>('/api/order-lookup', {
        orderId: fragment.id,
        email: fragment.email,
      });
      if (!result.ok) return;
      if (
        result.data.status !== 'awaiting_payment' &&
        result.data.status !== 'payment_review'
      ) {
        window.location.assign(
          copy.trackPath + orderFragment(fragment.id, fragment.email),
        );
        return;
      }
      setDetails((current) => ({ ...current, email: fragment.email }));
      setOrder(result.data);
      setStep(3);
    })();
  }, [copy.trackPath]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, showRequest]);

  function goToTracking(view: OrderView, email: string) {
    rememberOrder(view.id, email);
    window.location.assign(copy.trackPath + orderFragment(view.id, email));
  }

  async function createOrder(event: FormEvent) {
    event.preventDefault();
    setAttempted('create');
    if (
      !fieldPatterns.name(details.name) ||
      !fieldPatterns.email(details.email) ||
      !fieldPatterns.whatsapp(details.whatsapp)
    )
      return;
    setBusy('create');
    setError(null);
    const result = await postJson<OrderView>('/api/order-create', {
      track: locale,
      plan: 'individual',
      ...details,
    });
    setBusy(null);
    if (!result.ok) return setError(errorMessage(copy, result.error));
    setOrder(result.data);
    rememberOrder(result.data.id, details.email);
    window.history.replaceState(
      null,
      '',
      orderFragment(result.data.id, details.email),
    );
    setAttempted(null);
    setStep(3);
  }

  async function verifyCrypto(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    setAttempted('verify');
    if (!fieldPatterns.txHash(txHash)) return;
    setBusy('verify');
    setError(null);
    const result = await postJson<OrderView>('/api/order-verify', {
      orderId: order.id,
      email: details.email,
      txHash: txHash.trim(),
    });
    setBusy(null);
    if (!result.ok) return setError(errorMessage(copy, result.error));
    goToTracking(result.data, details.email);
  }

  async function reportTransfer(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    setAttempted('report');
    if (
      !fieldPatterns.method(transfer.method) ||
      !fieldPatterns.reference(transfer.reference)
    )
      return;
    setBusy('report');
    setError(null);
    const result = await postJson<OrderView>('/api/order-report', {
      orderId: order.id,
      email: details.email,
      ...transfer,
    });
    setBusy(null);
    if (!result.ok) return setError(errorMessage(copy, result.error));
    goToTracking(result.data, details.email);
  }

  async function sendRequest(event: FormEvent) {
    event.preventDefault();
    setAttempted('request');
    if (
      !fieldPatterns.name(details.name) ||
      !fieldPatterns.email(details.email) ||
      !fieldPatterns.whatsapp(details.whatsapp) ||
      !fieldPatterns.preferredMethod(request.preferredMethod)
    )
      return;
    setBusy('request');
    setError(null);
    const result = await postJson('/api/payment-request', {
      track: locale,
      ...details,
      ...request,
      orderId: order?.id ?? '',
    });
    setBusy(null);
    if (!result.ok) return setError(errorMessage(copy, result.error));
    setRequestSent(true);
  }

  const visibleStep = showRequest ? 3 : step;

  return (
    <div className="order-flow">
      <ol className="order-steps">
        {copy.steps.map((label, index) => (
          <li
            key={label}
            aria-current={index + 1 === visibleStep ? 'step' : undefined}
            className={index + 1 < visibleStep ? 'is-done' : undefined}
          >
            <span className="order-step-number">{index + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      {showRequest ? (
        <section className="order-panel" aria-labelledby="request-heading">
          <h2 id="request-heading" ref={headingRef} tabIndex={-1}>
            {copy.otherTitle}
          </h2>
          {requestForm()}
          <button
            type="button"
            className="text-button"
            onClick={() => setShowRequest(false)}
          >
            {copy.back}
          </button>
        </section>
      ) : step === 1 ? (
        <section className="order-panel" aria-labelledby="plan-heading">
          <h2 id="plan-heading" ref={headingRef} tabIndex={-1}>
            {copy.planHeading}
          </h2>
          <div className="plan-grid">
            <article className="plan-card is-primary">
              <h3>{copy.individual}</h3>
              <p className="plan-price">{formatPrice(locale)}</p>
              <p>{copy.individualNote}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep(2)}
              >
                {copy.choose}
              </button>
            </article>
            <article className="plan-card">
              <h3>{copy.family}</h3>
              <p>{copy.familyNote}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setRequest({ preferredMethod: copy.family, note: '' });
                  setShowRequest(true);
                }}
              >
                {copy.familyAction}
              </button>
            </article>
          </div>
        </section>
      ) : step === 2 ? (
        <section className="order-panel" aria-labelledby="details-heading">
          <h2 id="details-heading" ref={headingRef} tabIndex={-1}>
            {copy.detailsHeading}
          </h2>
          <p className="order-muted">{copy.detailsHint}</p>
          <form noValidate onSubmit={createOrder} className="order-form">
            {detailFields(attempted === 'create' || attempted === 'request')}
            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={busy === 'create'}
              >
                {busy === 'create' ? copy.creating : copy.toPayment}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setStep(1)}
              >
                {copy.back}
              </button>
            </div>
          </form>
        </section>
      ) : order ? (
        <section className="order-panel" aria-labelledby="payment-heading">
          <div className="order-summary">
            <p className="order-success">{copy.orderCreated}</p>
            <div className="order-number">
              <span>{copy.orderNumber}</span>
              <bdi dir="ltr">{order.id}</bdi>
              <CopyButton
                value={order.id}
                label={copy.copy}
                copiedLabel={copy.copied}
              />
            </div>
            <p className="order-muted">{copy.saveOrder}</p>
          </div>

          <h2 id="payment-heading" ref={headingRef} tabIndex={-1}>
            {copy.payHeading}
          </h2>

          <div className="payment-method-panel">
            <h3>{copy.cryptoTitle}</h3>
            {order.payment.bep20Address ? (
              <>
                <ol className="payment-instructions">
                  {copy.cryptoSteps.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
                <div className="copy-row">
                  <span>{copy.exactAmount}</span>
                  <bdi dir="ltr" className="copy-value">
                    {order.usdtAmount} USDT
                  </bdi>
                  <CopyButton
                    value={order.usdtAmount}
                    label={copy.copy}
                    copiedLabel={copy.copied}
                  />
                </div>
                <div className="copy-row">
                  <span>{copy.address}</span>
                  <bdi dir="ltr" className="copy-value">
                    {order.payment.bep20Address}
                  </bdi>
                  <CopyButton
                    value={order.payment.bep20Address}
                    label={copy.copy}
                    copiedLabel={copy.copied}
                  />
                </div>
                <form noValidate onSubmit={verifyCrypto} className="order-form">
                  <Field
                    label={copy.txLabel}
                    hint={copy.txHint}
                    error={copy.fieldErrors.txHash}
                    value={txHash}
                    valid={fieldPatterns.txHash}
                    onValue={setTxHash}
                    forceError={attempted === 'verify'}
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busy === 'verify'}
                  >
                    {busy === 'verify' ? copy.verifying : copy.verify}
                  </button>
                </form>
              </>
            ) : (
              <p className="order-muted">{copy.cryptoUnavailable}</p>
            )}
          </div>

          <div className="payment-method-panel">
            <h3>{copy.transferTitle}</h3>
            <p className="order-muted">{copy.transferIntro}</p>
            <ul className="transfer-list">
              {transferAccounts.map((account) => (
                <li key={account.value}>
                  <span>{account.label}</span>
                  <bdi dir="ltr" className="copy-value">
                    {account.value}
                  </bdi>
                  <CopyButton
                    value={account.value}
                    label={copy.copy}
                    copiedLabel={copy.copied}
                  />
                </li>
              ))}
            </ul>
            <p className="order-muted">
              {copy.total}:{' '}
              <bdi dir="ltr">
                {Number(order.amount)} {order.currency}
              </bdi>
              {' · '}
              <a href={copy.paymentMethodsPath}>{copy.paymentMethodsLink}</a>
            </p>
            <form noValidate onSubmit={reportTransfer} className="order-form">
              <div className="form-field">
                <label htmlFor="transfer-method">{copy.method}</label>
                <select
                  id="transfer-method"
                  value={transfer.method}
                  onChange={(event) =>
                    setTransfer({ ...transfer, method: event.target.value })
                  }
                  aria-invalid={
                    attempted === 'report' &&
                    !fieldPatterns.method(transfer.method)
                      ? true
                      : undefined
                  }
                >
                  <option value="">—</option>
                  {transferAccounts.map((account) => (
                    <option key={account.value} value={account.label}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label={copy.reference}
                error={copy.fieldErrors.reference}
                value={transfer.reference}
                valid={fieldPatterns.reference}
                onValue={(reference) => setTransfer({ ...transfer, reference })}
                forceError={attempted === 'report'}
                autoComplete="off"
              />
              <button
                type="submit"
                className="secondary-button"
                disabled={busy === 'report'}
              >
                {busy === 'report' ? copy.reporting : copy.report}
              </button>
            </form>
          </div>

          <div className="payment-method-panel is-quiet">
            <h3>{copy.otherTitle}</h3>
            <p className="order-muted">{copy.otherIntro}</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowRequest(true)}
            >
              {copy.sendRequest}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );

  function detailFields(forceError: boolean) {
    return (
      <>
        <Field
          label={copy.name}
          error={copy.fieldErrors.name}
          value={details.name}
          valid={fieldPatterns.name}
          onValue={(name) => setDetails((current) => ({ ...current, name }))}
          forceError={forceError}
          autoComplete="name"
        />
        <Field
          label={copy.email}
          hint={copy.emailHint}
          error={copy.fieldErrors.email}
          value={details.email}
          valid={fieldPatterns.email}
          onValue={(email) => setDetails((current) => ({ ...current, email }))}
          forceError={forceError}
          type="email"
          dir="ltr"
          autoComplete="email"
        />
        <Field
          label={copy.whatsapp}
          hint={copy.whatsappHint}
          error={copy.fieldErrors.whatsapp}
          value={details.whatsapp}
          valid={fieldPatterns.whatsapp}
          onValue={(whatsapp) =>
            setDetails((current) => ({ ...current, whatsapp }))
          }
          forceError={forceError}
          type="tel"
          dir="ltr"
          autoComplete="tel"
        />
      </>
    );
  }

  function requestForm() {
    if (requestSent)
      return (
        <p className="order-success" role="status">
          {copy.requestSent}
        </p>
      );
    return (
      <form noValidate onSubmit={sendRequest} className="order-form">
        <p className="order-muted">{copy.otherIntro}</p>
        {detailFields(attempted === 'create' || attempted === 'request')}
        <Field
          label={copy.preferred}
          error={copy.fieldErrors.preferredMethod}
          value={request.preferredMethod}
          valid={fieldPatterns.preferredMethod}
          onValue={(preferredMethod) =>
            setRequest((current) => ({ ...current, preferredMethod }))
          }
          forceError={attempted === 'request'}
        />
        <Field
          label={copy.note}
          value={request.note}
          valid={() => true}
          onValue={(note) => setRequest((current) => ({ ...current, note }))}
          multiline
        />
        <button
          type="submit"
          className="primary-button"
          disabled={busy === 'request'}
        >
          {busy === 'request' ? copy.sending : copy.sendRequest}
        </button>
      </form>
    );
  }
}
