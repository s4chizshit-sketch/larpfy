create table public.plan_purchases (
  id uuid primary key default gen_random_uuid(),
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

grant select on public.plan_purchases to authenticated;
grant all on public.plan_purchases to service_role;

alter table public.plan_purchases enable row level security;

create policy "read own purchases or admin" on public.plan_purchases
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'::app_role));

create index plan_purchases_user_idx on public.plan_purchases(user_id, started_at desc);

create or replace function public.record_plan_purchase()
returns trigger language plpgsql security definer set search_path = public as $$
declare p record; days int;
begin
  if new.plan_id is not null and new.subscription_status = 'active'
     and (old.plan_id is distinct from new.plan_id or old.subscription_status is distinct from 'active') then
    select name, price, billing_period into p from public.plans where id = new.plan_id;
    if found then
      days := case when p.billing_period = 'once' then null else 30 end;
      insert into public.plan_purchases(user_id, plan_id, plan_name, billing_period, price, duration_days, started_at, expires_at)
      values (new.id, new.plan_id, p.name, p.billing_period, p.price, days, now(),
              case when days is null then null else now() + make_interval(days => days) end);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists on_profile_plan_purchase on public.profiles;
create trigger on_profile_plan_purchase
after update on public.profiles
for each row execute function public.record_plan_purchase();

insert into public.plan_purchases(user_id, plan_id, plan_name, billing_period, price, duration_days, started_at, expires_at)
select pr.id, pl.id, pl.name, pl.billing_period, pl.price,
       case when pl.billing_period = 'once' then null else 30 end, now(),
       case when pl.billing_period = 'once' then null else now() + interval '30 days' end
from public.profiles pr join public.plans pl on pl.id = pr.plan_id
where pr.subscription_status = 'active';