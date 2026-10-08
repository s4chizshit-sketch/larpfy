import { useEffect, useState } from "react";

/** Best-effort protection: no video download/PiP/right-click, black screen when the page loses focus. */
export function ContentGuard() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const lock = (v: HTMLVideoElement) => {
      v.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
      v.disablePictureInPicture = true;
      v.setAttribute("disableRemotePlayback", "");
      v.draggable = false;
    };
    document.querySelectorAll("video").forEach(lock);
    const mo = new MutationObserver(() => document.querySelectorAll("video").forEach(lock));
    mo.observe(document.body, { childList: true, subtree: true });
    const ctx = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("video, img, [data-protected]")) e.preventDefault();
    };
    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "u")) e.preventDefault();
      if (k === "printscreen") { setHidden(true); navigator.clipboard?.writeText("").catch(() => {}); setTimeout(() => setHidden(false), 1500); }
    };
    const vis = () => setHidden(document.hidden);
    const blur = () => setHidden(true);
    const focus = () => setHidden(false);
    document.addEventListener("contextmenu", ctx);
    document.addEventListener("keydown", key);
    document.addEventListener("keyup", key);
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      mo.disconnect();
      document.removeEventListener("contextmenu", ctx);
      document.removeEventListener("keydown", key);
      document.removeEventListener("keyup", key);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
  }, []);
  if (!hidden) return null;
  return <div aria-hidden className="fixed inset-0 z-[9999] bg-background" style={{ background: "#000" }} />;
}
