import { describe,it,expect } from "vitest";
import { verifiedLifetimePayment } from "@/lib/standalone-payment";
const order={id:"test-order",product:"instagram",track_id:"original-track",amount:25,currency:"USD"};
const paid={order_id:"test-order",track_id:"original-track",amount:25,currency:"USD",status:"paid",txs:[{currency:"USDT"}]};
describe("Independent OxaPay response validation",()=>{
 it("accepts matching paid USD invoice settled in USDT",()=>expect(verifiedLifetimePayment(order,paid)).toBe(true));
 it("rejects a non-website product",()=>expect(verifiedLifetimePayment({...order,product:"shopify"},paid)).toBe(false));
 it("accepts the matching TikTok invoice without swapping its product",()=>expect(verifiedLifetimePayment({...order,product:"tiktok"},paid)).toBe(true));
 for(const [name,patch] of Object.entries({unpaid:{status:"pending"},forged:{status:"manual_accept"},wrongAmount:{amount:24},wrongCurrency:{currency:"INR"},wrongOrder:{order_id:"other"},wrongTrack:{track_id:"other"},wrongAsset:{txs:[{currency:"BTC"}]},missingSettlement:{txs:[]}})) {
  it(`rejects ${name}`,()=>expect(verifiedLifetimePayment(order,{...paid,...patch})).toBe(false));
 }
});