'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { orderCopy, type OrderStatus } from './order-copy';

const TOKEN_KEY = 'lingora:admin-token';
const statusLabels = orderCopy.ar.status;

type AdminOrder = {
  id: string;
  status: OrderStatus;
  customer_name: string;
  email: string;
  whatsapp: string;
  amount: string;
  currency: string;
  usdt_amount: string;
  payment_method: string | null;
  payment_reference: string | null;
  tx_hash: string | null;
  created_at: string;
};

type PaymentRequest = {
  id: number;
  customer_name: string;
  email: string;
  whatsapp: string;
  preferred_method: string;
  note: string;
  order_id: string | null;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
};

const requestStatus = { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' };

function whatsappLink(number: string) {
  return `https://wa.me/${number.replace(/[^0-9]/gu, '')}`;
}

export function AdminDashboard() {
  const [token, setToken] = useState('');
  const [draftToken, setDraftToken] = useState('');
  const [tab, setTab] = useState<'orders' | 'requests' | 'stock'>('orders');
  const [filter, setFilter] = useState<string>('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [available, setAvailable] = useState<number | null>(null);
  const [codes, setCodes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(TOKEN_KEY) ?? '');
    } catch {
      // Session storage unavailable: the owner signs in again per visit.
    }
  }, []);

  const api = useCallback(
    async (path: string, body?: unknown) => {
      const response = await fetch(`/api/${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setToken('');
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {}
      }
      if (!response.ok) throw new Error(String(data.error ?? response.status));
      return data;
    },
    [token],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setMessage(null);
    try {
      const query = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const [orderData, requestData] = await Promise.all([
        api(`admin-orders${query}`),
        api('admin-requests'),
      ]);
      setOrders(orderData.orders);
      setAvailable(orderData.available);
      setRequests(requestData.requests);
    } catch (error) {
      setMessage(`تعذر التحميل: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [api, filter, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function signIn(event: FormEvent) {
    event.preventDefault();
    setToken(draftToken.trim());
    try {
      sessionStorage.setItem(TOKEN_KEY, draftToken.trim());
    } catch {}
    setDraftToken('');
  }

  async function act(label: string, work: () => Promise<unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await work();
      setMessage(typeof result === 'string' ? result : label);
      await refresh();
    } catch (error) {
      setMessage(`تعذر التنفيذ: ${(error as Error).message}`);
      setBusy(false);
    }
  }

  if (!token)
    return (
      <form className="order-form admin-login" onSubmit={signIn}>
        <div className="form-field">
          <label htmlFor="admin-token">رمز الإدارة</label>
          <input
            id="admin-token"
            type="password"
            autoComplete="current-password"
            value={draftToken}
            onChange={(event) => setDraftToken(event.target.value)}
          />
          <small className="form-hint">
            قيمة LINGORA_ADMIN_TOKEN من إعدادات الاستضافة.
          </small>
        </div>
        <button
          type="submit"
          className="primary-button"
          disabled={draftToken.trim().length < 24}
        >
          دخول لوحة الطلبات
        </button>
      </form>
    );

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar">
        <nav className="admin-tabs" aria-label="أقسام اللوحة">
          {(
            [
              ['orders', 'الطلبات'],
              [
                'requests',
                `طلبات طرق الدفع (${requests.filter((item) => item.status === 'new').length})`,
              ],
              ['stock', `مخزون الأكواد (${available ?? '—'})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              className={tab === id ? 'is-active' : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="text-button"
          onClick={() => void refresh()}
          disabled={busy}
        >
          تحديث
        </button>
      </div>

      {message && (
        <p className="form-alert" role="status">
          {message}
        </p>
      )}

      {tab === 'orders' && (
        <section aria-label="الطلبات">
          <div className="form-field admin-filter">
            <label htmlFor="status-filter">تصفية حسب الحالة</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">كل الطلبات</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {orders.length === 0 ? (
            <p className="order-muted">لا توجد طلبات بهذه الحالة.</p>
          ) : (
            <ul className="admin-list">
              {orders.map((order) => (
                <li key={order.id} className="admin-card">
                  <div className="admin-card-head">
                    <bdi dir="ltr">{order.id}</bdi>
                    <span className={`status-badge status-${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p>
                    {order.customer_name} · <bdi dir="ltr">{order.email}</bdi> ·{' '}
                    <a
                      href={whatsappLink(order.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                    >
                      {order.whatsapp}
                    </a>
                  </p>
                  <p className="order-muted">
                    <bdi dir="ltr">
                      {Number(order.amount)} {order.currency} ·{' '}
                      {order.usdt_amount} USDT
                    </bdi>
                    {order.payment_method && ` · ${order.payment_method}`}
                    {order.payment_reference && (
                      <>
                        {' · '}
                        <bdi dir="ltr">{order.payment_reference}</bdi>
                      </>
                    )}
                    {' · '}
                    {new Date(order.created_at).toLocaleString('ar-u-nu-latn')}
                  </p>
                  {order.tx_hash && (
                    <a
                      className="admin-link"
                      href={`https://bscscan.com/tx/${order.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      عرض العملية على BscScan
                    </a>
                  )}
                  {(order.status === 'awaiting_payment' ||
                    order.status === 'payment_review' ||
                    order.status === 'paid') && (
                    <div className="form-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={busy}
                        onClick={() =>
                          void act(`تم تأكيد دفع ${order.id}`, () =>
                            api('admin-confirm', { orderId: order.id }),
                          )
                        }
                      >
                        {order.status === 'paid'
                          ? 'إعادة محاولة تسليم الكود'
                          : 'تأكيد الدفع وتسليم الكود'}
                      </button>
                      {order.status !== 'paid' && (
                        <button
                          type="button"
                          className="text-button"
                          disabled={busy}
                          onClick={() => {
                            if (window.confirm(`إلغاء الطلب ${order.id}؟`))
                              void act(`تم إلغاء ${order.id}`, () =>
                                api('admin-cancel', { orderId: order.id }),
                              );
                          }}
                        >
                          إلغاء الطلب {order.id}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'requests' && (
        <section aria-label="طلبات طرق الدفع">
          {requests.length === 0 ? (
            <p className="order-muted">لا توجد طلبات طرق دفع بعد.</p>
          ) : (
            <ul className="admin-list">
              {requests.map((item) => (
                <li key={item.id} className="admin-card">
                  <div className="admin-card-head">
                    <strong>{item.preferred_method}</strong>
                    <span className="status-badge">
                      {requestStatus[item.status]}
                    </span>
                  </div>
                  <p>
                    {item.customer_name} · <bdi dir="ltr">{item.email}</bdi> ·{' '}
                    <a
                      href={whatsappLink(item.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                    >
                      {item.whatsapp}
                    </a>
                  </p>
                  {item.note && <p className="order-muted">{item.note}</p>}
                  {item.order_id && (
                    <p className="order-muted">
                      الطلب: <bdi dir="ltr">{item.order_id}</bdi>
                    </p>
                  )}
                  <div className="form-actions">
                    {(['contacted', 'closed'] as const)
                      .filter((status) => status !== item.status)
                      .map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="secondary-button"
                          disabled={busy}
                          onClick={() =>
                            void act('تم تحديث الطلب', () =>
                              api('admin-requests', { id: item.id, status }),
                            )
                          }
                        >
                          {status === 'contacted' ? 'تم التواصل' : 'إغلاق'}
                        </button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'stock' && (
        <section aria-label="مخزون الأكواد">
          <p>
            الأكواد المتاحة: <strong>{available ?? '—'}</strong>
          </p>
          <form
            className="order-form"
            onSubmit={(event) => {
              event.preventDefault();
              const list = codes
                .split(/\r?\n/u)
                .map((line) => line.trim())
                .filter(Boolean);
              if (!list.length) return;
              void act('تمت إضافة الأكواد', async () => {
                const result = await api('admin-codes', { codes: list });
                setCodes('');
                return `أُضيف ${result.added}، مكرر ${result.duplicates}، سُلّم لطلبات منتظرة ${result.fulfilled}.`;
              });
            }}
          >
            <div className="form-field">
              <label htmlFor="codes-input">
                أضف أكوادًا أو روابط (واحد في كل سطر)
              </label>
              <textarea
                id="codes-input"
                rows={6}
                dir="ltr"
                value={codes}
                onChange={(event) => setCodes(event.target.value)}
              />
              <small className="form-hint">
                تُشفَّر الأكواد عند الحفظ، ويُسلَّم كل كود لطلب واحد فقط.
                الطلبات المدفوعة المنتظرة تُسلَّم تلقائيًا بعد الإضافة.
              </small>
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={busy || !codes.trim()}
            >
              حفظ الأكواد
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
