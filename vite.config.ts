// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public (publishable) backend connection values. Safe to ship in code.
// Used as a build-time fallback so self-hosted builds (e.g. Vercel) work
// without setting these env vars manually.
const PUBLIC_BACKEND_URL = "https://ypvmiwiqxkvhacoczarf.supabase.co";
const PUBLIC_BACKEND_KEY = "sb_publishable_wbaBgP7XB3dawItywsbGkg_BgyPRShs";

const fallbackDefine: Record<string, string> = {};
if (!process.env.VITE_SUPABASE_URL) {
  fallbackDefine["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(PUBLIC_BACKEND_URL);
}
if (!process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  fallbackDefine["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(PUBLIC_BACKEND_KEY);
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: fallbackDefine,
  },
});
