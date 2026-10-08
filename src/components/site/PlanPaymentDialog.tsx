import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy, Download, Landmark, LoaderCircle, QrCode, Timer, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import qrAsset from "@/assets/larp-insight-upi-qr-clean.png.asset.json";
import gpayLogo from "@/assets/pay-gpay.png.asset.json";
import phonepeLogo from "@/assets/pay-phonepe.png.asset.json";
import paytmLogo from "@/assets/pay-paytm.png.asset.json";
import bhimLogo from "@/assets/pay-bhim.png.asset.json";
import telegramLogo from "@/assets/telegram-about.png.asset.json";

type SelectedPlan = {
  name: string;
  price: number;
  billingPeriod: string;
};

type PaymentMethod = "upi" | "usd" | null;

const UPI_ID = "millionairskumar@fam";
const PAYMENT_WINDOW_SECONDS = 120;

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
  const [deadline, setDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const peekedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setMethod(null);
      setLoadingQr(false);
      setDeadline(null);
      setSecondsLeft(PAYMENT_WINDOW_SECONDS);
      setShowScrollHint(false);
      peekedRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open || method !== "upi" || !loadingQr) return;
    const timeout = window.setTimeout(() => {
      setLoadingQr(false);
      setDeadline((current) => current ?? Date.now() + PAYMENT_WINDOW_SECONDS * 1000);
    }, 1350);
    return () => window.clearTimeout(timeout);
  }, [open, method, loadingQr]);

  useEffect(() => {
    if (!open || deadline === null) return;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [open, deadline]);

  if (!plan) return null;

  const amount = inrAmount(plan.price);
  const expired = deadline !== null && secondsLeft === 0;
  const countdown = `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`;
  const telegramMessage = `Hello, I purchased the ${plan.name} ($${plan.price}, ${plan.billingPeriod}) and paid ₹${amount.toLocaleString("en-IN")} via UPI. Here is my payment screenshot. Please verify my payment and send me the APK and API access key for my plan. Thank you.`;
  const telegramUrl = `https://t.me/larpinght?text=${encodeURIComponent(telegramMessage)}`;
  const chooseMethod = (nextMethod: Exclude<PaymentMethod, null>) => {
    if (expired || nextMethod === method) return;
    setMethod(nextMethod);
    if (nextMethod !== "upi") return;
    if (deadline === null) setLoadingQr(true);
    else setLoadingQr(false);
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
          <DialogTitle className="payment-title">{expired ? "Send your payment screenshot" : "Choose how to pay"}</DialogTitle>
          <DialogDescription className="payment-plan-line">
            {plan.name} · ${plan.price} {plan.billingPeriod === "once" ? "lifetime" : plan.billingPeriod}
          </DialogDescription>
        </div>

        <div className="payment-body">
          {expired ? (
            <div className="payment-expired" role="status">
              <img src={telegramLogo.url} alt="Telegram" className="payment-telegram-logo" />
              <p className="payment-expired-label">Payment window ended</p>
              <h3>Paid for your plan?</h3>
              <p>Send your payment screenshot to @larpinght on Telegram to request your APK and API access key.</p>
              <p className="payment-verification-note">Access is provided after your payment is verified.</p>
              <Button asChild className="btn-plan mt-5 gap-2">
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer">Send screenshot <ArrowUpRight className="size-4" /></a>
              </Button>
            </div>
          ) : (
          <>
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
                  <div className="payment-amount">
                    <div className="payment-amount-copy"><span>Scan to pay</span><strong>₹{amount.toLocaleString("en-IN")}</strong></div>
                    <Button asChild variant="outline" size="icon" className="payment-download">
                      <a href={qrAsset.url} download="larp-insight-upi-qr.png" aria-label="Download QR code" title="Download QR code">
                        <Download />
                      </a>
                    </Button>
                  </div>
                  <div className="payment-qr-wrap">
                    <div className="payment-qr-shell">
                      <img src={qrAsset.url} alt={`UPI QR code to pay ₹${amount.toLocaleString("en-IN")}`} draggable={false} />
                    </div>
                  </div>
                  <p className="payment-scan-label">Scan Payment · ₹{amount.toLocaleString("en-IN")}</p>
                  <div className="payment-upi-copy">
                    <span><small>UPI ID</small><strong>{UPI_ID}</strong></span>
                    <Button type="button" variant="ghost" size="icon" onClick={copyUpiId} aria-label="Copy UPI ID" title="Copy UPI ID"><Copy /></Button>
                  </div>
                  <div className="payment-apps" role="list" aria-label="Supported UPI apps">
                    <span className="payment-apps-label">Pay with any UPI app</span>
                    <div className="payment-apps-row">
                      <span role="listitem" className="payment-app-chip" title="Google Pay"><img src={gpayLogo.url} alt="Google Pay" draggable={false} /></span>
                      <span role="listitem" className="payment-app-chip" title="PhonePe"><img src={phonepeLogo.url} alt="PhonePe" draggable={false} /></span>
                      <span role="listitem" className="payment-app-chip" title="Paytm"><img src={paytmLogo.url} alt="Paytm" draggable={false} /></span>
                      <span role="listitem" className="payment-app-chip" title="BHIM UPI"><img src={bhimLogo.url} alt="BHIM" draggable={false} /></span>
                    </div>
                  </div>
                  <div className="payment-countdown" role="timer" aria-label={`Payment time remaining ${countdown}`}>
                    <div className="payment-countdown-line"><span><Timer className="size-4" />Time remaining</span><strong>{countdown}</strong></div>
                    <progress value={secondsLeft} max={PAYMENT_WINDOW_SECONDS} aria-label="Payment time remaining" />
                  </div>
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}