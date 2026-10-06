import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, FolderOpen, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { PlatformBadge } from "@/components/site/Sections";
import { EmptyState } from "./AppShell";
import { useProjectActions, useProjects, type Platform } from "@/lib/projects";
import { fmt, type InsightData } from "@/lib/insight";

export function NewProjectButton({ platform }: { platform?: Platform }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [p, setP] = useState<Platform>(platform ?? "instagram");
  const { create } = useProjectActions();
  const navigate = useNavigate();
  const submit = async () => {
    const id = await create.mutateAsync({ name: name.trim() || "Untitled project", platform: p });
    setOpen(false);
    navigate({ to: "/dashboard/editor/$id", params: { id } });
  };
  return (
    <>
      <Button className="bg-brand" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New project</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project name</Label>
              <Input className="mt-2" autoFocus maxLength={80} placeholder="e.g. Client pitch — March" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>
            {!platform && (
              <div>
                <Label>Platform</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["instagram", "tiktok"] as const).map((x) => (
                    <button key={x} onClick={() => setP(x)} className={`rounded-xl border p-3 text-sm capitalize ${p === x ? "border-primary bg-accent" : "border-border"}`}>{x === "tiktok" ? "TikTok" : "Instagram"}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter><Button className="bg-brand" onClick={submit} disabled={create.isPending}>Create & open editor</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProjectGrid({ platform, limit }: { platform?: Platform; limit?: number }) {
  const { data, isLoading, error } = useProjects(platform);
  const { rename, remove, duplicate } = useProjectActions();
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>;
  if (error) return <p className="text-sm text-destructive">Couldn't load projects.</p>;
  const list = limit ? data!.slice(0, limit) : data!;
  if (!list.length)
    return <EmptyState icon={FolderOpen} title="No projects yet" sub="Create your first project to start customizing an insight demo." action={<NewProjectButton platform={platform} />} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const d = p.data as unknown as InsightData;
          return (
            <div key={p.id} className="group relative rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <PlatformBadge p={p.platform} />
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Project actions"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setRenaming({ id: p.id, name: p.name })}><Pencil className="h-4 w-4" /> Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicate.mutate(p)}><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(p.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to="/dashboard/editor/$id" params={{ id: p.id }} className="block">
                <h3 className="mt-4 truncate font-semibold">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Edited {new Date(p.updated_at).toLocaleDateString()}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span><b className="text-foreground">{fmt(d?.views ?? 0)}</b> views</span>
                  <span><b className="text-foreground">{fmt(d?.likes ?? 0)}</b> likes</span>
                </div>
                <span className="mt-4 inline-block text-xs font-medium text-primary">Open →</span>
              </Link>
            </div>
          );
        })}
      </div>
      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename project</DialogTitle></DialogHeader>
          <Input maxLength={80} value={renaming?.name ?? ""} onChange={(e) => setRenaming((r) => r && { ...r, name: e.target.value })} />
          <DialogFooter>
            <Button className="bg-brand" disabled={!renaming?.name.trim()} onClick={() => { rename.mutate({ id: renaming!.id, name: renaming!.name.trim() }); setRenaming(null); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={() => { remove.mutate(deleting!); setDeleting(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
