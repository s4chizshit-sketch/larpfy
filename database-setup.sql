-- ============================================================
-- Larp Insight — Database setup for a NEW Supabase project
-- Run this ONCE: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1) Roles enum
create type public.app_role as enum ('user', 'admin');

-- 2) Tables
create table public.affiliates (
  user_id uuid not null primary key,
  code text not null,
  created_at timestamptz not null default now(),
  constraint affiliates_code_key unique (code)
);

create table public.demo_videos (
  id uuid not null primary key default gen_random_uuid(),
  title text not null,
  description text,
  platform text not null default 'instagram',
  video_url text,
  thumbnail_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  billing_period text not null default 'month',
  features text[] not null default '{}'::text[],
  cta text not null default 'Get Started',
  popular boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid not null primary key,
  name text,
  email text,
  status text not null default 'active',
  plan_id uuid,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now(),
  signup_ip text,
  signup_country text,
  last_ip text,
  last_country text,
  last_seen_at timestamptz,
  total_seconds integer not null default 0,
  visit_count integer not null default 0
);

create table public.payment_orders (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null,
  track_id text,
  amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint payment_orders_track_id_key unique (track_id)
);

create table public.plan_purchases (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid,
  plan_name text not null,
  billing_period text not null,
  price numeric not null default 0,
  duration_days integer,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  platform text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_platform_check check (platform = any (array['instagram'::text, 'tiktok'::text]))
);

create table public.payouts (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric not null,
  method text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint payouts_amount_check check (amount > (0)::numeric)
);

create table public.referral_clicks (
  id uuid not null primary key default gen_random_uuid(),
  affiliate_user_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid not null primary key default gen_random_uuid(),
  affiliate_user_id uuid not null,
  referred_user_id uuid not null,
  status text not null default 'signup',
  commission numeric not null default 0,
  commission_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint referrals_referred_user_id_key unique (referred_user_id)
);

create table public.site_content (
  key text not null primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.site_visits (
  id uuid not null primary key default gen_random_uuid(),
  country text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  constraint user_roles_user_id_role_key unique (user_id, role)
);

-- 3) Foreign keys
alter table public.profiles
  add constraint profiles_plan_id_fkey
  foreign key (plan_id) references public.plans(id) on delete set null;

-- 4) Indexes
create index profiles_created_idx on public.profiles (created_at desc);
create index profiles_email_idx on public.profiles (lower(email));
create index profiles_last_seen_idx on public.profiles (last_seen_at desc);
create index payment_orders_user_idx on public.payment_orders (user_id);
create index plan_purchases_user_idx on public.plan_purchases (user_id, started_at desc);
create index plan_purchases_started_idx on public.plan_purchases (started_at desc);
create index projects_user_idx on public.projects (user_id);
create index user_roles_user_idx on public.user_roles (user_id);
create index site_visits_created_idx on public.site_visits (created_at desc);

-- 5) Functions
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare a uuid; ref text;
begin
  insert into public.profiles(id, name, email) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if lower(new.email) = 'extipsguide@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  ref := new.raw_user_meta_data->>'ref';
  if ref is not null then
    select user_id into a from public.affiliates where code = ref;
    if a is not null and a <> new.id then
      insert into public.referrals(affiliate_user_id, referred_user_id) values (a, new.id);
    end if;
  end if;
  return new;
end $$;

create or replace function public.enforce_owner_only_admin()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'auth'
as $$
begin
  if new.role = 'admin' and not exists (
    select 1 from auth.users u where u.id = new.user_id and lower(u.email) = 'extipsguide@gmail.com'
  ) then
    raise exception 'Admin role is reserved for the owner account';
  end if;
  return new;
end $$;

create or replace function public.on_profile_paid()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare pct numeric; price numeric;
begin
  if new.subscription_status = 'active' and coalesce(old.subscription_status,'') <> 'active' then
    select coalesce((value->>'commission_percent')::numeric, 20) into pct from public.site_content where key = 'affiliate';
    pct := coalesce(pct, 20);
    select p.price into price from public.plans p where p.id = new.plan_id;
    update public.referrals set status = 'paid', commission = round(coalesce(price,0) * pct / 100, 2)
      where referred_user_id = new.id and status <> 'paid';
  end if;
  return new;
end $$;

