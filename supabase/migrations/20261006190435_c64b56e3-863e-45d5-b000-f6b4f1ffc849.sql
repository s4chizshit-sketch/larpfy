revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.on_profile_paid() from public, anon, authenticated;
revoke execute on function public.update_my_name(text) from public, anon;
revoke execute on function public.has_role(uuid, app_role) from anon;