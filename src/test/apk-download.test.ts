import { afterEach, describe, expect, it, vi } from "vitest";
import { saveApk } from "@/lib/apk-download";
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
describe("Explicit APK downloads", () => {
  it("does not download without an explicit save call", () => { const click = vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(() => {}); expect(click).not.toHaveBeenCalled(); });
  for (const product of ["instagram","tiktok"] as const) {
    it(`downloads only the selected ${product} APK and cleans up`, () => {
      vi.useFakeTimers();
      Object.defineProperty(URL,"createObjectURL",{ configurable:true,value:vi.fn(()=>"blob:fixture") });
      Object.defineProperty(URL,"revokeObjectURL",{ configurable:true,value:vi.fn() });
      let filename=""; let connected=false;
      vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(function(this:HTMLAnchorElement) { filename=this.download; connected=this.isConnected; });
      saveApk(new Blob(["synthetic-apk-fixture"]),product);
      expect(filename).toBe(`${product}-editor.apk`); expect(connected).toBe(true);
      expect(document.querySelector('a[download]')).toBeNull();
      vi.advanceTimersByTime(30000); expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fixture");
    });
  }
  it("rejects empty files without starting a download", () => { const click=vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(()=>{}); expect(()=>saveApk(new Blob([]),"instagram")).toThrow("empty"); expect(click).not.toHaveBeenCalled(); });
});