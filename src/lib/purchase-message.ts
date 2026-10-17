/** Keep admin-editable plan names intact, including custom-day and yearly plans. */
export function purchaseTelegramLink(planName: string) {
  return `https://t.me/larpinght?text=${encodeURIComponent(`Hi, I purchased the ${planName.trim()}. My payment is complete. Please send me the APK and my Access API Key.`)}`;
}