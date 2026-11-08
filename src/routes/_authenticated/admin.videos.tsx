import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Film, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { PlatformBadge } from "@/components/site/Sections";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/videos")({
  head: () => ({ meta: [{ title: "Manage Demo Videos — LARPFY" }, { name: "description", content: "Private LARPFY demo video management." }, { property: "og:title", content: "Manage Demo Videos — LARPFY" }, { property: "og:description", content: "Manage LARPFY recording demonstrations securely." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: VideosAdmin,
});

type Video = { id?: string; title: string; description: string | null; platform: string; video_url: string | null; thumbnail_url: string | null; published: boolean; sort_order: number };

async function upload(file: File, folder: string) {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

function VideosAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("demo_videos").select("*").order("sort_order");
      if (error) throw error;
      return Promise.all(data.map(async (v) => ({ ...v, thumb: await mediaUrl(v.thumbnail_url) })));
    },
  });
  const [edit, setEdit] = useState<Video | null>(null);
  const [files, setFiles] = useState<{ video?: File; thumb?: File }>({});
  const [busy, setBusy] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "videos"] }); qc.invalidateQueries({ queryKey: ["demo_videos"] }); };

  const save = async () => {
    if (!edit?.title.trim()) return toast.error("Title is required");
    setBusy(true);
    try {
      const row: any = { ...edit };
      if (files.video) row.video_url = await upload(files.video, "videos");
      if (files.thumb) row.thumbnail_url = await upload(files.thumb, "thumbnails");
      const { id, ...rest } = row;
      delete (rest as any).thumb; delete (rest as any).created_at;
      const { error } = id ? await supabase.from("demo_videos").update(rest).eq("id", id) : await supabase.from("demo_videos").insert({ ...rest, sort_order: (data?.length ?? 0) + 1 });
      if (error) throw error;
      toast.success("Video saved");
      setEdit(null); setFiles({}); refresh();
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };
  const patch = async (id: string, p: Partial<Video>) => {
    const { error } = await supabase.from("demo_videos").update(p).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const move = async (i: number, dir: -1 | 1) => {
    const list = data!; const j = i + dir;
    if (j < 0 || j >= list.length) return;
    await Promise.all([patch(list[i].id, { sort_order: j }), patch(list[j].id, { sort_order: i })]);
  };
  const del = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("demo_videos").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  return (
    <>
      <PageHeader title="Demo Videos" sub="The first published video is featured in the main player on the homepage." action={<Button className="bg-brand" onClick={() => setEdit({ title: "", description: "", platform: "instagram", video_url: null, thumbnail_url: null, published: true, sort_order: 0 })}><Plus className="h-4 w-4" /> Upload video</Button>} />
      {isLoading ? <Skeleton className="h-64" /> : !data?.length ? (
        <EmptyState icon={Film} title="No demo videos yet" sub="Upload your first product demo to show it on the homepage." />
      ) : (
        <div className="space-y-3">
          {data.map((v, i) => (
            <div key={v.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/60 p-4">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
              </div>
              <div className="h-16 w-28 overflow-hidden rounded-lg bg-muted">{v.thumb && <img src={v.thumb} alt="" className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <PlatformBadge p={v.platform} />
                <p className="mt-1 truncate font-medium">{v.title}</p>
                <p className="text-xs text-muted-foreground">{v.video_url ? "Video uploaded" : "No video file"}</p>
              </div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={v.published} onCheckedChange={(c) => patch(v.id, { published: c })} /> {v.published ? "Published" : "Hidden"}</label>
              <Button variant="outline" size="sm" onClick={() => { setEdit(v); setFiles({}); }}><Pencil className="h-4 w-4" /> Edit</Button>
              <Button variant="ghost" size="icon" onClick={() => del(v.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit video" : "Upload video"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div><Label>Title</Label><Input className="mt-2" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea className="mt-2" value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div>
                <Label>Platform</Label>
                <select className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={edit.platform} onChange={(e) => setEdit({ ...edit, platform: e.target.value })}>
                  <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
                </select>
              </div>
              <div><Label>{edit.video_url ? "Replace video" : "Video file"}</Label><Input type="file" accept="video/*" className="mt-2" onChange={(e) => setFiles({ ...files, video: e.target.files?.[0] })} /></div>
              <div><Label>Thumbnail</Label><Input type="file" accept="image/*" className="mt-2" onChange={(e) => setFiles({ ...files, thumb: e.target.files?.[0] })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={edit.published} onCheckedChange={(c) => setEdit({ ...edit, published: c })} /> Published</label>
            </div>
          )}
          <DialogFooter><Button className="bg-brand" onClick={save} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
