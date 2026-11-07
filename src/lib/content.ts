import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FaqItem = { q: string; a: string };
export type Hero = { title: string; description: string; cta: string };

export const DEFAULT_HERO: Hero = {
  title: "Your Social Analytics, Your Way",
  description:
    "Powerful tools by LARPIFY to customize, manage, and transform your social media insights.",
  cta: "Get Started",
};

export function useSiteContent() {
  return useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
    staleTime: 60_000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

const urlCache = new Map<string, string>();
/** Media bucket is private; resolve stored paths into short-lived signed URLs. Full URLs pass through. */
export async function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (urlCache.has(path)) return urlCache.get(path)!;
  const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 6);
  if (data?.signedUrl) urlCache.set(path, data.signedUrl);
  return data?.signedUrl ?? null;
}

export function usePublishedVideos() {
  return useQuery({
    queryKey: ["demo_videos", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_videos")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error) throw error;
      return Promise.all(
        (data ?? []).map(async (v) => ({
          ...v,
          video: await mediaUrl(v.video_url),
          thumb: await mediaUrl(v.thumbnail_url),
        })),
      );
    },
  });
}
