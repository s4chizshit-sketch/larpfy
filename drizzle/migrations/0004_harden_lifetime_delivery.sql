REVOKE SELECT ON public.lifetime_orders FROM authenticated;
GRANT SELECT(id,user_id,product,amount,currency,status,track_id,payment_url,created_at,payment_verified_at) ON public.lifetime_orders TO authenticated;
CREATE OR REPLACE FUNCTION public.get_lifetime_delivery(_order_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.lifetime_orders;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'unauthorized'; END IF;
 SELECT * INTO o FROM public.lifetime_orders WHERE id=_order_id AND user_id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable'; END IF;
 IF o.status<>'fulfilled' OR o.payment_verified_at IS NULL OR o.access_key IS NULL THEN RETURN jsonb_build_object('access_key',null); END IF;
 RETURN jsonb_build_object('access_key',o.access_key);
END $$;
REVOKE ALL ON FUNCTION public.get_lifetime_delivery(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_lifetime_delivery(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.fulfill_lifetime_order(_order_id uuid,_key_hash text,_track_id text,_amount numeric,_currency text,_status text,_provider_order_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.lifetime_orders; supplied text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'forbidden'; END IF;
 SELECT * INTO o FROM public.lifetime_orders WHERE id=_order_id FOR UPDATE;
 IF NOT FOUND OR o.track_id IS NULL OR o.track_id IS DISTINCT FROM _track_id OR o.id::text IS DISTINCT FROM _provider_order_id OR _amount IS DISTINCT FROM 25::numeric OR upper(_currency) IS DISTINCT FROM 'USD' OR lower(_status) IS DISTINCT FROM 'paid' THEN RAISE EXCEPTION 'Payment mismatch'; END IF;
 IF o.status='fulfilled' THEN RETURN jsonb_build_object('ok',true,'already',true); END IF;
 IF o.status NOT IN ('pending','expired') THEN RAISE EXCEPTION 'Order state unavailable'; END IF;
 SELECT key_code INTO supplied FROM public.lifetime_key_stock WHERE order_id=o.id AND product=o.product FOR UPDATE;
 IF supplied IS NULL THEN RAISE EXCEPTION 'Reserved product key missing'; END IF;
 UPDATE public.lifetime_orders SET status='fulfilled',access_key=supplied,payment_verified_at=now() WHERE id=o.id;
 RETURN jsonb_build_object('ok',true,'already',false);
END $$;
CREATE OR REPLACE FUNCTION public.lookup_lifetime_callback(_order_id uuid,_key_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'forbidden'; END IF;
 RETURN (SELECT jsonb_build_object('id',id,'product',product,'track_id',track_id,'amount',amount,'currency',currency,'status',status) FROM public.lifetime_orders WHERE id=_order_id AND status IN ('pending','fulfilled','expired'));
END $$;
CREATE OR REPLACE FUNCTION public.mark_lifetime_terminal(_order_id uuid,_key_hash text,_track_id text,_provider_order_id text,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) OR lower(_status) IS NULL OR lower(_status) NOT IN ('expired','failed') THEN RAISE EXCEPTION 'forbidden'; END IF;
 UPDATE public.lifetime_orders SET status='expired' WHERE id=_order_id AND id::text=_provider_order_id AND track_id=_track_id AND status='pending';
 -- Keep reserved stock: never recycle a key from an issued invoice, which may later settle.
END $$;
REVOKE ALL ON FUNCTION public.mark_lifetime_terminal(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_lifetime_terminal(uuid,text,text,text,text) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.reserve_lifetime_order(_product text,_key_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.lifetime_orders; stock uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'unauthorized'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='active') THEN RAISE EXCEPTION 'Account unavailable'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'Owner must open admin to finish payment setup'; END IF;
 IF _product IS NULL OR _product NOT IN ('instagram','tiktok') THEN RAISE EXCEPTION 'Invalid product'; END IF;
 PERFORM pg_advisory_xact_lock(72525100);
 SELECT * INTO o FROM public.lifetime_orders WHERE user_id=auth.uid() AND product=_product AND status IN ('reserved','pending') FOR UPDATE;
 IF FOUND THEN RETURN (to_jsonb(o)-'access_key')||jsonb_build_object('invoice_claim',false); END IF;
 IF (SELECT count(*) FROM public.lifetime_key_stock WHERE order_id IS NOT NULL)>=100 THEN RAISE EXCEPTION 'Lifetime capacity reached'; END IF;
 IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='lifetime-apks' AND name=_product||'.apk') THEN RAISE EXCEPTION 'Product APK not uploaded'; END IF;
 SELECT id INTO stock FROM public.lifetime_key_stock WHERE product=_product AND order_id IS NULL ORDER BY imported_at,id LIMIT 1 FOR UPDATE;
 IF stock IS NULL THEN RAISE EXCEPTION 'Product keys unavailable'; END IF;
 INSERT INTO public.lifetime_orders(user_id,product) VALUES(auth.uid(),_product) RETURNING * INTO o;
 UPDATE public.lifetime_key_stock SET order_id=o.id WHERE id=stock;
 RETURN (to_jsonb(o)-'access_key')||jsonb_build_object('invoice_claim',true);
END $$;
CREATE OR REPLACE FUNCTION public.lifetime_availability() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('instagram', (SELECT count(*) FROM public.lifetime_key_stock WHERE order_id IS NOT NULL)<100 AND EXISTS(SELECT 1 FROM public.lifetime_key_stock WHERE product='instagram' AND order_id IS NULL) AND EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='lifetime-apks' AND name='instagram.apk'), 'tiktok', (SELECT count(*) FROM public.lifetime_key_stock WHERE order_id IS NOT NULL)<100 AND EXISTS(SELECT 1 FROM public.lifetime_key_stock WHERE product='tiktok' AND order_id IS NULL) AND EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='lifetime-apks' AND name='tiktok.apk'));
$$;
REVOKE ALL ON FUNCTION public.lifetime_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lifetime_availability() TO anon,authenticated;
COMMENT ON FUNCTION public.reserve_lifetime_order(text,text) IS 'Only the creating transaction receives invoice_claim=true; retries never claim invoice creation again. Issued invoices retain their stock for safe late settlement.';