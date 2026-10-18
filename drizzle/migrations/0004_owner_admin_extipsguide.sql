CREATE OR REPLACE FUNCTION public.enforce_owner_only_admin()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'auth'
AS $function$
begin
  if new.role = 'admin' and not exists (
    select 1 from auth.users u where u.id = new.user_id and lower(u.email) = 'extipsguide@gmail.com'
  ) then
    raise exception 'Admin role is reserved for the owner account';
  end if;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
end $function$;

INSERT INTO public.user_roles(user_id, role)
SELECT u.id, 'admin' FROM auth.users u
WHERE lower(u.email) = 'extipsguide@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');