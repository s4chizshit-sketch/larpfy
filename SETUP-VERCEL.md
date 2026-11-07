# LARPFY — Vercel + apna Supabase setup (Lovable ke bina)

## Step 1 — Naya Supabase account (free)
1. https://supabase.com par jao → Sign up (aapka Gmail use kar sakte ho).
2. "New project" banao. Naam: `larp-insight`. Region: Mumbai/Singapore (India users ke liye fast).
3. Database password yaad rakhna (ya save karna) — zaroorat pad sakti hai.

## Step 2 — Database banao (2 minute)
1. Naye project me left menu → **SQL Editor** → **New query**.
2. Is repo ki file `database-setup.sql` ka pura content copy karke paste karo → **Run** dabao.
3. "Success" dikhe to ho gaya. Plans pehle se add honge (Instagram/TikTok $20/$40).

## Step 3 — Keys nikaalo
Supabase → **Project Settings** → **API**:
- `Project URL` — ye `SUPABASE_URL` aur `VITE_SUPABASE_URL` hai
- `anon / publishable key` — ye `SUPABASE_PUBLISHABLE_KEY` aur `VITE_SUPABASE_PUBLISHABLE_KEY` hai
- `service_role / secret key` — ye `SUPABASE_SERVICE_ROLE_KEY` hai (kisi ko na dena)

## Step 4 — Vercel me environment variables
Vercel → project → **Settings** → **Environment Variables**. Ye sab daalo (Production):

| Naam | Value |
|---|---|
| `SUPABASE_URL` | Step 3 ka Project URL |
| `VITE_SUPABASE_URL` | Step 3 ka Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Step 3 ka publishable/anon key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Step 3 ka publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Step 3 ka service_role key |
| `OXAPAY_MERCHANT_API_KEY` | OxaPay merchant key |
| `TELEGRAM_BOT_TOKEN` | @Larpinght_bot ka token |
| `TELEGRAM_CHAT_ID` | Owner chat id |
| `TELEGRAM_OWNER_CHAT_ID` | Owner chat id |
| `TELEGRAM_SALES_BOT_TOKEN` | @Subscriptionplanuser_bot ka token |

Phir **Deployments** → latest → **Redeploy** (bina redeploy keys kaam nahi karengi).

## Step 5 — OxaPay
Dashboard → Merchant: Accepted currencies me sirf **USDT**, aur
Callback URL: `https://larpfy.store/api/public/oxapay-webhook`

## Important
- **Purane users nahi aayenge** — naye database me pehle ke accounts khaali hain (remix me data reset ho chuka tha). Sabko dobara signup karna hoga; `workparsnoluse@gmail.com` se signup karte hi admin ban jayega.
- Saari videos/logo ab is repo ke andar hain (compressed, total ~150MB) — Vercel khud serve karega, Lovable ki zaroorat nahi.
- Lovable ko band karne se pehle ek test payment zaroor karna (USDT se ek plan lena) taaki webhook, plan activation aur Telegram alerts confirm ho jayein.

## New domain: larpfy.store
- Add `larpfy.store` in Vercel → Settings → Domains, then add the DNS records Vercel shows at your registrar.
- Keep payment callback and return URLs on the same hostname as checkout; the app derives them from the current request origin.
- Add `https://larpfy.store` and `https://larpfy.store/reset-password` to your existing authentication allowed redirect URLs.
- Redeploy the connected project to update the LARPFY branding.
