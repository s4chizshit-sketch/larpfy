# Archived optional bot bridge — NOT required for current delivery

The owner superseded this proposal: website now delivers supplied keys from private stock through standalone OxaPay checkout. No bot connection is required. The remaining original contract below is historical, not an active setup instruction. Private APKs must be uploaded in Admin → Pricing; do not publish them or license stock in source files.

## Inspection result

The LARPFY repository has no authoritative license issuer. The inspected `igeditor` snapshot contains the existing `Insightseditorall_bot` OxaPay purchase implementation, real Instagram `access_keys` registration and a remote TikTok issuer, but **no website sales bridge**. Neither `INSIGHTS_WEBSITE_API_ORIGIN` nor `INSIGHTS_WEBSITE_SHARED_SECRET` is configured in this website. Existing website OxaPay credentials are not proof that they belong to the bot's merchant account.

Website lifetime invoice creation now fails closed until the bridge is available. No fake license strings or active license stock were generated. Existing accounts, plans and purchase records were not deleted or rewritten. The new catalog is separate from historical plans.

This is a required contract, not a description of deployed bot endpoints. Open the bot project to implement the following additive API. Do not replace its Telegram webhook, notifications, checkout, device validation, revocation rules or merchant account.

## Secure setup

- Bot deployment supplies its actual HTTPS origin. Set it as server-only `INSIGHTS_WEBSITE_API_ORIGIN` on this website host. Paths below are appended to its origin.
- Request `INSIGHTS_WEBSITE_SHARED_SECRET` in this project's secure secret form with a Generate/copy option, destination **Insights Editor bot project → server secret INSIGHTS_WEBSITE_SHARED_SECRET**. Copy the same value into the bot project's secure secret form, and both Vercel environments if used. Never paste its value into chat, code or documentation.
- Every endpoint requires `Authorization: Bearer <shared secret>` using constant-time comparison. Do not redirect secret-bearing requests. Bind that credential to `website_id = larpfy.store`; reject other tenants and requests with a user-supplied Telegram identity.
- Website authenticates/revalidates the account server-side, requires confirmed email, and passes `website_user_id` and `verified_email` obtained from that account, never from checkout form input.
- The bot stores an explicit website identity/tenant on orders. Its current Telegram-only order/issuer interfaces require an additive website-identity path; never substitute a fake chat ID, `0`, an email lookup, or a typed Telegram chat ID.
- Bot alone retains `OXAPAY_MERCHANT_API_KEY`, its Telegram tokens and `BOT_INTERNAL_SECRET`/TikTok issuer credential. LARPFY needs none of those for new lifetime purchases.
- Private API responses and APKs use `Cache-Control: private, no-store`. Logs exclude credentials, license keys, provider payloads and download URLs.

## Required endpoints (POST)

All JSON requests include `website_id: "larpfy.store"` and use the shared-secret header. No endpoint is a public browser API.

### `/v1/website/capabilities`

Return exactly these supported guarantees only after they are implemented:

```json
{"contract_version":1,"ready":true,"capacity_limit":100,"atomic_reservations":true,"idempotent_fulfillment":true,"provider_recheck":true,"products":["instagram","tiktok"]}
```

Never return remaining stock or key inventory through this endpoint. It is server-to-server and website never sends its response to the browser.

### `/v1/website/checkout`

Request: `website_user_id`, `verified_email`, `product` (`instagram` or `tiktok`), `plan: lifetime`, `amount: 25`, `currency: USD`, `payment_asset: USDT`, `return_url` (allow only `https://larpfy.store/dashboard/billing` and explicitly approved deployment origins).

**Do not trust supplied prices:** independently enforce $25, lifetime and the two products in the bot. Validate UUIDs, account/tenant binding and all fields. The website catalog IDs map to these product codes, not existing Telegram plan IDs.

Before creating an OxaPay invoice, lock a durable capacity ledger for this website campaign and atomically reserve one of **100 total purchase slots shared across both products**. Count fulfilled purchases plus unresolved reservations; never count pre-generated keys. Recover the same pending order/invoice for repeat checkout by the same account/product. Unique constraints on tenant/order, provider track ID and fulfillment prevent concurrent duplicate invoices or keys. Return HTTP 409 without creating an invoice when capacity is full.

Persist pending order/product/amount/currency before calling the existing bot merchant account. Save provider order ID and track ID immutably. Network timeouts leave recoverable reservations, not automatic releases or duplicate invoices. Release only after authoritative provider confirmation that the invoice is permanently expired/cancelled and cannot be paid; never release merely because a browser timer expired. Paid-but-not-yet-issued orders still consume their slots. Revocation never refunds capacity automatically.

