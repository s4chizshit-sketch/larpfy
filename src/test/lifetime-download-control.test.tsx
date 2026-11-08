import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LifetimePurchases } from "@/components/app/LifetimePurchases";
const mocks=vi.hoisted(()=>({save:vi.fn(), purchases:[] as Record<string,unknown>[]}));
vi.mock("@tanstack/react-start",()=>({useServerFn:(fn:unknown)=>fn}));
vi.mock("@/lib/auth",()=>({useAuth:()=>({user:{id:"fixture-owner"}})}));
vi.mock("@/lib/checkout-session",()=>({checkoutSession:async()=>({access_token:"synthetic-session-fixture"})}));
vi.mock("@/lib/lifetime.functions",()=>({listLifetimePurchases:async()=>({purchases:mocks.purchases}),recheckLifetimePurchase:vi.fn(),getLifetimeKey:async()=>({access_key:"SYNTHETIC-NOT-A-REAL-KEY"})}));
vi.mock("@/lib/apk-download",()=>({saveApk:(...args:unknown[])=>mocks.save(...args)}));
vi.mock("@/components/site/EditorProductInfo",()=>({OwnerContact:()=>null,ProductVideo:()=>null}));
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
function mount(status:string,product="instagram") {
 mocks.purchases=[{id:"fixture-order",product,status,payment_verified_at:status==="fulfilled"?"2026-11-08T08:00:00Z":null}];
 render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><LifetimePurchases /></QueryClientProvider>);
}
describe("Buyer download controls (mocked UI, not a real paid delivery)",()=>{
 it("never fetches or downloads the APK on purchase page load",async()=>{
  const request=vi.fn();vi.stubGlobal("fetch",request);mount("fulfilled");
  await screen.findByRole("button",{name:"Download APK"});
  expect(request).not.toHaveBeenCalled();expect(mocks.save).not.toHaveBeenCalled();
 });
 it("pending payment cannot download",async()=>{
  const request=vi.fn();vi.stubGlobal("fetch",request);mount("pending");
  await screen.findByRole("button",{name:"Check payment"});
  expect(screen.queryByRole("button",{name:"Download APK"})).toBeNull();expect(request).not.toHaveBeenCalled();
 });
 it("only the explicit buyer click downloads the matching TikTok APK",async()=>{
  const request=vi.fn().mockResolvedValue(new Response(new Blob(["synthetic-apk-bytes"]),{headers:{"Content-Type":"application/vnd.android.package-archive"}}));vi.stubGlobal("fetch",request);mount("fulfilled","tiktok");
  fireEvent.click(await screen.findByRole("button",{name:"Download APK"}));
  await waitFor(()=>expect(mocks.save).toHaveBeenCalledTimes(1));
  expect(mocks.save.mock.calls[0][1]).toBe("tiktok");expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({purchaseId:"fixture-order"});
 });
 it("a rejected owner download never saves an APK",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response("Denied",{status:403})));mount("fulfilled");
  fireEvent.click(await screen.findByRole("button",{name:"Download APK"}));
  await waitFor(()=>expect(screen.getByRole("button",{name:"Download APK"})).not.toBeDisabled());expect(mocks.save).not.toHaveBeenCalled();
 });
});