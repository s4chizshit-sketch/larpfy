alter table public.payment_orders add column if not exists telegram_notified_at timestamptz;
create or replace function public.oxapay_mark_paid(_order_id uuid, _key_hash text, _track_id text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare h text; o record; p record; prof record; already_paid boolean;
begin
  select value into h from public.private_config where key = 'oxapay_key_hash';
  if h is null or _key_hash is null or h <> lower(_key_hash) then raise exception 'forbidden'; end if;
  select * into o from public.payment_orders where id = _order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if o.track_id is null or _track_id is null or o.track_id <> _track_id then raise exception 'Payment reference mismatch'; end if;
  select * into p from public.plans where id = o.plan_id;
  select * into prof from public.profiles where id = o.user_id;
  if p.id is null or prof.id is null then raise exception 'Order account or plan unavailable'; end if;
  already_paid := o.status = 'paid';
  if not already_paid then
    update public.payment_orders set status = 'paid', paid_at = now() where id = o.id;
    if prof.subscription_status = 'active' and prof.plan_id = p.id then
      insert into public.plan_purchases(user_id, plan_id, plan_name, billing_period, price, duration_days, started_at, expires_at)
      select o.user_id, p.id, p.name, p.billing_period, o.amount, d, now(), case when d is null then null else now() + make_interval(days => d) end
      from (select case when p.billing_period = 'once' then null
        when (regexp_match(lower(p.billing_period), '^\s*(\d+)\s*days?\s*$')) is not null then ((regexp_match(lower(p.billing_period), '^\s*(\d+)\s*days?\s*$'))[1])::int
        when p.billing_period = 'year' then 365 else 30 end as d) x;
    end if;
    update public.profiles set subscription_status = 'active', plan_id = p.id where id = o.user_id;
  end if;
  return jsonb_build_object('ok', true, 'already', already_paid, 'notify', o.telegram_notified_at is null,
    'name', prof.name, 'email', prof.email, 'plan', p.name, 'amount', o.amount,
    'ip', coalesce(prof.last_ip, prof.signup_ip), 'country', coalesce(prof.last_country, prof.signup_country));
end $$;
create or replace function public.oxapay_ack_alert(_order_id uuid, _key_hash text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.private_config where key='oxapay_key_hash' and value=lower(_key_hash)) then raise exception 'forbidden'; end if;
  update public.payment_orders set telegram_notified_at=now() where id=_order_id and status='paid' and telegram_notified_at is null;
end $$;
revoke execute on function public.oxapay_ack_alert(uuid,text) from public;
grant execute on function public.oxapay_ack_alert(uuid,text) to anon,authenticated;
create index if not exists payment_orders_paid_idx on public.payment_orders(paid_at desc) where status='paid';