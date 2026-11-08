CREATE OR REPLACE FUNCTION public.lookup_lifetime_callback(_order_id uuid,_key_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'forbidden'; END IF; RETURN (SELECT jsonb_build_object('id',id,'product',product,'track_id',track_id,'amount',amount,'currency',currency) FROM public.lifetime_orders WHERE id=_order_id AND status='pending'); END $$;
REVOKE ALL ON FUNCTION public.lookup_lifetime_callback(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_lifetime_callback(uuid,text) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.reserve_lifetime_order(_product text,_key_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE o public.lifetime_orders; stock uuid; BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='active') THEN RAISE EXCEPTION 'Account unavailable'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.private_config WHERE key='oxapay_key_hash' AND value=_key_hash) THEN RAISE EXCEPTION 'Owner must open admin to finish payment setup'; END IF;
IF _product NOT IN ('instagram','tiktok') THEN RAISE EXCEPTION 'Invalid product'; END IF;
PERFORM pg_advisory_xact_lock(72525100);
SELECT * INTO o FROM public.lifetime_orders WHERE user_id=auth.uid() AND product=_product AND status IN ('reserved','pending') FOR UPDATE;
IF FOUND THEN RETURN (to_jsonb(o)-'access_key')||jsonb_build_object('invoice_claim',false); END IF;
IF (SELECT count(*) FROM public.lifetime_orders WHERE status<>'expired')>=100 THEN RAISE EXCEPTION 'Lifetime capacity reached'; END IF;
IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='lifetime-apks' AND name=_product||'.apk') THEN RAISE EXCEPTION 'Product APK not uploaded'; END IF;
SELECT id INTO stock FROM public.lifetime_key_stock WHERE product=_product AND order_id IS NULL ORDER BY imported_at,id LIMIT 1 FOR UPDATE;
IF stock IS NULL THEN RAISE EXCEPTION 'Product keys unavailable'; END IF;
INSERT INTO public.lifetime_orders(user_id,product) VALUES(auth.uid(),_product) RETURNING * INTO o;
UPDATE public.lifetime_key_stock SET order_id=o.id WHERE id=stock;
RETURN (to_jsonb(o)-'access_key')||jsonb_build_object('invoice_claim',true);
END $$;