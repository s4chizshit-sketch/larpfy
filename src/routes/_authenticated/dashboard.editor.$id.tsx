import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Plus, Save, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightPreview } from "@/components/InsightPreview";
import { PlatformBadge } from "@/components/site/Sections";
import { supabase } from "@/integrations/supabase/client";
import { defaultInsight, type InsightData } from "@/lib/insight";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/dashboard/editor/$id")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Project Editor — LARPFY" }, { name: "description", content: "Edit your private LARPFY insight project." }, { property: "og:title", content: "Project Editor — LARPFY" }, { property: "og:description", content: "Your private LARPFY project workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [d, setD] = useState<InsightData | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      const platform = project.platform as "instagram" | "tiktok";
      setD({ ...defaultInsight(platform), ...(project.data as object) });
      setName(project.name);
    }
  }, [project]);

  if (isLoading || (project && !d)) return <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[600px]" /><Skeleton className="h-[600px]" /></div>;
  if (error || !project) return <p className="text-muted-foreground">Project not found. <Link to="/dashboard/projects" className="text-primary">Back to projects</Link></p>;
  const platform = project.platform as "instagram" | "tiktok";
  const data = d!;

  const set = <K extends keyof InsightData>(k: K, v: InsightData[K]) => { setD({ ...data, [k]: v }); setDirty(true); };
  const num = (k: keyof InsightData, label: string) => (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="number" min={0} className="mt-1.5" value={data[k] as number} onChange={(e) => set(k, Math.max(0, Number(e.target.value)) as never)} />
    </div>
  );

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("projects").update({ name: name.trim() || "Untitled project", data: data as unknown as Json, updated_at: new Date().toISOString() }).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setDirty(false);
    qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success("Project saved");
  };

  const render = async () => {
    if (!ref.current) return null;
    return toPng(ref.current, { pixelRatio: 3, cacheBust: true });
  };
  const exportPng = async () => {
    const url = await render();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "larp-insight"}.png`;
    a.click();
  };
  const share = async () => {
    const url = await render();
    if (!url) return;
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], `${name || "larp-insight"}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: name }).catch(() => {});
    else { exportPng(); toast("Sharing isn't supported here — image downloaded instead."); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to={platform === "instagram" ? "/dashboard/instagram" : "/dashboard/tiktok"}><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
        <PlatformBadge p={platform} />
        <Input value={name} maxLength={80} onChange={(e) => { setName(e.target.value); setDirty(true); }} className="h-9 max-w-xs font-semibold" />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
          <Button variant="outline" size="sm" onClick={exportPng}><Download className="h-4 w-4" /> Export</Button>
          <Button size="sm" className="bg-brand" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <Tabs defaultValue="engagement">
            <TabsList className="flex w-full flex-wrap">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <TabsContent value="engagement" className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {num("views", "Views")}{num("reach", "Reach")}{num("likes", "Likes")}
              {num("comments", "Comments")}{num("shares", "Shares")}{num("saves", "Saves")}
              {num("profileActivity", "Profile activity")}
            </TabsContent>
            <TabsContent value="audience" className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {num("followers", "Followers")}
                <div>
                  <Label className="text-xs text-muted-foreground">Follower share %</Label>
                  <Input type="number" step="0.1" min={0} max={100} className="mt-1.5" value={data.followerPct} onChange={(e) => set("followerPct", Math.min(100, Math.max(0, Number(e.target.value))))} />
                </div>
              </div>
              <Label className="text-xs text-muted-foreground">Top countries / sources</Label>
              {data.countries.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={c.name} placeholder="Country" onChange={(e) => set("countries", data.countries.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input type="number" step="0.1" min={0} max={100} className="w-24" value={c.pct} onChange={(e) => set("countries", data.countries.map((x, j) => (j === i ? { ...x, pct: Math.min(100, Math.max(0, Number(e.target.value))) } : x)))} />
                  <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => set("countries", data.countries.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {data.countries.length < 6 && (
                <Button variant="secondary" size="sm" onClick={() => set("countries", [...data.countries, { name: "New country", pct: 1 }])}><Plus className="h-4 w-4" /> Add country</Button>
              )}
            </TabsContent>
            <TabsContent value="graph" className="mt-5">
              <p className="mb-3 text-xs text-muted-foreground">Bar heights, oldest to newest.</p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                {data.graph.map((v, i) => (
                  <div key={i}>
                    <Label className="text-xs text-muted-foreground">Day {i + 1}</Label>
                    <Input type="number" min={0} className="mt-1.5" value={v} onChange={(e) => set("graph", data.graph.map((x, j) => (j === i ? Math.max(0, Number(e.target.value)) : x)))} />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="general" className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Username</Label>
                <Input className="mt-1.5" maxLength={40} value={data.username} onChange={(e) => set("username", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date range</Label>
                <Input className="mt-1.5" maxLength={40} value={data.dateRange} onChange={(e) => set("dateRange", e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:sticky lg:top-8 lg:self-start">
          <InsightPreview ref={ref} platform={platform} data={data} />
          <p className="mt-4 text-center text-xs text-muted-foreground">Demo visual — not official platform analytics.</p>
        </div>
      </div>
    </div>
  );
}