Response: `{ "purchase": <receipt>, "payment_url": <HTTPS OxaPay invoice URL> }`, with pending status and no key. OxaPay callbacks remain bot-owned.

### `/v1/website/purchases`

Request: `website_user_id`. Return `{ "purchases": [<receipt>] }`, at most 100, scoped to tenant/account in the authoritative database query. Recover/verify pending orders on read so a real paid return to Billing shows its fulfilled purchase. Preserve revoked state; never issue a replacement on read. Do not expose inventory, other users, bot tokens or Telegram URLs.

### `/v1/website/purchases/{purchaseId}/verify`

Request: `website_user_id`. Resolve the immutable order by tenant, purchase ID and account; another account gets 404/403 before any provider request or fulfillment.

Look up the saved track ID using OxaPay `GET /v1/payment/{track_id}` with the **existing bot merchant key**. Compare the provider track ID, provider order ID, stored product binding, amount exactly 25, USD invoice currency, accepted USDT payment asset and final successful paid status. Reject underpayments, over/incorrect amounts, wrong currency/product/track/order and unsuccessful transactions. Signed callbacks only trigger this lookup; redirects, screenshots, arbitrary callback fields and browser flags never authorize fulfillment.

After successful verification, record verification and fulfill idempotently. Lock order and capacity reservation. Instagram must use its existing real license registration transaction. TikTok must use its verified remote issuer with stable original order ID as idempotency key; its website path must accept verified website identity without a fabricated Telegram chat ID. Remote retries must return the same originally issued key and never renew/revive revoked keys. Persist returned key/product/license record, fulfillment and reservation consumption under unique constraints. If remote issuer is unavailable, remain paid/fulfillment pending with no exposed key, keeping capacity reserved. Distributed recovery must reuse original issuer order, not mint another key.

Lifetime license expiry must be SQL NULL in both systems. Preserve each product's existing device limit, binding, logout and revocation rules; lifetime is not unlimited devices.

Return the exact same receipt/purchase/key on retries. Receipt format:

```text
id: purchase UUID
website_user_id: account UUID
product: instagram | tiktok
plan: lifetime
amount: 25
currency: USD
payment_asset: USDT
status: pending | paid | fulfilled | expired | revoked
expires_at: null
created_at: ISO timestamp
invoice_id: original immutable provider track ID
access_key: null unless fulfilled; otherwise the real registered key
license_product: null until issued, then the matching product
license_registered: true only when verified in the real product license system
apk_product: matching product
payment_verified_at: null until server/provider verified; then ISO timestamp
```

### `/v1/website/purchases/{purchaseId}/apk`

Request: `website_user_id`. Recheck tenant/owner, fulfilled status and nonrevoked real product license. Return matching APK bytes, not a Telegram file URL:

```text
Content-Type: application/vnd.android.package-archive
X-Apk-Product: instagram | tiktok
Cache-Control: private, no-store
```

The inspected bot's `PRODUCTS` already maps Instagram/TikTok to distinct Telegram APK file IDs. Resolve/download the correct file **on the bot server** using its own bot token. Stream bytes to the website proxy. Never expose `api.telegram.org/file/bot<TOKEN>/...` or access tokens. Website's `/api/public/lifetime-apk` is POST-only, independently authenticates the buyer, verifies the owned purchase and streams bytes privately.

## Tests and rollout

Website unit tests exercise fail-closed connection/readiness, receipt identity/product/owner/payment/key/APK checks and reject invalid checkout URLs. Those tests do not establish real issuer registration, atomic capacity or fulfillment.

Before returning `ready: true`, bot project must run integration tests against its real transactional database and a controlled provider test adapter:
- Unpaid and forged/signed-but-unverified callbacks never mint keys.
- Wrong invoice track/order/product/$ amount/USD or USDT asset never fulfills.
- Cross-account list, verify and APK requests never reveal/alter another buyer's purchase.
- Concurrent callback/read/retry requests register one Instagram key; TikTok remote recovery returns the same originally verified key after timeout/restart.
- At 99 consumed slots, two concurrent checkout requests across different products admit exactly one; the 101st creates no invoice. Unresolved reservations prevent overselling.
- Product APK bytes and license match; expiry is NULL, device limits unchanged, revoked licenses not renewed.
- Existing Telegram bot purchase, key lookup, device binding and download paths still work unchanged.

**Real paid testing: NOT performed.** No invoice/payment/license was fabricated. Live checkout and server concurrency/stock/device tests remain blocked until this bridge is implemented/configured. Once deployed, make an explicitly approved real $25 payment, verify OxaPay truth, website receipt/key/APK and actual app acceptance, then refresh/retry and confirm the same key. Report that independently of unit tests.