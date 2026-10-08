import { useEffect, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle, ShieldCheck, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import { createOxapayInvoice } from "@/lib/oxapay.functions";

type SelectedPlan = {
  id?: string;
  name: string;
  price: number;
  billingPeriod: string;
};

export function PlanPaymentDialog({ plan, open, onOpenChange }: {
  plan: SelectedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const createInvoice = useServerFn(createOxapayInvoice);

  useEffect(() => {
    if (!open) setLoading(false);
  }, [open]);

  if (!plan) return null;

  const pay = async () => {
    if (!plan.id) return;
    setLoading(true);
    try {
      const { url } = await createInvoice({ data: { planId: plan.id, origin: window.location.origin } });
      window.location.assign(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="payment-dialog w-[calc(100%-24px)] max-w-md p-0">
        <div className="payment-dialog-head">
          <p className="payment-kicker">Secure payment</p>
          <DialogTitle className="payment-title">Pay with USDT</DialogTitle>
          <DialogDescription className="payment-plan-line">
            {plan.name} · ${plan.price} {plan.billingPeriod === "once" ? "lifetime" : plan.billingPeriod}
          </DialogDescription>
        </div>

        <div className="payment-body">
          <div className="payment-methods" role="group" aria-label="Payment method">
            <Button type="button" variant="outline" aria-pressed className="payment-method is-selected">
              <span className="payment-method-icon"><WalletCards /></span>
              <span><strong>USDT</strong><small>Automatic gateway</small></span>
              <Check className="payment-method-check" />
            </Button>
          </div>

          <div className="payment-soon" role="status">
            <ShieldCheck />
            <div className="flex-1">
              <strong>Pay ${plan.price} in USDT</strong>
              <p>Your plan activates automatically as soon as the payment confirms.</p>
              <Button type="button" className="btn-plan mt-3 gap-2" disabled={loading || !plan.id} onClick={pay}>
                {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                {loading ? "Opening checkout…" : "Pay with USDT"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
