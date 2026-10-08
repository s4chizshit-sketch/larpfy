import { useEffect, useState } from "react";
import { Check, Copy, Download, Landmark, LoaderCircle, QrCode, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import qrAsset from "@/assets/larp-insight-upi-qr-clean.png.asset.json";
import gpayLogo from "@/assets/pay-gpay.png.asset.json";
import phonepeLogo from "@/assets/pay-phonepe.png.asset.json";
import paytmLogo from "@/assets/pay-paytm.png.asset.json";
import bhimLogo from "@/assets/pay-bhim.png.asset.json";

type SelectedPlan = {
  name: string;
  price: number;
  billingPeriod: string;
};

type PaymentMethod = "upi" | "usd" | null;

const UPI_ID = "millionairskumar@fam";

function inrAmount(price: number) {
  return Math.max(1, Math.round(price * 100) - 1);
}

export function PlanPaymentDialog({ plan, open, onOpenChange }: {
  plan: SelectedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    if (!open) {
      setMethod(null);
      setLoadingQr(false);
    }
  }, [open]);

  if (!plan) return null;

  const amount = inrAmount(plan.price);
  const chooseMethod = (nextMethod: Exclude<PaymentMethod, null>) => {
    setMethod(nextMethod);
    if (nextMethod !== "upi") return;
    setLoadingQr(true);
    window.setTimeout(() => setLoadingQr(false), 1350);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy UPI ID");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="payment-dialog max-h-[92vh] w-[calc(100%-24px)] max-w-md overflow-y-auto p-0">
        <div className="payment-dialog-head">
          <p className="payment-kicker">Secure payment</p>
          <DialogTitle className="payment-title">Choose how to pay</DialogTitle>
          <DialogDescription className="payment-plan-line">
            {plan.name} · ${plan.price} {plan.billingPeriod === "once" ? "lifetime" : plan.billingPeriod}
          </DialogDescription>
        </div>

        <div className="payment-body">
          <div className="payment-methods" role="group" aria-label="Payment method">
            <Button type="button" variant="outline" onClick={() => chooseMethod("upi")} aria-pressed={method === "upi"} className={`payment-method ${method === "upi" ? "is-selected" : ""}`}>
              <span className="payment-method-icon"><QrCode /></span>
              <span><strong>UPI / INR</strong><small>Available now</small></span>
              {method === "upi" && <Check className="payment-method-check" />}
            </Button>
            <Button type="button" variant="outline" onClick={() => chooseMethod("usd")} aria-pressed={method === "usd"} className={`payment-method ${method === "usd" ? "is-selected" : ""}`}>
              <span className="payment-method-icon"><WalletCards /></span>
              <span><strong>USD</strong><small>Card gateway</small></span>
              {method === "usd" && <Check className="payment-method-check" />}
            </Button>
          </div>

          {method === "usd" && (
            <div className="payment-soon" role="status">
              <Landmark />
              <div><strong>USD payment gateway is coming soon.</strong><p>UPI is available now.</p></div>
            </div>
          )}

          {method === "upi" && (
            <div className="payment-upi-stage" aria-live="polite">
              {loadingQr ? (
                <div className="payment-searching" role="status">
                  <span className="payment-search-ring"><LoaderCircle /></span>
                  <strong>Preparing secure payment</strong>
                  <p>Generating your payment details…</p>
                </div>
              ) : (
                <div className="payment-qr-reveal">
                  <div className="payment-amount"><span>Scan to pay</span><strong>₹{amount.toLocaleString("en-IN")}</strong></div>
                  <div className="payment-qr-shell">
                    <img src={qrAsset.url} alt={`UPI QR code to pay ₹${amount.toLocaleString("en-IN")}`} draggable={false} />
                  </div>
                  <p className="payment-scan-label">Scan Payment · ₹{amount.toLocaleString("en-IN")}</p>
                  <div className="payment-upi-copy">
                    <span><small>UPI ID</small><strong>{UPI_ID}</strong></span>
                    <Button type="button" variant="ghost" size="icon" onClick={copyUpiId} aria-label="Copy UPI ID" title="Copy UPI ID"><Copy /></Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}