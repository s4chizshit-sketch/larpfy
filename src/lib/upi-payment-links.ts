export function upiPaymentIntent(packageId: string, amount: number, planName: string) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const supportedPackages = [
    "com.google.android.apps.nbu.paisa.user",
    "com.phonepe.app",
    "net.one97.paytm",
    "in.org.npci.upiapp",
  ];
  if (!supportedPackages.includes(packageId)) return null;
  const params = new URLSearchParams({
    pa: "millionairskumar@fam",
    pn: "Larp Insight",
    am: amount.toFixed(2),
    cu: "INR",
    tn: planName.slice(0, 80),
  });
  const storeUrl = `https://play.google.com/store/apps/details?id=${packageId}`;
  return `intent://pay?${params.toString()}#Intent;scheme=upi;package=${packageId};S.browser_fallback_url=${encodeURIComponent(storeUrl)};end`;
}