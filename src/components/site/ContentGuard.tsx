import { useEffect } from "react";

/** Best-effort protection: no video download/PiP/right-click. Screenshots are allowed. */
export function ContentGuard() {
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
    };
    document.addEventListener("contextmenu", ctx);
    document.addEventListener("keydown", key);
    return () => {
      mo.disconnect();
      document.removeEventListener("contextmenu", ctx);
      document.removeEventListener("keydown", key);
    };
  }, []);
  return null;
}
