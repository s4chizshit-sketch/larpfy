alter table public.profiles add column if not exists total_seconds integer not null default 0;
alter table public.profiles add column if not exists visit_count integer not null default 0;

create or replace function public.handle_new_user()
 returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare a uuid; ref text;
begin
  insert into public.profiles(id, name, email) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if lower(new.email) = 'workparsnoluse@gmail.com' then
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
end $function$;

create or replace function public.add_visit_time(_seconds integer)
 returns void language sql security definer set search_path to 'public'
as $$
  update public.profiles set total_seconds = total_seconds + least(greatest(_seconds,0),120), last_seen_at = now() where id = auth.uid();
$$;
revoke all on function public.add_visit_time(integer) from public, anon;
grant execute on function public.add_visit_time(integer) to authenticated;