create or replace function public.record_plan_purchase()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare p record; days int; m text[];
begin
  if new.plan_id is not null and new.subscription_status = 'active'
     and (old.plan_id is distinct from new.plan_id or old.subscription_status is distinct from 'active') then
    select name, price, billing_period into p from public.plans where id = new.plan_id;
    if found then
      m := regexp_match(lower(p.billing_period), '^\s*(\d+)\s*days?\s*$');
      days := case when p.billing_period = 'once' then null
                   when m is not null then m[1]::int
                   when p.billing_period = 'year' then 365
                   else 30 end;
      insert into public.plan_purchases(user_id, plan_id, plan_name, billing_period, price, duration_days, started_at, expires_at)
      values (new.id, new.plan_id, p.name, p.billing_period, p.price, days, now(),
              case when days is null then null else now() + make_interval(days => days) end);
    end if;
  end if;
  return new;
end $$;

create or replace function public.track_referral_click(_code text)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare a uuid;
begin
  select user_id into a from public.affiliates where code = _code;
  if a is not null then insert into public.referral_clicks(affiliate_user_id) values (a); end if;
end $$;

create or replace function public.update_my_name(_name text)
returns void
language sql
security definer
set search_path = 'public'
as $$
  update public.profiles set name = left(_name, 100) where id = auth.uid();
$$;

create or replace function public.add_visit_time(_seconds integer)
returns void
language sql
security definer
set search_path = 'public'
as $$
  update public.profiles set total_seconds = total_seconds + least(greatest(_seconds,0),120), last_seen_at = now() where id = auth.uid();
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = 'public'
as $$
declare r jsonb;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'total_users', (select count(*) from profiles),
    'signups_today', (select count(*) from profiles where created_at >= date_trunc('day', now())),
    'signups_7d', (select count(*) from profiles where created_at >= now() - interval '7 days'),
    'online_now', (select count(*) from profiles where last_seen_at >= now() - interval '5 minutes'),
    'active_today', (select count(*) from profiles where last_seen_at >= date_trunc('day', now())),
    'visits_today', (select count(*) from site_visits where created_at >= date_trunc('day', now())),
    'visits_7d', (select count(*) from site_visits where created_at >= now() - interval '7 days'),
    'paid_orders', (select count(*) from payment_orders where status = 'paid'),
    'revenue', (select coalesce(sum(price),0) from plan_purchases),
    'plan_buyers', (select count(distinct user_id) from plan_purchases),
    'active_plans', (select count(distinct user_id) from plan_purchases where expires_at is null or expires_at > now()),
    'projects', (select count(*) from projects),
    'countries', coalesce((select jsonb_agg(c) from (
        select coalesce(signup_country, last_country) as country, count(*) as users
        from profiles where coalesce(signup_country, last_country) is not null
        group by 1 order by 2 desc limit 30) c), '[]'::jsonb),
    'visit_countries', coalesce((select jsonb_agg(c) from (
        select country, count(*) as visits from site_visits
        where country is not null and created_at >= now() - interval '7 days'
        group by 1 order by 2 desc limit 15) c), '[]'::jsonb)
  ) into r;
  return r;
end $$;

-- 6) Triggers
create trigger user_roles_owner_only_admin
before insert or update on public.user_roles
for each row execute function public.enforce_owner_only_admin();

create trigger on_profile_paid
after update on public.profiles
for each row execute function public.on_profile_paid();

create trigger on_profile_plan_purchase
after update on public.profiles
for each row execute function public.record_plan_purchase();

-- Creates a profile (and admin role for the owner email) for every new signup
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 7) Row Level Security
alter table public.affiliates enable row level security;
alter table public.demo_videos enable row level security;
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.payment_orders enable row level security;
alter table public.plan_purchases enable row level security;
alter table public.projects enable row level security;
alter table public.payouts enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.referrals enable row level security;
alter table public.site_content enable row level security;
alter table public.site_visits enable row level security;
alter table public.user_roles enable row level security;

