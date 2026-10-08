CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read visits" ON public.site_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX site_visits_created_idx ON public.site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_created_idx ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON public.profiles(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(lower(email));
CREATE INDEX IF NOT EXISTS plan_purchases_user_idx ON public.plan_purchases(user_id);
CREATE INDEX IF NOT EXISTS plan_purchases_started_idx ON public.plan_purchases(started_at DESC);
CREATE INDEX IF NOT EXISTS projects_user_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS user_roles_user_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_user_idx ON public.payment_orders(user_id);

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
REVOKE ALL ON FUNCTION public.admin_stats() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;