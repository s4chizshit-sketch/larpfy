export function isModuleLoadFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed/i.test(message);
}

export function recoverModuleLoad(error: unknown, storage: Pick<Storage, "getItem" | "setItem">, reload: () => void, now = Date.now()) {
  if (!isModuleLoadFailure(error)) return false;
  try {
    const previous = Number(storage.getItem("larpfy:module-recovery") ?? 0);
    if (previous > 0 && now - previous < 60000) return false;
    storage.setItem("larpfy:module-recovery", String(now));
    reload();
    return true;
  } catch { return false; }
}