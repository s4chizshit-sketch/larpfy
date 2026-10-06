import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { defaultInsight, type InsightData } from "./insight";
import type { Json } from "@/integrations/supabase/types";

export type Platform = "instagram" | "tiktok";

export function useProjects(platform?: Platform) {
  return useQuery({
    queryKey: ["projects", platform ?? "all"],
    queryFn: async () => {
      let q = supabase.from("projects").select("id,name,platform,updated_at,created_at,data").order("updated_at", { ascending: false });
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectActions() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ["projects"] });
  const onError = (e: Error) => toast.error(e.message);

  const create = useMutation({
    mutationFn: async ({ name, platform, data }: { name: string; platform: Platform; data?: InsightData }) => {
      const { data: u } = await supabase.auth.getUser();
      const { data: row, error } = await supabase
        .from("projects")
        .insert({ name, platform, user_id: u.user!.id, data: (data ?? defaultInsight(platform)) as unknown as Json })
        .select("id")
        .single();
      if (error) throw error;
      return row.id;
    },
    onSuccess: done,
    onError,
  });
  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("projects").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { done(); toast.success("Renamed"); },
    onError,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { done(); toast.success("Project deleted"); },
    onError,
  });
  const duplicate = useMutation({
    mutationFn: async (p: { name: string; platform: string; data: Json }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("projects").insert({ name: `${p.name} (copy)`, platform: p.platform, data: p.data, user_id: u.user!.id });
      if (error) throw error;
    },
    onSuccess: () => { done(); toast.success("Project duplicated"); },
    onError,
  });
  return { create, rename, remove, duplicate };
}
