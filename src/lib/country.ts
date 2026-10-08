const names = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

/** Flag emoji + readable name for an ISO-2 code; older rows may hold full names. */
export function countryInfo(v: string | null | undefined) {
  if (!v) return { flag: "🌐", name: "Unknown" };
  const code = v.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code)) {
    const flag = String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
    let name = code;
    try { name = names?.of(code) ?? code; } catch {}
    return { flag, name };
  }
  return { flag: "🌐", name: v };
}
