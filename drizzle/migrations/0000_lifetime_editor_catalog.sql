CREATE VIEW public.lifetime_editor_catalog WITH (security_invoker = true) AS
SELECT 'c752255b-bfe6-4de8-8c02-99fe314f0221'::uuid AS id, 'instagram'::text AS product, 'Instagram Editor'::text AS name, 25::numeric AS price, 'once'::text AS billing_period, ARRAY['Lifetime access — no expiry','Product-compatible access key','Instagram APK download','Existing device limits apply']::text[] AS features, 'Get lifetime access'::text AS cta, 1 AS sort_order
UNION ALL
SELECT 'c752255b-bfe6-4de8-8c02-99fe314f0222'::uuid, 'tiktok'::text, 'TikTok Editor'::text, 25::numeric, 'once'::text, ARRAY['Lifetime access — no expiry','Verified TikTok access key','TikTok APK download','Existing device limits apply']::text[], 'Get lifetime access'::text, 2;
GRANT SELECT ON public.lifetime_editor_catalog TO anon, authenticated;
GRANT ALL ON public.lifetime_editor_catalog TO service_role;
COMMENT ON VIEW public.lifetime_editor_catalog IS 'Lifetime-only website catalog; legacy plans and purchase history are retained. Checkout must use the authoritative bot bridge, which owns capacity, payment verification, license issuance and device rules.';