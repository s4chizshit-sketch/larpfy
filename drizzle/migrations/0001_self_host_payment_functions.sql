create table if not exists public.private_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
grant all on public.private_config to service_role;
alter table public.private_config enable row level security;

create or replace function public.set_oxapay_key_hash(_hash text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if _hash is null or length(_hash) <> 64 then raise exception 'invalid'; end if;
  insert into public.private_config(key, value, updated_at) values ('oxapay_key_hash', lower(_hash), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end $$;

create or replace function public.create_payment_order(_plan_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p record; oid uuid;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  select id, name, price into p from public.plans where id = _plan_id and active;
  if not found then raise exception 'Plan not available'; end if;
  insert into public.payment_orders(user_id, plan_id, amount) values (auth.uid(), p.id, p.price) returning id into oid;
  return jsonb_build_object('id', oid, 'amount', p.price, 'name', p.name);
end $$;

create or replace function public.set_order_track(_order_id uuid, _track text)
returns void language sql security definer set search_path = public as $$
  update public.payment_orders set track_id = left(_track, 100)
  where id = _order_id and user_id = auth.uid() and status = 'pending';
$$;

create or replace function public.oxapay_mark_paid(_order_id uuid, _key_hash text, _track_id text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare h text; o record; p record; prof record;
begin
  select value into h from public.private_config where key = 'oxapay_key_hash';
  if h is null or _key_hash is null or h <> lower(_key_hash) then raise exception 'forbidden'; end if;
  select * into o from public.payment_orders where id = _order_id for update;
  if not found or o.status = 'paid' then return jsonb_build_object('ok', true, 'already', true); end if;
  update public.payment_orders set status = 'paid', paid_at = now(), track_id = coalesce(left(_track_id,100), track_id) where id = o.id;
  select * into p from public.plans where id = o.plan_id;
  select * into prof from public.profiles where id = o.user_id;
  if p.id is not null then
    if prof.subscription_status = 'active' and prof.plan_id = p.id then
      -- renewal of the same plan: the purchase trigger won't fire, record it here
      insert into public.plan_purchases(user_id, plan_id, plan_name, billing_period, price, duration_days, started_at, expires_at)
      select o.user_id, p.id, p.name, p.billing_period, o.amount, d, now(), case when d is null then null else now() + make_interval(days => d) end
      from (select case when p.billing_period = 'once' then null
                        when (regexp_match(lower(p.billing_period), '^\s*(\d+)\s*days?\s*$')) is not null then ((regexp_match(lower(p.billing_period), '^\s*(\d+)\s*days?\s*$'))[1])::int
                        when p.billing_period = 'year' then 365 else 30 end as d) x;
    end if;
    update public.profiles set subscription_status = 'active', plan_id = p.id where id = o.user_id;
  end if;
  return jsonb_build_object('ok', true, 'name', prof.name, 'email', prof.email, 'plan', p.name, 'amount', o.amount,
    'ip', coalesce(prof.last_ip, prof.signup_ip), 'country', coalesce(prof.last_country, prof.signup_country));
end $$;

create or replace function public.record_my_visit(_ip text, _country text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p record; c text := nullif(upper(left(coalesce(_country,''), 2)), ''); ip text := left(_ip, 64);
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  select signup_ip, name, email into p from public.profiles where id = auth.uid();
  if not found then return jsonb_build_object('first', false); end if;
  update public.profiles set last_ip = ip, last_country = c, last_seen_at = now(), visit_count = visit_count + 1,
    signup_ip = coalesce(signup_ip, ip),
    signup_country = case when signup_ip is null then c else signup_country end
  where id = auth.uid();
  return jsonb_build_object('first', p.signup_ip is null, 'name', p.name, 'email', p.email);
end $$;

create or replace function public.track_site_visit(_country text)
returns void language sql security definer set search_path = public as $$
  insert into public.site_visits(country) values (nullif(upper(left(coalesce(_country,''), 2)), ''));
$$;

revoke execute on function public.set_oxapay_key_hash(text) from public, anon;
revoke execute on function public.create_payment_order(uuid) from public, anon;
revoke execute on function public.set_order_track(uuid, text) from public, anon;
revoke execute on function public.record_my_visit(text, text) from public, anon;
grant execute on function public.set_oxapay_key_hash(text) to authenticated;
grant execute on function public.create_payment_order(uuid) to authenticated;
grant execute on function public.set_order_track(uuid, text) to authenticated;
grant execute on function public.record_my_visit(text, text) to authenticated;
grant execute on function public.oxapay_mark_paid(uuid, text, text) to anon, authenticated;
grant execute on function public.track_site_visit(text) to anon, authenticated;