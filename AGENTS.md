<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Editable site content (hero, FAQ, announcement, affiliate %) lives in the site_content table keyed by name; pricing in plans — never hardcode them in the frontend, so admins can edit live.
- The homepage Shopify showcase is a presentation-only section with bundled demo imagery; do not imply a live Shopify connection or offer checkout without implemented plans.
- All media (videos, logos, payment images) lives as real files in `src/assets/` and is bundled by Vite — never use Lovable asset pointers (`.asset.json`) or `/__l5e/` URLs; the app is hosted on Vercel, not Lovable.
- `database-setup.sql` at the project root recreates the full database (schema, RLS, functions, triggers, plan seed) in any fresh Supabase project — keep it in sync when the schema changes; the backend is self-owned Supabase via env keys, not Lovable Cloud.
- New-signup profile creation depends on the `on_auth_user_created` trigger on `auth.users` calling `public.handle_new_user()` — if new accounts get no profile/Telegram alert, check that trigger exists.
- Platform recording carousels use Embla for touch dragging and snapping; automatic advancement stops after manual interaction so the selected recording stays visible.
- The shared showcase device shell replaces only the recordings' system-bar margins with device chrome, preserving uploaded app content and playback.
- Full-recording showcase mode is opt-in for Shopify; fit the shell to the source ratio and reuse the recording's own iOS status/navigation chrome rather than adding duplicate bars, preserving all pixels and playback without affecting other platform shells.
- The Shopify dashboard image is contained at its intrinsic ratio inside a CSS laptop lid and base; device chrome scales with its container so the full demo remains visible on phones and desktops.
- Platform pricing uses a shared Embla carousel grouping Instagram, TikTok and Shopify plans by their platform name prefix, with navigation visible at all sizes; this keeps all offers synchronized with admin-editable plan rows and makes offscreen plans reachable.
- Non-admin platform workspace pages reuse the homepage showcase and tutorial players for their own platform; this keeps recordings, captions, and playback presentation synchronized without duplicating media.
- Workspace quick launch and sidebar share bundled platform logo components; Shopify opens its own authenticated showcase route without implying a live store connection.
- Workspace navigation uses role-filtered items and project presentation checks from the existing profile role query; this hides admin-only project UI without changing data permissions.
- Account destinations use a shared role-based helper; the dashboard layout redirects admins to the admin layout, preserving database-enforced permissions while separating workspace presentation.
- Paid Telegram drafts preserve the purchase's stored plan name, so custom billing periods remain accurate.
- Payment alert delivery is acknowledged separately on its order; repeated signed callbacks retry undelivered alerts without granting a second purchase. Delivery is at-least-once, not exactly-once.
- Checkout callback origins must match the server request origin, and payment activation must match the stored provider reference.
- Checkout verifies the host key fingerprint before creating an invoice, preventing payments while automatic activation is not configured.
- Global media rules must not override component-defined heights; explicit logo dimensions prevent header overflow and layout shifts.
- Plan checkout is a shared presentation component opened from database-backed plan rows, so editable prices remain synchronized with the displayed payment amount.
- Manual UPI checkout uses an absolute client deadline and a Telegram draft link after expiry; countdown expiry never verifies payment or activates access.
- Payment dialogs use native vertical overflow for touch swipes, mouse wheels and scrollbar dragging; no automatic scrolling competes with the user's gestures.
- Android payment-app launches use package-targeted UPI intents with the selected plan amount and Google Play browser fallbacks; launching an app never verifies payment or activates access.
- Server code never uses the service-role key: privileged writes (orders, payment activation, visit tracking) go through SECURITY DEFINER SQL functions called with the publishable key or the user's session, so any host (Vercel) works with only OXAPAY_MERCHANT_API_KEY set.
- OxaPay webhook activation is authorized by a SHA-256 fingerprint of the host's OxaPay key stored in `private_config`; the admin layout re-syncs it on every admin visit, so payments activate only after the admin has opened the admin panel once on that host.