create policy "join affiliate" on public.affiliates for insert to authenticated with check (user_id = auth.uid());
create policy "read own affiliate" on public.affiliates for select to authenticated using ((user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

create policy "admins manage videos" on public.demo_videos for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "published videos public" on public.demo_videos for select using (published or public.has_role(auth.uid(), 'admin'));

create policy "active plans public" on public.plans for select using (active or public.has_role(auth.uid(), 'admin'));
create policy "admins manage plans" on public.plans for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "read own or admin" on public.profiles for select to authenticated using ((id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "admins update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Users view own orders" on public.payment_orders for select to authenticated using ((auth.uid() = user_id) or public.has_role(auth.uid(), 'admin'));

create policy "read own purchases or admin" on public.plan_purchases for select to authenticated using ((user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

create policy "own projects" on public.projects for all to authenticated using (user_id = auth.uid()) with check ((user_id = auth.uid()) and exists (select 1 from public.profiles p where ((p.id = auth.uid()) and (p.status = 'active'::text))));

create policy "request payout" on public.payouts for insert to authenticated with check ((user_id = auth.uid()) and (status = 'pending'::text));
create policy "read own payouts" on public.payouts for select to authenticated using ((user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "admins update payouts" on public.payouts for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "read own clicks" on public.referral_clicks for select to authenticated using ((affiliate_user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

create policy "read own referrals" on public.referrals for select to authenticated using ((affiliate_user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "admins update referrals" on public.referrals for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "content public" on public.site_content for select using true;
create policy "admins manage content" on public.site_content for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "admins read visits" on public.site_visits for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "own roles readable" on public.user_roles for select to authenticated using ((user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 8) Permissions (same defaults as Supabase)
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- 9) Starter data: the six subscription plans
insert into public.plans (name, price, billing_period, features, cta, popular, active, sort_order) values
('Instagram Monthly Plan', 20, 'month', ARRAY['Instagram insight editor'], 'Get Plan', false, true, 1),
('Instagram Lifetime Pro Plan', 40, 'once', ARRAY['Instagram insight editor','Lifetime updates at no extra cost'], 'Get Plan', true, true, 2),
('TikTok Monthly Plan', 20, 'month', ARRAY['TikTok insight editor'], 'Get Plan', false, true, 3),
('TikTok Lifetime Pro Plan', 40, 'once', ARRAY['TikTok insight editor','Lifetime updates at no extra cost'], 'Get Plan', true, true, 4),
('Shopify Monthly Plan', 25, 'month', ARRAY['Shopify dashboard customization','Order notification demos'], 'Get Plan', false, true, 5),
('Shopify Lifetime Pro Plan', 30, 'once', ARRAY['Shopify dashboard customization','Order notification demos','Lifetime updates at no extra cost'], 'Get Plan', true, true, 6);
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
create index if not exists payment_orders_paid_idx on public.payment_orders(paid_at desc) where status='paid';create or replace function public.oxapay_is_ready(_key_hash text)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists(select 1 from public.private_config where key='oxapay_key_hash' and value=lower(_key_hash));
$$;
revoke execute on function public.oxapay_is_ready(text) from public,anon;
grant execute on function public.oxapay_is_ready(text) to authenticated;
-- Lifetime-only website catalog; historical plan seed retained for existing records.
CREATE VIEW public.lifetime_editor_catalog WITH (security_invoker = true) AS
SELECT 'c752255b-bfe6-4de8-8c02-99fe314f0221'::uuid AS id, 'instagram'::text AS product, 'Instagram Editor'::text AS name, 25::numeric AS price, 'once'::text AS billing_period, ARRAY['Lifetime access — no expiry','Product-compatible access key','Instagram APK download','Existing device limits apply']::text[] AS features, 'Get lifetime access'::text AS cta, 1 AS sort_order
UNION ALL
SELECT 'c752255b-bfe6-4de8-8c02-99fe314f0222'::uuid, 'tiktok'::text, 'TikTok Editor'::text, 25::numeric, 'once'::text, ARRAY['Lifetime access — no expiry','Verified TikTok access key','TikTok APK download','Existing device limits apply']::text[], 'Get lifetime access'::text, 2;
GRANT SELECT ON public.lifetime_editor_catalog TO anon, authenticated;
GRANT ALL ON public.lifetime_editor_catalog TO service_role;
COMMENT ON VIEW public.lifetime_editor_catalog IS 'Lifetime-only website catalog; legacy plans and purchase history are retained. Checkout must use the authoritative bot bridge, which owns capacity, payment verification, license issuance and device rules.';
