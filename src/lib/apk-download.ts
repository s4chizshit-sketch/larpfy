/** Called only from the buyer's explicit Download APK click, never on page load. */
export function saveApk(blob: Blob, product: "instagram" | "tiktok") {
  if (!blob.size) throw new Error("The APK file is empty. Please try again later.");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${product}-editor.apk`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}