import { History, Infinity as InfinityIcon } from "lucide-react";
import { usePaidPurchases } from "./ProSubscription";

const DAY = 86400000;

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function PlanHistory() {
  const { data } = usePaidPurchases();

  // Only users who have purchased at least one plan see this section.
  if (!data?.length) return null;

  return (
    <section className="mt-12">
      <h2 className="pro-title mb-6 flex items-center gap-2 text-xl">
        <History className="h-5 w-5 text-primary" /> Plan history
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((p) => {
          const lifetime = !p.expires_at || !p.duration_days;
          const start = new Date(p.started_at).getTime();
          const end = p.expires_at ? new Date(p.expires_at).getTime() : 0;
          const now = Date.now();
          const total = p.duration_days ?? 0;
          const used = Math.min(total, Math.max(0, Math.floor((now - start) / DAY)));
          const left = lifetime ? 0 : Math.max(0, Math.ceil((end - now) / DAY));
          const expired = !lifetime && now >= end;
          const pct = lifetime ? 100 : Math.min(100, Math.round((used / total) * 100));
          return (
            <div key={p.id} className="pro-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.plan_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ${Number(p.price)} · {lifetime ? "one-time" : p.billing_period} · bought {fmtDate(p.started_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                    expired ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                  }`}
                >
                  {expired ? "Expired" : "Active"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Plan length</p>
                  <p className="pro-title mt-1 text-xl">{lifetime ? "Lifetime" : `${total} days`}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Days left</p>
                  <p className="pro-title mt-1 flex items-center gap-1 text-xl">
                    {lifetime ? <InfinityIcon className="h-5 w-5" /> : left}
                    {lifetime && <span className="text-sm font-normal text-muted-foreground">No expiry</span>}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {lifetime
                  ? "Your lifetime access never expires."
                  : expired
                    ? `Ended on ${fmtDate(p.expires_at ?? p.started_at)}`
                    : `${used} of ${total} days used · ends on ${fmtDate(p.expires_at ?? p.started_at)}`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
