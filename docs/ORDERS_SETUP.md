# Orders: setup and operation

The site stays a static export. Ordering, tracking and the owner dashboard call a small API in `api/*.mjs`, deployed as Vercel Functions and backed by PostgreSQL.

## Customer flow

1. **Choose the plan** on `/order/` (`/en/order/`). Individual 12-month Super is priced from the server table in `src/server/prices.mjs` (SAR 50 / USD 15). Family is priced on request and sends a request to the owner.
2. **Enter details**: name, email, WhatsApp. The order number (`LG-XXXXXXXXXX`) is shown with a copy button and remembered on the device.
3. **Pay**:
   - **USDT on BNB Smart Chain (BEP20)**, from Binance or any wallet. Each order gets a unique amount (e.g. `15.0437 USDT`). The customer pastes the TxID; the server checks the chain (token contract, recipient, exact amount, confirmations, not older than the order, never reused) and, if valid, marks the order paid and assigns a code automatically.
   - **Bank / wallet transfer** (owner-supplied accounts from the payment-methods page): the customer submits the transfer reference; the owner confirms it in the dashboard, which assigns a code automatically.
   - **Another method**: the customer sends a request; it appears in the dashboard for the owner to contact them.
4. **Track** on `/track/` (`/en/track/`): the customer is redirected there automatically with the order number and email filled in. The page refreshes while payment is under review, then shows the code with a copy button.

## Owner dashboard

`/dashboard/` (not indexed, disallowed in `robots.txt`) asks for `LINGORA_ADMIN_TOKEN`. It lists orders with WhatsApp links, confirms or cancels payments, lists payment-method requests, and imports codes (one per line). Codes are encrypted with AES-256-GCM before storage, each is assigned to exactly one order, and paid orders waiting for stock are fulfilled automatically after an import.

## Deploy on Vercel

1. Create a PostgreSQL database (e.g. Neon or Vercel Postgres). Tables are created automatically on the first API call.
2. In Vercel → Project → Settings → Environment Variables, set the values listed in `.env.example`.
3. `vercel.json` builds the static export (`out/`) and deploys `api/*.mjs` as functions; no other change is needed.
4. Keep `LINGORA_BEP20_ADDRESS` empty until the complete address is verified (OD-11); crypto checkout stays hidden until then.

## Local preview

`npm run build && npm run preview` serves the site and API together. Without `DATABASE_URL` the preview uses an in-memory PostgreSQL (PGlite) that resets on restart. Set `LINGORA_ADMIN_TOKEN` and `LINGORA_CODES_KEY` to try the dashboard and code delivery.

## Still blocked before launch

- OD-01: resale rights and redeem-link terms are unverified.
- OD-11: the complete BEP20 receiving address has not been supplied.
- Binance Pay (Pay ID) transfers cannot be verified automatically without a Binance Pay merchant account; customers using Binance should withdraw USDT over the BSC (BEP20) network instead.
- Privacy and refund pages still need legal review for the stored customer details (C5).
