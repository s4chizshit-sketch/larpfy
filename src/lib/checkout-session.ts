import { supabase } from "@/integrations/supabase/client";

// Refresh before creating an order, never by retrying an invoice request.
export async function checkoutSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  if (data.session.expires_at && data.session.expires_at <= Date.now() / 1000 + 60) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) return null;
    return refreshed.data.session;
  }
  return data.session;
}