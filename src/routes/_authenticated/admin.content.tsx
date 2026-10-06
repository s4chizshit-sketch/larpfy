import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_HERO, useSiteContent, type FaqItem, type Hero } from "@/lib/content";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentAdmin,
});

function ContentAdmin() {
  const { data } = useSiteContent();
  const qc = useQueryClient();
  const [hero, setHero] = useState<Hero>(DEFAULT_HERO);
  const [ann, setAnn] = useState({ text: "", enabled: false });
  const [faq, setFaq] = useState<FaqItem[]>([]);
  useEffect(() => {
    if (!data) return;
    setHero({ ...DEFAULT_HERO, ...(data.hero ?? {}) });
    setAnn({ text: "", enabled: false, ...(data.announcement ?? {}) });
    setFaq(data.faq ?? []);
  }, [data]);

  const save = async (key: string, value: unknown) => {
    const { error } = await supabase.from("site_content").upsert({ key, value: value as Json, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["site_content"] });
    toast.success("Saved — live on the website");
  };

  return (
    <>
      <PageHeader title="Website Content" sub="Edit the text visitors see on the website." />
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Hero</h2>
          <div className="mt-4 space-y-4">
            <div><Label>Title</Label><Input className="mt-2" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea className="mt-2" value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} /></div>
            <div><Label>Button text</Label><Input className="mt-2 max-w-xs" value={hero.cta} onChange={(e) => setHero({ ...hero, cta: e.target.value })} /></div>
            <Button className="bg-brand" onClick={() => save("hero", hero)}>Save hero</Button>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Announcement bar</h2>
          <div className="mt-4 space-y-4">
            <Input placeholder="e.g. New TikTok editor fields just shipped" value={ann.text} onChange={(e) => setAnn({ ...ann, text: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><Switch checked={ann.enabled} onCheckedChange={(c) => setAnn({ ...ann, enabled: c })} /> Show on website</label>
            <Button className="bg-brand" onClick={() => save("announcement", ann)}>Save announcement</Button>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faq.map((f, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex gap-2">
                  <Input placeholder="Question" value={f.q} onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                  <Button variant="ghost" size="icon" onClick={() => setFaq(faq.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Textarea className="mt-2" placeholder="Answer" value={f.a} onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFaq([...faq, { q: "", a: "" }])}><Plus className="h-4 w-4" /> Add question</Button>
              <Button className="bg-brand" onClick={() => save("faq", faq.filter((f) => f.q.trim()))}>Save FAQ</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
