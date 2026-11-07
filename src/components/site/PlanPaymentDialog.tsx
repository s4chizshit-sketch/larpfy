import { useEffect, useState } from "react";
import { ArrowRight, Clock, LoaderCircle, Lock, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import { createOxapayInvoice } from "@/lib/oxapay.functions";
import { useNavigate } from "@tanstack/react-router";
import { checkoutSession } from "@/lib/checkout-session";

type SelectedPlan = { id?: string; name: string; price: number; billingPeriod: string };

export function PlanPaymentDialog({ plan, open, onOpenChange }: {
  plan: SelectedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const createInvoice = useServerFn(createOxapayInvoice);
  const navigate = useNavigate();

  useEffect(() => { if (!open) setLoading(false); }, [open]);
  if (!plan) return null;

  const period = plan.billingPeriod === "once" ? "Lifetime" : plan.billingPeriod.replace(/^\w/, (c) => c.toUpperCase());

  const pay = async () => {
    if (!plan.id) return;
    setLoading(true);
    try {
      const session = await checkoutSession();
      if (!session) {
        onOpenChange(false);
        await navigate({ to: "/login", search: { redirect: "billing" } });
        toast.info("Please log in to continue your payment.");
        return;
      }
      const { url } = await createInvoice({ data: { planId: plan.id, origin: window.location.origin } });
      window.location.assign(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not start payment";
      if (/unauthorized|invalid token/i.test(message)) {
        onOpenChange(false);
        await navigate({ to: "/login", search: { redirect: "billing" } });
        toast.error("Your login has expired. Please log in again to pay.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="payment-dialog checkout w-[calc(100%-24px)] max-w-md p-0">
        <div className="checkout-head">
          <span className="checkout-secure"><Lock /> Secure checkout</span>
          <DialogTitle className="checkout-title">Complete your order</DialogTitle>
          <DialogDescription className="checkout-sub">Pay with USDT. Your plan activates automatically.</DialogDescription>
        </div>

        <div className="checkout-body">
          <div className="checkout-summary">
            <div className="checkout-row"><span>Plan</span><strong>{plan.name}</strong></div>
            <div className="checkout-row"><span>Billing</span><strong>{period}</strong></div>
            <div className="checkout-row"><span>Network fee</span><strong>Shown at checkout</strong></div>
            <div className="checkout-total"><span>Total due</span><strong>${plan.price}<small>USD</small></strong></div>
          </div>

          <div className="checkout-method">
            <span className="checkout-coin">₮</span>
            <div className="flex-1"><strong>Tether (USDT)</strong><small>TRC20 · ERC20 · BEP20</small></div>
            <span className="checkout-chip">Selected</span>
          </div>

          <Button type="button" className="checkout-pay" disabled={loading || !plan.id} onClick={pay}>
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Lock className="size-4" />}
            {loading ? "Opening secure checkout…" : `Pay $${plan.price} with USDT`}
            {!loading && <ArrowRight className="size-4" />}
          </Button>

          <ul className="checkout-trust">
            <li><Zap /> Instant activation</li>
            <li><ShieldCheck /> Encrypted</li>
            <li><Clock /> 60 min window</li>
          </ul>
          <p className="checkout-foot">After payment, a Telegram button appears on your Billing page to send your screenshot and receive your APK & Access API Key.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
