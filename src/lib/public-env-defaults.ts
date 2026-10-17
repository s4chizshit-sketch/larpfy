// Fallback public (publishable) backend values for self-hosted deployments
// (e.g. Vercel) where env vars are not set. Safe to ship: these are public keys.
const PUBLIC_BACKEND_URL = "https://kxsqiannkfzsfqpqioly.supabase.co";
const PUBLIC_BACKEND_KEY = "sb_publishable_ByviDC8YrMhLPfLFAtQXKA_8J2mfZHC";

if (typeof process !== "undefined" && process.env) {
  if (!process.env["SUPABASE_URL"]) process.env["SUPABASE_URL"] = PUBLIC_BACKEND_URL;
  if (!process.env["SUPABASE_PUBLISHABLE_KEY"]) process.env["SUPABASE_PUBLISHABLE_KEY"] = PUBLIC_BACKEND_KEY;
}

export {};
