import { Copy, ExternalLink, MessageCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EDITOR_DETAILS, BOT_PLANS, TELEGRAM_BOT, ownerDraft, shorterAccessMessage, type EditorProduct } from "@/lib/product-details";

export function OwnerContact({ message }: { message: string }) {
  return <div className="flex flex-wrap gap-2">
    <Button asChild variant="outline"><a href={ownerDraft(message)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Contact owner</a></Button>
    <Button variant="ghost" onClick={async () => { try { await navigator.clipboard.writeText(message); toast.success("Message copied"); } catch { toast.error("Could not copy message."); } }}><Copy className="size-4" />Copy message</Button>
  </div>;
}
export function ProductVideo({ product, howTo = false }: { product: EditorProduct; howTo?: boolean }) {
  const details = EDITOR_DETAILS[product];
  return <div className="mt-6 space-y-3">
    <h4 className="font-semibold">{details.name} · {howTo ? "How to use" : "Demo"}</h4>
    <iframe className="aspect-video w-full rounded-lg border border-border" src={details.embed} title={`${details.name} ${howTo ? "how-to guide" : "demo"}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    <a href={details.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline"><ExternalLink className="size-4" />Watch on YouTube</a>
  </div>;
}
export function ShorterPlans({ product }: { product: EditorProduct }) {
  return <section className="mt-7 border-t border-border pt-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">Need shorter access?</h4><span className="text-xs font-medium text-primary">Buy on Telegram</span></div>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Need shorter access? Get daily, weekly or monthly plans from our Telegram bot, or contact the owner.</p>
    <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Telegram bot plans · {EDITOR_DETAILS[product].name}</p>
    <div className="mt-3 divide-y divide-border">{BOT_PLANS.map(p => <div key={p.name} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="text-sm font-semibold">{p.name} <span className="font-normal text-muted-foreground">· {p.days} {p.days === 1 ? "day" : "days"}</span></p><p className="mt-1 text-sm text-muted-foreground">${p.price} · Telegram bot plan</p></div><Button asChild variant="outline" size="sm"><a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${EDITOR_DETAILS[product].name} ${p.name} in Telegram bot`}>Buy in bot<ArrowUpRight className="size-4" /></a></Button></div>)}</div>
    <p className="my-4 text-xs leading-relaxed text-muted-foreground">Choose Instagram or TikTok and purchase in the bot. Bot purchases are not delivered or retrieved by this website.</p>
    <Button asChild className="mb-3"><a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Open Telegram bot</a></Button>
    <p className="mb-2 text-xs text-muted-foreground">Or speak with @TheDanielBrooks</p><OwnerContact message={shorterAccessMessage(product)} />
  </section>;
}
export function EditorProductInfo({ product }: { product: EditorProduct }) {
  return <><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Edited analytics are presentation changes only—not increases in real views, engagement or earnings.</p><ProductVideo product={product} /><ShorterPlans product={product} /></>;
}