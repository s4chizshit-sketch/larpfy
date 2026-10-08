create or replace function public.enforce_owner_only_admin()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.role = 'admin' and not exists (
    select 1 from auth.users u where u.id = new.user_id and lower(u.email) = 'workparsnoluse@gmail.com'
  ) then
    raise exception 'Admin role is reserved for the owner account';
  end if;
  return new;
end $$;

drop trigger if exists user_roles_owner_only_admin on public.user_roles;
create trigger user_roles_owner_only_admin
before insert or update on public.user_roles
for each row execute function public.enforce_owner_only_admin();

delete from public.user_roles ur
where ur.role = 'admin'
  and not exists (select 1 from auth.users u where u.id = ur.user_id and lower(u.email) = 'workparsnoluse@gmail.com');