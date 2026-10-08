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
import { upiPaymentIntent } from "@/lib/upi-payment-links";
import { useServerFn } from "@tanstack/react-start";
import { createOxapayInvoice } from "@/lib/oxapay.functions";

type SelectedPlan = {
  id?: string;
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
  const [usdLoading, setUsdLoading] = useState(false);
  const createInvoice = useServerFn(createOxapayInvoice);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMethod(null);
      setLoadingQr(false);
      setDeadline(null);
      setSecondsLeft(PAYMENT_WINDOW_SECONDS);
      setShowScrollHint(false);
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

  // Show a scroll hint chip while the timer / UPI ID sit below the fold.
  useEffect(() => {
    if (!open || method !== "upi" || loadingQr) { setShowScrollHint(false); return; }
    const measure = () => {
      const el = scrollRef.current;
      if (!el) return;
      setShowScrollHint(el.scrollHeight > el.clientHeight + 60 && el.scrollTop + el.clientHeight < el.scrollHeight - 80);
    };
    measure();
    const t = window.setTimeout(measure, 600);
    return () => window.clearTimeout(t);
  }, [open, method, loadingQr, plan]);

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

  const payUsd = async () => {
    if (!plan.id) return;
    setUsdLoading(true);
    try {
      const { url } = await createInvoice({ data: { planId: plan.id, origin: window.location.origin } });
      window.location.assign(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setUsdLoading(false);
    }
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
      <DialogContent ref={scrollRef} className="payment-dialog w-[calc(100%-24px)] max-w-md p-0"
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) setShowScrollHint(false);
        }}>
        <div className="payment-dialog-head">
          <p className="payment-kicker">Secure payment</p>
          <DialogTitle className={`payment-title${expired ? " payment-title-expired" : ""}`}>{expired ? "If you haven't paid on the QR, your time is up. If you already paid and we made a mistake, please message us on Telegram." : "Choose how to pay"}</DialogTitle>
          <DialogDescription className="payment-plan-line">
            {plan.name} · ${plan.price} {plan.billingPeriod === "once" ? "lifetime" : plan.billingPeriod}
          </DialogDescription>
        </div>

        <div className="payment-body">
          {expired ? (
            <div className="payment-expired" role="status">
              <img src={telegramLogo.url} alt="Telegram" className="payment-telegram-logo" />
              <p className="payment-verification-note">Attach your payment screenshot in the chat — access is provided after your payment is verified.</p>
              <Button asChild className="btn-plan mt-4 gap-2">
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
              <span><strong>USD</strong><small>Crypto gateway</small></span>
              {method === "usd" && <Check className="payment-method-check" />}
            </Button>
          </div>

          {method === "usd" && (
            <div className="payment-soon" role="status">
              <Landmark />
              <div className="flex-1">
                <strong>Pay ${plan.price} with crypto via OxaPay</strong>
                <p>Access is activated automatically after payment confirms.</p>
                <Button type="button" className="btn-plan mt-3 gap-2" disabled={usdLoading || !plan.id} onClick={payUsd}>
                  {usdLoading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
                  {usdLoading ? "Opening checkout…" : "Pay with OxaPay"}
                </Button>
              </div>
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
                  {showScrollHint && (
                     <Button type="button" variant="ghost" className="payment-scroll-hint" onClick={() => {
                      setShowScrollHint(false);
                      const el = scrollRef.current;
                      const target = timerRef.current;
                      if (el && target) {
                        const er = el.getBoundingClientRect();
                        const tr = target.getBoundingClientRect();
                        const top = el.scrollTop + (tr.top - er.top) - (el.clientHeight - tr.height) / 2;
                         el.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                      } else {
                        target?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }} aria-label="Scroll to payment timer and UPI ID">
                      <ChevronDown className="size-3.5" />
                      <span>Scroll for timer & UPI ID</span>
                     </Button>
                  )}
                  <div className="payment-upi-copy">
                    <span><small>UPI ID</small><strong>{UPI_ID}</strong></span>
                    <Button type="button" variant="ghost" size="icon" onClick={copyUpiId} aria-label="Copy UPI ID" title="Copy UPI ID"><Copy /></Button>
                  </div>
                  <div className="payment-apps" aria-label="Supported UPI apps">
                    <span className="payment-apps-label">Pay with any UPI app</span>
                    <div className="payment-apps-row">
                      {[
                        { name: "Google Pay", logo: gpayLogo, packageId: "com.google.android.apps.nbu.paisa.user" },
                        { name: "PhonePe", logo: phonepeLogo, packageId: "com.phonepe.app" },
                        { name: "Paytm", logo: paytmLogo, packageId: "net.one97.paytm" },
                        { name: "BHIM", logo: bhimLogo, packageId: "in.org.npci.upiapp" },
                      ].map((app) => (
                        <Button key={app.packageId} asChild variant="ghost" className="payment-app-chip">
                          <a href={`https://play.google.com/store/apps/details?id=${app.packageId}`} target="_blank" rel="noopener noreferrer" aria-label={`Pay ₹${amount.toLocaleString("en-IN")} with ${app.name}`} title={`Pay with ${app.name}`}
                            onClick={(event) => {
                              if (!/Android/i.test(navigator.userAgent)) {
                                toast.info("App payments require an Android phone. You can also scan the QR code.");
                                return;
                              }
                              event.preventDefault();
                              if (deadline === null || Date.now() >= deadline) return;
                              const intent = upiPaymentIntent(app.packageId, amount, plan.name);
                              if (!intent) {
                                toast.error("Payment amount is unavailable. Please choose your plan again.");
                                return;
                              }
                              window.location.assign(intent);
                            }}>
                            <img src={app.logo.url} alt={app.name} draggable={false} />
                          </a>
                        </Button>
                      ))}
                    </div>
                    <p className="payment-verification-note">Confirm the amount in your app and approve with your UPI PIN. Never share your PIN.</p>
                  </div>
                  <div ref={timerRef} className="payment-countdown" role="timer" aria-label={`Payment time remaining ${countdown}`}>
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