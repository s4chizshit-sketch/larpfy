create or replace function public.oxapay_is_ready(_key_hash text)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists(select 1 from public.private_config where key='oxapay_key_hash' and value=lower(_key_hash));
$$;
revoke execute on function public.oxapay_is_ready(text) from public,anon;
grant execute on function public.oxapay_is_ready(text) to authenticated;