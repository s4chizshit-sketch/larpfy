import { describe, expect, it } from "vitest";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("public sitemap", () => {
  it("includes public routes and never descendants of excluded account areas", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
    const instagram = createRoute({ getParentRoute: () => root, path: "instagram", staticData: { sitemap: true } });
    const dashboard = createRoute({ getParentRoute: () => root, path: "dashboard", staticData: { sitemap: "exclude-subtree" } });
    const billing = createRoute({ getParentRoute: () => dashboard, path: "billing", staticData: { sitemap: true } });
    const reset = createRoute({ getParentRoute: () => root, path: "reset-password", staticData: { sitemap: false } });
    const router = createRouter({ routeTree: root.addChildren([home, instagram, dashboard.addChildren([billing]), reset]) });
    expect(sitemapStaticPaths(router)).toEqual(["/", "/instagram"]);
  });
  it("uses the public origin without invented modification timestamps", () => {
    const xml = sitemapXML("https://larpfy.store", [{ path: "/instagram" }, { path: "/tiktok" }]);
    expect(xml).toContain("<loc>https://larpfy.store/instagram</loc>");
    expect(xml).toContain("<loc>https://larpfy.store/tiktok</loc>");
    expect(xml).not.toContain("lastmod");
    expect(() => sitemapXML("https://larpfy.store", [{ path: "//other.example/" }])).toThrow("Invalid sitemap path");
  });
});