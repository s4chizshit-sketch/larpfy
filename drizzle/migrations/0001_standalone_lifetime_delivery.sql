CREATE TABLE public.lifetime_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, product text NOT NULL CHECK (product IN ('instagram','tiktok')), amount numeric NOT NULL DEFAULT 25 CHECK(amount=25), currency text NOT NULL DEFAULT 'USD' CHECK(currency='USD'), status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','pending','fulfilled','expired','revoked')), track_id text UNIQUE, payment_url text, access_key text, created_at timestamptz NOT NULL DEFAULT now(), payment_verified_at timestamptz
);
GRANT SELECT ON public.lifetime_orders TO authenticated;
GRANT ALL ON public.lifetime_orders TO service_role;
ALTER TABLE public.lifetime_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY lifetime_order_owner_read ON public.lifetime_orders FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX lifetime_pending_account_product ON public.lifetime_orders(user_id,product) WHERE status IN ('reserved','pending');
CREATE TABLE public.lifetime_key_stock (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product text NOT NULL CHECK(product IN ('instagram','tiktok')), key_code text NOT NULL UNIQUE, order_id uuid UNIQUE REFERENCES public.lifetime_orders(id), imported_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.lifetime_key_stock TO service_role;
ALTER TABLE public.lifetime_key_stock ENABLE ROW LEVEL SECURITY;
CREATE INDEX lifetime_stock_available ON public.lifetime_key_stock(product) WHERE order_id IS NULL;
CREATE OR REPLACE FUNCTION public.reserve_lifetime_order(_product text,_key_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.lifetime_orders; stock uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='active') THEN RAISE EXCEPTION 'Account unavailable'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'Owner must open admin to finish payment setup'; END IF;
 IF _product NOT IN ('instagram','tiktok') THEN RAISE EXCEPTION 'Invalid product'; END IF;
 PERFORM pg_advisory_xact_lock(72525100);
 SELECT * INTO o FROM public.lifetime_orders WHERE user_id=auth.uid() AND product=_product AND status IN ('reserved','pending') FOR UPDATE;
 IF FOUND THEN RETURN to_jsonb(o)-'access_key'; END IF;
 IF (SELECT count(*) FROM public.lifetime_orders WHERE status<>'expired')>=100 THEN RAISE EXCEPTION 'Lifetime capacity reached'; END IF;
 SELECT id INTO stock FROM public.lifetime_key_stock WHERE product=_product AND order_id IS NULL ORDER BY imported_at,id LIMIT 1 FOR UPDATE;
 IF stock IS NULL THEN RAISE EXCEPTION 'Product keys unavailable'; END IF;
 INSERT INTO public.lifetime_orders(user_id,product) VALUES(auth.uid(),_product) RETURNING * INTO o;
 UPDATE public.lifetime_key_stock SET order_id=o.id WHERE id=stock;
 RETURN to_jsonb(o)-'access_key';
END $$;
REVOKE ALL ON FUNCTION public.reserve_lifetime_order(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reserve_lifetime_order(text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.attach_lifetime_invoice(_order_id uuid,_track_id text,_url text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.lifetime_orders SET track_id=_track_id,payment_url=_url,status='pending' WHERE id=_order_id AND user_id=auth.uid() AND status='reserved' AND track_id IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invoice already assigned'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.attach_lifetime_invoice(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.attach_lifetime_invoice(uuid,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.fulfill_lifetime_order(_order_id uuid,_key_hash text,_track_id text,_amount numeric,_currency text,_status text,_provider_order_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.lifetime_orders; supplied text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'forbidden'; END IF;
 SELECT * INTO o FROM public.lifetime_orders WHERE id=_order_id FOR UPDATE;
 IF NOT FOUND OR o.track_id IS NULL OR o.track_id<>_track_id OR o.id::text<>_provider_order_id OR _amount<>25 OR upper(_currency)<>'USD' OR lower(_status)<>'paid' THEN RAISE EXCEPTION 'Payment mismatch'; END IF;
 IF o.status='fulfilled' THEN RETURN jsonb_build_object('ok',true,'already',true); END IF;
 IF o.status<>'pending' THEN RAISE EXCEPTION 'Order state unavailable'; END IF;
 SELECT key_code INTO supplied FROM public.lifetime_key_stock WHERE order_id=o.id AND product=o.product FOR UPDATE;
 IF supplied IS NULL THEN RAISE EXCEPTION 'Reserved product key missing'; END IF;
 UPDATE public.lifetime_orders SET status='fulfilled',access_key=supplied,payment_verified_at=now() WHERE id=o.id;
 RETURN jsonb_build_object('ok',true,'already',false);
END $$;
REVOKE ALL ON FUNCTION public.fulfill_lifetime_order(uuid,text,text,numeric,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_lifetime_order(uuid,text,text,numeric,text,text,text) TO anon,authenticated;
CREATE POLICY lifetime_apk_owner_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='lifetime-apks' AND EXISTS(SELECT 1 FROM public.lifetime_orders o WHERE o.user_id=auth.uid() AND o.status='fulfilled' AND storage.objects.name=o.product||'.apk'));
CREATE POLICY lifetime_apk_admin_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='lifetime-apks' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY lifetime_apk_admin_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='lifetime-apks' AND public.has_role(auth.uid(),'admin'));
COMMENT ON TABLE public.lifetime_key_stock IS 'Owner-supplied pre-existing license strings, not generated or independently verified. Private stock reserved and assigned once after server OxaPay verification.';