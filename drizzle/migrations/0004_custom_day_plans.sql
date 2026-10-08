CREATE OR REPLACE FUNCTION public.record_plan_purchase()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
end $function$;