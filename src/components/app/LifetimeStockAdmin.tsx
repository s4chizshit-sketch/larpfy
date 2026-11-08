import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function LifetimeStockAdmin() {
  const [product,setProduct]=useState<"instagram"|"tiktok">("instagram");
  const [keys,setKeys]=useState("");
  const [busy,setBusy]=useState(false);
  const save=async()=>{setBusy(true);try {
    const values=keys.split(/\s+/).filter(Boolean);
    const {data,error}=await supabase.rpc("import_lifetime_stock",{_product:product,_keys:values});
    if(error) throw error;
    setKeys("");toast.success(`${data} keys saved privately`);
  }catch{toast.error("Could not save keys. Check product and key format.");}finally{setBusy(false);}};
  const upload=async(file:File)=>{setBusy(true);try {
    if(!file.name.endsWith(".apk")||file.size>5242880) throw new Error();
    const {error}=await supabase.storage.from("lifetime-apks").upload(`${product}.apk`,file,{contentType:"application/vnd.android.package-archive",upsert:false});
    if(error) throw error;
    toast.success(`${product} APK saved privately`);
  }catch{toast.error("Could not upload APK. Check the selected product.");}finally{setBusy(false);}};
  return <section className="my-8 space-y-4"><h2 className="text-xl font-semibold">Private fulfillment stock</h2>
    <div className="flex gap-2"><Button variant={product==="instagram"?"default":"outline"} onClick={()=>setProduct("instagram")}>Instagram</Button><Button variant={product==="tiktok"?"default":"outline"} onClick={()=>setProduct("tiktok")}>TikTok</Button></div>
    <Textarea aria-label="Private product keys" autoComplete="off" value={keys} onChange={e=>setKeys(e.target.value)} placeholder="One existing product key per line" />
    <Button disabled={busy||!keys.trim()} onClick={save}>Save private keys</Button>
    <div><label className="text-sm font-medium" htmlFor="private-apk">Matching APK</label><input id="private-apk" aria-label="Upload matching APK" type="file" accept=".apk" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);}} className="mt-2 block w-full text-sm" /></div>
  </section>;
}