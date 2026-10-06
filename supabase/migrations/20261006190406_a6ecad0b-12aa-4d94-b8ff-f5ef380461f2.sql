create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  billing_period text not null default 'month',
  features text[] not null default '{}',
  cta text not null default 'Get Started',
  popular boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.plans to anon, authenticated;
grant insert, update, delete on public.plans to authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "active plans public" on public.plans for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admins manage plans" on public.plans for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key,
  name text,
  email text,
  status text not null default 'active',
  plan_id uuid references public.plans(id) on delete set null,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "read own or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- users may only change their own name
create or replace function public.update_my_name(_name text)
returns void language sql security definer set search_path = public as $$
  update public.profiles set name = left(_name, 100) where id = auth.uid();
$$;
grant execute on function public.update_my_name(text) to authenticated;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  platform text not null check (platform in ('instagram','tiktok')),
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "own projects" on public.projects for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists(select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active'));

create table public.demo_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  platform text not null default 'instagram',
  video_url text,
  thumbnail_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.demo_videos to anon, authenticated;
grant insert, update, delete on public.demo_videos to authenticated;
grant all on public.demo_videos to service_role;
alter table public.demo_videos enable row level security;
create policy "published videos public" on public.demo_videos for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admins manage videos" on public.demo_videos for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.site_content (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "content public" on public.site_content for select using (true);
create policy "admins manage content" on public.site_content for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.affiliates (
  user_id uuid primary key,
  code text not null unique,
  created_at timestamptz not null default now()
);
grant select, insert on public.affiliates to authenticated;
grant all on public.affiliates to service_role;
alter table public.affiliates enable row level security;
create policy "read own affiliate" on public.affiliates for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "join affiliate" on public.affiliates for insert to authenticated with check (user_id = auth.uid());

create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null,
  created_at timestamptz not null default now()
);
grant select on public.referral_clicks to authenticated;
grant all on public.referral_clicks to service_role;
alter table public.referral_clicks enable row level security;
create policy "read own clicks" on public.referral_clicks for select to authenticated using (affiliate_user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.track_referral_click(_code text)
returns void language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  select user_id into a from public.affiliates where code = _code;
  if a is not null then insert into public.referral_clicks(affiliate_user_id) values (a); end if;
end $$;
grant execute on function public.track_referral_click(text) to anon, authenticated;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null,
  referred_user_id uuid not null unique,
  status text not null default 'signup',
  commission numeric not null default 0,
  commission_status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, update on public.referrals to authenticated;
grant all on public.referrals to service_role;
alter table public.referrals enable row level security;
create policy "read own referrals" on public.referrals for select to authenticated using (affiliate_user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins update referrals" on public.referrals for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric not null check (amount > 0),
  method text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.payouts to authenticated;
grant all on public.payouts to service_role;
alter table public.payouts enable row level security;
create policy "read own payouts" on public.payouts for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "request payout" on public.payouts for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "admins update payouts" on public.payouts for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- new user setup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare a uuid; ref text;
begin
  insert into public.profiles(id, name, email) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
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
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- when admin marks a user as paid, record commission
create or replace function public.on_profile_paid()
returns trigger language plpgsql security definer set search_path = public as $$
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
create trigger on_profile_paid after update on public.profiles for each row execute function public.on_profile_paid();

insert into public.plans(name, price, billing_period, features, cta, popular, sort_order) values
('Starter', 9, 'month', array['Instagram editor','5 saved projects','Standard export'], 'Get Started', false, 1),
('Pro', 19, 'month', array['Instagram + TikTok editors','Unlimited projects','All supported fields','Priority support'], 'Go Pro', true, 2),
('Lifetime', 97, 'once', array['Everything in Pro','One-time payment','Future editor updates'], 'Get Lifetime', false, 3);

insert into public.site_content(key, value) values
('hero', '{"title":"Customize Your Social Insights. Your Way.","description":"Create polished, customizable Instagram and TikTok insight demos for presentations, content, showcases, and entertainment.","cta":"Get Started"}'),
('announcement', '{"text":"","enabled":false}'),
('affiliate', '{"commission_percent":20,"min_payout":50}'),
('faq', '[{"q":"What is LARP Insight?","a":"LARP Insight is a visual customization tool for creating Instagram and TikTok insight demos and mock visuals."},{"q":"Can I customize audience countries?","a":"Yes, supported audience country and percentage fields can be customized inside the editor."},{"q":"Can I customize graphs?","a":"Yes, supported graph values can be customized."},{"q":"Can I customize engagement metrics?","a":"Yes, supported engagement metrics can be customized."},{"q":"Is LARP Insight official Instagram or TikTok software?","a":"No. LARP Insight is an independent customization/demo tool and is not affiliated with Instagram or TikTok."},{"q":"Can I save my projects?","a":"Yes, registered users can save and manage their projects."},{"q":"Does it work on mobile?","a":"Yes. LARP Insight is fully responsive and optimized for mobile, tablet, and desktop."}]');

create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));